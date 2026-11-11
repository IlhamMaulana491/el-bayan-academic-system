import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { getDb, saveDb, hashPassword, verifyPassword, type UserWithHash } from './src/server/db.ts';
import type { UserAccount, UserRole } from './src/types.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Support large payloads for base64 file/logo/banner uploads
app.use(express.json({ limit: '15mb' }));

// In-memory active session tokens -> userId
const sessions = new Map<string, string>();

function sanitizeUser(u: UserWithHash): UserAccount {
  const { passwordHash, salt, ...safe } = u;
  return safe;
}

interface AuthRequest extends Request {
  user?: UserAccount;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesi tidak valid. Silakan login kembali.' });
    return;
  }
  const token = authHeader.slice(7);
  const userId = sessions.get(token);
  const db = getDb();

  // Also support deterministic demo tokens so page reloads & server restarts stay logged in smoothly
  let user = db.users.find((u) => u.id === userId);
  if (!user && token.startsWith('elbayan-token-')) {
    const rawPart = token.replace('elbayan-token-', '');
    const parts = rawPart.split('-');
    const candidateId = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : parts[0];
    user = db.users.find(
      (u) => u.id === candidateId || u.id === `usr-${parts[0]}` || u.id === parts[0]
    );
  }

  if (!user) {
    res.status(401).json({ error: 'Sesi telah berakhir. Silakan login kembali.' });
    return;
  }
  req.user = sanitizeUser(user);
  next();
}

function requireRole(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki izin untuk aksi ini.' });
      return;
    }
    next();
  };
}

// ============================================================================
// PUBLIC & AUTH ROUTES
// ============================================================================

app.get('/api/public/overview', (_req, res) => {
  const db = getDb();
  res.json({
    settings: db.settings,
    stats: {
      studentCount: db.students.length,
      teacherCount: db.teachers.length,
      subjectCount: db.subjects.length,
      classCount: db.classes.length,
    },
    majors: db.majors,
    subjects: db.subjects.slice(0, 12),
    announcements: db.announcements.slice(0, 4),
    schedules: db.schedules.slice(0, 6),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    res.status(400).json({ error: 'Harap masukkan Email/Username/NIP/NISN dan Password.' });
    return;
  }
  const db = getDb();
  const cleanId = String(identifier).trim().toLowerCase();
  const user = db.users.find(
    (u) =>
      u.username.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId ||
      u.nipOrNisn.toLowerCase() === cleanId
  );

  if (!user) {
    res.status(401).json({ error: 'Akun tidak ditemukan. Periksa kembali Username/Email/NIP/NISN Anda.' });
    return;
  }

  if (user.status !== 'Aktif') {
    res.status(403).json({ error: 'Akun Anda sedang dinonaktifkan oleh Administrator.' });
    return;
  }

  const valid = verifyPassword(String(password), user.passwordHash, user.salt);
  if (!valid) {
    res.status(401).json({ error: 'Password yang Anda masukkan salah.' });
    return;
  }

  const token = `elbayan-token-${user.id}-${crypto.randomBytes(8).toString('hex')}`;
  sessions.set(token, user.id);

  res.json({
    token,
    user: sanitizeUser(user),
    settings: db.settings,
  });
});

app.post('/api/auth/quick-login', (req, res) => {
  const { role } = req.body as { role: UserRole };
  const db = getDb();
  const user = db.users.find((u) => u.role === role);
  if (!user) {
    res.status(404).json({ error: 'Akun demo untuk role tersebut tidak ditemukan.' });
    return;
  }
  const token = `elbayan-token-${user.id}-${crypto.randomBytes(8).toString('hex')}`;
  sessions.set(token, user.id);

  res.json({
    token,
    user: sanitizeUser(user),
    settings: db.settings,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  res.json({
    user: req.user,
    settings: db.settings,
  });
});

app.put('/api/auth/profile', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === req.user!.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    return;
  }
  const { name, email, phone, nipOrNisn, subjectSpecialty, avatarUrl, newPassword } = req.body;
  if (name) db.users[idx].name = String(name).trim();
  if (email) db.users[idx].email = String(email).trim();
  if (phone !== undefined) db.users[idx].phone = String(phone).trim();
  if (nipOrNisn) db.users[idx].nipOrNisn = String(nipOrNisn).trim();
  if (subjectSpecialty !== undefined) db.users[idx].subjectSpecialty = String(subjectSpecialty).trim();
  if (avatarUrl !== undefined) db.users[idx].avatarUrl = avatarUrl;

  if (newPassword && String(newPassword).trim().length >= 6) {
    const pw = hashPassword(String(newPassword).trim());
    db.users[idx].passwordHash = pw.hash;
    db.users[idx].salt = pw.salt;
  }

  if (db.users[idx].role === 'kepsek') {
    if (name) db.settings.headmasterName = db.users[idx].name;
    if (nipOrNisn) db.settings.headmasterNip = db.users[idx].nipOrNisn;
  }

  saveDb(db);
  res.json({ user: sanitizeUser(db.users[idx]), settings: db.settings });
});

// ============================================================================
// DASHBOARD & FULL DATA SNAPSHOT
// ============================================================================

app.get('/api/dashboard', requireAuth, (_req: AuthRequest, res) => {
  const db = getDb();

  // Compute dynamic attendance percentage
  let totalEntries = 0;
  let hadirCount = 0;
  db.attendance.forEach((rec) => {
    rec.entries.forEach((e) => {
      totalEntries++;
      if (e.status === 'Hadir') hadirCount++;
    });
  });
  const averageAttendance = totalEntries > 0 ? Math.round((hadirCount / totalEntries) * 1000) / 10 : 94.5;

  // Compute dynamic average academic score
  const avgGrade =
    db.grades.length > 0
      ? Math.round((db.grades.reduce((acc, g) => acc + g.finalScore, 0) / db.grades.length) * 10) / 10
      : 90.8;

  res.json({
    stats: {
      studentCount: db.students.length,
      teacherCount: db.teachers.length,
      subjectCount: db.subjects.length,
      classCount: db.classes.length,
      materialCount: db.materials.length,
      assignmentCount: db.assignments.length,
      examCount: db.exams.length,
      averageAttendance,
      averageGrade: avgGrade,
    },
    activityChart: db.activityChart,
    todaySchedules: db.schedules.filter((s) => s.day === 'Senin').slice(0, 6),
    announcements: db.announcements,
    notifications: db.notifications,
    settings: db.settings,
  });
});

app.get('/api/state/all', requireAuth, (_req: AuthRequest, res) => {
  const db = getDb();
  res.json({
    settings: db.settings,
    users: db.users.map(sanitizeUser),
    academicYears: db.academicYears,
    majors: db.majors,
    classes: db.classes,
    subjects: db.subjects,
    teachers: db.teachers,
    students: db.students,
    materials: db.materials,
    assignments: db.assignments,
    exams: db.exams,
    attendance: db.attendance,
    grades: db.grades,
    schedules: db.schedules,
    forums: db.forums,
    announcements: db.announcements,
    notifications: db.notifications,
    activityChart: db.activityChart,
  });
});

// Standard entity GET routes
app.get('/api/settings', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.settings);
});

app.get('/api/materials', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.materials);
});

app.get('/api/assignments', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.assignments);
});

app.get('/api/exams', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.exams);
});

app.get('/api/attendance', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.attendance);
});

app.get('/api/grades', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.grades);
});

app.get('/api/schedules', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.schedules);
});

app.get('/api/forums', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.forums);
});

app.get('/api/announcements', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.announcements);
});

app.get('/api/notifications', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.notifications);
});

app.get('/api/master/students', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.students);
});

app.get('/api/master/teachers', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.teachers);
});

app.get('/api/master/classes', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.classes);
});

app.get('/api/master/majors', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.majors);
});

app.get('/api/master/subjects', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.subjects);
});

app.get('/api/master/users', requireAuth, requireRole(['admin', 'kepsek']), (_req, res) => {
  const db = getDb();
  res.json(db.users.map(sanitizeUser));
});

app.get('/api/master/academic-years', requireAuth, (_req, res) => {
  const db = getDb();
  res.json(db.academicYears);
});

// ============================================================================
// DATA MASTER ROUTES (Admin & Authorized Roles)
// ============================================================================

// 1. Students CRUD
app.post('/api/master/students', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { nisn, nis, name, gender, className, major, email, parentName, status } = req.body;
  if (!nisn || !name || !className) {
    res.status(400).json({ error: 'NISN, Nama Siswa, dan Kelas wajib diisi.' });
    return;
  }
  const newStudent = {
    id: `std-${Date.now()}`,
    nisn: String(nisn).trim(),
    nis: String(nis || `2526${Math.floor(10000 + Math.random() * 89999)}`).trim(),
    name: String(name).trim(),
    gender: (gender === 'P' ? 'P' : 'L') as 'L' | 'P',
    className: String(className).trim(),
    major: String(major || 'MIPA / Sains').trim(),
    email: String(email || `${String(name).toLowerCase().replace(/\s+/g, '.')}@maelbayan.sch.id`).trim(),
    parentName: String(parentName || '-').trim(),
    status: (status || 'Aktif') as 'Aktif' | 'Lulus' | 'Pindah',
  };
  db.students.unshift(newStudent);
  saveDb(db);
  res.json(newStudent);
});

app.put('/api/master/students/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Data siswa tidak ditemukan.' });
    return;
  }
  db.students[idx] = { ...db.students[idx], ...req.body };
  saveDb(db);
  res.json(db.students[idx]);
});

app.delete('/api/master/students/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.students = db.students.filter((s) => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 2. Teachers CRUD
app.post('/api/master/teachers', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { nip, name, email, phone, subject, education, status } = req.body;
  if (!nip || !name || !subject) {
    res.status(400).json({ error: 'NIP, Nama Guru, dan Mata Pelajaran wajib diisi.' });
    return;
  }
  const newTeacher = {
    id: `tchr-${Date.now()}`,
    nip: String(nip).trim(),
    name: String(name).trim(),
    email: String(email || 'guru@maelbayan.sch.id').trim(),
    phone: String(phone || '08120000000').trim(),
    subject: String(subject).trim(),
    education: String(education || 'S1 Pendidikan').trim(),
    status: (status || 'GTY') as 'PNS' | 'GTY' | 'Honorer',
    active: true,
  };
  db.teachers.unshift(newTeacher);
  saveDb(db);
  res.json(newTeacher);
});

app.put('/api/master/teachers/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.teachers.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Data guru tidak ditemukan.' });
    return;
  }
  db.teachers[idx] = { ...db.teachers[idx], ...req.body };
  saveDb(db);
  res.json(db.teachers[idx]);
});

app.delete('/api/master/teachers/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.teachers = db.teachers.filter((t) => t.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 3. Classes CRUD
app.post('/api/master/classes', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { name, level, majorCode, homeroomTeacher, roomNumber, capacity } = req.body;
  if (!name || !homeroomTeacher) {
    res.status(400).json({ error: 'Nama Kelas dan Wali Kelas wajib diisi.' });
    return;
  }
  const newClass = {
    id: `cls-${Date.now()}`,
    name: String(name).trim(),
    level: (level || 'X') as 'X' | 'XI' | 'XII',
    majorCode: String(majorCode || 'MIPA').trim(),
    homeroomTeacher: String(homeroomTeacher).trim(),
    roomNumber: String(roomNumber || 'Gedung A').trim(),
    capacity: Number(capacity) || 32,
    studentCount: 0,
  };
  db.classes.push(newClass);
  saveDb(db);
  res.json(newClass);
});

app.put('/api/master/classes/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.classes.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Data kelas tidak ditemukan.' });
    return;
  }
  db.classes[idx] = { ...db.classes[idx], ...req.body };
  saveDb(db);
  res.json(db.classes[idx]);
});

app.delete('/api/master/classes/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.classes = db.classes.filter((c) => c.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 4. Majors CRUD
app.post('/api/master/majors', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { code, name, headOfMajor, description } = req.body;
  if (!code || !name) {
    res.status(400).json({ error: 'Kode dan Nama Jurusan wajib diisi.' });
    return;
  }
  const newMajor = {
    id: `mjr-${Date.now()}`,
    code: String(code).trim(),
    name: String(name).trim(),
    headOfMajor: String(headOfMajor || '-').trim(),
    description: String(description || '').trim(),
    studentCount: 0,
  };
  db.majors.push(newMajor);
  saveDb(db);
  res.json(newMajor);
});

app.put('/api/master/majors/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.majors.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Jurusan tidak ditemukan.' });
    return;
  }
  db.majors[idx] = { ...db.majors[idx], ...req.body };
  saveDb(db);
  res.json(db.majors[idx]);
});

app.delete('/api/master/majors/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.majors = db.majors.filter((m) => m.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 5. Subjects CRUD
app.post('/api/master/subjects', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { code, name, category, gradeLevels, teacherName, hoursPerWeek, kkm } = req.body;
  if (!code || !name) {
    res.status(400).json({ error: 'Kode dan Nama Mata Pelajaran wajib diisi.' });
    return;
  }
  const newSub = {
    id: `sub-${Date.now()}`,
    code: String(code).trim(),
    name: String(name).trim(),
    category: category || 'PAI & Bahasa Arab',
    gradeLevels: String(gradeLevels || 'X, XI, XII').trim(),
    teacherName: String(teacherName || '-').trim(),
    hoursPerWeek: Number(hoursPerWeek) || 4,
    kkm: Number(kkm) || 75,
  };
  db.subjects.unshift(newSub);
  saveDb(db);
  res.json(newSub);
});

app.put('/api/master/subjects/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.subjects.findIndex((s) => s.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Mata pelajaran tidak ditemukan.' });
    return;
  }
  db.subjects[idx] = { ...db.subjects[idx], ...req.body };
  saveDb(db);
  res.json(db.subjects[idx]);
});

app.delete('/api/master/subjects/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.subjects = db.subjects.filter((s) => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 6. User Accounts CRUD
app.post('/api/master/users', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { name, username, email, role, nipOrNisn, className, subjectSpecialty, password } = req.body;
  if (!name || !username || !role) {
    res.status(400).json({ error: 'Nama, Username, dan Role wajib diisi.' });
    return;
  }
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    kepsek: 'Kepala Madrasah',
    guru: 'Guru',
    siswa: 'Siswa',
  };
  const pw = hashPassword(String(password || 'password123'));
  const newUser: UserWithHash = {
    id: `usr-${Date.now()}`,
    name: String(name).trim(),
    username: String(username).trim(),
    email: String(email || `${username}@maelbayan.sch.id`).trim(),
    role: role as UserRole,
    roleLabel: roleMap[role as UserRole] || 'Siswa',
    nipOrNisn: String(nipOrNisn || '-').trim(),
    className: className ? String(className).trim() : undefined,
    subjectSpecialty: subjectSpecialty ? String(subjectSpecialty).trim() : undefined,
    status: 'Aktif',
    createdAt: new Date().toISOString().slice(0, 10),
    passwordHash: pw.hash,
    salt: pw.salt,
  };
  db.users.push(newUser);
  saveDb(db);
  res.json(sanitizeUser(newUser));
});

app.put('/api/master/users/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const idx = db.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Akun pengguna tidak ditemukan.' });
    return;
  }
  const { name, username, email, role, nipOrNisn, className, subjectSpecialty, password, status } = req.body;
  const roleMap: Record<UserRole, string> = {
    admin: 'Admin',
    kepsek: 'Kepala Madrasah',
    guru: 'Guru',
    siswa: 'Siswa',
  };
  if (name) db.users[idx].name = String(name).trim();
  if (username) db.users[idx].username = String(username).trim();
  if (email) db.users[idx].email = String(email).trim();
  if (role) {
    db.users[idx].role = role as UserRole;
    db.users[idx].roleLabel = roleMap[role as UserRole] || 'Siswa';
  }
  if (nipOrNisn !== undefined) db.users[idx].nipOrNisn = String(nipOrNisn).trim();
  if (className !== undefined) db.users[idx].className = className ? String(className).trim() : undefined;
  if (subjectSpecialty !== undefined) {
    db.users[idx].subjectSpecialty = subjectSpecialty ? String(subjectSpecialty).trim() : undefined;
  }
  if (status) db.users[idx].status = status;
  if (password && String(password).trim().length >= 4) {
    const pw = hashPassword(String(password).trim());
    db.users[idx].passwordHash = pw.hash;
    db.users[idx].salt = pw.salt;
  }
  if (db.users[idx].role === 'kepsek') {
    db.settings.headmasterName = db.users[idx].name;
    db.settings.headmasterNip = db.users[idx].nipOrNisn;
  }
  saveDb(db);
  res.json(sanitizeUser(db.users[idx]));
});

app.delete('/api/master/users/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.users = db.users.filter((u) => u.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// 7. Academic Years CRUD
app.post('/api/master/academic-years', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { year, semester, startDate, endDate, isActive } = req.body;
  if (!year || !semester) {
    res.status(400).json({ error: 'Tahun Ajaran dan Semester wajib diisi.' });
    return;
  }
  if (isActive) {
    db.academicYears.forEach((ay) => (ay.isActive = false));
    db.settings.activeAcademicYear = year;
    db.settings.activeSemester = semester;
  }
  const newAy = {
    id: `ay-${Date.now()}`,
    year: String(year).trim(),
    semester: (semester === 'Genap' ? 'Genap' : 'Ganjil') as 'Ganjil' | 'Genap',
    isActive: Boolean(isActive),
    startDate: String(startDate || '2025-07-14'),
    endDate: String(endDate || '2025-12-20'),
  };
  db.academicYears.unshift(newAy);
  saveDb(db);
  res.json(newAy);
});

app.put('/api/master/academic-years/:id/activate', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.academicYears.forEach((ay) => {
    ay.isActive = ay.id === req.params.id;
    if (ay.isActive) {
      db.settings.activeAcademicYear = ay.year;
      db.settings.activeSemester = ay.semester;
    }
  });
  saveDb(db);
  res.json({ academicYears: db.academicYears, settings: db.settings });
});

// ============================================================================
// LEARNING MATERIALS ROUTES
// ============================================================================

app.post('/api/materials', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req: AuthRequest, res) => {
  const db = getDb();
  const { title, subjectName, className, category, description, contentSummary, fileName, fileSize, fileDataUrl } = req.body;
  if (!title || !subjectName || !className) {
    res.status(400).json({ error: 'Judul Materi, Mata Pelajaran, dan Kelas wajib diisi.' });
    return;
  }
  const newMat = {
    id: `mat-${Date.now()}`,
    title: String(title).trim(),
    subjectName: String(subjectName).trim(),
    className: String(className).trim(),
    teacherName: req.user!.name,
    category: category || 'Modul PDF',
    description: String(description || '').trim(),
    contentSummary: String(contentSummary || '').trim(),
    fileName: String(fileName || 'Modul_Pembelajaran_MA_ElBayan.pdf').trim(),
    fileSize: String(fileSize || '1.5 MB'),
    fileDataUrl: fileDataUrl || undefined,
    downloads: 0,
    views: 1,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  db.materials.unshift(newMat);
  saveDb(db);
  res.json(newMat);
});

app.post('/api/materials/:id/download', requireAuth, (req, res) => {
  const db = getDb();
  const mat = db.materials.find((m) => m.id === req.params.id);
  if (!mat) {
    res.status(404).json({ error: 'Materi tidak ditemukan.' });
    return;
  }
  mat.downloads += 1;
  mat.views += 1;
  if (db.activityChart['7d'].length > 0) {
    db.activityChart['7d'][db.activityChart['7d'].length - 1].aksesMateri += 1;
  }
  saveDb(db);
  res.json(mat);
});

app.delete('/api/materials/:id', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  db.materials = db.materials.filter((m) => m.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ============================================================================
// ASSIGNMENTS & SUBMISSIONS ROUTES
// ============================================================================

app.post('/api/assignments', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req: AuthRequest, res) => {
  const db = getDb();
  const { title, subjectName, className, dueDate, description, maxScore, attachmentName } = req.body;
  if (!title || !subjectName || !className || !dueDate) {
    res.status(400).json({ error: 'Judul Tugas, Mata Pelajaran, Kelas, dan Tenggat wajib diisi.' });
    return;
  }
  const newAsg = {
    id: `asg-${Date.now()}`,
    title: String(title).trim(),
    subjectName: String(subjectName).trim(),
    className: String(className).trim(),
    teacherName: req.user!.name,
    dueDate: String(dueDate),
    description: String(description || '').trim(),
    maxScore: Number(maxScore) || 100,
    attachmentName: attachmentName ? String(attachmentName) : undefined,
    createdAt: new Date().toISOString().slice(0, 10),
    submissions: [],
  };
  db.assignments.unshift(newAsg);
  saveDb(db);
  res.json(newAsg);
});

app.post('/api/assignments/:id/submit', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const asg = db.assignments.find((a) => a.id === req.params.id);
  if (!asg) {
    res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    return;
  }
  const { answerText, fileName, fileDataUrl } = req.body;
  if (!answerText && !fileName) {
    res.status(400).json({ error: 'Harap isi jawaban atau unggah file tugas.' });
    return;
  }

  const existingIdx = asg.submissions.findIndex((s) => s.studentName === req.user!.name);
  const submission = {
    id: existingIdx >= 0 ? asg.submissions[existingIdx].id : `subm-${Date.now()}`,
    assignmentId: asg.id,
    studentId: req.user!.id,
    studentName: req.user!.name,
    studentNisn: req.user!.nipOrNisn || '0084921034',
    className: req.user!.className || asg.className,
    submittedAt: new Date().toLocaleString('id-ID') + ' WIB',
    answerText: String(answerText || '').trim(),
    fileName: String(fileName || 'Tugas_Siswa.pdf'),
    fileDataUrl: fileDataUrl || undefined,
    score: null,
    feedback: '',
    status: 'Terkumpul' as const,
  };

  if (existingIdx >= 0) {
    asg.submissions[existingIdx] = submission;
  } else {
    asg.submissions.push(submission);
  }

  if (db.activityChart['7d'].length > 0) {
    db.activityChart['7d'][db.activityChart['7d'].length - 1].pengumpulanTugas += 1;
  }

  saveDb(db);
  res.json(asg);
});

app.post('/api/assignments/:id/grade', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  const asg = db.assignments.find((a) => a.id === req.params.id);
  if (!asg) {
    res.status(404).json({ error: 'Tugas tidak ditemukan.' });
    return;
  }
  const { submissionId, score, feedback } = req.body;
  const sub = asg.submissions.find((s) => s.id === submissionId);
  if (!sub) {
    res.status(404).json({ error: 'Data pengumpulan siswa tidak ditemukan.' });
    return;
  }
  sub.score = Number(score);
  sub.feedback = String(feedback || 'Sudah diperiksa oleh Guru.');
  sub.status = 'Dinilai';
  saveDb(db);
  res.json(asg);
});

app.delete('/api/assignments/:id', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  db.assignments = db.assignments.filter((a) => a.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ============================================================================
// ONLINE EXAMS (CBT) ROUTES
// ============================================================================

app.post('/api/exams', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req: AuthRequest, res) => {
  const db = getDb();
  const { title, subjectName, className, examType, durationMinutes, date, startTime, passingScore, questions } = req.body;
  if (!title || !subjectName || !className) {
    res.status(400).json({ error: 'Judul Ujian, Mata Pelajaran, dan Kelas wajib diisi.' });
    return;
  }
  const newExam = {
    id: `exm-${Date.now()}`,
    title: String(title).trim(),
    subjectName: String(subjectName).trim(),
    className: String(className).trim(),
    teacherName: req.user!.name,
    examType: examType || 'Ulangan Harian',
    durationMinutes: Number(durationMinutes) || 60,
    date: String(date || new Date().toISOString().slice(0, 10)),
    startTime: String(startTime || '08:00 WIB'),
    passingScore: Number(passingScore) || 75,
    status: 'Aktif' as const,
    questions: Array.isArray(questions) ? questions : [],
    attempts: [],
  };
  db.exams.unshift(newExam);
  saveDb(db);
  res.json(newExam);
});

app.post('/api/exams/:id/questions', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    res.status(404).json({ error: 'Ujian tidak ditemukan.' });
    return;
  }
  const { type, questionText, arabicText, options, correctOption, points } = req.body;
  const newQ = {
    id: `q-${Date.now()}`,
    type: (type === 'essay' ? 'essay' : 'pg') as 'pg' | 'essay',
    questionText: String(questionText).trim(),
    arabicText: arabicText ? String(arabicText).trim() : undefined,
    options: type === 'pg' ? options : undefined,
    correctOption: type === 'pg' ? correctOption : undefined,
    points: Number(points) || 20,
  };
  exam.questions.push(newQ);
  saveDb(db);
  res.json(exam);
});

app.post('/api/exams/:id/submit', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const exam = db.exams.find((e) => e.id === req.params.id);
  if (!exam) {
    res.status(404).json({ error: 'Ujian tidak ditemukan.' });
    return;
  }
  const { answers } = req.body as { answers: Record<string, string> };
  let pgScore = 0;
  let essayScore = 0;
  let hasEssay = false;

  exam.questions.forEach((q) => {
    const ans = answers?.[q.id];
    if (q.type === 'pg') {
      if (ans && ans === q.correctOption) {
        pgScore += q.points;
      }
    } else if (q.type === 'essay') {
      hasEssay = true;
      // Give initial automatic rubric points based on thoroughness, editable by teacher
      if (ans && ans.trim().length > 20) {
        essayScore += Math.round(q.points * 0.9);
      } else if (ans && ans.trim().length > 0) {
        essayScore += Math.round(q.points * 0.6);
      }
    }
  });

  const totalScore = Math.min(100, pgScore + essayScore);
  const attempt = {
    id: `att-${Date.now()}`,
    examId: exam.id,
    studentId: req.user!.id,
    studentName: req.user!.name,
    className: req.user!.className || exam.className,
    startedAt: new Date().toLocaleTimeString('id-ID'),
    submittedAt: new Date().toLocaleTimeString('id-ID'),
    pgScore,
    essayScore: hasEssay ? essayScore : null,
    totalScore,
    answers: answers || {},
    status: 'Selesai Dinilai' as const,
  };

  exam.attempts.unshift(attempt);
  if (db.activityChart['7d'].length > 0) {
    db.activityChart['7d'][db.activityChart['7d'].length - 1].ujianOnline += 1;
  }
  saveDb(db);
  res.json({ exam, attempt });
});

app.delete('/api/exams/:id', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  db.exams = db.exams.filter((e) => e.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

// ============================================================================
// ATTENDANCE & ACADEMIC GRADES ROUTES
// ============================================================================

app.post('/api/attendance', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req: AuthRequest, res) => {
  const db = getDb();
  const { date, className, subjectName, topic, entries } = req.body;
  if (!date || !className || !subjectName) {
    res.status(400).json({ error: 'Tanggal, Kelas, dan Mata Pelajaran wajib diisi.' });
    return;
  }
  const newRecord = {
    id: `attd-${Date.now()}`,
    date: String(date),
    className: String(className),
    subjectName: String(subjectName),
    teacherName: req.user!.name,
    topic: String(topic || 'Pertemuan Tatap Muka'),
    entries: Array.isArray(entries) ? entries : [],
  };
  db.attendance.unshift(newRecord);
  saveDb(db);
  res.json(newRecord);
});

app.post('/api/grades', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  const { studentId, nisn, studentName, className, subjectName, semester, tugasScore, uhScore, utsScore, uasScore, description } = req.body;
  if (!studentName || !subjectName || !className) {
    res.status(400).json({ error: 'Nama Siswa, Kelas, dan Mata Pelajaran wajib diisi.' });
    return;
  }
  const t = Number(tugasScore) || 0;
  const uh = Number(uhScore) || 0;
  const uts = Number(utsScore) || 0;
  const uas = Number(uasScore) || 0;
  const finalScore = Math.round(((t * 0.25) + (uh * 0.25) + (uts * 0.25) + (uas * 0.25)) * 10) / 10;
  const predicate: 'A' | 'B' | 'C' | 'D' =
    finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 75 ? 'C' : 'D';

  const newGrade = {
    id: `grd-${Date.now()}`,
    studentId: String(studentId || `std-${Date.now()}`),
    nisn: String(nisn || '0084921034'),
    studentName: String(studentName),
    className: String(className),
    subjectName: String(subjectName),
    semester: String(semester || `${db.settings.activeSemester} ${db.settings.activeAcademicYear}`),
    tugasScore: t,
    uhScore: uh,
    utsScore: uts,
    uasScore: uas,
    finalScore,
    predicate,
    description: String(description || 'Capaian kompetensi akademik tuntas dengan sangat baik.'),
  };
  db.grades.unshift(newGrade);
  saveDb(db);
  res.json(newGrade);
});

app.put('/api/grades/:id', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  const idx = db.grades.findIndex((g) => g.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Data nilai tidak ditemukan.' });
    return;
  }
  const updated = { ...db.grades[idx], ...req.body };
  const t = Number(updated.tugasScore) || 0;
  const uh = Number(updated.uhScore) || 0;
  const uts = Number(updated.utsScore) || 0;
  const uas = Number(updated.uasScore) || 0;
  updated.finalScore = Math.round(((t * 0.25) + (uh * 0.25) + (uts * 0.25) + (uas * 0.25)) * 10) / 10;
  updated.predicate = updated.finalScore >= 90 ? 'A' : updated.finalScore >= 80 ? 'B' : updated.finalScore >= 75 ? 'C' : 'D';
  db.grades[idx] = updated;
  saveDb(db);
  res.json(updated);
});

// ============================================================================
// SCHEDULES, FORUMS, ANNOUNCEMENTS & SETTINGS ROUTES
// ============================================================================

app.post('/api/schedules', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  const { day, startTime, endTime, subjectName, className, teacherName, room, colorDot } = req.body;
  if (!day || !startTime || !subjectName || !className) {
    res.status(400).json({ error: 'Hari, Jam, Mata Pelajaran, dan Kelas wajib diisi.' });
    return;
  }
  const newSch = {
    id: `sch-${Date.now()}`,
    day,
    startTime: String(startTime),
    endTime: String(endTime || '09:30'),
    subjectName: String(subjectName),
    className: String(className),
    teacherName: String(teacherName || '-'),
    room: String(room || 'R.101'),
    colorDot: colorDot || 'emerald',
  };
  db.schedules.push(newSch);
  saveDb(db);
  res.json(newSch);
});

app.delete('/api/schedules/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.schedules = db.schedules.filter((s) => s.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/forums', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const { title, subjectName, className, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Judul dan isi topik diskusi wajib diisi.' });
    return;
  }
  const newThread = {
    id: `frm-${Date.now()}`,
    title: String(title).trim(),
    subjectName: String(subjectName || "Al-Qur'an Hadis"),
    className: String(className || 'Kelas X-A'),
    authorName: req.user!.name,
    authorRole: req.user!.role,
    content: String(content).trim(),
    createdAt: 'Baru saja',
    likes: 1,
    isPinned: false,
    replies: [],
  };
  db.forums.unshift(newThread);
  saveDb(db);
  res.json(newThread);
});

app.post('/api/forums/:id/reply', requireAuth, (req: AuthRequest, res) => {
  const db = getDb();
  const thread = db.forums.find((f) => f.id === req.params.id);
  if (!thread) {
    res.status(404).json({ error: 'Topik diskusi tidak ditemukan.' });
    return;
  }
  const { content } = req.body;
  if (!content || !String(content).trim()) {
    res.status(400).json({ error: 'Komentar balasan tidak boleh kosong.' });
    return;
  }
  thread.replies.push({
    id: `rep-${Date.now()}`,
    authorName: req.user!.name,
    authorRole: req.user!.role,
    content: String(content).trim(),
    createdAt: 'Baru saja',
  });
  saveDb(db);
  res.json(thread);
});

app.post('/api/forums/:id/like', requireAuth, (req, res) => {
  const db = getDb();
  const thread = db.forums.find((f) => f.id === req.params.id);
  if (!thread) {
    res.status(404).json({ error: 'Topik diskusi tidak ditemukan.' });
    return;
  }
  thread.likes += 1;
  saveDb(db);
  res.json(thread);
});

app.delete('/api/forums/:id', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req, res) => {
  const db = getDb();
  db.forums = db.forums.filter((f) => f.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/announcements', requireAuth, requireRole(['admin', 'kepsek', 'guru']), (req: AuthRequest, res) => {
  const db = getDb();
  const { title, content, category, targetRole, colorDot } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Judul dan isi pengumuman wajib diisi.' });
    return;
  }
  const newAnn = {
    id: `ann-${Date.now()}`,
    title: String(title).trim(),
    content: String(content).trim(),
    category: category || 'Akademik',
    authorName: req.user!.name,
    targetRole: targetRole || 'Semua',
    relativeTime: 'Baru saja',
    date: new Date().toISOString().slice(0, 10),
    colorDot: colorDot || 'emerald',
  };
  db.announcements.unshift(newAnn);
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: `Pengumuman Baru: ${newAnn.title}`,
    message: newAnn.content.slice(0, 80) + '...',
    time: 'Baru saja',
    isRead: false,
    linkTab: 'pengumuman',
  });
  saveDb(db);
  res.json(newAnn);
});

app.delete('/api/announcements/:id', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
  saveDb(db);
  res.json({ success: true });
});

app.post('/api/notifications/read-all', requireAuth, (_req, res) => {
  const db = getDb();
  db.notifications.forEach((n) => (n.isRead = true));
  saveDb(db);
  res.json(db.notifications);
});

app.put('/api/settings', requireAuth, requireRole(['admin', 'kepsek']), (req, res) => {
  const db = getDb();
  db.settings = {
    ...db.settings,
    ...req.body,
  };
  const kepsekUser = db.users.find((u) => u.role === 'kepsek');
  if (kepsekUser) {
    if (db.settings.headmasterName) kepsekUser.name = db.settings.headmasterName;
    if (db.settings.headmasterNip) kepsekUser.nipOrNisn = db.settings.headmasterNip;
  }
  saveDb(db);
  res.json(db.settings);
});

// ============================================================================
// VITE DEV MIDDLEWARE / STATIC PROD SERVING
// ============================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server E-Learning MA EL-BAYAN berjalan pada http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;

import initialDbData from '../../data/elbayan_elearning_db.json';
import {
  AcademicGrade,
  AcademicYear,
  Announcement,
  Assignment,
  AttendanceRecord,
  ForumThread,
  LearningMaterial,
  Major,
  NotificationItem,
  OnlineExam,
  ScheduleItem,
  SchoolClass,
  SchoolSettings,
  StudentData,
  Subject,
  TeacherData,
  UserAccount,
  UserRole,
} from '../types.ts';

const STORAGE_KEY = 'elbayan_client_db_v1';
const TOKEN_KEY = 'elbayan_client_auth_token';

interface ClientDatabase {
  settings: SchoolSettings;
  users: (UserAccount & { passwordHash?: string; salt?: string })[];
  academicYears: AcademicYear[];
  majors: Major[];
  classes: SchoolClass[];
  subjects: Subject[];
  teachers: TeacherData[];
  students: StudentData[];
  materials: LearningMaterial[];
  assignments: Assignment[];
  exams: OnlineExam[];
  attendance: AttendanceRecord[];
  grades: AcademicGrade[];
  schedules: ScheduleItem[];
  forums: ForumThread[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  activityChart: {
    '7d': any[];
    '30d': any[];
    'semester': any[];
  };
}

function getStoredDb(): ClientDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure headmaster name and logo are updated
      if (parsed.settings) {
        parsed.settings.headmasterName = 'Hj. Faiqoh Subky, S.H., M.Pd.';
        parsed.settings.logoUrl = '/assets/aistudio/images_be5eb3cc.jpeg';
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load local DB, using initial data', e);
  }
  const cloned = JSON.parse(JSON.stringify(initialDbData)) as ClientDatabase;
  if (cloned.settings) {
    cloned.settings.headmasterName = 'Hj. Faiqoh Subky, S.H., M.Pd.';
    cloned.settings.logoUrl = '/assets/aistudio/images_be5eb3cc.jpeg';
  }
  saveStoredDb(cloned);
  return cloned;
}

function saveStoredDb(db: ClientDatabase) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

function sanitizeUser(u: any): UserAccount {
  const { passwordHash, salt, ...safe } = u;
  return safe;
}

function makeJsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): any {
  if (!init || !init.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  return {};
}

export async function handleClientFallback(url: string, init?: RequestInit): Promise<Response> {
  const urlObj = new URL(url, window.location.origin);
  const pathname = urlObj.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  const db = getStoredDb();

  console.info(`[Client Fallback] Handling ${method} ${pathname}`);

  // 1. GET /api/public/overview
  if (pathname === '/api/public/overview' && method === 'GET') {
    return makeJsonResponse({
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
  }

  // 2. GET /api/auth/me
  if (pathname === '/api/auth/me' && method === 'GET') {
    const authHeader =
      init?.headers && typeof (init.headers as any).get === 'function'
        ? (init.headers as any).get('Authorization')
        : (init?.headers as any)?.['Authorization'];
    const storedToken = authHeader ? authHeader.replace('Bearer ', '') : localStorage.getItem(TOKEN_KEY);

    let user: any = null;
    if (storedToken) {
      if (storedToken.includes('usr-admin') || storedToken.includes('admin')) {
        user = db.users.find((u) => u.role === 'admin');
      } else if (storedToken.includes('usr-guru') || storedToken.includes('guru')) {
        user = db.users.find((u) => u.role === 'guru');
      } else if (storedToken.includes('usr-siswa') || storedToken.includes('siswa')) {
        user = db.users.find((u) => u.role === 'siswa');
      } else {
        user = db.users.find((u) => u.role === 'kepsek');
      }
    }
    if (!user) {
      user = db.users.find((u) => u.role === 'kepsek') || db.users[0];
    }
    return makeJsonResponse({
      user: sanitizeUser(user),
      settings: db.settings,
    });
  }

  // 3. POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = parseBody(init);
    const id = String(body.identifier || '').trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.username.toLowerCase() === id ||
        u.email.toLowerCase() === id ||
        u.nipOrNisn.toLowerCase() === id ||
        (id === 'admin' && u.role === 'admin') ||
        (id === 'kepsek' && u.role === 'kepsek') ||
        (id === 'guru' && u.role === 'guru') ||
        (id === 'siswa' && u.role === 'siswa')
    );

    if (!user) {
      return makeJsonResponse({ error: 'Akun tidak ditemukan. Silakan periksa kembali.' }, 401);
    }

    const token = `elbayan-token-${user.id}-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);

    return makeJsonResponse({
      token,
      user: sanitizeUser(user),
      settings: db.settings,
    });
  }

  // 4. POST /api/auth/quick-login
  if (pathname === '/api/auth/quick-login' && method === 'POST') {
    const body = parseBody(init);
    const role = (body.role || 'kepsek') as UserRole;
    const user = db.users.find((u) => u.role === role) || db.users[0];
    const token = `elbayan-token-${user.id}-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);

    return makeJsonResponse({
      token,
      user: sanitizeUser(user),
      settings: db.settings,
    });
  }

  // 5. GET /api/state/all
  if (pathname === '/api/state/all' && method === 'GET') {
    return makeJsonResponse({
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
  }

  // 6. Settings routes
  if (pathname === '/api/settings') {
    if (method === 'GET') return makeJsonResponse(db.settings);
    if (method === 'PUT') {
      const body = parseBody(init);
      db.settings = { ...db.settings, ...body };
      saveStoredDb(db);
      return makeJsonResponse(db.settings);
    }
  }

  // 7. Materials routes
  if (pathname === '/api/materials') {
    if (method === 'GET') return makeJsonResponse(db.materials);
    if (method === 'POST') {
      const body = parseBody(init);
      const newMat: LearningMaterial = {
        id: `mat-${Date.now()}`,
        title: body.title || 'Materi Baru',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        className: body.className || 'Kelas X-A',
        teacherName: body.teacherName || 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        category: body.category || 'Modul PDF',
        description: body.description || '',
        contentSummary: body.contentSummary || '',
        fileName: body.fileName || 'Materi_Elearning.pdf',
        fileSize: body.fileSize || '2.0 MB',
        downloads: 0,
        views: 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
      db.materials.unshift(newMat);
      saveStoredDb(db);
      return makeJsonResponse(newMat);
    }
  }

  if (pathname.startsWith('/api/materials/')) {
    const parts = pathname.split('/');
    const matId = parts[3];
    if (parts[4] === 'download' && method === 'POST') {
      const mat = db.materials.find((m) => m.id === matId);
      if (mat) mat.downloads = (mat.downloads || 0) + 1;
      saveStoredDb(db);
      return makeJsonResponse({ success: true });
    }
    if (method === 'DELETE') {
      db.materials = db.materials.filter((m) => m.id !== matId);
      saveStoredDb(db);
      return makeJsonResponse({ success: true });
    }
  }

  // 8. Assignments routes
  if (pathname === '/api/assignments') {
    if (method === 'GET') return makeJsonResponse(db.assignments);
    if (method === 'POST') {
      const body = parseBody(init);
      const newAsg: Assignment = {
        id: `asg-${Date.now()}`,
        title: body.title || 'Tugas Baru',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        className: body.className || 'Kelas X-A',
        teacherName: body.teacherName || 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        dueDate: body.dueDate || new Date().toISOString().split('T')[0],
        description: body.description || '',
        maxScore: body.maxScore || 100,
        attachmentName: body.attachmentName || '',
        createdAt: new Date().toISOString().split('T')[0],
        submissions: [],
      };
      db.assignments.unshift(newAsg);
      saveStoredDb(db);
      return makeJsonResponse(newAsg);
    }
  }

  if (pathname.startsWith('/api/assignments/')) {
    const parts = pathname.split('/');
    const asgId = parts[3];
    if (parts[4] === 'submit' && method === 'POST') {
      const body = parseBody(init);
      const asg = db.assignments.find((a) => a.id === asgId);
      if (asg) {
        asg.submissions.push({
          id: `subm-${Date.now()}`,
          assignmentId: asgId,
          studentId: body.studentId || 'std-1',
          studentName: body.studentName || 'Nabila Azzahra Putri',
          studentNisn: body.studentNisn || '0084921034',
          className: body.className || 'Kelas X-A',
          submittedAt: new Date().toLocaleString('id-ID'),
          answerText: body.answerText || '',
          fileName: body.fileName || '',
          score: null,
          feedback: '',
          status: 'Terkumpul',
        });
        saveStoredDb(db);
      }
      return makeJsonResponse({ success: true, assignment: asg });
    }
    if (parts[4] === 'grade' && method === 'POST') {
      const body = parseBody(init);
      const asg = db.assignments.find((a) => a.id === asgId);
      if (asg) {
        const sub = asg.submissions.find((s) => s.id === body.submissionId);
        if (sub) {
          sub.score = Number(body.score);
          sub.feedback = body.feedback || '';
          sub.status = 'Dinilai';
          saveStoredDb(db);
        }
      }
      return makeJsonResponse({ success: true, assignment: asg });
    }
    if (method === 'DELETE') {
      db.assignments = db.assignments.filter((a) => a.id !== asgId);
      saveStoredDb(db);
      return makeJsonResponse({ success: true });
    }
  }

  // 9. Exams routes
  if (pathname === '/api/exams') {
    if (method === 'GET') return makeJsonResponse(db.exams);
    if (method === 'POST') {
      const body = parseBody(init);
      const newExam: OnlineExam = {
        id: `exm-${Date.now()}`,
        title: body.title || 'Ujian Baru',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        className: body.className || 'Kelas X-A',
        teacherName: body.teacherName || 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        examType: body.examType || 'Ulangan Harian',
        durationMinutes: body.durationMinutes || 60,
        date: body.date || new Date().toISOString().split('T')[0],
        startTime: body.startTime || '08:00 WIB',
        passingScore: body.passingScore || 75,
        status: 'Aktif',
        questions: [],
        attempts: [],
      };
      db.exams.unshift(newExam);
      saveStoredDb(db);
      return makeJsonResponse(newExam);
    }
  }

  if (pathname.startsWith('/api/exams/')) {
    const parts = pathname.split('/');
    const examId = parts[3];
    if (parts[4] === 'submit' && method === 'POST') {
      const body = parseBody(init);
      const exam = db.exams.find((e) => e.id === examId);
      if (exam) {
        const attempt = {
          id: `att-${Date.now()}`,
          examId,
          studentId: body.studentId || 'std-1',
          studentName: body.studentName || 'Nabila Azzahra Putri',
          className: body.className || 'Kelas X-A',
          startedAt: new Date().toLocaleTimeString('id-ID'),
          submittedAt: new Date().toLocaleTimeString('id-ID'),
          pgScore: 85,
          essayScore: null,
          totalScore: 85,
          answers: body.answers || {},
          status: 'Menunggu Penilaian Essay',
        };
        exam.attempts.push(attempt as any);
        saveStoredDb(db);
      }
      return makeJsonResponse({ success: true, exam });
    }
    if (method === 'DELETE') {
      db.exams = db.exams.filter((e) => e.id !== examId);
      saveStoredDb(db);
      return makeJsonResponse({ success: true });
    }
  }

  // 10. Announcements
  if (pathname === '/api/announcements') {
    if (method === 'GET') return makeJsonResponse(db.announcements);
    if (method === 'POST') {
      const body = parseBody(init);
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: body.title || 'Pengumuman Baru',
        content: body.content || '',
        category: body.category || 'Akademik',
        authorName: body.authorName || 'Hj. Faiqoh Subky, S.H., M.Pd.',
        targetRole: body.targetRole || 'Semua',
        relativeTime: 'Baru saja',
        date: new Date().toISOString().split('T')[0],
        colorDot: body.colorDot || 'emerald',
      };
      db.announcements.unshift(newAnn);
      saveStoredDb(db);
      return makeJsonResponse(newAnn);
    }
  }

  if (pathname.startsWith('/api/announcements/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    db.announcements = db.announcements.filter((a) => a.id !== id);
    saveStoredDb(db);
    return makeJsonResponse({ success: true });
  }

  // 11. Schedules
  if (pathname === '/api/schedules') {
    if (method === 'GET') return makeJsonResponse(db.schedules);
    if (method === 'POST') {
      const body = parseBody(init);
      const newSch: ScheduleItem = {
        id: `sch-${Date.now()}`,
        day: body.day || 'Senin',
        startTime: body.startTime || '07:00',
        endTime: body.endTime || '08:40',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        className: body.className || 'Kelas X-A',
        teacherName: body.teacherName || 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        room: body.room || 'R.101',
        colorDot: body.colorDot || 'emerald',
      };
      db.schedules.push(newSch);
      saveStoredDb(db);
      return makeJsonResponse(newSch);
    }
  }

  if (pathname.startsWith('/api/schedules/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    db.schedules = db.schedules.filter((s) => s.id !== id);
    saveStoredDb(db);
    return makeJsonResponse({ success: true });
  }

  // 12. Forums
  if (pathname === '/api/forums') {
    if (method === 'GET') return makeJsonResponse(db.forums);
    if (method === 'POST') {
      const body = parseBody(init);
      const newForum: ForumThread = {
        id: `frm-${Date.now()}`,
        title: body.title || 'Diskusi Baru',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        className: body.className || 'Kelas X-A',
        authorName: body.authorName || 'Hj. Faiqoh Subky, S.H., M.Pd.',
        authorRole: body.authorRole || 'guru',
        content: body.content || '',
        createdAt: 'Baru saja',
        likes: 0,
        isPinned: false,
        replies: [],
      };
      db.forums.unshift(newForum);
      saveStoredDb(db);
      return makeJsonResponse(newForum);
    }
  }

  if (pathname.startsWith('/api/forums/')) {
    const parts = pathname.split('/');
    const forumId = parts[3];
    if (parts[4] === 'reply' && method === 'POST') {
      const body = parseBody(init);
      const th = db.forums.find((f) => f.id === forumId);
      if (th) {
        th.replies.push({
          id: `rep-${Date.now()}`,
          authorName: body.authorName || 'Siswa El-Bayan',
          authorRole: body.authorRole || 'siswa',
          content: body.content || '',
          createdAt: 'Baru saja',
        });
        saveStoredDb(db);
      }
      return makeJsonResponse({ success: true, forum: th });
    }
    if (parts[4] === 'like' && method === 'POST') {
      const th = db.forums.find((f) => f.id === forumId);
      if (th) {
        th.likes = (th.likes || 0) + 1;
        saveStoredDb(db);
      }
      return makeJsonResponse({ success: true, likes: th?.likes || 0 });
    }
    if (method === 'DELETE') {
      db.forums = db.forums.filter((f) => f.id !== forumId);
      saveStoredDb(db);
      return makeJsonResponse({ success: true });
    }
  }

  // 13. Attendance
  if (pathname === '/api/attendance') {
    if (method === 'GET') return makeJsonResponse(db.attendance);
    if (method === 'POST') {
      const body = parseBody(init);
      const newAtt: AttendanceRecord = {
        id: `attd-${Date.now()}`,
        date: body.date || new Date().toISOString().split('T')[0],
        className: body.className || 'Kelas X-A',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        teacherName: body.teacherName || 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        topic: body.topic || 'Pertemuan Pembelajaran',
        entries: body.entries || [],
      };
      db.attendance.unshift(newAtt);
      saveStoredDb(db);
      return makeJsonResponse(newAtt);
    }
  }

  // 14. Grades
  if (pathname === '/api/grades') {
    if (method === 'GET') return makeJsonResponse(db.grades);
    if (method === 'POST') {
      const body = parseBody(init);
      const newGrd: AcademicGrade = {
        id: `grd-${Date.now()}`,
        studentId: body.studentId || 'std-1',
        nisn: body.nisn || '0084921034',
        studentName: body.studentName || 'Nabila Azzahra Putri',
        className: body.className || 'Kelas X-A',
        subjectName: body.subjectName || "Al-Qur'an Hadis",
        semester: body.semester || 'Ganjil 2025/2026',
        tugasScore: Number(body.tugasScore) || 85,
        uhScore: Number(body.uhScore) || 85,
        utsScore: Number(body.utsScore) || 85,
        uasScore: Number(body.uasScore) || 85,
        finalScore: Number(body.finalScore) || 85,
        predicate: body.predicate || 'A',
        description: body.description || '',
      };
      db.grades.unshift(newGrd);
      saveStoredDb(db);
      return makeJsonResponse(newGrd);
    }
  }

  // 15. Master CRUD
  if (pathname.startsWith('/api/master/')) {
    const entity = pathname.split('/')[3];
    const id = pathname.split('/')[4];

    if (entity === 'students') {
      if (method === 'GET') return makeJsonResponse(db.students);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: StudentData = { id: `std-${Date.now()}`, ...body };
        db.students.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (method === 'DELETE' && id) {
        db.students = db.students.filter((s) => s.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'teachers') {
      if (method === 'GET') return makeJsonResponse(db.teachers);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: TeacherData = { id: `tchr-${Date.now()}`, ...body };
        db.teachers.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (method === 'DELETE' && id) {
        db.teachers = db.teachers.filter((t) => t.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'classes') {
      if (method === 'GET') return makeJsonResponse(db.classes);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: SchoolClass = { id: `cls-${Date.now()}`, ...body };
        db.classes.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (method === 'DELETE' && id) {
        db.classes = db.classes.filter((c) => c.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'majors') {
      if (method === 'GET') return makeJsonResponse(db.majors);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: Major = { id: `mjr-${Date.now()}`, ...body };
        db.majors.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (method === 'DELETE' && id) {
        db.majors = db.majors.filter((m) => m.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'subjects') {
      if (method === 'GET') return makeJsonResponse(db.subjects);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: Subject = { id: `sub-${Date.now()}`, ...body };
        db.subjects.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (method === 'DELETE' && id) {
        db.subjects = db.subjects.filter((s) => s.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'users') {
      if (method === 'GET') return makeJsonResponse(db.users.map(sanitizeUser));
      if (method === 'POST') {
        const body = parseBody(init);
        const item: UserAccount = { id: `usr-${Date.now()}`, ...body };
        db.users.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(sanitizeUser(item));
      }
      if (method === 'DELETE' && id) {
        db.users = db.users.filter((u) => u.id !== id);
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }

    if (entity === 'academic-years') {
      if (method === 'GET') return makeJsonResponse(db.academicYears);
      if (method === 'POST') {
        const body = parseBody(init);
        const item: AcademicYear = { id: `ay-${Date.now()}`, ...body };
        db.academicYears.unshift(item);
        saveStoredDb(db);
        return makeJsonResponse(item);
      }
      if (id && pathname.endsWith('/activate')) {
        db.academicYears.forEach((a) => (a.isActive = a.id === id));
        saveStoredDb(db);
        return makeJsonResponse({ success: true });
      }
    }
  }

  // 16. Notifications read all
  if (pathname === '/api/notifications/read-all' && method === 'POST') {
    db.notifications.forEach((n) => (n.isRead = true));
    saveStoredDb(db);
    return makeJsonResponse(db.notifications);
  }

  // Default fallback for any unhandled /api
  return makeJsonResponse({ message: 'OK', success: true });
}

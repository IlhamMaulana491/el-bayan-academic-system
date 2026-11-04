import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  UserAccount,
  SchoolSettings,
  AcademicYear,
  Major,
  SchoolClass,
  Subject,
  TeacherData,
  StudentData,
  LearningMaterial,
  Assignment,
  OnlineExam,
  AttendanceRecord,
  AcademicGrade,
  ScheduleItem,
  ForumThread,
  Announcement,
  NotificationItem,
  ActivityChartPoint,
} from '../types.ts';

export interface UserWithHash extends UserAccount {
  passwordHash: string;
  salt: string;
}

export interface DatabaseSchema {
  settings: SchoolSettings;
  users: UserWithHash[];
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
    '7d': ActivityChartPoint[];
    '30d': ActivityChartPoint[];
    'semester': ActivityChartPoint[];
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'elbayan_elearning_db.json');

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

function generateInitialStudents(): StudentData[] {
  const namedStudents: StudentData[] = [
    { id: 'std-1', nisn: '0084921034', nis: '252610001', name: 'Nabila Azzahra Putri', gender: 'P', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'nabila.azzahra@maelbayan.sch.id', parentName: 'H. Rahmat Hidayat', status: 'Aktif' },
    { id: 'std-2', nisn: '0084921035', nis: '252610002', name: 'Muhammad Farhan Al-Fatih', gender: 'L', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'farhan.alfatih@maelbayan.sch.id', parentName: 'Ir. Lukman Hakim', status: 'Aktif' },
    { id: 'std-3', nisn: '0084921036', nis: '252610003', name: 'Siti Aisyah Humaira', gender: 'P', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'aisyah.humaira@maelbayan.sch.id', parentName: 'Drs. Mulyadi', status: 'Aktif' },
    { id: 'std-4', nisn: '0084921037', nis: '252610004', name: 'Ahmad Zaki Mubarak', gender: 'L', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'zaki.mubarak@maelbayan.sch.id', parentName: 'H. Syamsul Arifin', status: 'Aktif' },
    { id: 'std-5', nisn: '0084921038', nis: '252610005', name: 'Khansa Nadia Syakira', gender: 'P', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'khansa.syakira@maelbayan.sch.id', parentName: 'Zainal Abidin, S.E.', status: 'Aktif' },
    { id: 'std-6', nisn: '0084921039', nis: '252610006', name: 'Rizky Ramadhan Pratama', gender: 'L', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'rizky.ramadhan@maelbayan.sch.id', parentName: 'Agus Salim', status: 'Aktif' },
    { id: 'std-7', nisn: '0084921040', nis: '252610007', name: 'Fatimah Az-Zahra', gender: 'P', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'fatimah.zahra@maelbayan.sch.id', parentName: 'Ustadz Hasan Basri', status: 'Aktif' },
    { id: 'std-8', nisn: '0084921041', nis: '252610008', name: 'Luthfi Maulana Ibrahim', gender: 'L', className: 'Kelas X-A', major: 'MIPA / Sains', email: 'luthfi.ibrahim@maelbayan.sch.id', parentName: 'H. Burhanuddin', status: 'Aktif' },
    { id: 'std-9', nisn: '0084921042', nis: '252610009', name: 'Zahra Amalia Fitri', gender: 'P', className: 'Kelas X-B', major: 'MIPA / Sains', email: 'zahra.amalia@maelbayan.sch.id', parentName: 'Dedi Kurniawan', status: 'Aktif' },
    { id: 'std-10', nisn: '0084921043', nis: '252610010', name: 'Ilham Nur Wahid', gender: 'L', className: 'Kelas X-B', major: 'MIPA / Sains', email: 'ilham.wahid@maelbayan.sch.id', parentName: 'Slamet Riyadi', status: 'Aktif' },
    { id: 'std-11', nisn: '0074921044', nis: '242511001', name: 'Rania Salsabila Putri', gender: 'P', className: 'Kelas XI-MIPA 1', major: 'MIPA / Sains', email: 'rania.salsabila@maelbayan.sch.id', parentName: 'Bambang Wijaya', status: 'Aktif' },
    { id: 'std-12', nisn: '0074921045', nis: '242511002', name: 'Muhammad Hafidz Qurani', gender: 'L', className: 'Kelas XI-Keagamaan', major: 'Keagamaan (MAK)', email: 'hafidz.qurani@maelbayan.sch.id', parentName: 'KH. Mansyur', status: 'Aktif' },
    { id: 'std-13', nisn: '0064921046', nis: '232412001', name: 'Aulia Rahman Siddiq', gender: 'L', className: 'Kelas XII-MIPA 1', major: 'MIPA / Sains', email: 'aulia.siddiq@maelbayan.sch.id', parentName: 'Dr. Hendra Gunawan', status: 'Aktif' },
    { id: 'std-14', nisn: '0064921047', nis: '232412002', name: 'Najwa Shihab Al-Bayan', gender: 'P', className: 'Kelas XII-IPS 1', major: 'IPS / Sosial', email: 'najwa.albayan@maelbayan.sch.id', parentName: 'H. Fathurrahman', status: 'Aktif' },
  ];

  const classesList = [
    { name: 'Kelas X-A', major: 'MIPA / Sains' },
    { name: 'Kelas X-B', major: 'MIPA / Sains' },
    { name: 'Kelas X-C', major: 'IPS / Sosial' },
    { name: 'Kelas X-D', major: 'Keagamaan (MAK)' },
    { name: 'Kelas XI-MIPA 1', major: 'MIPA / Sains' },
    { name: 'Kelas XI-MIPA 2', major: 'MIPA / Sains' },
    { name: 'Kelas XI-IPS 1', major: 'IPS / Sosial' },
    { name: 'Kelas XI-Keagamaan', major: 'Keagamaan (MAK)' },
    { name: 'Kelas XII-MIPA 1', major: 'MIPA / Sains' },
    { name: 'Kelas XII-MIPA 2', major: 'MIPA / Sains' },
    { name: 'Kelas XII-IPS 1', major: 'IPS / Sosial' },
    { name: 'Kelas XII-Keagamaan', major: 'Keagamaan (MAK)' },
  ];

  const firstNamesL = ['Ahmad', 'Muhammad', 'Rizki', 'Fajar', 'Zaidan', 'Rafi', 'Naufal', 'Syauqi', 'Haikal', 'Dzaki', 'Irfan', 'Adنان', 'Fikri', 'Azka', 'Hilmi', 'Salman'];
  const lastNamesL = ['Firdaus', 'Hidayatullah', 'Maulana', 'Ramadhan', 'Al-Farisi', 'Pratama', 'Muttaqin', 'Habibie', 'Mubarok', 'Hakim', 'Setiawan', 'Nashrullah'];
  const firstNamesP = ['Siti', 'Nurul', 'Aisyah', 'Syifa', 'Nadia', 'Kayla', 'Salma', 'Hasna', 'Rifda', 'Laila', 'Shofia', 'Dinda', 'Yasmin', 'Aqila', 'Wardah', 'Afifah'];
  const lastNamesP = ['Az-Zahra', 'Khumaira', 'Ramadhani', 'Salsabila', 'Qonita', 'Maharani', 'Fauziah', 'Mardhiyah', 'Hidayah', 'Lestari', 'Nabilah', 'Fitriani'];

  const totalTarget = 342;
  const students = [...namedStudents];

  for (let i = namedStudents.length + 1; i <= totalTarget; i++) {
    const isMale = i % 2 === 0;
    const cls = classesList[i % classesList.length];
    const fn = isMale ? firstNamesL[i % firstNamesL.length] : firstNamesP[i % firstNamesP.length];
    const ln = isMale ? lastNamesL[(i * 3) % lastNamesL.length] : lastNamesP[(i * 3) % lastNamesP.length];
    const nisn = `00849${String(30000 + i)}`;
    const nis = `2526${String(10000 + i)}`;
    students.push({
      id: `std-${i}`,
      nisn,
      nis,
      name: `${fn} ${ln}`,
      gender: isMale ? 'L' : 'P',
      className: cls.name,
      major: cls.major,
      email: `siswa${i}@maelbayan.sch.id`,
      parentName: `Wali Murid ${ln}`,
      status: 'Aktif',
    });
  }

  return students;
}

function generateInitialTeachers(): TeacherData[] {
  const namedTeachers: TeacherData[] = [
    { id: 'tchr-1', nip: '197805142005011003', name: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag', email: 'ridwan@maelbayan.sch.id', phone: '08123456001', subject: "Al-Qur'an Hadis", education: 'S2 Ilmu Al-Quran & Tafsir', status: 'PNS', active: true },
    { id: 'tchr-2', nip: '198109222006041008', name: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I', email: 'baihaqi@maelbayan.sch.id', phone: '08123456002', subject: 'Fikih', education: 'S2 Pendidikan Agama Islam', status: 'PNS', active: true },
    { id: 'tchr-3', nip: '198304102009012005', name: 'Hj. Siti Maryam, S.Ag., M.Pd', email: 'maryam@maelbayan.sch.id', phone: '08123456003', subject: 'Akidah Akhlak', education: 'S2 Pendidikan Islam', status: 'PNS', active: true },
    { id: 'tchr-4', nip: '198511182011011002', name: 'Ustadz Abdul Aziz, S.Hum., M.Pd.I', email: 'abdulaziz@maelbayan.sch.id', phone: '08123456004', subject: 'Sejarah Kebudayaan Islam (SKI)', education: 'S2 Sejarah Peradaban Islam', status: 'GTY', active: true },
    { id: 'tchr-5', nip: '198702042012121004', name: 'Ustadz Mahmud Yunus, Lc., M.A.', email: 'mahmud@maelbayan.sch.id', phone: '08123456005', subject: 'Bahasa Arab', education: 'S2 Pendidikan Bahasa Arab', status: 'PNS', active: true },
    { id: 'tchr-6', nip: '198406152008011009', name: 'Hendra Kusuma, S.Pd., M.Si', email: 'hendra@maelbayan.sch.id', phone: '08123456006', subject: 'Matematika', education: 'S2 Matematika', status: 'PNS', active: true },
    { id: 'tchr-7', nip: '198608292010012011', name: 'Dra. Ratna Sari Dewi, M.Pd', email: 'ratna@maelbayan.sch.id', phone: '08123456007', subject: 'Bahasa Indonesia', education: 'S2 Pendidikan Bahasa Indonesia', status: 'PNS', active: true },
    { id: 'tchr-8', nip: '198901122014031006', name: 'Bambang Suryono, S.Si., M.Pd', email: 'bambang@maelbayan.sch.id', phone: '08123456008', subject: 'Fisika', education: 'S2 Pendidikan IPA', status: 'GTY', active: true },
    { id: 'tchr-9', nip: '199007192015032004', name: 'Nurul Hidayati, S.Pd., M.Sc', email: 'nurul@maelbayan.sch.id', phone: '08123456009', subject: 'Kimia', education: 'S2 Kimia', status: 'GTY', active: true },
    { id: 'tchr-10', nip: '199103252016012007', name: 'Dr. Rina Wulandari, M.Pd', email: 'rina@maelbayan.sch.id', phone: '08123456010', subject: 'Biologi', education: 'S3 Pendidikan Biologi', status: 'PNS', active: true },
    { id: 'tchr-11', nip: '198812032013012003', name: 'Diana Puspitasari, S.Pd., M.Hum', email: 'diana@maelbayan.sch.id', phone: '08123456011', subject: 'Bahasa Inggris', education: 'S2 Linguistik Terapan', status: 'GTY', active: true },
    { id: 'tchr-12', nip: '199205172018011001', name: 'Ilham Maulana, S.Kom', email: 'ilhammaulana@maelbayan.com.id', phone: '0813-2887-5024', subject: 'Informatika', education: 'S2 Teknik Informatika', status: 'GTY', active: true },
  ];

  const extraSubjects = [
    'Ushul Fikih', 'Ilmu Tafsir', 'Ilmu Hadis', 'Ekonomi', 'Sosiologi',
    'Geografi', 'Sejarah Indonesia', 'PPKn', 'PJOK', 'Seni Budaya',
    'Tahfidz Al-Qur\'an', 'Prakarya & Kewirausahaan'
  ];
  const names = [
    'Ustadz H. Zainuddin, Lc.', 'Ustadzah Halimah Sa\'diyah, S.Ag.', 'Drs. H. Anwar Sadat',
    'taufik Hidayat, S.E., M.M.', 'Sri Wahyuni, S.Sos., M.Pd', 'Agung Prasetyo, S.Pd',
    'M. Lukmanul Hakim, S.Pd.I', 'Nadia Fakhira, S.Si', 'Faisal Rahman, S.Or',
    'Siti Khadijah, S.Pd', 'Ustadz Syarif Hidayatullah, Al-Hafidz', 'Rudi Hermawan, S.Kom'
  ];

  const teachers = [...namedTeachers];
  for (let i = 13; i <= 48; i++) {
    const idx = (i - 13) % names.length;
    const subIdx = (i - 13) % extraSubjects.length;
    teachers.push({
      id: `tchr-${i}`,
      nip: `198${i % 9}0${(i % 8) + 1}15201${i % 9}0110${String(i).padStart(2, '0')}`,
      name: i <= 24 ? names[idx] : `${names[idx].split(',')[0]} (${i - 24}), S.Pd`,
      email: `guru${i}@maelbayan.sch.id`,
      phone: `08123456${String(i).padStart(3, '0')}`,
      subject: extraSubjects[subIdx],
      education: i % 3 === 0 ? 'S2 Pendidikan' : 'S1 Pendidikan',
      status: i % 3 === 0 ? 'PNS' : i % 2 === 0 ? 'GTY' : 'Honorer',
      active: true,
    });
  }

  return teachers;
}

export function createInitialDatabase(): DatabaseSchema {
  const adminPw = hashPassword('password123');
  const kepsekPw = hashPassword('password123');
  const guruPw = hashPassword('password123');
  const siswaPw = hashPassword('password123');

  const subjects: Subject[] = [
    { id: 'sub-1', code: 'PAI-QH', name: "Al-Qur'an Hadis", category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag', hoursPerWeek: 4, kkm: 78 },
    { id: 'sub-2', code: 'PAI-AA', name: 'Akidah Akhlak', category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'Hj. Siti Maryam, S.Ag., M.Pd', hoursPerWeek: 3, kkm: 78 },
    { id: 'sub-3', code: 'PAI-FK', name: 'Fikih', category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I', hoursPerWeek: 4, kkm: 78 },
    { id: 'sub-4', code: 'PAI-SKI', name: 'Sejarah Kebudayaan Islam (SKI)', category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz Abdul Aziz, S.Hum., M.Pd.I', hoursPerWeek: 2, kkm: 76 },
    { id: 'sub-5', code: 'PAI-BA', name: 'Bahasa Arab', category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz Mahmud Yunus, Lc., M.A.', hoursPerWeek: 4, kkm: 76 },
    { id: 'sub-6', code: 'UM-MTK', name: 'Matematika', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Hendra Kusuma, S.Pd., M.Si', hoursPerWeek: 4, kkm: 75 },
    { id: 'sub-7', code: 'UM-BIN', name: 'Bahasa Indonesia', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Dra. Ratna Sari Dewi, M.Pd', hoursPerWeek: 4, kkm: 76 },
    { id: 'sub-8', code: 'UM-BIG', name: 'Bahasa Inggris', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Diana Puspitasari, S.Pd., M.Hum', hoursPerWeek: 4, kkm: 75 },
    { id: 'sub-9', code: 'MIPA-FIS', name: 'Fisika', category: 'Peminatan MIPA', gradeLevels: 'X, XI, XII', teacherName: 'Bambang Suryono, S.Si., M.Pd', hoursPerWeek: 4, kkm: 75 },
    { id: 'sub-10', code: 'MIPA-KIM', name: 'Kimia', category: 'Peminatan MIPA', gradeLevels: 'X, XI, XII', teacherName: 'Nurul Hidayati, S.Pd., M.Sc', hoursPerWeek: 4, kkm: 75 },
    { id: 'sub-11', code: 'MIPA-BIO', name: 'Biologi', category: 'Peminatan MIPA', gradeLevels: 'X, XI, XII', teacherName: 'Dr. Rina Wulandari, M.Pd', hoursPerWeek: 4, kkm: 76 },
    { id: 'sub-12', code: 'UM-INF', name: 'Informatika', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Ilham Maulana, S.Kom', hoursPerWeek: 3, kkm: 78 },
    { id: 'sub-13', code: 'MAK-UF', name: 'Ushul Fikih', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz H. Zainuddin, Lc.', hoursPerWeek: 3, kkm: 78 },
    { id: 'sub-14', code: 'MAK-IT', name: 'Ilmu Tafsir', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag', hoursPerWeek: 3, kkm: 78 },
    { id: 'sub-15', code: 'MAK-IH', name: 'Ilmu Hadis', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Ustadzah Halimah Sa\'diyah, S.Ag.', hoursPerWeek: 3, kkm: 78 },
    { id: 'sub-16', code: 'MAK-THZ', name: "Tahfidz Al-Qur'an", category: 'PAI & Bahasa Arab', gradeLevels: 'X, XI, XII', teacherName: 'Ustadz Syarif Hidayatullah, Al-Hafidz', hoursPerWeek: 4, kkm: 80 },
    { id: 'sub-17', code: 'IPS-EKO', name: 'Ekonomi', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Taufik Hidayat, S.E., M.M.', hoursPerWeek: 4, kkm: 75 },
    { id: 'sub-18', code: 'IPS-SOS', name: 'Sosiologi', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Sri Wahyuni, S.Sos., M.Pd', hoursPerWeek: 3, kkm: 75 },
    { id: 'sub-19', code: 'IPS-GEO', name: 'Geografi', category: 'Peminatan IPS & Keagamaan', gradeLevels: 'X, XI, XII', teacherName: 'Agung Prasetyo, S.Pd', hoursPerWeek: 3, kkm: 75 },
    { id: 'sub-20', code: 'UM-SEJ', name: 'Sejarah Indonesia', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Drs. H. Anwar Sadat', hoursPerWeek: 2, kkm: 76 },
    { id: 'sub-21', code: 'UM-PKN', name: 'PPKn', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'M. Lukmanul Hakim, S.Pd.I', hoursPerWeek: 2, kkm: 76 },
    { id: 'sub-22', code: 'UM-PJOK', name: 'PJOK', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Faisal Rahman, S.Or', hoursPerWeek: 2, kkm: 75 },
    { id: 'sub-23', code: 'UM-SBD', name: 'Seni Budaya & Kaligrafi', category: 'Umum (Wajib)', gradeLevels: 'X, XI, XII', teacherName: 'Siti Khadijah, S.Pd', hoursPerWeek: 2, kkm: 76 },
    { id: 'sub-24', code: 'MIPA-MTKP', name: 'Matematika Peminatan', category: 'Peminatan MIPA', gradeLevels: 'XI, XII', teacherName: 'Hendra Kusuma, S.Pd., M.Si', hoursPerWeek: 4, kkm: 75 },
  ];

  const classes: SchoolClass[] = [
    { id: 'cls-1', name: 'Kelas X-A', level: 'X', majorCode: 'MIPA', homeroomTeacher: 'Hendra Kusuma, S.Pd., M.Si', roomNumber: 'Gedung A - R.101', capacity: 32, studentCount: 30 },
    { id: 'cls-2', name: 'Kelas X-B', level: 'X', majorCode: 'MIPA', homeroomTeacher: 'Bambang Suryono, S.Si., M.Pd', roomNumber: 'Gedung A - R.102', capacity: 32, studentCount: 29 },
    { id: 'cls-3', name: 'Kelas X-C', level: 'X', majorCode: 'IPS', homeroomTeacher: 'Taufik Hidayat, S.E., M.M.', roomNumber: 'Gedung A - R.103', capacity: 30, studentCount: 28 },
    { id: 'cls-4', name: 'Kelas X-D', level: 'X', majorCode: 'MAK', homeroomTeacher: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag', roomNumber: 'Gedung A - R.104', capacity: 30, studentCount: 28 },
    { id: 'cls-5', name: 'Kelas XI-MIPA 1', level: 'XI', majorCode: 'MIPA', homeroomTeacher: 'Nurul Hidayati, S.Pd., M.Sc', roomNumber: 'Gedung B - R.201', capacity: 30, studentCount: 29 },
    { id: 'cls-6', name: 'Kelas XI-MIPA 2', level: 'XI', majorCode: 'MIPA', homeroomTeacher: 'Dr. Rina Wulandari, M.Pd', roomNumber: 'Gedung B - R.202', capacity: 30, studentCount: 28 },
    { id: 'cls-7', name: 'Kelas XI-IPS 1', level: 'XI', majorCode: 'IPS', homeroomTeacher: 'Sri Wahyuni, S.Sos., M.Pd', roomNumber: 'Gedung B - R.203', capacity: 30, studentCount: 28 },
    { id: 'cls-8', name: 'Kelas XI-Keagamaan', level: 'XI', majorCode: 'MAK', homeroomTeacher: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I', roomNumber: 'Gedung B - R.204', capacity: 30, studentCount: 28 },
    { id: 'cls-9', name: 'Kelas XII-MIPA 1', level: 'XII', majorCode: 'MIPA', homeroomTeacher: 'Dra. Ratna Sari Dewi, M.Pd', roomNumber: 'Gedung C - R.301', capacity: 30, studentCount: 29 },
    { id: 'cls-10', name: 'Kelas XII-MIPA 2', level: 'XII', majorCode: 'MIPA', homeroomTeacher: 'Diana Puspitasari, S.Pd., M.Hum', roomNumber: 'Gedung C - R.302', capacity: 30, studentCount: 29 },
    { id: 'cls-11', name: 'Kelas XII-IPS 1', level: 'XII', majorCode: 'IPS', homeroomTeacher: 'Agung Prasetyo, S.Pd', roomNumber: 'Gedung C - R.303', capacity: 30, studentCount: 28 },
    { id: 'cls-12', name: 'Kelas XII-Keagamaan', level: 'XII', majorCode: 'MAK', homeroomTeacher: 'Hj. Siti Maryam, S.Ag., M.Pd', roomNumber: 'Gedung C - R.304', capacity: 30, studentCount: 28 },
  ];

  return {
    settings: {
      schoolName: 'E-Learning MA EL-BAYAN',
      shortName: 'MA EL-BAYAN',
      slogan: 'Madrasah Digital, Generasi Cerdas dan Berakhlak Mulia.',
      nsm: '131232010045',
      npsn: '20278419',
      accreditation: 'Terakreditasi A (Unggul)',
      address: 'Jl. KH. Hasyim Asy\'ari Km. 04, Komplek Pesantren Terpadu El-Bayan, Indonesia',
      phone: '(021) 8945-2104 / 0812-8899-2026',
      email: 'info@maelbayan.sch.id',
      website: 'https://elearning.maelbayan.sch.id',
      headmasterName: 'Hj. Faiqoh Subky, S.H., M.Pd.',
      headmasterNip: '196904121996031002',
      activeAcademicYear: '2025/2026',
      activeSemester: 'Ganjil',
      logoUrl: '/assets/aistudio/images_be5eb3cc.jpeg',
      bannerBuildingUrl: '/assets/aistudio/Modern_Islamic_E-Learning_Dashboard_3dfd0007.png',
      islamicQuote: '“Ilmu adalah cahaya, dan pendidikan adalah jalan menuju kesuksesan.”',
    },
    users: [
      {
        id: 'usr-admin',
        name: 'Ilham Maulana, S.Kom',
        username: 'admin',
        email: 'admin@maelbayan.sch.id',
        role: 'admin',
        roleLabel: 'Admin',
        nipOrNisn: '199205172018011001',
        subjectSpecialty: 'Administrator Sistem & Informatika',
        phone: '0812-3456-7890',
        status: 'Aktif',
        createdAt: '2025-07-01',
        passwordHash: adminPw.hash,
        salt: adminPw.salt,
      },
      {
        id: 'usr-kepsek',
        name: 'Hj. Faiqoh Subky, S.H., M.Pd.',
        username: 'kepsek',
        email: 'kepsek@maelbayan.sch.id',
        role: 'kepsek',
        roleLabel: 'Kepala Madrasah',
        nipOrNisn: '196904121996031002',
        subjectSpecialty: 'Pimpinan Madrasah Aliyah EL-BAYAN',
        phone: '0811-2233-4455',
        avatarUrl: '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png',
        status: 'Aktif',
        createdAt: '2025-07-01',
        passwordHash: kepsekPw.hash,
        salt: kepsekPw.salt,
      },
      {
        id: 'usr-guru',
        name: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        username: 'guru',
        email: 'ridwan@maelbayan.sch.id',
        role: 'guru',
        roleLabel: 'Guru',
        nipOrNisn: '197805142005011003',
        subjectSpecialty: "Al-Qur'an Hadis & Ilmu Tafsir",
        phone: '0812-9988-7766',
        status: 'Aktif',
        createdAt: '2025-07-01',
        passwordHash: guruPw.hash,
        salt: guruPw.salt,
      },
      {
        id: 'usr-siswa',
        name: 'Nabila Azzahra Putri',
        username: 'siswa',
        email: 'nabila.azzahra@maelbayan.sch.id',
        role: 'siswa',
        roleLabel: 'Siswa',
        nipOrNisn: '0084921034',
        className: 'Kelas X-A',
        majorName: 'MIPA / Sains',
        phone: '0857-1122-3344',
        status: 'Aktif',
        createdAt: '2025-07-14',
        passwordHash: siswaPw.hash,
        salt: siswaPw.salt,
      },
    ],
    academicYears: [
      { id: 'ay-1', year: '2025/2026', semester: 'Ganjil', isActive: true, startDate: '2025-07-14', endDate: '2025-12-20' },
      { id: 'ay-2', year: '2025/2026', semester: 'Genap', isActive: false, startDate: '2026-01-05', endDate: '2026-06-20' },
      { id: 'ay-3', year: '2024/2025', semester: 'Genap', isActive: false, startDate: '2025-01-06', endDate: '2025-06-21' },
    ],
    majors: [
      { id: 'mjr-1', code: 'MIPA', name: 'Matematika dan Ilmu Pengetahuan Alam (MIPA)', headOfMajor: 'Hendra Kusuma, S.Pd., M.Si', description: 'Fokus penguasaan sains, riset laboratorium, matematika, teknologi, dan integrasi ayat-ayat kauniyah Al-Qur\'an.', studentCount: 174 },
      { id: 'mjr-2', code: 'IPS', name: 'Ilmu Pengetahuan Sosial & Ekonomi Syariah (IPS)', headOfMajor: 'Taufik Hidayat, S.E., M.M.', description: 'Fokus studi ekonomi Islam, sosiologi masyarakat, geografi, kewirausahaan, dan kepemimpinan.', studentCount: 84 },
      { id: 'mjr-3', code: 'MAK', name: 'Keagamaan / Madrasah Aliyah Keagamaan (MAK)', headOfMajor: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I', description: 'Pendalaman التراث الإسلامي (Kitab Kuning), Ilmu Tafsir, Ilmu Hadis, Ushul Fikih, Bahasa Arab Aktif, dan Tahfidz Al-Qur\'an.', studentCount: 84 },
    ],
    classes,
    subjects,
    teachers: generateInitialTeachers(),
    students: generateInitialStudents(),
    materials: [
      {
        id: 'mat-1',
        title: "Keautentikan Al-Qur'an dan Kemukjizatannya (I'jazul Qur'an)",
        subjectName: "Al-Qur'an Hadis",
        className: 'Kelas X-A',
        teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        category: 'Modul PDF',
        description: "Pembahasan lengkap mengenai sejarah kodifikasi Al-Qur'an pada masa Khulafaur Rasyidin serta bukti kemukjizatan bahasa dan ilmiah dalam Al-Qur'an.",
        contentSummary: "1. Pengertian I'jazul Qur'an secara etimologi dan terminologi ulama tafsir.\n2. Aspek kemukjizatan kebahasaan (Balaghah & الفصاحة), pemberitaan ghaib, dan isyarat ilmiah (Ayat Kauniyah).\n3. Dalil Naqli QS. Al-Isra: 88, QS. Al-Baqarah: 23-24, dan QS. Al-Hijr: 9 tentang penjagaan Allah SWT terhadap kemurnian Al-Qur'an.",
        fileName: 'Modul_Bab1_Keautentikan_AlQuran_KelasX.pdf',
        fileSize: '2.4 MB',
        downloads: 128,
        views: 312,
        createdAt: '2025-12-01',
      },
      {
        id: 'mat-2',
        title: 'Kaidah Ushul Fikih & Konsep Ibadah Mahdhah serta Ghairu Mahdhah',
        subjectName: 'Fikih',
        className: 'Kelas X-A',
        teacherName: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I',
        category: 'Kitab & Referensi',
        description: 'Kajian fikih ibadah berdasarkan empat mazhab serta penerapan kaidah fikih dalam kehidupan modern.',
        contentSummary: "1. Perbedaan karakteristik Ibadah Mahdhah (Thaharah, Shalat, Zakat, Puasa, Haji) dan Ibadah Muamalah.\n2. Lima Kaidah Asasiyah Fikih (Al-Qawa'id Al-Fiqhiyyah Al-Kubra): Al-Umuru bi Maqashidiha, Al-Yaqinu La Yuzalu bis-Syak, Al-Masyaqqatu Tajlibut-Taisir, Ad-Dhararu Yuzal, Al-'Adatu Muhakkamah.",
        fileName: 'Kitab_Fikih_Ibadah_dan_Qawaid_MA_ElBayan.pdf',
        fileSize: '3.1 MB',
        downloads: 96,
        views: 245,
        createdAt: '2025-12-03',
      },
      {
        id: 'mat-3',
        title: 'Fungsi Eksponensial, Logaritma, dan Aplikasi pada Perhitungan Zakat & Waris',
        subjectName: 'Matematika',
        className: 'Kelas X-A',
        teacherName: 'Hendra Kusuma, S.Pd., M.Si',
        category: 'Presentasi',
        description: 'Materi interaktif persamaan eksponen, sifat-sifat logaritma, grafik fungsi, dan latihan soal HOTS.',
        contentSummary: '1. Sifat-sifat pangkat bulat dan rasional.\n2. Grafik fungsi eksponen f(x) = a^x.\n3. Definisi dan sifat-sifat logaritma beserta penyelesaian persamaan logaritma.',
        fileName: 'Slide_Eksponen_dan_Logaritma_KelasX.pdf',
        fileSize: '1.8 MB',
        downloads: 142,
        views: 340,
        createdAt: '2025-12-04',
      },
      {
        id: 'mat-4',
        title: 'Hukum Newton tentang Gerak dan Gravitasi Semesta',
        subjectName: 'Fisika',
        className: 'Kelas X-A',
        teacherName: 'Bambang Suryono, S.Si., M.Pd',
        category: 'Video Pembelajaran',
        description: 'Penjelasan dinamika partikel, diagram benda bebas, gaya gesek, serta keteraturan orbit planet sebagai tanda kebesaran Allah SWT (QS. Yasin: 38-40).',
        contentSummary: '1. Hukum I Newton (Inersia/Kelembaman): ∑F = 0.\n2. Hukum II Newton: a = ∑F / m.\n3. Hukum III Newton (Aksi-Reaksi) dan aplikasi pada bidang miring serta sistem katrol.',
        fileName: 'Panduan_Praktikum_Hukum_Newton_ElBayan.pdf',
        fileSize: '4.5 MB',
        downloads: 89,
        views: 210,
        createdAt: '2025-12-05',
      },
      {
        id: 'mat-5',
        title: 'Qawaid Nahwu & Sharaf: Jumlah Ismiyyah dan Jumlah Fi\'liyyah',
        subjectName: 'Bahasa Arab',
        className: 'Kelas X-A',
        teacherName: 'Ustadz Mahmud Yunus, Lc., M.A.',
        category: 'Modul PDF',
        description: 'Panduan praktis menyusun kalimat bahasa Arab fusha (Mubtada-Khabar dan Fi\'il-Fa\'il-Maf\'ul Bih) disertai hiwar sehari-hari.',
        contentSummary: '1. Struktur Jumlah Ismiyyah (المبتدأ والخبر) dan kesesuaian mudzakkar-muannats.\n2. Struktur Jumlah Fi\'liyyah (الفعل والفاعل والمفعول به).\n3. Kosa kata (Mufradat) lingkungan madrasah dan perpustakaan.',
        fileName: 'Modul_Bahasa_Arab_Nahwu_Sharaf_KelasX.pdf',
        fileSize: '2.9 MB',
        downloads: 114,
        views: 278,
        createdAt: '2025-12-06',
      },
      {
        id: 'mat-6',
        title: 'Teks Laporan Hasil Observasi & Teks Eksposisi Kritis',
        subjectName: 'Bahasa Indonesia',
        className: 'Kelas X-A',
        teacherName: 'Dra. Ratna Sari Dewi, M.Pd',
        category: 'Modul PDF',
        description: 'Kaidah kebahasaan, struktur tesis-argumentasi-penegasan ulang, dan penulisan karya ilmiah remaja.',
        contentSummary: '1. Struktur Teks LHO: Pernyataan Umum, Deskripsi Bagian, Deskripsi Manfaat.\n2. Struktur Teks Eksposisi: Tesis, Rangkaian Argumen Fakta, Penegasan Ulang.',
        fileName: 'Modul_Bahasa_Indonesia_Bab3_Eksposisi.pdf',
        fileSize: '1.6 MB',
        downloads: 105,
        views: 230,
        createdAt: '2025-12-07',
      },
    ],
    assignments: [
      {
        id: 'asg-1',
        title: 'Latihan Soal Fungsi Eksponen & Logaritma Terapan',
        subjectName: 'Matematika',
        className: 'Kelas X-A',
        teacherName: 'Hendra Kusuma, S.Pd., M.Si',
        dueDate: '2025-12-12',
        description: 'Kerjakan 10 soal uraian pada Modul Bab 3 halaman 45-47. Tuliskan langkah penyelesaian secara sistematis dan unggah dalam format PDF atau ketik langsung pada lembar jawaban.',
        maxScore: 100,
        attachmentName: 'Soal_Tugas_Matematika_Eksponen_X-A.pdf',
        createdAt: '2025-12-06',
        submissions: [
          {
            id: 'subm-1',
            assignmentId: 'asg-1',
            studentId: 'std-1',
            studentName: 'Nabila Azzahra Putri',
            studentNisn: '0084921034',
            className: 'Kelas X-A',
            submittedAt: '2025-12-08 09:15 WIB',
            answerText: 'Alhamdulillah saya telah menyelesaikan 10 soal persamaan eksponen dan logaritma beserta grafik fungsinya secara lengkap.',
            fileName: 'Jawaban_Matematika_Nabila_Azzahra_XA.pdf',
            score: 94,
            feedback: 'MasyaAllah, langkah penyelesaian sangat rapi dan tepat. Pertahankan!',
            status: 'Dinilai',
          },
          {
            id: 'subm-2',
            assignmentId: 'asg-1',
            studentId: 'std-2',
            studentName: 'Muhammad Farhan Al-Fatih',
            studentNisn: '0084921035',
            className: 'Kelas X-A',
            submittedAt: '2025-12-08 11:40 WIB',
            answerText: 'Berikut lampiran tugas Matematika Bab Eksponen dan Logaritma nomor 1 s.d. 10.',
            fileName: 'Tugas_Farhan_AlFatih_Matematika.pdf',
            score: null,
            feedback: '',
            status: 'Terkumpul',
          },
        ],
      },
      {
        id: 'asg-2',
        title: "Analisis Sanad dan Matan Hadis tentang Menuntut Ilmu",
        subjectName: "Al-Qur'an Hadis",
        className: 'Kelas X-A',
        teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        dueDate: '2025-12-14',
        description: 'Tuliskan teks Arab, terjemahan, kosakata (mufradat), serta analisis kandungan Hadis Riwayat Muslim tentang keutamaan menuntut ilmu (Man salaka thariqan yaltamisu fihi ilman...).',
        maxScore: 100,
        attachmentName: 'Lembar_Kerja_Analisis_Hadis_KelasX.pdf',
        createdAt: '2025-12-07',
        submissions: [
          {
            id: 'subm-3',
            assignmentId: 'asg-2',
            studentId: 'std-1',
            studentName: 'Nabila Azzahra Putri',
            studentNisn: '0084921034',
            className: 'Kelas X-A',
            submittedAt: '2025-12-08 13:20 WIB',
            answerText: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ (HR. Muslim). Kandungan hadis menjelaskan 4 keutamaan majelis ilmu dan kemudahan jalan menuju surga.',
            fileName: 'Analisis_Hadis_Nabila_Azzahra.pdf',
            score: 96,
            feedback: 'Barakallahu fiik, penulisan khat Arab dan syarah hadis sangat komprehensif.',
            status: 'Dinilai',
          },
        ],
      },
      {
        id: 'asg-3',
        title: 'Laporan Praktikum Hukum II Newton & Gaya Gesek',
        subjectName: 'Fisika',
        className: 'Kelas X-A',
        teacherName: 'Bambang Suryono, S.Si., M.Pd',
        dueDate: '2025-12-15',
        description: 'Susun laporan hasil praktikum dinamika gerak menggunakan kereta dinamika di laboratorium IPA MA EL-BAYAN lengkap dengan tabel data pengamatan dan kesimpulan.',
        maxScore: 100,
        attachmentName: 'Format_Laporan_Praktikum_Fisika.docx',
        createdAt: '2025-12-08',
        submissions: [],
      },
    ],
    exams: [
      {
        id: 'exm-1',
        title: "Ujian Akhir Semester (PAS) Ganjil — Al-Qur'an Hadis",
        subjectName: "Al-Qur'an Hadis",
        className: 'Kelas X-A',
        teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        examType: 'UAS / PAS',
        durationMinutes: 60,
        date: '2025-12-15',
        startTime: '07:30 WIB',
        passingScore: 78,
        status: 'Aktif',
        questions: [
          {
            id: 'q-1',
            type: 'pg',
            questionText: "Secara terminologi ulama, firman Allah SWT yang diturunkan kepada Nabi Muhammad SAW melalui Malaikat Jibril secara mutawatir dan membacanya bernilai ibadah disebut...",
            arabicText: "الْقُرْآنُ هُوَ كَلَامُ اللَّهِ الْمُعْجِزُ الْمُنَزَّلُ عَلَى خَاتَمِ الْأَنْبِيَاءِ وَالْمُرْسَلِينَ",
            options: {
              A: "Al-Qur'an Al-Karim",
              B: 'Hadis Qudsi',
              C: 'Hadis Nabawi Mutawatir',
              D: 'Shuhuf Ibrahim dan Musa',
              E: 'Tafsir Bil Ma\'tsur',
            },
            correctOption: 'A',
            points: 20,
          },
          {
            id: 'q-2',
            type: 'pg',
            questionText: "Ayat Al-Qur'an yang menegaskan jaminan langsung dari Allah SWT atas kemurnian dan keautentikan Al-Qur'an sepanjang masa terdapat dalam...",
            arabicText: "إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ",
            options: {
              A: 'QS. Al-Baqarah ayat 2',
              B: 'QS. Al-Hijr ayat 9',
              C: 'QS. Al-Alaq ayat 1-5',
              D: 'QS. Al-Maidah ayat 3',
              E: 'QS. Al-Furqan ayat 1',
            },
            correctOption: 'B',
            points: 20,
          },
          {
            id: 'q-3',
            type: 'pg',
            questionText: "Pengumpulan dan pembukuan mushaf Al-Qur'an dalam satu mushaf standar (Mushaf Al-Imam / Rasm Utsmani) dilaksanakan pada masa pemerintahan khalifah...",
            options: {
              A: 'Abu Bakar Ash-Shiddiq r.a.',
              B: 'Umar bin Khattab r.a.',
              C: 'Utsman bin Affan r.a.',
              D: 'Ali bin Abi Thalib كرم الله وجهه',
              E: 'Umar bin Abdul Aziz r.a.',
            },
            correctOption: 'C',
            points: 20,
          },
          {
            id: 'q-4',
            type: 'pg',
            questionText: 'Unsur-unsur pokok dalam penelitian kesahihan suatu hadis meliputi tiga komponen utama, yaitu...',
            options: {
              A: 'Sanad, Matan, dan Mukharrij (Rawi)',
              B: 'Asbabun Nuzul, Makkiyah, dan Madaniyah',
              C: 'Tafsir, Takwil, dan Terjemah',
              D: 'Qiyas, Ijma, dan Istihsan',
              E: 'Mubtada, Khabar, dan Fa\'il',
            },
            correctOption: 'A',
            points: 20,
          },
          {
            id: 'q-5',
            type: 'essay',
            questionText: "Jelaskan minimal 3 (tiga) aspek kemukjizatan Al-Qur'an (I'jazul Qur'an) beserta contoh konkret pada aspek kebahasaan dan isyarat ilmiah (sains modern)!",
            points: 20,
          },
        ],
        attempts: [
          {
            id: 'att-1',
            examId: 'exm-1',
            studentId: 'std-2',
            studentName: 'Muhammad Farhan Al-Fatih',
            className: 'Kelas X-A',
            startedAt: '2025-12-08 08:00',
            submittedAt: '2025-12-08 08:42',
            pgScore: 80,
            essayScore: 18,
            totalScore: 98,
            answers: {
              'q-1': 'A',
              'q-2': 'B',
              'q-3': 'C',
              'q-4': 'A',
              'q-5': '1. Kemukjizatan Bahasa (Balaghah): susunan lafadz dan makna yang tidak tertandingi. 2. Pemberitaan Ghaib masa lalu & masa depan (kemenangan Romawi dalam QS Ar-Rum). 3. Isyarat Ilmiah: proses embriologi manusia (QS Al-Mu\'minun: 12-14) dan meluasnya alam semesta (QS Adz-Dzariyat: 47).',
            },
            status: 'Selesai Dinilai',
          },
        ],
      },
      {
        id: 'exm-2',
        title: 'Kuis Evaluasi Bab Eksponen & Logaritma — Matematika',
        subjectName: 'Matematika',
        className: 'Kelas X-A',
        teacherName: 'Hendra Kusuma, S.Pd., M.Si',
        examType: 'Ulangan Harian',
        durationMinutes: 45,
        date: '2025-12-10',
        startTime: '09:00 WIB',
        passingScore: 75,
        status: 'Aktif',
        questions: [
          {
            id: 'qm-1',
            type: 'pg',
            questionText: 'Nilai x yang memenuhi persamaan eksponen 2^(2x - 1) = 32 adalah...',
            options: {
              A: 'x = 2',
              B: 'x = 3',
              C: 'x = 4',
              D: 'x = 5',
              E: 'x = 6',
            },
            correctOption: 'B',
            points: 30,
          },
          {
            id: 'qm-2',
            type: 'pg',
            questionText: 'Hasil dari ²log 24 + ²log 3 - ²log 9 adalah...',
            options: {
              A: '2',
              B: '3',
              C: '4',
              D: '5',
              E: '8',
            },
            correctOption: 'B',
            points: 30,
          },
          {
            id: 'qm-3',
            type: 'essay',
            questionText: 'Suatu modal tabungan mudharabah di Bank Syariah sebesar Rp10.000.000 berkembang mengikuti fungsi M(t) = M₀ · (1,05)^t. Tuliskan rumus dan hitung perkiraan nilai tabungan setelah t = 2 tahun!',
            points: 40,
          },
        ],
        attempts: [],
      },
      {
        id: 'exm-3',
        title: 'Ujian Akhir Semester (PAS) Ganjil — Fikih Ibadah & Muamalah',
        subjectName: 'Fikih',
        className: 'Kelas X-A',
        teacherName: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I',
        examType: 'UAS / PAS',
        durationMinutes: 60,
        date: '2025-12-16',
        startTime: '10:00 WIB',
        passingScore: 78,
        status: 'Aktif',
        questions: [
          {
            id: 'qf-1',
            type: 'pg',
            questionText: 'Air suci dan menyucikan (Air Muthlaq) yang dapat digunakan untuk bersuci (wudhu dan mandi wajib) berjumlah...',
            options: {
              A: '3 macam air',
              B: '5 macam air',
              C: '7 macam air',
              D: '9 macam air',
              E: '10 macam air',
            },
            correctOption: 'C',
            points: 50,
          },
          {
            id: 'qf-2',
            type: 'essay',
            questionText: 'Jelaskan syarat wajib dan syarat sah zakat mal beserta ketentuan nisab dan haul emas/perak!',
            points: 50,
          },
        ],
        attempts: [],
      },
    ],
    attendance: [
      {
        id: 'attd-1',
        date: '2025-12-08',
        className: 'Kelas X-A',
        subjectName: "Al-Qur'an Hadis",
        teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        topic: "Pertemuan 14: Kemukjizatan Al-Qur'an & Diskusi Kelompok",
        entries: [
          { studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', status: 'Hadir', note: 'Tepat waktu & aktif berdiskusi' },
          { studentId: 'std-2', nisn: '0084921035', studentName: 'Muhammad Farhan Al-Fatih', status: 'Hadir', note: 'Hadir tepat waktu' },
          { studentId: 'std-3', nisn: '0084921036', studentName: 'Siti Aisyah Humaira', status: 'Hadir', note: 'Hadir tepat waktu' },
          { studentId: 'std-4', nisn: '0084921037', studentName: 'Ahmad Zaki Mubarak', status: 'Hadir', note: 'Hadir tepat waktu' },
          { studentId: 'std-5', nisn: '0084921038', studentName: 'Khansa Nadia Syakira', status: 'Izin', note: 'Mengikuti lomba MTQ Tingkat Kabupaten' },
          { studentId: 'std-6', nisn: '0084921039', studentName: 'Rizky Ramadhan Pratama', status: 'Hadir', note: 'Hadir tepat waktu' },
          { studentId: 'std-7', nisn: '0084921040', studentName: 'Fatimah Az-Zahra', status: 'Hadir', note: 'Hadir tepat waktu' },
          { studentId: 'std-8', nisn: '0084921041', studentName: 'Luthfi Maulana Ibrahim', status: 'Sakit', note: 'Surat keterangan dokter klinik pesantren' },
        ],
      },
      {
        id: 'attd-2',
        date: '2025-12-08',
        className: 'Kelas X-A',
        subjectName: 'Matematika',
        teacherName: 'Hendra Kusuma, S.Pd., M.Si',
        topic: 'Pertemuan 14: Persamaan dan Pertidaksamaan Logaritma',
        entries: [
          { studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-2', nisn: '0084921035', studentName: 'Muhammad Farhan Al-Fatih', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-3', nisn: '0084921036', studentName: 'Siti Aisyah Humaira', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-4', nisn: '0084921037', studentName: 'Ahmad Zaki Mubarak', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-5', nisn: '0084921038', studentName: 'Khansa Nadia Syakira', status: 'Izin', note: 'Dispensasi MTQ Kabupaten' },
          { studentId: 'std-6', nisn: '0084921039', studentName: 'Rizky Ramadhan Pratama', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-7', nisn: '0084921040', studentName: 'Fatimah Az-Zahra', status: 'Hadir', note: 'Hadir' },
          { studentId: 'std-8', nisn: '0084921041', studentName: 'Luthfi Maulana Ibrahim', status: 'Sakit', note: 'Sakit' },
        ],
      },
    ],
    grades: [
      { id: 'grd-1', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: "Al-Qur'an Hadis", semester: 'Ganjil 2025/2026', tugasScore: 95, uhScore: 92, utsScore: 94, uasScore: 96, finalScore: 94.3, predicate: 'A', description: 'Sangat baik dalam memahami keautentikan Al-Qur\'an, tajwid, dan analisis sanad-matan hadis.' },
      { id: 'grd-2', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: 'Akidah Akhlak', semester: 'Ganjil 2025/2026', tugasScore: 94, uhScore: 90, utsScore: 92, uasScore: 95, finalScore: 92.8, predicate: 'A', description: 'Sangat baik dalam mengamalkan sifat terpuji, adab terhadap orang tua dan guru.' },
      { id: 'grd-3', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: 'Fikih', semester: 'Ganjil 2025/2026', tugasScore: 92, uhScore: 89, utsScore: 91, uasScore: 93, finalScore: 91.3, predicate: 'A', description: 'Mampu mempraktikkan fikih ibadah thaharah, shalat, dan pengurusan jenazah dengan tepat.' },
      { id: 'grd-4', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: 'Bahasa Arab', semester: 'Ganjil 2025/2026', tugasScore: 90, uhScore: 88, utsScore: 90, uasScore: 92, finalScore: 90.0, predicate: 'A', description: 'Mahir dalam hiwar bahasa Arab fusha dan kaidah nahwu-sharaf dasar.' },
      { id: 'grd-5', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: 'Matematika', semester: 'Ganjil 2025/2026', tugasScore: 94, uhScore: 88, utsScore: 90, uasScore: 92, finalScore: 91.0, predicate: 'A', description: 'Sangat baik dalam menyelesaikan masalah fungsi eksponen dan logaritma.' },
      { id: 'grd-6', studentId: 'std-1', nisn: '0084921034', studentName: 'Nabila Azzahra Putri', className: 'Kelas X-A', subjectName: 'Fisika', semester: 'Ganjil 2025/2026', tugasScore: 89, uhScore: 86, utsScore: 88, uasScore: 90, finalScore: 88.3, predicate: 'B', description: 'Baik dalam menerapkan konsep pengukuran, vektor, dan dinamika Hukum Newton.' },
      { id: 'grd-7', studentId: 'std-2', nisn: '0084921035', studentName: 'Muhammad Farhan Al-Fatih', className: 'Kelas X-A', subjectName: "Al-Qur'an Hadis", semester: 'Ganjil 2025/2026', tugasScore: 96, uhScore: 94, utsScore: 95, uasScore: 98, finalScore: 95.8, predicate: 'A', description: 'Hafalan dalil sangat kuat dan pemahaman ilmu hadis sangat unggul.' },
      { id: 'grd-8', studentId: 'std-2', nisn: '0084921035', studentName: 'Muhammad Farhan Al-Fatih', className: 'Kelas X-A', subjectName: 'Matematika', semester: 'Ganjil 2025/2026', tugasScore: 90, uhScore: 87, utsScore: 89, uasScore: 91, finalScore: 89.3, predicate: 'B', description: 'Pemahaman konsep aljabar dan logaritma sangat baik.' },
      { id: 'grd-9', studentId: 'std-3', nisn: '0084921036', studentName: 'Siti Aisyah Humaira', className: 'Kelas X-A', subjectName: "Al-Qur'an Hadis", semester: 'Ganjil 2025/2026', tugasScore: 91, uhScore: 89, utsScore: 90, uasScore: 92, finalScore: 90.5, predicate: 'A', description: 'Sangat baik dalam tartil dan penguasaan materi kemukjizatan Al-Qur\'an.' },
      { id: 'grd-10', studentId: 'std-4', nisn: '0084921037', studentName: 'Ahmad Zaki Mubarak', className: 'Kelas X-A', subjectName: "Al-Qur'an Hadis", semester: 'Ganjil 2025/2026', tugasScore: 86, uhScore: 84, utsScore: 85, uasScore: 88, finalScore: 85.8, predicate: 'B', description: 'Baik dalam menguraikan sejarah kodifikasi Al-Qur\'an.' },
    ],
    schedules: [
      { id: 'sch-1', day: 'Senin', startTime: '07:00', endTime: '08:40', subjectName: 'Matematika', className: 'Kelas X-A', teacherName: 'Hendra Kusuma, S.Pd., M.Si', room: 'R.101', colorDot: 'emerald' },
      { id: 'sch-2', day: 'Senin', startTime: '08:50', endTime: '10:30', subjectName: 'Bahasa Indonesia', className: 'Kelas X-A', teacherName: 'Dra. Ratna Sari Dewi, M.Pd', room: 'R.101', colorDot: 'blue' },
      { id: 'sch-3', day: 'Senin', startTime: '10:40', endTime: '12:20', subjectName: 'Fisika', className: 'Kelas X-A', teacherName: 'Bambang Suryono, S.Si., M.Pd', room: 'Lab IPA 1', colorDot: 'amber' },
      { id: 'sch-4', day: 'Senin', startTime: '13:00', endTime: '14:40', subjectName: "Al-Qur'an Hadis", className: 'Kelas X-A', teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag', room: 'R.101', colorDot: 'purple' },
      { id: 'sch-5', day: 'Selasa', startTime: '07:00', endTime: '08:40', subjectName: 'Bahasa Arab', className: 'Kelas X-A', teacherName: 'Ustadz Mahmud Yunus, Lc., M.A.', room: 'R.101', colorDot: 'emerald' },
      { id: 'sch-6', day: 'Selasa', startTime: '08:50', endTime: '10:30', subjectName: 'Fikih', className: 'Kelas X-A', teacherName: 'KH. Ahmad Baihaqi, S.Ag., M.Pd.I', room: 'R.101', colorDot: 'blue' },
      { id: 'sch-7', day: 'Selasa', startTime: '10:40', endTime: '12:20', subjectName: 'Kimia', className: 'Kelas X-A', teacherName: 'Nurul Hidayati, S.Pd., M.Sc', room: 'Lab Kimia', colorDot: 'amber' },
      { id: 'sch-8', day: 'Rabu', startTime: '07:00', endTime: '08:40', subjectName: 'Akidah Akhlak', className: 'Kelas X-A', teacherName: 'Hj. Siti Maryam, S.Ag., M.Pd', room: 'R.101', colorDot: 'emerald' },
      { id: 'sch-9', day: 'Rabu', startTime: '08:50', endTime: '10:30', subjectName: 'Biologi', className: 'Kelas X-A', teacherName: 'Dr. Rina Wulandari, M.Pd', room: 'Lab Biologi', colorDot: 'blue' },
      { id: 'sch-10', day: 'Kamis', startTime: '07:00', endTime: '08:40', subjectName: 'Sejarah Kebudayaan Islam (SKI)', className: 'Kelas X-A', teacherName: 'Ustadz Abdul Aziz, S.Hum., M.Pd.I', room: 'R.101', colorDot: 'emerald' },
      { id: 'sch-11', day: 'Kamis', startTime: '08:50', endTime: '10:30', subjectName: 'Bahasa Inggris', className: 'Kelas X-A', teacherName: 'Diana Puspitasari, S.Pd., M.Hum', room: 'Lab Bahasa', colorDot: 'blue' },
      { id: 'sch-12', day: 'Jumat', startTime: '07:00', endTime: '08:40', subjectName: "Tahfidz Al-Qur'an", className: 'Kelas X-A', teacherName: 'Ustadz Syarif Hidayatullah, Al-Hafidz', room: 'Masjid Al-Bayan', colorDot: 'emerald' },
      { id: 'sch-13', day: 'Jumat', startTime: '09:00', endTime: '10:40', subjectName: 'Informatika', className: 'Kelas X-A', teacherName: 'Ilham Maulana, S.Kom', room: 'Lab Komputer', colorDot: 'purple' },
      { id: 'sch-14', day: 'Sabtu', startTime: '07:00', endTime: '08:40', subjectName: 'Ushul Fikih', className: 'Kelas XI-Keagamaan', teacherName: 'Ustadz H. Zainuddin, Lc.', room: 'R.204', colorDot: 'amber' },
    ],
    forums: [
      {
        id: 'frm-1',
        title: "Diskusi Makna Kemukjizatan Ilmiah (I'jaz 'Ilmi) dalam QS. Al-Anbiya Ayat 30",
        subjectName: "Al-Qur'an Hadis",
        className: 'Kelas X-A',
        authorName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
        authorRole: 'guru',
        content: "Assalamu'alaikum warahmatullahi wabarakatuh anak-anakku kelas X-A. Silakan kemukakan pendapat kalian mengenai korelasi antara firman Allah SWT dalam QS. Al-Anbiya ayat 30 (tentang langit dan bumi yang dulunya suatu yang padu lalu dipisahkan, dan dari air Kami jadikan segala sesuatu yang hidup) dengan temuan sains astronomi & biologi modern!",
        createdAt: '2 jam lalu',
        likes: 24,
        isPinned: true,
        replies: [
          {
            id: 'rep-1',
            authorName: 'Nabila Azzahra Putri',
            authorRole: 'siswa',
            content: "Wa'alaikumussalam warahmatullahi wabarakatuh Ustadz. Menurut literatur yang saya baca, kata 'Ratqan' (padu) lalu 'Fataqnahuma' (Kami pisahkan keduanya) sangat selaras dengan teori mengembangnya alam semesta (Expanding Universe / Big Bang), serta fakta biologi bahwa sitoplasma sel makhluk hidup tersusun atas 70-80% air.",
            createdAt: '1 jam lalu',
          },
          {
            id: 'rep-2',
            authorName: 'Muhammad Farhan Al-Fatih',
            authorRole: 'siswa',
            content: "Izin menambahkan Ustadz, hal ini membuktikan bahwa Al-Qur'an bukanlah karangan manusia karena diturunkan pada abad ke-7 Masehi jauh sebelum teleskop dan mikroskop modern ditemukan.",
            createdAt: '45 menit lalu',
          },
        ],
      },
      {
        id: 'frm-2',
        title: 'Tanya Jawab Persiapan Ujian Semester Ganjil Matematika (Eksponen & Logaritma)',
        subjectName: 'Matematika',
        className: 'Kelas X-A',
        authorName: 'Hendra Kusuma, S.Pd., M.Si',
        authorRole: 'guru',
        content: 'Silakan tanyakan bagian soal latihan pada modul Eksponen & Logaritma yang masih dirasa sulit sebelum pelaksanaan PAS minggu depan.',
        createdAt: '1 hari lalu',
        likes: 18,
        isPinned: false,
        replies: [
          {
            id: 'rep-3',
            authorName: 'Siti Aisyah Humaira',
            authorRole: 'siswa',
            content: 'Pak Hendra, untuk pertidaksamaan logaritma dengan basis 0 < a < 1, tanda pertidaksamaannya dibalik ya Pak ketika menentukan himpunan penyelesaian?',
            createdAt: '20 jam lalu',
          },
          {
            id: 'rep-4',
            authorName: 'Hendra Kusuma, S.Pd., M.Si',
            authorRole: 'guru',
            content: 'Betul sekali Aisyah! Karena fungsi logaritma dengan basis 0 < a < 1 adalah fungsi turun, maka tanda pertidaksamaan wajib dibalik dan jangan lupa syarat numerus f(x) > 0.',
            createdAt: '18 jam lalu',
          },
        ],
      },
    ],
    announcements: [
      {
        id: 'ann-1',
        title: 'Informasi Ujian Semester Ganjil 2025/2026',
        content: 'Pelaksanaan ujian semester akan dilaksanakan pada tanggal 15 – 20 Desember 2025 secara berbasis komputer (CBT E-Learning MA EL-BAYAN). Seluruh siswa diharapkan memastikan akun aktif dan menyelesaikan seluruh tugas mata pelajaran.',
        category: 'Ujian',
        authorName: 'Ilham Maulana, S.Kom (Wakamad Kurikulum & TI)',
        targetRole: 'Semua',
        relativeTime: '2 jam lalu',
        date: '2025-12-08',
        colorDot: 'emerald',
      },
      {
        id: 'ann-2',
        title: 'Pengumpulan Tugas Matematika',
        content: 'Tugas wajib dikumpulkan paling lambat hari Jumat, 12 Desember 2025 pukul 23:59 WIB melalui menu Tugas Online.',
        category: 'Tugas',
        authorName: 'Hendra Kusuma, S.Pd., M.Si',
        targetRole: 'Siswa',
        relativeTime: '1 hari lalu',
        date: '2025-12-07',
        colorDot: 'blue',
      },
      {
        id: 'ann-3',
        title: 'Kegiatan Pondok Ramadhan',
        content: 'Mari ikuti kegiatan Pondok Ramadhan yang akan dilaksanakan 10 – 15 Maret 2026 meliputi Kajian Kitab Turats, Tahsin & Tahfidz Al-Qur\'an, serta Bakti Sosial.',
        category: 'Kegiatan',
        authorName: 'Hj. Faiqoh Subky, S.H., M.Pd.',
        targetRole: 'Semua',
        relativeTime: '2 hari lalu',
        date: '2025-12-06',
        colorDot: 'amber',
      },
      {
        id: 'ann-4',
        title: 'Rapat Dewan Guru & Evaluasi Akademik Semester Ganjil',
        content: 'Diberitahukan kepada seluruh Bapak/Ibu Dewan Guru MA EL-BAYAN bahwa batas akhir pengisian nilai rapor digital (ARD) adalah tanggal 21 Desember 2025.',
        category: 'Akademik',
        authorName: 'Hj. Faiqoh Subky, S.H., M.Pd.',
        targetRole: 'Guru',
        relativeTime: '3 hari lalu',
        date: '2025-12-05',
        colorDot: 'purple',
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'Jadwal PAS Semester Ganjil Dirilis',
        message: 'Pelaksanaan ujian semester ganjil dimulai 15 Desember 2025.',
        time: '15 menit lalu',
        isRead: false,
        linkTab: 'pengumuman',
      },
      {
        id: 'notif-2',
        title: 'Pengumpulan Tugas Baru: Matematika',
        message: 'Muhammad Farhan Al-Fatih mengumpulkan Tugas Eksponen & Logaritma.',
        time: '1 jam lalu',
        isRead: false,
        linkTab: 'tugas-ujian',
      },
      {
        id: 'notif-3',
        title: 'Balasan Baru di Forum Al-Qur\'an Hadis',
        message: 'Nabila Azzahra Putri membalas diskusi I\'jazul Qur\'an.',
        time: '2 jam lalu',
        isRead: false,
        linkTab: 'forum',
      },
    ],
    activityChart: {
      '7d': [
        { day: 'Sen', aksesMateri: 145, pengumpulanTugas: 90, ujianOnline: 35 },
        { day: 'Sel', aksesMateri: 265, pengumpulanTugas: 182, ujianOnline: 105 },
        { day: 'Rab', aksesMateri: 288, pengumpulanTugas: 220, ujianOnline: 150 },
        { day: 'Kam', aksesMateri: 255, pengumpulanTugas: 175, ujianOnline: 98 },
        { day: 'Jum', aksesMateri: 368, pengumpulanTugas: 290, ujianOnline: 182 },
        { day: 'Sab', aksesMateri: 302, pengumpulanTugas: 224, ujianOnline: 144 },
        { day: 'Min', aksesMateri: 270, pengumpulanTugas: 195, ujianOnline: 120 },
      ],
      '30d': [
        { day: 'Mgg 1', aksesMateri: 820, pengumpulanTugas: 540, ujianOnline: 210 },
        { day: 'Mgg 2', aksesMateri: 1120, pengumpulanTugas: 790, ujianOnline: 430 },
        { day: 'Mgg 3', aksesMateri: 1340, pengumpulanTugas: 960, ujianOnline: 590 },
        { day: 'Mgg 4', aksesMateri: 1680, pengumpulanTugas: 1240, ujianOnline: 834 },
      ],
      'semester': [
        { day: 'Jul', aksesMateri: 1950, pengumpulanTugas: 1100, ujianOnline: 420 },
        { day: 'Agu', aksesMateri: 2480, pengumpulanTugas: 1650, ujianOnline: 780 },
        { day: 'Sep', aksesMateri: 3120, pengumpulanTugas: 2240, ujianOnline: 1450 },
        { day: 'Okt', aksesMateri: 2890, pengumpulanTugas: 1980, ujianOnline: 1120 },
        { day: 'Nov', aksesMateri: 3450, pengumpulanTugas: 2680, ujianOnline: 1690 },
        { day: 'Des', aksesMateri: 3890, pengumpulanTugas: 3120, ujianOnline: 2340 },
      ],
    },
  };
}

let cachedDb: DatabaseSchema | null = null;

export function getDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw) as DatabaseSchema;
      let changed = false;
      const adminUser = cachedDb.users.find((u) => u.id === 'usr-admin' || u.role === 'admin');
      if (adminUser && adminUser.name !== 'Ilham Maulana, S.Kom') {
        adminUser.name = 'Ilham Maulana, S.Kom';
        changed = true;
      }
      const kepsekUser = cachedDb.users.find((u) => u.id === 'usr-kepsek' || u.role === 'kepsek');
      if (kepsekUser) {
        if (kepsekUser.name !== 'Hj. Faiqoh Subky, S.H., M.Pd.') {
          kepsekUser.name = 'Hj. Faiqoh Subky, S.H., M.Pd.';
          changed = true;
        }
        if (kepsekUser.avatarUrl !== '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png') {
          kepsekUser.avatarUrl = '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png';
          changed = true;
        }
      }
      if (cachedDb.settings.headmasterName !== 'Hj. Faiqoh Subky, S.H., M.Pd.') {
        cachedDb.settings.headmasterName = 'Hj. Faiqoh Subky, S.H., M.Pd.';
        changed = true;
      }
      if (!cachedDb.settings.logoUrl || cachedDb.settings.logoUrl === '') {
        cachedDb.settings.logoUrl = '/assets/aistudio/images_be5eb3cc.jpeg';
        changed = true;
      }
      if (Array.isArray(cachedDb.announcements)) {
        for (const ann of cachedDb.announcements) {
          if (ann.authorName && ann.authorName.includes('Abdul Hakim')) {
            ann.authorName = 'Hj. Faiqoh Subky, S.H., M.Pd.';
            changed = true;
          }
          if (ann.authorName && ann.authorName.includes('Ahmad Fauzi')) {
            ann.authorName = 'Ilham Maulana, S.Kom (Admin Akademik)';
            changed = true;
          }
        }
      }
      if (Array.isArray(cachedDb.teachers)) {
        for (const t of cachedDb.teachers) {
          if (t.name && t.name.includes('Ahmad Fauzi')) {
            t.name = 'Ilham Maulana, S.Kom';
            t.email = 'ilhammaulana@maelbayan.com.id';
            changed = true;
          }
        }
      }
      if (Array.isArray(cachedDb.subjects)) {
        for (const s of cachedDb.subjects) {
          if (s.teacherName && s.teacherName.includes('Ahmad Fauzi')) {
            s.teacherName = 'Ilham Maulana, S.Kom';
            changed = true;
          }
        }
      }
      if (Array.isArray(cachedDb.schedules)) {
        for (const sch of cachedDb.schedules) {
          if (sch.teacherName && sch.teacherName.includes('Ahmad Fauzi')) {
            sch.teacherName = 'Ilham Maulana, S.Kom';
            changed = true;
          }
        }
      }
      if (changed) {
        saveDb(cachedDb);
      }
      return cachedDb;
    }
  } catch (err) {
    console.error('Failed to read DB file, initializing fresh DB:', err);
  }
  cachedDb = createInitialDatabase();
  saveDb(cachedDb);
  return cachedDb;
}

export function saveDb(data: DatabaseSchema): void {
  cachedDb = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB file:', err);
  }
}

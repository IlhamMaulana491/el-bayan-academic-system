export type UserRole = 'admin' | 'kepsek' | 'guru' | 'siswa';

export interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  nipOrNisn: string;
  className?: string;
  majorName?: string;
  subjectSpecialty?: string;
  phone?: string;
  avatarUrl?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export interface SchoolSettings {
  schoolName: string;
  shortName: string;
  slogan: string;
  nsm: string;
  npsn: string;
  accreditation: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  headmasterName: string;
  headmasterNip: string;
  activeAcademicYear: string;
  activeSemester: 'Ganjil' | 'Genap';
  logoUrl: string;
  bannerBuildingUrl: string;
  islamicQuote: string;
}

export interface AcademicYear {
  id: string;
  year: string;
  semester: 'Ganjil' | 'Genap';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Major {
  id: string;
  code: string;
  name: string;
  headOfMajor: string;
  description: string;
  studentCount: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  level: 'X' | 'XI' | 'XII';
  majorCode: string;
  homeroomTeacher: string;
  roomNumber: string;
  capacity: number;
  studentCount: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  category: 'PAI & Bahasa Arab' | 'Umum (Wajib)' | 'Peminatan MIPA' | 'Peminatan IPS & Keagamaan';
  gradeLevels: string;
  teacherName: string;
  hoursPerWeek: number;
  kkm: number;
}

export interface TeacherData {
  id: string;
  nip: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  education: string;
  status: 'PNS' | 'GTY' | 'Honorer';
  active: boolean;
}

export interface StudentData {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  major: string;
  email: string;
  parentName: string;
  status: 'Aktif' | 'Lulus' | 'Pindah';
}

export interface LearningMaterial {
  id: string;
  title: string;
  subjectName: string;
  className: string;
  teacherName: string;
  category: 'Modul PDF' | 'Presentasi' | 'Video Pembelajaran' | 'Kitab & Referensi';
  description: string;
  contentSummary: string;
  fullContent?: string;
  readingTimeMinutes?: number;
  keyPoints?: string[];
  fileName: string;
  fileSize: string;
  fileDataUrl?: string;
  videoUrl?: string;
  downloads: number;
  views: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentNisn: string;
  className: string;
  submittedAt: string;
  answerText: string;
  fileName: string;
  fileDataUrl?: string;
  score: number | null;
  feedback: string;
  status: 'Terkumpul' | 'Dinilai' | 'Terlambat';
}

export interface Assignment {
  id: string;
  title: string;
  subjectName: string;
  className: string;
  teacherName: string;
  dueDate: string;
  description: string;
  maxScore: number;
  attachmentName?: string;
  createdAt: string;
  submissions: AssignmentSubmission[];
}

export interface ExamQuestion {
  id: string;
  type: 'pg' | 'essay';
  questionText: string;
  arabicText?: string;
  options?: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctOption?: 'A' | 'B' | 'C' | 'D' | 'E';
  points: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  startedAt: string;
  submittedAt: string;
  pgScore: number;
  essayScore: number | null;
  totalScore: number;
  answers: Record<string, string>;
  status: 'Selesai Dinilai' | 'Menunggu Koreksi Essay';
}

export interface OnlineExam {
  id: string;
  title: string;
  subjectName: string;
  className: string;
  teacherName: string;
  examType: 'Ulangan Harian' | 'UTS / PTS' | 'UAS / PAS' | 'Ujian Madrasah';
  durationMinutes: number;
  date: string;
  startTime: string;
  passingScore: number;
  status: 'Aktif' | 'Terjadwal' | 'Selesai';
  questions: ExamQuestion[];
  attempts: ExamAttempt[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  subjectName: string;
  teacherName: string;
  topic: string;
  entries: {
    studentId: string;
    nisn: string;
    studentName: string;
    status: 'Hadir' | 'Izin' | 'Sakit' | 'Alfa';
    note: string;
  }[];
}

export interface AcademicGrade {
  id: string;
  studentId: string;
  nisn: string;
  studentName: string;
  className: string;
  subjectName: string;
  semester: string;
  tugasScore: number;
  uhScore: number;
  utsScore: number;
  uasScore: number;
  finalScore: number;
  predicate: 'A' | 'B' | 'C' | 'D';
  description: string;
}

export interface ScheduleItem {
  id: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  teacherName: string;
  room: string;
  colorDot: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
}

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  title: string;
  subjectName: string;
  className: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  likes: number;
  isPinned: boolean;
  replies: ForumReply[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Ujian' | 'Tugas' | 'Kegiatan' | 'Akademik' | 'Libur';
  authorName: string;
  targetRole: 'Semua' | 'Guru' | 'Siswa';
  relativeTime: string;
  date: string;
  colorDot: 'emerald' | 'blue' | 'amber' | 'purple';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  linkTab: string;
}

export interface ActivityChartPoint {
  day: string;
  aksesMateri: number;
  pengumpulanTugas: number;
  ujianOnline: number;
}

export interface DashboardPayload {
  stats: {
    studentCount: number;
    teacherCount: number;
    subjectCount: number;
    classCount: number;
    materialCount: number;
    assignmentCount: number;
    examCount: number;
    averageAttendance: number;
    averageGrade: number;
  };
  activityChart: {
    '7d': ActivityChartPoint[];
    '30d': ActivityChartPoint[];
    'semester': ActivityChartPoint[];
  };
  todaySchedules: ScheduleItem[];
  announcements: Announcement[];
  notifications: NotificationItem[];
  settings: SchoolSettings;
}

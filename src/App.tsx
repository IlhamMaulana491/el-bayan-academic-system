import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Layers,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  BarChart3,
  Calendar,
  MessageCircle,
  Megaphone,
  FileText,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
  ChevronDown,
  Users,
  GraduationCap,
  Building2,
  Zap,
  ShieldCheck,
  Clock,
  Globe,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import {
  AcademicGrade,
  AcademicYear,
  ActivityChartPoint,
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
} from './types.ts';
import {
  ActivityLineChart,
  IslamicQuoteCard,
  MadrasahLogo,
  SchoolHeroBanner,
} from './components/IslamicVisuals.tsx';
import { LandingAndLogin } from './components/LandingAndLogin.tsx';
import { DataMasterView } from './components/DataMasterView.tsx';
import { LearningAndExamView } from './components/LearningAndExamView.tsx';
import { AcademicAndOperationsView } from './components/AcademicAndOperationsView.tsx';

type NavTab =
  | 'dashboard'
  | 'data-master'
  | 'pembelajaran'
  | 'tugas-ujian'
  | 'absensi'
  | 'nilai'
  | 'jadwal'
  | 'forum'
  | 'pengumuman'
  | 'laporan'
  | 'pengaturan';

export default function App() {
  const [token, setToken] = useState<string>('elbayan-token-usr-kepsek-init');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>({
    id: 'usr-kepsek',
    name: 'Hj. Faiqoh Subky, S.H., M.Pd.',
    username: 'kepsek',
    email: 'kepsek@maelbayan.sch.id',
    role: 'kepsek',
    roleLabel: 'Kepala Madrasah',
    nipOrNisn: '196904121996031002',
    subjectSpecialty: 'Pimpinan Madrasah Aliyah EL-BAYAN',
    phone: '0811-2233-4455',
    status: 'Aktif',
    createdAt: '2025-07-01',
    avatarUrl: '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png',
  });
  const [showPublicLanding, setShowPublicLanding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [examSubTab, setExamSubTab] = useState<'tugas' | 'ujian'>('tugas');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | 'semester'>('7d');
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(
    'Senin, 8 Desember 2025 | 14:30:25 WIB'
  );

  // Full Database State
  const [settings, setSettings] = useState<SchoolSettings>({
    schoolName: 'E-Learning MA EL-BAYAN',
    shortName: 'MA EL-BAYAN',
    slogan: 'Madrasah Digital, Generasi Cerdas dan Berakhlak Mulia.',
    nsm: '131232010045',
    npsn: '20278419',
    accreditation: 'Terakreditasi A (Unggul)',
    address: 'JL. KH.Najmuddin KM 02, Kec. Majenang, Kab. Cilacap, Prov. Jawa Tengah',
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
  });

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<AcademicGrade[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [forums, setForums] = useState<ForumThread[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activityChart, setActivityChart] = useState<{
    '7d': ActivityChartPoint[];
    '30d': ActivityChartPoint[];
    'semester': ActivityChartPoint[];
  }>({
    '7d': [],
    '30d': [],
    'semester': [],
  });

  const notify = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Live Clock in Footer
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timePart = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTimeStr(`Senin, 8 Desember 2025 | ${timePart.replace(/\./g, ':')} WIB`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = useCallback(
    async (activeToken?: string) => {
      const tk = activeToken || token;
      if (!tk) return;
      try {
        const [meRes, allRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${tk}` } }),
          fetch('/api/state/all', { headers: { Authorization: `Bearer ${tk}` } }),
        ]);
        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUser(meData.user);
          if (meData.settings) setSettings(meData.settings);
        }
        if (allRes.ok) {
          const allData = await allRes.json();
          setSettings(allData.settings);
          setUsers(allData.users);
          setAcademicYears(allData.academicYears);
          setMajors(allData.majors);
          setClasses(allData.classes);
          setSubjects(allData.subjects);
          setTeachers(allData.teachers);
          setStudents(allData.students);
          setMaterials(allData.materials);
          setAssignments(allData.assignments);
          setExams(allData.exams);
          setAttendance(allData.attendance);
          setGrades(allData.grades);
          setSchedules(allData.schedules);
          setForums(allData.forums);
          setAnnouncements(allData.announcements);
          setNotifications(allData.notifications);
          setActivityChart(allData.activityChart);
        }
      } catch (err) {
        console.error('Failed to load initial state:', err);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleQuickRoleSwitch = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        setSettings(data.settings);
        setShowPublicLanding(false);
        await fetchAllData(data.token);
        notify(`Berhasil beralih ke Hak Akses: ${data.user.roleLabel} (${data.user.name})`);
      }
    } catch {
      notify('Gagal mengganti hak akses.');
    }
  };

  const handleMarkNotificationsRead = async () => {
    const res = await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = await res.json();
      setNotifications(updated);
    }
  };

  const handleLogout = () => {
    setShowPublicLanding(true);
    setShowProfileDropdown(false);
    notify('Anda telah keluar dari sesi. Silakan login kembali.');
  };

  // Show Public Landing Page or Login Screen when logged out or viewing landing page
  if (showPublicLanding || !currentUser) {
    return (
      <LandingAndLogin
        settings={settings}
        stats={{
          studentCount: students.length || 342,
          teacherCount: teachers.length || 48,
          subjectCount: subjects.length || 24,
          classCount: classes.length || 12,
        }}
        majors={majors}
        subjects={subjects}
        announcements={announcements}
        isLoggedIn={Boolean(currentUser)}
        onBackToDashboard={currentUser ? () => setShowPublicLanding(false) : undefined}
        onLoginSuccess={async (newToken, userObj, schoolSet) => {
          setToken(newToken);
          setCurrentUser(userObj);
          setSettings(schoolSet);
          setShowPublicLanding(false);
          await fetchAllData(newToken);
          notify(`Assalamu'alaikum ${userObj.name}, selamat datang di ${schoolSet.schoolName}!`);
        }}
      />
    );
  }

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Filter sidebar items based on role permissions while keeping full visibility appropriate to each role
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasChevron?: boolean;
    allowedRoles: UserRole[];
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, hasChevron: false, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'data-master', label: 'Data Master', icon: Layers, hasChevron: true, allowedRoles: ['admin', 'kepsek'] },
    { id: 'pembelajaran', label: 'Pembelajaran', icon: BookOpen, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'tugas-ujian', label: 'Tugas & Ujian', icon: ClipboardCheck, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'absensi', label: 'Absensi', icon: UserCheck, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'nilai', label: 'Nilai Akademik', icon: BarChart3, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Calendar, hasChevron: false, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'forum', label: 'Forum Diskusi', icon: MessageCircle, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone, hasChevron: false, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
    { id: 'laporan', label: 'Laporan', icon: FileText, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings, hasChevron: true, allowedRoles: ['admin', 'kepsek', 'guru', 'siswa'] },
  ];

  const visibleNavItems = navItems.filter((item) => item.allowedRoles.includes(currentUser.role));

  const todaySchedules = schedules.filter((s) => s.day === 'Senin').slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F4F7F6] flex flex-col lg:flex-row text-slate-800">
      {/* Toast Notification Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#043927] text-white px-4 py-3 rounded-xl shadow-lg border border-[#F59E0B]/40 flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-[#FBBF24] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ====================================================================
          LEFT EMERALD SIDEBAR (MATCHING REFERENCE IMAGE)
         ==================================================================== */}
      <aside
        className={`no-print fixed lg:sticky top-0 left-0 z-40 h-screen bg-gradient-to-b from-[#044732] via-[#053F2C] to-[#02261B] text-white flex flex-col justify-between transition-all duration-200 select-none shrink-0 ${
          sidebarOpen ? 'w-[248px]' : 'w-[78px]'
        } ${mobileMenuOpen ? 'translate-x-0 w-[248px]' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Crest & Brand Identity */}
        <div className="pt-6 px-4 pb-3 flex flex-col items-center text-center">
          <MadrasahLogo logoUrl={settings.logoUrl} size={sidebarOpen ? 'lg' : 'sm'} />
          {sidebarOpen && (
            <div className="mt-2.5">
              <div className="text-[19px] font-bold leading-tight tracking-tight text-white">
                E-Learning
              </div>
              <div className="text-[19px] font-extrabold leading-tight tracking-tight text-white">
                {settings.shortName}
              </div>
              <p className="text-[11px] italic text-emerald-100/85 mt-1.5 leading-snug px-2 font-normal">
                “{settings.slogan}”
              </p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#228B62] to-[#1B7A54] text-white font-semibold shadow-sm'
                    : 'text-emerald-50/85 hover:bg-white/10 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>
                {sidebarOpen && item.hasChevron && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isActive ? 'opacity-100 translate-x-0.5' : 'opacity-60'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Islamic Mosque Silhouette Ornament & Logout Button */}
        <div className="relative pt-8 pb-4 px-3 mt-auto">
          {/* Subtle Mosque Dome & Minaret Silhouette SVG matching reference */}
          <svg
            viewBox="0 0 240 70"
            className="w-full h-14 text-[#0A5C42]/55 pointer-events-none mb-1"
            fill="currentColor"
          >
            <path d="M10 70V42L15 32L20 42V70H10Z" />
            <path d="M28 70V52C28 42 38 36 48 36C58 36 68 42 68 52V70H28Z" />
            <path d="M75 70V44C75 26 95 14 120 8C145 14 165 26 165 44V70H75Z" />
            <path d="M172 70V52C172 42 182 36 192 36C202 36 212 42 212 52V70H172Z" />
            <path d="M220 70V42L225 32L230 42V70H220Z" />
            <path d="M0 64Q120 54 240 64V70H0V64Z" fill="#D97706" fillOpacity="0.35" />
          </svg>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-[#033022] hover:bg-[#022017] border border-emerald-700/40 text-white text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-emerald-200" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ====================================================================
          RIGHT MAIN WORKSPACE (TOP NAVBAR + CONTENT + FOOTER)
         ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR (MATCHING REFERENCE IMAGE) */}
        <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Hamburger + Greeting */}
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(!mobileMenuOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="p-2 rounded-xl text-[#064E3B] hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="min-w-0">
              <div className="text-xs sm:text-sm text-slate-600 font-medium truncate">
                Assalamu'alaikum, Selamat Datang 👋
              </div>
              <div className="text-base sm:text-xl font-extrabold text-[#064E3B] leading-tight truncate">
                di {settings.schoolName}
              </div>
              <p className="hidden sm:block text-xs text-slate-500 truncate">
                Mari wujudkan pembelajaran digital yang lebih baik bersama {settings.shortName}.
              </p>
            </div>
          </div>

          {/* Right: Role Switcher + Notification Bell + User Profile */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {/* Role Switcher for Testing all 4 Roles + Landing Page */}
            <div className="hidden lg:flex items-center gap-1 bg-emerald-50/90 p-1 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-900 px-2">Hak Akses:</span>
              {([
                { role: 'kepsek', label: 'Kepala Madrasah' },
                { role: 'admin', label: 'Admin' },
                { role: 'guru', label: 'Guru' },
                { role: 'siswa', label: 'Siswa' },
              ] as const).map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleQuickRoleSwitch(r.role)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    currentUser.role === r.role
                      ? 'bg-[#065F46] text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  {r.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowPublicLanding(true)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 hover:bg-amber-100/70 flex items-center gap-1 cursor-pointer"
                title="Lihat Halaman Depan (Landing Page)"
              >
                <Globe className="w-3 h-3" />
                <span>Landing Page</span>
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  setShowProfileDropdown(false);
                }}
                className="relative p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Notifikasi"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifikasi Terbaru</span>
                    <button
                      type="button"
                      onClick={handleMarkNotificationsRead}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      Tandai Semua Dibaca
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setActiveTab((n.linkTab as NavTab) || 'pengumuman');
                          setShowNotifDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div className="text-xs font-semibold text-slate-900">{n.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-emerald-700 mt-1">{n.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* Avatar: Kepala Madrasah photo, custom avatarUrl, or clean styled badge */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-700/40 bg-[#064E3B] text-white flex items-center justify-center font-bold text-xs shrink-0 relative shadow-2xs">
                  {currentUser.role === 'kepsek' || currentUser.avatarUrl ? (
                    <img
                      src={
                        currentUser.avatarUrl ||
                        '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png'
                      }
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#065F46] to-[#043927] flex items-center justify-center font-bold text-white text-xs tracking-wider">
                      {currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join('')}
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">{currentUser.roleLabel}</div>
                </div>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-slate-500">{currentUser.email}</div>
                    <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                      Role: {currentUser.roleLabel}
                    </div>
                  </div>
                  <div className="py-1 border-b border-slate-100 xl:hidden px-3 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 px-1">GANTI HAK AKSES (DEMO):</div>
                    {(['admin', 'kepsek', 'guru', 'siswa'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          handleQuickRoleSwitch(r);
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded hover:bg-emerald-50 font-medium capitalize"
                      >
                        Masuk sebagai {r}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('pengaturan');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                  >
                    Profil & Pengaturan Sekolah
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPublicLanding(true);
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
                  >
                    Lihat Halaman Landing Page
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 font-semibold text-red-600 cursor-pointer"
                  >
                    Keluar (Logout)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ==================================================================
            MAIN CONTENT VIEWPORT
           ================================================================== */}
        <main className="flex-1 p-4 sm:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* 1. HERO SCHOOL BUILDING BANNER */}
              <SchoolHeroBanner settings={settings} />

              {/* 2. FOUR STATISTIC CARDS (DYNAMIC FROM DATABASE, MATCHING REFERENCE IMAGE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Card 1: Jumlah Siswa */}
                <div
                  onClick={() => currentUser.role === 'admin' && setActiveTab('data-master')}
                  className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#E9F7F1] via-[#F2FBF7] to-[#E2F4EC] border border-emerald-200/70 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#0B8457] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Users className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-none tabular-nums">
                        {students.length}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                        Jumlah Siswa
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0B8457] flex items-center gap-0.5 tabular-nums">
                    <span>↑ 5%</span>
                  </div>
                </div>

                {/* Card 2: Jumlah Guru */}
                <div
                  onClick={() => currentUser.role === 'admin' && setActiveTab('data-master')}
                  className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#EBF4FF] via-[#F4F8FF] to-[#E3F0FF] border border-blue-200/70 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#1D7AFC] text-white flex items-center justify-center shadow-xs shrink-0">
                      <GraduationCap className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-none tabular-nums">
                        {teachers.length}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                        Jumlah Guru
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0B8457] flex items-center gap-0.5 tabular-nums">
                    <span>↑ 2%</span>
                  </div>
                </div>

                {/* Card 3: Mata Pelajaran */}
                <div
                  onClick={() => setActiveTab('pembelajaran')}
                  className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#FFF6E5] via-[#FFF9EE] to-[#FDEFD6] border border-amber-200/70 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center shadow-xs shrink-0">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-none tabular-nums">
                        {subjects.length}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                        Mata Pelajaran
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-[#0B8457] flex items-center gap-0.5 tabular-nums">
                    <span>↑ 1%</span>
                  </div>
                </div>

                {/* Card 4: Kelas */}
                <div
                  onClick={() => setActiveTab('jadwal')}
                  className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#F3EEFF] via-[#F7F4FF] to-[#ECE4FF] border border-purple-200/70 shadow-2xs flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#6D28D9] text-white flex items-center justify-center shadow-xs shrink-0">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-none tabular-nums">
                        {classes.length}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-slate-700 mt-1">
                        Kelas
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-600 flex items-center gap-0.5 tabular-nums">
                    <span>↑ 0%</span>
                  </div>
                </div>
              </div>

              {/* 3. MIDDLE & BOTTOM BENTO GRID WITH RIGHT ISLAMIC QUOTE CARD (MATCHING REFERENCE IMAGE) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                {/* Left + Center 10 Columns */}
                <div className="xl:col-span-10 space-y-5 flex flex-col justify-between">
                  {/* Top Row inside 10 cols: Grafik Aktivitas (7 cols) + Jadwal Hari Ini (5 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Grafik Aktivitas Pembelajaran */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#065F46] flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <h2 className="text-base font-bold text-slate-900">
                            Grafik Aktivitas Pembelajaran
                          </h2>
                        </div>

                        <select
                          value={chartRange}
                          onChange={(e) => setChartRange(e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50/70 focus:outline-none cursor-pointer"
                        >
                          <option value="7d">7 Hari Terakhir</option>
                          <option value="30d">30 Hari Terakhir</option>
                          <option value="semester">Semester Ini</option>
                        </select>
                      </div>

                      <ActivityLineChart data={activityChart[chartRange] || []} />
                    </div>

                    {/* Jadwal Pelajaran Hari Ini */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#065F46] flex items-center justify-center">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-slate-900">
                              Jadwal Pelajaran Hari Ini
                            </h2>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {todaySchedules.map((sch, idx) => {
                            const dotColors = [
                              'bg-[#059669]',
                              'bg-[#2563EB]',
                              'bg-[#F59E0B]',
                              'bg-[#6D28D9]',
                            ];
                            return (
                              <div
                                key={sch.id}
                                className="py-3 flex items-center justify-between gap-2 text-xs"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                      dotColors[idx % dotColors.length]
                                    }`}
                                  />
                                  <span className="text-slate-600 font-medium tabular-nums whitespace-nowrap">
                                    {sch.startTime} – {sch.endTime}
                                  </span>
                                  <span className="font-bold text-slate-900 truncate ml-1">
                                    {sch.subjectName}
                                  </span>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold text-[11px] whitespace-nowrap shrink-0">
                                  {sch.className}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActiveTab('jadwal')}
                          className="text-xs font-semibold text-[#065F46] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Lihat Jadwal Lengkap</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row inside 10 cols: Pengumuman Terbaru (7 cols) + Akses Cepat (5 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Pengumuman Terbaru */}
                    <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Megaphone className="w-4 h-4" />
                            </div>
                            <h2 className="text-base font-bold text-slate-900">
                              Pengumuman Terbaru
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab('pengumuman')}
                            className="text-xs font-semibold text-[#065F46] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Lihat Semua</span>
                            <span>→</span>
                          </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {announcements.slice(0, 3).map((ann, idx) => {
                            const dotColors = ['bg-[#059669]', 'bg-[#2563EB]', 'bg-[#F59E0B]'];
                            return (
                              <div
                                key={ann.id}
                                onClick={() => setActiveTab('pengumuman')}
                                className="py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 rounded-lg px-1 transition-colors"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                                      dotColors[idx % dotColors.length]
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 truncate">
                                      {ann.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                                      {ann.content}
                                    </p>
                                    <p className="text-[11px] font-medium text-emerald-700 mt-0.5">
                                      Oleh: {ann.authorName}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                                  {ann.relativeTime}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Akses Cepat (8 Grid Buttons matching reference image) */}
                    <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-3.5">
                        <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                        <h2 className="text-base font-bold text-slate-900">Akses Cepat</h2>
                      </div>

                      <div className="grid grid-cols-4 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('pembelajaran')}
                          className="p-2.5 rounded-xl bg-[#E9F7F1] hover:bg-[#D5F0E5] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#0B8457] text-white flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Materi Pembelajaran
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExamSubTab('tugas');
                            setActiveTab('tugas-ujian');
                          }}
                          className="p-2.5 rounded-xl bg-[#EBF4FF] hover:bg-[#D9EAFF] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#1D7AFC] text-white flex items-center justify-center">
                            <ClipboardCheck className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Tugas Online
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setExamSubTab('ujian');
                            setActiveTab('tugas-ujian');
                          }}
                          className="p-2.5 rounded-xl bg-[#F3EEFF] hover:bg-[#E6DCFF] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#6D28D9] text-white flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Kuis & Ujian
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('absensi')}
                          className="p-2.5 rounded-xl bg-[#FFF4E5] hover:bg-[#FFE8CC] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Absensi
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('nilai')}
                          className="p-2.5 rounded-xl bg-[#E6F6F4] hover:bg-[#D1EFEA] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#0D9488] text-white flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Nilai Akademik
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('jadwal')}
                          className="p-2.5 rounded-xl bg-[#EAF7ED] hover:bg-[#D7F0DD] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#15803D] text-white flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Jadwal Pelajaran
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('forum')}
                          className="p-2.5 rounded-xl bg-[#EBF3FF] hover:bg-[#D8E8FF] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Forum Diskusi
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('pengumuman')}
                          className="p-2.5 rounded-xl bg-[#F3EEFF] hover:bg-[#E5DCFF] text-center flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center">
                            <Bell className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                            Pengumuman
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Far-Right 2 Columns: Vertical Islamic Motivational Quote Card */}
                <div className="xl:col-span-2">
                  <IslamicQuoteCard quote={settings.islamicQuote} />
                </div>
              </div>
            </>
          )}

          {activeTab === 'data-master' && (
            <DataMasterView
              token={token}
              userRole={currentUser.role}
              students={students}
              teachers={teachers}
              classes={classes}
              majors={majors}
              subjects={subjects}
              users={users}
              academicYears={academicYears}
              onRefresh={() => fetchAllData()}
              notify={notify}
            />
          )}

          {activeTab === 'pembelajaran' && (
            <LearningAndExamView
              mode="materi"
              token={token}
              user={currentUser}
              materials={materials}
              assignments={assignments}
              exams={exams}
              subjects={subjects}
              classes={classes}
              onRefresh={() => fetchAllData()}
              notify={notify}
            />
          )}

          {activeTab === 'tugas-ujian' && (
            <LearningAndExamView
              mode="tugas-ujian"
              initialSubTab={examSubTab}
              token={token}
              user={currentUser}
              materials={materials}
              assignments={assignments}
              exams={exams}
              subjects={subjects}
              classes={classes}
              onRefresh={() => fetchAllData()}
              notify={notify}
            />
          )}

          {(activeTab === 'absensi' ||
            activeTab === 'nilai' ||
            activeTab === 'jadwal' ||
            activeTab === 'forum' ||
            activeTab === 'pengumuman' ||
            activeTab === 'laporan' ||
            activeTab === 'pengaturan') && (
            <AcademicAndOperationsView
              mode={activeTab}
              token={token}
              user={currentUser}
              settings={settings}
              attendance={attendance}
              grades={grades}
              schedules={schedules}
              forums={forums}
              announcements={announcements}
              students={students}
              teachers={teachers}
              subjects={subjects}
              classes={classes}
              onRefresh={() => fetchAllData()}
              onUserUpdated={(u) => setCurrentUser(u)}
              notify={notify}
            />
          )}
        </main>

        {/* ==================================================================
            BOTTOM FOOTER BAR (MATCHING REFERENCE IMAGE)
           ================================================================== */}
        <footer className="no-print mt-auto bg-white border-t border-slate-200/80 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-[#F59E0B]">👑</span>
            <span className="font-bold text-[#064E3B]">{settings.shortName}</span>
            <span className="text-slate-300">|</span>
            <span>Madrasah Aliyah</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#065F46]" />
            <span>Sistem E-Learning • Versi 1.0.0</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-medium tabular-nums">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{currentTimeStr}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

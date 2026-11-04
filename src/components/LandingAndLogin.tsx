import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Users,
  Award,
  ArrowRight,
  Lock,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  Calendar,
  FileText,
  Building2,
} from 'lucide-react';
import { MadrasahLogo } from './IslamicVisuals.tsx';
import { Announcement, Major, SchoolSettings, Subject, UserRole } from '../types.ts';

interface PublicOverviewProps {
  settings: SchoolSettings;
  stats: {
    studentCount: number;
    teacherCount: number;
    subjectCount: number;
    classCount: number;
  };
  majors: Major[];
  subjects: Subject[];
  announcements: Announcement[];
  onLoginSuccess: (token: string, user: any, settings: SchoolSettings) => void;
  initialShowLogin?: boolean;
  onBackToDashboard?: () => void;
  isLoggedIn?: boolean;
}

export const LandingAndLogin: React.FC<PublicOverviewProps> = ({
  settings,
  stats,
  majors,
  subjects,
  announcements,
  onLoginSuccess,
  initialShowLogin = false,
  onBackToDashboard,
  isLoggedIn = false,
}) => {
  const [showLoginModal, setShowLoginModal] = useState(initialShowLogin);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal masuk ke sistem.');
      } else {
        onLoginSuccess(data.token, data.user, data.settings);
      }
    } catch {
      setErrorMsg('Gangguan koneksi ke server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleLogin = async (role: UserRole) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/quick-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal masuk.');
      } else {
        onLoginSuccess(data.token, data.user, data.settings);
      }
    } catch {
      setErrorMsg('Gangguan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 flex flex-col">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#043927] text-white border-b border-emerald-800/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a href="#beranda" className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <MadrasahLogo logoUrl={settings.logoUrl} size="sm" />
            <span className="text-lg font-bold tracking-tight text-white">
              E-Learning <span className="text-[#FBBF24]">MA EL-BAYAN</span>
            </span>
          </a>

          {/* Zone 2: 4 concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-emerald-100">
            <a href="#beranda" className="hover:text-[#FBBF24] transition-colors whitespace-nowrap shrink-0">
              Beranda
            </a>
            <a href="#jurusan" className="hover:text-[#FBBF24] transition-colors whitespace-nowrap shrink-0">
              Program Jurusan
            </a>
            <a href="#kurikulum" className="hover:text-[#FBBF24] transition-colors whitespace-nowrap shrink-0">
              Kurikulum MA
            </a>
            <a href="#pengumuman" className="hover:text-[#FBBF24] transition-colors whitespace-nowrap shrink-0">
              Pengumuman
            </a>
          </nav>

          {/* Zone 3: 1 Primary CTA button */}
          <div className="flex items-center shrink-0">
            {isLoggedIn && onBackToDashboard ? (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk Portal</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="beranda" className="relative bg-gradient-to-br from-[#022C22] via-[#064E3B] to-[#065F46] text-white py-14 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs sm:text-sm font-medium text-[#FBBF24] tracking-wide">
              {settings.accreditation} · NSM {settings.nsm} · Tahun Ajaran {settings.activeAcademicYear}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
              Portal Pembelajaran Digital Resmi{' '}
              <span className="text-[#FBBF24]">{settings.shortName}</span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/90 italic font-normal max-w-2xl">
              “{settings.slogan}”
            </p>
            <p className="text-sm sm:text-base text-emerald-50/85 leading-relaxed max-w-2xl">
              Sistem manajemen pembelajaran terpadu Madrasah Aliyah EL-BAYAN yang mengintegrasikan materi kurikulum Kemenag RI, penugasan terstruktur, Computer Based Test (CBT), rekap presensi, dan evaluasi akademik secara real-time.
            </p>

            {/* Primary CTA & Role Quick Access */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Masuk E-Learning Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#kurikulum"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all whitespace-nowrap shrink-0"
              >
                Jelajahi Kurikulum MA
              </a>
            </div>

            {/* Direct 4-Role Instant Demo Access Bar */}
            <div className="pt-4 border-t border-emerald-700/60">
              <p className="text-xs text-emerald-200 mb-2.5 font-medium">
                Simulasi Langsung 4 Hak Akses (Klik untuk masuk otomatis):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {([
                  { role: 'admin', label: 'Dashboard Admin', sub: 'Ilham Maulana, S.Kom' },
                  { role: 'kepsek', label: 'Kepala Madrasah', sub: settings.headmasterName || 'Hj. Faiqoh Subky, S.H., M.Pd.' },
                  { role: 'guru', label: 'Dashboard Guru', sub: 'Ust. M. Ridwan' },
                  { role: 'siswa', label: 'Dashboard Siswa', sub: 'Nabila Azzahra' },
                ] as const).map((item) => (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleQuickRoleLogin(item.role)}
                    disabled={loading}
                    className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-[#FBBF24] group-hover:text-amber-300 flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-75 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-emerald-100/80 truncate mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: School Building Showcase Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden border-2 border-[#F59E0B]/40 shadow-xl bg-[#043927]">
              <div className="relative h-64 sm:h-72 overflow-hidden">
                {settings.bannerBuildingUrl && !settings.bannerBuildingUrl.includes('Modern_Islamic_E-Learning_Dashboard_3dfd0007.png') ? (
                  <img
                    src={settings.bannerBuildingUrl}
                    alt="Gedung MA EL-BAYAN"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/assets/aistudio/Modern_Islamic_E-Learning_Dashboard_3dfd0007.png"
                    alt="Gedung MA EL-BAYAN"
                    referrerPolicy="no-referrer"
                    className="absolute max-w-none"
                    style={{
                      width: '210%',
                      height: '460%',
                      right: '-2%',
                      top: '-52%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#022C22] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs text-[#FBBF24] font-semibold">Madrasah Aliyah Terpadu</p>
                  <h3 className="text-lg font-bold">Gedung Utama Madrasah Aliyah EL-BAYAN</h3>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{settings.address}</p>
                </div>
              </div>

              {/* 4 Dynamic Metric Strip inside Hero Card */}
              <div className="grid grid-cols-4 divide-x divide-emerald-800/70 bg-[#032b1e] p-4 text-center tabular-nums">
                <div>
                  <div className="text-xl font-bold text-white">{stats.studentCount}</div>
                  <div className="text-[11px] text-emerald-200/80">Siswa Aktif</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#FBBF24]">{stats.teacherCount}</div>
                  <div className="text-[11px] text-emerald-200/80">Dewan Guru</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{stats.subjectCount}</div>
                  <div className="text-[11px] text-emerald-200/80">Mata Pelajaran</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-[#FBBF24]">{stats.classCount}</div>
                  <div className="text-[11px] text-emerald-200/80">Rombel Kelas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sambutan Kepala Madrasah Section */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-2xl bg-gradient-to-br from-[#F2FBF7] via-white to-[#E9F7F1] border border-emerald-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-2xs">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#065F46]/30 shadow-md shrink-0 bg-emerald-50">
              <img
                src="/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png"
                alt={settings.headmasterName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <div className="text-xs font-bold text-[#065F46] tracking-wide uppercase">
                Sambutan Kepala Madrasah Aliyah EL-BAYAN
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {settings.headmasterName}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
                “Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di portal resmi <strong>{settings.schoolName}</strong>. Melalui transformasi pembelajaran digital ini, kami berkomitmen mencetak generasi santri dan peserta didik yang unggul dalam ilmu pengetahuan dan teknologi (IPTEK), kokoh dalam iman dan takwa (IMTAK), serta berakhlakul karimah.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Jurusan Section */}
      <section id="jurusan" className="py-14 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold text-emerald-700">Program Akademik Unggulan</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Jurusan & Peminatan Madrasah Aliyah EL-BAYAN
            </h2>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Kurikulum terintegrasi Kementerian Agama RI yang memadukan sains modern, ilmu sosial, dan pendalaman tafaqquh fiddin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {majors.map((mjr) => (
            <div
              key={mjr.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                  {mjr.code}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{mjr.name}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{mjr.description}</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Ketua Program: {mjr.headOfMajor}</span>
                <span className="font-semibold text-emerald-700 tabular-nums">{mjr.studentCount} Siswa</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kurikulum Mata Pelajaran MA Section */}
      <section id="kurikulum" className="py-14 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold text-emerald-700">Struktur Kurikulum Kemenag RI</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Mata Pelajaran Khas Madrasah Aliyah & Sains Umum
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 hover:border-emerald-600/40 transition-colors"
              >
                <div className="text-xs text-emerald-700 font-medium">
                  {sub.code} · {sub.category}
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-1">{sub.name}</h4>
                <p className="text-xs text-slate-600 mt-1.5 truncate">Pengampu: {sub.teacherName}</p>
                <div className="text-xs text-slate-500 mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between tabular-nums">
                  <span>Kelas {sub.gradeLevels}</span>
                  <span>KKM: {sub.kkm} · {sub.hoursPerWeek} JP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pengumuman Terbaru Section */}
      <section id="pengumuman" className="py-14 max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-emerald-700">Informasi Resmi Madrasah</p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Pengumuman Akademik Terbaru</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Masuk untuk Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold text-emerald-700">{ann.category} · {ann.authorName}</span>
                <span>{ann.relativeTime}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
              <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{ann.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#022C22] text-emerald-100/80 py-8 border-t border-emerald-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <MadrasahLogo logoUrl={settings.logoUrl} size="sm" />
            <div>
              <div className="font-bold text-white text-sm">{settings.schoolName}</div>
              <div>{settings.slogan}</div>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div>{settings.address}</div>
            <div className="text-emerald-300/70 mt-0.5">
              © 2025 {settings.shortName} · Sistem E-Learning Madrasah Aliyah Terpadu
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-emerald-900/20 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#043927] to-[#065F46] p-6 text-center text-white relative">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 text-emerald-200 hover:text-white text-xs font-medium px-2.5 py-1 rounded-lg bg-black/20 cursor-pointer"
              >
                Tutup ✕
              </button>
              <div className="flex justify-center mb-3">
                <MadrasahLogo logoUrl={settings.logoUrl} size="md" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Login {settings.schoolName}</h2>
              <p className="text-xs text-emerald-100/90 italic mt-1">“{settings.slogan}”</p>
            </div>

            <div className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username / Email / NIP / NISN
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Contoh: admin, kepsek, guru, siswa"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                >
                  {loading ? 'Memverifikasi Kredensial...' : 'Masuk ke E-Learning'}
                </button>
              </form>

              {/* Quick Demo Account Selector */}
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2.5 text-center">
                  Pilih Role untuk Masuk Instan (Password: <code className="font-mono">password123</code>):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('admin')}
                    className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold text-left transition-colors cursor-pointer"
                  >
                    <div>1. Admin Madrasah</div>
                    <div className="text-[10px] font-normal text-emerald-700">Ilham Maulana, S.Kom</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('kepsek')}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold text-left transition-colors cursor-pointer"
                  >
                    <div>2. Kepala Madrasah</div>
                    <div className="text-[10px] font-normal text-amber-700">{settings.headmasterName || 'Hj. Faiqoh Subky, S.H., M.Pd.'}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('guru')}
                    className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold text-left transition-colors cursor-pointer"
                  >
                    <div>3. Guru Mapel</div>
                    <div className="text-[10px] font-normal text-blue-700">Ust. H. M. Ridwan, Lc.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickRoleLogin('siswa')}
                    className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold text-left transition-colors cursor-pointer"
                  >
                    <div>4. Siswa Kelas X-A</div>
                    <div className="text-[10px] font-normal text-purple-700">Nabila Azzahra Putri</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

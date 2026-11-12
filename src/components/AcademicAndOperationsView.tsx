import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  BarChart3,
  Calendar,
  MessageSquare,
  Megaphone,
  FileSpreadsheet,
  Printer,
  Settings,
  Plus,
  Trash2,
  Send,
  ThumbsUp,
  Save,
  Upload,
  User,
  Building2,
  RotateCcw,
} from 'lucide-react';
import {
  AcademicGrade,
  Announcement,
  AttendanceRecord,
  ForumThread,
  ScheduleItem,
  SchoolClass,
  SchoolSettings,
  StudentData,
  Subject,
  TeacherData,
  UserAccount,
} from '../types.ts';
import { MadrasahLogo } from './IslamicVisuals.tsx';
import { apiFetch } from '../utils/api.ts';

interface AcademicOpsProps {
  mode: 'absensi' | 'nilai' | 'jadwal' | 'forum' | 'pengumuman' | 'laporan' | 'pengaturan';
  token: string;
  user: UserAccount;
  settings: SchoolSettings;
  attendance: AttendanceRecord[];
  grades: AcademicGrade[];
  schedules: ScheduleItem[];
  forums: ForumThread[];
  announcements: Announcement[];
  students: StudentData[];
  teachers: TeacherData[];
  subjects: Subject[];
  classes: SchoolClass[];
  onRefresh: () => Promise<void>;
  onUserUpdated: (u: UserAccount) => void;
  notify: (msg: string) => void;
}

export const AcademicAndOperationsView: React.FC<AcademicOpsProps> = ({
  mode,
  token,
  user,
  settings,
  attendance,
  grades,
  schedules,
  forums,
  announcements,
  students,
  teachers,
  subjects,
  classes,
  onRefresh,
  onUserUpdated,
  notify,
}) => {
  const canTeach = user.role === 'admin' || user.role === 'guru';
  const canAdmin = user.role === 'admin' || user.role === 'kepsek';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // ==========================================================================
  // 1. ABSENSI SISWA STATE
  // ==========================================================================
  const [attClass, setAttClass] = useState('Kelas X-A');
  const [attSubject, setAttSubject] = useState("Al-Qur'an Hadis");
  const [attDate, setAttDate] = useState('2025-12-08');
  const [attTopic, setAttTopic] = useState("Pertemuan 15: Evaluasi Tajwid & Tahsin Al-Qur'an");
  const classStudents = students.filter((s) => s.className === attClass).slice(0, 12);
  const [statusMap, setStatusMap] = useState<Record<string, 'Hadir' | 'Izin' | 'Sakit' | 'Alfa'>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});

  const handleSaveAttendance = async () => {
    const entries = classStudents.map((st) => ({
      studentId: st.id,
      nisn: st.nisn,
      studentName: st.name,
      status: statusMap[st.id] || 'Hadir',
      note: noteMap[st.id] || 'Hadir tepat waktu',
    }));
    const res = await apiFetch('/api/attendance', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date: attDate,
        className: attClass,
        subjectName: attSubject,
        topic: attTopic,
        entries,
      }),
    });
    if (res.ok) {
      await onRefresh();
      notify(`Data absensi ${attClass} (${attSubject}) berhasil disimpan ke database!`);
    }
  };

  // ==========================================================================
  // 2. NILAI AKADEMIK STATE
  // ==========================================================================
  const [gradeSubFilter, setGradeSubFilter] = useState('Semua');
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentName: 'Nabila Azzahra Putri',
    nisn: '0084921034',
    className: 'Kelas X-A',
    subjectName: "Al-Qur'an Hadis",
    tugasScore: 92,
    uhScore: 90,
    utsScore: 94,
    uasScore: 95,
    description: 'Sangat baik dalam menguasai kompetensi dasar mata pelajaran.',
  });

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/grades', {
      method: 'POST',
      headers,
      body: JSON.stringify(gradeForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddGrade(false);
      notify('Nilai akademik siswa berhasil dihitung dan disimpan.');
    }
  };

  // ==========================================================================
  // 3. JADWAL PELAJARAN STATE
  // ==========================================================================
  const [dayFilter, setDayFilter] = useState<string>('Semua');
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [schForm, setSchForm] = useState({
    day: 'Senin' as ScheduleItem['day'],
    startTime: '07:00',
    endTime: '08:40',
    subjectName: "Al-Qur'an Hadis",
    className: 'Kelas X-A',
    teacherName: 'Ustadz H. Muhammad Ridwan, Lc., M.Ag',
    room: 'R.101',
    colorDot: 'emerald' as ScheduleItem['colorDot'],
  });

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/schedules', {
      method: 'POST',
      headers,
      body: JSON.stringify(schForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddSchedule(false);
      notify('Jadwal pelajaran baru berhasil ditambahkan.');
    }
  };

  // ==========================================================================
  // 4. FORUM DISKUSI STATE
  // ==========================================================================
  const [showNewThread, setShowNewThread] = useState(false);
  const [threadForm, setThreadForm] = useState({
    title: '',
    subjectName: "Al-Qur'an Hadis",
    className: 'Kelas X-A',
    content: '',
  });
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/forums', {
      method: 'POST',
      headers,
      body: JSON.stringify(threadForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowNewThread(false);
      setThreadForm({ title: '', subjectName: "Al-Qur'an Hadis", className: 'Kelas X-A', content: '' });
      notify('Topik diskusi baru berhasil diterbitkan.');
    }
  };

  const handleSendReply = async (threadId: string) => {
    const text = replyInputs[threadId];
    if (!text || !text.trim()) return;
    const res = await apiFetch(`/api/forums/${threadId}/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content: text }),
    });
    if (res.ok) {
      setReplyInputs({ ...replyInputs, [threadId]: '' });
      await onRefresh();
      notify('Komentar balasan berhasil dikirim.');
    }
  };

  const handleLikeThread = async (threadId: string) => {
    await apiFetch(`/api/forums/${threadId}/like`, { method: 'POST', headers });
    await onRefresh();
  };

  // ==========================================================================
  // 5. PENGUMUMAN STATE
  // ==========================================================================
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    category: 'Akademik' as Announcement['category'],
    targetRole: 'Semua' as Announcement['targetRole'],
    colorDot: 'emerald' as Announcement['colorDot'],
  });

  const handleSaveAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/announcements', {
      method: 'POST',
      headers,
      body: JSON.stringify(annForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddAnn(false);
      setAnnForm({ title: '', content: '', category: 'Akademik', targetRole: 'Semua', colorDot: 'emerald' });
      notify('Pengumuman resmi berhasil dipublikasikan.');
    }
  };

  // ==========================================================================
  // 6. LAPORAN (PDF & EXCEL EXPORT)
  // ==========================================================================
  const [reportType, setReportType] = useState<'nilai' | 'absensi' | 'siswa'>('nilai');

  const handleExportExcel = () => {
    let tableHtml = '';
    if (reportType === 'nilai') {
      tableHtml = `
        <table border="1">
          <thead>
            <tr style="background:#064E3B;color:#ffffff;font-weight:bold;">
              <th>No</th><th>NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Mata Pelajaran</th>
              <th>Nilai Tugas</th><th>Nilai UH</th><th>Nilai UTS</th><th>Nilai UAS</th><th>Nilai Akhir</th><th>Predikat</th>
            </tr>
          </thead>
          <tbody>
            ${grades
              .map(
                (g, i) => `
              <tr>
                <td>${i + 1}</td><td>'${g.nisn}</td><td>${g.studentName}</td><td>${g.className}</td>
                <td>${g.subjectName}</td><td>${g.tugasScore}</td><td>${g.uhScore}</td>
                <td>${g.utsScore}</td><td>${g.uasScore}</td><td>${g.finalScore}</td><td>${g.predicate}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else if (reportType === 'absensi') {
      const rows = attendance.flatMap((rec) =>
        rec.entries.map((e) => ({
          date: rec.date,
          className: rec.className,
          subjectName: rec.subjectName,
          nisn: e.nisn,
          studentName: e.studentName,
          status: e.status,
          note: e.note,
        }))
      );
      tableHtml = `
        <table border="1">
          <thead>
            <tr style="background:#064E3B;color:#ffffff;font-weight:bold;">
              <th>No</th><th>Tanggal</th><th>Kelas</th><th>Mata Pelajaran</th><th>NISN</th><th>Nama Siswa</th><th>Status Kehadiran</th><th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r, i) => `
              <tr>
                <td>${i + 1}</td><td>${r.date}</td><td>${r.className}</td><td>${r.subjectName}</td>
                <td>'${r.nisn}</td><td>${r.studentName}</td><td>${r.status}</td><td>${r.note}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    } else {
      tableHtml = `
        <table border="1">
          <thead>
            <tr style="background:#064E3B;color:#ffffff;font-weight:bold;">
              <th>No</th><th>NISN</th><th>NIS</th><th>Nama Lengkap Siswa</th><th>L/P</th><th>Kelas</th><th>Jurusan</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${students
              .slice(0, 100)
              .map(
                (s, i) => `
              <tr>
                <td>${i + 1}</td><td>'${s.nisn}</td><td>'${s.nis}</td><td>${s.name}</td>
                <td>${s.gender}</td><td>${s.className}</td><td>${s.major}</td><td>${s.status}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>`;
    }

    const fullExcelDoc = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <h2>LAPORAN RESMI ${settings.schoolName.toUpperCase()}</h2>
        <p>${settings.slogan} | Tahun Ajaran ${settings.activeAcademicYear} Semester ${settings.activeSemester}</p>
        ${tableHtml}
      </body>
      </html>`;

    const blob = new Blob([fullExcelDoc], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_${reportType.toUpperCase()}_MA_EL_BAYAN_${settings.activeAcademicYear.replace('/', '-')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    notify('File Laporan Excel (.xls) berhasil diunduh!');
  };

  const handleDownloadPdf = () => {
    window.print();
    notify('Dokumen Laporan PDF siap dicetak atau disimpan sebagai PDF.');
  };

  // ==========================================================================
  // 7. PENGATURAN SEKOLAH & PROFIL STATE
  // ==========================================================================
  const [settingsTab, setSettingsTab] = useState<'profil' | 'sekolah'>('sekolah');
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '0812-3456-7890',
    nipOrNisn: user.nipOrNisn,
    subjectSpecialty: user.subjectSpecialty || '',
    avatarUrl: user.avatarUrl || '',
    newPassword: '',
  });
  const [schoolForm, setSchoolForm] = useState<SchoolSettings>({ ...settings });

  useEffect(() => {
    setProfileForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '0812-3456-7890',
      nipOrNisn: user.nipOrNisn,
      subjectSpecialty: user.subjectSpecialty || '',
      avatarUrl: user.avatarUrl || '',
      newPassword: '',
    });
  }, [user]);

  useEffect(() => {
    setSchoolForm({ ...settings });
  }, [settings]);

  const handleImageFileToDataUrl = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => cb(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/auth/profile', {
      method: 'PUT',
      headers,
      body: JSON.stringify(profileForm),
    });
    if (res.ok) {
      const data = await res.json();
      onUserUpdated(data.user);
      await onRefresh();
      notify('Profil pengguna berhasil diperbarui.');
    }
  };

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/settings', {
      method: 'PUT',
      headers,
      body: JSON.stringify(schoolForm),
    });
    if (res.ok) {
      await onRefresh();
      notify('Pengaturan identitas sekolah, logo, dan foto gedung berhasil disimpan!');
    }
  };

  // ==========================================================================
  // RENDER BY MODE
  // ==========================================================================

  if (mode === 'absensi') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Presensi & Kehadiran Siswa Harian</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencatatan kehadiran siswa per mata pelajaran dan rekapitulasi ketertiban belajar di MA EL-BAYAN.
              </p>
            </div>
            {canTeach && (
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Absensi Pertemuan Ini</span>
              </button>
            )}
          </div>

          {canTeach && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Pilih Kelas</label>
                <select
                  value={attClass}
                  onChange={(e) => setAttClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                <select
                  value={attSubject}
                  onChange={(e) => setAttSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Tanggal Pertemuan</label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Materi / Topik Pertemuan</label>
                <input
                  type="text"
                  value={attTopic}
                  onChange={(e) => setAttTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Interactive Attendance Sheet */}
        {canTeach && (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Lembar Input Kehadiran — {attClass} ({attSubject})
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                Klik status Hadir / Izin / Sakit / Alfa lalu klik Simpan
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-600 bg-slate-50/50">
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">NISN</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Status Kehadiran</th>
                    <th className="py-3 px-4">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((st, idx) => {
                    const currentSt = statusMap[st.id] || 'Hadir';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-slate-500 tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono tabular-nums">{st.nisn}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{st.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {(['Hadir', 'Izin', 'Sakit', 'Alfa'] as const).map((statusOpt) => {
                              const active = currentSt === statusOpt;
                              const activeStyle =
                                statusOpt === 'Hadir'
                                  ? 'bg-[#065F46] text-white'
                                  : statusOpt === 'Izin'
                                  ? 'bg-blue-600 text-white'
                                  : statusOpt === 'Sakit'
                                  ? 'bg-amber-500 text-slate-950'
                                  : 'bg-red-600 text-white';
                              return (
                                <button
                                  key={statusOpt}
                                  type="button"
                                  onClick={() => setStatusMap({ ...statusMap, [st.id]: statusOpt })}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                                    active ? activeStyle : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  {statusOpt}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={noteMap[st.id] || ''}
                            onChange={(e) => setNoteMap({ ...noteMap, [st.id]: e.target.value })}
                            placeholder="Tepat waktu / keterangan izin..."
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Saved Attendance Records History */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Riwayat Jurnal Presensi Tersimpan</h3>
          {attendance.map((rec) => {
            const hadir = rec.entries.filter((e) => e.status === 'Hadir').length;
            const izin = rec.entries.filter((e) => e.status === 'Izin').length;
            const sakit = rec.entries.filter((e) => e.status === 'Sakit').length;
            const alfa = rec.entries.filter((e) => e.status === 'Alfa').length;
            return (
              <div key={rec.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{rec.subjectName}</span> ·{' '}
                    <span className="font-semibold text-slate-800">{rec.className}</span> ·{' '}
                    <span className="text-slate-500">{rec.date}</span>
                    <div className="text-slate-700 font-medium mt-0.5">{rec.topic}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold tabular-nums">
                    <span className="text-emerald-700">Hadir: {hadir}</span>
                    <span className="text-blue-700">Izin: {izin}</span>
                    <span className="text-amber-700">Sakit: {sakit}</span>
                    <span className="text-red-700">Alfa: {alfa}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'nilai') {
    const filteredGrades = grades.filter(
      (g) => gradeSubFilter === 'Semua' || g.subjectName === gradeSubFilter
    );
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Nilai Akademik & Rapor Digital Madrasah</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi nilai Tugas, Ulangan Harian, PTS/UTS, PAS/UAS, serta Predikat Ketuntasan Kurikulum MA.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={gradeSubFilter}
              onChange={(e) => setGradeSubFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold"
            >
              <option value="Semua">Semua Mata Pelajaran</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            {canTeach && (
              <button
                type="button"
                onClick={() => setShowAddGrade(true)}
                className="px-4 py-2 rounded-xl bg-[#065F46] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Input Nilai Siswa</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">Nama Siswa & NISN</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-right">Tugas</th>
                  <th className="py-3 px-4 text-right">UH</th>
                  <th className="py-3 px-4 text-right">UTS</th>
                  <th className="py-3 px-4 text-right">UAS</th>
                  <th className="py-3 px-4 text-right">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4">Deskripsi Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-emerald-50/30">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{g.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">{g.nisn}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{g.className}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{g.subjectName}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{g.tugasScore}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{g.uhScore}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{g.utsScore}</td>
                    <td className="py-3 px-4 text-right tabular-nums">{g.uasScore}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-800 tabular-nums">
                      {g.finalScore}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{g.predicate}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{g.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddGrade && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Input Nilai Akademik Siswa</h3>
                <button type="button" onClick={() => setShowAddGrade(false)} className="text-xs text-slate-500">
                  Tutup ✕
                </button>
              </div>
              <form onSubmit={handleSaveGrade} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                    <select
                      value={gradeForm.studentName}
                      onChange={(e) => {
                        const st = students.find((s) => s.name === e.target.value);
                        setGradeForm({
                          ...gradeForm,
                          studentName: e.target.value,
                          nisn: st?.nisn || '0084921034',
                          className: st?.className || 'Kelas X-A',
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {students.slice(0, 20).map((s) => (
                        <option key={s.id} value={s.name}>{s.name} ({s.className})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                    <select
                      value={gradeForm.subjectName}
                      onChange={(e) => setGradeForm({ ...gradeForm, subjectName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tugas</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeForm.tugasScore}
                      onChange={(e) => setGradeForm({ ...gradeForm, tugasScore: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UH / Kuis</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeForm.uhScore}
                      onChange={(e) => setGradeForm({ ...gradeForm, uhScore: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UTS / PTS</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeForm.utsScore}
                      onChange={(e) => setGradeForm({ ...gradeForm, utsScore: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UAS / PAS</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeForm.uasScore}
                      onChange={(e) => setGradeForm({ ...gradeForm, uasScore: Number(e.target.value) })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 tabular-nums"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Capaian Kompetensi</label>
                  <textarea
                    rows={2}
                    value={gradeForm.description}
                    onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddGrade(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Nilai Rapor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'jadwal') {
    const days = ['Semua', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const filteredSch = schedules.filter((s) => dayFilter === 'Semua' || s.day === dayFilter);
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Jadwal Pelajaran Madrasah Aliyah</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal kegiatan belajar mengajar (KBM) Tahun Pelajaran {settings.activeAcademicYear} Semester {settings.activeSemester}.
            </p>
          </div>
          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => setShowAddSchedule(true)}
              className="px-4 py-2.5 rounded-xl bg-[#065F46] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal KBM</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200/80">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDayFilter(d)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                dayFilter === d ? 'bg-[#065F46] text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="py-3 px-4">Hari</th>
                <th className="py-3 px-4">Jam Pelajaran</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Kelas & Ruang</th>
                <th className="py-3 px-4">Guru Pengampu</th>
                {user.role === 'admin' && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSch.map((s) => (
                <tr key={s.id} className="hover:bg-emerald-50/30">
                  <td className="py-3.5 px-4 font-bold text-emerald-800">{s.day}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                    {s.startTime} – {s.endTime} WIB
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.subjectName}</td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="font-semibold text-emerald-700">{s.className}</span> · {s.room}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{s.teacherName}</td>
                  {user.role === 'admin' && (
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await apiFetch(`/api/schedules/${s.id}`, { method: 'DELETE', headers });
                          if (res.ok) {
                            await onRefresh();
                            notify('Jadwal pelajaran dihapus.');
                          }
                        }}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddSchedule && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Tambah Jadwal Pelajaran</h3>
                <button type="button" onClick={() => setShowAddSchedule(false)} className="text-xs text-slate-500">
                  Tutup ✕
                </button>
              </div>
              <form onSubmit={handleSaveSchedule} className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hari</label>
                    <select
                      value={schForm.day}
                      onChange={(e) => setSchForm({ ...schForm, day: e.target.value as any })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mulai</label>
                    <input
                      type="text"
                      value={schForm.startTime}
                      onChange={(e) => setSchForm({ ...schForm, startTime: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Selesai</label>
                    <input
                      type="text"
                      value={schForm.endTime}
                      onChange={(e) => setSchForm({ ...schForm, endTime: e.target.value })}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={schForm.subjectName}
                    onChange={(e) => setSchForm({ ...schForm, subjectName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={schForm.className}
                      onChange={(e) => setSchForm({ ...schForm, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ruangan</label>
                    <input
                      type="text"
                      value={schForm.room}
                      onChange={(e) => setSchForm({ ...schForm, room: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddSchedule(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'forum') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Forum Diskusi Ilmiah & Tanya Jawab</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ruang muzakarah keilmuan, tanya jawab pelajaran, dan diskusi interaktif antara Guru dan Siswa MA EL-BAYAN.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewThread(true)}
            className="px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Topik Diskusi</span>
          </button>
        </div>

        <div className="space-y-4">
          {forums.map((th) => (
            <div key={th.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-emerald-700">
                    {th.subjectName} · {th.className}
                  </span>
                  <span>{th.createdAt}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{th.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Oleh: <span className="font-semibold text-slate-700">{th.authorName}</span> ({th.authorRole.toUpperCase()})
                </p>
                <p className="text-sm text-slate-700 mt-2.5 leading-relaxed">{th.content}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleLikeThread(th.id)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{th.likes} Apresiasi</span>
                  </button>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {th.replies.length} Balasan Diskusi
                  </span>
                </div>
                {(canTeach || canAdmin) && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await apiFetch(`/api/forums/${th.id}`, { method: 'DELETE', headers });
                      if (res.ok) {
                        await onRefresh();
                        notify('Topik diskusi dihapus.');
                      }
                    }}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Topik</span>
                  </button>
                )}
              </div>

              {/* Replies List */}
              {th.replies.length > 0 && (
                <div className="space-y-2.5 pl-4 border-l border-slate-200">
                  {th.replies.map((rep) => (
                    <div key={rep.id} className="p-3 rounded-xl bg-slate-50 text-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">
                          {rep.authorName} ({rep.authorRole.toUpperCase()})
                        </span>
                        <span>{rep.createdAt}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{rep.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Reply Box */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={replyInputs[th.id] || ''}
                  onChange={(e) => setReplyInputs({ ...replyInputs, [th.id]: e.target.value })}
                  placeholder="Tulis tanggapan atau jawaban diskusi yang santun..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => handleSendReply(th.id)}
                  className="px-4 py-2 rounded-xl bg-[#065F46] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {showNewThread && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Buat Topik Diskusi Baru</h3>
                <button type="button" onClick={() => setShowNewThread(false)} className="text-xs text-slate-500">
                  Tutup ✕
                </button>
              </div>
              <form onSubmit={handleCreateThread} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Topik Diskusi</label>
                  <input
                    type="text"
                    required
                    value={threadForm.title}
                    onChange={(e) => setThreadForm({ ...threadForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                    <select
                      value={threadForm.subjectName}
                      onChange={(e) => setThreadForm({ ...threadForm, subjectName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={threadForm.className}
                      onChange={(e) => setThreadForm({ ...threadForm, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Isi Pertanyaan / Bahasan</label>
                  <textarea
                    rows={4}
                    required
                    value={threadForm.content}
                    onChange={(e) => setThreadForm({ ...threadForm, content: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowNewThread(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Terbitkan Diskusi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'pengumuman') {
    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Papan Pengumuman Resmi MA EL-BAYAN</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Informasi agenda akademik, pelaksanaan ujian semester, Pondok Ramadhan, dan pengumpulan tugas.
            </p>
          </div>
          {(canTeach || canAdmin) && (
            <button
              type="button"
              onClick={() => setShowAddAnn(true)}
              className="px-4 py-2.5 rounded-xl bg-[#065F46] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Pengumuman Baru</span>
            </button>
          )}
        </div>

        <div className="space-y-3.5">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-emerald-700">{ann.category}</span>
                  <span>·</span>
                  <span>Target: {ann.targetRole}</span>
                  <span>·</span>
                  <span>{ann.date} ({ann.relativeTime})</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{ann.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{ann.content}</p>
                <div className="text-xs text-slate-400 pt-1">Diterbitkan oleh: {ann.authorName}</div>
              </div>
              {canAdmin && (
                <button
                  type="button"
                  onClick={async () => {
                    await apiFetch(`/api/announcements/${ann.id}`, { method: 'DELETE', headers });
                    await onRefresh();
                    notify('Pengumuman dihapus.');
                  }}
                  className="p-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {showAddAnn && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Terbitkan Pengumuman Madrasah</h3>
                <button type="button" onClick={() => setShowAddAnn(false)} className="text-xs text-slate-500">
                  Tutup ✕
                </button>
              </div>
              <form onSubmit={handleSaveAnn} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    value={annForm.title}
                    onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={annForm.category}
                      onChange={(e) => setAnnForm({ ...annForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Ujian">Ujian</option>
                      <option value="Tugas">Tugas</option>
                      <option value="Kegiatan">Kegiatan</option>
                      <option value="Akademik">Akademik</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Penerima</label>
                    <select
                      value={annForm.targetRole}
                      onChange={(e) => setAnnForm({ ...annForm, targetRole: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Semua">Semua Warga Madrasah</option>
                      <option value="Siswa">Khusus Siswa</option>
                      <option value="Guru">Khusus Dewan Guru</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Isi Pengumuman</label>
                  <textarea
                    rows={4}
                    required
                    value={annForm.content}
                    onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddAnn(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Publikasikan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'laporan') {
    return (
      <div className="space-y-5">
        {/* Control Bar (Hidden when printing PDF) */}
        <div className="no-print bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Pusat Laporan Akademik (Unduh PDF & Excel)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak dokumen laporan resmi berkop Madrasah Aliyah EL-BAYAN dalam format PDF atau unduh tabel Excel (.xls).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {([
                { id: 'nilai', label: 'Laporan Nilai Akademik' },
                { id: 'absensi', label: 'Laporan Kehadiran Siswa' },
                { id: 'siswa', label: 'Laporan Data Induk Siswa' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setReportType(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    reportType === t.id ? 'bg-[#065F46] text-white' : 'text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Download Excel (.xls)</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Download PDF</span>
            </button>
          </div>
        </div>

        {/* Official Printable Kop Surat Madrasah Document */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          {/* Kop Surat Resmi */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-6">
            <MadrasahLogo logoUrl={settings.logoUrl} size="lg" />
            <div className="text-center flex-1">
              <div className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
                YAYASAN PENDIDIKAN ISLAM PONDOK PESANTREN TERPADU EL-BAYAN
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 uppercase mt-0.5">
                MADRASAH ALIYAH (MA) {settings.shortName.replace('MA ', '')}
              </h1>
              <div className="text-xs font-semibold text-slate-700">
                {settings.accreditation} · NSM: {settings.nsm} · NPSN: {settings.npsn}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {settings.address} · Telp: {settings.phone} · Email: {settings.email}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900 uppercase underline">
              {reportType === 'nilai'
                ? 'LAPORAN REKAPITULASI NILAI AKADEMIK SISWA'
                : reportType === 'absensi'
                ? 'LAPORAN REKAPITULASI KEHADIRAN PEMBELAJARAN SISWA'
                : 'LAPORAN DATA INDUK PESERTA DIDIK AKTIF'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Tahun Pelajaran {settings.activeAcademicYear} — Semester {settings.activeSemester}
            </p>
          </div>

          {reportType === 'nilai' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="border border-slate-300 py-2 px-3">No</th>
                  <th className="border border-slate-300 py-2 px-3">NISN</th>
                  <th className="border border-slate-300 py-2 px-3">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-3">Kelas</th>
                  <th className="border border-slate-300 py-2 px-3">Mata Pelajaran</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">Tugas</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">UH</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">UTS</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">UAS</th>
                  <th className="border border-slate-300 py-2 px-3 text-right">Nilai Akhir</th>
                  <th className="border border-slate-300 py-2 px-3 text-center">Predikat</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, i) => (
                  <tr key={g.id}>
                    <td className="border border-slate-300 py-2 px-3 tabular-nums">{i + 1}</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono tabular-nums">{g.nisn}</td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold">{g.studentName}</td>
                    <td className="border border-slate-300 py-2 px-3">{g.className}</td>
                    <td className="border border-slate-300 py-2 px-3">{g.subjectName}</td>
                    <td className="border border-slate-300 py-2 px-3 text-right tabular-nums">{g.tugasScore}</td>
                    <td className="border border-slate-300 py-2 px-3 text-right tabular-nums">{g.uhScore}</td>
                    <td className="border border-slate-300 py-2 px-3 text-right tabular-nums">{g.utsScore}</td>
                    <td className="border border-slate-300 py-2 px-3 text-right tabular-nums">{g.uasScore}</td>
                    <td className="border border-slate-300 py-2 px-3 text-right font-bold tabular-nums">{g.finalScore}</td>
                    <td className="border border-slate-300 py-2 px-3 text-center font-bold">{g.predicate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'absensi' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="border border-slate-300 py-2 px-3">No</th>
                  <th className="border border-slate-300 py-2 px-3">Tanggal</th>
                  <th className="border border-slate-300 py-2 px-3">Kelas</th>
                  <th className="border border-slate-300 py-2 px-3">Mata Pelajaran</th>
                  <th className="border border-slate-300 py-2 px-3">Nama Siswa</th>
                  <th className="border border-slate-300 py-2 px-3">Status</th>
                  <th className="border border-slate-300 py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {attendance.flatMap((rec) =>
                  rec.entries.map((e, idx) => (
                    <tr key={`${rec.id}-${idx}`}>
                      <td className="border border-slate-300 py-2 px-3 tabular-nums">{idx + 1}</td>
                      <td className="border border-slate-300 py-2 px-3 tabular-nums">{rec.date}</td>
                      <td className="border border-slate-300 py-2 px-3">{rec.className}</td>
                      <td className="border border-slate-300 py-2 px-3">{rec.subjectName}</td>
                      <td className="border border-slate-300 py-2 px-3 font-semibold">{e.studentName}</td>
                      <td className="border border-slate-300 py-2 px-3 font-bold">{e.status}</td>
                      <td className="border border-slate-300 py-2 px-3">{e.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {reportType === 'siswa' && (
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="border border-slate-300 py-2 px-3">No</th>
                  <th className="border border-slate-300 py-2 px-3">NISN</th>
                  <th className="border border-slate-300 py-2 px-3">Nama Lengkap</th>
                  <th className="border border-slate-300 py-2 px-3">L/P</th>
                  <th className="border border-slate-300 py-2 px-3">Kelas</th>
                  <th className="border border-slate-300 py-2 px-3">Jurusan</th>
                  <th className="border border-slate-300 py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 25).map((s, i) => (
                  <tr key={s.id}>
                    <td className="border border-slate-300 py-2 px-3 tabular-nums">{i + 1}</td>
                    <td className="border border-slate-300 py-2 px-3 font-mono tabular-nums">{s.nisn}</td>
                    <td className="border border-slate-300 py-2 px-3 font-semibold">{s.name}</td>
                    <td className="border border-slate-300 py-2 px-3">{s.gender}</td>
                    <td className="border border-slate-300 py-2 px-3">{s.className}</td>
                    <td className="border border-slate-300 py-2 px-3">{s.major}</td>
                    <td className="border border-slate-300 py-2 px-3">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Signature Block */}
          <div className="pt-8 flex justify-end text-xs">
            <div className="text-center w-64 space-y-14">
              <div>
                <div>Ditetapkan pada: 8 Desember 2025</div>
                <div className="font-bold">Kepala Madrasah Aliyah EL-BAYAN</div>
              </div>
              <div>
                <div className="font-bold underline text-slate-900">{settings.headmasterName}</div>
                <div className="text-slate-600 font-mono">NIP. {settings.headmasterNip}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MODE 7: PENGATURAN SEKOLAH & PROFIL PENGGUNA
  // ==========================================================================
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Sekolah & Profil Pengguna</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola identitas resmi E-Learning MA EL-BAYAN, ganti logo madrasah, ganti foto gedung sekolah, serta pengaturan akun pribadi.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setSettingsTab('sekolah')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              settingsTab === 'sekolah' ? 'bg-[#065F46] text-white' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Identitas, Logo & Gedung Sekolah</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsTab('profil')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
              settingsTab === 'profil' ? 'bg-[#065F46] text-white' : 'text-slate-600'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profil & Password Saya</span>
          </button>
        </div>
      </div>

      {settingsTab === 'sekolah' ? (
        <form onSubmit={handleSaveSchoolSettings} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Logo & Building Photo Upload */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Logo Resmi Madrasah</h3>
              <div className="flex items-center gap-4">
                <MadrasahLogo logoUrl={schoolForm.logoUrl} size="lg" />
                <div className="space-y-2 text-xs">
                  <p className="text-slate-500">
                    Unggah file gambar (PNG/JPG/SVG) untuk mengganti logo resmi di Sidebar, Login, dan Kop Laporan.
                  </p>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold cursor-pointer inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageFileToDataUrl(e, (durl) =>
                            setSchoolForm({ ...schoolForm, logoUrl: durl })
                          )
                        }
                        className="hidden"
                      />
                    </label>
                    {schoolForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setSchoolForm({ ...schoolForm, logoUrl: '' })}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Default</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">2. Foto Gedung Sekolah (Banner Utama)</h3>
              <div className="h-36 rounded-xl overflow-hidden border border-slate-200 relative bg-[#064E3B]">
                {schoolForm.bannerBuildingUrl &&
                !schoolForm.bannerBuildingUrl.includes('Modern_Islamic_E-Learning_Dashboard_3dfd0007.png') ? (
                  <img
                    src={schoolForm.bannerBuildingUrl}
                    alt="Preview Gedung"
                    className="w-full h-full object-cover object-[center_52%]"
                  />
                ) : (
                  <img
                    src="/assets/aistudio/image_332d94df.png"
                    alt="Gedung Asli MA EL-BAYAN"
                    className="w-full h-full object-cover object-[center_52%]"
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <label className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ganti Foto Gedung Sekolah</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageFileToDataUrl(e, (durl) =>
                        setSchoolForm({ ...schoolForm, bannerBuildingUrl: durl })
                      )
                    }
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSchoolForm({
                      ...schoolForm,
                      bannerBuildingUrl: '/assets/aistudio/image_332d94df.png',
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Gunakan Foto Gedung Asli</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: School Identity Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              3. Pengaturan Identitas Resmi Madrasah
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Sistem E-Learning</label>
                <input
                  type="text"
                  value={schoolForm.schoolName}
                  onChange={(e) => setSchoolForm({ ...schoolForm, schoolName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Singkat Madrasah</label>
                <input
                  type="text"
                  value={schoolForm.shortName}
                  onChange={(e) => setSchoolForm({ ...schoolForm, shortName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slogan Resmi Madrasah</label>
              <input
                type="text"
                value={schoolForm.slogan}
                onChange={(e) => setSchoolForm({ ...schoolForm, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Statistik Madrasah (NSM)</label>
                <input
                  type="text"
                  value={schoolForm.nsm}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nsm: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN</label>
                <input
                  type="text"
                  value={schoolForm.npsn}
                  onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Akreditasi</label>
                <input
                  type="text"
                  value={schoolForm.accreditation}
                  onChange={(e) => setSchoolForm({ ...schoolForm, accreditation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Madrasah</label>
                <input
                  type="text"
                  value={schoolForm.headmasterName}
                  onChange={(e) => setSchoolForm({ ...schoolForm, headmasterName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  value={schoolForm.headmasterNip}
                  onChange={(e) => setSchoolForm({ ...schoolForm, headmasterNip: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap Madrasah</label>
              <input
                type="text"
                value={schoolForm.address}
                onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={!canAdmin}
                className="px-6 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Sekolah</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs max-w-2xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Edit Profil Pengguna ({user.roleLabel})
          </h3>

          {/* Foto Profil Upload */}
          <div className="flex items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-700/30 bg-emerald-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {profileForm.avatarUrl || user.role === 'kepsek' ? (
                <img
                  src={
                    profileForm.avatarUrl ||
                    '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png'
                  }
                  alt={profileForm.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span>{profileForm.name.charAt(0)}</span>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-slate-800">Foto Profil ({user.roleLabel})</div>
              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Foto Profil</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageFileToDataUrl(e, (durl) =>
                        setProfileForm({ ...profileForm, avatarUrl: durl })
                      )
                    }
                    className="hidden"
                  />
                </label>
                {profileForm.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, avatarUrl: '' })}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NIP / NISN</label>
              <input
                type="text"
                value={profileForm.nipOrNisn}
                onChange={(e) => setProfileForm({ ...profileForm, nipOrNisn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">No. Telepon / WhatsApp</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password Baru (Kosongkan jika tidak ingin mengganti password)
            </label>
            <input
              type="password"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
              placeholder="Minimal 6 karakter"
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
            />
          </div>
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

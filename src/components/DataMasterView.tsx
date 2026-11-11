import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  BookOpen,
  Building2,
  Layers,
  Shield,
  Calendar,
  Plus,
  Search,
  Trash2,
  Edit3,
  CheckCircle2,
  Download,
} from 'lucide-react';
import {
  AcademicYear,
  Major,
  SchoolClass,
  StudentData,
  Subject,
  TeacherData,
  UserAccount,
  UserRole,
} from '../types.ts';
import { apiFetch } from '../utils/api.ts';

interface DataMasterProps {
  token: string;
  userRole: UserRole;
  students: StudentData[];
  teachers: TeacherData[];
  classes: SchoolClass[];
  majors: Major[];
  subjects: Subject[];
  users: UserAccount[];
  academicYears: AcademicYear[];
  onRefresh: () => Promise<void>;
  notify: (msg: string) => void;
}

type MasterSubTab = 'siswa' | 'guru' | 'kelas' | 'jurusan' | 'mapel' | 'akun' | 'tahun-ajaran';

export const DataMasterView: React.FC<DataMasterProps> = ({
  token,
  userRole,
  students,
  teachers,
  classes,
  majors,
  subjects,
  users,
  academicYears,
  onRefresh,
  notify,
}) => {
  const [subTab, setSubTab] = useState<MasterSubTab>('siswa');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const canEdit = userRole === 'admin';

  // Form States
  const [studentForm, setStudentForm] = useState({
    nisn: '',
    nis: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    className: 'Kelas X-A',
    major: 'MIPA / Sains',
    email: '',
    parentName: '',
    status: 'Aktif' as 'Aktif' | 'Lulus' | 'Pindah',
  });

  const [teacherForm, setTeacherForm] = useState({
    nip: '',
    name: '',
    email: '',
    phone: '',
    subject: "Al-Qur'an Hadis",
    education: 'S1 Pendidikan Agama Islam',
    status: 'GTY' as 'PNS' | 'GTY' | 'Honorer',
  });

  const [classForm, setClassForm] = useState({
    name: '',
    level: 'X' as 'X' | 'XI' | 'XII',
    majorCode: 'MIPA',
    homeroomTeacher: '',
    roomNumber: '',
    capacity: 32,
  });

  const [majorForm, setMajorForm] = useState({
    code: '',
    name: '',
    headOfMajor: '',
    description: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    category: 'PAI & Bahasa Arab' as Subject['category'],
    gradeLevels: 'X, XI, XII',
    teacherName: '',
    hoursPerWeek: 4,
    kkm: 78,
  });

  const [userForm, setUserForm] = useState({
    name: '',
    username: '',
    email: '',
    role: 'siswa' as UserRole,
    nipOrNisn: '',
    className: 'Kelas X-A',
    subjectSpecialty: '',
    password: 'password123',
  });

  const [ayForm, setAyForm] = useState({
    year: '2026/2027',
    semester: 'Ganjil' as 'Ganjil' | 'Genap',
    startDate: '2026-07-13',
    endDate: '2026-12-19',
    isActive: true,
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/students/${editingId}` : '/api/master/students';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(studentForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify(editingId ? 'Data siswa berhasil diperbarui.' : 'Siswa baru berhasil ditambahkan ke database.');
    }
  };

  const handleDelete = async (endpoint: string, id: string, label: string) => {
    const res = await apiFetch(`/api/master/${endpoint}/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      await onRefresh();
      notify(`${label} berhasil dihapus dari database.`);
    }
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/teachers/${editingId}` : '/api/master/teachers';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(teacherForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify(editingId ? 'Data guru berhasil diperbarui.' : 'Guru baru berhasil ditambahkan.');
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/classes/${editingId}` : '/api/master/classes';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(classForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify(editingId ? 'Data kelas berhasil diperbarui.' : 'Kelas baru berhasil ditambahkan.');
    }
  };

  const handleSaveMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/majors/${editingId}` : '/api/master/majors';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(majorForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify(editingId ? 'Data jurusan berhasil diperbarui.' : 'Program jurusan baru berhasil ditambahkan.');
    }
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/subjects/${editingId}` : '/api/master/subjects';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(subjectForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify('Mata pelajaran berhasil disimpan.');
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/master/users/${editingId}` : '/api/master/users';
    const method = editingId ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, headers, body: JSON.stringify(userForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      setEditingId(null);
      notify(
        editingId
          ? 'Data akun pengguna berhasil diperbarui.'
          : 'Akun pengguna baru berhasil dibuat dengan password terenkripsi.'
      );
    }
  };

  const handleSaveAy = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/master/academic-years', { method: 'POST', headers, body: JSON.stringify(ayForm) });
    if (res.ok) {
      await onRefresh();
      setShowModal(false);
      notify('Tahun ajaran berhasil disimpan.');
    }
  };

  const handleActivateAy = async (id: string) => {
    const res = await apiFetch(`/api/master/academic-years/${id}/activate`, { method: 'PUT', headers });
    if (res.ok) {
      await onRefresh();
      notify('Tahun ajaran & semester aktif berhasil diperbarui.');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn.toLowerCase().includes(search.toLowerCase()) ||
      s.className.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === 'Semua' || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header & Interactive Sub-Navigation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Manajemen Data Master Sekolah</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pusat pengelolaan data induk Siswa, Guru, Kelas, Jurusan, Mata Pelajaran Kurikulum MA, Akun, dan Tahun Ajaran.
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setStudentForm({
                  nisn: '',
                  nis: '',
                  name: '',
                  gender: 'L',
                  className: 'Kelas X-A',
                  major: 'MIPA / Sains',
                  email: '',
                  parentName: '',
                  status: 'Aktif',
                });
                setTeacherForm({
                  nip: '',
                  name: '',
                  email: '',
                  phone: '',
                  subject: "Al-Qur'an Hadis",
                  education: 'S1 Pendidikan Agama Islam',
                  status: 'GTY',
                });
                setClassForm({
                  name: '',
                  level: 'X',
                  majorCode: 'MIPA',
                  homeroomTeacher: '',
                  roomNumber: '',
                  capacity: 32,
                });
                setMajorForm({ code: '', name: '', headOfMajor: '', description: '' });
                setSubjectForm({
                  code: '',
                  name: '',
                  category: 'PAI & Bahasa Arab',
                  gradeLevels: 'X, XI, XII',
                  teacherName: '',
                  hoursPerWeek: 4,
                  kkm: 78,
                });
                setUserForm({
                  name: '',
                  username: '',
                  email: '',
                  role: 'siswa',
                  nipOrNisn: '',
                  className: 'Kelas X-A',
                  subjectSpecialty: '',
                  password: 'password123',
                });
                setShowModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Data {subTab.toUpperCase()}</span>
            </button>
          )}
        </div>

        {/* Segmented Sub-Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
          {([
            { id: 'siswa', label: `Data Siswa (${students.length})`, icon: Users },
            { id: 'guru', label: `Data Guru (${teachers.length})`, icon: UserCheck },
            { id: 'mapel', label: `Mata Pelajaran (${subjects.length})`, icon: BookOpen },
            { id: 'kelas', label: `Kelas (${classes.length})`, icon: Building2 },
            { id: 'jurusan', label: `Jurusan (${majors.length})`, icon: Layers },
            { id: 'akun', label: `Akun Pengguna (${users.length})`, icon: Shield },
            { id: 'tahun-ajaran', label: 'Tahun Ajaran & Semester', icon: Calendar },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setSubTab(tab.id);
                  setSearch('');
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'bg-[#065F46] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {(subTab === 'siswa' || subTab === 'guru' || subTab === 'mapel') && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Cari nama, nomor induk, atau kata kunci...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>
          {subTab === 'siswa' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 whitespace-nowrap">Filter Kelas:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700"
              >
                <option value="Semua">Semua Kelas ({students.length} Siswa)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: DATA SISWA */}
      {subTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">NISN / NIS</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-4">L/P</th>
                  <th className="py-3 px-4">Kelas & Jurusan</th>
                  <th className="py-3 px-4">Orang Tua / Wali</th>
                  <th className="py-3 px-4">Status</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.slice(0, 50).map((s, i) => (
                  <tr key={s.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{i + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">
                      <div className="font-semibold">{s.nisn}</div>
                      <div className="text-[11px] text-slate-400">NIS: {s.nis}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{s.gender}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-800">{s.className}</div>
                      <div className="text-[11px] text-slate-500">{s.major}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.parentName}</td>
                    <td className="py-3 px-4 font-medium text-emerald-700">{s.status}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(s.id);
                              setStudentForm({
                                nisn: s.nisn,
                                nis: s.nis,
                                name: s.name,
                                gender: s.gender,
                                className: s.className,
                                major: s.major,
                                email: s.email,
                                parentName: s.parentName,
                                status: s.status,
                              });
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit Siswa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('students', s.id, `Siswa ${s.name}`)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between tabular-nums">
            <span>
              Menampilkan {Math.min(50, filteredStudents.length)} dari total {filteredStudents.length} siswa terdaftar di database
            </span>
            <span className="font-medium text-emerald-800">Total Siswa Aktif: {students.length}</span>
          </div>
        </div>
      )}

      {/* TAB 2: DATA GURU */}
      {subTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">NIP / NUPTK</th>
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">Mata Pelajaran Diampu</th>
                  <th className="py-3 px-4">Pendidikan</th>
                  <th className="py-3 px-4">Status Kepegawaian</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeachers.map((t, i) => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{i + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 tabular-nums">{t.nip}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.email} · {t.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{t.subject}</td>
                    <td className="py-3 px-4 text-slate-600">{t.education}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.status}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(t.id);
                              setTeacherForm({
                                nip: t.nip,
                                name: t.name,
                                email: t.email,
                                phone: t.phone,
                                subject: t.subject,
                                education: t.education,
                                status: t.status,
                              });
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('teachers', t.id, `Guru ${t.name}`)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MATA PELAJARAN KURIKULUM MA */}
      {subTab === 'mapel' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">Kode</th>
                  <th className="py-3 px-4">Nama Mata Pelajaran</th>
                  <th className="py-3 px-4">Kelompok Kurikulum MA</th>
                  <th className="py-3 px-4">Tingkat</th>
                  <th className="py-3 px-4">Guru Pengampu Utama</th>
                  <th className="py-3 px-4 text-right">KKM / JP</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-emerald-50/30">
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{sub.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4 text-slate-600">{sub.category}</td>
                    <td className="py-3 px-4 text-slate-600">Kelas {sub.gradeLevels}</td>
                    <td className="py-3 px-4 text-slate-700">{sub.teacherName}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      KKM {sub.kkm} · {sub.hoursPerWeek} JP
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(sub.id);
                              setSubjectForm({
                                code: sub.code,
                                name: sub.name,
                                category: sub.category,
                                gradeLevels: sub.gradeLevels,
                                teacherName: sub.teacherName,
                                hoursPerWeek: sub.hoursPerWeek,
                                kkm: sub.kkm,
                              });
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit Mata Pelajaran"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('subjects', sub.id, `Mata Pelajaran ${sub.name}`)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATA KELAS */}
      {subTab === 'kelas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Tingkat {cls.level} · Jurusan {cls.majorCode}</span>
                  <span className="font-mono">{cls.roomNumber}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{cls.name}</h3>
                <p className="text-xs text-slate-600 mt-1">Wali Kelas: {cls.homeroomTeacher}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs tabular-nums">
                <span className="font-semibold text-emerald-700">
                  Kapasitas: {cls.studentCount} / {cls.capacity} Siswa
                </span>
                {canEdit && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cls.id);
                        setClassForm({
                          name: cls.name,
                          level: cls.level,
                          majorCode: cls.majorCode,
                          homeroomTeacher: cls.homeroomTeacher,
                          roomNumber: cls.roomNumber,
                          capacity: cls.capacity,
                        });
                        setShowModal(true);
                      }}
                      className="text-emerald-700 hover:underline text-xs font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete('classes', cls.id, cls.name)}
                      className="text-red-600 hover:underline text-xs cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: DATA JURUSAN */}
      {subTab === 'jurusan' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {majors.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-700">Kode Jurusan: {m.code}</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{m.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.description}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Ka. Prodi: {m.headOfMajor}</span>
                {canEdit && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(m.id);
                        setMajorForm({
                          code: m.code,
                          name: m.name,
                          headOfMajor: m.headOfMajor,
                          description: m.description,
                        });
                        setShowModal(true);
                      }}
                      className="text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete('majors', m.id, m.name)}
                      className="text-red-600 hover:underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: AKUN PENGGUNA */}
      {subTab === 'akun' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Username / Email</th>
                  <th className="py-3 px-4">Hak Akses (Role)</th>
                  <th className="py-3 px-4">NIP / NISN</th>
                  <th className="py-3 px-4">Status</th>
                  {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/30">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        {u.avatarUrl || u.role === 'kepsek' ? (
                          <img
                            src={
                              u.avatarUrl ||
                              '/assets/aistudio/Screenshot_2026-11-04_232624_1b97b0cb.png'
                            }
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover object-top border border-emerald-600/30 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="font-mono font-semibold text-slate-800">{u.username}</span> · {u.email}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{u.roleLabel}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{u.nipOrNisn}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">{u.status}</td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(u.id);
                              setUserForm({
                                name: u.name,
                                username: u.username,
                                email: u.email,
                                role: u.role,
                                nipOrNisn: u.nipOrNisn,
                                className: u.className || 'Kelas X-A',
                                subjectSpecialty: u.subjectSpecialty || '',
                                password: '',
                              });
                              setShowModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                            title="Edit Akun Pengguna"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('users', u.id, `Akun ${u.name}`)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: TAHUN AJARAN & SEMESTER */}
      {subTab === 'tahun-ajaran' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                <th className="py-3 px-4">Tahun Pelajaran</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Periode Berjalan</th>
                <th className="py-3 px-4">Status</th>
                {canEdit && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {academicYears.map((ay) => (
                <tr key={ay.id}>
                  <td className="py-3.5 px-4 font-bold text-slate-900 tabular-nums">{ay.year}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">Semester {ay.semester}</td>
                  <td className="py-3.5 px-4 text-slate-600 tabular-nums">
                    {ay.startDate} s/d {ay.endDate}
                  </td>
                  <td className="py-3.5 px-4">
                    {ay.isActive ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif Berjalan
                      </span>
                    ) : (
                      <span className="text-slate-400">Arsip / Nonaktif</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="py-3.5 px-4 text-right">
                      {!ay.isActive && (
                        <button
                          type="button"
                          onClick={() => handleActivateAy(ay.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs cursor-pointer"
                        >
                          Aktifkan Semester Ini
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL FORM TAMBAH / EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Data' : 'Tambah Data Baru'} — {subTab.toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            {subTab === 'siswa' && (
              <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                    <input
                      type="text"
                      required
                      value={studentForm.nisn}
                      onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      placeholder="0084921099"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIS Madrasah</label>
                    <input
                      type="text"
                      value={studentForm.nis}
                      onChange={(e) => setStudentForm({ ...studentForm, nis: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      placeholder="252610099"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Contoh: Ahmad Syauqi Al-Bayan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={studentForm.gender}
                      onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as 'L' | 'P' })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={studentForm.className}
                      onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      value={studentForm.parentName}
                      onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Siswa</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Data Siswa
                  </button>
                </div>
              </form>
            )}

            {subTab === 'guru' && (
              <form onSubmit={handleSaveTeacher} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / NIY</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.nip}
                    onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="198504122010011005"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Ustadz H. Fauzan Azima, Lc., M.Ag"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                    <input
                      type="text"
                      required
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={teacherForm.status}
                      onChange={(e) => setTeacherForm({ ...teacherForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="PNS">PNS Kemenag</option>
                      <option value="GTY">Guru Tetap Yayasan (GTY)</option>
                      <option value="Honorer">Guru Honorer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP / WhatsApp</label>
                    <input
                      type="text"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Data Guru
                  </button>
                </div>
              </form>
            )}

            {subTab === 'mapel' && (
              <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kode Mapel</label>
                    <input
                      type="text"
                      required
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      placeholder="PAI-QH2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelompok Mapel</label>
                    <select
                      value={subjectForm.category}
                      onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="PAI & Bahasa Arab">PAI & Bahasa Arab</option>
                      <option value="Umum (Wajib)">Umum (Wajib)</option>
                      <option value="Peminatan MIPA">Peminatan MIPA</option>
                      <option value="Peminatan IPS & Keagamaan">Peminatan IPS & Keagamaan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Contoh: Ilmu Balaghah & Mantiq"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guru Pengampu</label>
                  <input
                    type="text"
                    value={subjectForm.teacherName}
                    onChange={(e) => setSubjectForm({ ...subjectForm, teacherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Mata Pelajaran
                  </button>
                </div>
              </form>
            )}

            {subTab === 'kelas' && (
              <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
                  <input
                    type="text"
                    required
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Kelas X-E"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Wali Kelas</label>
                    <input
                      type="text"
                      required
                      value={classForm.homeroomTeacher}
                      onChange={(e) => setClassForm({ ...classForm, homeroomTeacher: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ruang Kelas</label>
                    <input
                      type="text"
                      value={classForm.roomNumber}
                      onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Kelas
                  </button>
                </div>
              </form>
            )}

            {subTab === 'jurusan' && (
              <form onSubmit={handleSaveMajor} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kode Jurusan</label>
                  <input
                    type="text"
                    required
                    value={majorForm.code}
                    onChange={(e) => setMajorForm({ ...majorForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="BHS"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Program Jurusan</label>
                  <input
                    type="text"
                    required
                    value={majorForm.name}
                    onChange={(e) => setMajorForm({ ...majorForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Bahasa dan Budaya Islam (BHS)"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={majorForm.description}
                    onChange={(e) => setMajorForm({ ...majorForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Jurusan
                  </button>
                </div>
              </form>
            )}

            {subTab === 'akun' && (
              <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Pengguna</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username Login</label>
                    <input
                      type="text"
                      required
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Hak Akses (Role)</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="kepsek">Kepala Madrasah</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Pengguna</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="nama@maelbayan.sch.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">NIP / NISN</label>
                    <input
                      type="text"
                      value={userForm.nipOrNisn}
                      onChange={(e) => setUserForm({ ...userForm, nipOrNisn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {editingId ? 'Password Baru (Opsional)' : 'Password Awal'}
                    </label>
                    <input
                      type="text"
                      required={!editingId}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingId ? 'Kosongkan jika tetap' : 'password123'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    {editingId ? 'Simpan Perubahan Akun' : 'Buat Akun Pengguna'}
                  </button>
                </div>
              </form>
            )}

            {subTab === 'tahun-ajaran' && (
              <form onSubmit={handleSaveAy} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
                    <input
                      type="text"
                      required
                      value={ayForm.year}
                      onChange={(e) => setAyForm({ ...ayForm, year: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={ayForm.semester}
                      onChange={(e) => setAyForm({ ...ayForm, semester: e.target.value as 'Ganjil' | 'Genap' })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Ganjil">Ganjil</option>
                      <option value="Genap">Genap</option>
                    </select>
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan Tahun Ajaran
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

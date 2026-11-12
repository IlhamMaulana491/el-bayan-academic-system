import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  Award,
  Send,
  Play,
  HelpCircle,
  Search,
  Sparkles,
  Lightbulb,
  Check,
} from 'lucide-react';
import {
  Assignment,
  LearningMaterial,
  OnlineExam,
  SchoolClass,
  Subject,
  UserAccount,
} from '../types.ts';
import { apiFetch } from '../utils/api.ts';

interface LearningAndExamProps {
  mode: 'materi' | 'tugas-ujian';
  initialSubTab?: 'tugas' | 'ujian';
  token: string;
  user: UserAccount;
  materials: LearningMaterial[];
  assignments: Assignment[];
  exams: OnlineExam[];
  subjects: Subject[];
  classes: SchoolClass[];
  onRefresh: () => Promise<void>;
  notify: (msg: string) => void;
}

function FormattedMaterialContent({
  content,
  fontSize,
}: {
  content: string;
  fontSize: 'sm' | 'md' | 'lg';
}) {
  const textSizeClass = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }[fontSize];

  const lines = content.split('\n');

  return (
    <div className={`space-y-3.5 text-slate-800 leading-relaxed ${textSizeClass}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Header 3: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-xl font-bold text-[#064E3B] pt-4 pb-1 border-b border-emerald-100 flex items-center gap-2"
            >
              <span className="w-2 h-5 rounded-full bg-[#F59E0B] inline-block shrink-0" />
              <span>{trimmed.replace('### ', '')}</span>
            </h3>
          );
        }

        // Header 4: ####
        if (trimmed.startsWith('#### ')) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-bold text-[#065F46] pt-2"
            >
              {trimmed.replace('#### ', '')}
            </h4>
          );
        }

        // Horizontal Rule: ---
        if (trimmed === '---') {
          return <hr key={idx} className="my-3 border-slate-200" />;
        }

        // Blockquote: >
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-50/60 to-amber-50/40 border-l-4 border-[#059669] text-emerald-950 font-medium italic shadow-2xs my-2.5 text-xs sm:text-sm"
            >
              {trimmed.replace('> ', '')}
            </blockquote>
          );
        }

        // Table Row: | ... |
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          if (trimmed.includes('---')) return null;
          const cells = trimmed
            .split('|')
            .map((c) => c.trim())
            .filter((c, i, arr) => i > 0 && i < arr.length - 1);
          return (
            <div
              key={idx}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
            >
              {cells.map((cell, cIdx) => (
                <div key={cIdx} className="truncate">
                  {cell}
                </div>
              ))}
            </div>
          );
        }

        // Bullet point: - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
              <span className="flex-1">{trimmed.substring(2)}</span>
            </div>
          );
        }

        // Numbered list: e.g. 1. 2. 3.
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2">
              <span className="text-emerald-700 font-bold shrink-0">
                {trimmed.match(/^\d+\./)?.[0]}
              </span>
              <span className="flex-1">{trimmed.replace(/^\d+\.\s*/, '')}</span>
            </div>
          );
        }

        // Normal paragraph (supports **bold** and *italic*)
        const parts = trimmed.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        return (
          <p key={idx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return (
                  <em key={pIdx} className="italic text-slate-700">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export const LearningAndExamView: React.FC<LearningAndExamProps> = ({
  mode,
  initialSubTab = 'tugas',
  token,
  user,
  materials,
  assignments,
  exams,
  subjects,
  classes,
  onRefresh,
  notify,
}) => {
  const [subTab, setSubTab] = useState<'tugas' | 'ujian'>(initialSubTab);
  const [subjectFilter, setSubjectFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  // Modals for Materi
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [readerTab, setReaderTab] = useState<'konten' | 'poin' | 'ringkasan'>('konten');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [completedReads, setCompletedReads] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('elbayan_completed_reads');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleCompleteRead = (materialId: string) => {
    setCompletedReads((prev) => {
      const next = prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId];
      try {
        localStorage.setItem('elbayan_completed_reads', JSON.stringify(next));
      } catch {}
      return next;
    });
    notify(
      completedReads.includes(materialId)
        ? 'Status selesai membaca dibatalkan.'
        : 'Alhamdulillah! Anda telah menyelesaikan membaca materi ini. Catatan telah tersimpan.'
    );
  };
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [matForm, setMatForm] = useState({
    title: '',
    subjectName: "Al-Qur'an Hadis",
    className: 'Kelas X-A',
    category: 'Modul PDF' as LearningMaterial['category'],
    description: '',
    contentSummary: '',
    fileName: '',
    fileSize: '2.1 MB',
    fileDataUrl: '',
  });

  // Modals for Tugas
  const [showAddAsg, setShowAddAsg] = useState(false);
  const [asgForm, setAsgForm] = useState({
    title: '',
    subjectName: "Al-Qur'an Hadis",
    className: 'Kelas X-A',
    dueDate: '2025-12-18',
    description: '',
    maxScore: 100,
    attachmentName: 'Panduan_Tugas_MA_ElBayan.pdf',
  });
  const [activeSubmitAsg, setActiveSubmitAsg] = useState<Assignment | null>(null);
  const [submitForm, setSubmitForm] = useState({
    answerText: '',
    fileName: '',
    fileDataUrl: '',
  });
  const [activeGradeAsg, setActiveGradeAsg] = useState<Assignment | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { score: string; feedback: string }>>({});

  // Modals & State for CBT Exam
  const [showAddExam, setShowAddExam] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    subjectName: "Al-Qur'an Hadis",
    className: 'Kelas X-A',
    examType: 'Ulangan Harian' as OnlineExam['examType'],
    durationMinutes: 45,
    date: '2025-12-16',
    startTime: '08:00 WIB',
    passingScore: 78,
  });

  const [activeQuestionExam, setActiveQuestionExam] = useState<OnlineExam | null>(null);
  const [qForm, setQForm] = useState({
    type: 'pg' as 'pg' | 'essay',
    questionText: '',
    arabicText: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    optE: '',
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D' | 'E',
    points: 20,
  });

  // Live CBT Runner State
  const [runningExam, setRunningExam] = useState<OnlineExam | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!runningExam) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [runningExam]);

  const canManage = user.role === 'admin' || user.role === 'guru';

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // File Upload Helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (fileName: string, sizeLabel: string, dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const reader = new FileReader();
    reader.onload = () => {
      onLoaded(file.name, sizeMB, String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  // Download Material File
  const handleDownloadMaterial = async (mat: LearningMaterial) => {
    await apiFetch(`/api/materials/${mat.id}/download`, { method: 'POST', headers });
    if (mat.fileDataUrl) {
      const a = document.createElement('a');
      a.href = mat.fileDataUrl;
      a.download = mat.fileName || 'Materi_MA_ElBayan.pdf';
      a.click();
    } else {
      const content = [
        '====================================================================',
        'MODUL PEMBELAJARAN RESMI — E-LEARNING MA EL-BAYAN',
        '“Madrasah Digital, Generasi Cerdas dan Berakhlak Mulia.”',
        '====================================================================',
        `Judul Materi    : ${mat.title}`,
        `Mata Pelajaran  : ${mat.subjectName}`,
        `Kelas           : ${mat.className}`,
        `Guru Pengampu   : ${mat.teacherName}`,
        `Tanggal Terbit  : ${mat.createdAt}`,
        '--------------------------------------------------------------------',
        'DESKRIPSI MATERI:',
        mat.description,
        '',
        'RINGKASAN POKOK BAHASAN:',
        mat.contentSummary,
        '====================================================================',
      ].join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mat.fileName.replace(/\.pdf$/i, '.txt');
      a.click();
      URL.revokeObjectURL(url);
    }
    await onRefresh();
    notify(`File "${mat.fileName}" berhasil diunduh.`);
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/materials', {
      method: 'POST',
      headers,
      body: JSON.stringify(matForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddMaterial(false);
      setMatForm({
        title: '',
        subjectName: "Al-Qur'an Hadis",
        className: 'Kelas X-A',
        category: 'Modul PDF',
        description: '',
        contentSummary: '',
        fileName: '',
        fileSize: '2.1 MB',
        fileDataUrl: '',
      });
      notify('Materi pembelajaran berhasil diunggah ke database.');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    const res = await apiFetch(`/api/materials/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      await onRefresh();
      notify('Materi pembelajaran berhasil dihapus.');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiFetch('/api/assignments', {
      method: 'POST',
      headers,
      body: JSON.stringify(asgForm),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddAsg(false);
      notify('Tugas online baru berhasil diterbitkan.');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    const res = await apiFetch(`/api/assignments/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      await onRefresh();
      notify('Tugas online berhasil dihapus.');
    }
  };

  const handleDeleteExam = async (id: string) => {
    const res = await apiFetch(`/api/exams/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      await onRefresh();
      notify('Paket ujian CBT berhasil dihapus.');
    }
  };

  const handleDownloadAsgAttachment = (asg: Assignment) => {
    const content = [
      '====================================================================',
      'LEMBAR KERJA TUGAS ONLINE — E-LEARNING MA EL-BAYAN',
      '====================================================================',
      `Judul Tugas     : ${asg.title}`,
      `Mata Pelajaran  : ${asg.subjectName}`,
      `Kelas           : ${asg.className}`,
      `Guru Pengampu   : ${asg.teacherName}`,
      `Batas Waktu     : ${asg.dueDate}`,
      '--------------------------------------------------------------------',
      'INSTRUKSI PENGERJAAN:',
      asg.description,
      '====================================================================',
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (asg.attachmentName || 'Lembar_Kerja_Tugas.txt').replace(/\.(pdf|docx)$/i, '.txt');
    a.click();
    URL.revokeObjectURL(url);
    notify(`Lampiran "${asg.attachmentName || 'Lembar Kerja'}" berhasil diunduh.`);
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitAsg) return;
    const res = await apiFetch(`/api/assignments/${activeSubmitAsg.id}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(submitForm),
    });
    if (res.ok) {
      await onRefresh();
      setActiveSubmitAsg(null);
      setSubmitForm({ answerText: '', fileName: '', fileDataUrl: '' });
      notify('Tugas Anda berhasil dikumpulkan dan tercatat di sistem!');
    }
  };

  const handleSaveGradeSubmission = async (asgId: string, submissionId: string) => {
    const inp = gradeInputs[submissionId];
    if (!inp) return;
    const res = await apiFetch(`/api/assignments/${asgId}/grade`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        submissionId,
        score: Number(inp.score),
        feedback: inp.feedback,
      }),
    });
    if (res.ok) {
      const updatedAsg = await res.json();
      setActiveGradeAsg(updatedAsg);
      await onRefresh();
      notify('Nilai dan feedback tugas siswa berhasil disimpan.');
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const defaultQuestions = [
      {
        id: `q-${Date.now()}-1`,
        type: 'pg',
        questionText: `Soal Pilihan Ganda 1 untuk evaluasi mata pelajaran ${examForm.subjectName}:`,
        options: {
          A: 'Pernyataan pertama sesuai dalil dan konsep dasar',
          B: 'Pernyataan kedua sebagai alternatif analisis',
          C: 'Pernyataan ketiga dalam studi kasus',
          D: 'Pernyataan keempat sebagai pembanding',
          E: 'Semua jawaban benar',
        },
        correctOption: 'A',
        points: 50,
      },
      {
        id: `q-${Date.now()}-2`,
        type: 'essay',
        questionText: `Jelaskan kesimpulan utama dari materi ${examForm.subjectName} yang telah dipelajari beserta contoh penerapannya!`,
        points: 50,
      },
    ];
    const res = await apiFetch('/api/exams', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...examForm, questions: defaultQuestions }),
    });
    if (res.ok) {
      await onRefresh();
      setShowAddExam(false);
      notify('Paket ujian CBT berhasil dibuat.');
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestionExam) return;
    const payload = {
      type: qForm.type,
      questionText: qForm.questionText,
      arabicText: qForm.arabicText,
      options:
        qForm.type === 'pg'
          ? {
              A: qForm.optA,
              B: qForm.optB,
              C: qForm.optC,
              D: qForm.optD,
              E: qForm.optE,
            }
          : undefined,
      correctOption: qForm.type === 'pg' ? qForm.correctOption : undefined,
      points: qForm.points,
    };
    const res = await apiFetch(`/api/exams/${activeQuestionExam.id}/questions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      setActiveQuestionExam(updated);
      await onRefresh();
      setQForm({
        type: 'pg',
        questionText: '',
        arabicText: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        optE: '',
        correctOption: 'A',
        points: 20,
      });
      notify('Butir soal berhasil ditambahkan ke bank soal ujian.');
    }
  };

  const startExamRunner = (exam: OnlineExam) => {
    setRunningExam(exam);
    setCurrentQIdx(0);
    setExamAnswers({});
    setSecondsLeft(exam.durationMinutes * 60);
  };

  const submitExamRunner = async () => {
    if (!runningExam) return;
    const res = await apiFetch(`/api/exams/${runningExam.id}/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ answers: examAnswers }),
    });
    if (res.ok) {
      const data = await res.json();
      setRunningExam(null);
      await onRefresh();
      notify(
        `Ujian selesai! Skor Akhir Anda: ${data.attempt.totalScore} (Pilihan Ganda: ${data.attempt.pgScore}).`
      );
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ============================================================================
  // LIVE CBT EXAM RUNNER VIEW
  // ============================================================================
  if (runningExam) {
    const q = runningExam.questions[currentQIdx];
    return (
      <div className="bg-white rounded-2xl border border-emerald-800/20 shadow-md overflow-hidden">
        {/* CBT Header */}
        <div className="bg-gradient-to-r from-[#043927] to-[#065F46] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#FBBF24] font-semibold">
              Computer Based Test (CBT) — {runningExam.subjectName} ({runningExam.className})
            </div>
            <h2 className="text-lg font-bold">{runningExam.title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-black/30 border border-white/15 flex items-center gap-2 font-mono text-sm font-bold text-[#FBBF24] tabular-nums">
              <Clock className="w-4 h-4" />
              <span>Sisa Waktu: {formatTimer(secondsLeft)}</span>
            </div>
            <button
              type="button"
              onClick={() => setRunningExam(null)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-8 space-y-5">
            {q ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-sm font-bold text-emerald-900">
                    Soal Nomor {currentQIdx + 1} dari {runningExam.questions.length} (
                    {q.type === 'pg' ? 'Pilihan Ganda' : 'Uraian / Essay'})
                  </span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    Bobot: {q.points} Poin
                  </span>
                </div>

                {q.arabicText && (
                  <div
                    dir="rtl"
                    className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-right text-xl leading-loose text-emerald-950 font-semibold"
                  >
                    {q.arabicText}
                  </div>
                )}

                <p className="text-base text-slate-900 font-medium leading-relaxed">{q.questionText}</p>

                {q.type === 'pg' && q.options ? (
                  <div className="space-y-2.5 pt-2">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((optKey) => {
                      const selected = examAnswers[q.id] === optKey;
                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => setExamAnswers({ ...examAnswers, [q.id]: optKey })}
                          className={`w-full p-3.5 rounded-xl border text-left text-sm flex items-center gap-3.5 transition-all cursor-pointer ${
                            selected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-semibold shadow-xs'
                              : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              selected ? 'bg-[#065F46] text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {optKey}
                          </span>
                          <span>{q.options![optKey]}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Ketik Jawaban Uraian / Essay Anda:
                    </label>
                    <textarea
                      rows={6}
                      value={examAnswers[q.id] || ''}
                      onChange={(e) => setExamAnswers({ ...examAnswers, [q.id]: e.target.value })}
                      placeholder="Tuliskan jawaban lengkap beserta dalil atau langkah penyelesaiannya..."
                      className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentQIdx === 0}
                    onClick={() => setCurrentQIdx((i) => Math.max(0, i - 1))}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    ← Soal Sebelumnya
                  </button>
                  {currentQIdx < runningExam.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQIdx((i) => i + 1)}
                      className="px-5 py-2.5 rounded-xl bg-[#065F46] text-white text-xs font-semibold cursor-pointer"
                    >
                      Soal Berikutnya →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitExamRunner}
                      className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Selesai & Kumpulkan Jawaban Ujian
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Belum ada soal dalam ujian ini.</p>
            )}
          </div>

          {/* Right Column: Question Number Navigator */}
          <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 mb-3">Navigasi Nomor Soal</h3>
              <div className="grid grid-cols-5 gap-2">
                {runningExam.questions.map((item, idx) => {
                  const answered = Boolean(examAnswers[item.id]);
                  const isCurrent = idx === currentQIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrentQIdx(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all cursor-pointer tabular-nums ${
                        isCurrent
                          ? 'ring-2 ring-[#F59E0B] bg-[#065F46] text-white'
                          : answered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-[11px] text-slate-500">
                <div>• Hijau: Sudah dijawab ({Object.keys(examAnswers).length} soal)</div>
                <div>• Putih: Belum dijawab</div>
              </div>
            </div>

            <button
              type="button"
              onClick={submitExamRunner}
              className="mt-6 w-full py-3 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Kumpulkan Seluruh Jawaban
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MODE 1: MATERI PEMBELAJARAN VIEW
  // ============================================================================
  if (mode === 'materi') {
    const filteredMaterials = materials.filter((m) => {
      const matchSub = subjectFilter === 'Semua' || m.subjectName === subjectFilter;
      const matchQ =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSub && matchQ;
    });

    return (
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Materi Pembelajaran & Modul Digital</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Akses bahan ajar kurikulum Madrasah Aliyah, kitab rujukan, slide presentasi, dan modul praktikum.
            </p>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setShowAddMaterial(true)}
              className="px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Materi Baru</span>
            </button>
          )}
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul modul, mata pelajaran, atau guru..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Mata Pelajaran:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700"
            >
              <option value="Semua">Semua Mata Pelajaran</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-600/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-emerald-700">{mat.subjectName}</span>
                  <span>{mat.className} · {mat.category}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">{mat.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{mat.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                  <span className="truncate max-w-[150px]">{mat.teacherName}</span>
                  <div className="flex items-center gap-2">
                    {completedReads.includes(mat.id) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Selesai
                      </span>
                    )}
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      ±{mat.readingTimeMinutes || 10} mnt
                    </span>
                  </div>
                </div>

                {!canManage ? (
                  /* Tampilan Siswa: Tanpa tombol unduh, langsung tombol baca materi penuh */
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setReaderTab('konten');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#065F46] via-[#044E39] to-[#033728] hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs hover:shadow-md cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#FBBF24]" />
                    <span>Baca Materi Pembelajaran</span>
                  </button>
                ) : (
                  /* Tampilan Guru / Admin */
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setReaderTab('konten');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Baca Materi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadMaterial(mat)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMaterial(mat.id)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Hapus Materi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Read Material Interactive Reader Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header Reader */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#033728] via-[#054E37] to-[#065F46] text-white shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-[#F59E0B] text-slate-950 font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                        {selectedMaterial.subjectName}
                      </span>
                      <span className="bg-white/20 text-white font-medium px-2 py-0.5 rounded-full">
                        {selectedMaterial.className}
                      </span>
                      <span className="bg-white/10 text-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-[#FDE047]" />
                        ±{selectedMaterial.readingTimeMinutes || 10} Menit Membaca
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-bold leading-tight text-white drop-shadow-xs">
                      {selectedMaterial.title}
                    </h2>
                    <p className="text-xs text-emerald-100/90 flex items-center gap-2">
                      <span>Guru Pengampu: <strong>{selectedMaterial.teacherName}</strong></span>
                      <span>•</span>
                      <span>Kategori: {selectedMaterial.category}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Font Size Adjuster */}
                    <div className="hidden sm:flex items-center bg-black/20 rounded-xl p-1 border border-white/10 text-xs">
                      <span className="text-[10px] text-emerald-200 px-1 font-bold">Huruf:</span>
                      <button
                        type="button"
                        onClick={() => setReaderFontSize('sm')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          readerFontSize === 'sm' ? 'bg-white text-[#065F46]' : 'text-white/80 hover:text-white'
                        }`}
                        title="Ukuran Teks Kecil"
                      >
                        A-
                      </button>
                      <button
                        type="button"
                        onClick={() => setReaderFontSize('md')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          readerFontSize === 'md' ? 'bg-white text-[#065F46]' : 'text-white/80 hover:text-white'
                        }`}
                        title="Ukuran Teks Standar"
                      >
                        A
                      </button>
                      <button
                        type="button"
                        onClick={() => setReaderFontSize('lg')}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          readerFontSize === 'lg' ? 'bg-white text-[#065F46]' : 'text-white/80 hover:text-white'
                        }`}
                        title="Ukuran Teks Besar"
                      >
                        A+
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMaterial(null)}
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕ <span className="hidden sm:inline">Tutup</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs inside Reader */}
              <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setReaderTab('konten')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    readerTab === 'konten'
                      ? 'border-[#065F46] text-[#065F46]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Teks Pembelajaran Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTab('poin')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    readerTab === 'poin'
                      ? 'border-[#065F46] text-[#065F46]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Poin-Poin Kunci & Hikmah</span>
                  {selectedMaterial.keyPoints && selectedMaterial.keyPoints.length > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {selectedMaterial.keyPoints.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setReaderTab('ringkasan')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    readerTab === 'ringkasan'
                      ? 'border-[#065F46] text-[#065F46]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Silabus & Deskripsi Modul</span>
                </button>
              </div>

              {/* Scrollable Reader Body */}
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                {readerTab === 'konten' && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Introductory Box */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Panduan Membaca Santri:
                        </div>
                        <p className="text-xs text-emerald-800/90 leading-relaxed mt-0.5">
                          {selectedMaterial.description}
                        </p>
                      </div>
                    </div>

                    {/* Rich Formatted Reading Text */}
                    {selectedMaterial.fullContent ? (
                      <FormattedMaterialContent
                        content={selectedMaterial.fullContent}
                        fontSize={readerFontSize}
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                          {selectedMaterial.contentSummary}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {readerTab === 'poin' && (
                  <div className="max-w-3xl mx-auto space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium leading-relaxed">
                      💡 <strong>Tips Menghafal & Memahami:</strong> Berikut intisari pokok bahasan yang sering keluar pada evaluasi ulangan harian dan ujian semester (PAS/PAT).
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 pt-2">
                      {(selectedMaterial.keyPoints && selectedMaterial.keyPoints.length > 0
                        ? selectedMaterial.keyPoints
                        : [
                            'Pahami konsep dasar materi dan keterkaitannya dengan kehidupan sehari-hari.',
                            'Kuasai dalil atau rumus pokok yang mendasari materi ini.',
                            'Latih pemecahan studi kasus dan latihan soal mandiri secara konsisten.',
                            'Tanyakan kepada guru pengampu jika menemukan konsep yang belum dipahami sepenuhnya.',
                          ]
                      ).map((point, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5 hover:border-emerald-600/40 transition-all"
                        >
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {pIdx + 1}
                          </div>
                          <div className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                            {point}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {readerTab === 'ringkasan' && (
                  <div className="max-w-3xl mx-auto space-y-5">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <h4 className="text-sm font-bold text-slate-900">Deskripsi Umum Modul:</h4>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {selectedMaterial.description}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                      <h4 className="text-sm font-bold text-[#064E3B]">Struktur Pokok Bahasan Silabus:</h4>
                      <div className="whitespace-pre-line text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                        {selectedMaterial.contentSummary}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reader Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="w-full sm:w-auto">
                  {completedReads.includes(selectedMaterial.id) ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Alhamdulillah, materi ini sudah Anda selesaikan!</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Materi interaktif dapat dibaca langsung tanpa perlu mengunduh file.</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  {/* Mark as Finished button */}
                  <button
                    type="button"
                    onClick={() => toggleCompleteRead(selectedMaterial.id)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      completedReads.includes(selectedMaterial.id)
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-[#065F46] hover:bg-[#044E39] text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedReads.includes(selectedMaterial.id)
                        ? 'Tandai Belum Selesai'
                        : 'Tandai Selesai Membaca'}
                    </span>
                  </button>

                  {/* Tombol Unduh File: Hanya untuk Guru/Admin, TIDAK muncul untuk siswa */}
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleDownloadMaterial(selectedMaterial)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      title="Unduh Salinan Dokumen (Khusus Pengajar/Admin)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Unduh Arsip File</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload New Material Modal */}
        {showAddMaterial && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Unggah Materi Pembelajaran Baru</h3>
                <button type="button" onClick={() => setShowAddMaterial(false)} className="text-xs text-slate-500">
                  Tutup ✕
                </button>
              </div>
              <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Materi / Modul</label>
                  <input
                    type="text"
                    required
                    value={matForm.title}
                    onChange={(e) => setMatForm({ ...matForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Contoh: Bab 4 — Akhlak Pergaulan Remaja dalam Islam"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                    <select
                      value={matForm.subjectName}
                      onChange={(e) => setMatForm({ ...matForm, subjectName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Kelas</label>
                    <select
                      value={matForm.className}
                      onChange={(e) => setMatForm({ ...matForm, className: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pengantar</label>
                  <textarea
                    rows={2}
                    required
                    value={matForm.description}
                    onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ringkasan Materi</label>
                  <textarea
                    rows={3}
                    value={matForm.contentSummary}
                    onChange={(e) => setMatForm({ ...matForm, contentSummary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pilih File Modul (PDF/PPT/DOCX)</label>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileUpload(e, (fname, fsize, durl) =>
                        setMatForm({ ...matForm, fileName: fname, fileSize: fsize, fileDataUrl: durl })
                      )
                    }
                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800 file:font-semibold"
                  />
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddMaterial(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                    Simpan & Terbitkan Materi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // MODE 2: TUGAS ONLINE & UJIAN ONLINE (CBT)
  // ============================================================================
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tugas Terstruktur & Ujian Online (CBT)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengumpulan tugas siswa, pemeriksaan nilai oleh guru, serta evaluasi ujian berbasis komputer (Pilihan Ganda & Essay).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSubTab('tugas')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'tugas' ? 'bg-[#065F46] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Tugas Online ({assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('ujian')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                subTab === 'ujian' ? 'bg-[#065F46] text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Kuis & Ujian CBT ({exams.length})
            </button>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => (subTab === 'tugas' ? setShowAddAsg(true) : setShowAddExam(true))}
              className="px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{subTab === 'tugas' ? 'Buat Tugas' : 'Buat Ujian CBT'}</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: TUGAS ONLINE */}
      {subTab === 'tugas' && (
        <div className="space-y-4">
          {assignments.map((asg) => {
            const mySubmission = asg.submissions.find((s) => s.studentName === user.name);
            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-bold text-emerald-700">{asg.subjectName}</span>
                    <span>·</span>
                    <span>{asg.className}</span>
                    <span>·</span>
                    <span>Guru: {asg.teacherName}</span>
                    <span>·</span>
                    <span className="font-semibold text-amber-700 tabular-nums">
                      Tenggat: {asg.dueDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

                  {asg.attachmentName && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAsgAttachment(asg)}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Lampiran Soal: {asg.attachmentName}</span>
                    </button>
                  )}

                  {mySubmission && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
                      <div className="font-semibold">
                        Status Pengumpulan Anda: {mySubmission.status} ({mySubmission.submittedAt})
                      </div>
                      {mySubmission.score !== null && (
                        <div className="mt-1 font-bold text-emerald-800">
                          Nilai: {mySubmission.score} / {asg.maxScore} — Catatan Guru: “{mySubmission.feedback}”
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveSubmitAsg(asg)}
                    className="px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{mySubmission ? 'Perbarui Jawaban Tugas' : 'Kumpulkan Tugas'}</span>
                  </button>

                  {canManage && (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveGradeAsg(asg)}
                        className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-semibold cursor-pointer tabular-nums"
                      >
                        Periksa & Nilai ({asg.submissions.length} Siswa)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 2: UJIAN ONLINE (CBT) */}
      {subTab === 'ujian' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exm) => (
            <div
              key={exm.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-emerald-700">{exm.subjectName} · {exm.examType}</span>
                  <span className="tabular-nums">{exm.durationMinutes} Menit</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{exm.title}</h3>
                <div className="text-xs text-slate-600 mt-2 space-y-1 tabular-nums">
                  <div>Kelas: {exm.className} · Guru: {exm.teacherName}</div>
                  <div>
                    Jumlah Soal: {exm.questions.length} Soal (Pilihan Ganda & Essay) · KKM: {exm.passingScore}
                  </div>
                  <div>Jadwal Pelaksanaan: {exm.date} Pukul {exm.startTime}</div>
                </div>

                {exm.attempts.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700 mb-1">
                      Hasil Pengerjaan Terbaru ({exm.attempts.length} Peserta):
                    </div>
                    {exm.attempts.slice(0, 2).map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between text-xs py-1 text-slate-600 tabular-nums"
                      >
                        <span>{att.studentName}</span>
                        <span className="font-bold text-emerald-700">
                          Skor: {att.totalScore} (PG: {att.pgScore})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => startExamRunner(exm)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#065F46] hover:bg-[#047857] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Kerjakan Ujian CBT</span>
                </button>
                {canManage && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveQuestionExam(exm)}
                      className="py-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer"
                    >
                      + Kelola Bank Soal ({exm.questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExam(exm.id)}
                      className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Hapus Paket Ujian"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL KUMPULKAN TUGAS (SISWA) */}
      {activeSubmitAsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Pengumpulan Tugas — {activeSubmitAsg.title}
              </h3>
              <button type="button" onClick={() => setActiveSubmitAsg(null)} className="text-xs text-slate-500">
                Tutup ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jawaban / Catatan Penyelesaian Tugas
                </label>
                <textarea
                  rows={4}
                  required
                  value={submitForm.answerText}
                  onChange={(e) => setSubmitForm({ ...submitForm, answerText: e.target.value })}
                  placeholder="Tuliskan jawaban atau ringkasan penyelesaian tugas Anda di sini..."
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unggah File Tugas (PDF / DOCX / Gambar)
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    handleFileUpload(e, (fname, _sz, durl) =>
                      setSubmitForm({ ...submitForm, fileName: fname, fileDataUrl: durl })
                    )
                  }
                  className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-800 file:font-semibold"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveSubmitAsg(null)} className="px-4 py-2 rounded-xl border border-slate-200">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                  Kirim Tugas Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PERIKSA & BERI NILAI TUGAS (GURU/ADMIN) */}
      {activeGradeAsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pemeriksaan Tugas: {activeGradeAsg.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Total Pengumpulan: {activeGradeAsg.submissions.length} Siswa
                </p>
              </div>
              <button type="button" onClick={() => setActiveGradeAsg(null)} className="text-xs text-slate-500">
                Tutup ✕
              </button>
            </div>

            {activeGradeAsg.submissions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Belum ada siswa yang mengumpulkan tugas ini.
              </p>
            ) : (
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                {activeGradeAsg.submissions.map((sub) => {
                  const currentInput = gradeInputs[sub.id] || {
                    score: sub.score !== null ? String(sub.score) : '90',
                    feedback: sub.feedback || 'Bagus, pertahankan!',
                  };
                  return (
                    <div key={sub.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {sub.studentName} ({sub.className})
                        </span>
                        <span className="text-slate-500">{sub.submittedAt}</span>
                      </div>
                      <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80">
                        {sub.answerText}
                      </p>
                      <div className="text-[11px] text-emerald-700 font-mono">
                        File Lampiran: {sub.fileName}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1 items-center">
                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={currentInput.score}
                            onChange={(e) =>
                              setGradeInputs({
                                ...gradeInputs,
                                [sub.id]: { ...currentInput, score: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold tabular-nums"
                            placeholder="Nilai (0-100)"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <input
                            type="text"
                            value={currentInput.feedback}
                            onChange={(e) =>
                              setGradeInputs({
                                ...gradeInputs,
                                [sub.id]: { ...currentInput, feedback: e.target.value },
                              })
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                            placeholder="Catatan feedback guru..."
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <button
                            type="button"
                            onClick={() => handleSaveGradeSubmission(activeGradeAsg.id, sub.id)}
                            className="w-full py-1.5 px-3 rounded-lg bg-[#065F46] text-white font-semibold cursor-pointer"
                          >
                            Simpan Nilai
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL BUAT TUGAS BARU */}
      {showAddAsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Buat Tugas Online Baru</h3>
              <button type="button" onClick={() => setShowAddAsg(false)} className="text-xs text-slate-500">
                Tutup ✕
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  value={asgForm.title}
                  onChange={(e) => setAsgForm({ ...asgForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Contoh: Resume Sejarah Peradaban Islam Masa Bani Abbasiyah"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={asgForm.subjectName}
                    onChange={(e) => setAsgForm({ ...asgForm, subjectName: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={asgForm.className}
                    onChange={(e) => setAsgForm({ ...asgForm, className: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batas Waktu</label>
                  <input
                    type="date"
                    value={asgForm.dueDate}
                    onChange={(e) => setAsgForm({ ...asgForm, dueDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instruksi Pengerjaan</label>
                <textarea
                  rows={3}
                  required
                  value={asgForm.description}
                  onChange={(e) => setAsgForm({ ...asgForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddAsg(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BUAT PAKET UJIAN CBT BARU */}
      {showAddExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Buat Paket Ujian Online (CBT) Baru</h3>
              <button type="button" onClick={() => setShowAddExam(false)} className="text-xs text-slate-500">
                Tutup ✕
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Paket Ujian</label>
                <input
                  type="text"
                  required
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Contoh: Penilaian Akhir Semester (PAS) Akidah Akhlak"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={examForm.subjectName}
                    onChange={(e) => setExamForm({ ...examForm, subjectName: e.target.value })}
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
                    value={examForm.className}
                    onChange={(e) => setExamForm({ ...examForm, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Ujian</label>
                  <select
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Ulangan Harian">Ulangan Harian</option>
                    <option value="UTS / PTS">UTS / PTS</option>
                    <option value="UAS / PAS">UAS / PAS</option>
                    <option value="Ujian Madrasah">Ujian Madrasah</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    value={examForm.durationMinutes}
                    onChange={(e) => setExamForm({ ...examForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">KKM</label>
                  <input
                    type="number"
                    value={examForm.passingScore}
                    onChange={(e) => setExamForm({ ...examForm, passingScore: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddExam(false)} className="px-4 py-2 rounded-xl border border-slate-200">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                  Simpan Paket Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BANK SOAL (PG & ESSAY) */}
      {activeQuestionExam && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kelola Bank Soal — {activeQuestionExam.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Saat ini terdapat {activeQuestionExam.questions.length} butir soal dalam paket ujian ini.
                </p>
              </div>
              <button type="button" onClick={() => setActiveQuestionExam(null)} className="text-xs text-slate-500">
                Tutup ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe Soal</label>
                  <select
                    value={qForm.type}
                    onChange={(e) => setQForm({ ...qForm, type: e.target.value as 'pg' | 'essay' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="pg">Pilihan Ganda (A, B, C, D, E)</option>
                    <option value="essay">Uraian / Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bobot Poin</label>
                  <input
                    type="number"
                    value={qForm.points}
                    onChange={(e) => setQForm({ ...qForm, points: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pertanyaan Soal</label>
                <textarea
                  rows={2}
                  required
                  value={qForm.questionText}
                  onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Tuliskan redaksi soal dengan jelas..."
                />
              </div>

              {qForm.type === 'pg' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Pilihan A"
                      value={qForm.optA}
                      onChange={(e) => setQForm({ ...qForm, optA: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pilihan B"
                      value={qForm.optB}
                      onChange={(e) => setQForm({ ...qForm, optB: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pilihan C"
                      value={qForm.optC}
                      onChange={(e) => setQForm({ ...qForm, optC: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pilihan D"
                      value={qForm.optD}
                      onChange={(e) => setQForm({ ...qForm, optD: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pilihan E"
                      value={qForm.optE}
                      onChange={(e) => setQForm({ ...qForm, optE: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-slate-300"
                    />
                    <select
                      value={qForm.correctOption}
                      onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value as any })}
                      className="px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-50 font-bold text-emerald-900"
                    >
                      <option value="A">Kunci Jawaban: A</option>
                      <option value="B">Kunci Jawaban: B</option>
                      <option value="C">Kunci Jawaban: C</option>
                      <option value="D">Kunci Jawaban: D</option>
                      <option value="E">Kunci Jawaban: E</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setActiveQuestionExam(null)} className="px-4 py-2 rounded-xl border border-slate-200">
                  Selesai
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-[#065F46] text-white font-semibold cursor-pointer">
                  + Tambah Soal ke Ujian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

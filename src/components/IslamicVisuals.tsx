import React, { useState } from 'react';
import { ActivityChartPoint, SchoolSettings } from '../types.ts';

export const MadrasahLogo: React.FC<{
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ logoUrl, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
  }[size];

  const effectiveLogo =
    logoUrl && logoUrl.trim() !== ''
      ? logoUrl
      : '/assets/aistudio/images_be5eb3cc.jpeg';

  return (
    <div
      className={`${sizeClasses} rounded-full bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0 select-none ${className}`}
    >
      <img
        src={effectiveLogo}
        alt="Logo MA EL-BAYAN Majenang Cilacap"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};

export const SchoolHeroBanner: React.FC<{
  settings: SchoolSettings;
}> = ({ settings }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const isDefaultReference =
    !settings.bannerBuildingUrl ||
    settings.bannerBuildingUrl.includes('Modern_Islamic_E-Learning_Dashboard_3dfd0007.png');

  const slides = [
    {
      kicker: 'Selamat Datang di',
      titlePrefix: 'E-Learning ',
      titleHighlight: settings.shortName || 'MA EL-BAYAN',
      subtitle: `“${settings.slogan || 'Madrasah Digital, Generasi Cerdas dan Berakhlak Mulia.'}”`,
    },
    {
      kicker: `Tahun Ajaran ${settings.activeAcademicYear} • Semester ${settings.activeSemester}`,
      titlePrefix: 'Transformasi ',
      titleHighlight: 'Pendidikan Islam',
      subtitle: '“Integrasi Ilmu Pengetahuan, Teknologi Modern, dan Akhlakul Karimah.”',
    },
    {
      kicker: `${settings.accreditation} • NSM: ${settings.nsm}`,
      titlePrefix: 'Generasi ',
      titleHighlight: "Qur'ani & Berprestasi",
      subtitle: '“Pembelajaran Terpadu Kurikulum Madrasah Aliyah Berbasis Digital.”',
    },
  ];

  const current = slides[activeSlide];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-emerald-900/10 bg-[#064E3B] min-h-[168px] sm:min-h-[188px] lg:min-h-[200px] flex items-center">
      {/* If using the reference dashboard asset, we can either show the custom uploaded photo or crop the right building section cleanly */}
      {isDefaultReference ? (
        <div className="absolute inset-0 flex">
          {/* Left deep emerald background */}
          <div className="w-full lg:w-[55%] h-full bg-gradient-to-r from-[#043927] via-[#064E3B] to-[#065F46] relative overflow-hidden">
            {/* Subtle Islamic geometric circle & mosque dome watermark */}
            <svg
              className="absolute -top-12 right-8 w-64 h-64 text-emerald-400/10 pointer-events-none"
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="14" strokeDasharray="12 8" />
              <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="6" />
            </svg>
            {/* Top-left Gold Corner Wave Accent */}
            <svg className="absolute top-0 left-0 w-44 h-28 pointer-events-none" viewBox="0 0 200 120" fill="none">
              <path d="M0 0H180C120 15 60 50 0 110V0Z" fill="url(#bannerGoldTop)" opacity="0.85" />
              <path d="M0 0H130C85 12 40 38 0 80V0Z" fill="#043927" opacity="0.55" />
              <defs>
                <linearGradient id="bannerGoldTop" x1="0" y1="0" x2="180" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#FDE047" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Right side: Exact cropped school building photo from reference image */}
          <div className="hidden md:block md:w-[58%] h-full relative overflow-hidden ml-auto">
            <img
              src="/assets/aistudio/Modern_Islamic_E-Learning_Dashboard_3dfd0007.png"
              alt="Gedung Madrasah Aliyah EL-BAYAN"
              referrerPolicy="no-referrer"
              className="absolute max-w-none"
              style={{
                width: '215%',
                height: '500%',
                right: '-2.6%',
                top: '-55.5%',
                objectFit: 'cover',
              }}
            />
            {/* Smooth gradient blend from left emerald text zone into the building photo */}
            <div className="absolute inset-y-0 left-0 w-36 bg-gradient-to-r from-[#064E3B] via-[#064E3B]/80 to-transparent" />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0">
          <img
            src={settings.bannerBuildingUrl}
            alt="Gedung MA EL-BAYAN"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#043927]/95 via-[#064E3B]/85 to-emerald-950/25" />
        </div>
      )}

      {/* Foreground Text Content */}
      <div className="relative z-10 px-6 sm:px-10 py-6 w-full lg:w-[62%]">
        <p className="text-white/95 text-lg sm:text-2xl font-semibold tracking-tight drop-shadow-sm">
          {current.kicker}
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-white leading-tight mt-0.5 drop-shadow-sm">
          {current.titlePrefix}
          <span className="text-[#FBBF24]">{current.titleHighlight}</span>
        </h1>
        <p className="text-emerald-50/90 italic text-xs sm:text-sm md:text-[15px] mt-2.5 font-normal max-w-xl">
          {current.subtitle}
        </p>
      </div>

      {/* Carousel Indicators at bottom center matching reference */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${
              activeSlide === idx ? 'w-2.5 bg-white shadow' : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const IslamicQuoteCard: React.FC<{ quote?: string }> = ({ quote }) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-emerald-900/10 shadow-sm bg-[#EBF3F0] h-full min-h-[380px] flex flex-col justify-between">
      {/* Use the exact artwork from the reference image bottom-right panel as background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/assets/aistudio/Modern_Islamic_E-Learning_Dashboard_3dfd0007.png"
          alt="Motivasi Islami MA EL-BAYAN"
          referrerPolicy="no-referrer"
          className="absolute max-w-none"
          style={{
            width: '780%',
            height: '210%',
            right: '-7.8%',
            bottom: '-13.8%',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Overlay custom quote only if modified by admin from default */}
      {quote && quote !== '“Ilmu adalah cahaya, dan pendidikan adalah jalan menuju kesuksesan.”' && (
        <div className="relative z-10 m-4 mt-14 p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-emerald-800/10 text-center shadow-sm">
          <p className="text-sm font-medium text-[#064E3B] italic leading-relaxed">{quote}</p>
        </div>
      )}
    </div>
  );
};

export const ActivityLineChart: React.FC<{
  data: ActivityChartPoint[];
}> = ({ data }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 660;
  const height = 210;
  const padLeft = 42;
  const padRight = 20;
  const padTop = 18;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(
    400,
    ...data.map((d) => Math.max(d.aksesMateri, d.pengumpulanTugas, d.ujianOnline))
  );
  const yTicks = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal];

  const getX = (i: number) =>
    data.length === 1 ? padLeft + plotW / 2 : padLeft + (i / (data.length - 1)) * plotW;
  const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) * 0.45;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) * 0.55;
      const cpy2 = p1.y;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const buildAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const line = buildSmoothPath(pts);
    return `${line} L ${pts[pts.length - 1].x} ${padTop + plotH} L ${pts[0].x} ${padTop + plotH} Z`;
  };

  const greenPts = data.map((d, i) => ({ x: getX(i), y: getY(d.aksesMateri) }));
  const bluePts = data.map((d, i) => ({ x: getX(i), y: getY(d.pengumpulanTugas) }));
  const amberPts = data.map((d, i) => ({ x: getX(i), y: getY(d.ujianOnline) }));

  return (
    <div className="w-full">
      {/* Legend matching reference */}
      <div className="flex flex-wrap items-center justify-center gap-5 mb-2 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block" />
          <span>Akses Materi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block" />
          <span>Pengumpulan Tugas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
          <span>Ujian Online</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="amberArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {yTicks.map((t) => {
            const y = getY(t);
            return (
              <g key={t}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  className="fill-slate-500 font-medium tabular-nums"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Vertical subtle day guides */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <g key={d.day}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11.5"
                  className="fill-slate-600 font-medium"
                >
                  {d.day}
                </text>
              </g>
            );
          })}

          {/* Area fills */}
          <path d={buildAreaPath(greenPts)} fill="url(#greenArea)" />
          <path d={buildAreaPath(amberPts)} fill="url(#amberArea)" />

          {/* Smooth Lines */}
          <path d={buildSmoothPath(greenPts)} fill="none" stroke="#059669" strokeWidth="2.4" />
          <path d={buildSmoothPath(bluePts)} fill="none" stroke="#2563EB" strokeWidth="2.4" />
          <path d={buildSmoothPath(amberPts)} fill="none" stroke="#F59E0B" strokeWidth="2.4" />

          {/* Data Points & Hover Targets */}
          {data.map((d, i) => (
            <g
              key={d.day}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              className="cursor-pointer"
            >
              <circle cx={greenPts[i].x} cy={greenPts[i].y} r="4.5" fill="#059669" stroke="#fff" strokeWidth="1.5" />
              <circle cx={bluePts[i].x} cy={bluePts[i].y} r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
              <circle cx={amberPts[i].x} cy={amberPts[i].y} r="4.5" fill="#F59E0B" stroke="#fff" strokeWidth="1.5" />
              <rect
                x={greenPts[i].x - 24}
                y={padTop}
                width="48"
                height={plotH}
                fill="transparent"
              />
            </g>
          ))}
        </svg>

        {/* Tooltip on hover */}
        {hoverIdx !== null && data[hoverIdx] && (
          <div className="mt-2 flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-950 text-white text-xs">
            <span className="font-semibold">Hari {data[hoverIdx].day}:</span>
            <div className="flex items-center gap-4 tabular-nums">
              <span className="text-emerald-300">Materi: {data[hoverIdx].aksesMateri}</span>
              <span className="text-blue-300">Tugas: {data[hoverIdx].pengumpulanTugas}</span>
              <span className="text-amber-300">Ujian: {data[hoverIdx].ujianOnline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

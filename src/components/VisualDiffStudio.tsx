import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useLanguage, type LocalizedText } from '../context/useLanguage';
import { useSound } from '../context/useSound';

type DiffModeId = 'vertical' | 'horizontal' | 'editing';

interface DiffModeSpec {
	id: DiffModeId;
	tabNum: string;
	tabLabel: LocalizedText;
	purpose: LocalizedText;
	beforeBadge: LocalizedText;
	afterBadge: LocalizedText;
	beforePointTitle: LocalizedText;
	beforePointDesc: LocalizedText;
	afterPointTitle: LocalizedText;
	afterPointDesc: LocalizedText;
	defaultSplit: number;
}

const DIFF_MODES: DiffModeSpec[] = [
	{
		id: 'vertical',
		tabNum: '01',
		tabLabel: { en: '9:16 Vertical Reels', id: 'Video Vertikal 9:16' },
		purpose: {
			en: 'Watch a full-screen 9:16 Reel on the Coffee Decoy Effect: a slow text block cut off by IG buttons vs. a 1.3s portrait hook, full-bleed S/M/L cup reveal, 7/10 icon grid proof & safe-zone captions.',
			id: 'Tonton demo penuh Reel 9:16 "Efek Umpan Menu Kopi": pembuka lambat yang tertutup tombol IG vs. hook layar penuh 1,3 detik, animasi perbandingan ukuran S/M/L, bukti grid 7 dari 10, & posisi aman.',
		},
		beforeBadge: { en: 'BEFORE · BASIC REEL', id: 'SEBELUM · REEL POLOS' },
		afterBadge: { en: 'AFTER · 9:16 STUDIO REEL', id: 'SESUDAH · REEL 9:16' },
		beforePointTitle: {
			en: 'Slow 3s+ Text Block & Blocked Instagram UI',
			id: 'Intro Lambat & Teks Tertabrak Tombol Instagram',
		},
		beforePointDesc: {
			en: 'Tiny centered text box ("Hey everyone...") fails to hold attention vertically, uses zero visual demonstration, and collides behind Heart/Share/Caption UI.',
			id: 'Pembuka polos tanpa peragaan visual membuat penonton langsung scroll sebelum detik ke-3, ditambah posisi subtitel yang menabrak ikon kanan/bawah.',
		},
		afterPointTitle: {
			en: 'Full-Bleed 9:16 Motion, Visual Proof & Safe-Zone Precision',
			id: 'Visual Layar Penuh 9:16, Terbukti Jelas & Bebas Tabrakan UI',
		},
		afterPointDesc: {
			en: 'Uses portrait height naturally (S vs L -> Medium decoy steer -> 7/10 cup grid) with beat-synced cut changes, Voice-first audio, and clean IG safe-zone framing.',
			id: 'Memanfaatkan tinggi layar vertikal seutuhnya (gelas S vs L -> umpan Medium -> grid bukti 7 dari 10 pembeli) lengkap dengan pacing cepat & area baca aman.',
		},
		defaultSplit: 50,
	},
	{
		id: 'horizontal',
		tabNum: '02',
		tabLabel: { en: '16:9 Horizontal Video', id: 'Video Horizontal 16:9' },
		purpose: {
			en: 'Watch why widening roads stays jammed (Induced Demand) in 16:9: dull slide bullet points vs. widescreen highway expansion animation, commuter influx proof, and split-screen transit clarity.',
			id: 'Tonton contoh cerita "Jalan Tol Makin Lebar, Kenapa Tetap Macet?" di layar 16:9: video slide kaku penuh tulisan vs. animasi lebar jalan, bukti visual arus mobil masuk, & perbandingan split-screen.',
		},
		beforeBadge: { en: 'BEFORE · SLIDE VIDEO', id: 'SEBELUM · ALA SLIDE PPT' },
		afterBadge: { en: 'AFTER · 16:9 STUDIO VIDEO', id: 'SESUDAH · VIDEO 16:9' },
		beforePointTitle: {
			en: 'Static Slide Video & Dry Written Lecture',
			id: 'Video Kaku Seperti Slide & Penjelasan Kering',
		},
		beforePointDesc: {
			en: 'Academic bullet points stamped onto a flat frame force viewers to read without spatial proof, camera pacing, or audio guidance.',
			id: 'Teori menarik hanya ditulis jadi poin teks datar tanpa visualisasi ruang maupun bukti gerak sehingga penonton cepat bosan dan klik keluar.',
		},
		afterPointTitle: {
			en: 'Widescreen Spatial Storytelling, Clean Data & Sound Mix',
			id: 'Cerita Layar Lebar 16:9, Bukti Jelas & Audio Menyatu',
		},
		afterPointDesc: {
			en: 'Proves the idea visually across the 16:9 canvas (2 jammed lanes widening -> new lanes refilling -> 16 cars vs 1 bus split-screen) with synced subtitles and SFX.',
			id: 'Membuktikan konsep langsung di layar lebar (2 lajur macet melebar jadi 4 -> terisi mobil baru -> split 16 mobil vs 1 bus) plus subtitel sinkron & efek suara.',
		},
		defaultSplit: 50,
	},
	{
		id: 'editing',
		tabNum: '03',
		tabLabel: { en: 'Editing & Color Grade', id: 'Editing & Color Grade' },
		purpose: {
			en: 'Inspect an authentic Adobe Premiere Pro Color Workspace in our studio style: compressed flat LOG scopes & untouched controls vs. calibrated RGB Parade, Vectorscope skin-tone alignment, color wheels, curves, and multi-track timeline at frame 00:00:14:21.',
			id: 'Lihat isi ruang kerja Color Grading Adobe Premiere Pro yang akurat dalam gaya komik studio: dari kamera LOG datar & kontrol nol ke RGB Parade terukur, garis skin-tone Vectorscope, Color Wheels, Curves, & 5 track timeline di frame 00:00:14:21.',
		},
		beforeBadge: { en: 'BEFORE · RAW LOG', id: 'SEBELUM · LOG MENTAH' },
		afterBadge: { en: 'AFTER · GRADED WORKSPACE', id: 'SESUDAH · FULL GRADE' },
		beforePointTitle: {
			en: 'Flat LOG Footage & Untouched Premiere Panels',
			id: 'Warna LOG Pudar & Panel Color Belum Disentuh',
		},
		beforePointDesc: {
			en: 'Washed camera signal clustered at narrow IRE levels, centered gray vectorscope dot, zeroed Color Wheels, raw background hum, and one uncut clip.',
			id: 'Sinyal kamera pucat menumpuk di tengah grafik RGB Parade & Vectorscope, roda warna masih nol, suara ruang belum dibersihkan, dan klip belum dipotong.',
		},
		afterPointTitle: {
			en: 'Calibrated Scopes, Color Wheels & 5-Track Finishing',
			id: 'Lumetri Scopes Terukur, Color Grade & 5-Track Rapi',
		},
		afterPointDesc: {
			en: 'Expanded RGB Parade clouds, warm tungsten skin-tone trace on Vectorscope, sculpted S-Curve + 3 Color Wheels, B-roll cutaways, and clean Voice + SFX mix.',
			id: 'Sebaran warna RGB Parade lebar, warna kulit hangat tepat di garis Vectorscope, S-Curve & Color Wheels seimbang, B-roll rapi, serta audio suara + efek menyatu.',
		},
		defaultSplit: 50,
	},
];

const DIFF_MODE_BY_ID: Record<DiffModeId, DiffModeSpec> = {
	vertical: DIFF_MODES[0],
	horizontal: DIFF_MODES[1],
	editing: DIFF_MODES[2],
};

/* ============================================================================
   MODE 01: AUTHENTIC ADOBE PREMIERE PRO COLOR WORKSPACE (RETRO COMIC EDITION)
   - Accurate Panel Topology:
     Left: Lumetri Scopes (Parade RGB oscilloscope traces + YUV Vectorscope w/ skin line)
     Center: Program Monitor (Tokyo Omoide Yokocho real still + transport + VU meter)
     Right: Lumetri Color accordion (Basic Correction, 3 Color Wheels, RGB S-Curve)
     Bottom: Tools Dock + Multi-track Timeline with STATIONARY parked playhead
   ============================================================================ */
function LumetriScopesCanvas({ isAfter }: { isAfter: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let rafId = 0;
		let w = 220;
		let h = 220;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const start = performance.now();

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = Math.max(140, rect.width);
			h = Math.max(150, rect.height);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		// Deterministic pseudo-random helper for phosphor grain look
		const hash = (n: number) => {
			const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
			return x - Math.floor(x);
		};

		const draw = (nowMs: number) => {
			const t = reduced ? 0.5 : (nowMs - start) / 1000;
			ctx.clearRect(0, 0, w, h);

			ctx.fillStyle = '#070B11';
			ctx.fillRect(0, 0, w, h);

			// ---------- TOP HALF: RGB PARADE OSCILLOSCOPE ----------
			const paradeTop = 14;
			const paradeH = h * 0.44;
			const paradeBot = paradeTop + paradeH;
			const leftPad = 24;
			const traceW = w - leftPad - 6;

			// Header label inside Parade scope
			ctx.fillStyle = isAfter ? '#74B9FF' : 'rgba(255,255,255,0.45)';
			ctx.font = '700 8px "JetBrains Mono", monospace';
			ctx.textBaseline = 'top';
			ctx.fillText('Parade (RGB)', 6, 3);

			// IRE Horizontal Graticules (100, 80, 60, 40, 20, 0)
			const ireLabels = [100, 80, 60, 40, 20, 0];
			ctx.font = '600 7px "JetBrains Mono", monospace';
			ctx.textBaseline = 'middle';
			ireLabels.forEach((ire, idx) => {
				const gy = paradeTop + (idx / (ireLabels.length - 1)) * paradeH;
				ctx.strokeStyle = ire === 100 || ire === 0 ? 'rgba(116,185,255,0.32)' : 'rgba(116,185,255,0.14)';
				ctx.lineWidth = 1;
				ctx.setLineDash(ire === 100 || ire === 0 ? [] : [2, 2]);
				ctx.beginPath();
				ctx.moveTo(leftPad, gy);
				ctx.lineTo(w - 6, gy);
				ctx.stroke();
				ctx.setLineDash([]);

				ctx.fillStyle = 'rgba(116,185,255,0.65)';
				ctx.fillText(String(ire), 3, gy);
			});

			// Vertical dividers between R | G | B parade zones
			const chanW = traceW / 3;
			for (let c = 1; c < 3; c++) {
				const dx = leftPad + chanW * c;
				ctx.strokeStyle = 'rgba(255,255,255,0.12)';
				ctx.beginPath();
				ctx.moveTo(dx, paradeTop);
				ctx.lineTo(dx, paradeBot);
				ctx.stroke();
			}

			// Phosphor Scatter Trace Clouds for R, G, B Channels
			const channels = [
				{
					color: isAfter ? 'rgba(253, 97, 65, 0.72)' : 'rgba(148, 163, 184, 0.35)',
					baseCenter: isAfter ? 0.64 : 0.49,
					spread: isAfter ? 0.36 : 0.13,
					waveBias: 0.12,
				},
				{
					color: isAfter ? 'rgba(92, 230, 46, 0.70)' : 'rgba(148, 163, 184, 0.35)',
					baseCenter: isAfter ? 0.49 : 0.48,
					spread: isAfter ? 0.30 : 0.13,
					waveBias: 0.04,
				},
				{
					color: isAfter ? 'rgba(77, 157, 224, 0.74)' : 'rgba(148, 163, 184, 0.35)',
					baseCenter: isAfter ? 0.28 : 0.50,
					spread: isAfter ? 0.24 : 0.13,
					waveBias: -0.05,
				},
			];

			const jitterPhase = isAfter ? Math.floor(t * 14) : Math.floor(t * 3);
			channels.forEach((ch, cIdx) => {
				const startX = leftPad + cIdx * chanW + 2;
				const usableW = chanW - 4;
				ctx.fillStyle = ch.color;
				for (let col = 0; col < 34; col++) {
					const u = col / 33;
					const px = startX + u * usableW;
					// Simulate Izakaya counter bright left lantern vs warm counter middle vs deep shadows
					const profile =
						Math.sin(u * Math.PI * 2.1 + cIdx * 0.9) * ch.waveBias +
						Math.cos(u * Math.PI * 4.3) * (ch.spread * 0.22);
					for (let s = 0; s < 14; s++) {
						const rnd = hash(col * 31 + s * 17 + cIdx * 101 + jitterPhase * 0.07);
						const ireNorm = Math.min(
							0.97,
							Math.max(0.03, ch.baseCenter + profile + (rnd - 0.5) * ch.spread)
						);
						const py = paradeBot - ireNorm * paradeH;
						ctx.fillRect(px, py, 1.5, 1.5);
					}
				}
			});

			// Divider separating Parade and Vectorscope
			const sepY = h * 0.51;
			ctx.strokeStyle = '#050505';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(0, sepY);
			ctx.lineTo(w, sepY);
			ctx.stroke();

			// ---------- BOTTOM HALF: VECTORSCOPE YUV ----------
			ctx.fillStyle = isAfter ? '#74B9FF' : 'rgba(255,255,255,0.45)';
			ctx.font = '700 8px "JetBrains Mono", monospace';
			ctx.textBaseline = 'top';
			ctx.fillText('Vectorscope YUV', 6, sepY + 4);

			const vcx = w * 0.5;
			const vcy = sepY + (h - sepY) * 0.56;
			const vr = Math.min(w * 0.34, (h - sepY) * 0.36);

			// Vectorscope circular graticule
			ctx.strokeStyle = 'rgba(116,185,255,0.22)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(vcx, vcy, vr, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(vcx, vcy, vr * 0.5, 0, Math.PI * 2);
			ctx.stroke();

			// Crosshairs
			ctx.strokeStyle = 'rgba(116,185,255,0.16)';
			ctx.beginPath();
			ctx.moveTo(vcx - vr, vcy);
			ctx.lineTo(vcx + vr, vcy);
			ctx.moveTo(vcx, vcy - vr);
			ctx.lineTo(vcx, vcy + vr);
			ctx.stroke();

			// Iconic Premiere Skin-Tone Line (approx 11 o'clock / -124 deg from +X)
			const skinAngle = (-124 * Math.PI) / 180;
			ctx.strokeStyle = isAfter ? 'rgba(255, 212, 38, 0.55)' : 'rgba(255, 255, 255, 0.18)';
			ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(vcx, vcy);
			ctx.lineTo(vcx + Math.cos(skinAngle) * vr, vcy + Math.sin(skinAngle) * vr);
			ctx.stroke();

			// 6 Standard Rec.709 Hex Color Targets: R, Yl, G, Cy, B, Mg
			const targets = [
				{ label: 'R', ang: -103, col: '#FD6141' },
				{ label: 'Yl', ang: -167, col: '#FFD426' },
				{ label: 'G', ang: 120, col: '#5CE62E' },
				{ label: 'Cy', ang: 77, col: '#4D9DE0' },
				{ label: 'B', ang: 13, col: '#3886C0' },
				{ label: 'Mg', ang: -60, col: '#E879F9' },
			];
			ctx.font = '700 6.5px "JetBrains Mono", monospace';
			ctx.textBaseline = 'middle';
			targets.forEach((tg) => {
				const rad = (tg.ang * Math.PI) / 180;
				const tx = vcx + Math.cos(rad) * (vr * 0.78);
				const ty = vcy + Math.sin(rad) * (vr * 0.78);
				ctx.strokeStyle = isAfter ? tg.col : 'rgba(255,255,255,0.22)';
				ctx.lineWidth = 1;
				ctx.strokeRect(tx - 3, ty - 3, 6, 6);
				ctx.fillStyle = isAfter ? 'rgba(252,240,211,0.75)' : 'rgba(255,255,255,0.35)';
				const lx = vcx + Math.cos(rad) * (vr * 0.96) - 4;
				const ly = vcy + Math.sin(rad) * (vr * 0.96);
				ctx.fillText(tg.label, lx, ly);
			});

			// Vectorscope Chroma Cloud Trace (Muted center vs Rich warm tungsten along skin tone line)
			const cloudCount = 135;
			const breath = isAfter ? 1 + Math.sin(t * 2.2) * 0.04 : 1;
			for (let i = 0; i < cloudCount; i++) {
				const r1 = hash(i * 7 + jitterPhase * 0.05);
				const r2 = hash(i * 19 + 41 + jitterPhase * 0.05);
				let dist: number;
				let ang: number;
				if (isAfter) {
					// Concentrated along warm red-yellow tungsten & skin-tone quadrant + subtle teal shadows
					const isWarm = i < cloudCount * 0.82;
					ang = isWarm ? ((-132 + (r1 - 0.5) * 44) * Math.PI) / 180 : ((65 + (r1 - 0.5) * 32) * Math.PI) / 180;
					dist = (0.14 + r2 * (isWarm ? 0.62 : 0.34)) * vr * breath;
					ctx.fillStyle = isWarm
						? i % 3 === 0
							? 'rgba(255, 212, 38, 0.78)'
							: 'rgba(253, 150, 68, 0.72)'
						: 'rgba(77, 157, 224, 0.55)';
				} else {
					ang = r1 * Math.PI * 2;
					dist = r2 * vr * 0.16;
					ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
				}
				const px = vcx + Math.cos(ang) * dist;
				const py = vcy + Math.sin(ang) * dist;
				ctx.fillRect(px, py, 1.8, 1.8);
			}

			if (!reduced) {
				rafId = window.requestAnimationFrame(draw);
			}
		};

		resize();
		window.addEventListener('resize', resize);
		rafId = window.requestAnimationFrame(draw);

		return () => {
			window.cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	}, [isAfter]);

	return <canvas ref={canvasRef} className='w-full h-full block' />;
}

function PremiereWorkspaceLayer({ isAfter }: { isAfter: boolean }) {
	const { t } = useLanguage();

	const colorWheels = isAfter
		? [
				{ label: 'Shadows', dx: '42%', dy: '56%', tint: 'from-[#1B3A5C] to-[#0A1420]', luma: '45%' },
				{ label: 'Midtones', dx: '60%', dy: '38%', tint: 'from-[#6B3E1E] to-[#1A130D]', luma: '58%' },
				{ label: 'Highlights', dx: '64%', dy: '34%', tint: 'from-[#7A5D18] to-[#1D190C]', luma: '66%' },
			]
		: [
				{ label: 'Shadows', dx: '50%', dy: '50%', tint: 'from-[#2A2F3A] to-[#14171D]', luma: '50%' },
				{ label: 'Midtones', dx: '50%', dy: '50%', tint: 'from-[#2A2F3A] to-[#14171D]', luma: '50%' },
				{ label: 'Highlights', dx: '50%', dy: '50%', tint: 'from-[#2A2F3A] to-[#14171D]', luma: '50%' },
			];

	const basicSliders = [
		{ name: 'Temperature', pct: isAfter ? 68 : 50, val: isAfter ? '+24' : '0.0', accent: 'bg-[#FD6141]' },
		{ name: 'Contrast', pct: isAfter ? 74 : 50, val: isAfter ? '+38' : '0.0', accent: 'bg-[#FFD426]' },
		{ name: 'Highlights', pct: isAfter ? 38 : 50, val: isAfter ? '-18' : '0.0', accent: 'bg-[#74B9FF]' },
		{ name: 'Saturation', pct: isAfter ? 72 : 50, val: isAfter ? '126' : '100', accent: 'bg-[#5CE62E]' },
	];

	return (
		<div className={`w-full h-full flex flex-col select-none ${isAfter ? 'bg-[#111722]' : 'bg-[#1C2028]'}`}>
			{/* Top Adobe Premiere Pro Workspace Menu & Mode Tabs */}
			<div
				className={`h-6 sm:h-7 shrink-0 px-2 sm:px-2.5 border-b-2 border-[#050505] flex items-center justify-between gap-2 font-mono text-[8.5px] sm:text-[10px] ${
					isAfter ? 'bg-[#192438] text-[#FCF0D3]' : 'bg-[#252A34] text-white/55'
				}`}
			>
				<div className='flex items-center gap-1.5 sm:gap-2 min-w-0'>
					<span
						className={`px-1.5 py-0.5 rounded-[2px] font-black border border-[#050505] leading-none ${
							isAfter ? 'bg-[#2C6FB8] text-white' : 'bg-[#394150] text-white/75'
						}`}
					>
						Pr
					</span>
					<span className='hidden lg:inline opacity-45'>Learning</span>
					<span className='hidden md:inline opacity-55'>Assembly</span>
					<span className='hidden sm:inline opacity-65'>Editing</span>
					<span
						className={`px-1.5 py-0.5 rounded-[2px] font-black leading-none ${
							isAfter ? 'bg-[#3886C0] text-white border border-[#050505]' : 'bg-white/10 text-white/60'
						}`}
					>
						Color
					</span>
					<span className='hidden md:inline opacity-55'>Effects</span>
					<span className='hidden lg:inline opacity-45'>Audio</span>
				</div>

				<div className='flex items-center gap-1.5 shrink-0'>
					{isAfter ? (
						<>
							<span className='hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#050505] border border-[#5CE62E]/70 text-[#5CE62E] text-[8px] font-bold'>
								<span className='size-1.5 rounded-full bg-[#5CE62E] animate-pulse' />
								REC.709 · GRADED
							</span>
							<span className='px-1 sm:px-2 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] text-[#050505] font-black text-[7px] sm:text-[9.5px] tracking-tight sm:tracking-normal whitespace-nowrap'>
								{t(DIFF_MODE_BY_ID.editing.afterBadge)}
							</span>
						</>
					) : (
						<span className='px-1 sm:px-2 py-0.5 rounded-sm bg-[#FD6141] border border-[#050505] text-[#050505] font-black text-[7px] sm:text-[9.5px] tracking-tight sm:tracking-normal whitespace-nowrap'>
							{t(DIFF_MODE_BY_ID.editing.beforeBadge)}
						</span>
					)}
				</div>
			</div>

			{/* Upper 3-Panel Premiere Pro Color Workspace: Lumetri Scopes | Program Monitor | Lumetri Color */}
			<div className='flex-1 min-h-0 grid grid-cols-12'>
				{/* LEFT PANEL: Lumetri Scopes (Parade RGB + Vectorscope YUV) */}
				<div
					className={`hidden md:flex md:col-span-4 lg:col-span-3 flex-col border-r-2 border-[#050505] min-h-0 ${
						isAfter ? 'bg-[#0C121D]' : 'bg-[#171B22]'
					}`}
				>
					<div className='h-5 px-2 border-b border-[#050505] bg-[#161E2B] flex items-center justify-between font-mono text-[8px]'>
						<span className={`font-black ${isAfter ? 'text-[#74B9FF]' : 'text-white/55'}`}>
							Lumetri Scopes
						</span>
						<span className='text-[7px] text-white/45'>≡</span>
					</div>
					<div className='flex-1 min-h-0 relative'>
						<LumetriScopesCanvas isAfter={isAfter} />
					</div>
				</div>

				{/* CENTER PANEL: Program Monitor (Tokyo Omoide Yokocho + Genuine Premiere Transport Bar) */}
				<div className='col-span-12 md:col-span-5 lg:col-span-5 flex flex-col border-r-2 border-[#050505] bg-[#0B0F17] min-h-0'>
					{/* Panel Tab Bar */}
					<div className='h-5 px-2 border-b border-[#050505] bg-[#161E2B] flex items-center justify-between font-mono text-[8px]'>
						<span className={`font-black truncate ${isAfter ? 'text-[#FCF0D3]' : 'text-white/55'}`}>
							Program: SEQ_IZAKAYA
						</span>
						<span className='px-1 py-0.5 rounded-[2px] bg-[#090D14] text-[7px] font-bold text-[#74B9FF]'>
							{isAfter ? 'LUT ON' : 'RAW LOG'}
						</span>
					</div>

					{/* Video Frame Container */}
					<div className='relative flex-1 min-h-0 bg-[#05070B] p-1 sm:p-1.5 flex items-center justify-center overflow-hidden'>
						<div className='relative w-full h-full rounded-[2px] border border-[#050505] overflow-hidden bg-[#0E131D]'>
							<img
								src='/images/studio-diff-clip.webp'
								alt='Tokyo Omoide Yokocho Izakaya cinema frame inside Premiere Program Monitor'
								draggable={false}
								className={`w-full h-full object-cover object-center ${isAfter ? 'scale-[1.03]' : 'scale-100'}`}
								style={{
									filter: isAfter
										? 'contrast(1.18) saturate(1.38) sepia(0.18) brightness(1.04)'
										: 'brightness(1.07) contrast(0.75) saturate(0.26)',
								}}
							/>

							{/* Subtle Cinema Shadow Vignette on Graded Frame */}
							{isAfter && (
								<div
									className='pointer-events-none absolute inset-0'
									style={{
										background:
											'radial-gradient(circle at 48% 46%, transparent 45%, rgba(6, 11, 20, 0.56) 100%)',
									}}
								/>
							)}

							{/* Safe Action Margins / Frame Markers */}
							{isAfter && (
								<>
									<div className='pointer-events-none absolute inset-2 border border-white/15' />
									<span className='pointer-events-none absolute top-1.5 left-1.5 size-2.5 border-t-2 border-l-2 border-[#FFD426]' />
									<span className='pointer-events-none absolute top-1.5 right-1.5 size-2.5 border-t-2 border-r-2 border-[#FFD426]' />
									<span className='pointer-events-none absolute bottom-1.5 left-1.5 size-2.5 border-b-2 border-l-2 border-[#FFD426]' />
									<span className='pointer-events-none absolute bottom-1.5 right-1.5 size-2.5 border-b-2 border-r-2 border-[#FFD426]' />
								</>
							)}

							{/* Subtle Bottom Tag Only (Clean View of Frame) */}
							{isAfter ? (
								<div className='pointer-events-none absolute bottom-1.5 right-1.5 rounded-[2px] border border-[#050505] bg-[#FCF0D3]/95 px-1.5 py-0.5 shadow-[2px_2px_0_#050505]'>
									<p className='font-mono text-[6.5px] sm:text-[7.5px] font-black text-[#050505] leading-none'>
										OMOIDE YOKOCHO · TUNGSTEN LUT
									</p>
								</div>
							) : (
								<div className='pointer-events-none absolute bottom-1.5 left-1.5 rounded-[2px] border border-white/25 bg-[#050505]/75 px-1.5 py-0.5'>
									<p className='font-mono text-[6.5px] sm:text-[7.5px] text-white/70 leading-none'>
										[Flat S-Log3 · Zero LUT]
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Authentic Premiere Program Monitor Transport Bar + dB VU Meter */}
					<div className='h-6 shrink-0 px-2 border-t border-[#050505] bg-[#141A24] flex items-center justify-between gap-2 font-mono text-[7.5px]'>
						<span className={`font-black tabular-nums ${isAfter ? 'text-[#4D9DE0]' : 'text-white/45'}`}>
							00:00:14:21
						</span>

						<div className={`flex items-center gap-1.5 sm:gap-2 ${isAfter ? 'text-[#FCF0D3]' : 'text-white/40'}`}>
							<span>|◀</span>
							<span>◀</span>
							<span className='px-1.5 py-0.5 rounded-[2px] bg-[#0B0F17] border border-white/15'>▶</span>
							<span>▶</span>
							<span>▶|</span>
							<span className='hidden sm:inline text-[#74B9FF] ml-1'>Fit ▾</span>
						</div>

						{/* Stereo Output Level Meter */}
						<div className='flex items-center gap-0.5' aria-hidden='true'>
							<span className='text-[6.5px] text-white/40 mr-0.5'>dB</span>
							{[1, 2, 3, 4, 5, 6].map((seg) => (
								<span
									key={seg}
									className={`w-1.5 h-2.5 rounded-[1px] ${
										isAfter
											? seg >= 6
												? 'bg-[#FD6141]'
												: seg >= 5
													? 'bg-[#FFD426]'
													: 'bg-[#5CE62E] ds-vu-bar'
											: seg <= 2
												? 'bg-white/25'
												: 'bg-white/10'
									}`}
									style={isAfter ? { animationDelay: `${seg * 0.11}s` } : undefined}
								/>
							))}
						</div>
					</div>
				</div>

				{/* RIGHT PANEL: Accurate Premiere Lumetri Color Accordion Panel */}
				<div
					className={`hidden md:flex md:col-span-3 lg:col-span-4 flex-col justify-between p-1.5 sm:p-2 min-h-0 overflow-hidden ${
						isAfter ? 'bg-[#121A28]' : 'bg-[#1A1F28]'
					}`}
				>
					<div className='flex items-center justify-between font-mono text-[8px] border-b border-white/10 pb-1'>
						<span className={`font-black ${isAfter ? 'text-[#FCF0D3]' : 'text-white/50'}`}>
							Lumetri Color
						</span>
						<span
							className={`px-1 py-0.5 rounded-[2px] text-[6.5px] font-black ${
								isAfter ? 'bg-[#FFD426] text-[#050505]' : 'bg-white/10 text-white/40'
							}`}
						>
							{isAfter ? 'MASTER LUT' : 'DEFAULT 0'}
						</span>
					</div>

					{/* Section 1: Basic Correction (Temperature, Contrast, Highlights, Saturation) */}
					<div className='rounded-[2px] border border-[#050505] bg-[#0B1018] p-1.5 space-y-1'>
						<div className='flex items-center justify-between font-mono text-[7px] font-black text-[#74B9FF]'>
							<span>▼ Basic Correction</span>
							<span className='text-white/45 truncate max-w-[95px]'>
								{isAfter ? 'Cinema_Tungsten.cube' : 'Input LUT: None'}
							</span>
						</div>
						<div className='space-y-1'>
							{basicSliders.map((sl) => (
								<div key={sl.name} className='grid grid-cols-12 items-center gap-1 font-mono text-[6.5px]'>
									<span className='col-span-4 text-white/60 truncate'>{sl.name}</span>
									<div className='col-span-6 h-1.5 rounded-full bg-[#1E2736] border border-[#050505] relative flex items-center'>
										<span className='absolute left-1/2 -translate-x-1/2 w-[1px] h-2 bg-white/30' />
										<div className={`h-full rounded-l-full ${sl.accent}`} style={{ width: `${sl.pct}%` }} />
										<span
											className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full border border-[#050505] ${
												isAfter ? 'bg-[#FCF0D3]' : 'bg-[#64748B]'
											}`}
											style={{ left: `${sl.pct}%` }}
										/>
									</div>
									<span
										className={`col-span-2 text-right font-bold tabular-nums ${
											isAfter ? 'text-[#FFD426]' : 'text-white/40'
										}`}
									>
										{sl.val}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Section 2: Color Wheels & Match (Shadows, Midtones, Highlights + Luma Sliders) */}
					<div className='rounded-[2px] border border-[#050505] bg-[#0B1018] p-1.5 space-y-1'>
						<div className='flex items-center justify-between font-mono text-[7px] font-black text-[#74B9FF]'>
							<span>▼ Color Wheels &amp; Match</span>
							<span className='text-[6.5px] text-white/40'>3-Way</span>
						</div>
						<div className='grid grid-cols-3 gap-1.5 pt-0.5'>
							{colorWheels.map((wheel) => (
								<div key={wheel.label} className='flex flex-col items-center gap-0.5'>
									<div className='flex items-center gap-1'>
										{/* Miniature Luma bar beside each Premiere Color Wheel */}
										<div className='w-1 h-8 sm:h-9 rounded-full bg-[#1C2432] border border-[#050505] relative'>
											<span
												className={`absolute left-1/2 -translate-x-1/2 w-2 h-1 rounded-full ${
													isAfter ? 'bg-[#FFD426]' : 'bg-white/40'
												}`}
												style={{ bottom: wheel.luma }}
											/>
										</div>
										{/* Trackball Circle */}
										<div
											className={`relative size-8 sm:size-9 rounded-full border border-[#050505] bg-gradient-to-br ${wheel.tint}`}
										>
											<div className='absolute inset-x-0 top-1/2 h-[1px] bg-white/15' />
											<div className='absolute inset-y-0 left-1/2 w-[1px] bg-white/15' />
											<span
												className={`absolute -translate-x-1/2 -translate-y-1/2 size-2 rounded-full border border-[#050505] ${
													isAfter ? 'bg-[#FFD426] shadow-[0_0_5px_#FFD426]' : 'bg-white/60'
												}`}
												style={{ left: wheel.dx, top: wheel.dy }}
											/>
										</div>
									</div>
									<span className='font-mono text-[6px] font-bold text-white/60'>{wheel.label}</span>
								</div>
							))}
						</div>
					</div>

					{/* Section 3: Curves + Collapsed Accordion Drawers */}
					<div className='rounded-[2px] border border-[#050505] bg-[#0B1018] p-1.5 space-y-1'>
						<div className='flex items-center justify-between font-mono text-[7px] font-black text-[#74B9FF]'>
							<span>▼ Curves (RGB)</span>
							<div className='flex items-center gap-1'>
								<span className='size-1.5 rounded-full bg-white' />
								<span className='size-1.5 rounded-full bg-[#FD6141]' />
								<span className='size-1.5 rounded-full bg-[#5CE62E]' />
								<span className='size-1.5 rounded-full bg-[#4D9DE0]' />
							</div>
						</div>
						<div className='h-8 rounded-[2px] bg-[#06090F] border border-white/10 px-1 flex items-center'>
							<svg viewBox='0 0 120 34' className='w-full h-full'>
								<line x1='2' y1='32' x2='118' y2='2' stroke='rgba(255,255,255,0.16)' strokeDasharray='2 2' strokeWidth='1' />
								{isAfter ? (
									<path
										d='M 2 32 C 36 33, 52 17, 74 10 C 90 5, 104 2, 118 2'
										fill='none'
										stroke='#FFD426'
										strokeWidth='2'
									/>
								) : (
									<line x1='2' y1='32' x2='118' y2='2' stroke='rgba(255,255,255,0.45)' strokeWidth='1.5' />
								)}
							</svg>
						</div>
						<div className='hidden lg:flex items-center justify-between font-mono text-[6px] text-white/40 pt-0.5'>
							<span>▸ Creative</span>
							<span>▸ HSL Secondary</span>
							<span>▸ Vignette</span>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Compact Lumetri Calibration Strip (only visible on < md where side panels hide) */}
			<div
				className={`md:hidden h-6 shrink-0 px-2 border-t border-[#050505] flex items-center justify-between font-mono text-[7.5px] ${
					isAfter ? 'bg-[#121C2D] text-[#FCF0D3]' : 'bg-[#1F242D] text-white/45'
				}`}
			>
				<span>{isAfter ? 'SCOPES: PARADE · SKIN LINE' : 'SCOPES: COMPRESSED LOG'}</span>
				<span className={isAfter ? 'text-[#FFD426] font-bold' : ''}>
					{isAfter ? 'TEMP +24 · LUT ON' : 'TEMP 0 · LUT OFF'}
				</span>
			</div>

			{/* Bottom Row: Premiere Docked Tools Strip + Multi-Track Timeline (Playhead Parked on Inspected Frame!) */}
			<div
				className={`h-[104px] sm:h-[118px] shrink-0 border-t-2 border-[#050505] flex flex-col ${
					isAfter ? 'bg-[#0D131D]' : 'bg-[#171B22]'
				}`}
			>
				{/* Sequence Bar */}
				<div className='h-5 px-2 border-b border-[#050505] bg-[#161E2B] flex items-center justify-between font-mono text-[7.5px] sm:text-[8.5px]'>
					<span className={`font-black ${isAfter ? 'text-[#FCF0D3]' : 'text-white/50'}`}>
						{isAfter ? 'SEQ_IZAKAYA_FINAL' : 'RAW_CAMERA_DUMP'}
					</span>
					<span className='hidden sm:inline text-[#4D9DE0] font-bold'>PLAYHEAD AT 00:00:14:21</span>
					<span className={`font-bold ${isAfter ? 'text-[#5CE62E]' : 'text-white/40'}`}>
						{isAfter ? 'V1-V3 · A1-A2' : 'V1 · A1 UNMIXED'}
					</span>
				</div>

				{/* Tools Strip + Tracks Body */}
				<div className='relative flex-1 min-h-0 flex'>
					{/* Left Premiere Tools Column */}
					<div className='w-6 sm:w-7 shrink-0 border-r border-[#050505] bg-[#141A24] py-1 flex flex-col items-center justify-between font-mono text-[7px] text-white/60'>
						<span
							className={`px-1 py-0.5 rounded-[2px] font-black leading-none ${
								isAfter ? 'bg-[#3886C0] text-white' : 'bg-white/15 text-white/50'
							}`}
						>
							V
						</span>
						<span>C</span>
						<span>T</span>
						<span>H</span>
					</div>

					{/* Timeline Tracks + Clip Blocks + Stationary Parked Playhead at Frame 00:00:14:21 (42% X) */}
					<div className='relative flex-1 px-1.5 sm:px-2 py-1 flex flex-col justify-between font-mono overflow-hidden'>
						{isAfter ? (
							<>
								<div className='flex items-center gap-1 h-3.5'>
									<span className='w-6 text-[7.5px] font-black text-[#FFD426] shrink-0'>V3</span>
									<div className='flex-1 grid grid-cols-12 gap-1 h-full'>
										<div className='col-span-10 rounded-[2px] bg-[#C026D3]/85 border border-[#050505] px-1.5 flex items-center text-[6.5px] font-black text-white truncate'>
											ADJ_LAYER · CINEMA_TUNGSTEN.CUBE + S-CURVE
										</div>
									</div>
								</div>
								<div className='flex items-center gap-1 h-3.5'>
									<span className='w-6 text-[7.5px] font-black text-[#FD6141] shrink-0'>V2</span>
									<div className='flex-1 grid grid-cols-12 gap-1 h-full'>
										<div className='col-span-3 rounded-[2px] bg-[#FD6141] border border-[#050505] px-1 flex items-center text-[6.5px] font-black text-[#050505] truncate'>
											GRILL_STEAM
										</div>
										<div className='col-span-3' />
										<div className='col-span-4 rounded-[2px] bg-[#FFD426] border border-[#050505] px-1 flex items-center text-[6.5px] font-black text-[#050505] truncate'>
											LOWER_THIRD
										</div>
									</div>
								</div>
								<div className='flex items-center gap-1 h-3.5 sm:h-4'>
									<span className='w-6 text-[7.5px] font-black text-[#74B9FF] shrink-0'>V1</span>
									<div className='flex-1 grid grid-cols-12 gap-1 h-full'>
										<div className='col-span-3 rounded-[2px] bg-[#3886C0] border border-[#050505] px-1 flex items-center text-[6.5px] font-black text-white truncate'>
											WIDE_01
										</div>
										<div className='col-span-5 rounded-[2px] bg-[#4D9DE0] border-2 border-[#FFD426] px-1 flex items-center text-[6.5px] font-black text-[#050505] truncate'>
											★ IZAKAYA_CHEF.MXF
										</div>
										<div className='col-span-4 rounded-[2px] bg-[#3886C0] border border-[#050505] px-1 flex items-center text-[6.5px] font-black text-white truncate'>
											J-CUT_OUTRO
										</div>
									</div>
								</div>
								<div className='flex items-center gap-1 h-4 pt-0.5 border-t border-white/10'>
									<span className='w-6 text-[7.5px] font-black text-[#5CE62E] shrink-0'>A1</span>
									<div className='flex-1 grid grid-cols-12 gap-1 h-full'>
										<div className='relative col-span-7 rounded-[2px] bg-[#166534] border border-[#5CE62E]/70 px-1 flex items-center overflow-hidden'>
											<svg viewBox='0 0 180 14' className='w-full h-3 opacity-80' preserveAspectRatio='none'>
												<polyline
													points='0,12 8,4 16,11 26,2 35,10 44,5 54,12 65,3 74,9 84,2 95,11 106,4 118,12 128,3 140,10 152,5 164,11 178,3'
													fill='none'
													stroke='#5CE62E'
													strokeWidth='1.5'
												/>
											</svg>
											<span className='relative z-10 text-[6px] font-black text-[#FCF0D3] ml-1 shrink-0'>
												VO -14LUFS
											</span>
										</div>
										<div className='col-span-5 rounded-[2px] bg-[#9D174D] border border-[#050505] px-1 flex items-center text-[6.5px] font-black text-white truncate'>
											SFX + BGM DUCKED
										</div>
									</div>
								</div>
							</>
						) : (
							<>
								<div className='flex items-center gap-1 h-3.5'>
									<span className='w-6 text-[7.5px] text-white/30 shrink-0'>V3</span>
									<div className='flex-1 h-full rounded-[2px] border border-dashed border-white/15 px-1.5 flex items-center text-[6.5px] text-white/30'>
										No adjustment layer / LUT
									</div>
								</div>
								<div className='flex items-center gap-1 h-3.5'>
									<span className='w-6 text-[7.5px] text-white/30 shrink-0'>V2</span>
									<div className='flex-1 h-full rounded-[2px] border border-dashed border-white/15 px-1.5 flex items-center text-[6.5px] text-white/30'>
										No cutaway B-roll
									</div>
								</div>
								<div className='flex items-center gap-1 h-3.5 sm:h-4'>
									<span className='w-6 text-[7.5px] text-white/55 shrink-0'>V1</span>
									<div className='flex-1 h-full rounded-[2px] bg-[#465163] border border-white/25 px-1.5 flex items-center text-[6.5px] text-white/80 truncate'>
										IZAKAYA_CHEF.MXF (Uncut flat LOG · dead pauses kept)
									</div>
								</div>
								<div className='flex items-center gap-1 h-4 pt-0.5 border-t border-white/10'>
									<span className='w-6 text-[7.5px] text-white/55 shrink-0'>A1</span>
									<div className='flex-1 h-full rounded-[2px] bg-[#4A3236] border border-[#FD6141]/40 px-1.5 flex items-center text-[6.5px] text-[#FCA5A5] truncate'>
										RAW_CAMERA_MIC · HUM &amp; ROOM NOISE
									</div>
								</div>
							</>
						)}

						{/* Stationary Parked Premiere Playhead pinned cleanly at inspected frame 00:00:14:21 (42% X) */}
						<div className='pointer-events-none absolute top-0 bottom-0 left-[44%] z-20'>
							<div className='relative w-[2px] h-full bg-[#3886C0] shadow-[0_0_6px_rgba(56,134,192,0.85)]'>
								<span
									className={`absolute -top-0.5 -left-[5px] w-[12px] h-[9px] bg-[#3886C0] border border-[#050505] rounded-t-[2px] ${
										isAfter ? 'ring-1 ring-[#FFD426]' : ''
									}`}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PremiereDiffScene({ splitPercent }: { splitPercent: number }) {
	return (
		<>
			<div className='absolute inset-0 z-0 isolate overflow-hidden'>
				<PremiereWorkspaceLayer isAfter />
			</div>
			<div
				className='absolute inset-0 z-10 will-change-[clip-path] overflow-hidden'
				style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
			>
				<PremiereWorkspaceLayer isAfter={false} />
			</div>
		</>
	);
}

/* ============================================================================
   MODE 02: 16:9 HORIZONTAL VIDEO EXPLAINER LOOP + WIDESCREEN STUDIO BENEFITS
   Features a centered 16:9 video player playing a real 3-scene looping
   explainer clip ("Why Income Goes Up +40% But Savings Stay Zero") styled
   in our paper-cut / comic motion craft, flanked by Horizontal Video Benefits.
   ============================================================================ */
function HorizontalVideoCanvas({ isAfter }: { isAfter: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { lang } = useLanguage();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let rafId = 0;
		let w = 480;
		let h = 270;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tStart = performance.now();
		const isId = lang === 'id';

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = Math.max(200, rect.width);
			h = Math.max(112, rect.height);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const drawFrame = (nowMs: number) => {
			const rawT = reduced ? 3.2 : (nowMs - tStart) / 1000;
			const clipDur = 8.0;
			const t = isAfter ? rawT : Math.floor(rawT * 3.5) / 3.5;
			const phaseT = t % clipDur; // 0..8s widescreen documentary clip ("Induced Demand")

			ctx.clearRect(0, 0, w, h);

			if (!isAfter) {
				// BEFORE: Dull PowerPoint-style Slide Video exported directly to MP4
				ctx.fillStyle = '#232730';
				ctx.fillRect(0, 0, w, h);

				ctx.strokeStyle = 'rgba(255,255,255,0.12)';
				ctx.lineWidth = 1;
				ctx.strokeRect(10, 10, w - 20, h - 20);

				ctx.fillStyle = '#2E3440';
				ctx.fillRect(14, 14, w - 28, Math.max(20, h * 0.14));
				ctx.fillStyle = 'rgba(255,255,255,0.65)';
				ctx.font = `700 ${Math.max(8, Math.round(w * 0.028))}px "JetBrains Mono", monospace`;
				ctx.textBaseline = 'middle';
				ctx.fillText(
					isId ? 'Slide 01: Teori Induced Demand Lalu Lintas' : 'Slide 01: Highway Induced Demand',
					20,
					14 + h * 0.07
				);

				const bullets = isId
					? [
							'• Menambah lajur jalan raya hanya mengurai macet sesaat.',
							'• Kapasitas baru mendorong pengendara lain pindah jalur.',
							'• Dalam waktu singkat semua lajur kembali penuh sesak.',
							'• Transportasi massal lebih hemat ruang daripada mobil.',
						]
					: [
							'• Adding highway lanes only relieves congestion temporarily.',
							'• Extra road space attracts additional private car trips.',
							'• Expanded lanes quickly reach previous traffic gridlock.',
							'• Public transit carries more commuters per meter.',
						];
				ctx.font = `500 ${Math.max(6.8, Math.round(w * 0.0235))}px "Libre Franklin", system-ui, sans-serif`;
				bullets.forEach((line, i) => {
					const activeRow = Math.floor(phaseT / 2.0) === i;
					ctx.fillStyle = activeRow ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.36)';
					ctx.fillText(line, 20, h * 0.34 + i * (h * 0.13));
				});

				// Flat auto-caption bar at bottom
				ctx.fillStyle = 'rgba(0,0,0,0.65)';
				ctx.fillRect(w * 0.12, h - 24, w * 0.76, 15);
				ctx.fillStyle = 'rgba(255,255,255,0.6)';
				ctx.textAlign = 'center';
				ctx.font = `500 ${Math.max(6.5, Math.round(w * 0.021))}px "Libre Franklin", system-ui, sans-serif`;
				ctx.fillText(
					isId ? 'kapasitas jalan baru mendorong mobil...' : 'extra road space attracts more cars...',
					w * 0.5,
					h - 16.5
				);
				ctx.textAlign = 'left';
			} else {
				// AFTER: Vox-Style 16:9 Widescreen Documentary ("Why Widening Highways Stays Jammed")
				// Crisp textured warm editorial canvas, NO weird loupe/spotlight circles!
				ctx.fillStyle = '#FCF0D3';
				ctx.fillRect(0, 0, w, h);

				ctx.strokeStyle = 'rgba(56, 134, 192, 0.14)';
				ctx.lineWidth = 1;
				const g = Math.max(16, Math.round(w / 18));
				for (let gx = 0; gx < w; gx += g) {
					ctx.beginPath();
					ctx.moveTo(gx, 0);
					ctx.lineTo(gx, h);
					ctx.stroke();
				}
				for (let gy = 0; gy < h; gy += g) {
					ctx.beginPath();
					ctx.moveTo(0, gy);
					ctx.lineTo(w, gy);
					ctx.stroke();
				}

				const scene = phaseT < 2.1 ? 0 : phaseT < 4.3 ? 1 : phaseT < 6.4 ? 2 : 3;
				const sStart = scene === 0 ? 0 : scene === 1 ? 2.1 : scene === 2 ? 4.3 : 6.4;
				const sDur = scene === 0 ? 2.1 : scene === 1 ? 2.2 : scene === 2 ? 2.1 : 1.6;
				const sProg = Math.min(1, Math.max(0, (phaseT - sStart) / sDur));
				const ease = 1 - Math.pow(1 - Math.min(1, sProg * 1.45), 3);

				// Top documentary topic tag & crisp synced SFX cue
				ctx.fillStyle = '#050505';
				ctx.fillRect(10, 8, Math.min(w * 0.58, 215), 15);
				ctx.fillStyle = '#FFD426';
				ctx.font = `900 ${Math.max(6.2, Math.round(w * 0.0195))}px "JetBrains Mono", monospace`;
				ctx.textBaseline = 'middle';
				ctx.fillText(isId ? 'JALAN DIPERLEBAR = TETAP MACET?' : 'WIDER ROADS = STILL JAMMED?', 15, 15.5);

				const sfxLabel =
					scene === 0
						? 'SFX: CITY_HORN'
						: scene === 1
							? 'SFX: WHOOSH_WIDE'
							: scene === 2
								? 'SFX: CROWD_RUSH'
								: 'SFX: SPLIT_LOCK';
				const sfxW = Math.max(76, w * 0.22);
				ctx.fillStyle = '#050505';
				ctx.fillRect(w - sfxW - 9, 9, sfxW, 14);
				ctx.fillStyle = '#5CE62E';
				ctx.fillRect(w - sfxW - 11, 7, sfxW, 14);
				ctx.strokeStyle = '#050505';
				ctx.lineWidth = 1.5;
				ctx.strokeRect(w - sfxW - 11, 7, sfxW, 14);
				ctx.fillStyle = '#050505';
				ctx.textAlign = 'center';
				ctx.font = `900 ${Math.max(6, Math.round(w * 0.0185))}px "JetBrains Mono", monospace`;
				ctx.fillText(sfxLabel, w - 11 - sfxW / 2, 14);
				ctx.textAlign = 'left';

				// Helper: stylized crisp comic car / bus icon
				const drawCar = (cx: number, cy: number, cw: number, ch: number, color: string) => {
					ctx.fillStyle = '#050505';
					ctx.fillRect(cx + 2, cy + 2, cw, ch);
					ctx.fillStyle = color;
					ctx.fillRect(cx, cy, cw, ch);
					ctx.strokeStyle = '#050505';
					ctx.lineWidth = 1.5;
					ctx.strokeRect(cx, cy, cw, ch);
					// Windshield strip
					ctx.fillStyle = '#FCF0D3';
					ctx.fillRect(cx + cw * 0.56, cy + ch * 0.22, cw * 0.22, ch * 0.56);
				};

				let subLine = '';

				if (scene <= 2) {
					// WIDESCREEN 16:9 HIGHWAY SPATIAL STORY (Scenes 0, 1, 2 share continuous road space!)
					const laneCount = scene === 0 ? 2 : 2 + 2 * Math.min(1, scene > 1 ? 1 : ease);
					const roadH = Math.max(48, (h * 0.23) * (laneCount / 2));
					const roadY = h * 0.49 - roadH / 2;

					// Roadside curbs & shadows
					ctx.fillStyle = '#D9CBA8';
					ctx.fillRect(0, roadY - 6, w, roadH + 12);
					// Main highway asphalt band across full 16:9 width
					ctx.fillStyle = '#1E2532';
					ctx.fillRect(0, roadY, w, roadH);
					ctx.strokeStyle = '#050505';
					ctx.lineWidth = 2.5;
					ctx.beginPath();
					ctx.moveTo(0, roadY);
					ctx.lineTo(w, roadY);
					ctx.moveTo(0, roadY + roadH);
					ctx.lineTo(w, roadY + roadH);
					ctx.stroke();

					// Dashed painted lane dividers
					const actualLanes = scene === 0 ? 2 : 4;
					const laneH = roadH / actualLanes;
					ctx.strokeStyle = 'rgba(255, 212, 38, 0.72)';
					ctx.lineWidth = 1.5;
					ctx.setLineDash([12, 10]);
					ctx.lineDashOffset = scene === 1 ? -rawT * 95 : -rawT * 10;
					for (let l = 1; l < actualLanes; l++) {
						const ly = roadY + l * laneH;
						ctx.beginPath();
						ctx.moveTo(0, ly);
						ctx.lineTo(w, ly);
						ctx.stroke();
					}
					ctx.setLineDash([]);

					const carW = Math.max(16, w * 0.048);
					const carH = Math.max(9, laneH * 0.56);

					if (scene === 0) {
						// SCENE 1: 2 Narrow Lanes Bumper-to-Bumper Jam!
						for (let l = 0; l < 2; l++) {
							const cy = roadY + l * laneH + (laneH - carH) / 2;
							for (let k = 0; k < 7; k++) {
								const cx = w * 0.08 + k * (carW * 1.38) + Math.sin(rawT * 6 + k) * 1.2;
								drawCar(cx, cy, carW, carH, k % 2 === 0 ? '#FD6141' : '#FFD426');
							}
						}
						// Badge above road sized dynamically via measureText so it never overflows on mobile
						ctx.font = `900 ${Math.max(5.8, Math.round(w * 0.019))}px "JetBrains Mono", monospace`;
						const lbl0 = isId ? '2 LAJUR · MACET PARAH' : '2 LANES · HEAVY JAM';
						const bw0 = ctx.measureText(lbl0).width + 12;
						ctx.fillStyle = '#FD6141';
						ctx.fillRect(12, roadY - 22, bw0, 16);
						ctx.strokeStyle = '#050505';
						ctx.lineWidth = 1.6;
						ctx.strokeRect(12, roadY - 22, bw0, 16);
						ctx.fillStyle = '#050505';
						ctx.fillText(lbl0, 18, roadY - 14);

						subLine = isId
							? 'Saat jalan 2 lajur macet parah, solusinya sering...'
							: 'When a 2-lane highway jams every morning...';
					} else if (scene === 1) {
						// SCENE 2: Widens cleanly to 4 Lanes -> Free-flowing Fast Green Cars!
						for (let l = 1; l <= 2; l++) {
							const cy = roadY + l * laneH + (laneH - carH) / 2;
							for (let k = 0; k < 3; k++) {
								const cx = ((rawT * (w * 0.52) + k * (w * 0.34) + l * 45) % (w + carW)) - carW;
								drawCar(cx, cy, carW, carH, '#5CE62E');
							}
						}
						ctx.font = `900 ${Math.max(5.8, Math.round(w * 0.019))}px "JetBrains Mono", monospace`;
						const lbl1 = isId ? '4 LAJUR · LANCAR SESAAT' : '4 LANES · FLOWS AT FIRST';
						const bw1 = ctx.measureText(lbl1).width + 12;
						ctx.fillStyle = '#5CE62E';
						ctx.fillRect(12, roadY - 22, bw1, 16);
						ctx.strokeStyle = '#050505';
						ctx.lineWidth = 1.6;
						ctx.strokeRect(12, roadY - 22, bw1, 16);
						ctx.fillStyle = '#050505';
						ctx.fillText(lbl1, 18, roadY - 14);

						subLine = isId
							? '...jalan diperlebar 2× lipat dan terasa lancar!'
							: '...expanding to 4 lanes seems to fix everything!';
					} else {
						// SCENE 3: Induced Demand Twist: Outer Feed Arrows Swarm ALL 4 Lanes Full Again!
						const visibleCols = Math.ceil(ease * 7);
						for (let l = 0; l < 4; l++) {
							const cy = roadY + l * laneH + (laneH - carH) / 2;
							for (let k = 0; k < visibleCols; k++) {
								const cx = w * 0.07 + k * (carW * 1.38);
								drawCar(cx, cy, carW, carH, l === 0 || l === 3 ? '#3886C0' : '#FD6141');
							}
						}
						if (ease > 0.25) {
							ctx.strokeStyle = '#FD6141';
							ctx.lineWidth = 2.4;
							[0.2, 0.42].forEach((ux) => {
								ctx.beginPath();
								ctx.moveTo(w * ux, roadY - 20);
								ctx.lineTo(w * (ux + 0.05), roadY - 3);
								ctx.stroke();
							});
						}

						ctx.font = `900 ${Math.max(5.8, Math.round(w * 0.019))}px "JetBrains Mono", monospace`;
						const lbl2 = isId ? 'MOBIL BARU MASUK · MACET LAGI!' : 'NEW CARS JOIN · JAMMED AGAIN!';
						const bw2 = ctx.measureText(lbl2).width + 12;
						const bx2 = Math.max(12, w - bw2 - 12);
						ctx.fillStyle = '#FFD426';
						ctx.fillRect(bx2, roadY - 22, bw2, 16);
						ctx.strokeStyle = '#050505';
						ctx.lineWidth = 1.6;
						ctx.strokeRect(bx2, roadY - 22, bw2, 16);
						ctx.fillStyle = '#050505';
						ctx.fillText(lbl2, bx2 + 6, roadY - 14);

						subLine = isId
							? 'Tapi lajur baru mengundang pengendara baru, lalu macet lagi.'
							: 'Yet extra lanes attract more drivers until gridlock returns.';
					}
				} else {
					// SCENE 4: Widescreen Vox Split-Screen Comparison: 16 Cars vs 1 Bus (= Same People!)
					const leftX = w * 0.07;
					const midX = w * 0.5;
					const rightX = w * 0.54;
					const panelW = w * 0.39;
					const panelY = h * 0.2;
					const panelH = h * 0.52;

					// Center crisp editorial divider
					ctx.strokeStyle = '#050505';
					ctx.lineWidth = 2;
					ctx.setLineDash([4, 3]);
					ctx.beginPath();
					ctx.moveTo(midX, panelY - 4);
					ctx.lineTo(midX, panelY + panelH + 4);
					ctx.stroke();
					ctx.setLineDash([]);

					// Left Panel: 16 Private Cars eating whole road block
					ctx.fillStyle = '#FFF0EC';
					ctx.fillRect(leftX, panelY, panelW, panelH);
					ctx.strokeRect(leftX, panelY, panelW, panelH);
					ctx.fillStyle = '#FD6141';
					ctx.fillRect(leftX, panelY, panelW, 15);
					ctx.strokeRect(leftX, panelY, panelW, 15);
					ctx.fillStyle = '#050505';
					ctx.font = `900 ${Math.max(6.5, Math.round(w * 0.019))}px "JetBrains Mono", monospace`;
					ctx.fillText(isId ? '16 MOBIL PRIBADI = PENUH' : '16 PRIVATE CARS = FULL', leftX + 6, panelY + 7.5);

					const miniW = panelW * 0.19;
					const miniH = panelH * 0.13;
					for (let r = 0; r < 3; r++) {
						for (let c = 0; c < 4; c++) {
							const mx = leftX + panelW * 0.07 + c * (miniW * 1.18);
							const my = panelY + 24 + r * (miniH * 1.38);
							drawCar(mx, my, miniW, miniH, '#FD6141');
						}
					}

					// Right Panel: 1 Sleek Transit Bus = Same Passengers!
					ctx.fillStyle = '#F2FCEB';
					ctx.fillRect(rightX, panelY, panelW, panelH);
					ctx.strokeRect(rightX, panelY, panelW, panelH);
					ctx.fillStyle = '#5CE62E';
					ctx.fillRect(rightX, panelY, panelW, 15);
					ctx.strokeRect(rightX, panelY, panelW, 15);
					ctx.fillStyle = '#050505';
					ctx.fillText(isId ? '1 BUS UMUM = LEGA 6×' : '1 CITY BUS = 6× SPACE', rightX + 6, panelY + 7.5);

					// Draw single illustrated Comic City Bus gliding in cleanly
					const busW = panelW * 0.62;
					const busH = panelH * 0.34;
					const busX = rightX + (panelW - busW) / 2 - (1 - ease) * 14;
					const busY = panelY + panelH * 0.42;
					ctx.fillStyle = '#050505';
					ctx.fillRect(busX + 3, busY + 3, busW, busH);
					ctx.fillStyle = '#FFD426';
					ctx.fillRect(busX, busY, busW, busH);
					ctx.strokeRect(busX, busY, busW, busH);
					// Bus windows
					for (let bw = 0; bw < 4; bw++) {
						ctx.fillStyle = '#3886C0';
						ctx.fillRect(busX + 6 + bw * ((busW - 16) / 4), busY + 5, (busW - 22) / 4, busH * 0.44);
					}

					ctx.fillStyle = '#050505';
					ctx.textAlign = 'center';
					ctx.font = `900 ${Math.max(6.8, Math.round(w * 0.02))}px "JetBrains Mono", monospace`;
					ctx.fillText(isId ? 'TAMBAH ANGKUTAN UMUM!' : 'MOVE PEOPLE, NOT CARS!', rightX + panelW / 2, panelY + panelH - 12);
					ctx.textAlign = 'left';

					subLine = isId
						? 'Solusi nyata: tambah bus/kereta, bukan sekadar lebar aspal.'
						: 'Fix gridlock with high-capacity transit, not wider highways.';
				}

				// Synced Documentary Bottom Subtitle Pill Inside Video
				ctx.fillStyle = 'rgba(5, 5, 5, 0.88)';
				const subH = Math.max(17, Math.round(h * 0.1));
				const subW = Math.min(w - 20, Math.max(w * 0.8, 215));
				ctx.fillRect((w - subW) / 2, h - subH - 7, subW, subH);
				ctx.fillStyle = '#FCF0D3';
				ctx.textAlign = 'center';
				ctx.font = `700 ${Math.max(6.6, Math.round(w * 0.022))}px "Libre Franklin", system-ui, sans-serif`;
				ctx.fillText(subLine, w * 0.5, h - subH / 2 - 7);
				ctx.textAlign = 'left';

				// Frame-synced Playhead Scrub Bar along bottom edge
				ctx.fillStyle = 'rgba(5,5,5,0.22)';
				ctx.fillRect(0, h - 3, w, 3);
				ctx.fillStyle = '#FD6141';
				ctx.fillRect(0, h - 3, w * (phaseT / clipDur), 3);
			}

			if (!reduced) {
				rafId = window.requestAnimationFrame(drawFrame);
			}
		};

		resize();
		window.addEventListener('resize', resize);
		rafId = window.requestAnimationFrame(drawFrame);

		return () => {
			window.cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	}, [isAfter, lang]);

	return <canvas ref={canvasRef} className='w-full h-full block' />;
}

function HorizontalLayer({ isAfter }: { isAfter: boolean }) {
	const { t } = useLanguage();

	const horizontalBenefits = isAfter
		? [
				{
					title: { en: 'Story & Research First', id: 'Cerita & Riset Rapi' },
					desc: { en: 'Clear hook-to-CTA narrative', id: 'Alur jelas awal hingga akhir' },
				},
				{
					title: { en: 'Spatial Motion Proof', id: 'Visual Ruang Jelas' },
					desc: { en: 'Grasp complex ideas in 2 sec', id: 'Langsung paham dalam 2 detik' },
				},
				{
					title: { en: 'Voice + SFX Layered', id: 'Suara Jernih + SFX' },
					desc: { en: 'Balanced voice & cut accents', id: 'Narasi rapi berpadu efek' },
				},
				{
					title: { en: '16:9 Viewer Retention', id: 'Penonton Betah 16:9' },
					desc: { en: 'Crafted for YouTube & web', id: 'Nyaman ditonton layar lebar' },
				},
			]
		: [
				{
					title: { en: 'Slide-Style Bullet Text', id: 'Teks Panjang Ala Slide' },
					desc: { en: 'Static paragraphs force reading', id: 'Penonton capek baca teks' },
				},
				{
					title: { en: 'Dry Abstract Concepts', id: 'Konsep Kering Tanpa Visual' },
					desc: { en: 'Zero animated spatial proof', id: 'Tanpa peragaan ruang nyata' },
				},
				{
					title: { en: 'Flat Unmixed Audio', id: 'Audio Datar Tanpa SFX' },
					desc: { en: 'No pacing beats or sound cues', id: 'Transisi terasa hampa' },
				},
				{
					title: { en: 'Early Viewer Drop-Off', id: 'Penonton Cepat Keluar' },
					desc: { en: 'Viewers skip past 10 seconds', id: 'Retensi turun di awal video' },
				},
			];

	return (
		<div
			className={`w-full h-full relative flex flex-col items-center justify-center p-2.5 sm:p-4 overflow-hidden select-none ${
				isAfter ? 'bg-[#122640]' : 'bg-[#1D2028]'
			}`}
		>
			{/* Blueprint Background */}
			<div
				className='pointer-events-none absolute inset-0 opacity-20'
				style={{
					backgroundImage: isAfter
						? 'linear-gradient(to right, rgba(252,240,211,0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(252,240,211,0.3) 1px, transparent 1px)'
						: 'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
					backgroundSize: '26px 26px',
				}}
			/>

			{/* Corner Badge strictly isolated on Before or After side */}
			{isAfter ? (
				<div className='pointer-events-none absolute top-2 right-2 sm:top-3.5 sm:right-4 z-20 flex items-center gap-2'>
					<span className='hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#050505]/90 border border-[#FFD426] font-mono text-[9.5px] font-bold text-[#FFD426]'>
						16:9 YOUTUBE · WEB EXPLAINER
					</span>
					<span className='px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-[#5CE62E] border-2 border-[#050505] font-mono text-[7.5px] sm:text-xs font-black text-[#050505] tracking-tight sm:tracking-normal whitespace-nowrap shadow-[2px_2px_0_#050505]'>
						{t(DIFF_MODE_BY_ID.horizontal.afterBadge)}
					</span>
				</div>
			) : (
				<div className='pointer-events-none absolute top-2 left-2 sm:top-3.5 sm:left-4 z-20 flex items-center gap-2'>
					<span className='px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-[#FD6141] border-2 border-[#050505] font-mono text-[7.5px] sm:text-xs font-black text-[#050505] tracking-tight sm:tracking-normal whitespace-nowrap shadow-[2px_2px_0_#050505]'>
						{t(DIFF_MODE_BY_ID.horizontal.beforeBadge)}
					</span>
				</div>
			)}

			{/* Desktop Left Wing: Horizontal Drawbacks (BEFORE Layer only) */}
			{!isAfter && (
				<div className='hidden lg:flex flex-col gap-2 absolute left-5 top-1/2 -translate-y-1/2 w-[235px] z-10'>
					<span className='inline-block self-start px-2 py-0.5 rounded-sm bg-[#2D1B1E] border border-[#FD6141]/60 font-mono text-[8.5px] font-bold text-[#FCA5A5]'>
						{t({ en: '✕ SLIDE-STYLE VIDEO', id: '✕ VIDEO ALA SLIDE' })}
					</span>
					{horizontalBenefits.map((b, i) => (
						<div
							key={i}
							className='rounded-sm border border-dashed border-white/25 bg-[#171A21]/90 px-2.5 py-1.5 font-mono'
						>
							<p className='text-[9px] font-bold text-white/75 leading-tight'>{t(b.title)}</p>
							<p className='text-[7.5px] text-white/45 leading-snug mt-0.5'>{t(b.desc)}</p>
						</div>
					))}
				</div>
			)}

			{/* Desktop Right Wing: Full Horizontal Studio Benefits (AFTER Layer only) */}
			{isAfter && (
				<div className='hidden lg:flex flex-col gap-2 absolute right-5 top-1/2 -translate-y-1/2 w-[235px] z-10'>
					<span className='inline-block self-start px-2 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] font-mono text-[8.5px] font-black text-[#050505]'>
						{t({ en: '✓ 16:9 HORIZONTAL BENEFITS', id: '✓ KELEBIHAN VIDEO 16:9' })}
					</span>
					{horizontalBenefits.map((b, i) => (
						<div
							key={i}
							className='rounded-sm border-2 border-[#050505] bg-[#FCF0D3] px-2.5 py-1.5 shadow-[2px_2px_0_#050505] font-mono'
						>
							<p className='text-[9px] font-black text-[#050505] leading-tight'>{t(b.title)}</p>
							<p className='text-[7.5px] text-[#3B404C] font-bold leading-snug mt-0.5'>{t(b.desc)}</p>
						</div>
					))}
				</div>
			)}

			{/* CENTERPIECE: Real 16:9 Widescreen Video Player Frame Playing the Looping Short Film */}
			<div className='relative z-10 flex flex-col items-center gap-2 sm:gap-2.5 w-full pt-5 lg:pt-0'>
				<div
					className={`w-[244px] sm:w-[410px] lg:w-[485px] rounded-md border-[3px] border-[#050505] overflow-hidden ${
						isAfter
							? 'bg-[#090E16] shadow-[6px_6px_0_#050505]'
							: 'bg-[#171A21] shadow-[4px_4px_0_#050505]'
					}`}
				>
					{/* Top Miniature Widescreen Title Strip: Zero 'Looping' Label */}
					<div
						className={`h-5 px-2 border-b-2 border-[#050505] flex items-center justify-between font-mono text-[7.5px] sm:text-[8.5px] ${
							isAfter ? 'bg-[#FFD426] text-[#050505]' : 'bg-[#262B35] text-white/55'
						}`}
					>
						<span className='font-black truncate'>
							{isAfter
								? t({
										en: '▶ WHY WIDENING ROADS STAYS JAMMED · 16:9',
										id: '▶ JALAN DIPERLEBAR = TETAP MACET? (16:9)',
									})
								: '▶ BASIC_SLIDE_EXPORT.MP4'}
						</span>
						<span className='font-bold shrink-0'>{isAfter ? '60 FPS' : 'FLAT'}</span>
					</div>

					{/* 16:9 Video Viewport */}
					<div className='relative w-full aspect-video bg-[#0B0F17]'>
						<HorizontalVideoCanvas isAfter={isAfter} />
					</div>

					{/* Player Controls Footer: Authentic Video Timecode */}
					<div className='h-5 sm:h-6 px-2 border-t-2 border-[#050505] bg-[#0B0F17] flex items-center justify-between font-mono text-[7px] sm:text-[8px] text-white/75'>
						<div className='flex items-center gap-1.5'>
							<span className={isAfter ? 'text-[#5CE62E] font-black' : 'text-white/45'}>
								{isAfter ? '● HD STUDIO' : '● RAW SLIDE'}
							</span>
							<span className='text-white/40'>00:08</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='hidden sm:inline'>{isAfter ? 'VOICE + SFX' : 'RAW MIC'}</span>
							<span className={isAfter ? 'text-[#FFD426] font-bold' : ''}>1080p</span>
						</div>
					</div>
				</div>

				{/* Compact Benefits Row for Mobile & Tablet (< lg) directly inside stage */}
				<div className='grid grid-cols-2 gap-1.5 w-[244px] sm:w-[410px] lg:hidden'>
					{horizontalBenefits.map((b, i) => (
						<div
							key={i}
							className={`rounded-sm border px-1.5 py-1 font-mono ${
								isAfter
									? 'border-[#050505] bg-[#FCF0D3] text-[#050505] shadow-[2px_2px_0_#050505]'
									: 'border-white/20 bg-[#171A21]/90 text-white/65'
							}`}
						>
							<p className='text-[7.5px] sm:text-[8.5px] font-black leading-tight truncate'>{t(b.title)}</p>
							<p className='text-[6.5px] sm:text-[7.5px] opacity-80 leading-tight truncate mt-0.5'>
								{t(b.desc)}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function HorizontalDiffScene({ splitPercent }: { splitPercent: number }) {
	return (
		<>
			<div className='absolute inset-0 z-0 isolate overflow-hidden'>
				<HorizontalLayer isAfter />
			</div>
			<div
				className='absolute inset-0 z-10 will-change-[clip-path] overflow-hidden'
				style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
			>
				<HorizontalLayer isAfter={false} />
			</div>
		</>
	);
}

/* ============================================================================
   MODE 03: 9:16 VERTICAL REELS SMARTPHONE SHOWCASE + VERTICAL BENEFITS
   Centered 9:16 phone opening Instagram Reels playing an actual looping
   3-scene vertical explainer video inside IG Safe Zone, flanked left & right
   by Vertical Video Before/After benefits.
   ============================================================================ */
function ReelsVideoCanvas({ isAfter }: { isAfter: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { lang } = useLanguage();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let rafId = 0;
		let w = 200;
		let h = 355;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const tStart = performance.now();
		const isId = lang === 'id';

		const resize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = Math.max(120, rect.width);
			h = Math.max(200, rect.height);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};

		const drawFrame = (nowMs: number) => {
			const rawT = reduced ? 3.2 : (nowMs - tStart) / 1000;
			const clipDur = 8.0;
			const t = isAfter ? rawT : Math.floor(rawT * 3.5) / 3.5;
			const phaseT = t % clipDur;

			ctx.clearRect(0, 0, w, h);

			// Backdrop inside the 9:16 vertical reel video
			if (isAfter) {
				const grad = ctx.createLinearGradient(0, 0, 0, h);
				grad.addColorStop(0, '#0F2544');
				grad.addColorStop(0.55, '#193C6E');
				grad.addColorStop(1, '#091426');
				ctx.fillStyle = grad;
			} else {
				ctx.fillStyle = '#252932';
			}
			ctx.fillRect(0, 0, w, h);

			// Blueprint grid inside vertical frame
			ctx.strokeStyle = isAfter ? 'rgba(252,240,211,0.12)' : 'rgba(255,255,255,0.05)';
			ctx.lineWidth = 1;
			const step = 18;
			for (let x = 0; x < w; x += step) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, h);
				ctx.stroke();
			}
			for (let y = 0; y < h; y += step) {
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(w, y);
				ctx.stroke();
			}

			if (!isAfter) {
				// BEFORE: Slow confusing "Hey everyone..." template box pushed slightly too far down
				const stepY = (Math.floor(phaseT * 2) % 2) * 3;
				const cardW = w * 0.7;
				const cardH = h * 0.24;
				const cardX = w * 0.14;
				const cardY = h * 0.34 + stepY;

				ctx.fillStyle = '#1B1F27';
				ctx.fillRect(cardX, cardY, cardW, cardH);
				ctx.setLineDash([4, 3]);
				ctx.strokeStyle = 'rgba(255,255,255,0.28)';
				ctx.lineWidth = 1.2;
				ctx.strokeRect(cardX, cardY, cardW, cardH);
				ctx.setLineDash([]);

				ctx.fillStyle = 'rgba(255,255,255,0.52)';
				ctx.font = `700 ${w < 165 ? 7 : 8}px "JetBrains Mono", monospace`;
				ctx.textBaseline = 'top';
				ctx.fillText(isId ? 'Halo guys, kali ini...' : 'Hey everyone, today...', cardX + 8, cardY + 10);
				ctx.fillStyle = 'rgba(255,255,255,0.34)';
				ctx.font = `500 ${w < 165 ? 6.5 : 7.5}px "Libre Franklin", system-ui, sans-serif`;
				ctx.fillText(isId ? '3 trik harga menu kopi...' : '3 coffee pricing tricks...', cardX + 8, cardY + 26);
				ctx.fillStyle = 'rgba(255,255,255,0.24)';
				ctx.fillText(isId ? '(Intro terlalu pelan > 3s)' : '(Slow >3s plain text)', cardX + 8, cardY + 41);
			} else {
				// AFTER: TRUE FULL-BLEED 9:16 VERTICAL MOTION (ZERO floating card window! ZERO decorative sine wave!)
				// Story: Coffee Decoy Effect: S ($2) vs L ($4) -> Medium ($3.70 DECOY!) -> 7 in 10 pick Large!
				const scene = phaseT < 2.5 ? 0 : phaseT < 5.5 ? 1 : 2;
				const sStart = scene === 0 ? 0 : scene === 1 ? 2.5 : 5.5;
				const sDur = scene === 0 ? 2.5 : scene === 1 ? 3.0 : 2.5;
				const sProg = Math.min(1, Math.max(0, (phaseT - sStart) / sDur));
				const ease = 1 - Math.pow(1 - Math.min(1, sProg * 1.45), 3);

				// Scene-specific full-screen vertical backdrop switch for crisp 9:16 retention pacing!
				const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
				if (scene === 0) {
					bgGrad.addColorStop(0, '#13315C');
					bgGrad.addColorStop(1, '#081830');
				} else if (scene === 1) {
					bgGrad.addColorStop(0, '#1B1F3B');
					bgGrad.addColorStop(1, '#0B0E1D');
				} else {
					bgGrad.addColorStop(0, '#0C3B2E');
					bgGrad.addColorStop(1, '#061D17');
				}
				ctx.fillStyle = bgGrad;
				ctx.fillRect(0, 0, w, h);

				// Subtle architectural coordinate lines spanning full portrait viewport
				ctx.strokeStyle = 'rgba(252, 240, 211, 0.08)';
				ctx.lineWidth = 1;
				for (let gy = 28; gy < h; gy += 28) {
					ctx.beginPath();
					ctx.moveTo(0, gy);
					ctx.lineTo(w, gy);
					ctx.stroke();
				}

				// Safe horizontal workspace bounds leaving IG right engagement buttons 100% clear!
				const colLeft = 6;
				const colRight = w - (w < 175 ? 36 : 44);
				const safeW = colRight - colLeft;
				const safeCx = colLeft + safeW / 2;

				// Comic Coffee Cup drawing helper (full-bleed vector art sized generously for 9:16 portrait!)
				const drawCoffeeCup = (
					ux: number,
					bottomY: number,
					cupW: number,
					cupH: number,
					sizeBadge: string,
					priceText: string,
					bodyColor: string,
					highlight: boolean
				) => {
					const topY = bottomY - cupH;
					// Offset shadow
					ctx.fillStyle = '#050505';
					ctx.beginPath();
					ctx.moveTo(ux - cupW * 0.48 + 3, topY + 3);
					ctx.lineTo(ux + cupW * 0.48 + 3, topY + 3);
					ctx.lineTo(ux + cupW * 0.34 + 3, bottomY + 3);
					ctx.lineTo(ux - cupW * 0.34 + 3, bottomY + 3);
					ctx.closePath();
					ctx.fill();

					// Trapezoid Cup Body
					ctx.fillStyle = bodyColor;
					ctx.beginPath();
					ctx.moveTo(ux - cupW * 0.48, topY);
					ctx.lineTo(ux + cupW * 0.48, topY);
					ctx.lineTo(ux + cupW * 0.34, bottomY);
					ctx.lineTo(ux - cupW * 0.34, bottomY);
					ctx.closePath();
					ctx.fill();
					ctx.lineWidth = highlight ? 2.4 : 1.8;
					ctx.strokeStyle = '#050505';
					ctx.stroke();

					// Cup Lid
					ctx.fillStyle = '#FFFFFF';
					ctx.fillRect(ux - cupW * 0.54, topY - 5, cupW * 1.08, 6);
					ctx.strokeRect(ux - cupW * 0.54, topY - 5, cupW * 1.08, 6);

					// Cup Sleeve Label
					ctx.fillStyle = highlight ? '#FFD426' : '#FCF0D3';
					ctx.fillRect(ux - cupW * 0.36, topY + cupH * 0.3, cupW * 0.72, cupH * 0.36);
					ctx.strokeRect(ux - cupW * 0.36, topY + cupH * 0.3, cupW * 0.72, cupH * 0.36);

					ctx.fillStyle = '#050505';
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.font = `900 ${Math.max(8, Math.round(w * 0.055))}px "Onest", "Libre Franklin", system-ui, sans-serif`;
					ctx.fillText(sizeBadge, ux, topY + cupH * 0.48);

					// Bold Price Tag Pill below cup
					const tagW = Math.max(cupW * 1.05, 34);
					ctx.fillStyle = highlight ? '#5CE62E' : '#FFFFFF';
					ctx.fillRect(ux - tagW / 2, bottomY + 5, tagW, 13);
					ctx.strokeRect(ux - tagW / 2, bottomY + 5, tagW, 13);
					ctx.fillStyle = '#050505';
					ctx.font = `900 ${w < 165 ? 6.5 : 7.5}px "JetBrains Mono", monospace`;
					ctx.fillText(priceText, ux, bottomY + 11.5);
					ctx.textAlign = 'left';
				};

				// Upper Portrait Safe-Zone Kinetic Headline Strip (clean above artwork)
				const headlineY = h * 0.19;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';

				if (scene === 0) {
					// SCENE 1 (1.3s Visual Hook): S vs L Two-Cup Dilemma!
					ctx.fillStyle = '#FFD426';
					const hbW = safeW * 0.92;
					ctx.fillRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#050505';
					ctx.strokeRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.fillStyle = '#050505';
					ctx.font = `900 ${w < 165 ? 7.2 : 8.8}px "Onest", "Libre Franklin", system-ui, sans-serif`;
					ctx.fillText(isId ? 'PILIH UKURAN MANA?' : 'WHICH CUP TO BUY?', safeCx, headlineY - 1);

					const cupBase = h * 0.48;
					const bounce = ease * 7;
					drawCoffeeCup(safeCx - safeW * 0.24, cupBase - bounce * 0.4, safeW * 0.28, h * 0.13, 'S', isId ? '20rb' : '$2.0', '#5CE62E', true);
					drawCoffeeCup(safeCx + safeW * 0.24, cupBase, safeW * 0.34, h * 0.185, 'L', isId ? '40rb' : '$4.0', '#4D9DE0', false);

					ctx.textAlign = 'center';
					ctx.fillStyle = '#FCF0D3';
					ctx.font = `700 ${w < 165 ? 6.5 : 7.5}px "JetBrains Mono", monospace`;
					ctx.fillText(isId ? 'Mayoritas pilih Small ↑' : 'Most pick Small ↑', safeCx - safeW * 0.14, h * 0.59);
				} else if (scene === 1) {
					// SCENE 2 (The Twist): Sneaky MEDIUM Decoy Pop-In Makes LARGE Irresistible!
					ctx.fillStyle = '#FD6141';
					const hbW = safeW * 0.94;
					ctx.fillRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#050505';
					ctx.strokeRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.fillStyle = '#050505';
					ctx.font = `900 ${w < 165 ? 7.2 : 8.8}px "Onest", "Libre Franklin", system-ui, sans-serif`;
					ctx.fillText(isId ? 'MUNCUL OPSI MEDIUM!' : 'ENTER: DECOY CUP!', safeCx, headlineY - 1);

					const cupBase = h * 0.48;
					const colW = safeW * 0.32;
					drawCoffeeCup(safeCx - colW, cupBase, safeW * 0.23, h * 0.115, 'S', isId ? '20rb' : '$2.0', '#94A3B8', false);
					// Medium Decoy slides vertically into frame!
					drawCoffeeCup(
						safeCx,
						cupBase + (1 - ease) * 16,
						safeW * 0.27,
						h * 0.15,
						'M',
						isId ? '37rb' : '$3.7',
						'#FD6141',
						false
					);
					// Large Pops Up Bigger Highlighted!
					drawCoffeeCup(
						safeCx + colW,
						cupBase - ease * 5,
						safeW * 0.3,
						h * 0.19,
						'L',
						isId ? '40rb' : '$4.0',
						'#5CE62E',
						true
					);

					// Sweeping Decoy Steer Pill cleanly between price tags above and safe-zone caption below
					if (ease > 0.35) {
						const bannerW = safeW * 0.94;
						ctx.fillStyle = '#FFD426';
						ctx.fillRect(safeCx - bannerW / 2, h * 0.59, bannerW, 16);
						ctx.strokeRect(safeCx - bannerW / 2, h * 0.59, bannerW, 16);
						ctx.fillStyle = '#050505';
						ctx.textAlign = 'center';
						ctx.font = `900 ${w < 165 ? 6.2 : 7.4}px "JetBrains Mono", monospace`;
						ctx.fillText(isId ? '+3rb -> PILIH LARGE!' : '+$0.30 -> GET LARGE!', safeCx, h * 0.59 + 8);
					}
				} else {
					// SCENE 3 (Full-Portrait Visual Proof): 5×2 Mini Cup Grid Showing 7 out of 10 Choose LARGE!
					ctx.fillStyle = '#5CE62E';
					const hbW = safeW * 0.94;
					ctx.fillRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.lineWidth = 2;
					ctx.strokeStyle = '#050505';
					ctx.strokeRect(safeCx - hbW / 2, headlineY - 12, hbW, 22);
					ctx.fillStyle = '#050505';
					ctx.font = `900 ${w < 165 ? 7.2 : 8.8}px "Onest", "Libre Franklin", system-ui, sans-serif`;
					ctx.fillText(isId ? '7 DARI 10 PILIH LARGE!' : '7 IN 10 PICK LARGE!', safeCx, headlineY - 1);

					// 5 columns × 2 rows full-frame portrait icon grid
					const cols = 5;
					const cellW = safeW * 0.175;
					const cellH = h * 0.082;
					const gridLeft = safeCx - (cols * cellW) / 2 + 2.5;
					const litCount = Math.round(ease * 7);
					for (let row = 0; row < 2; row++) {
						for (let col = 0; col < cols; col++) {
							const idx = row * cols + col;
							const isLit = idx < litCount;
							const gx = gridLeft + col * cellW;
							const gy = h * 0.28 + row * (cellH + 8);
							ctx.fillStyle = isLit ? '#FFD426' : 'rgba(255,255,255,0.16)';
							ctx.fillRect(gx, gy, cellW - 5, cellH);
							ctx.strokeStyle = '#050505';
							ctx.lineWidth = 1.5;
							ctx.strokeRect(gx, gy, cellW - 5, cellH);
							ctx.fillStyle = isLit ? '#050505' : 'rgba(255,255,255,0.45)';
							ctx.font = `900 ${w < 165 ? 7 : 8}px "JetBrains Mono", monospace`;
							ctx.fillText(isLit ? 'L' : 'S', gx + (cellW - 5) / 2, gy + cellH / 2);
						}
					}

					// Giant 70% kinetic metric counter cleanly anchored in portrait center
					ctx.fillStyle = '#FCF0D3';
					ctx.font = `900 ${Math.round(w * 0.155)}px "Onest", "Libre Franklin", system-ui, sans-serif`;
					ctx.fillText(`${Math.round(ease * 70)}%`, safeCx, h * 0.56);
				}

				ctx.textAlign = 'left';

				// Real synchronized Reel Scrub Progress Bar along bottom edge
				ctx.fillStyle = 'rgba(255,255,255,0.22)';
				ctx.fillRect(0, h - 3, w, 3);
				ctx.fillStyle = '#FFD426';
				ctx.fillRect(0, h - 3, w * (phaseT / clipDur), 3);
			}

			if (!reduced) {
				rafId = window.requestAnimationFrame(drawFrame);
			}
		};

		resize();
		window.addEventListener('resize', resize);
		rafId = window.requestAnimationFrame(drawFrame);

		return () => {
			window.cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
		};
	}, [isAfter, lang]);

	return <canvas ref={canvasRef} className='absolute inset-0 w-full h-full pointer-events-none' />;
}

function ReelsStageLayer({ isAfter }: { isAfter: boolean }) {
	const { t } = useLanguage();

	const verticalPoints = isAfter
		? [
				{
					title: { en: '1.3s Scroll-Stop Hook', id: 'Hook 1,3 Detik Pertama' },
					desc: { en: 'Grabs attention before thumb swipes away', id: 'Langsung menghentikan scroll penonton' },
				},
				{
					title: { en: 'Custom 60fps Kinetic Art', id: 'Animasi Kustom 60fps' },
					desc: { en: 'No stiff templates or repetitive clips', id: 'Visual ekspresif, bukan template pasaran' },
				},
				{
					title: { en: '100% UI Safe-Zone Guarded', id: '100% Aman dari Tombol IG' },
					desc: { en: 'Subtitles & graphics never covered', id: 'Teks aman tak tertabrak Like & caption' },
				},
				{
					title: { en: 'Voice-First + SFX Rhythm', id: 'Narasi Bersih + Efek Suara' },
					desc: { en: 'Crisp SFX accents on every scene cut', id: 'Tiap perpindahan visual terasa hidup' },
				},
			]
		: [
				{
					title: { en: 'Slow 3s+ Boring Intro', id: 'Pembuka Lambat (> 3 Detik)' },
					desc: { en: 'Audience scrolls away too fast', id: 'Penonton sudah skip sebelum masuk inti' },
				},
				{
					title: { en: 'Flat Static Visuals', id: 'Visual Polos & Kaku' },
					desc: { en: 'Looks like every generic template', id: 'Sulit dibedakan dari konten biasa' },
				},
				{
					title: { en: 'Blocked by IG / TikTok UI', id: 'Tertutup Tombol Like/Caption' },
					desc: { en: 'Captions cut behind side/bottom icons', id: 'Teks penting terpotong ikon kanan' },
				},
				{
					title: { en: 'Flat Audio Without Punch', id: 'Audio Datar Tanpa Irama' },
					desc: { en: 'Lacks crisp transitions to keep focus', id: 'Kurang penekanan saat ganti topik' },
				},
			];

	return (
		<div
			className={`w-full h-full relative flex items-center justify-center overflow-hidden select-none ${
				isAfter ? 'bg-[#183862]' : 'bg-[#1F232B]'
			}`}
		>
			{/* Studio Backdrop Blueprint Grid */}
			<div
				className='pointer-events-none absolute inset-0 opacity-20'
				style={{
					backgroundImage: isAfter
						? 'linear-gradient(to right, rgba(252,240,211,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(252,240,211,0.35) 1px, transparent 1px)'
						: 'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
					backgroundSize: '26px 26px',
				}}
			/>

			{/* Corner Badge: strictly on BEFORE or AFTER side */}
			{isAfter ? (
				<div className='pointer-events-none absolute top-2 right-2 sm:top-3.5 sm:right-4 z-20 flex items-center gap-2'>
					<span className='hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-[#050505]/90 border border-[#FFD426] font-mono text-[9.5px] font-bold text-[#FFD426]'>
						9:16 REELS · TIKTOK · SHORTS
					</span>
					<span className='px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-[#5CE62E] border-2 border-[#050505] font-mono text-[7.5px] sm:text-xs font-black text-[#050505] tracking-tight sm:tracking-normal whitespace-nowrap shadow-[2px_2px_0_#050505]'>
						{t(DIFF_MODE_BY_ID.vertical.afterBadge)}
					</span>
				</div>
			) : (
				<div className='pointer-events-none absolute top-2 left-2 sm:top-3.5 sm:left-4 z-20 flex items-center gap-2'>
					<span className='px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-sm bg-[#FD6141] border-2 border-[#050505] font-mono text-[7.5px] sm:text-xs font-black text-[#050505] tracking-tight sm:tracking-normal whitespace-nowrap shadow-[2px_2px_0_#050505]'>
						{t(DIFF_MODE_BY_ID.vertical.beforeBadge)}
					</span>
				</div>
			)}

			{/* Desktop Left Wing: Vertical Pitfalls (BEFORE Layer only) */}
			{!isAfter && (
				<div className='hidden lg:flex flex-col gap-2 absolute left-5 xl:left-7 top-1/2 -translate-y-1/2 w-[215px] xl:w-[245px] z-10'>
					<span className='inline-block self-start px-2 py-0.5 rounded-sm bg-[#2D1B1E] border border-[#FD6141]/60 font-mono text-[8.5px] font-bold text-[#FCA5A5]'>
						{t({ en: '✕ BASIC REEL LIMITS', id: '✕ KEKURANGAN REEL POLOS' })}
					</span>
					{verticalPoints.map((pt, i) => (
						<div
							key={i}
							className='rounded-sm border border-dashed border-white/25 bg-[#171A21]/90 px-2.5 py-1.5 font-mono'
						>
							<p className='text-[8.5px] lg:text-[9px] font-bold text-white/75 leading-tight'>{t(pt.title)}</p>
							<p className='text-[7px] lg:text-[7.5px] text-white/45 leading-snug mt-0.5'>{t(pt.desc)}</p>
						</div>
					))}
				</div>
			)}

			{/* Desktop Right Wing: Vertical Reels Studio Benefits (AFTER Layer only) */}
			{isAfter && (
				<div className='hidden lg:flex flex-col gap-2 absolute right-5 xl:right-7 top-1/2 -translate-y-1/2 w-[215px] xl:w-[245px] z-10'>
					<span className='inline-block self-start px-2 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] font-mono text-[8.5px] font-black text-[#050505]'>
						{t({ en: '✓ 9:16 VERTICAL BENEFITS', id: '✓ KELEBIHAN VIDEO 9:16' })}
					</span>
					{verticalPoints.map((pt, i) => (
						<div
							key={i}
							className='rounded-sm border-2 border-[#050505] bg-[#FCF0D3] px-2.5 py-1.5 shadow-[2px_2px_0_#050505] font-mono'
						>
							<p className='text-[8.5px] lg:text-[9px] font-black text-[#050505] leading-tight'>{t(pt.title)}</p>
							<p className='text-[7px] lg:text-[7.5px] text-[#3B404C] font-bold leading-snug mt-0.5'>
								{t(pt.desc)}
							</p>
						</div>
					))}
				</div>
			)}

			{/* CENTERPIECE: Vertical 9:16 Smartphone Mockup Opening Instagram Reels */}
			<div className='relative z-10 flex items-center justify-center pt-7 sm:pt-0'>
				<div
					className={`relative w-[156px] h-[278px] sm:w-[198px] sm:h-[352px] lg:w-[222px] lg:h-[395px] rounded-[22px] sm:rounded-[26px] border-[3px] border-[#050505] p-[5px] sm:p-[6px] ${
						isAfter ? 'bg-[#0F1218] shadow-[6px_6px_0_#050505]' : 'bg-[#2B303A] shadow-[4px_4px_0_#050505]'
					}`}
				>
					{/* Inner 9:16 Screen */}
					<div className='relative w-full h-full rounded-[16px] sm:rounded-[19px] overflow-hidden bg-[#0B1220] border border-[#050505]'>
						{/* Live Looping 3-Scene Vertical Video Playing Inside Phone */}
						<ReelsVideoCanvas isAfter={isAfter} />

						{/* Top Phone Dynamic Island */}
						<div className='pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 z-20 w-12 sm:w-14 h-2.5 sm:h-3 rounded-full bg-[#050505]' />

						{/* Top Instagram Reels Chrome */}
						<div className='pointer-events-none relative z-10 px-2.5 pt-4 sm:pt-5 flex items-center justify-between text-white'>
							<span className='font-display font-black text-[10px] sm:text-xs tracking-tight drop-shadow'>
								Reels
							</span>
							<svg viewBox='0 0 24 24' className='size-3.5 sm:size-4 fill-none stroke-current' strokeWidth='2'>
								<path d='M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' />
								<circle cx='12' cy='13' r='4' />
							</svg>
						</div>

						{/* Kinetic Subtitle Comparison inside Phone: Safe Zone (AFTER) vs Blocked Behind IG UI (BEFORE) */}
						{isAfter ? (
							<div className='pointer-events-none absolute left-1.5 right-8 sm:left-2.5 sm:right-9 bottom-[72px] sm:bottom-[88px] z-10 flex flex-col items-start sm:items-center'>
								<div className='rounded-sm border-2 border-[#050505] bg-[#FFD426] px-1.5 py-0.5 sm:px-2.5 sm:py-1 shadow-[2px_2px_0_#050505] text-center'>
									<span className='font-display font-black text-[7px] sm:text-[10.5px] text-[#050505] leading-tight whitespace-nowrap block'>
										{t({ en: '1 trick steers 70% to L!', id: 'Trik ini dorong 70% ke L!' })}
									</span>
								</div>
							</div>
						) : (
							<div className='pointer-events-none absolute inset-x-2 bottom-[14px] sm:bottom-[18px] z-0 bg-[#050505]/75 px-1.5 py-0.5 font-mono text-[8px] sm:text-[9px] text-white/60 text-left'>
								[Text overlapping IG buttons...]
							</div>
						)}

						{/* Instagram Right Action Buttons Column (Like, Comment, Share, Menu, Audio Disc) */}
						<div
							className={`pointer-events-none absolute right-1.5 sm:right-2 bottom-3 sm:bottom-3.5 z-10 flex flex-col items-center gap-2 sm:gap-2.5 font-mono text-[7px] sm:text-[8px] font-bold ${
								isAfter ? 'text-white' : 'text-white/45'
							}`}
						>
							<div className='flex flex-col items-center'>
								<svg
									viewBox='0 0 24 24'
									className={`size-4 sm:size-[18px] ${
										isAfter ? 'fill-[#FD6141] stroke-[#050505] ds-heart-beat' : 'fill-none stroke-current'
									}`}
									strokeWidth='2'
								>
									<path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
								</svg>
								<span className='mt-0.5'>{isAfter ? '24.8K' : '12'}</span>
							</div>

							<div className='flex flex-col items-center'>
								<svg viewBox='0 0 24 24' className='size-3.5 sm:size-4 fill-none stroke-current' strokeWidth='2'>
									<path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
								</svg>
								<span className='mt-0.5'>{isAfter ? '418' : '0'}</span>
							</div>

							<div className='flex flex-col items-center'>
								<svg viewBox='0 0 24 24' className='size-3.5 sm:size-4 fill-none stroke-current' strokeWidth='2'>
									<line x1='22' y1='2' x2='11' y2='13' />
									<polygon points='22 2 15 22 11 13 2 9 22 2' />
								</svg>
								<span className='mt-0.5'>{isAfter ? '1.9K' : '0'}</span>
							</div>

							<span className='text-[10px] leading-none font-black'>⋮</span>

							<div
								className={`size-4 sm:size-5 rounded-full border-2 flex items-center justify-center ${
									isAfter
										? 'border-[#FFD426] bg-gradient-to-tr from-[#3886C0] to-[#5CE62E] ds-vinyl-spin'
										: 'border-white/30 bg-[#323741]'
								}`}
							>
								<span className='size-1.5 rounded-full bg-[#050505]' />
							</div>
						</div>

						{/* Instagram Bottom Left Creator Info Overlay */}
						<div className='pointer-events-none absolute left-2 sm:left-2.5 right-8 bottom-3 sm:bottom-3.5 z-10 space-y-1 text-white'>
							<div className='flex items-center gap-1.5'>
								<span
									className={`size-4 sm:size-5 rounded-full border border-[#050505] flex items-center justify-center font-display font-black text-[8px] text-[#050505] shrink-0 ${
										isAfter ? 'bg-[#FFD426]' : 'bg-[#64748B]'
									}`}
								>
									K
								</span>
								<span className='font-mono text-[8px] sm:text-[9px] font-black truncate drop-shadow'>
									@kris.motion
								</span>
								<span
									className={`px-1 py-0.5 rounded-[2px] text-[6.5px] font-mono font-bold border ${
										isAfter ? 'border-white/80 bg-white/15' : 'border-white/30 text-white/50'
									}`}
								>
									Follow
								</span>
							</div>

							<p className='font-sans text-[7.5px] sm:text-[8.5px] text-white/90 truncate'>
								{isAfter ? '9:16 Hook & Motion Craft' : 'raw export test.mp4'}
							</p>

							<div className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#050505]/70 border border-white/25 font-mono text-[6.5px] sm:text-[7.5px] text-white/90'>
								<span>♫</span>
								<span className='truncate'>{isAfter ? 'Voice + SFX Mix' : 'Raw mic noise'}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function ReelsMotionDiffScene({ splitPercent }: { splitPercent: number }) {
	return (
		<>
			<div className='absolute inset-0 z-0 isolate overflow-hidden'>
				<ReelsStageLayer isAfter />
			</div>
			<div
				className='absolute inset-0 z-10 will-change-[clip-path] overflow-hidden'
				style={{ clipPath: `inset(0 ${100 - splitPercent}% 0 0)` }}
			>
				<ReelsStageLayer isAfter={false} />
			</div>
		</>
	);
}

/* ============================================================================
   MAIN STUDIO COMPONENT
   ============================================================================ */
export default function VisualDiffStudio() {
	const { t } = useLanguage();
	const { playPreset } = useSound();
	const [modeId, setModeId] = useState<DiffModeId>('vertical');
	const [splitPercent, setSplitPercent] = useState<number>(50);

	const stageRef = useRef<HTMLDivElement | null>(null);
	const isDraggingRef = useRef(false);
	const touchIntentRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(null);
	const rectRef = useRef<DOMRect | null>(null);
	const rafRef = useRef<number | null>(null);
	const pendingXRef = useRef<number>(0);

	const activeMode = DIFF_MODES.find((m) => m.id === modeId) ?? DIFF_MODES[0];

	useEffect(() => {
		return () => {
			if (rafRef.current !== null) {
				window.cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, []);

	const updateSplit = (rect: DOMRect, clientX: number) => {
		if (rect.width <= 0) return;
		const pct = ((clientX - rect.left) / rect.width) * 100;
		const snapped = pct <= 1.2 ? 0 : pct >= 98.8 ? 100 : Math.min(100, Math.max(0, pct));
		setSplitPercent(snapped);
	};

	const beginActiveDrag = (captureEl: HTMLElement, pointerId: number, clientX: number) => {
		const stageEl = stageRef.current;
		if (!stageEl) return;
		isDraggingRef.current = true;
		touchIntentRef.current = null;
		const rect = stageEl.getBoundingClientRect();
		rectRef.current = rect;
		try {
			captureEl.setPointerCapture(pointerId);
		} catch {
			// Ignore capture failure on synthetic pointers
		}
		updateSplit(rect, clientX);
	};

	const startHandleDrag = (e: ReactPointerEvent<HTMLElement>) => {
		if (e.pointerType === 'mouse' && e.button !== 0) return;
		e.stopPropagation();
		beginActiveDrag(e.currentTarget, e.pointerId, e.clientX);
	};

	const startStagePointer = (e: ReactPointerEvent<HTMLElement>) => {
		if (e.pointerType === 'touch') {
			touchIntentRef.current = {
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
			};
			return;
		}
		if (e.button !== 0) return;
		e.stopPropagation();
		beginActiveDrag(e.currentTarget, e.pointerId, e.clientX);
	};

	const handlePointerMove = (e: ReactPointerEvent<HTMLElement>) => {
		const pendingTouch = touchIntentRef.current;
		if (!isDraggingRef.current && pendingTouch && e.pointerId === pendingTouch.pointerId) {
			const dx = e.clientX - pendingTouch.startX;
			const dy = e.clientY - pendingTouch.startY;
			const absX = Math.abs(dx);
			const absY = Math.abs(dy);
			if (absY >= 14 && absY > absX * 1.3) {
				touchIntentRef.current = null;
				return;
			}
			if (absX >= 8 && absX > absY * 1.15) {
				beginActiveDrag(stageRef.current ?? e.currentTarget, e.pointerId, e.clientX);
			}
			return;
		}

		if (!isDraggingRef.current || !rectRef.current) return;
		pendingXRef.current = e.clientX;
		if (rafRef.current !== null) return;
		rafRef.current = window.requestAnimationFrame(() => {
			rafRef.current = null;
			if (rectRef.current) {
				updateSplit(rectRef.current, pendingXRef.current);
			}
		});
	};

	const handlePointerUp = () => {
		isDraggingRef.current = false;
		touchIntentRef.current = null;
		rectRef.current = null;
	};

	const selectMode = (spec: DiffModeSpec) => {
		setModeId(spec.id);
		setSplitPercent(spec.defaultSplit);
	};

	const jumpToVideos = () => {
		playPreset('portal');
		const el = document.getElementById('videos');
		if (el) {
			const top = el.getBoundingClientRect().top + window.pageYOffset - 76;
			window.scrollTo({ top, behavior: 'smooth' });
		}
	};

	return (
		<div className='p-3.5 sm:p-5 lg:p-6 space-y-3 sm:space-y-3.5 bg-[#FCF0D3]'>
			{/* Purpose Header & Mode Switcher */}
			<div className='mx-0.5 sm:mx-1 space-y-2'>
				<div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5'>
					<p className='text-xs sm:text-[13px] font-bold text-[#050505] leading-snug max-w-2xl'>
						{t(activeMode.purpose)}
					</p>

					<div className='flex flex-wrap items-center gap-1.5 shrink-0'>
						{DIFF_MODES.map((m) => {
							const active = m.id === modeId;
							return (
								<button
									key={m.id}
									type='button'
									data-sfx='paper'
									aria-pressed={active}
									onClick={() => selectMode(m)}
									className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border-2 border-[#050505] font-mono text-[11px] font-black cursor-pointer transition-all shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none ${
										active
											? 'bg-[#3886C0] text-[#FFFFFF]'
											: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#FFD426]'
									}`}
								>
									<span
										className={`px-1 py-0.5 rounded-[2px] text-[9px] leading-none border border-[#050505] ${
											active ? 'bg-[#FFD426] text-[#050505]' : 'bg-[#FCF0D3] text-[#050505]'
										}`}
									>
										{m.tabNum}
									</span>
									<span>{t(m.tabLabel)}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Live Telemetry Strip */}
				<div className='flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-[#3B404C]'>
					<span>
						{t({
							en: 'DRAG YELLOW HANDLE OR USE PRESETS BELOW (0% – 100%)',
							id: 'GESER PEGANGAN KUNING ATAU KLIK PRESET DI BAWAH (0% – 100%)',
						})}
					</span>
					<span className='font-black text-[#050505] tabular-nums select-none'>
						{Math.round(splitPercent)}% {t({ en: 'BEFORE', id: 'SEBELUM' })} ·{' '}
						{Math.round(100 - splitPercent)}% {t({ en: 'AFTER', id: 'SESUDAH' })}
					</span>
				</div>
			</div>

			{/* Main Interactive Comparison Viewport (touch-pan-y lets vertical page scroll work smoothly on mobile) */}
			<div
				ref={stageRef}
				className='relative mx-2 sm:mx-3 h-[375px] sm:h-[430px] lg:h-[465px] touch-pan-y select-none cursor-ew-resize'
				onPointerDown={startStagePointer}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
			>
				<div className='relative w-full h-full rounded-sm border-[3px] border-[#050505] overflow-hidden bg-[#121212] shadow-[5px_5px_0_#050505]'>
					{modeId === 'vertical' && <ReelsMotionDiffScene splitPercent={splitPercent} />}
					{modeId === 'horizontal' && <HorizontalDiffScene splitPercent={splitPercent} />}
					{modeId === 'editing' && <PremiereDiffScene splitPercent={splitPercent} />}
				</div>

				{/* Synchronized Ink Divider Line & Corner-Safe Draggable Handle */}
				<div
					className='absolute inset-y-0 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center justify-center'
					style={{ left: `${splitPercent}%` }}
				>
					<div className='w-[3.5px] h-full bg-[#050505] shadow-[0_0_0_1px_rgba(255,212,38,0.65)]' />
					<div
						role='slider'
						aria-label={t({
							en: 'Drag visual comparison handle',
							id: 'Geser garis pemisah perbandingan visual',
						})}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-valuenow={Math.round(splitPercent)}
						tabIndex={0}
						onPointerDown={startHandleDrag}
						onPointerMove={handlePointerMove}
						onPointerUp={handlePointerUp}
						onPointerCancel={handlePointerUp}
						className='pointer-events-auto absolute top-1/2 -translate-y-1/2 size-12 flex items-center justify-center cursor-ew-resize touch-none group'
					>
						<span className='size-9 sm:size-10 rounded-full bg-[#FFD426] group-hover:scale-105 border-[3px] border-[#050505] shadow-[3px_3px_0_#050505] flex items-center justify-center font-mono text-xs sm:text-sm font-black text-[#050505] transition-transform'>
							⇄
						</span>
					</div>
				</div>
			</div>

			{/* Full Edge-to-Edge Precision Range Bar + Presets */}
			<div className='mx-0.5 sm:mx-1 space-y-2.5'>
				<input
					type='range'
					min={0}
					max={100}
					step={0.5}
					value={splitPercent}
					onChange={(e) => setSplitPercent(Number(e.target.value))}
					aria-label={t({
						en: 'Visual comparison split slider',
						id: 'Penggeser posisi perbandingan visual',
					})}
					className='w-full accent-[#FD6141] cursor-pointer'
				/>

				<div className='flex flex-wrap items-center justify-between gap-2'>
					<div className='flex flex-wrap items-center gap-1.5'>
						{[
							{ label: { en: 'See Before', id: 'Lihat Sebelum' }, value: 100 },
							{ label: { en: '50 / 50 Split', id: 'Belah 50 / 50' }, value: 50 },
							{ label: { en: 'See After', id: 'Lihat Sesudah' }, value: 0 },
						].map((preset) => {
							const isCurrent = Math.abs(splitPercent - preset.value) < 3;
							return (
								<button
									key={preset.value}
									type='button'
									data-sfx='switch'
									onClick={() => setSplitPercent(preset.value)}
									className={`px-2.5 py-1 rounded-sm border-2 border-[#050505] font-mono text-[10px] sm:text-[11px] font-black cursor-pointer transition-colors ${
										isCurrent
											? 'bg-[#FFD426] text-[#050505] shadow-[2px_2px_0_#050505]'
											: 'bg-[#FFFFFF] text-[#3B404C] hover:bg-[#FCF0D3]'
									}`}
								>
									{t(preset.label)}
								</button>
							);
						})}
					</div>

					<button
						type='button'
						data-sfx='custom'
						data-hover-sfx='portal'
						onClick={jumpToVideos}
						className='px-3 py-1 rounded-sm border-2 border-[#050505] bg-[#FFD426] hover:bg-[#5CE62E] font-mono text-[10px] sm:text-[11px] font-black text-[#050505] shadow-[2px_2px_0_#050505] cursor-pointer transition-colors'
					>
						{t({ en: 'Watch All 14 Final Cuts ↑', id: 'Tonton Semua 14 Karya ↑' })}
					</button>
				</div>

				{/* Unified Before / After Split Breakdown Panel */}
				<div className='rounded-md border-[2.5px] border-[#050505] bg-[#FFFFFF] shadow-[3px_3px_0_#050505] overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#050505]'>
					<div className='p-3.5 sm:p-4 space-y-1.5'>
						<div className='flex items-center justify-between gap-2'>
							<span className='font-mono text-[10px] font-black text-[#3B404C] uppercase tracking-wider'>
								{t({ en: '01 · TYPICAL PROBLEM', id: '01 · MASALAH UMUM' })}
							</span>
							<span className='px-1.5 py-0.5 rounded-[2px] bg-[#FD6141] border border-[#050505] font-mono text-[9.5px] font-black text-[#050505] leading-none'>
								✕ BEFORE
							</span>
						</div>
						<h4 className='font-display font-black text-sm text-[#050505] leading-snug'>
							{t(activeMode.beforePointTitle)}
						</h4>
						<p className='text-xs text-[#3B404C] leading-relaxed'>
							{t(activeMode.beforePointDesc)}
						</p>
					</div>

					<div className='p-3.5 sm:p-4 space-y-1.5'>
						<div className='flex items-center justify-between gap-2'>
							<span className='font-mono text-[10px] font-black text-[#3B404C] uppercase tracking-wider'>
								{t({ en: '02 · STUDIO FINISH', id: '02 · HASIL STUDIO' })}
							</span>
							<span className='px-1.5 py-0.5 rounded-[2px] bg-[#5CE62E] border border-[#050505] font-mono text-[9.5px] font-black text-[#050505] leading-none'>
								✓ AFTER
							</span>
						</div>
						<h4 className='font-display font-black text-sm text-[#050505] leading-snug'>
							{t(activeMode.afterPointTitle)}
						</h4>
						<p className='text-xs text-[#3B404C] leading-relaxed'>
							{t(activeMode.afterPointDesc)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

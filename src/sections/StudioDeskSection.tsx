import { useState } from 'react';
import { useLanguage } from '../context/useLanguage';
import type { LocalizedText } from '../data/portfolioData';

type VisitorGoalId = 'video' | 'website' | 'hire';

interface StrengthItem {
	id: string;
	tag: string;
	accent: string;
	title: LocalizedText;
	desc: LocalizedText;
}

interface GoalPoint {
	title: LocalizedText;
	desc: LocalizedText;
}

interface VisitorGoalConfig {
	id: VisitorGoalId;
	tabLabel: LocalizedText;
	badge: LocalizedText;
	headline: LocalizedText;
	points: [GoalPoint, GoalPoint, GoalPoint];
	primaryCta: { label: LocalizedText; href: string };
	secondaryCta: { label: LocalizedText; href: string };
}

const CORE_STRENGTHS: StrengthItem[] = [
	{
		id: 'film-foundation',
		tag: '01 · FILM & TV',
		accent: '#FD6141',
		title: {
			en: 'Television & Film Foundation',
			id: 'Dasar Ilmu Televisi & Film',
		},
		desc: {
			en: 'B.A. in Television & Film (Cum Laude, GPA 3.76). Trained in narrative pacing, visual framing, scripting, and clean audio mixing.',
			id: 'Lulusan S-1 Televisi & Film (Cum Laude, IPK 3,76). Terlatih menjaga struktur cerita, ritme editing, komposisi gambar, dan tata suara yang jernih.',
		},
	},
	{
		id: 'modern-workflow',
		tag: '02 · EDITING + CODE',
		accent: '#5CE62E',
		title: {
			en: 'Video Editing & Animated Code Motion',
			id: 'Editing Video & Animasi Berbasis Kode',
		},
		desc: {
			en: 'Combines timeline editing (Premiere Pro, After Effects, CapCut) with Video-as-Code animation (React & Canvas) for sharp, bespoke visuals.',
			id: 'Memadukan editing timeline (Premiere Pro, After Effects, CapCut) dengan pendekatan Video-as-Code (React & Canvas) untuk menghasilkan visual yang tajam dan presisi.',
		},
	},
	{
		id: 'video-plus-web',
		tag: '03 · VIDEO + WEB',
		accent: '#74B9FF',
		title: {
			en: 'Video & Website Under One Roof',
			id: 'Produksi Video Sekaligus Website',
		},
		desc: {
			en: 'Beyond vertical (9:16) and horizontal (16:9) video edits, I also design responsive landing pages, company profiles, portfolios, and microsites.',
			id: 'Selain memproduksi video vertikal (9:16) dan horizontal (16:9), saya juga merancang website landing page, company profile, portofolio, hingga microsite.',
		},
	},
];

const QUICK_FACTS: LocalizedText[] = [
	{ en: 'B.A. TV & Film', id: 'S-1 TV & Film' },
	{ en: '9:16 & 16:9 Video', id: 'Video 9:16 & 16:9' },
	{ en: 'React & Next.js Web', id: 'Web React & Next.js' },
	{ en: 'EN & ID Workflow', id: 'Konten EN & ID' },
];

const VISITOR_GOALS: VisitorGoalConfig[] = [
	{
		id: 'video',
		tabLabel: { en: 'Need a Video', id: 'Butuh Video' },
		badge: { en: 'REELS · PROMO · YOUTUBE', id: 'REELS · PROMO · YOUTUBE' },
		headline: {
			en: 'For brands, creators, & product promos',
			id: 'Untuk konten sosial media, promo produk, hingga dokumenter',
		},
		points: [
			{
				title: { en: 'Vertical 9:16 or Horizontal 16:9', id: 'Format Vertikal 9:16 atau Horizontal 16:9' },
				desc: {
					en: 'Built specifically for Reels, TikTok, Shorts, YouTube, website hero sections, or campaign decks.',
					id: 'Disesuaikan untuk Reels, TikTok, Shorts, YouTube, hero website, atau materi presentasi.',
				},
			},
			{
				title: { en: 'Free Visual Style & Voice Choice', id: 'Bebas Pilih Gaya Visual & Narator' },
				desc: {
					en: 'Pick a visual direction from the portfolio and specify your voiceover language and tone (EN/ID), or provide your own recording.',
					id: 'Bebas memilih gaya visual dari portofolio beserta karakter suara narator (ID/EN), atau menggunakan rekaman suaramu sendiri.',
				},
			},
			{
				title: { en: 'Scope Tailored to Your Brief', id: 'Hasil Akhir Mengikuti Brief Proyek' },
				desc: {
					en: 'Duration, revision rounds, thumbnails, and subtitle files are adjusted to match your exact video goals.',
					id: 'Durasi, tahap revisi, thumbnail, maupun file subtitle disesuaikan langsung dengan kebutuhan proyekmu.',
				},
			},
		],
		primaryCta: {
			label: { en: 'Watch 14 Videos ↓', id: 'Tonton 14 Karya ↓' },
			href: '#videos',
		},
		secondaryCta: {
			label: { en: 'See Video Services →', id: 'Lihat Jasa Video →' },
			href: '#services',
		},
	},
	{
		id: 'website',
		tabLabel: { en: 'Build a Website', id: 'Buat Website' },
		badge: { en: 'LANDING · PROFILE · CUSTOM', id: 'LANDING · PROFIL · KUSTOM' },
		headline: {
			en: 'Fast, responsive websites tailored to your brand',
			id: 'Website cepat, responsif, dan selaras dengan brand-mu',
		},
		points: [
			{
				title: { en: 'Clear Website Options', id: 'Pilihan Jenis Website yang Jelas' },
				desc: {
					en: 'Landing pages, company profiles, personal portfolios, interactive showcases, or custom concepts.',
					id: 'Tersedia landing page, company profile, website portofolio, showcase interaktif, maupun konsep kustom.',
				},
			},
			{
				title: { en: 'Responsive Layouts for Mobile & Desktop', id: 'Tampilan Rapi di HP & Desktop' },
				desc: {
					en: 'Structured layouts that load smoothly across phones and desktops without clunky generic bloat.',
					id: 'Struktur halaman jelas, ringan dibuka, dan nyaman diakses pengunjung melalui ponsel maupun laptop.',
				},
			},
			{
				title: { en: 'Optional Video Promo Add-On', id: 'Opsional: Tambah Video Promo' },
				desc: {
					en: 'Need a launch video or vertical ad clip embedded cleanly into your site? Both can be produced together.',
					id: 'Butuh video utama di halaman web atau video peluncuran produk? Keduanya dapat diproduksi sekaligus agar visualnya serasi.',
				},
			},
		],
		primaryCta: {
			label: { en: 'See Web Builds ↓', id: 'Lihat Karya Web ↓' },
			href: '#web-builds',
		},
		secondaryCta: {
			label: { en: 'See Website Services →', id: 'Lihat Jasa Website →' },
			href: '#services',
		},
	},
	{
		id: 'hire',
		tabLabel: { en: 'Hire / Team', id: 'Rekrut / Tim' },
		badge: { en: 'EDITOR · CREATIVE TECH', id: 'EDITOR · CREATIVE TECH' },
		headline: {
			en: 'Hiring for a studio, agency, or in-house creative team?',
			id: 'Sedang mencari Video Editor, Motion Creator, atau Creative Technologist?',
		},
		points: [
			{
				title: { en: 'Commercial & Broadcast Experience', id: 'Pengalaman Produksi Komersial & TV' },
				desc: {
					en: 'Interned as a Video Editor at AFE Records (music video post-production, TV rough cuts, podcasts, and Reels).',
					id: 'Pengalaman magang Video Editor di PT Afe Perkasa Abadi (AFE Records): menangani MV, rough cut program TV, podcast, dan Reels.',
				},
			},
			{
				title: { en: 'End-to-End Script to Final Cut', id: 'Terbiasa dari Naskah hingga Video Final' },
				desc: {
					en: 'On-set production credits (screenwriting, live broadcast video playback / VT operator) plus 100% accuracy data auditing at PT ISH.',
					id: 'Memiliki kredit penulisan naskah serta operator tayangan video siaran (VT playback), didukung disiplin akurasi data 100% di proyek PT ISH.',
				},
			},
			{
				title: { en: 'Added Frontend Web Capability', id: 'Nilai Tambah Membangun Halaman Web' },
				desc: {
					en: 'Great fit for creative teams seeking an editor who can also ship campaign microsites, interactive showcases, or web prototypes.',
					id: 'Nilai plus bagi tim kreatif yang membutuhkan editor video sekaligus mampu membangun landing page atau halaman web interaktif.',
				},
			},
		],
		primaryCta: {
			label: { en: 'Experience & CV ↓', id: 'Pengalaman & CV ↓' },
			href: '#experience',
		},
		secondaryCta: {
			label: { en: 'Contact Me →', id: 'Hubungi Langsung →' },
			href: '#contact',
		},
	},
];

interface StudioDeskSectionProps {
	onSelectServiceTrack?: (track: 'video' | 'website') => void;
}

const StudioDeskSection = ({ onSelectServiceTrack }: StudioDeskSectionProps = {}) => {
	const { t } = useLanguage();
	const [activeGoalId, setActiveGoalId] = useState<VisitorGoalId>('video');

	const activeGoal =
		VISITOR_GOALS.find((goal) => goal.id === activeGoalId) ?? VISITOR_GOALS[0];

	return (
		<section
			id='studio-desk'
			className='substrate-grid-paper relative overflow-x-clip border-b-[3.5px] border-[#050505] py-14 sm:py-20 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-stretch'>
					{/* LEFT PANEL: Clean De-Boxed Core Profile Pillars */}
					<div className='lg:col-span-6 ds-panel rounded-md overflow-hidden bg-[#FCF0D3] flex flex-col justify-between'>
						<div>
							<div className='flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#EFE5CA] border-b-[2.5px] border-[#050505]'>
								<div className='flex items-center gap-2 min-w-0'>
									<span className='size-2.5 rounded-full bg-[#FD6141] border border-[#050505] shrink-0' />
									<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
										{t({ en: 'CORE PROFILE · WHO I AM', id: 'RINGKASAN PROFIL · KEAHLIAN INTI' })}
									</span>
								</div>
								<span className='px-2 py-0.5 rounded-[2px] bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] shrink-0 select-none'>
									{t({ en: '3 PILLARS', id: '3 PILAR' })}
								</span>
							</div>

							<div className='px-5 sm:px-6 divide-y divide-dashed divide-[#050505]/20'>
								{CORE_STRENGTHS.map((item) => (
									<div key={item.id} className='py-4 sm:py-5'>
										<div className='flex items-center gap-2 mb-1'>
											<span
												className='size-2 rounded-full border border-[#050505] shrink-0'
												style={{ backgroundColor: item.accent }}
												aria-hidden='true'
											/>
											<span className='font-mono text-[10px] font-black tracking-wider text-[#3B404C] uppercase select-none'>
												{item.tag}
											</span>
										</div>
										<h3 className='font-display font-black text-base sm:text-lg text-[#050505] leading-snug'>
											{t(item.title)}
										</h3>
										<p className='text-[13px] sm:text-sm text-[#3B404C] leading-relaxed mt-1'>
											{t(item.desc)}
										</p>
									</div>
								))}
							</div>
						</div>

						{/* Concise Borderless Summary Strip */}
						<div className='px-5 sm:px-6 py-3.5 bg-[#EFE5CA]/65 border-t-2 border-[#050505]/20 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] font-bold text-[#050505] select-none'>
							{QUICK_FACTS.map((fact, idx) => (
								<span key={fact.en} className='inline-flex items-center gap-2'>
									{idx > 0 && (
										<span className='text-[#050505]/30' aria-hidden='true'>·</span>
									)}
									<span>{t(fact)}</span>
								</span>
							))}
						</div>
					</div>

					{/* RIGHT PANEL: Practical Visitor Goal Router (Clean Single Surface) */}
					<div className='lg:col-span-6 ds-panel rounded-md overflow-hidden bg-[#FFFFFF] flex flex-col justify-between'>
						<div>
							<div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 bg-[#EFE5CA] border-b-[2.5px] border-[#050505]'>
								<div className='flex items-center gap-2 min-w-0'>
									<span className='size-2.5 rounded-full bg-[#4D9DE0] border border-[#050505] shrink-0' />
									<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
										{t({ en: 'HOW CAN WE COLLABORATE?', id: 'PANDUAN KOLABORASI' })}
									</span>
								</div>
								<span className='font-mono text-[10px] font-bold text-[#3B404C] shrink-0'>
									{t({ en: 'QUICK GUIDE', id: 'PANDUAN SINGKAT' })}
								</span>
							</div>

							{/* Unified Clean 3-Tab Switcher */}
							<div
								role='tablist'
								aria-label={t({ en: 'Visitor goal guide', id: 'Panduan kebutuhan pengunjung' })}
								className='grid grid-cols-3 gap-1.5 p-2 bg-[#F6EDD6] border-b-2 border-[#050505]/20'
							>
								{VISITOR_GOALS.map((goal) => {
									const isActive = goal.id === activeGoal.id;
									return (
										<button
											key={goal.id}
											type='button'
											role='tab'
											data-sfx='paper'
											aria-selected={isActive}
											aria-pressed={isActive}
											onClick={() => setActiveGoalId(goal.id)}
											className={`px-2 py-2 rounded font-mono text-[10px] sm:text-[11px] font-black uppercase transition-all cursor-pointer ${
												isActive
													? 'bg-[#050505] text-[#FFD426] shadow-[2px_2px_0_#FD6141]'
													: 'bg-transparent text-[#3B404C] hover:bg-[#FFFFFF] hover:text-[#050505]'
											}`}
										>
											{t(goal.tabLabel)}
										</button>
									);
								})}
							</div>

							{/* Clean Typographic Guide Body */}
							<div className='p-5 sm:p-6 space-y-4'>
								<div>
									<p className='font-mono text-[10px] font-black tracking-wider text-[#C5432F] uppercase select-none'>
										{t(activeGoal.badge)}
									</p>
									<h3 className='font-display font-black text-lg sm:text-xl text-[#050505] leading-snug mt-1'>
										{t(activeGoal.headline)}
									</h3>
								</div>

								<ul className='divide-y divide-dashed divide-[#050505]/15'>
									{activeGoal.points.map((point, idx) => (
										<li key={point.title.en} className='py-3 first:pt-0 last:pb-0 flex items-start gap-3'>
											<span className='font-mono text-xs font-black text-[#3886C0] pt-0.5 shrink-0 select-none'>
												0{idx + 1}
											</span>
											<div className='min-w-0'>
												<p className='font-display font-black text-sm text-[#050505] leading-snug'>
													{t(point.title)}
												</p>
												<p className='text-[13px] text-[#3B404C] leading-relaxed mt-0.5'>
													{t(point.desc)}
												</p>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Contextual Jump Actions */}
						<div className='px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-dashed border-[#050505]/15 flex flex-wrap items-center gap-3'>
							<a
								href={activeGoal.primaryCta.href}
								data-sfx='keycap'
								className='px-5 py-2.5 rounded-lg bg-[#FD6141] border-[2.5px] border-[#050505] text-[#050505] font-display font-black text-sm shadow-[3px_3px_0_#050505] hover:bg-[#FFD426] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
							>
								{t(activeGoal.primaryCta.label)}
							</a>
							<a
								href={activeGoal.secondaryCta.href}
								data-sfx='paper'
								onClick={() => {
									if (activeGoal.secondaryCta.href === '#services') {
										onSelectServiceTrack?.(activeGoal.id === 'website' ? 'website' : 'video');
									}
								}}
								className='px-4 py-2.5 rounded-lg bg-[#FCF0D3] border-2 border-[#050505]/80 text-[#050505] font-display font-bold text-sm hover:bg-[#FFFFFF] hover:-translate-y-0.5 active:translate-y-[1px] transition-all'
							>
								{t(activeGoal.secondaryCta.label)}
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default StudioDeskSection;

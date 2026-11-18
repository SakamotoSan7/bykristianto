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
			id: 'Lulusan S-1 Televisi & Film (Cum Laude, IPK 3,76). Terbiasa menjaga alur cerita, ritme editing, komposisi gambar, dan tata suara jernih.',
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
			en: 'Combines hands-on editing (Premiere Pro, After Effects, CapCut) with Video-as-Code motion (React & Canvas) for tailored, sharp visuals.',
			id: 'Menggabungkan editing konvensional (Premiere Pro, After Effects, CapCut) bersama pendekatan Video-as-Code (React & Canvas) agar visual tajam dan fleksibel.',
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
			en: 'Beyond vertical (9:16) and horizontal (16:9) video edits, I also build responsive landing pages, company profiles, portfolios, and microsites.',
			id: 'Selain menggarap video vertikal (9:16) dan horizontal (16:9), saya juga membangun website landing page, company profile, portofolio, hingga microsite.',
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
				title: { en: 'Free Visual Style & Voice Choice', id: 'Bebas Pilih Style Visual & Voiceover' },
				desc: {
					en: 'Pick a visual direction from the portfolio or request your own voiceover language and tone (EN/ID).',
					id: 'Bebas pilih gaya visual dari portofolio serta tipe suara/bahasa narasi (ID/EN), atau pakai rekaman suara sendiri.',
				},
			},
			{
				title: { en: 'Scope Agreed Around Your Brief', id: 'Hasil Akhir Mengikuti Brief Proyek' },
				desc: {
					en: 'Duration, revision stages, thumbnails, or subtitle files depend on what your specific video needs.',
					id: 'Durasi, tahap revisi, thumbnail, atau subtitle disesuaikan dengan kebutuhan nyata proyekmu.',
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
		tabLabel: { en: 'Build a Website', id: 'Bikin Website' },
		badge: { en: 'LANDING · PROFILE · CUSTOM', id: 'LANDING · PROFILE · CUSTOM' },
		headline: {
			en: 'Fast, responsive websites tailored to your brand',
			id: 'Website cepat, rapi di HP, dan disesuaikan dengan brand-mu',
		},
		points: [
			{
				title: { en: 'Clear General Website Types', id: 'Pilihan Jenis Website yang Jelas' },
				desc: {
					en: 'Landing pages, company profiles, personal portfolios, interactive showcases, or custom ideas.',
					id: 'Tersedia landing page, company profile, website portofolio, showcase interaktif, atau konsep custom.',
				},
			},
			{
				title: { en: 'Custom Visuals & Mobile Friendly', id: 'Tampilan Rapi di HP & Desktop' },
				desc: {
					en: 'Structured layouts that load smoothly on phones and desktops without clunky generic bloat.',
					id: 'Struktur halaman jelas, ringan dibuka, dan nyaman dipakai pengunjung lewat HP maupun laptop.',
				},
			},
			{
				title: { en: 'Optional Video Promo Add-On', id: 'Bisa Tambah Add-On Video Promo' },
				desc: {
					en: 'Need a launch video or vertical ad clip embedded seamlessly into your site? We can build both together.',
					id: 'Butuh video utama di halaman web atau klip iklan peluncuran? Bisa sekalian digarap agar visualnya selaras.',
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
			id: 'Mencari Video Editor, Motion Creator, atau Creative Technologist?',
		},
		points: [
			{
				title: { en: 'Commercial & Broadcast Experience', id: 'Pengalaman Produksi Komersial & TV' },
				desc: {
					en: 'Interned as a Video Editor at AFE Records (music video post-production, TV rough cuts, podcasts, and Reels).',
					id: 'Magang Video Editor di PT Afe Perkasa Abadi (AFE Records): menangani MV, rough cut acara TV, podcast, dan Reels.',
				},
			},
			{
				title: { en: 'End-to-End Script to Final Video', id: 'Terbiasa dari Naskah hingga Video Final' },
				desc: {
					en: 'On-set production credits (scriptwriting, live broadcast video playback / VT operator) plus 100% accuracy data auditing at PT ISH.',
					id: 'Kredit penulisan naskah & operator tayangan video siaran (VT playback), ditambah disiplin akurasi data di proyek PT ISH.',
				},
			},
			{
				title: { en: 'Added Frontend Web Capability', id: 'Nilai Tambah Membangun Halaman Web' },
				desc: {
					en: 'Useful for teams wanting an editor who can also ship campaign microsites, interactive showcases, or web prototypes.',
					id: 'Membantu tim kreatif yang membutuhkan editor sekaligus mampu membangun landing page atau aset web interaktif.',
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

const StudioDeskSection = () => {
	const { t } = useLanguage();
	const [activeGoalId, setActiveGoalId] = useState<VisitorGoalId>('video');

	const activeGoal =
		VISITOR_GOALS.find((goal) => goal.id === activeGoalId) ?? VISITOR_GOALS[0];

	return (
		<section
			id='studio-desk'
			className='substrate-grid-paper relative overflow-x-clip border-b-[3.5px] border-[#050505] py-12 sm:py-16 scroll-mt-20'
		>
			<div className='max-w-7xl mx-auto px-5 md:px-10'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start'>
					{/* LEFT OS WINDOW: Accurate Hybrid Strengths */}
					<div className='lg:col-span-6 ds-os-window rounded-sm overflow-hidden bg-[#2C5F8B]'>
						<div className='flex items-center justify-between px-4 py-2.5 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0'>
								<span className='size-3 rounded-full bg-[#FD6141] border-2 border-[#050505] shrink-0' />
								<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
									{t({ en: 'CORE PROFILE · WHO I AM', id: 'RINGKASAN PROFIL · KEAHLIAN INTI' })}
								</span>
							</div>
							<span className='px-2 py-0.5 rounded-none bg-[#050505] font-mono text-[10px] font-black text-[#FFD426] shrink-0 select-none'>
								{t({ en: '3 PILLARS', id: '3 PILAR' })}
							</span>
						</div>

						<div className='p-4 sm:p-6 space-y-3.5'>
							{CORE_STRENGTHS.map((item) => (
								<div
									key={item.id}
									className='rounded-sm border-2 border-[#050505]/80 bg-[#FCF0D3] p-4'
								>
									<div className='flex flex-wrap items-center justify-between gap-2 mb-1.5'>
										<span
											className='px-2 py-0.5 rounded-sm border border-[#050505]/60 font-mono text-[10px] font-black text-[#050505] select-none'
											style={{ backgroundColor: item.accent }}
										>
											{item.tag}
										</span>
									</div>
									<h3 className='font-display font-black text-base sm:text-lg text-[#050505] leading-snug'>
										{t(item.title)}
									</h3>
									<p className='text-xs sm:text-[13px] text-[#3B404C] leading-relaxed mt-1'>
										{t(item.desc)}
									</p>
								</div>
							))}

							{/* Concise Verified Quick Tags */}
							<div className='pt-1 flex flex-wrap gap-1.5'>
								{QUICK_FACTS.map((fact) => (
									<span
										key={fact.en}
										className='px-2 py-0.5 rounded-sm bg-[#16344E]/90 border border-[#FCF0D3]/25 font-mono text-[10px] font-bold text-[#FCF0D3] select-none'
									>
										{t(fact)}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* RIGHT OS WINDOW: Practical Visitor Goal Router (Zero Height Bounce) */}
					<div className='lg:col-span-6 ds-os-window rounded-sm overflow-hidden bg-[#DAE5ED]'>
						<div className='flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0'>
								<span className='size-3 rounded-full bg-[#FFD426] border-2 border-[#050505] shrink-0' />
								<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
									{t({ en: 'HOW CAN WE COLLABORATE?', id: 'MAU CARI APA DI SINI?' })}
								</span>
							</div>

							<div className='flex items-center gap-1.5 flex-wrap'>
								{VISITOR_GOALS.map((goal) => {
									const isActive = goal.id === activeGoal.id;
									return (
										<button
											key={goal.id}
											type='button'
											data-sfx='paper'
											aria-pressed={isActive}
											onClick={() => setActiveGoalId(goal.id)}
											className={`px-2.5 py-1 rounded-sm border-2 border-[#050505] font-mono text-[10px] font-black uppercase shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
												isActive
													? 'bg-[#5CE62E] text-[#050505]'
													: 'bg-[#FFFFFF] text-[#050505] hover:bg-[#FFD426]'
											}`}
										>
											{t(goal.tabLabel)}
										</button>
									);
								})}
							</div>
						</div>

						<div className='p-4 sm:p-6 space-y-4'>
							{/* White Paper Content Tray with Stable Layout */}
							<div className='rounded-sm border-[3px] border-[#050505] bg-[#FFFFFF] p-4 sm:p-5 flex flex-col justify-between min-h-[348px]'>
								<div>
									<div className='flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-dashed border-[#050505]/20'>
										<span className='px-2 py-0.5 rounded-sm bg-[#27649B]/12 border border-dashed border-[#27649B]/55 font-mono text-[10px] font-black text-[#204275] select-none'>
											{t(activeGoal.badge)}
										</span>
										<span className='font-mono text-[10px] font-bold text-[#3B404C]'>
											{t({ en: 'QUICK GUIDE', id: 'PANDUAN SINGKAT' })}
										</span>
									</div>

									<h3 className='font-display font-black text-lg sm:text-xl text-[#050505] leading-snug mt-3'>
										{t(activeGoal.headline)}
									</h3>

									<div className='mt-3.5 space-y-2.5'>
										{activeGoal.points.map((point) => (
											<div
												key={point.title.en}
												className='rounded-sm border border-[#050505]/45 bg-[#FCF0D3]/85 px-3.5 py-2.5'
											>
												<p className='font-display font-black text-[13px] text-[#050505] leading-snug'>
													{t(point.title)}
												</p>
												<p className='text-[12px] text-[#3B404C] leading-snug mt-0.5'>
													{t(point.desc)}
												</p>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Contextual Jump Actions */}
							<div className='flex flex-wrap items-center gap-3'>
								<a
									href={activeGoal.primaryCta.href}
									data-sfx='keycap'
									className='px-5 py-2.5 rounded-xl bg-[#FD6141] border-[3px] border-[#050505] text-[#050505] font-display font-black text-sm shadow-[4px_4px_0_#050505] hover:bg-[#FFD426] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
								>
									{t(activeGoal.primaryCta.label)}
								</a>
								<a
									href={activeGoal.secondaryCta.href}
									data-sfx='paper'
									className='px-5 py-2.5 rounded-xl bg-[#FFFFFF] border-[3px] border-[#050505] text-[#050505] font-display font-black text-sm shadow-[4px_4px_0_#050505] hover:bg-[#FCF0D3] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-none transition-all'
								>
									{t(activeGoal.secondaryCta.label)}
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default StudioDeskSection;

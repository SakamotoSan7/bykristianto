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
			en: 'Cum Laude B.A. in Television & Film (GPA 3.76), trained in narrative pacing, visual framing, scripting, and clean mixing.',
			id: 'Lulusan S-1 Televisi & Film (Cum Laude, IPK 3,76) yang terlatih dalam ritme cerita, komposisi gambar, naskah, dan tata suara.',
		},
	},
	{
		id: 'modern-workflow',
		tag: '02 · EDITING + CODE',
		accent: '#5CE62E',
		title: {
			en: 'Editing & Code-Driven Motion',
			id: 'Editing & Motion Berbasis Kode',
		},
		desc: {
			en: 'Pairs Premiere Pro, After Effects, and CapCut editing with React & Canvas animation for crisp, non-template visuals.',
			id: 'Memadukan editing Premiere Pro, After Effects, dan CapCut dengan animasi React & Canvas yang tajam dan presisi.',
		},
	},
	{
		id: 'video-plus-web',
		tag: '03 · VIDEO + WEB',
		accent: '#74B9FF',
		title: {
			en: 'Video & Web Under One Roof',
			id: 'Video & Web dalam Satu Atap',
		},
		desc: {
			en: 'Alongside 9:16 Reels and 16:9 explainers, I build responsive landing pages, company profiles, and custom web showcases.',
			id: 'Selain video 9:16 dan 16:9, saya juga merancang landing page, company profile, serta website portofolio responsif.',
		},
	},
];

const VISITOR_GOALS: VisitorGoalConfig[] = [
	{
		id: 'video',
		tabLabel: { en: 'Need a Video', id: 'Butuh Video' },
		badge: { en: 'REELS · PROMO · YOUTUBE', id: 'REELS · PROMO · YOUTUBE' },
		headline: {
			en: 'For social media, promos, & video explainers',
			id: 'Untuk media sosial, promo produk, & explainer',
		},
		points: [
			{
				title: { en: '9:16 Vertical or 16:9 Widescreen', id: 'Format Vertikal 9:16 atau 16:9' },
				desc: {
					en: 'Tailored for Reels, TikTok, Shorts, YouTube, or website hero sections.',
					id: 'Disesuaikan untuk Reels, TikTok, Shorts, YouTube, atau hero website.',
				},
			},
			{
				title: { en: 'Flexible Visual Style & Voice', id: 'Bebas Pilih Gaya & Suara' },
				desc: {
					en: 'Choose any style above plus EN/ID voiceover—or send your own audio.',
					id: 'Pilih gaya dari portofolio di atas dan narator ID/EN—atau pakai rekamanmu sendiri.',
				},
			},
			{
				title: { en: 'Scoped Around Your Brief', id: 'Menyesuaikan Brief Proyek' },
				desc: {
					en: 'Duration, revisions, thumbnails, and subtitles match your exact goal.',
					id: 'Durasi, revisi, thumbnail, dan subtitle disesuaikan langsung dengan target proyek.',
				},
			},
		],
		primaryCta: {
			label: { en: 'See Video Services ↓', id: 'Lihat Jasa Video ↓' },
			href: '#services',
		},
		secondaryCta: {
			label: { en: 'Send a Brief →', id: 'Kirim Brief →' },
			href: '#contact',
		},
	},
	{
		id: 'website',
		tabLabel: { en: 'Build a Website', id: 'Buat Website' },
		badge: { en: 'LANDING · PROFILE · CUSTOM', id: 'LANDING · PROFIL · KUSTOM' },
		headline: {
			en: 'Fast, responsive sites built around your brand',
			id: 'Website cepat dan responsif sesuai karakter brand',
		},
		points: [
			{
				title: { en: 'Landing Page, Profile & Custom Sites', id: 'Landing Page, Profil & Kustom' },
				desc: {
					en: 'Company profiles, portfolios, product pages, and interactive showcases.',
					id: 'Tersedia landing page, company profile, portofolio, hingga microsite interaktif.',
				},
			},
			{
				title: { en: 'Clean on Mobile & Desktop', id: 'Rapi di HP & Laptop' },
				desc: {
					en: 'Fast-loading layouts designed cleanly without generic template bloat.',
					id: 'Tata letak ringan, jelas dibaca, dan responsif di berbagai ukuran layar.',
				},
			},
			{
				title: { en: 'Optional Promo Video Add-On', id: 'Opsional: Tambah Video Promo' },
				desc: {
					en: 'Bundle a matching promo clip right inside your website launch.',
					id: 'Dapat dipadukan dengan video promo yang serasi langsung untuk websitemu.',
				},
			},
		],
		primaryCta: {
			label: { en: 'See Website Services ↓', id: 'Lihat Jasa Website ↓' },
			href: '#services',
		},
		secondaryCta: {
			label: { en: 'See Web Builds ↓', id: 'Lihat Karya Web ↓' },
			href: '#web-builds',
		},
	},
	{
		id: 'hire',
		tabLabel: { en: 'Hire / Team', id: 'Rekrut / Tim' },
		badge: { en: 'EDITOR · CREATIVE TECH', id: 'EDITOR · CREATIVE TECH' },
		headline: {
			en: 'Hiring a Video Editor or Creative Technologist?',
			id: 'Mencari Video Editor atau Creative Technologist?',
		},
		points: [
			{
				title: { en: 'Music Video, TV & Podcast Editing', id: 'Editing MV, TV & Podcast' },
				desc: {
					en: 'Experience across music videos, TV rough cuts, multi-cam podcasts, and Reels.',
					id: 'Pengalaman di video musik, rough cut program TV, podcast multi-kamera, dan Reels.',
				},
			},
			{
				title: { en: 'Script to Final Cut & Live Broadcast', id: 'Dari Naskah hingga Siaran Final' },
				desc: {
					en: 'Screenwriting, VT playback operation, plus data validation at PT ISH (Telkom Indonesia).',
					id: 'Kredit penulisan skenario, operator VT siaran, dan validasi data di PT ISH (Telkom Indonesia).',
				},
			},
			{
				title: { en: 'Bonus Frontend Web Skills', id: 'Nilai Tambah Membangun Web' },
				desc: {
					en: 'Ready for teams needing an editor who can also ship campaign pages or prototypes.',
					id: 'Cocok untuk tim kreatif yang butuh editor sekaligus mampu membangun halaman web interaktif.',
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
					{/* LEFT OS WINDOW: Digital Spaghetti Canary Chrome */}
					<div className='lg:col-span-6 ds-os-window rounded-md overflow-hidden bg-[#FCF0D3] flex flex-col justify-center'>
						<div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 bg-[#FFD426] border-b-[3px] border-[#050505]'>
							<div className='flex items-center gap-2 min-w-0 flex-1'>
								<span className='size-3 rounded-full bg-[#FD6141] border-2 border-[#050505] shrink-0' />
								<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
									{t({ en: 'CORE PROFILE', id: 'PROFIL INTI' })}
								</span>
								<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
							</div>
						</div>

						<div className='px-5 sm:px-6 divide-y divide-dashed divide-[#050505]/20 flex-1 flex flex-col justify-center'>
							{CORE_STRENGTHS.map((item) => (
								<div key={item.id} className='py-4 sm:py-5'>
									<div className='flex items-center gap-2 mb-1'>
										<span
											className='size-2.5 rounded-full border border-[#050505] shrink-0'
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

					{/* RIGHT OS WINDOW: Cerulean Retro Chrome + Practical Visitor Goal Router */}
					<div className='lg:col-span-6 ds-os-window rounded-md overflow-hidden bg-[#FFFFFF] flex flex-col justify-between'>
						<div>
							<div className='flex items-center justify-between gap-2 px-4 sm:px-5 py-2.5 bg-[#4D9DE0] border-b-[3px] border-[#050505]'>
								<div className='flex items-center gap-2 min-w-0 flex-1'>
									<span className='size-3 rounded-full bg-[#FFD426] border-2 border-[#050505] shrink-0' />
									<span className='font-mono text-[11px] font-black uppercase tracking-wider text-[#050505] truncate'>
										{t({ en: 'HOW WE CAN WORK', id: 'CARA KOLABORASI' })}
									</span>
									<div className='hidden sm:block flex-1 h-2.5 ds-titlebar-grips' aria-hidden='true' />
								</div>
							</div>

							{/* Unified Clean 3-Tab Switcher with Tactile Active Pop */}
							<div
								role='tablist'
								aria-label={t({ en: 'Visitor goal guide', id: 'Panduan kebutuhan pengunjung' })}
								className='grid grid-cols-3 gap-2 p-2.5 bg-[#F6EDD6] border-b-2 border-[#050505]'
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
													? 'bg-[#050505] text-[#FFD426] shadow-[3px_3px_0_#FD6141]'
													: 'bg-[#FFFFFF]/80 border border-[#050505]/35 text-[#050505] hover:bg-[#FFD426]/40'
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

						{/* Contextual Tactile Jump Actions */}
						<div className='px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-dashed border-[#050505]/15 flex flex-wrap items-center gap-3'>
							<a
								href={activeGoal.primaryCta.href}
								data-sfx='keycap'
								onClick={() => {
									if (activeGoal.primaryCta.href === '#services') {
										onSelectServiceTrack?.(activeGoal.id === 'website' ? 'website' : 'video');
									}
								}}
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
								className='px-4 py-2.5 rounded-lg bg-[#FCF0D3] border-2 border-[#050505] text-[#050505] font-display font-bold text-sm shadow-[2px_2px_0_#050505] hover:bg-[#FFD426] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
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

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLanguage } from '../context/useLanguage';
import { useSound } from '../context/useSound';
import { SparkleStar, StarburstSticker } from '../components/SpaghettiArt';
import SpaghettiCablesCanvas from '../components/SpaghettiCablesCanvas';

const HERO_WORDS_EN = ['Motion', 'Explainers', '9:16 Reels', 'Websites'];
const HERO_WORDS_ID = ['Motion', 'Explainer', 'Reels 9:16', 'Website'];

const Hero = () => {
	const { lang, t } = useLanguage();
	const { sfxLevel, soundEnabled, toggleSound } = useSound();
	const heroRef = useRef<HTMLElement | null>(null);
	const [lastPlucked, setLastPlucked] = useState<string>('');

	// Atomic rotating word ticker: active index always modulo words.length (never blank/out-of-bounds)
	const [ticker, setTicker] = useState<{
		tick: number;
		activeIdx: number;
		prevIdx: number | null;
	}>({ tick: 0, activeIdx: 0, prevIdx: null });

	const words = lang === 'id' ? HERO_WORDS_ID : HERO_WORDS_EN;

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const intervalId = window.setInterval(() => {
			setTicker((prev) => ({
				tick: prev.tick + 1,
				prevIdx: prev.activeIdx,
				activeIdx: (prev.activeIdx + 1) % words.length,
			}));
		}, 2400);

		return () => window.clearInterval(intervalId);
	}, [words.length]);

	useGSAP(
		() => {
			gsap.fromTo(
				'.ds-hero-stagger',
				{ y: 12 },
				{
					y: 0,
					stagger: 0.06,
					duration: 0.4,
					ease: 'power2.out',
				}
			);
		},
		{ scope: heroRef }
	);

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			const top = el.getBoundingClientRect().top + window.pageYOffset - 84;
			window.scrollTo({ top, behavior: 'smooth' });
		}
	};

	return (
		<section
			id='hero'
			ref={heroRef}
			data-hero-stage
			className='substrate-newsprint relative overflow-hidden border-b-[4px] border-[#050505] pt-24 sm:pt-28 md:pt-[134px] lg:pt-[118px] xl:pt-36 pb-16 lg:pb-20'
		>
			{/* Live Verlet Physics Studio Patch Cords Canvas */}
			<SpaghettiCablesCanvas onPluck={setLastPlucked} />

			{/* Decorative Comic Sparkles */}
			<SparkleStar
				className='pointer-events-none hidden md:block absolute top-28 md:top-[134px] lg:top-[118px] xl:top-36 right-12 size-8 z-20'
				fill='#FFD426'
			/>

			<div className='relative z-20 max-w-7xl mx-auto px-5 md:px-10'>
				<div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end'>
					{/* Left 7 Cols: Editorial Positioning & Metrics */}
					<div data-hero-copy className='lg:col-span-7 min-w-0 flex flex-col gap-5'>
						{/* Archival Status Tag (Non-interactive status label) */}
						<div className='ds-hero-stagger self-start w-fit max-w-full inline-flex items-center gap-2 rounded border-2 border-dashed border-[#050505]/60 bg-[#FCF0D3]/85 px-3.5 py-1.5 text-[11px] sm:text-xs font-mono font-extrabold text-[#050505] select-none'>
							<span className='size-2.5 shrink-0 rounded-full bg-[#5CE62E] border border-[#050505] animate-pulse' />
							<span className='leading-snug'>
								{t({
									en: 'OPEN FOR WORK · VIDEO, MOTION & WEB',
									id: 'TERBUKA UNTUK PROYEK · VIDEO, MOTION & WEB',
								})}
							</span>
						</div>

						{/* Display Headline + Layout-Locked Rotating Canary Pill */}
						<h1 className='ds-hero-stagger font-display font-black text-[28px] sm:text-[40px] lg:text-[42px] xl:text-[48px] leading-[1.12] text-[#050505]'>
							<span className='flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1.5 mb-1'>
								<span className='whitespace-nowrap'>
									{t({ en: 'Creating', id: 'Merancang' })}
								</span>
								<span
									className='relative inline-grid place-items-center overflow-hidden select-none align-middle max-w-full px-3.5 sm:px-4 py-1 rounded border-[3px] border-[#050505] bg-[#FFD426] text-[#050505] shadow-[5px_5px_0_#050505]'
									style={{ lineHeight: '1.14' }}
								>
									{/* Invisible width-locking sizers: keeps pill & H1 geometry 100% constant across all words */}
									{words.map((w) => (
										<span
											key={`sizer-${w}`}
											aria-hidden='true'
											className='col-start-1 row-start-1 invisible h-0 overflow-hidden whitespace-nowrap pointer-events-none'
										>
											{w}
										</span>
									))}
									{ticker.prevIdx !== null && (
										<span
											key={`out-${ticker.tick}`}
											aria-hidden='true'
											onAnimationEnd={() =>
												setTicker((s) =>
													s.tick === ticker.tick ? { ...s, prevIdx: null } : s
												)
											}
											className='col-start-1 row-start-1 pointer-events-none whitespace-nowrap ds-pill-out'
										>
											{words[ticker.prevIdx % words.length]}
										</span>
									)}
									<span
										key={`in-${ticker.tick}`}
										className={`col-start-1 row-start-1 whitespace-nowrap ${
											ticker.tick > 0 ? 'ds-pill-in' : ''
										}`}
									>
										{words[ticker.activeIdx % words.length]}
									</span>
								</span>
							</span>
							<span className='block'>
								{t({
									en: 'With Film Craft & Code.',
									id: 'Lewat Teknik Film & Kode.',
								})}
							</span>
						</h1>

						{/* Concise Positioning Copy */}
						<p className='ds-hero-stagger text-base sm:text-lg text-[#2C313A] leading-relaxed max-w-xl font-medium'>
							{t({
								en: 'Cum Laude TV & Film graduate producing story-driven explainers, 9:16 reels, code-based animation, clear sound design (SFX), and interactive websites.',
								id: 'Lulusan Cum Laude Televisi & Film yang memproduksi video explainer, reels 9:16, animasi berbasis kode, tata suara & SFX yang jernih, serta website interaktif.',
							})}
						</p>

						{/* Comic Ink CTAs */}
						<div className='ds-hero-stagger flex flex-wrap items-center gap-3.5 pt-1'>
							<button
								type='button'
								data-sfx='keycap'
								onClick={() => scrollTo('videos')}
								className='rounded border-[2.5px] border-[#050505] bg-[#3886C0] hover:bg-[#4D9DE0] text-[#FFFFFF] px-6 py-3 text-sm sm:text-base font-display font-black shadow-[4px_4px_0_#050505] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer'
							>
								{t({
									en: 'Watch 14 Video Works ↓',
									id: 'Tonton 14 Karya Video ↓',
								})}
							</button>

							<button
								type='button'
								data-sfx='keycap'
								onClick={() => scrollTo('studio-desk')}
								className='rounded border-[2.5px] border-[#050505] bg-[#FCF0D3] hover:bg-[#FFD426] text-[#050505] px-6 py-3 text-sm sm:text-base font-display font-black shadow-[4px_4px_0_#050505] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer'
							>
								{t({
									en: 'Skills & Service Guide →',
									id: 'Profil & Panduan Jasa →',
								})}
							</button>

							<div className='hidden sm:block ml-1.5 ds-sticker-stepped pointer-events-none select-none' aria-hidden='true'>
								<StarburstSticker
									label='MIXED'
									sublabel='MEDIA'
									color='#FD6141'
									textColor='#FFFFFF'
									sublabelColor='#FFD426'
									labelFontSize={20}
									sublabelFontSize={15.5}
									className='size-[84px]'
								/>
							</div>
						</div>

						{/* 4× Archival Spec Index Tickets (Flat non-clickable summary readout) */}
						<div className='ds-hero-stagger pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-2xl'>
							{[
								{
									val: t({ en: '14 Works', id: '14 Karya' }),
									lbl: { en: '9:16 · 16:9 Formats', id: 'Format 9:16 · 16:9' },
									bg: 'bg-[#FFFFFF]/90',
								},
								{
									val: '3.76 GPA',
									lbl: { en: 'Cum Laude Film & TV', id: 'Cum Laude TV & Film' },
									bg: 'bg-[#FFD426]/65',
								},
								{
									val: '610 TOEFL',
									lbl: { en: 'EN / ID Bilingual', id: 'Dwibahasa EN / ID' },
									bg: 'bg-[#FFFFFF]/90',
								},
								{
									val: 'Audio + SFX',
									lbl: { en: 'Clean Voice & SFX', id: 'Narasi Jernih & SFX' },
									bg: 'bg-[#FCF0D3]/85',
								},
							].map((ticket) => (
								<div
									key={ticket.val}
									className={`min-w-0 rounded-sm border-2 border-[#050505]/70 ${ticket.bg} px-3 py-2 sm:px-3.5 sm:py-2.5 select-none`}
								>
									<p className='font-display font-black text-base sm:text-lg text-[#050505] leading-tight'>
										{ticket.val}
									</p>
									<p className='font-mono text-[11px] font-bold text-[#3B404C] mt-0.5'>
										{t(ticket.lbl)}
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Right 5 Cols: Interactive Patch-Bay Stage & Cable Monitor */}
					<div className='lg:col-span-5 min-w-0 flex flex-col items-start lg:items-end justify-end'>
						{/* Dedicated open interactive cable stage on mobile & tablet so all 4 cords & tags stay clear above PATCH_CORDS.PHYSICS */}
						<div
							data-hero-bay
							aria-hidden='true'
							className='w-full h-[232px] sm:h-[268px] lg:hidden pointer-events-none select-none'
						/>
						<div
							data-hero-card
							className='ds-hero-stagger w-full max-w-sm lg:mb-20 xl:mb-10 ds-os-window rounded-md overflow-hidden bg-[#FCF0D3]'
						>
							<div className='flex items-center justify-between px-3 py-1.5 bg-[#F2C94C] border-b-[3px] border-[#050505]'>
								<div className='flex items-center gap-2'>
									<span className='size-3 rounded-full bg-[#FD6141] border-2 border-[#050505]' />
									<span className='font-mono text-[11px] font-black text-[#050505] uppercase'>
										PATCH_CORDS.PHYSICS
									</span>
								</div>
								<span className='font-mono text-[10px] font-black px-2 py-0.5 rounded-none bg-[#050505] text-[#5CE62E] select-none'>
									60 FPS
								</span>
							</div>

							<div className='p-4 bg-[#FCF0D3] space-y-3'>
								<div className='flex items-center justify-between gap-2'>
									<span className='font-mono text-[11px] font-extrabold text-[#050505] uppercase'>
										{t({
											en: 'Tap or glide across cords to pluck them',
											id: 'Sentuh atau geser kabel untuk memetiknya',
										})}
									</span>
								</div>

								<div className='flex items-center justify-between gap-2 pt-1.5 border-t-2 border-dashed border-[#050505]/25'>
									<span className='font-mono text-[11px] font-bold text-[#204275] truncate min-w-0 flex-1'>
										{lastPlucked
											? `PLUCKED: ${lastPlucked}`
											: t({
													en: '4 STUDIO CORDS ACTIVE',
													id: '4 KABEL STUDIO AKTIF',
												})}
									</span>

									<button
										type='button'
										data-sfx='custom'
										data-sfx-toggle='true'
										data-sfx-level={sfxLevel}
										data-hover-sfx='switch'
										aria-pressed={soundEnabled}
										onClick={toggleSound}
										className={`shrink-0 px-2.5 py-1 rounded border-2 border-[#050505] font-mono text-[10px] font-black shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
											sfxLevel === 'full'
												? 'bg-[#5CE62E] text-[#050505]'
												: sfxLevel === 'low'
													? 'bg-[#FFD426] text-[#050505]'
													: 'bg-white text-[#050505] hover:bg-[#FFD426]'
										}`}
									>
										{sfxLevel === 'full'
											? t({ en: '♪ SOUND FX: ON', id: '♪ EFEK SUARA: ON' })
											: sfxLevel === 'low'
												? t({ en: '♪ SOUND FX: LOW', id: '♪ EFEK SUARA: LOW' })
												: t({ en: '♪ SOUND FX: OFF', id: '♪ EFEK SUARA: OFF' })}
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;

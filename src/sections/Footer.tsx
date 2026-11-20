import { useState } from 'react';
import { DownloadIcon } from '../components/Icons';
import { SpaghettiBrandMark, SparkleStar } from '../components/SpaghettiArt';
import { useLanguage } from '../context/useLanguage';
import { getLocalizedCvLink, PUBLIC_CONTACT } from '../data/portfolioData';

const Footer = () => {
	const { lang, setLang, t } = useLanguage();
	const [glitching, setGlitching] = useState(false);
	const currentYear = new Date().getFullYear();

	const triggerVhsGlitch = () => {
		if (glitching) return;
		setGlitching(true);
		window.setTimeout(() => setGlitching(false), 360);
	};

	return (
		<footer className='substrate-carbon relative overflow-hidden text-[#FCF0D3] pt-14 pb-12 px-5 md:px-10'>
			{/* Beat 15 Homage: 8-Frame VHS Tracking Tear Overlay on Trigger */}
			{glitching && (
				<div
					className='ds-vhs-glitch-active pointer-events-none fixed inset-0 z-[200]'
					aria-hidden='true'
				/>
			)}

			<div className='max-w-7xl mx-auto space-y-10'>
				{/* Top 16mm End-Card Telemetry + Interactive VHS Glitch Button */}
				<div className='flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/15'>
					<div className='flex items-center gap-3 font-mono text-xs'>
						<span className='px-2.5 py-1 rounded-sm bg-[#23262E] text-[#FFD426] font-bold border border-dashed border-[#FFD426]/50 select-none'>
							16MM END-CARD // FRAME 2170
						</span>
						<span className='text-white/65 hidden sm:inline'>
							{glitching
								? 'TRACKING_TEAR :: 8-FRAME RGB SPLIT ACTIVE'
								: 'STUDIO: KRISTIANTO FILM + CODE'}
						</span>
					</div>

					<button
						type='button'
						data-sfx='vhs-glitch'
						onClick={triggerVhsGlitch}
						className='inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#FFD426] bg-[#1D1F24] hover:bg-[#C91878] hover:border-white text-[#FFD426] hover:text-white font-mono text-xs font-black cursor-pointer shadow-[2px_2px_0_#FFD426] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
					>
						<span>⚡</span>
						<span>
							{t({
								en: 'Test VHS Screen Effect',
								id: 'Uji Efek Layar VHS',
							})}
						</span>
					</button>
				</div>

				{/* Center Signature Block End-Card (Cream & Canary on Carbon #121212) */}
				<div className='flex flex-col lg:flex-row lg:items-center justify-between gap-8'>
					<div className='space-y-3 max-w-2xl'>
						<div className='flex items-center gap-3'>
							<SpaghettiBrandMark className='size-11 shrink-0' />
							<div>
								<p className='font-display font-black text-2xl sm:text-3xl text-[#FFD426] tracking-tight leading-none'>
									KRISTIANTO
								</p>
								<p className='font-mono text-xs font-bold text-[#FCF0D3]/75 mt-1'>
									{t({
										en: 'Film & TV Graduate · Video Editor, Motion Explainer Producer & Creative Web Builder',
										id: 'Sarjana (S.Sn) Televisi & Film · Video Editor, Motion Explainer Producer & Creative Web Builder',
									})}
								</p>
							</div>
							<SparkleStar className='size-6 hidden sm:block ml-1' fill='#5CE62E' />
						</div>

						<p className='text-sm text-[#FCF0D3]/75 leading-relaxed'>
							{t({
								en: 'Based in Indonesia · Available for remote video editing, motion explainers, & creative web builds.',
								id: 'Berbasis di Indonesia · Terbuka untuk proyek remote video editing, motion explainer, & website kreatif.',
							})}
						</p>
					</div>

					{/* Harmonized Pill Links + Single Accent CV Download */}
					<div className='flex flex-wrap items-center gap-2.5'>
						<a
							href='#videos'
							data-sfx='nav'
							className='px-3.5 py-2 rounded-full border border-white/25 bg-white/8 text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							{t({ en: 'Portfolio', id: 'Portofolio' })}
						</a>
						<a
							href='#studio-desk'
							data-sfx='nav'
							className='px-3.5 py-2 rounded-full border border-white/25 bg-white/8 text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							{t({ en: 'Profile & Guide', id: 'Profil & Panduan' })}
						</a>
						<a
							href={PUBLIC_CONTACT.linkedin}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3.5 py-2 rounded-full border border-white/25 bg-white/8 text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							LinkedIn ↗
						</a>
						<a
							href={PUBLIC_CONTACT.github}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3.5 py-2 rounded-full border border-white/25 bg-white/8 text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							GitHub ↗
						</a>
						<a
							href={PUBLIC_CONTACT.instagram}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3.5 py-2 rounded-full border border-white/25 bg-white/8 text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							Instagram ↗
						</a>
						{(() => {
							const cv = getLocalizedCvLink(lang);
							return (
								<a
									href={cv.href}
									target='_blank'
									rel='noopener noreferrer'
									data-sfx='keycap'
									className='inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-2 border-[#050505] bg-[#FFD426] text-[#050505] font-mono text-xs font-black hover:bg-[#FD6141] shadow-[2px_2px_0_#FCF0D3]/35 hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
								>
									<DownloadIcon className='size-3.5 shrink-0' />
									<span>{cv.label}</span>
								</a>
							);
						})()}
						<button
							type='button'
							data-sfx='switch'
							onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
							className='px-3.5 py-2 rounded-full border border-[#FFD426]/60 bg-transparent text-[#FFD426] font-mono text-xs font-black cursor-pointer hover:bg-[#FFD426] hover:text-[#050505] transition-colors'
						>
							{lang === 'en' ? 'Switch to ID' : 'Ganti ke EN'}
						</button>
					</div>
				</div>

				{/* Bottom Registration Copyright Line */}
				<div className='pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-white/55'>
					<span>© {currentYear} Kristianto · Indonesia · GMT+7</span>
					<a
						href='#hero'
						data-sfx='nav'
						className='text-[#FFD426] hover:text-[#FD6141] font-bold transition-colors'
					>
						↑ {t({ en: 'Back to Top', id: 'Kembali ke Atas' })}
					</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

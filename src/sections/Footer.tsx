import { useState } from 'react';
import { DownloadIcon } from '../components/Icons';
import { SpaghettiBrandMark, SparkleStar } from '../components/SpaghettiArt';
import { useLanguage } from '../context/useLanguage';
import { getLocalizedCvLink, PUBLIC_CONTACT } from '../data/portfolioData';

const Footer = () => {
	const { lang, t } = useLanguage();
	const [glitching, setGlitching] = useState(false);
	const currentYear = new Date().getFullYear();

	const triggerVhsGlitch = () => {
		if (glitching) return;
		setGlitching(true);
		window.setTimeout(() => setGlitching(false), 360);
	};

	const cv = getLocalizedCvLink(lang);

	return (
		<footer className='substrate-carbon relative overflow-hidden text-[#FCF0D3] pt-12 pb-10 px-5 md:px-10'>
			{/* Beat 15 Homage: 8-Frame VHS Tracking Tear Overlay on Trigger */}
			{glitching && (
				<div
					className='ds-vhs-glitch-active pointer-events-none fixed inset-0 z-[200]'
					aria-hidden='true'
				/>
			)}

			<div className='max-w-7xl mx-auto space-y-8'>
				{/* Top Signature + Direct Exit Links */}
				<div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
					<div className='flex items-center gap-3'>
						<SpaghettiBrandMark className='size-10 shrink-0' />
						<div>
							<p className='font-display font-black text-2xl text-[#FFD426] tracking-tight leading-none'>
								KRISTIANTO
							</p>
							<p className='font-mono text-xs font-bold text-[#FCF0D3]/75 mt-1'>
								Video Editor, Motion Producer &amp; Web Builder
							</p>
						</div>
						<SparkleStar className='size-5 hidden sm:block ml-1' fill='#5CE62E' />
					</div>

					{/* Ligne-Claire Exit Links + CV */}
					<div className='flex flex-wrap items-center gap-2'>
						<a
							href={PUBLIC_CONTACT.linkedin}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3 py-1.5 rounded-sm border-2 border-[#FCF0D3]/30 bg-[#1B1E26] text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							LinkedIn ↗
						</a>
						<a
							href={PUBLIC_CONTACT.github}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3 py-1.5 rounded-sm border-2 border-[#FCF0D3]/30 bg-[#1B1E26] text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							GitHub ↗
						</a>
						<a
							href={PUBLIC_CONTACT.instagram}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='portal'
							className='px-3 py-1.5 rounded-sm border-2 border-[#FCF0D3]/30 bg-[#1B1E26] text-[#FCF0D3] font-mono text-xs font-bold hover:border-[#FFD426] hover:text-[#FFD426] transition-colors'
						>
							Instagram ↗
						</a>
						<a
							href={cv.href}
							target='_blank'
							rel='noopener noreferrer'
							data-sfx='keycap'
							className='inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border-2 border-[#050505] bg-[#FFD426] text-[#050505] font-mono text-xs font-black hover:bg-[#5CE62E] shadow-[2px_2px_0_#FCF0D3]/35 hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
						>
							<DownloadIcon className='size-3.5 shrink-0' />
							<span>{cv.label}</span>
						</a>
					</div>
				</div>

				{/* Bottom Registration Line */}
				<div className='pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-white/60'>
					<span>© {currentYear} Kristianto · Indonesia</span>

					<div className='flex items-center gap-4'>
						<button
							type='button'
							data-sfx='vhs-glitch'
							onClick={triggerVhsGlitch}
							className='px-2.5 py-1 rounded-sm border border-[#FFD426]/60 bg-[#1B1E26] hover:bg-[#C91878] hover:border-white text-[#FFD426] hover:text-white font-mono text-[11px] font-black cursor-pointer transition-colors'
						>
							⚡ VHS
						</button>
						<a
							href='#hero'
							data-sfx='nav'
							className='text-[#FFD426] hover:text-[#FD6141] font-bold transition-colors'
						>
							↑ {t({ en: 'Back to Top', id: 'Kembali ke Atas' })}
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;

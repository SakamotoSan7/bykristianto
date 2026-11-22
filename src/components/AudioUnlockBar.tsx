import { useEffect, useState } from 'react';
import { useLanguage } from '../context/useLanguage';
import { useSound } from '../context/useSound';

const APPEAR_GRACE_MS = 220;
const EXIT_ANIM_MS = 240;

/**
 * V5 Bottom-Center Cassette Deck Audio Unlock Bar.
 * Shows non-blocking prompt only while browser autoplay keeps Web Audio locked,
 * then slides smoothly away as soon as audio unlocks or user selects mute.
 */
const AudioUnlockBar = () => {
	const { t } = useLanguage();
	const { audioNeedsUnlock, unlockAudio, muteAllAudio } = useSound();
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (audioNeedsUnlock) {
			const showTimer = window.setTimeout(() => {
				setMounted(true);
				window.requestAnimationFrame(() => {
					setVisible(true);
				});
			}, APPEAR_GRACE_MS);
			return () => window.clearTimeout(showTimer);
		}

		if (!mounted) return;
		setVisible(false);
		const hideTimer = window.setTimeout(() => {
			setMounted(false);
		}, EXIT_ANIM_MS);
		return () => window.clearTimeout(hideTimer);
	}, [audioNeedsUnlock, mounted]);

	if (!mounted) return null;

	return (
		<div
			data-audio-unlock-bar='true'
			role='region'
			aria-label={t({ en: 'Audio status', id: 'Status audio' })}
			className='fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-1.25rem)] max-w-[580px] pointer-events-none'
		>
			<div
				className={`pointer-events-auto rounded-lg border-[2.5px] border-[#050505] bg-[#12161F] text-[#FCF0D3] px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 shadow-[5px_5px_0_#050505] font-mono text-xs transition-all duration-200 ${
					visible
						? 'opacity-100 translate-y-0 scale-100'
						: 'opacity-0 translate-y-3 scale-[0.97]'
				}`}
			>
				<div className='flex items-center gap-2 min-w-0 flex-1'>
					<span className='flex items-end gap-[2.5px] h-3.5 shrink-0' aria-hidden='true'>
						<span className='w-[3px] h-full bg-[#FFD426] rounded-[1px] ds-eq-bar-1' />
						<span className='w-[3px] h-full bg-[#5CE62E] rounded-[1px] ds-eq-bar-2' />
						<span className='w-[3px] h-full bg-[#FD6141] rounded-[1px] ds-eq-bar-3' />
					</span>

					<span className='font-mono font-bold text-[10.5px] tracking-tight sm:tracking-normal sm:text-xs text-[#FCF0D3] leading-tight truncate'>
						<span className='sm:hidden'>
							{t({
								en: 'Audio ready · Tap to enable',
								id: 'Audio siap · Ketuk layar',
							})}
						</span>
						<span className='hidden sm:inline'>
							{t({
								en: 'Audio ready · Click anywhere to enable',
								id: 'Audio siap · Klik di mana saja untuk aktifkan',
							})}
						</span>
					</span>
				</div>

				<div className='flex items-center gap-1.5 shrink-0'>
					<button
						type='button'
						data-audio-unlock-btn='true'
						data-sfx='custom'
						data-hover-sfx='none'
						onClick={() => unlockAudio(true)}
						className='px-2 py-1 sm:px-2.5 rounded border border-[#050505] bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] font-mono font-black text-[10px] sm:text-[11px] leading-none uppercase cursor-pointer transition-colors whitespace-nowrap'
					>
						▶ {t({ en: 'Enable', id: 'Aktifkan' })}
					</button>
					<button
						type='button'
						data-audio-mute-all='true'
						data-sfx='custom'
						data-hover-sfx='none'
						onClick={muteAllAudio}
						className='px-1.5 py-1 sm:px-2 rounded border border-[#FCF0D3]/35 bg-[#1D222D] hover:bg-[#2C3343] text-[#FCF0D3] font-mono font-bold text-[10px] sm:text-[11px] leading-none uppercase cursor-pointer transition-colors whitespace-nowrap'
					>
						{t({ en: 'Mute', id: 'Senyap' })}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AudioUnlockBar;

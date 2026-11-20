import { useLanguage, type LocalizedText } from '../context/useLanguage';
import {
	useSound,
	type BgmLevel,
	type SfxLevel,
} from '../context/useSound';
import {
	AudioIcon,
	AudioLowIcon,
	AudioMutedIcon,
	GlobeIcon,
	MusicIcon,
	MusicLowIcon,
	MusicMutedIcon,
} from './Icons';

const BGM_BUTTON_STATE: Record<
	BgmLevel,
	{
		label: string;
		navbarClass: string;
		chessClass: string;
		title: LocalizedText;
	}
> = {
	full: {
		label: 'BGM',
		navbarClass: 'bg-[#FFD426] text-[#050505] hover:bg-[#5CE62E]',
		chessClass: 'bg-[#FFD426] text-[#050505] hover:bg-[#5CE62E]',
		title: {
			en: 'Music: Normal · click for low volume',
			id: 'Musik: Normal · klik untuk mode pelan',
		},
	},
	low: {
		label: 'LOW',
		navbarClass: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#FFD426]',
		chessClass: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#FFD426]',
		title: {
			en: 'Music: Quiet · click to mute',
			id: 'Musik: Pelan · klik untuk matikan',
		},
	},
	off: {
		label: 'OFF',
		navbarClass: 'bg-[#FFFFFF] text-[#5B606B] hover:bg-[#FCF0D3] hover:text-[#050505]',
		chessClass: 'bg-[#FFFFFF] text-[#454A54] hover:bg-[#FCF0D3] hover:text-[#050505]',
		title: {
			en: 'Music: Off · click to turn on',
			id: 'Musik: Mati · klik untuk nyalakan',
		},
	},
};

const SFX_BUTTON_STATE: Record<
	SfxLevel,
	{
		label: string;
		navbarClass: string;
		chessClass: string;
		title: LocalizedText;
	}
> = {
	full: {
		label: 'SFX',
		navbarClass: 'bg-[#FFD426] text-[#050505] hover:bg-[#5CE62E]',
		chessClass: 'bg-[#FFD426] text-[#050505] hover:bg-[#5CE62E]',
		title: {
			en: 'SFX: Normal · click for low volume',
			id: 'Efek Suara: Normal · klik untuk mode pelan',
		},
	},
	low: {
		label: 'LOW',
		navbarClass: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#FFD426]',
		chessClass: 'bg-[#FCF0D3] text-[#050505] hover:bg-[#FFD426]',
		title: {
			en: 'SFX: Quiet · click to mute',
			id: 'Efek Suara: Pelan · klik untuk matikan',
		},
	},
	off: {
		label: 'OFF',
		navbarClass: 'bg-[#FFFFFF] text-[#5B606B] hover:bg-[#FCF0D3] hover:text-[#050505]',
		chessClass: 'bg-[#FFFFFF] text-[#454A54] hover:bg-[#FCF0D3] hover:text-[#050505]',
		title: {
			en: 'SFX: Off · click to turn on',
			id: 'Efek Suara: Mati · klik untuk nyalakan',
		},
	},
};

type ControlVariant = 'navbar' | 'chess';

export function LanguageSwitchPill({ variant = 'navbar' }: { variant?: ControlVariant }) {
	const { lang, setLang, t } = useLanguage();
	const isNavbar = variant === 'navbar';

	return (
		<div
			className={
				isNavbar
					? 'inline-flex items-center rounded border-2 border-[#050505] bg-[#FFFFFF] p-0.5 text-[10px] min-[360px]:text-[11px] font-mono shadow-[2px_2px_0_#050505] shrink-0'
					: 'inline-flex items-center h-6 sm:h-7 rounded-sm border-2 border-[#050505] bg-[#FFFFFF] p-0.5 text-[9.5px] sm:text-[10.5px] font-mono shadow-[2px_2px_0_#050505] shrink-0'
			}
			role='group'
			aria-label={t({ en: 'Language switch', id: 'Pilih bahasa' })}
		>
			<GlobeIcon
				className={
					isNavbar
						? 'size-3.5 text-[#3B404C] ml-1 mr-0.5 hidden sm:block'
						: 'size-3 text-[#050505] ml-0.5 mr-0.5 hidden xl:block'
				}
			/>
			<button
				type='button'
				data-sfx='switch'
				aria-pressed={lang === 'en'}
				onClick={() => setLang('en')}
				className={
					isNavbar
						? `ds-header-lang-btn px-1.5 min-[375px]:px-2 py-0.5 min-[360px]:py-1 rounded-[3px] font-black transition-colors cursor-pointer ${
								lang === 'en'
									? 'bg-[#3886C0] text-[#FFFFFF]'
									: 'text-[#3B404C] hover:text-[#050505]'
							}`
						: `h-full px-1.5 sm:px-2 inline-flex items-center justify-center rounded-[2px] font-black leading-none transition-colors cursor-pointer ${
								lang === 'en'
									? 'bg-[#3886C0] text-[#FFFFFF]'
									: 'text-[#3B404C] hover:text-[#050505]'
							}`
				}
			>
				EN
			</button>
			<button
				type='button'
				data-sfx='switch'
				aria-pressed={lang === 'id'}
				onClick={() => setLang('id')}
				className={
					isNavbar
						? `ds-header-lang-btn px-1.5 min-[375px]:px-2 py-0.5 min-[360px]:py-1 rounded-[3px] font-black transition-colors cursor-pointer ${
								lang === 'id'
									? 'bg-[#3886C0] text-[#FFFFFF]'
									: 'text-[#3B404C] hover:text-[#050505]'
							}`
						: `h-full px-1.5 sm:px-2 inline-flex items-center justify-center rounded-[2px] font-black leading-none transition-colors cursor-pointer ${
								lang === 'id'
									? 'bg-[#3886C0] text-[#FFFFFF]'
									: 'text-[#3B404C] hover:text-[#050505]'
							}`
				}
			>
				ID
			</button>
		</div>
	);
}

export function BgmToggleButton({ variant = 'navbar' }: { variant?: ControlVariant }) {
	const { t } = useLanguage();
	const { bgmLevel, bgmEnabled, toggleBgm } = useSound();
	const isNavbar = variant === 'navbar';
	const bgmUi = BGM_BUTTON_STATE[bgmLevel];
	const hint = t(bgmUi.title);

	return (
		<button
			type='button'
			data-bgm-toggle='true'
			data-bgm-level={bgmLevel}
			data-sfx='custom'
			data-hover-sfx='switch'
			onClick={toggleBgm}
			aria-pressed={bgmEnabled}
			aria-label={hint}
			title={hint}
			className={`inline-flex items-center justify-center gap-1 border-2 border-[#050505] font-mono font-black shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none cursor-pointer transition-all shrink-0 ${
				isNavbar
					? `ds-header-toggle-btn rounded min-w-[28px] h-7 min-[360px]:min-w-[34px] min-[360px]:h-8 min-[390px]:min-w-[36px] min-[390px]:h-9 sm:min-w-0 sm:h-auto sm:px-2 sm:py-1.5 text-[10px] sm:text-[11px] ${bgmUi.navbarClass}`
					: `rounded-sm w-7 h-6 sm:w-auto sm:h-7 sm:px-2 text-[9.5px] sm:text-[10.5px] leading-none ${bgmUi.chessClass}`
			}`}
		>
			{bgmLevel === 'full' ? (
				<MusicIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#050505]'
							: 'size-3.5 text-[#050505]'
					}
				/>
			) : bgmLevel === 'low' ? (
				<MusicLowIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#050505]'
							: 'size-3.5 text-[#050505]'
					}
				/>
			) : (
				<MusicMutedIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#5B606B]'
							: 'size-3.5 text-[#5B606B]'
					}
				/>
			)}
			{bgmLevel === 'low' && (
				<span
					className='size-1.5 rounded-full bg-[#FD6141] border border-[#050505] shrink-0'
					aria-hidden='true'
				/>
			)}
			<span className='hidden sm:inline'>{bgmUi.label}</span>
		</button>
	);
}

export function SfxToggleButton({ variant = 'navbar' }: { variant?: ControlVariant }) {
	const { t } = useLanguage();
	const { sfxLevel, soundEnabled, toggleSound } = useSound();
	const isNavbar = variant === 'navbar';
	const sfxUi = SFX_BUTTON_STATE[sfxLevel];
	const hint = t(sfxUi.title);

	return (
		<button
			type='button'
			data-sfx-toggle='true'
			data-sfx-level={sfxLevel}
			data-sfx='custom'
			data-hover-sfx='switch'
			onClick={toggleSound}
			aria-pressed={soundEnabled}
			aria-label={hint}
			title={hint}
			className={`inline-flex items-center justify-center gap-1 border-2 border-[#050505] font-mono font-black shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none cursor-pointer transition-all shrink-0 ${
				isNavbar
					? `ds-header-toggle-btn rounded min-w-[28px] h-7 min-[360px]:min-w-[34px] min-[360px]:h-8 min-[390px]:min-w-[36px] min-[390px]:h-9 sm:min-w-0 sm:h-auto sm:px-2 sm:py-1.5 text-[10px] sm:text-[11px] ${sfxUi.navbarClass}`
					: `rounded-sm w-7 h-6 sm:w-auto sm:h-7 sm:px-2 text-[9.5px] sm:text-[10.5px] leading-none ${sfxUi.chessClass}`
			}`}
		>
			{sfxLevel === 'full' ? (
				<AudioIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#050505]'
							: 'size-3.5 text-[#050505]'
					}
				/>
			) : sfxLevel === 'low' ? (
				<AudioLowIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#050505]'
							: 'size-3.5 text-[#050505]'
					}
				/>
			) : (
				<AudioMutedIcon
					className={
						isNavbar
							? 'size-3.5 min-[360px]:size-4 sm:size-3.5 text-[#5B606B]'
							: 'size-3.5 text-[#5B606B]'
					}
				/>
			)}
			{sfxLevel === 'low' && (
				<span
					className='size-1.5 rounded-full bg-[#FD6141] border border-[#050505] shrink-0'
					aria-hidden='true'
				/>
			)}
			<span className='hidden sm:inline'>{sfxUi.label}</span>
		</button>
	);
}

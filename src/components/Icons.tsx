import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function PlayIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
			<path d="M8 5.14v14l11-7-11-7z" />
		</svg>
	);
}

export function CloseIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	);
}

export function FilmIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M7 3v18" />
			<path d="M17 3v18" />
			<path d="M3 7.5h4" />
			<path d="M3 12h18" />
			<path d="M3 16.5h4" />
			<path d="M17 7.5h4" />
			<path d="M17 16.5h4" />
		</svg>
	);
}

export function CodeIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<polyline points="16 18 22 12 16 6" />
			<polyline points="8 6 2 12 8 18" />
		</svg>
	);
}

export function AudioIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M11 5 6 9H2v6h4l5 4V5z" />
			<path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
			<path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
		</svg>
	);
}

export function ChessIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M9 4h6l-1 4 3 3-1.5 5H8.5L7 11l3-3-1-4Z" />
			<path d="M6 20h12" />
			<path d="M7.5 16h9" />
		</svg>
	);
}

export function LayersIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<polygon points="12 2 2 7 12 12 22 7 12 2" />
			<polyline points="2 17 12 22 22 17" />
			<polyline points="2 12 12 17 22 12" />
		</svg>
	);
}

export function ArrowUpRightIcon({ className = 'size-4', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M7 17 17 7" />
			<path d="M7 7h10v10" />
		</svg>
	);
}

export function ChevronLeftIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="m15 18-6-6 6-6" />
		</svg>
	);
}

export function ChevronRightIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="m9 18 6-6-6-6" />
		</svg>
	);
}

export function CheckIcon({ className = 'size-4', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	);
}

export function MenuIcon({ className = 'size-6', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<line x1="4" x2="20" y1="6" y2="6" />
			<line x1="4" x2="20" y1="12" y2="12" />
			<line x1="4" x2="20" y1="18" y2="18" />
		</svg>
	);
}

export function GlobeIcon({ className = 'size-4', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</svg>
	);
}

export function AudioMutedIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M11 5 6 9H2v6h4l5 4V5z" />
			<line x1="22" x2="16" y1="9" y2="15" />
			<line x1="16" x2="22" y1="9" y2="15" />
		</svg>
	);
}

export function MusicIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.9"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M9 18V5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
		</svg>
	);
}

export function MusicLowIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.9"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M11 18V5l6 2" />
			<circle cx="8" cy="18" r="3" />
			<path d="M16.5 13.5c1.15 1.25 1.15 3.75 0 5" />
		</svg>
	);
}

export function MusicMutedIcon({ className = 'size-5', ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.9"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			{...props}
		>
			<path d="M9 18V8.5" />
			<path d="M9 5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
			<line x1="3" y1="3" x2="21" y2="21" />
		</svg>
	);
}

export function AspectFrameIcon({
	orientation,
	className = 'size-3.5',
	...props
}: IconProps & { orientation: '9:16' | '16:9' }) {
	if (orientation === '9:16') {
		return (
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={className}
				aria-hidden="true"
				{...props}
			>
				<rect x="6.5" y="2" width="11" height="20" rx="2" />
				<line x1="10.5" y1="5.2" x2="13.5" y2="5.2" />
				<line x1="10" y1="18.8" x2="14" y2="18.8" />
			</svg>
		);
	}
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
			{...props}
		>
			<rect x="2" y="5.5" width="20" height="13" rx="2" />
			<line x1="5.5" y1="9" x2="8" y2="9" />
			<line x1="5.5" y1="9" x2="5.5" y2="11.5" />
			<line x1="18.5" y1="15" x2="16" y2="15" />
			<line x1="18.5" y1="15" x2="18.5" y2="12.5" />
		</svg>
	);
}

export function LanguageFlagIcon({
	lang,
	className = 'w-4 h-3',
	...props
}: IconProps & { lang: 'EN' | 'ID' }) {
	if (lang === 'ID') {
		return (
			<svg
				viewBox="0 0 24 16"
				className={className}
				aria-hidden="true"
				{...props}
			>
				<rect x="0.75" y="0.75" width="22.5" height="7.25" fill="#DC2626" />
				<rect x="0.75" y="8" width="22.5" height="7.25" fill="#FFFFFF" />
				<rect
					x="0.75"
					y="0.75"
					width="22.5"
					height="14.5"
					rx="1.5"
					fill="none"
					stroke="#050505"
					strokeWidth="1.5"
				/>
			</svg>
		);
	}
	return (
		<svg
			viewBox="0 0 24 16"
			className={className}
			aria-hidden="true"
			{...props}
		>
			<rect x="0.75" y="0.75" width="22.5" height="14.5" rx="1.5" fill="#FFFFFF" />
			<rect x="0.75" y="0.75" width="22.5" height="2.4" fill="#DC2626" />
			<rect x="0.75" y="5.55" width="22.5" height="2.4" fill="#DC2626" />
			<rect x="0.75" y="10.35" width="22.5" height="2.4" fill="#DC2626" />
			<rect x="0.75" y="0.75" width="11" height="8.2" fill="#1D4ED8" />
			<circle cx="3.8" cy="3.2" r="0.9" fill="#FFFFFF" />
			<circle cx="8.2" cy="3.2" r="0.9" fill="#FFFFFF" />
			<circle cx="6" cy="5" r="0.9" fill="#FFFFFF" />
			<circle cx="3.8" cy="6.8" r="0.9" fill="#FFFFFF" />
			<circle cx="8.2" cy="6.8" r="0.9" fill="#FFFFFF" />
			<rect
				x="0.75"
				y="0.75"
				width="22.5"
				height="14.5"
				rx="1.5"
				fill="none"
				stroke="#050505"
				strokeWidth="1.5"
			/>
		</svg>
	);
}

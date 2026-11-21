import { useId, type FC } from 'react';
import type { ServiceArtKey } from '../data/portfolioData';

interface SvgClassProps {
	className?: string;
}

/**
 * Global SVG <defs> mounted once in App to provide the 15fps-style ink displacement filter
 * and archival halftone patterns without duplicating DOM definitions.
 */
export const SpaghettiSvgDefs: FC = () => (
	<svg
		width='0'
		height='0'
		aria-hidden='true'
		className='pointer-events-none fixed -top-96 -left-96 opacity-0'
	>
		<defs>
			<filter id='ds-ink-boil-filter' x='-5%' y='-5%' width='110%' height='110%'>
				<feTurbulence
					type='turbulence'
					baseFrequency='0.032'
					numOctaves='2'
					seed='7'
					result='noise'
				/>
				<feDisplacementMap in='SourceGraphic' in2='noise' scale='2.2' />
			</filter>
		</defs>
	</svg>
);

/**
 * Hand-inked 4-point Sparkle Star (from Style D & Variant B cutting-mat accents)
 */
export const SparkleStar: FC<{
	className?: string;
	fill?: string;
}> = ({ className = 'size-7', fill = '#FFFFFF' }) => (
	<svg
		viewBox='-28 -28 56 56'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		{/* Solid #050505 Offset Shadow */}
		<path
			d='M4 -17 L9 -2 L24 3 L9 8 L4 23 L-1 8 L-16 3 L-1 -2 Z'
			fill='#050505'
		/>
		{/* Primary White / Yellow 4-Point Sparkle */}
		<path
			d='M0 -21 L5 -6 L20 -1 L5 4 L0 19 L-5 4 L-20 -1 L-5 -6 Z'
			fill={fill}
			stroke='#050505'
			strokeWidth='3'
			strokeLinejoin='round'
		/>
	</svg>
);

/**
 * Hand-inked Kristianto Brand Mark — K01 Gold Director Signature (ChessAvatars Ligne-Claire style)
 */
export const SpaghettiBrandMark: FC<SvgClassProps> = ({ className = 'size-10' }) => {
	const uid = useId().replace(/:/g, '');
	const dotsId = `ds-brand-dots-${uid}`;
	const clipId = `ds-brand-clip-${uid}`;

	return (
		<svg
			viewBox='0 0 86 86'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			className={className}
			aria-hidden='true'
		>
			<defs>
				<pattern
					id={dotsId}
					x='0'
					y='0'
					width='8'
					height='8'
					patternUnits='userSpaceOnUse'
					patternTransform='rotate(45)'
				>
					<rect width='8' height='8' fill='#FFD426' />
					<circle cx='4' cy='4' r='1.6' fill='#D49600' />
				</pattern>
				<clipPath id={clipId}>
					<rect x='2' y='2' width='78' height='78' rx='11' />
				</clipPath>
			</defs>

			{/* Hard Offset Drop Shadow */}
			<rect x='6' y='6' width='78' height='78' rx='11' fill='#050505' />

			{/* Clipped K01 Gold Director Character Portrait */}
			<g clipPath={`url(#${clipId})`}>
				<g transform='translate(2, 2) scale(0.975)'>
					<rect width='80' height='80' fill={`url(#${dotsId})`} />
					<polygon points='0,62 80,44 80,80 0,80' fill='#FCAE1F' opacity='0.55' />

					{/* Director Blazer Outfit */}
					<path
						d='M7 82 C9 61, 20 54, 29 52.5 L51 52.5 C60 54, 71 61, 73 82 Z'
						fill='#1B1F2A'
						stroke='#050505'
						strokeWidth='3'
						strokeLinejoin='round'
					/>
					<path d='M50 54 C58 56, 68 62.5, 70 80.5 H53 L47 55 Z' fill='#11141C' />
					<path
						d='M30 52.5 L35.5 78 H44.5 L50 52.5 Z'
						fill='#121318'
						stroke='#050505'
						strokeWidth='2.3'
						strokeLinejoin='round'
					/>
					<path
						d='M33 52.5 C36.5 57.5, 43.5 57.5, 47 52.5'
						fill='none'
						stroke='#3886C0'
						strokeWidth='2.2'
						strokeLinecap='round'
					/>
					<path
						d='M29 52.5 L23.5 63.5 L31.5 68 L35.5 78'
						fill='#3886C0'
						stroke='#050505'
						strokeWidth='2.2'
						strokeLinejoin='round'
					/>
					<path
						d='M51 52.5 L56.5 63.5 L48.5 68 L44.5 78'
						fill='#204275'
						stroke='#050505'
						strokeWidth='2.2'
						strokeLinejoin='round'
					/>
					<circle cx='58.5' cy='69' r='3.6' fill='#FFD426' stroke='#050505' strokeWidth='1.7' />

					{/* Neck + Cast Shadow */}
					<path
						d='M33 44 V56 C37 59, 43 59, 47 56 V44 Z'
						fill='#E5B28B'
						stroke='#050505'
						strokeWidth='2.6'
					/>
					<path d='M34.5 46 C38 51.5, 43 52, 46 47 V53.5 C42 55.5, 37.5 55.5, 34.5 53 Z' fill='#C68B61' />

					{/* Back Hair Mass */}
					<path
						d='M19.5 33 C18 18.5, 26.5 9, 40 9 C53.5 9, 62 18.5, 60.5 33 L58 39 H22 Z'
						fill='#16181F'
						stroke='#050505'
						strokeWidth='2.8'
					/>

					{/* Ears + Wireless Earbud */}
					<ellipse cx='23' cy='36' rx='3.4' ry='5' fill='#DFAA82' stroke='#050505' strokeWidth='2.4' />
					<ellipse cx='57' cy='36' rx='3.4' ry='5' fill='#C68B61' stroke='#050505' strokeWidth='2.4' />
					<rect x='54.8' y='34.2' width='3.8' height='5.4' rx='1.4' fill='#121212' stroke='#050505' strokeWidth='1.4' />
					<circle cx='56.7' cy='36' r='0.8' fill='#74B9FF' />

					{/* Face Contour + Cel Cheek Shadow */}
					<path
						d='M24 27 C24 18, 56 18, 56 27 V36 C56 46, 48.5 51.5, 40 51.5 C31.5 51.5, 24 46, 24 36 Z'
						fill='#E5B28B'
						stroke='#050505'
						strokeWidth='2.8'
						strokeLinejoin='round'
					/>
					<path d='M54.5 29 V36 C54.5 44.5, 48 49.5, 40 49.8 C46.5 48.2, 50.5 42.5, 51 35 V28.5 Z' fill='#C68B61' />

					{/* Smug Eyebrows, Eyes, Nose & Confident Smirk */}
					<path d='M28.2 28.5 Q32 26.6 35.8 29.4' fill='none' stroke='#181A20' strokeWidth='2.2' strokeLinecap='round' />
					<path d='M44.2 30.2 Q48 29.2 51.8 30.4' fill='none' stroke='#181A20' strokeWidth='2.2' strokeLinecap='round' />
					<ellipse cx='32.3' cy='34.9' rx='2.6' ry='1.5' fill='#15171C' />
					<ellipse cx='47.7' cy='34.9' rx='2.6' ry='1.5' fill='#15171C' />
					<line x1='29.2' y1='33.2' x2='35.4' y2='33.2' stroke='#050505' strokeWidth='1.9' strokeLinecap='round' />
					<line x1='44.6' y1='33.2' x2='50.8' y2='33.2' stroke='#050505' strokeWidth='1.9' strokeLinecap='round' />
					<circle cx='31.6' cy='34.3' r='0.75' fill='#FFFFFF' />
					<circle cx='47' cy='34.3' r='0.75' fill='#FFFFFF' />
					<path
						d='M40 34.5 V39.5 L42 40.5'
						fill='none'
						stroke='#050505'
						strokeWidth='1.7'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
					<path d='M35.4 45.2 Q41.5 47 46.2 42.6' fill='none' stroke='#050505' strokeWidth='2.1' strokeLinecap='round' />

					{/* Signature Parted Wavy Curtain Hair */}
					<path
						d='M20.8 32.2 C19.5 19.5, 25.5 9.8, 36.2 9.5 C38.6 9.5, 39.8 10.6, 40.5 11.4 C41.6 10.2, 43.2 9.5, 45.2 9.6 C55.2 10.2, 60.5 19.5, 59.2 32.2 C56.8 29.8, 55.2 26.8, 53.5 28.4 C50.5 30.2, 46.8 28.2, 43.4 25.8 C41.6 24.4, 40.8 22.2, 40.2 19.2 C39.4 22.5, 38.2 25.2, 36.2 26.8 C32.8 29.5, 29.2 30.2, 26.5 28.2 C24.8 27, 23.2 30, 20.8 32.2 Z'
						fill='#16181F'
						stroke='#050505'
						strokeWidth='2.6'
						strokeLinejoin='round'
					/>
					<path d='M25.5 19.2 C29.5 15.2, 34.5 15.8, 37.2 21' fill='none' stroke='#2F3542' strokeWidth='1.8' strokeLinecap='round' />
					<path d='M54.2 19.2 C50.2 15.2, 45.5 15.8, 42.8 21' fill='none' stroke='#2F3542' strokeWidth='1.8' strokeLinecap='round' />

					{/* Double 4-Point Comic Sparkles */}
					<path
						d='M13 13 L14.6 16.4 L18 18 L14.6 19.6 L13 23 L11.4 19.6 L8 18 L11.4 16.4 Z'
						fill='#FFFFFF'
						stroke='#050505'
						strokeWidth='1.4'
						strokeLinejoin='round'
					/>
					<path
						d='M67 11 L68.2 13.8 L71 15 L68.2 16.2 L67 19 L65.8 16.2 L63 15 L65.8 13.8 Z'
						fill='#FFD426'
						stroke='#050505'
						strokeWidth='1.3'
						strokeLinejoin='round'
					/>
				</g>
			</g>

			{/* Crisp Outer Ink Frame */}
			<rect x='2' y='2' width='78' height='78' rx='11' fill='none' stroke='#050505' strokeWidth='3.5' />
		</svg>
	);
};

/**
 * Jagged 12-Point Comic Starburst Badge (roomy inner core + crisp legible ink)
 */
export const StarburstSticker: FC<{
	label: string;
	sublabel?: string;
	color?: string;
	textColor?: string;
	sublabelColor?: string;
	textStroke?: boolean;
	labelFontSize?: number;
	sublabelFontSize?: number;
	className?: string;
}> = ({
	label,
	sublabel,
	color = '#FD6141',
	textColor = '#FFFFFF',
	sublabelColor = '#FFD426',
	textStroke = true,
	labelFontSize,
	sublabelFontSize,
	className = 'size-16',
}) => (
	<svg
		viewBox='0 0 110 110'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		{/* Solid Black Offset Shadow */}
		<path
			d='M57 9 L67 21 L81 15 L83 31 L99 33 L93 47 L105 57 L93 67 L99 81 L83 83 L81 99 L67 93 L57 105 L47 93 L33 99 L31 83 L15 81 L21 67 L9 57 L21 47 L15 33 L31 31 L33 15 L47 21 Z'
			fill='#050505'
		/>
		{/* Primary Starburst Body */}
		<path
			d='M53 5 L63 17 L77 11 L79 27 L95 29 L89 43 L101 53 L89 63 L95 77 L79 79 L77 95 L63 89 L53 101 L43 89 L29 95 L27 79 L11 77 L17 63 L5 53 L17 43 L11 29 L27 27 L29 11 L43 17 Z'
			fill={color}
			stroke='#050505'
			strokeWidth='3.2'
			strokeLinejoin='round'
		/>
		<text
			x='53'
			y={sublabel ? '49' : '58'}
			textAnchor='middle'
			fill={textColor}
			stroke={textStroke ? '#050505' : 'none'}
			strokeWidth={textStroke ? '3.4' : '0'}
			strokeLinejoin='round'
			paintOrder='stroke'
			style={{
				fontFamily: "'Onest', sans-serif",
				fontWeight: 900,
				fontSize: `${labelFontSize ?? (sublabel ? 20 : 22)}px`,
				letterSpacing: '-0.02em',
			}}
		>
			{label}
		</text>
		{sublabel && (
			<text
				x='53'
				y='68'
				textAnchor='middle'
				fill={sublabelColor}
				stroke={textStroke ? '#050505' : 'none'}
				strokeWidth={textStroke ? '2.6' : '0'}
				strokeLinejoin='round'
				paintOrder='stroke'
				style={{
					fontFamily: "'Onest', sans-serif",
					fontWeight: 900,
					fontSize: `${sublabelFontSize ?? 15.5}px`,
					letterSpacing: '0.02em',
				}}
			>
				{sublabel}
			</text>
		)}
	</svg>
);

/**
 * FIG. A: 9:16 Split-Screen Manual Panel Artwork (for Short-Form Package & Case Studies)
 */
export const ReelsManualArt: FC<SvgClassProps> = ({ className = 'w-full h-full' }) => (
	<svg
		viewBox='0 0 360 220'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		<defs>
			<pattern id='ds-dots-gold' x='0' y='0' width='10' height='10' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
				<rect width='10' height='10' fill='#F1B516' />
				<circle cx='5' cy='5' r='2.1' fill='#D49600' />
			</pattern>
		</defs>

		{/* Background Newsprint Plate */}
		<rect x='0' y='0' width='360' height='220' fill='#F6EDD6' />

		{/* Center Phone L3 9:16 High-Retention Reel UI Wireframe */}
		<rect x='128' y='20' width='112' height='182' rx='8' fill='#050505' />
		<rect x='122' y='14' width='112' height='182' rx='8' fill='#FFFFFF' stroke='#050505' strokeWidth='3.5' />
		{/* Top Action Hook Visual + Retention Spark */}
		<rect x='128' y='20' width='100' height='74' rx='3' fill='url(#ds-dots-gold)' stroke='#050505' strokeWidth='2.5' />
		<circle cx='172' cy='57' r='19' fill='#FFFFFF' fillOpacity='0.85' stroke='#050505' strokeWidth='2' />
		<polygon points='167,48 183,57 167,66' fill='#FD6141' stroke='#050505' strokeWidth='2' strokeLinejoin='round' />
		{/* Mini Rising Retention Pill */}
		<rect x='133' y='25' width='52' height='14' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<text x='159' y='35' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			HOLD ↑ 92%
		</text>

		{/* Seam Safe-Zone Hook Caption Banner */}
		<rect x='110' y='88' width='136' height='24' rx='4' fill='#050505' />
		<rect x='108' y='86' width='136' height='24' rx='4' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='176' y='102' textAnchor='middle' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='11'>
			STRONG OPENING
		</text>

		{/* Bottom Portrait Zone Showing Safe Margins Around App Icons */}
		<rect x='128' y='114' width='100' height='74' rx='3' fill='#3886C0' stroke='#050505' strokeWidth='2.5' />
		<circle cx='168' cy='142' r='14' fill='#FFE7BF' stroke='#050505' strokeWidth='2.2' />
		<path d='M148 178 C148 160, 188 160, 188 178' fill='#204275' stroke='#050505' strokeWidth='2.2' />
		{/* Safe-Zone App UI Right Buttons Guide (Heart / Comment / Share) */}
		<circle cx='216' cy='128' r='5' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />
		<circle cx='216' cy='144' r='5' fill='#FCF0D3' stroke='#050505' strokeWidth='1.5' />
		<circle cx='216' cy='160' r='5' fill='#FCF0D3' stroke='#050505' strokeWidth='1.5' />
		{/* Bottom Creator Strip Clear Below Visual */}
		<rect x='134' y='177' width='58' height='6' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='1' />

		{/* Left Callout Tag + Ribbon Arrow */}
		<rect x='22' y='34' width='78' height='36' rx='4' fill='#050505' />
		<rect x='18' y='30' width='78' height='36' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='57' y='45' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			3-SEC
		</text>
		<text x='57' y='58' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='700' fontSize='8'>
			STORY HOOK
		</text>
		<path
			d='M66 68 Q78 92 104 96 L96 89 M104 96 L96 103'
			stroke='#FD6141'
			strokeWidth='4'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>

		{/* Right Safe-Zone Spec Tag */}
		<rect x='262' y='136' width='80' height='42' rx='4' fill='#050505' />
		<rect x='258' y='132' width='80' height='42' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='298' y='149' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			CRISP SFX
		</text>
		<text x='298' y='163' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='700' fontSize='8'>
			SAFE UI 9:16
		</text>
	</svg>
);

/**
 * FIG. B: Exploded Isometric Probe Lens + 3-Layer Shader Diagram (for SaaS / Product Hero)
 */
export const ExplainerIsoArt: FC<SvgClassProps> = ({ className = 'w-full h-full' }) => (
	<svg
		viewBox='0 0 360 220'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		<rect x='0' y='0' width='360' height='220' fill='#3886C0' />
		{/* Blueprint Grid Lines */}
		<path
			d='M0 44 H360 M0 88 H360 M0 132 H360 M0 176 H360 M60 0 V220 M120 0 V220 M180 0 V220 M240 0 V220 M300 0 V220'
			stroke='rgba(205,240,255,0.28)'
			strokeWidth='1.5'
		/>

		{/* Back Isometric Layer (Sunset / UI Card) */}
		<polygon points='115,48 250,24 250,104 115,128' fill='#FD6141' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
		<circle cx='182' cy='76' r='20' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />

		{/* Middle Isometric Layer (Growth / Benefit Motion Layer) */}
		<polygon points='95,78 230,54 230,134 95,158' fill='#5CE62E' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
		<path d='M130 98 L156 84 L176 92 L206 70' stroke='#050505' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
		<circle cx='206' cy='70' r='4.5' fill='#FFD426' stroke='#050505' strokeWidth='2' />

		{/* Front Isometric Layer (Clean Skew-Matched Promo Video Player Window) */}
		<polygon points='75,112 210,88 210,168 75,192' fill='#FCAE1F' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
		<g transform='translate(75 112) skewY(-10.08)'>
			{/* Blue Promo Video Player Screen */}
			<rect x='14' y='11' width='107' height='58' rx='4' fill='#204275' stroke='#050505' strokeWidth='2.5' />
			{/* Light-Blue Player Top Bar */}
			<path d='M14 23 H121' stroke='#050505' strokeWidth='2' />
			<rect x='14' y='11' width='107' height='12' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='2.2' />
			<circle cx='22' cy='17' r='2' fill='#FD6141' stroke='#050505' strokeWidth='1' />
			<circle cx='29' cy='17' r='2' fill='#FFD426' stroke='#050505' strokeWidth='1' />
			<circle cx='36' cy='17' r='2' fill='#5CE62E' stroke='#050505' strokeWidth='1' />

			{/* Unmistakable Center Play Button Badge + Promo CTA */}
			<circle cx='56' cy='38' r='11.5' fill='#FFD426' stroke='#050505' strokeWidth='2.2' />
			<polygon points='52.5,32.5 63,38 52.5,43.5' fill='#050505' stroke='#050505' strokeWidth='1' strokeLinejoin='round' />
			<rect x='76' y='32' width='36' height='12' rx='3' fill='#5CE62E' stroke='#050505' strokeWidth='1.6' />
			<text x='94' y='40.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='6.8'>
				PROMO
			</text>

			{/* Video Timeline Scrub Bar */}
			<rect x='22' y='57' width='91' height='5' rx='2.5' fill='#0E1D36' stroke='#050505' strokeWidth='1.2' />
			<rect x='22' y='57' width='56' height='5' rx='2.5' fill='#74B9FF' stroke='#050505' strokeWidth='1.2' />
			<circle cx='78' cy='59.5' r='3.5' fill='#FCF0D3' stroke='#050505' strokeWidth='1.5' />
		</g>

		{/* Archival Tags */}
		<rect x='24' y='24' width='84' height='32' rx='4' fill='#050505' />
		<rect x='20' y='20' width='84' height='32' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='62' y='34' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			FIG.B · PROMO
		</text>
		<text x='62' y='46' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='700' fontSize='8'>
			9:16 / 16:9
		</text>
		<rect x='254' y='152' width='88' height='34' rx='4' fill='#050505' />
		<rect x='250' y='148' width='88' height='34' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='294' y='162' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			VISUAL STORY
		</text>
		<text x='294' y='175' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='700' fontSize='8'>
			CUSTOM MOTION
		</text>
	</svg>
);

/**
 * FIG. C: 16:9 YouTube Long-Form Storytelling Player + Chapter Arc + Narration Mix
 */
export const DocumentaryManualArt: FC<SvgClassProps> = ({ className = 'w-full h-full' }) => (
	<svg
		viewBox='0 0 360 220'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		<rect x='0' y='0' width='360' height='220' fill='#39754F' />
		<path
			d='M0 44 H360 M0 88 H360 M0 132 H360 M0 176 H360 M60 0 V220 M120 0 V220 M180 0 V220 M240 0 V220 M300 0 V220'
			stroke='rgba(155,224,178,0.28)'
			strokeWidth='1.5'
		/>

		{/* Left Wide 16:9 YouTube Widescreen Storytelling Player */}
		<rect x='24' y='24' width='228' height='142' rx='4' fill='#050505' />
		<rect x='18' y='18' width='228' height='142' rx='4' fill='#FAF3CF' stroke='#050505' strokeWidth='3' />
		<rect x='18' y='18' width='228' height='20' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='28' y='31.5' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			16:9 YOUTUBE STORYTELLING
		</text>

		{/* Explainer Visual Viewport inside 16:9 Player */}
		<rect x='28' y='44' width='208' height='92' rx='3' fill='#102542' stroke='#050505' strokeWidth='2.5' />
		{/* Explanatory Visuals inside frame: Rising Trend Graph + Spotlight Node */}
		<path d='M42 114 L82 94 L124 102 L168 68 L216 62' stroke='#5CE62E' strokeWidth='3.5' strokeLinecap='round' strokeLinejoin='round' />
		<circle cx='168' cy='68' r='5' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<rect x='42' y='56' width='68' height='18' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='1.8' />
		<text x='76' y='68' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			EXPLAINER
		</text>
		{/* Red YouTube Scrubber Progress Bar at Bottom of 16:9 Video */}
		<rect x='34' y='124' width='196' height='5' rx='2.5' fill='rgba(255,255,255,0.2)' />
		<rect x='34' y='124' width='126' height='5' rx='2.5' fill='#FD6141' />
		<circle cx='160' cy='126.5' r='4.5' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />

		{/* 3-Part Narrative Arc Row Below Player */}
		<rect x='28' y='142' width='62' height='13' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />
		<text x='59' y='151.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			01 INTRO
		</text>
		<rect x='101' y='142' width='62' height='13' rx='2' fill='#74B9FF' stroke='#050505' strokeWidth='1.5' />
		<text x='132' y='151.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			02 VISUAL
		</text>
		<rect x='174' y='142' width='62' height='13' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<text x='205' y='151.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			03 FINALE
		</text>

		{/* Right Panel: Crisp Voice Narration + BGM + SFX Channel Mixer */}
		<rect x='262' y='24' width='80' height='142' rx='4' fill='#050505' />
		<rect x='256' y='18' width='80' height='142' rx='4' fill='#F6EDD6' stroke='#050505' strokeWidth='3' />
		<rect x='266' y='30' width='24' height='42' rx='4' fill='#CBD5E1' stroke='#050505' strokeWidth='2' />
		<circle cx='278' cy='46' r='6' fill='#204275' stroke='#050505' strokeWidth='1.5' />
		<text x='296' y='88' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8'>
			VOICE + BGM
		</text>
		<rect x='266' y='100' width='60' height='12' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<rect x='266' y='118' width='48' height='12' rx='2' fill='#FFD426' stroke='#050505' strokeWidth='1.5' />
		<rect x='266' y='136' width='36' height='12' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />

		{/* Bottom Long-Form Stamp */}
		<rect x='24' y='176' width='146' height='26' rx='3' fill='#050505' />
		<rect x='20' y='172' width='146' height='26' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='93' y='189' textAnchor='middle' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='9.5'>
			FULL STORY + AUDIO MIX
		</text>
	</svg>
);

/**
 * FIG. D: Style D Retro OS Web Window + NLE Premiere Timeline Combo (Conversion Combo)
 */
export const ConversionComboArt: FC<SvgClassProps> = ({ className = 'w-full h-full' }) => (
	<svg
		viewBox='0 0 360 220'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className={className}
		aria-hidden='true'
	>
		<rect x='0' y='0' width='360' height='220' fill='#C5432F' />
		<path
			d='M0 44 H360 M0 88 H360 M0 132 H360 M0 176 H360 M60 0 V220 M120 0 V220 M180 0 V220 M240 0 V220 M300 0 V220'
			stroke='rgba(255,204,194,0.28)'
			strokeWidth='1.5'
		/>

		{/* Back Window: Website Hero Embedding the Promo Video */}
		<rect x='26' y='26' width='220' height='142' rx='3' fill='#050505' />
		<rect x='20' y='20' width='220' height='142' rx='3' fill='#F6EDD6' stroke='#050505' strokeWidth='3' />
		<rect x='20' y='20' width='220' height='24' fill='#4D9DE0' stroke='#050505' strokeWidth='3' />
		<circle cx='34' cy='32' r='5' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<text x='46' y='36' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			YOUR WEBSITE + EMBEDDED VIDEO
		</text>
		{/* Website Hero Offer + Embedded Promo Video Box */}
		<rect x='32' y='56' width='90' height='16' rx='2' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<text x='77' y='67' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			BRAND HERO
		</text>
		<rect x='32' y='80' width='90' height='58' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2' />
		<line x1='40' y1='94' x2='110' y2='94' stroke='#050505' strokeWidth='3' strokeLinecap='round' />
		<line x1='40' y1='106' x2='96' y2='106' stroke='#3886C0' strokeWidth='2.5' strokeLinecap='round' />
		<rect x='40' y='117' width='58' height='14' rx='7' fill='#FD6141' stroke='#050505' strokeWidth='1.8' />
		{/* Embedded Promo Video Inside Hero */}
		<rect x='130' y='56' width='98' height='82' rx='3' fill='#1E293B' stroke='#050505' strokeWidth='2.2' />
		<circle cx='179' cy='94' r='14' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<polygon points='175,87 187,94 175,101' fill='#050505' />

		{/* Connecting Sync Cable between Website & Video */}
		<path
			d='M 80 162 C 80 188, 120 188, 152 172'
			fill='none'
			stroke='#050505'
			strokeWidth='6'
			strokeLinecap='round'
		/>
		<path
			d='M 80 162 C 80 188, 120 188, 152 172'
			fill='none'
			stroke='#FFD426'
			strokeWidth='3'
			strokeLinecap='round'
		/>

		{/* Front PiP Window: Dark Mode NLE Timeline */}
		<rect x='158' y='96' width='186' height='106' rx='3' fill='#050505' />
		<rect x='152' y='90' width='186' height='106' rx='3' fill='#1E1F22' stroke='#050505' strokeWidth='3' />
		<rect x='152' y='90' width='186' height='22' fill='#F2C94C' stroke='#050505' strokeWidth='3' />
		<text x='164' y='105' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='9'>
			PROMO VIDEO
		</text>
		{/* Timeline Tracks */}
		<rect x='166' y='124' width='76' height='16' rx='2' fill='#74B9FF' stroke='#050505' strokeWidth='1.5' />
		<rect x='246' y='124' width='78' height='16' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />
		<rect x='166' y='146' width='158' height='16' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<line x1='228' y1='116' x2='228' y2='186' stroke='#FFD426' strokeWidth='2.5' />
		<polygon points='223,116 233,116 228,124' fill='#FFD426' />

		{/* Bundle Tag */}
		<rect x='26' y='178' width='86' height='24' rx='2' fill='#050505' />
		<rect x='22' y='174' width='86' height='24' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='2' />
		<text x='65' y='190' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			WEB + VIDEO
		</text>
	</svg>
);

/** 5. Custom Video Service Card Illustration (Brief + Clapperboard + Choice) */
export const CustomVideoArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#E8B923' />
		<g stroke='#050505' strokeOpacity='0.14' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Left Sticky Brief Card */}
		<rect x='24' y='28' width='126' height='142' rx='3' fill='#050505' />
		<rect x='18' y='22' width='126' height='142' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='18' y='22' width='126' height='24' fill='#FD6141' stroke='#050505' strokeWidth='3' />
		<text x='30' y='38' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			YOUR BRIEF
		</text>
		<rect x='30' y='60' width='16' height='16' rx='3' fill='#5CE62E' stroke='#050505' strokeWidth='2' />
		<text x='54' y='71' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			ANY STYLE
		</text>
		<rect x='30' y='88' width='16' height='16' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='2' />
		<text x='54' y='99' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			ANY VOICE
		</text>
		<rect x='30' y='116' width='16' height='16' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<text x='54' y='127' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			9:16 / 16:9
		</text>
		<text x='30' y='152' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='7.5'>
			NO RIGID LIMITS
		</text>

		{/* Dotted Blueprint Connector */}
		<path d='M144 96 H178' stroke='#050505' strokeWidth='2.5' strokeDasharray='4 4' />

		{/* Right Tilted Clapperboard */}
		<g transform='translate(174 36) rotate(-3)'>
			<rect x='6' y='8' width='156' height='122' rx='4' fill='#050505' />
			<rect x='0' y='2' width='156' height='122' rx='4' fill='#1E1F22' stroke='#050505' strokeWidth='3' />
			{/* Clapper Stripes Top */}
			<rect x='0' y='2' width='156' height='26' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='3' />
			<polygon points='18,2 36,2 24,28 6,28' fill='#050505' />
			<polygon points='54,2 72,2 60,28 42,28' fill='#050505' />
			<polygon points='90,2 108,2 96,28 78,28' fill='#050505' />
			<polygon points='126,2 144,2 132,28 114,28' fill='#050505' />
			{/* Inside Monitor */}
			<rect x='16' y='40' width='124' height='54' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
			<polygon points='66,53 66,81 92,67' fill='#FD6141' stroke='#050505' strokeWidth='2.5' strokeLinejoin='round' />
			{/* Voice Bars */}
			<rect x='16' y='103' width='18' height='8' rx='2' fill='#5CE62E' />
			<rect x='40' y='103' width='36' height='8' rx='2' fill='#74B9FF' />
			<rect x='82' y='103' width='24' height='8' rx='2' fill='#FFD426' />
			<rect x='112' y='103' width='28' height='8' rx='2' fill='#FD6141' />
		</g>

		{/* Bottom Archival Label */}
		<rect x='232' y='176' width='108' height='28' rx='2' fill='#050505' />
		<rect x='228' y='172' width='108' height='28' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='282' y='189' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			CUSTOM FORMAT
		</text>
	</svg>
);

/** 6. Landing Page Service Illustration (Desktop 1-Page Conversion Funnel + Mobile Phone Preview) */
export const LandingPageArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#C5432F' />
		<g stroke='#050505' strokeOpacity='0.14' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Main Desktop Single-Page Offer Funnel Browser */}
		<rect x='24' y='24' width='226' height='174' rx='4' fill='#050505' />
		<rect x='18' y='18' width='226' height='174' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='18' y='18' width='226' height='22' fill='#FFD426' stroke='#050505' strokeWidth='3' />
		<circle cx='32' cy='29' r='4' fill='#FD6141' stroke='#050505' strokeWidth='1.8' />
		<circle cx='45' cy='29' r='4' fill='#5CE62E' stroke='#050505' strokeWidth='1.8' />
		<text x='142' y='32.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			SINGLE-PAGE LANDING PAGE
		</text>

		{/* Section 1: Hero Offer + Direct WA CTA */}
		<rect x='28' y='48' width='206' height='54' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2' />
		<rect x='36' y='56' width='108' height='12' rx='2' fill='#050505' />
		<line x1='36' y1='75' x2='128' y2='75' stroke='#3B404C' strokeWidth='3' strokeLinecap='round' />
		<rect x='36' y='83' width='74' height='14' rx='5' fill='#5CE62E' stroke='#050505' strokeWidth='2' />
		<text x='73' y='92.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			ORDER / WA
		</text>
		{/* Product Visual Preview on Hero Right */}
		<rect x='158' y='55' width='66' height='40' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='2' />
		<circle cx='191' cy='75' r='11' fill='#FFD426' stroke='#050505' strokeWidth='1.8' />

		{/* Section 2: 3 Key Benefit Pills */}
		<rect x='28' y='108' width='64' height='32' rx='2' fill='#FFF3C4' stroke='#050505' strokeWidth='1.8' />
		<rect x='99' y='108' width='64' height='32' rx='2' fill='#FFF3C4' stroke='#050505' strokeWidth='1.8' />
		<rect x='170' y='108' width='64' height='32' rx='2' fill='#FFF3C4' stroke='#050505' strokeWidth='1.8' />
		<text x='60' y='127' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			✓ BENEFIT 1
		</text>
		<text x='131' y='127' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			✓ BENEFIT 2
		</text>
		<text x='202' y='127' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			✓ PROOF
		</text>

		{/* Section 3: Lead Capture / Inquiry Form Strip */}
		<rect x='28' y='146' width='206' height='34' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2' />
		<rect x='36' y='154' width='126' height='18' rx='3' fill='#EFE3C4' stroke='#050505' strokeWidth='1.5' />
		<rect x='168' y='154' width='58' height='18' rx='3' fill='#FD6141' stroke='#050505' strokeWidth='1.8' />
		<text x='197' y='166' textAnchor='middle' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			SEND →
		</text>

		{/* Right Overlapping Mobile Phone Mockup (Phone + Desktop Responsive Proof) */}
		<rect x='262' y='40' width='80' height='152' rx='10' fill='#050505' />
		<rect x='256' y='34' width='80' height='152' rx='10' fill='#181C24' stroke='#050505' strokeWidth='3' />
		<rect x='262' y='44' width='68' height='130' rx='6' fill='#FCF0D3' stroke='#050505' strokeWidth='2' />
		<rect x='268' y='54' width='56' height='26' rx='2' fill='#74B9FF' stroke='#050505' strokeWidth='1.5' />
		<line x1='268' y1='90' x2='318' y2='90' stroke='#050505' strokeWidth='3' strokeLinecap='round' />
		<line x1='268' y1='100' x2='306' y2='100' stroke='#3B404C' strokeWidth='2.5' strokeLinecap='round' />
		<rect x='268' y='112' width='56' height='18' rx='4' fill='#5CE62E' stroke='#050505' strokeWidth='1.8' />
		<text x='296' y='124' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			WA CTA
		</text>
		<rect x='268' y='138' width='56' height='26' rx='2' fill='#FFFFFF' stroke='#050505' strokeWidth='1.5' />
		<text x='296' y='154' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='6.5'>
			MOBILE OK
		</text>
	</svg>
);

/** 7. Company Profile Website Illustration (Official Multi-Section Web + Trust Badge) */
export const CompanyProfileArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#27649B' />
		<g stroke='#FFFFFF' strokeOpacity='0.14' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Main Browser Card */}
		<rect x='34' y='24' width='290' height='168' rx='4' fill='#050505' />
		<rect x='28' y='18' width='290' height='168' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='28' y='18' width='290' height='24' fill='#FFD426' stroke='#050505' strokeWidth='3' />
		<text x='44' y='34' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			COMPANY PROFILE
		</text>
		<text
			x='308'
			y='33'
			textAnchor='end'
			fill='#050505'
			fontFamily="'JetBrains Mono',monospace"
			fontWeight='800'
			fontSize='6.5'
		>
			ABOUT · SERVICES · CONTACT
		</text>

		{/* Brand Banner */}
		<rect x='44' y='54' width='258' height='46' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='2.5' />
		<rect x='56' y='66' width='24' height='22' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2' />
		<text x='92' y='75' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='9'>
			OFFICIAL BUSINESS SITE
		</text>
		<line x1='92' y1='86' x2='202' y2='86' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />
		<rect x='228' y='67' width='62' height='20' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='1.8' />
		<text x='259' y='80' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7'>
			LOGO
		</text>

		{/* 3 Structured Columns: About, Services, Clients/Contact */}
		<rect x='44' y='112' width='78' height='58' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2.5' />
		<rect x='134' y='112' width='78' height='58' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2.5' />
		<rect x='224' y='112' width='78' height='58' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2.5' />

		<rect x='50' y='120' width='66' height='14' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='1.5' />
		<text x='83' y='130' textAnchor='middle' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			ABOUT
		</text>
		<line x1='54' y1='146' x2='108' y2='146' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />
		<line x1='54' y1='157' x2='96' y2='157' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />

		<rect x='140' y='120' width='66' height='14' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<text x='173' y='130' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			SERVICES
		</text>
		<line x1='144' y1='146' x2='198' y2='146' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />
		<line x1='144' y1='157' x2='186' y2='157' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />

		<rect x='230' y='120' width='66' height='14' rx='2' fill='#FFD426' stroke='#050505' strokeWidth='1.5' />
		<text x='263' y='130' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			CONTACT
		</text>
		<line x1='234' y1='146' x2='288' y2='146' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />
		<line x1='234' y1='157' x2='276' y2='157' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />

		{/* Trust Stamp Overlay */}
		<rect x='232' y='170' width='108' height='28' rx='3' fill='#050505' />
		<rect x='228' y='166' width='108' height='28' rx='3' fill='#5CE62E' stroke='#050505' strokeWidth='2.5' />
		<text x='282' y='184' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			TRUST & BRAND
		</text>
	</svg>
);

/** 8. Portfolio Website Illustration (Curated Gallery Grid + Showcase Bio) */
export const PortfolioWebArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#2D6E5E' />
		<g stroke='#FFFFFF' strokeOpacity='0.14' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Showcase Browser */}
		<rect x='34' y='24' width='290' height='168' rx='4' fill='#050505' />
		<rect x='28' y='18' width='290' height='168' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='28' y='18' width='290' height='24' fill='#F97316' stroke='#050505' strokeWidth='3' />
		<text x='42' y='34' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9.5'>
			MY PORTFOLIO
		</text>

		{/* Left Profile Sidebar */}
		<rect x='44' y='54' width='76' height='116' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2.5' />
		<circle cx='82' cy='76' r='14' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='82' y='102' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			BIO &amp; CV
		</text>
		<line x1='54' y1='112' x2='110' y2='112' stroke='#3B404C' strokeWidth='2.5' strokeLinecap='round' />
		<line x1='58' y1='122' x2='106' y2='122' stroke='#3B404C' strokeWidth='2' strokeLinecap='round' />
		<rect x='52' y='138' width='60' height='20' rx='4' fill='#5CE62E' stroke='#050505' strokeWidth='2' />
		<text x='82' y='151' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			HIRE ME
		</text>

		{/* Right Work Gallery Tiles + Preview Modal */}
		<rect x='132' y='54' width='80' height='54' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='2.5' />
		<polygon points='165,69 165,89 183,79' fill='#FCF0D3' stroke='#050505' strokeWidth='2' strokeLinejoin='round' />
		<text x='172' y='101' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='6.8'>
			VIDEO WORK
		</text>
		<rect x='222' y='54' width='80' height='54' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<circle cx='262' cy='76' r='11' fill='#FD6141' stroke='#050505' strokeWidth='2' />
		<text x='262' y='101' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='6.8'>
			PROJECT 02
		</text>

		<rect x='132' y='116' width='170' height='54' rx='3' fill='#1E1F22' stroke='#050505' strokeWidth='2.5' />
		<rect x='144' y='128' width='48' height='30' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='2' />
		<text x='246' y='138' textAnchor='middle' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			WORK MODAL PREVIEW
		</text>
		<line x1='204' y1='150' x2='286' y2='150' stroke='#74B9FF' strokeWidth='3' strokeLinecap='round' />

		{/* Sticker */}
		<rect x='26' y='172' width='96' height='26' rx='2' fill='#050505' />
		<rect x='22' y='168' width='96' height='26' rx='2' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='70' y='185' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			SHOWCASE GRID
		</text>
	</svg>
);

/** 9. Interactive Microsite / Brand Showcase Illustration (Tactile Widgets + Motion) */
export const MicrositeArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#1C2338' />
		<g stroke='#74B9FF' strokeOpacity='0.18' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Stage Frame */}
		<rect x='34' y='24' width='290' height='168' rx='4' fill='#050505' />
		<rect x='28' y='18' width='290' height='168' rx='4' fill='#F6EDD6' stroke='#050505' strokeWidth='3' />
		<rect x='28' y='18' width='290' height='24' fill='#C91878' stroke='#050505' strokeWidth='3' />
		<text x='42' y='34' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			INTERACTIVE STAGE
		</text>

		{/* Tactile Toggle & Sliders */}
		<rect x='48' y='60' width='86' height='36' rx='18' fill='#5CE62E' stroke='#050505' strokeWidth='3' />
		<circle cx='114' cy='78' r='13' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<text x='66' y='82' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='10'>
			PLAY
		</text>

		<rect x='48' y='112' width='108' height='48' rx='3' fill='#1E1F22' stroke='#050505' strokeWidth='2.5' />
		<text x='56' y='124' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='6.5'>
			SFX + MOTION
		</text>
		<rect x='62' y='140' width='14' height='12' fill='#FFD426' />
		<rect x='84' y='131' width='14' height='21' fill='#74B9FF' />
		<rect x='106' y='126' width='14' height='26' fill='#FD6141' />
		<rect x='128' y='134' width='14' height='18' fill='#5CE62E' />

		{/* Isometric Cube Object + Interactive Orbit Ring */}
		<g transform='translate(200 58)'>
			<polygon points='46,0 92,24 46,48 0,24' fill='#FFD426' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
			<polygon points='0,24 46,48 46,96 0,72' fill='#74B9FF' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
			<polygon points='92,24 46,48 46,96 92,72' fill='#FD6141' stroke='#050505' strokeWidth='3' strokeLinejoin='round' />
		</g>
		{/* Interactive Click Cursor on Toggle */}
		<polygon points='122,86 125,104 131,98 137,108 141,105 135,95 142,93' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' strokeLinejoin='round' />

		{/* Signal Wire */}
		<path d='M134 78 C 166 78, 174 108, 200 108' fill='none' stroke='#C91878' strokeWidth='3' strokeDasharray='5 3' />

		{/* Sticker */}
		<rect x='228' y='172' width='106' height='26' rx='2' fill='#050505' />
		<rect x='224' y='168' width='106' height='26' rx='2' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='277' y='185' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			MEMORABLE UX
		</text>
	</svg>
);

/** 10. Custom Website Service Illustration (Modular Wireframe + Your Idea) */
export const CustomWebArt: FC<SvgClassProps> = ({ className = 'w-full h-auto' }) => (
	<svg viewBox='0 0 360 220' className={className} aria-hidden='true'>
		<rect width='360' height='220' fill='#D98A16' />
		<g stroke='#050505' strokeOpacity='0.14' strokeWidth='1'>
			<path d='M0 40H360 M0 80H360 M0 120H360 M0 160H360 M0 200H360' />
			<path d='M45 0V220 M90 0V220 M135 0V220 M180 0V220 M225 0V220 M270 0V220 M315 0V220' />
		</g>

		{/* Dashed Blueprint Connections */}
		<path d='M110 74 H176 M140 132 H214' stroke='#050505' strokeWidth='2.5' strokeDasharray='5 4' />

		{/* Block 1: Header & Pages Architecture */}
		<rect x='30' y='30' width='134' height='58' rx='3' fill='#050505' />
		<rect x='24' y='24' width='134' height='58' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='24' y='24' width='134' height='20' fill='#FFD426' stroke='#050505' strokeWidth='3' />
		<text x='34' y='38' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='8.5'>
			MULTI-PAGE FLOW
		</text>
		<rect x='36' y='54' width='32' height='16' rx='2' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' />
		<rect x='74' y='54' width='32' height='16' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.8' />
		<rect x='112' y='54' width='32' height='16' rx='2' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' />

		{/* Block 2: Custom Feature Module */}
		<rect x='176' y='44' width='156' height='74' rx='3' fill='#050505' />
		<rect x='170' y='38' width='156' height='74' rx='3' fill='#74B9FF' stroke='#050505' strokeWidth='3' />
		<rect x='186' y='54' width='48' height='42' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='2' />
		<text x='246' y='64' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			CUSTOM FEATURE
		</text>
		<line x1='246' y1='78' x2='306' y2='78' stroke='#050505' strokeWidth='3' strokeLinecap='round' />
		<line x1='246' y1='90' x2='290' y2='90' stroke='#050505' strokeWidth='2.5' strokeLinecap='round' />

		{/* Block 3: Interactive Form / Mobile Adaptive Module */}
		<rect x='46' y='118' width='178' height='66' rx='3' fill='#050505' />
		<rect x='40' y='112' width='178' height='66' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='3' />
		<rect x='54' y='126' width='104' height='16' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='2' />
		<rect x='166' y='126' width='38' height='16' rx='3' fill='#5CE62E' stroke='#050505' strokeWidth='2' />
		<text x='185' y='137' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='6.5'>
			API
		</text>
		<text x='54' y='158' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='7.5'>
			FAST · RESPONSIVE BUILD
		</text>

		{/* Sticker */}
		<rect x='232' y='170' width='108' height='28' rx='2' fill='#050505' />
		<rect x='228' y='166' width='108' height='28' rx='2' fill='#FD6141' stroke='#050505' strokeWidth='2.5' />
		<text x='282' y='184' textAnchor='middle' fill='#FCF0D3' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='9'>
			YOUR IDEA
		</text>
	</svg>
);

const SERVICE_ARTWORK_MAP: Record<ServiceArtKey, FC<SvgClassProps>> = {
	'short-form': ReelsManualArt,
	'product-promo': ExplainerIsoArt,
	'long-form': DocumentaryManualArt,
	'custom-video': CustomVideoArt,
	'landing-page': LandingPageArt,
	'company-profile': CompanyProfileArt,
	'portfolio-website': PortfolioWebArt,
	'interactive-microsite': MicrositeArt,
	'website-video-bundle': ConversionComboArt,
	'custom-website': CustomWebArt,
};

/** Dispatches the matching Ligne-Claire illustration for any video or website service package. */
export const ServicePackageArtwork: FC<SvgClassProps & { artKey: ServiceArtKey }> = ({
	artKey,
	className = 'w-full h-full',
}) => {
	const Art = SERVICE_ARTWORK_MAP[artKey];
	return <Art className={className} />;
};

/**
 * Ligne-Claire replica artwork of Kristianto's own interactive portfolio website
 * (`aspect-[19/17]` via viewBox 0..380 x 0..340) matching the live Hero & Studio Desk chrome.
 */
export const PortfolioSiteArtwork: FC<SvgClassProps> = ({ className = 'w-full h-full block' }) => (
	<svg viewBox='0 0 380 340' className={className} aria-hidden='true'>
		{/* Top Hero Section: Warm Newsprint Grid Paper */}
		<rect width='380' height='268' fill='#F6EDD6' />
		<g stroke='#050505' strokeOpacity='0.075' strokeWidth='1'>
			<path d='M0 24H380 M0 48H380 M0 72H380 M0 96H380 M0 120H380 M0 144H380 M0 168H380 M0 192H380 M0 216H380 M0 240H380' />
			<path d='M24 0V268 M48 0V268 M72 0V268 M96 0V268 M120 0V268 M144 0V268 M168 0V268 M192 0V268 M216 0V268 M240 0V268 M264 0V268 M288 0V268 M312 0V268 M336 0V268 M360 0V268' />
		</g>

		{/* Decorative Hero Sparkle Star Top Right */}
		<path
			d='M356 62 L359 69 L366 72 L359 75 L356 82 L353 75 L346 72 L353 69 Z'
			fill='#FFD426'
			stroke='#050505'
			strokeWidth='1.5'
			strokeLinejoin='round'
		/>

		{/* Floating Interactive Hero Studio Patch Cords (Signature Draped Cables Behind Cards) */}
		<g fill='none' strokeLinecap='round'>
			{/* Cord 1: Vermilion Red */}
			<path d='M 244 46 C 248 118, 300 132, 344 50' stroke='#050505' strokeWidth='6.5' />
			<path d='M 244 46 C 248 118, 300 132, 344 50' stroke='#FD6141' strokeWidth='3.2' />
			{/* Cord 2: Canary Yellow */}
			<path d='M 262 46 C 272 134, 326 144, 360 66' stroke='#050505' strokeWidth='6.5' />
			<path d='M 262 46 C 272 134, 326 144, 360 66' stroke='#FFD426' strokeWidth='3.2' />
			{/* Cord 3: Blueprint Blue */}
			<path d='M 282 46 C 292 146, 336 154, 368 88' stroke='#050505' strokeWidth='6.5' />
			<path d='M 282 46 C 292 146, 336 154, 368 88' stroke='#3886C0' strokeWidth='3.2' />
			{/* Cord 4: Acid Lime Green */}
			<path d='M 304 46 C 308 122, 348 134, 372 72' stroke='#050505' strokeWidth='6.5' />
			<path d='M 304 46 C 308 122, 348 134, 372 72' stroke='#5CE62E' strokeWidth='3.2' />
		</g>
		{/* Metal Plug Collar Dots */}
		<circle cx='344' cy='50' r='3.5' fill='#FCF0D3' stroke='#050505' strokeWidth='1.5' />
		<circle cx='360' cy='66' r='3.5' fill='#FCF0D3' stroke='#050505' strokeWidth='1.5' />

		{/* Floating Retro OS Navbar */}
		<rect x='17' y='17' width='348' height='36' rx='6' fill='#050505' />
		<rect x='14' y='14' width='348' height='36' rx='6' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		{/* Brand Icon + KRISTIANTO */}
		<rect x='22' y='21' width='22' height='22' rx='5' fill='#18191D' stroke='#050505' strokeWidth='2' />
		<path d='M25 32 Q29 27, 33 32 T41 32' fill='none' stroke='#FFD426' strokeWidth='2.2' strokeLinecap='round' />
		<path d='M25 36 Q29 33, 33 36 T41 36' fill='none' stroke='#FD6141' strokeWidth='1.8' strokeLinecap='round' />
		<text x='49' y='30' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='9.5'>
			KRISTIANTO
		</text>
		<text x='49' y='39' fill='#FD6141' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='5'>
			FILM · MOTION · CODE
		</text>

		{/* Center Nav Pills */}
		<text x='128' y='34' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='5.2'>
			PORTFOLIO ▾  LAB ▾  SERVICES  CV  WEB
		</text>

		{/* Right Navbar Controls */}
		<rect x='253' y='24' width='26' height='16' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='1.5' />
		<rect x='255' y='26' width='11' height='12' rx='2' fill='#3886C0' />
		<text x='260.5' y='34' textAnchor='middle' fill='#FFFFFF' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5'>
			EN
		</text>
		<text x='272.5' y='34' textAnchor='middle' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5'>
			ID
		</text>
		<rect x='283' y='24' width='18' height='16' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='1.5' />
		<text x='292' y='34' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5'>
			SFX
		</text>
		{/* Mini Green 14 WORKS Starburst */}
		<polygon
			points='314,16 318,22 325,21 322,27 328,32 321,34 323,41 317,37 313,43 310,37 304,40 307,33 301,29 308,26 306,19 312,22'
			fill='#5CE62E'
			stroke='#050505'
			strokeWidth='1.5'
			strokeLinejoin='round'
		/>
		<text x='314' y='31' textAnchor='middle' fill='#FFFFFF' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='7'>
			14
		</text>
		{/* Red Book Project Pill */}
		<rect x='330' y='22' width='26' height='20' rx='3' fill='#FD6141' stroke='#050505' strokeWidth='1.8' />
		<text x='343' y='34' textAnchor='middle' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='5.2'>
			BRIEF
		</text>

		{/* Left Hero Column */}
		{/* Status Pill */}
		<rect x='18' y='66' width='122' height='15' rx='3' fill='#050505' />
		<rect x='16' y='64' width='122' height='15' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='1.8' />
		<circle cx='24' cy='71.5' r='2.8' fill='#5CE62E' stroke='#050505' strokeWidth='1' />
		<text x='31' y='73.5' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5.3'>
			OPEN FOR WORK · FILM &amp; TECH
		</text>

		{/* H1 Headline + Rotating Canary Motion Pill */}
		<text x='16' y='100' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='16.5'>
			Fresh Cuts,
		</text>
		<rect x='122' y='83' width='64' height='22' rx='3' fill='#050505' />
		<rect x='119' y='80' width='64' height='22' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='2.2' />
		<text x='151' y='96' textAnchor='middle' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='14.5'>
			Motion
		</text>
		<text x='16' y='121' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='15.5'>
			&amp; Visuals Built by
		</text>
		<text x='16' y='140' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='15.5'>
			Film Craft + Code.
		</text>

		{/* Subtitle Copy Lines */}
		<line x1='16' y1='152' x2='202' y2='152' stroke='#3B404C' strokeOpacity='0.65' strokeWidth='2.8' strokeLinecap='round' />
		<line x1='16' y1='160' x2='176' y2='160' stroke='#3B404C' strokeOpacity='0.5' strokeWidth='2.8' strokeLinecap='round' />

		{/* Dual Action CTAs + Red MIXED MEDIA Starburst */}
		<rect x='18' y='173' width='78' height='22' rx='3' fill='#050505' />
		<rect x='16' y='171' width='78' height='22' rx='3' fill='#3886C0' stroke='#050505' strokeWidth='2' />
		<text x='55' y='184' textAnchor='middle' fill='#FFFFFF' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='7.2'>
			14 Video Works ↓
		</text>

		<rect x='102' y='173' width='70' height='22' rx='3' fill='#050505' />
		<rect x='100' y='171' width='70' height='22' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='2' />
		<text x='135' y='184' textAnchor='middle' fill='#050505' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='7'>
			Studio Desk →
		</text>

		{/* MIXED MEDIA Sticker */}
		<polygon
			points='195,161 200,168 208,167 205,174 212,179 204,182 206,190 198,186 193,193 190,185 182,188 186,180 179,176 187,173 185,165 192,169'
			fill='#FD6141'
			stroke='#050505'
			strokeWidth='1.8'
			strokeLinejoin='round'
		/>
		<text x='195' y='178' textAnchor='middle' fill='#FFFFFF' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='5.2'>
			MIXED
		</text>
		<text x='195' y='184' textAnchor='middle' fill='#FFD426' fontFamily="'Onest',sans-serif" fontWeight='900' fontSize='4.5'>
			MEDIA
		</text>

		{/* Bottom 4 Archival Spec Tickets */}
		<g fontFamily="'Onest',sans-serif" fontWeight='900'>
			<rect x='18' y='211' width='46' height='32' rx='3' fill='#050505' />
			<rect x='16' y='209' width='46' height='32' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' />
			<text x='21' y='223' fill='#050505' fontSize='7'>
				14 Works
			</text>
			<text x='21' y='234' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontSize='4.8'>
				9:16 · 16:9
			</text>

			<rect x='69' y='211' width='46' height='32' rx='3' fill='#050505' />
			<rect x='67' y='209' width='46' height='32' rx='3' fill='#FFD426' stroke='#050505' strokeWidth='1.8' />
			<text x='72' y='223' fill='#050505' fontSize='7'>
				3.76 GPA
			</text>
			<text x='72' y='234' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontSize='4.8'>
				Film &amp; TV
			</text>

			<rect x='120' y='211' width='46' height='32' rx='3' fill='#050505' />
			<rect x='118' y='209' width='46' height='32' rx='3' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' />
			<text x='123' y='223' fill='#050505' fontSize='7'>
				610 TOEFL
			</text>
			<text x='123' y='234' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontSize='4.8'>
				EN / ID
			</text>

			<rect x='171' y='211' width='46' height='32' rx='3' fill='#050505' />
			<rect x='169' y='209' width='46' height='32' rx='3' fill='#FCF0D3' stroke='#050505' strokeWidth='1.8' />
			<text x='174' y='223' fill='#050505' fontSize='6.5'>
				Voice+SFX
			</text>
			<text x='174' y='234' fill='#3B404C' fontFamily="'JetBrains Mono',monospace" fontSize='4.8'>
				Clean Mix
			</text>
		</g>

		{/* Right Hero Console Window: PATCH_CORDS.PHYSICS */}
		<rect x='232' y='158' width='136' height='86' rx='4' fill='#050505' />
		<rect x='228' y='154' width='136' height='86' rx='4' fill='#FCF0D3' stroke='#050505' strokeWidth='2.5' />
		<rect x='228' y='154' width='136' height='19' fill='#F2C94C' stroke='#050505' strokeWidth='2.5' />
		<circle cx='238' cy='163.5' r='3' fill='#FD6141' stroke='#050505' strokeWidth='1.2' />
		<text x='245' y='166' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5.8'>
			PATCH_CORDS.PHYSICS
		</text>
		<rect x='333' y='158' width='25' height='11' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='1.2' />
		<text x='345.5' y='165.5' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5'>
			60 FPS
		</text>

		<text x='237' y='186' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='5.5'>
			TAP OR GLIDE CORDS TO PLUCK
		</text>
		<line x1='237' y1='196' x2='354' y2='196' stroke='#050505' strokeOpacity='0.25' strokeDasharray='3 3' strokeWidth='1.5' />
		<text x='237' y='215' fill='#204275' fontFamily="'JetBrains Mono',monospace" fontWeight='800' fontSize='5.5'>
			4 STUDIO CORDS LIVE
		</text>
		<rect x='310' y='204' width='45' height='17' rx='3' fill='#5CE62E' stroke='#050505' strokeWidth='1.5' />
		<text x='332.5' y='215' textAnchor='middle' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5'>
			♪ SFX: ON
		</text>

		{/* Section Horizon Seam + Green Studio Desk Drafting Mat Peek Below */}
		<rect x='0' y='268' width='380' height='72' fill='#17594A' />
		<g stroke='#FFFFFF' strokeOpacity='0.12' strokeWidth='1'>
			<path d='M0 292H380 M0 316H380 M24 268V340 M64 268V340 M104 268V340 M144 268V340 M184 268V340 M224 268V340 M264 268V340 M304 268V340 M344 268V340' />
		</g>
		<line x1='0' y1='268' x2='380' y2='268' stroke='#050505' strokeWidth='4' />

		{/* Dual OS Windows Peeking at Bottom */}
		<rect x='19' y='284' width='166' height='62' rx='3' fill='#050505' />
		<rect x='16' y='281' width='166' height='62' rx='3' fill='#2C5F8B' stroke='#050505' strokeWidth='2.5' />
		<rect x='16' y='281' width='166' height='16' fill='#FFD426' stroke='#050505' strokeWidth='2.5' />
		<text x='25' y='292' fill='#050505' fontFamily="'JetBrains Mono',monospace" fontWeight='900' fontSize='5.5'>
			● CORE PROFILE · 3 PILLARS
		</text>
		<rect x='26' y='306' width='146' height='26' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='1.8' />

		<rect x='201' y='284' width='166' height='62' rx='3' fill='#050505' />
		<rect x='198' y='281' width='166' height='62' rx='3' fill='#DAE5ED' stroke='#050505' strokeWidth='2.5' />
		<rect x='198' y='281' width='166' height='16' fill='#4D9DE0' stroke='#050505' strokeWidth='2.5' />
		<rect x='300' y='284' width='26' height='10' rx='2' fill='#5CE62E' stroke='#050505' strokeWidth='1.2' />
		<rect x='330' y='284' width='28' height='10' rx='2' fill='#FCF0D3' stroke='#050505' strokeWidth='1.2' />
		<rect x='208' y='306' width='146' height='26' rx='2' fill='#FFFFFF' stroke='#050505' strokeWidth='1.8' />
	</svg>
);

export const PixoraShowcaseArtwork = ({ className = 'w-full h-full' }: { className?: string }) => (
	<div
		className={`relative overflow-hidden bg-[#FCF0D3] select-none ${className}`}
		style={{
			backgroundImage:
				'linear-gradient(to right, rgba(5, 5, 5, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(5, 5, 5, 0.06) 1px, transparent 1px)',
			backgroundSize: '20px 20px',
		}}
	>
		{/* Angled Cerulean Graphic Ribbon (Digital Spaghetti Studio Accent) */}
		<div
			className='pointer-events-none absolute -inset-x-8 bottom-[14%] h-[34%] bg-[#3886C0] border-y-[2.5px] border-[#050505] -rotate-6'
			aria-hidden='true'
		/>

		{/* Subtle Drafting Corner Crosses */}
		<span
			className='pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] font-black text-[#050505]/30'
			aria-hidden='true'
		>
			+
		</span>
		<span
			className='pointer-events-none absolute bottom-2 right-2.5 font-mono text-[10px] font-black text-[#050505]/30'
			aria-hidden='true'
		>
			+
		</span>

		{/* Top-Left Tilted Canary Stamp & Top-Right Risograph Sparkle */}
		<span className='pointer-events-none absolute top-2.5 left-3 z-30 px-2 py-0.5 rounded-[2px] bg-[#FFD426] border-[1.5px] border-[#050505] shadow-[2px_2px_0_#050505] font-mono text-[9.5px] font-black uppercase tracking-wider text-[#050505] -rotate-2'>
			MOBILE UI
		</span>
		<SparkleStar
			className='pointer-events-none absolute top-2.5 right-3 z-30 size-5'
			fill='#FD6141'
		/>

		{/* Left Phone: Search Results Screen */}
		<div className='absolute bottom-[7%] left-[8%] h-[74%] aspect-[420/955] z-10 flex flex-col rounded-[14px] border-[2.5px] border-[#050505] bg-[#0B0D14] p-[3px] shadow-[4px_4px_0_#050505] -rotate-6 origin-bottom transition-transform duration-300 ease-out group-hover:-rotate-8 group-hover:-translate-x-1.5'>
			<div className='shrink-0 mx-auto my-[2px] w-5 h-[2.5px] rounded-full bg-[#2A2F3D]' aria-hidden='true' />
			<div className='flex-1 min-h-0 overflow-hidden rounded-[9px] border border-[#050505]/40 bg-[#0F0D23]'>
				<img
					src='/images/me/pixora/pixora-search.webp'
					alt='Pixora mobile search results screen'
					loading='lazy'
					className='w-full h-full object-cover object-top block'
				/>
			</div>
		</div>

		{/* Right Phone: Movie Detail Screen */}
		<div className='absolute bottom-[7%] right-[8%] h-[74%] aspect-[420/955] z-10 flex flex-col rounded-[14px] border-[2.5px] border-[#050505] bg-[#0B0D14] p-[3px] shadow-[4px_4px_0_#050505] rotate-6 origin-bottom transition-transform duration-300 ease-out group-hover:rotate-8 group-hover:translate-x-1.5'>
			<div className='shrink-0 mx-auto my-[2px] w-5 h-[2.5px] rounded-full bg-[#2A2F3D]' aria-hidden='true' />
			<div className='flex-1 min-h-0 overflow-hidden rounded-[9px] border border-[#050505]/40 bg-[#0F0D23]'>
				<img
					src='/images/me/pixora/pixora-detail.webp'
					alt='Pixora movie detail screen'
					loading='lazy'
					className='w-full h-full object-cover object-top block'
				/>
			</div>
		</div>

		{/* Center Hero Phone: Home Feed Screen */}
		<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[86%] aspect-[420/955] z-20 flex flex-col rounded-[16px] border-[3px] border-[#050505] bg-[#0B0D14] p-[3.5px] shadow-[6px_6px_0_#050505] ring-2 ring-[#FFD426]/90 transition-transform duration-300 ease-out group-hover:-translate-y-[53%] group-hover:scale-[1.02]'>
			<div className='shrink-0 mx-auto my-[2px] w-6 h-[3px] rounded-full bg-[#2A2F3D]' aria-hidden='true' />
			<div className='flex-1 min-h-0 overflow-hidden rounded-[10px] border border-[#050505]/40 bg-[#0F0D23]'>
				<img
					src='/images/me/pixora/pixora-home.webp'
					alt='Pixora home discovery screen'
					loading='lazy'
					className='w-full h-full object-cover object-top block'
				/>
			</div>
		</div>
	</div>
);

export const IgniterShowcaseArtwork = ({ className = 'w-full h-full' }: { className?: string }) => (
	<div
		className={`relative overflow-hidden bg-[#FCF0D3] select-none ${className}`}
		style={{
			backgroundImage:
				'linear-gradient(to right, rgba(5, 5, 5, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(5, 5, 5, 0.06) 1px, transparent 1px)',
			backgroundSize: '20px 20px',
		}}
	>
		{/* Angled Vermilion Graphic Ribbon (Digital Spaghetti Studio Accent) */}
		<div
			className='pointer-events-none absolute -inset-x-8 top-1/2 -translate-y-1/2 h-[30%] bg-[#FD6141] border-y-[2.5px] border-[#050505] rotate-3'
			aria-hidden='true'
		/>

		{/* Subtle Drafting Corner Crosses */}
		<span
			className='pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] font-black text-[#050505]/30'
			aria-hidden='true'
		>
			+
		</span>
		<span
			className='pointer-events-none absolute top-2 right-2.5 z-10'
			aria-hidden='true'
		>
			<SparkleStar className='size-5' fill='#3886C0' />
		</span>

		{/* Top-Left Tilted Canary Stamp */}
		<span className='pointer-events-none absolute top-2 left-2.5 z-30 px-2 py-0.5 rounded-[2px] bg-[#FFD426] border-[1.5px] border-[#050505] shadow-[2px_2px_0_#050505] font-mono text-[9.5px] font-black uppercase tracking-wider text-[#050505] -rotate-2'>
			WEB APP
		</span>

		{/* Centered Tilted Desktop Browser Frame with Mini Chrome + Real Screenshot */}
		<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] h-[74%] z-20 flex flex-col rounded-[10px] border-[2.5px] border-[#050505] bg-[#FFFFFF] shadow-[6px_6px_0_#050505] overflow-hidden -rotate-1 transition-transform duration-300 ease-out group-hover:rotate-0 group-hover:-translate-y-[52%] group-hover:scale-[1.015]'>
			<div className='h-[20px] shrink-0 px-2 bg-[#FCF0D3] border-b-[2px] border-[#050505] flex items-center justify-between gap-2'>
				<div className='flex items-center gap-1 shrink-0' aria-hidden='true'>
					<span className='size-2 rounded-full bg-[#FD6141] border border-[#050505]' />
					<span className='size-2 rounded-full bg-[#FFD426] border border-[#050505]' />
					<span className='size-2 rounded-full bg-[#5CE62E] border border-[#050505]' />
				</div>
				<span className='px-2 py-[1px] rounded-[2px] bg-[#FFFFFF] border border-[#050505]/40 font-mono text-[7.5px] font-bold text-[#3B404C] truncate'>
					igniter-theta.vercel.app
				</span>
			</div>
			<div className='flex-1 min-h-0 overflow-hidden bg-white'>
				<img
					src='/images/me/igniter/igniter-home.webp'
					alt='IGNITER startup pitching platform'
					loading='lazy'
					className='w-full h-full object-cover object-top block'
				/>
			</div>
		</div>

		{/* Bottom-Right Floating Stack Stamp */}
		<span className='pointer-events-none absolute bottom-2 right-2.5 z-30 px-2 py-0.5 rounded-[2px] bg-[#050505] text-[#FFD426] border border-[#050505] shadow-[2px_2px_0_#5CE62E] font-mono text-[8.5px] font-black uppercase tracking-wider rotate-2 transition-transform duration-300 group-hover:rotate-0 group-hover:-translate-y-0.5'>
			NEXT.JS 15
		</span>
	</div>
);

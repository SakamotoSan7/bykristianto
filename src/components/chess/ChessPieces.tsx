import type { FC } from 'react';
import type { Color, PieceSymbol } from 'chess.js';

interface ChessPieceSvgProps {
	type: PieceSymbol;
	color: Color;
	className?: string;
}

/**
 * Custom Ligne-Claire SVG chess pieces tuned for both Archival Cream (#FCF0D3)
 * and Studio Green Cutting-Mat (#39754F) squares with thick #050505 ink borders.
 */
export const ChessPieceSvg: FC<ChessPieceSvgProps> = ({
	type,
	color,
	className = 'w-full h-full',
}) => {
	const isWhite = color === 'w';
	const fill = isWhite ? '#FFFDF7' : '#1E222B';
	const shade = isWhite ? '#EBD8AA' : '#313847';
	const stroke = '#050505';
	const detail = isWhite ? '#050505' : '#FCF0D3';
	const accent = '#FFD426';

	switch (type) {
		case 'p':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					{/* Base Drop Shadow */}
					<path
						d='M12 37.5 H35 L33 39.5 H14 Z'
						fill='#050505'
						opacity='0.3'
					/>
					{/* Head */}
					<circle
						cx='22.5'
						cy='13.5'
						r='5.4'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
					{/* Collar */}
					<path
						d='M16.5 21 C16.5 18.8, 28.5 18.8, 28.5 21 C28.5 22.8, 26.8 23.4, 25.5 23.8 C27.2 27.6, 29.5 31.2, 32 34 H13 C15.5 31.2, 17.8 27.6, 19.5 23.8 C18.2 23.4, 16.5 22.8, 16.5 21 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
						strokeLinejoin='round'
					/>
					{/* Shading & Base */}
					<path
						d='M23 23.8 C24.8 27.6, 27 31, 29.4 33.4 H22.8 V23.8 Z'
						fill={shade}
					/>
					<rect
						x='11'
						y='34'
						width='23'
						height='4'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
					<line
						x1='17.5'
						y1='21.2'
						x2='27.5'
						y2='21.2'
						stroke={detail}
						strokeWidth='1.3'
						strokeLinecap='round'
					/>
				</svg>
			);

		case 'r':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					<path d='M10.5 38 H36.5 L34.5 40 H12.5 Z' fill='#050505' opacity='0.3' />
					{/* Battlements & Tower */}
					<path
						d='M12 10 H16.5 V13 H20 V10 H25 V13 H28.5 V10 H33 V17 L29.5 20 V31 L32.5 34 H12.5 L15.5 31 V20 L12 17 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
						strokeLinejoin='round'
					/>
					<path d='M23 20 H28.6 V31 L31 33.2 H23 Z' fill={shade} />
					<line
						x1='14.5'
						y1='17'
						x2='30.5'
						y2='17'
						stroke={detail}
						strokeWidth='1.4'
						strokeLinecap='round'
					/>
					<line
						x1='16.5'
						y1='20.5'
						x2='28.5'
						y2='20.5'
						stroke={detail}
						strokeWidth='1.3'
						strokeLinecap='round'
					/>
					<line
						x1='16.5'
						y1='30.8'
						x2='28.5'
						y2='30.8'
						stroke={detail}
						strokeWidth='1.3'
						strokeLinecap='round'
					/>
					{/* Plinth */}
					<rect
						x='9.5'
						y='34'
						width='26'
						height='4.5'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
				</svg>
			);

		case 'n':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					<path d='M10.5 38 H36.5 L34.5 40 H12.5 Z' fill='#050505' opacity='0.3' />
					{/* Horse Head & Neck */}
					<path
						d='M19.5 11.5 L21.5 7.5 L24.5 10.5 C30.5 11.5, 34 17.2, 33.5 25 C33.2 29, 32.5 32, 33 34 H14.5 C15 29.5, 18.2 26.8, 19.6 24 C17.5 24.4, 15.2 25.5, 12.6 26.2 C10.6 26.7, 9.2 25, 9.8 23 C10.6 20.4, 13 17, 15.6 14.4 C16.8 13.2, 18.2 12, 19.5 11.5 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
						strokeLinejoin='round'
					/>
					{/* Mane & Cel Shade */}
					<path
						d='M24.2 12.2 C29 13.6, 31.8 18.2, 31.4 25 C31.1 28.4, 30.6 31.2, 31 33.2 H25.8 C25.6 28.2, 26.6 22.8, 25 18.6 C24.2 16.5, 22.8 15, 21.6 13.8 Z'
						fill={shade}
					/>
					{/* Mane Ridge Line */}
					<path
						d='M24 13 C27.8 14.8, 29.8 19.2, 29.5 25.5'
						fill='none'
						stroke={detail}
						strokeWidth='1.3'
						strokeLinecap='round'
						strokeDasharray='2.4 2.2'
					/>
					{/* Eye & Nostril */}
					<circle cx='16.5' cy='17.6' r='1.35' fill={detail} />
					<circle cx='12.2' cy='23.6' r='0.95' fill={detail} />
					{/* Base */}
					<rect
						x='9.5'
						y='34'
						width='26'
						height='4.5'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
				</svg>
			);

		case 'b':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					<path d='M10.5 38 H36.5 L34.5 40 H12.5 Z' fill='#050505' opacity='0.3' />
					{/* Finial Orb */}
					<circle
						cx='22.5'
						cy='8.2'
						r='2.5'
						fill={isWhite ? fill : accent}
						stroke={stroke}
						strokeWidth='1.8'
					/>
					{/* Mitre Body */}
					<path
						d='M22.5 11 C17.5 14.2, 14.5 19.6, 16 25.4 C16.6 27.6, 17.8 29.4, 17.8 30.8 L14 34 H31 L27.2 30.8 C27.2 29.4, 28.4 27.6, 29 25.4 C30.5 19.6, 27.5 14.2, 22.5 11 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
						strokeLinejoin='round'
					/>
					<path
						d='M22.8 12.2 C26.6 15, 29 19.6, 27.8 25 C27.2 27.4, 26 29.2, 26 30.6 H22.8 Z'
						fill={shade}
					/>
					{/* Diagonal Mitre Slit & Cross */}
					<path
						d='M19 20.5 L26 16.8'
						stroke={detail}
						strokeWidth='1.7'
						strokeLinecap='round'
					/>
					<path
						d='M22.5 22.5 V27 M20.2 24.8 H24.8'
						stroke={detail}
						strokeWidth='1.5'
						strokeLinecap='round'
					/>
					<line
						x1='16.5'
						y1='30.8'
						x2='28.5'
						y2='30.8'
						stroke={detail}
						strokeWidth='1.3'
						strokeLinecap='round'
					/>
					{/* Base */}
					<rect
						x='9.5'
						y='34'
						width='26'
						height='4.5'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
				</svg>
			);

		case 'q':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					<path d='M10 38 H37 L35 40 H12 Z' fill='#050505' opacity='0.3' />
					{/* Crown Body */}
					<path
						d='M9 14.5 L15.2 25.5 L15.5 11.5 L20.5 24.5 L22.5 10 L24.5 24.5 L29.5 11.5 L29.8 25.5 L36 14.5 L32 31.5 L33.5 34.2 H11.5 L13 31.5 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.85'
						strokeLinejoin='round'
					/>
					<path
						d='M22.5 11.5 L24.4 25 L29 13 L29.4 26 L34.8 16 L31.2 31 H22.5 Z'
						fill={shade}
					/>
					{/* Crown Tip Pearls */}
					{[
						[8.5, 13.5],
						[15.4, 10.5],
						[22.5, 9],
						[29.6, 10.5],
						[36.5, 13.5],
					].map(([cx, cy]) => (
						<circle
							key={`${cx}-${cy}`}
							cx={cx}
							cy={cy}
							r='2.1'
							fill={accent}
							stroke={stroke}
							strokeWidth='1.5'
						/>
					))}
					<line
						x1='14'
						y1='31.2'
						x2='31'
						y2='31.2'
						stroke={detail}
						strokeWidth='1.35'
						strokeLinecap='round'
					/>
					{/* Plinth */}
					<rect
						x='9.5'
						y='34.2'
						width='26'
						height='4.5'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
				</svg>
			);

		case 'k':
			return (
				<svg viewBox='0 0 45 45' className={className} aria-hidden='true'>
					<path d='M10 38 H37 L35 40 H12 Z' fill='#050505' opacity='0.3' />
					{/* Royal Cross */}
					<path
						d='M22.5 6.5 V14 M18.8 9.6 H26.2'
						stroke={stroke}
						strokeWidth='3.8'
						strokeLinecap='round'
					/>
					<path
						d='M22.5 6.5 V14 M18.8 9.6 H26.2'
						stroke={accent}
						strokeWidth='1.8'
						strokeLinecap='round'
					/>
					{/* Twin Crown Lobes */}
					<path
						d='M22.5 14.5 C17.2 13, 10.2 15.5, 10.2 21.8 C10.2 26.2, 13 29.4, 13.2 31.2 L11.5 34.2 H33.5 L31.8 31.2 C32 29.4, 34.8 26.2, 34.8 21.8 C34.8 15.5, 27.8 13, 22.5 14.5 Z'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
						strokeLinejoin='round'
					/>
					<path
						d='M22.8 15.3 C27.2 14, 33.4 16.3, 33.4 21.8 C33.4 25.8, 30.8 28.8, 30.6 30.8 H22.8 Z'
						fill={shade}
					/>
					{/* Center Royal Crest */}
					<path
						d='M22.5 15.5 C20 19, 19.6 25.5, 21.2 30.6 M22.5 15.5 C25 19, 25.4 25.5, 23.8 30.6'
						fill='none'
						stroke={detail}
						strokeWidth='1.35'
						strokeLinecap='round'
					/>
					<line
						x1='14'
						y1='31.2'
						x2='31'
						y2='31.2'
						stroke={detail}
						strokeWidth='1.35'
						strokeLinecap='round'
					/>
					{/* Plinth */}
					<rect
						x='9.5'
						y='34.2'
						width='26'
						height='4.5'
						rx='1.6'
						fill={fill}
						stroke={stroke}
						strokeWidth='1.9'
					/>
				</svg>
			);
	}
};

import type { FC } from 'react';
import type { KrisTierId } from './chessProfiles';

export type ChessAvatarMood =
	| 'calm'
	| 'thinking'
	| 'smug'
	| 'hyped'
	| 'shocked'
	| 'sweating'
	| 'cheeky'
	| 'determined'
	| 'curious'
	| 'crying'
	| 'win'
	| 'lose';

interface AvatarProps {
	className?: string;
	mood?: ChessAvatarMood;
}

interface KristiantoAvatarProps extends AvatarProps {
	tier?: KrisTierId;
}

const ExpressiveExtras: FC<{ mood: ChessAvatarMood }> = ({ mood }) => (
	<>
		{/* Anime / Ligne-Claire Sweat Drop for Tension or Shock */}
		{(mood === 'sweating' || mood === 'shocked') && (
			<path
				d='M62.5 23 C65.2 27, 66.2 29.8, 64.8 32 C63.5 33.8, 60.5 33.8, 59.5 31.8 C58.4 29.5, 60.2 26.8, 62.5 23 Z'
				fill='#74B9FF'
				stroke='#050505'
				strokeWidth='1.7'
				strokeLinejoin='round'
			/>
		)}
		{/* Tearful Cheek Drops for Crying / Whiny Reactions */}
		{mood === 'crying' && (
			<>
				<path
					d='M29.4 39.2 C28.2 41.6, 27.6 43.4, 28.6 44.6 C29.5 45.6, 31.1 45.3, 31.5 44 C31.8 42.7, 30.8 40.9, 29.4 39.2 Z'
					fill='#74B9FF'
					stroke='#050505'
					strokeWidth='1.35'
					strokeLinejoin='round'
				/>
				<path
					d='M50.6 39.2 C49.2 40.9, 48.2 42.7, 48.5 44 C48.9 45.3, 50.5 45.6, 51.4 44.6 C52.4 43.4, 51.8 41.6, 50.6 39.2 Z'
					fill='#74B9FF'
					stroke='#050505'
					strokeWidth='1.35'
					strokeLinejoin='round'
				/>
			</>
		)}
		{/* Victory / Hype Sparkle Stars */}
		{(mood === 'win' || mood === 'hyped') && (
			<>
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
			</>
		)}
		{/* Shock Exclamation Lines */}
		{mood === 'shocked' && (
			<g stroke='#FD6141' strokeWidth='2.2' strokeLinecap='round'>
				<line x1='12' y1='17' x2='17' y2='22' />
				<line x1='10' y1='25' x2='16' y2='26' />
			</g>
		)}
		{/* Thinking Mini Ellipses Pill */}
		{mood === 'thinking' && (
			<g>
				<circle cx='12' cy='18' r='1.7' fill='#FFFFFF' stroke='#050505' strokeWidth='1.2' />
				<circle cx='16.8' cy='14' r='2.1' fill='#FFFFFF' stroke='#050505' strokeWidth='1.2' />
			</g>
		)}
		{/* Curious Comic Question Mark */}
		{mood === 'curious' && (
			<g>
				<path
					d='M10.5 14 C10.5 11.4, 15.6 11.4, 15.6 14 C15.6 15.8, 13.2 16.3, 13.2 18.2'
					fill='none'
					stroke='#050505'
					strokeWidth='3.3'
					strokeLinecap='round'
				/>
				<path
					d='M10.5 14 C10.5 11.4, 15.6 11.4, 15.6 14 C15.6 15.8, 13.2 16.3, 13.2 18.2'
					fill='none'
					stroke='#FFD426'
					strokeWidth='1.6'
					strokeLinecap='round'
				/>
				<circle cx='13.2' cy='21.5' r='1.35' fill='#FFD426' stroke='#050505' strokeWidth='1.1' />
			</g>
		)}
	</>
);

/**
 * Hand-inked Ligne-Claire portrait of Kristianto across 3 visually distinct eras:
 * - '1900' (Unc Kris / Om Kris): gold backdrop, real-photo inspired youthful clean-shaven look with parted curtain hair, black-cerulean studio jacket & wireless earbud
 * - '1500' (Teen Kris / ABG Kris): sky backdrop, bulky ON-HEAD over-ear headphones, tousled fringe & hoodie
 * - '1000' (Lil' Kris / Bocil Kris): lime backdrop, backwards coral cap, rosy cheeks, big eyes & denim overalls
 */
export const KristiantoAvatar: FC<KristiantoAvatarProps> = ({
	className = 'w-full h-full',
	mood = 'calm',
	tier = '1900',
}) => {
	const dotsId = `ds-kris-dots-${tier}`;
	const clipId = `ds-kris-frame-${tier}`;
	const isKid = tier === '1000';
	const isTeen = tier === '1500';
	const isUnc = tier === '1900';

	const bgBase = isKid ? '#5CE62E' : isTeen ? '#94C9F2' : '#FFD426';
	const bgDot = isKid ? '#39754F' : isTeen ? '#3886C0' : '#D49600';
	const bgAccent = isKid ? '#A3F77B' : isTeen ? '#4D9DE0' : '#FCAE1F';

	const leftEyeY = 34.5;
	const rightEyeY = 34.5;

	return (
		<svg viewBox='0 0 80 80' className={className} aria-hidden='true'>
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
					<rect width='8' height='8' fill={bgBase} />
					<circle cx='4' cy='4' r='1.6' fill={bgDot} />
				</pattern>
				<clipPath id={clipId}>
					<rect x='0' y='0' width='80' height='80' rx='6' />
				</clipPath>
			</defs>

			<g clipPath={`url(#${clipId})`}>
				<rect width='80' height='80' fill={`url(#${dotsId})`} />
				<polygon points='0,62 80,44 80,80 0,80' fill={bgAccent} opacity='0.55' />

				{/* Era Outfits */}
				{isKid ? (
					<>
						<path
							d='M10 82 C13 62, 23 55, 30 54 H50 C57 55, 67 62, 70 82 Z'
							fill='#FD6141'
							stroke='#050505'
							strokeWidth='3'
							strokeLinejoin='round'
						/>
						<path
							d='M31 54 C35 60, 45 60, 49 54'
							fill='none'
							stroke='#FCF0D3'
							strokeWidth='3.2'
							strokeLinecap='round'
						/>
						<rect x='25' y='55' width='7' height='27' fill='#204275' stroke='#050505' strokeWidth='2.2' />
						<rect x='48' y='55' width='7' height='27' fill='#204275' stroke='#050505' strokeWidth='2.2' />
						<circle cx='28.5' cy='68' r='2' fill='#FFD426' stroke='#050505' strokeWidth='1.2' />
						<circle cx='51.5' cy='68' r='2' fill='#FFD426' stroke='#050505' strokeWidth='1.2' />
					</>
				) : isTeen ? (
					<>
						{/* Streetwear Dark Charcoal Hoodie + Zip Collar */}
						<path
							d='M8 82 C10 62, 21 55, 29 53 L51 53 C59 55, 70 62, 72 82 Z'
							fill='#1F2430'
							stroke='#050505'
							strokeWidth='3'
							strokeLinejoin='round'
						/>
						<path
							d='M29 53.5 L35 74 L45 74 L51 53.5 Z'
							fill='#FD6141'
							stroke='#050505'
							strokeWidth='2.4'
							strokeLinejoin='round'
						/>
						<path d='M33 56 V71' fill='none' stroke='#FFD426' strokeWidth='2.3' strokeLinecap='round' />
						<path d='M47 56 V71' fill='none' stroke='#FFD426' strokeWidth='2.3' strokeLinecap='round' />
					</>
				) : (
					<>
						{/* Studio Kris (1900): Real-photo black & cerulean director blazer over dark studio tee */}
						<path
							d='M7 82 C9 61, 20 54, 29 52.5 L51 52.5 C60 54, 71 61, 73 82 Z'
							fill='#1B1F2A'
							stroke='#050505'
							strokeWidth='3'
							strokeLinejoin='round'
						/>
						<path d='M50 54 C58 56, 68 62.5, 70 80.5 H53 L47 55 Z' fill='#11141C' />
						{/* Black Studio Crewneck Tee underneath */}
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
						{/* Cerulean Trim Jacket Lapels */}
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
					</>
				)}

				{/* Neck */}
				<path
					d='M33 44 V56 C37 59, 43 59, 47 56 V44 Z'
					fill='#E5B28B'
					stroke='#050505'
					strokeWidth='2.6'
				/>
				<path d='M34.5 46 C38 51.5, 43 52, 46 47 V53.5 C42 55.5, 37.5 55.5, 34.5 53 Z' fill='#C68B61' />

				{/* Teen Kris: Big Over-Ear Headphone Band Behind/Over Hair */}
				{isTeen && (
					<path
						d='M17.5 34 C17 10, 28 5.5, 40 5.5 C52 5.5, 63 10, 62.5 34'
						fill='none'
						stroke='#181A20'
						strokeWidth='5.5'
						strokeLinecap='round'
					/>
				)}
				{isTeen && (
					<path
						d='M17.5 34 C17 10, 28 5.5, 40 5.5 C52 5.5, 63 10, 62.5 34'
						fill='none'
						stroke='#FD6141'
						strokeWidth='2.3'
						strokeLinecap='round'
					/>
				)}

				{/* Kid Backwards Cap Brim */}
				{isKid && (
					<path
						d='M54 20 L69 24 C70 28, 67 30, 56 29 Z'
						fill='#FFD426'
						stroke='#050505'
						strokeWidth='2.4'
						strokeLinejoin='round'
					/>
				)}

				{/* Back Hair Mass */}
				<path
					d={
						isUnc
							? 'M19.5 33 C18 18.5, 26.5 9, 40 9 C53.5 9, 62 18.5, 60.5 33 L58 39 H22 Z'
							: 'M20 33 C18 20, 27 11, 40 11 C53 11, 62 20, 60 33 L58 40 H22 Z'
					}
					fill='#16181F'
					stroke='#050505'
					strokeWidth='2.8'
				/>

				{/* Ears / On-Head Earcups */}
				{isTeen ? (
					<>
						<rect x='15.5' y='28.5' width='7.5' height='14' rx='3.2' fill='#181A20' stroke='#050505' strokeWidth='2.2' />
						<rect x='17' y='31' width='4' height='9' rx='1.8' fill='#FD6141' />
						<rect x='57' y='28.5' width='7.5' height='14' rx='3.2' fill='#181A20' stroke='#050505' strokeWidth='2.2' />
						<rect x='59' y='31' width='4' height='9' rx='1.8' fill='#FD6141' />
					</>
				) : (
					<>
						<ellipse cx='23' cy='36' rx='3.4' ry='5' fill='#DFAA82' stroke='#050505' strokeWidth='2.4' />
						<ellipse cx='57' cy='36' rx='3.4' ry='5' fill='#C68B61' stroke='#050505' strokeWidth='2.4' />
						{isUnc && (
							<>
								<rect
									x='54.8'
									y='34.2'
									width='3.8'
									height='5.4'
									rx='1.4'
									fill='#121212'
									stroke='#050505'
									strokeWidth='1.4'
								/>
								<circle cx='56.7' cy='36' r='0.8' fill='#74B9FF' />
							</>
						)}
					</>
				)}

				{/* Face Contour: Youthful clean oval jaw matching Kristianto's reference photos; Kid has softer cheeks */}
				<path
					d={
						isKid
							? 'M23.5 27 C23.5 18, 56.5 18, 56.5 27 V36.5 C56.5 46.5, 49.5 51.5, 40 51.5 C30.5 51.5, 23.5 46.5, 23.5 36.5 Z'
							: 'M24 27 C24 18, 56 18, 56 27 V36 C56 46, 48.5 51.5, 40 51.5 C31.5 51.5, 24 46, 24 36 Z'
					}
					fill='#E5B28B'
					stroke='#050505'
					strokeWidth='2.8'
					strokeLinejoin='round'
				/>
				<path
					d='M54.5 29 V36 C54.5 44.5, 48 49.5, 40 49.8 C46.5 48.2, 50.5 42.5, 51 35 V28.5 Z'
					fill='#C68B61'
				/>

				{/* Kid Playful Blush */}
				{isKid && (
					<>
						<ellipse cx='28.8' cy='40.2' rx='3' ry='1.7' fill='#FD6141' opacity='0.42' />
						<ellipse cx='51.2' cy='40.2' rx='3' ry='1.7' fill='#FD6141' opacity='0.42' />
					</>
				)}

				{/* Eyebrows by Mood */}
				<path
					d={
						mood === 'shocked'
							? 'M28 27.6 Q32 25.4 35.8 27.8'
							: mood === 'curious'
								? 'M28.2 26.8 Q32 24.4 35.8 27.2'
								: mood === 'sweating' || mood === 'lose' || mood === 'crying'
									? 'M28.2 31.2 Q32 28.8 35.8 27.8'
									: mood === 'determined' || mood === 'hyped'
										? 'M28.2 28.2 Q32 29.8 35.8 31.4'
										: mood === 'smug' || mood === 'cheeky'
											? 'M28.2 28.5 Q32 26.6 35.8 29.4'
											: mood === 'thinking'
												? 'M28.5 30.8 Q32 29.2 35.5 31.2'
												: 'M28.5 30 Q32 28.2 35.8 29.6'
					}
					fill='none'
					stroke='#181A20'
					strokeWidth='2.2'
					strokeLinecap='round'
				/>
				<path
					d={
						mood === 'shocked'
							? 'M44.2 27.8 Q48 25.4 52 27.6'
							: mood === 'curious'
								? 'M44.2 30.2 Q48 29.8 51.8 30.4'
								: mood === 'sweating' || mood === 'lose' || mood === 'crying'
									? 'M44.2 27.8 Q48 28.8 51.8 31.2'
									: mood === 'determined' || mood === 'hyped'
										? 'M44.2 31.4 Q48 29.8 51.8 28.2'
										: mood === 'smug' || mood === 'cheeky'
											? 'M44.2 30.2 Q48 29.2 51.8 30.4'
											: mood === 'thinking'
												? 'M44.5 31.2 Q48 29.2 51.5 30.8'
												: 'M44.2 29.6 Q48 28.2 51.5 30'
					}
					fill='none'
					stroke='#181A20'
					strokeWidth='2.2'
					strokeLinecap='round'
				/>

				{/* Eyes by Mood */}
				{mood === 'win' ? (
					<>
						<path d='M29.2 35 Q32.3 31.4 35.5 35' fill='none' stroke='#050505' strokeWidth='2.3' strokeLinecap='round' />
						<path d='M44.5 35 Q47.7 31.4 50.8 35' fill='none' stroke='#050505' strokeWidth='2.3' strokeLinecap='round' />
					</>
				) : mood === 'crying' ? (
					<>
						<ellipse cx='32.3' cy={leftEyeY + 0.3} rx='3' ry='2.7' fill='#15171C' />
						<ellipse cx='47.7' cy={rightEyeY + 0.3} rx='3' ry='2.7' fill='#15171C' />
						<path d='M29.2 36.2 Q32.3 37.8 35.4 36.2' fill='none' stroke='#74B9FF' strokeWidth='1.7' strokeLinecap='round' />
						<path d='M44.6 36.2 Q47.7 37.8 50.8 36.2' fill='none' stroke='#74B9FF' strokeWidth='1.7' strokeLinecap='round' />
						<circle cx='31.4' cy='33.5' r='1.1' fill='#FFFFFF' />
						<circle cx='46.8' cy='33.5' r='1.1' fill='#FFFFFF' />
					</>
				) : mood === 'curious' ? (
					<>
						<ellipse cx='32.3' cy={leftEyeY - 0.3} rx='3.1' ry='2.8' fill='#FFFFFF' stroke='#050505' strokeWidth='1.6' />
						<ellipse cx='47.7' cy={rightEyeY} rx='2.9' ry='2.4' fill='#FFFFFF' stroke='#050505' strokeWidth='1.6' />
						<circle cx='32.6' cy={leftEyeY - 0.5} r='1.55' fill='#15171C' />
						<circle cx='47.4' cy={rightEyeY - 0.3} r='1.45' fill='#15171C' />
						<circle cx='32' cy={leftEyeY - 1.1} r='0.65' fill='#FFFFFF' />
						<circle cx='46.8' cy={rightEyeY - 0.9} r='0.65' fill='#FFFFFF' />
					</>
				) : mood === 'shocked' ? (
					<>
						<ellipse cx='32.3' cy={leftEyeY} rx='3.7' ry='3.5' fill='#FFFFFF' stroke='#050505' strokeWidth='1.7' />
						<ellipse cx='47.7' cy={rightEyeY} rx='3.7' ry='3.5' fill='#FFFFFF' stroke='#050505' strokeWidth='1.7' />
						<circle cx='32.3' cy={leftEyeY} r='1.3' fill='#050505' />
						<circle cx='47.7' cy={rightEyeY} r='1.3' fill='#050505' />
					</>
				) : mood === 'cheeky' ? (
					<>
						<path d='M29.2 35 Q32.3 32.2 35.5 35' fill='none' stroke='#050505' strokeWidth='2.2' strokeLinecap='round' />
						<ellipse cx='47.7' cy={rightEyeY} rx='2.7' ry='2.3' fill='#15171C' />
						<circle cx='46.9' cy='33.7' r='0.9' fill='#FFFFFF' />
					</>
				) : mood === 'smug' || mood === 'thinking' ? (
					<>
						<ellipse cx='32.3' cy={leftEyeY + 0.4} rx='2.6' ry='1.5' fill='#15171C' />
						<ellipse cx='47.7' cy={rightEyeY + 0.4} rx='2.6' ry='1.5' fill='#15171C' />
						<line x1='29.2' y1='33.2' x2='35.4' y2='33.2' stroke='#050505' strokeWidth='1.9' strokeLinecap='round' />
						<line x1='44.6' y1='33.2' x2='50.8' y2='33.2' stroke='#050505' strokeWidth='1.9' strokeLinecap='round' />
						<circle cx='31.6' cy='34.3' r='0.75' fill='#FFFFFF' />
						<circle cx='47' cy='34.3' r='0.75' fill='#FFFFFF' />
					</>
				) : (
					<>
						<ellipse
							cx='32.3'
							cy={leftEyeY}
							rx={isKid ? '2.9' : '2.6'}
							ry={isKid ? '2.6' : '2.1'}
							fill='#15171C'
						/>
						<ellipse
							cx='47.7'
							cy={rightEyeY}
							rx={isKid ? '2.9' : '2.6'}
							ry={isKid ? '2.6' : '2.1'}
							fill='#15171C'
						/>
						<path d='M29 33.4 Q32.3 31.5 35.6 33.5' fill='none' stroke='#050505' strokeWidth='1.7' strokeLinecap='round' />
						<path d='M44.4 33.5 Q47.7 31.5 51 33.4' fill='none' stroke='#050505' strokeWidth='1.7' strokeLinecap='round' />
						<circle cx='31.4' cy='33.7' r={isKid ? '1.05' : '0.85'} fill='#FFFFFF' />
						<circle cx='46.8' cy='33.7' r={isKid ? '1.05' : '0.85'} fill='#FFFFFF' />
					</>
				)}

				{/* Nose */}
				<path
					d='M40 34.5 V39.5 L42 40.5'
					fill='none'
					stroke='#050505'
					strokeWidth='1.7'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>

				{/* Mouth by Mood & Era */}
				{mood === 'shocked' ? (
					<ellipse cx='40' cy='45.4' rx='3.1' ry='2.6' fill='#181A20' stroke='#050505' strokeWidth='1.7' />
				) : mood === 'crying' ? (
					<path
						d='M34.8 46.2 Q37.4 43.4 40 45 Q42.6 43.4 45.2 46.2'
						fill='none'
						stroke='#050505'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				) : mood === 'curious' ? (
					<ellipse cx='40.6' cy='45.2' rx='1.9' ry='1.7' fill='#181A20' stroke='#050505' strokeWidth='1.5' />
				) : mood === 'sweating' ? (
					<path
						d='M35 45.2 L37.5 43.8 L40 45.4 L42.5 43.8 L45 45.2'
						fill='none'
						stroke='#050505'
						strokeWidth='1.85'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>
				) : mood === 'lose' ? (
					<path
						d='M35.5 46 Q40 42.6 44.5 46'
						fill='none'
						stroke='#050505'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				) : mood === 'thinking' ? (
					<path
						d='M36.5 44.8 H43.8'
						fill='none'
						stroke='#050505'
						strokeWidth='1.9'
						strokeLinecap='round'
					/>
				) : mood === 'determined' ? (
					<path
						d='M35 44.6 Q40 43.8 45.2 44.8'
						fill='none'
						stroke='#050505'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				) : mood === 'win' || mood === 'hyped' ? (
					<path
						d='M34.2 43.3 Q40 48.6 45.8 43.3 Z'
						fill='#FFFFFF'
						stroke='#050505'
						strokeWidth='1.8'
						strokeLinejoin='round'
					/>
				) : mood === 'smug' || mood === 'cheeky' ? (
					<path
						d='M35.4 45.2 Q41.5 47 46.2 42.6'
						fill='none'
						stroke='#050505'
						strokeWidth='2.1'
						strokeLinecap='round'
					/>
				) : (
					<path
						d='M34.8 44 Q40 47.2 45.4 43.8'
						fill='none'
						stroke='#050505'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				)}

				{/* Hair Front Silhouette Clearly Differentiated:
				    - Unc Kris: Real-photo signature dark wavy center-parted curtain bangs (young studio look)
				    - Teen Kris: Messy spiked forward fringe under headphone band
				    - Lil' Kris: Fluffy bangs under backwards baseball cap */}
				{isUnc ? (
					<>
						<path
							d='M20.8 32.2 C19.5 19.5, 25.5 9.8, 36.2 9.5 C38.6 9.5, 39.8 10.6, 40.5 11.4 C41.6 10.2, 43.2 9.5, 45.2 9.6 C55.2 10.2, 60.5 19.5, 59.2 32.2 C56.8 29.8, 55.2 26.8, 53.5 28.4 C50.5 30.2, 46.8 28.2, 43.4 25.8 C41.6 24.4, 40.8 22.2, 40.2 19.2 C39.4 22.5, 38.2 25.2, 36.2 26.8 C32.8 29.5, 29.2 30.2, 26.5 28.2 C24.8 27, 23.2 30, 20.8 32.2 Z'
							fill='#16181F'
							stroke='#050505'
							strokeWidth='2.6'
							strokeLinejoin='round'
						/>
						<path d='M25.5 19.2 C29.5 15.2, 34.5 15.8, 37.2 21' fill='none' stroke='#2F3542' strokeWidth='1.8' strokeLinecap='round' />
						<path d='M54.2 19.2 C50.2 15.2, 45.5 15.8, 42.8 21' fill='none' stroke='#2F3542' strokeWidth='1.8' strokeLinecap='round' />
					</>
				) : isTeen ? (
					<>
						<path
							d='M21 31.5 C19.5 21, 24.5 12, 35.5 11 C40.5 9.2, 47.5 9.8, 52.5 12.5 C59 15.5, 60.5 23, 59 31.5 C55.8 29, 53.5 25.5, 50.8 27.5 C47.5 30, 44 26, 42 29.5 C39.5 25.5, 36.8 29.8, 33.8 27.2 C30.8 30.2, 27.2 26.5, 25 28.5 C23.2 29.8, 22.2 30.8, 21 31.5 Z'
							fill='#181A20'
							stroke='#050505'
							strokeWidth='2.6'
							strokeLinejoin='round'
						/>
						<path d='M27.5 18 C31.5 15, 36.5 15.2, 38.5 18' fill='none' stroke='#2F3542' strokeWidth='2' strokeLinecap='round' />
					</>
				) : (
					<path
						d='M21.5 31 C20 20.5, 25.5 11.5, 36.5 10.5 C41 8.8, 48 9.5, 52.5 12.5 C59 15.5, 61 23, 58.5 31.5 C56.2 28.5, 54.5 25, 51.8 24.5 C49.5 27.5, 45.8 29.2, 42.2 28.5 C41.5 25.2, 40.4 22.8, 39.2 20.5 C38 23.8, 36.2 27.6, 32.8 29.2 C29.8 29.8, 27 27.8, 25.2 25.5 C23.8 27.8, 22.8 29.6, 21.5 31 Z'
						fill='#181A20'
						stroke='#050505'
						strokeWidth='2.6'
						strokeLinejoin='round'
					/>
				)}

				{/* Backwards Coral Cap Crown (Lil' Kris / Bocil Kris) */}
				{isKid && (
					<>
						<path
							d='M21.5 23 C22 10.5, 32 7, 42 7.5 C52 8, 57.5 13.5, 58 22.5 C51 20, 44 19, 39.5 19.5 C34 19, 27 20, 21.5 23 Z'
							fill='#FD6141'
							stroke='#050505'
							strokeWidth='2.5'
							strokeLinejoin='round'
						/>
						<circle cx='39.5' cy='13.5' r='3' fill='#FFD426' stroke='#050505' strokeWidth='1.5' />
					</>
				)}

				<ExpressiveExtras mood={mood} />
			</g>
		</svg>
	);
};

/**
 * Expressive @digital_spaghetti Challenger Character Portrait
 * Reacts live to blunders, checks, good moves, leads, time scrambles, win & loss.
 */
export const ChallengerAvatar: FC<AvatarProps> = ({
	className = 'w-full h-full',
	mood = 'calm',
}) => (
	<svg viewBox='0 0 80 80' className={className} aria-hidden='true'>
		<defs>
			<pattern
				id='ds-challenger-dots'
				x='0'
				y='0'
				width='8'
				height='8'
				patternUnits='userSpaceOnUse'
				patternTransform='rotate(45)'
			>
				<rect width='8' height='8' fill='#5CE62E' />
				<circle cx='4' cy='4' r='1.5' fill='#39754F' />
			</pattern>
			<clipPath id='ds-challenger-frame'>
				<rect x='0' y='0' width='80' height='80' rx='6' />
			</clipPath>
		</defs>

		<g clipPath='url(#ds-challenger-frame)'>
			<rect width='80' height='80' fill='url(#ds-challenger-dots)' />
			<polygon points='0,52 80,64 80,80 0,80' fill='#39754F' opacity='0.45' />

			{/* Vermilion Studio Jacket + Cream Collar */}
			<path
				d='M8 82 C10 62, 22 55, 30 53 H50 C58 55, 70 62, 72 82 Z'
				fill='#FD6141'
				stroke='#050505'
				strokeWidth='3'
				strokeLinejoin='round'
			/>
			<path d='M50 54.5 C58 56.5, 67.5 63, 69.5 80.5 H53 L47 55 Z' fill='#C5432F' />
			<path
				d='M30 53 L36 69 H44 L50 53 Z'
				fill='#FCF0D3'
				stroke='#050505'
				strokeWidth='2.4'
				strokeLinejoin='round'
			/>
			<path
				d='M29 53 L25 63 L33 65 L35.5 76'
				fill='#FFE7BF'
				stroke='#050505'
				strokeWidth='2.2'
				strokeLinejoin='round'
			/>
			<path
				d='M51 53 L55 63 L47 65 L44.5 76'
				fill='#FFE7BF'
				stroke='#050505'
				strokeWidth='2.2'
				strokeLinejoin='round'
			/>

			{/* Neck */}
			<path
				d='M34 45 V55 C38 58, 42 58, 46 55 V45 Z'
				fill='#F3C8A4'
				stroke='#050505'
				strokeWidth='2.6'
			/>

			{/* Hair Back */}
			<path
				d='M21 31 C20 17, 29 10, 40 10 C51 10, 60 17, 59 31 Z'
				fill='#3D241C'
				stroke='#050505'
				strokeWidth='2.8'
			/>

			{/* Ears */}
			<ellipse cx='23.5' cy='36' rx='3.2' ry='4.8' fill='#F3C8A4' stroke='#050505' strokeWidth='2.3' />
			<ellipse cx='56.5' cy='36' rx='3.2' ry='4.8' fill='#D59C74' stroke='#050505' strokeWidth='2.3' />

			{/* Head */}
			<path
				d='M25 27 C25 18.5, 55 18.5, 55 27 V36.5 C55 46, 48 51.5, 40 51.5 C32 51.5, 25 46, 25 36.5 Z'
				fill='#F3C8A4'
				stroke='#050505'
				strokeWidth='2.8'
				strokeLinejoin='round'
			/>
			<path
				d='M53.5 29 V36.5 C53.5 44.5, 47.5 49.5, 40 49.8 C46.2 48.2, 50 42.5, 50.2 35 V28.5 Z'
				fill='#D59C74'
			/>

			{/* Spiky Studio Hair Top */}
			<path
				d='M23.5 27 C22 18, 28 11, 37 10.5 L41 7 L44.5 11 C52.5 11.5, 58 17.5, 56.5 27 C52 22.8, 46 21, 39 22.5 C34 21, 28 22.5, 23.5 27 Z'
				fill='#5A3528'
				stroke='#050505'
				strokeWidth='2.6'
				strokeLinejoin='round'
			/>

			{/* Expressive Brows above glasses */}
			<path
				d={
					mood === 'shocked'
						? 'M27 27 Q32 24.5 36.5 27.2'
						: mood === 'curious'
							? 'M27 25.4 Q32 23.2 36.5 26.2'
							: mood === 'sweating' || mood === 'lose' || mood === 'crying'
								? 'M27 29.2 Q32 27.4 36.5 26.6'
								: mood === 'determined' || mood === 'hyped'
									? 'M27 26.8 Q32 28.2 36.5 29.4'
									: mood === 'smug' || mood === 'cheeky'
										? 'M27.2 26.6 Q32 25.2 36.5 27.6'
										: 'M27.5 27.8 Q32 26.8 36.5 27.8'
				}
				fill='none'
				stroke='#3D241C'
				strokeWidth='2'
				strokeLinecap='round'
			/>
			<path
				d={
					mood === 'shocked'
						? 'M43.5 27.2 Q48 24.5 53 27'
						: mood === 'curious'
							? 'M43.5 28.4 Q48 28 53 28.5'
							: mood === 'sweating' || mood === 'lose' || mood === 'crying'
								? 'M43.5 26.6 Q48 27.4 53 29.2'
								: mood === 'determined' || mood === 'hyped'
									? 'M43.5 29.4 Q48 28.2 53 26.8'
									: mood === 'smug' || mood === 'cheeky'
										? 'M43.5 28.2 Q48 27.5 53 28.4'
										: 'M43.5 27.8 Q48 26.8 52.5 27.8'
				}
				fill='none'
				stroke='#3D241C'
				strokeWidth='2'
				strokeLinecap='round'
			/>

			{/* Iconic @digital_spaghetti Square Glasses + Mood Pupils / Expressions */}
			<g>
				<rect
					x='26.2'
					y='29.2'
					width='11.8'
					height='9.2'
					rx='2.2'
					fill='#FFFFFF'
					fillOpacity={mood === 'shocked' ? '0.68' : '0.32'}
					stroke='#050505'
					strokeWidth='2.4'
				/>
				<rect
					x='42'
					y='29.2'
					width='11.8'
					height='9.2'
					rx='2.2'
					fill='#FFFFFF'
					fillOpacity={mood === 'shocked' ? '0.68' : '0.32'}
					stroke='#050505'
					strokeWidth='2.4'
				/>
				<line x1='38' y1='33' x2='42' y2='33' stroke='#050505' strokeWidth='2.4' />

				{mood === 'win' ? (
					<>
						<path d='M29 35.2 Q32.2 31.6 35.2 35.2' fill='none' stroke='#050505' strokeWidth='2.1' strokeLinecap='round' />
						<path d='M44.8 35.2 Q47.9 31.6 51 35.2' fill='none' stroke='#050505' strokeWidth='2.1' strokeLinecap='round' />
					</>
				) : mood === 'crying' ? (
					<>
						<circle cx='32.5' cy='34.3' r='2' fill='#050505' />
						<circle cx='47.5' cy='34.3' r='2' fill='#050505' />
						<path d='M29.4 36.4 Q32.5 37.8 35.4 36.4' fill='none' stroke='#74B9FF' strokeWidth='1.6' strokeLinecap='round' />
						<path d='M44.6 36.4 Q47.5 37.8 50.6 36.4' fill='none' stroke='#74B9FF' strokeWidth='1.6' strokeLinecap='round' />
					</>
				) : mood === 'curious' ? (
					<>
						<circle cx='32.8' cy='33.3' r='2' fill='#050505' />
						<circle cx='47.6' cy='33.8' r='1.7' fill='#050505' />
					</>
				) : mood === 'cheeky' ? (
					<>
						<path d='M29.2 34.8 Q32.2 32.2 35.2 34.8' fill='none' stroke='#050505' strokeWidth='2' strokeLinecap='round' />
						<circle cx='47.5' cy='34' r='1.85' fill='#050505' />
					</>
				) : mood === 'shocked' ? (
					<>
						<circle cx='32.1' cy='33.8' r='1.2' fill='#050505' />
						<circle cx='47.9' cy='33.8' r='1.2' fill='#050505' />
					</>
				) : mood === 'thinking' || mood === 'smug' ? (
					<>
						<ellipse cx='32.5' cy='34.2' rx='2' ry='1.2' fill='#050505' />
						<ellipse cx='47.5' cy='34.2' rx='2' ry='1.2' fill='#050505' />
					</>
				) : (
					<>
						<circle cx='32.5' cy='34' r='1.8' fill='#050505' />
						<circle cx='47.5' cy='34' r='1.8' fill='#050505' />
					</>
				)}

				{/* Specular Diagonal Lens Glints */}
				<line x1='28.2' y1='36.4' x2='32.4' y2='31' stroke='#FFFFFF' strokeWidth='1.9' strokeLinecap='round' />
				<line x1='44' y1='36.4' x2='48.2' y2='31' stroke='#FFFFFF' strokeWidth='1.9' strokeLinecap='round' />
			</g>

			{/* Nose */}
			<path d='M40 35.5 V39.8 L41.5 40.6' fill='none' stroke='#050505' strokeWidth='1.7' strokeLinecap='round' />

			{/* Mouth by Mood */}
			{mood === 'shocked' ? (
				<ellipse cx='40' cy='45.4' rx='3' ry='2.5' fill='#181A20' stroke='#050505' strokeWidth='1.7' />
			) : mood === 'crying' ? (
				<path
					d='M34.8 46.2 Q37.4 43.4 40 45 Q42.6 43.4 45.2 46.2'
					fill='none'
					stroke='#050505'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			) : mood === 'curious' ? (
				<ellipse cx='40.6' cy='45.2' rx='1.85' ry='1.6' fill='#181A20' stroke='#050505' strokeWidth='1.5' />
			) : mood === 'sweating' ? (
				<path
					d='M35 45.2 L37.5 43.8 L40 45.4 L42.5 43.8 L45 45.2'
					fill='none'
					stroke='#050505'
					strokeWidth='1.85'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			) : mood === 'lose' ? (
				<path d='M35.5 46 Q40 42.6 44.5 46' fill='none' stroke='#050505' strokeWidth='2' strokeLinecap='round' />
			) : mood === 'thinking' ? (
				<path d='M36.8 44.8 H43.8' fill='none' stroke='#050505' strokeWidth='1.9' strokeLinecap='round' />
			) : mood === 'determined' ? (
				<path d='M35 44.6 Q40 43.8 45.2 44.8' fill='none' stroke='#050505' strokeWidth='2' strokeLinecap='round' />
			) : mood === 'win' || mood === 'hyped' ? (
				<path
					d='M34.2 43.3 Q40 48.5 45.8 43.3 Z'
					fill='#FFFFFF'
					stroke='#050505'
					strokeWidth='1.8'
					strokeLinejoin='round'
				/>
			) : mood === 'smug' || mood === 'cheeky' ? (
				<path d='M35.5 45 Q41.5 47 46 42.6' fill='none' stroke='#050505' strokeWidth='2.1' strokeLinecap='round' />
			) : (
				<path d='M35.5 44.2 Q40.5 46.5 45 43.6' fill='none' stroke='#050505' strokeWidth='2' strokeLinecap='round' />
			)}

			<ExpressiveExtras mood={mood} />
		</g>
	</svg>
);

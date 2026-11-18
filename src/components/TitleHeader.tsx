import { type ReactNode } from 'react';
import { SparkleStar } from './SpaghettiArt';

export interface TitleHeaderProps {
	title: string;
	sub: string;
	figCode?: string;
	description?: string;
	bullets?: string[];
	align?: 'left' | 'center';
	badgeColor?: 'red' | 'blue' | 'yellow' | 'green' | 'cream';
	onDarkMat?: boolean;
	rightSlot?: ReactNode;
}

const BADGE_BG = {
	red: 'bg-[#FD6141] text-[#050505]',
	blue: 'bg-[#4D9DE0] text-[#050505]',
	yellow: 'bg-[#FFD426] text-[#050505]',
	green: 'bg-[#5CE62E] text-[#050505]',
	cream: 'bg-[#FCF0D3] text-[#050505]',
} as const;

const TitleHeader = ({
	title,
	sub,
	figCode,
	description,
	bullets,
	align = 'left',
	badgeColor = 'cream',
	onDarkMat = false,
	rightSlot,
}: TitleHeaderProps) => {
	const alignCls =
		align === 'center'
			? 'items-center text-center mx-auto'
			: 'items-start text-left';

	return (
		<div className='flex flex-col lg:flex-row lg:items-end justify-between gap-6'>
			<div className={`flex flex-col gap-3.5 max-w-3xl ${alignCls}`}>
				<div className='flex flex-wrap items-center gap-2'>
					{figCode && (
						<span className='inline-flex items-center px-2.5 py-0.5 rounded-none bg-[#050505] text-[#FFD426] font-mono text-xs font-black tracking-wide select-none'>
							{figCode}
						</span>
					)}
					<div
						className={`inline-flex items-center gap-2 rounded-sm border border-[#050505]/70 px-3 py-0.5 text-xs font-mono font-extrabold uppercase tracking-wider select-none ${BADGE_BG[badgeColor]}`}
					>
						<span className='size-1.5 rounded-full bg-[#050505] inline-block' />
						<span>{sub}</span>
					</div>
				</div>

				<div className='relative'>
					<h2
						className={`font-display font-black text-3xl sm:text-4xl md:text-5xl leading-[1.08] tracking-tight ${
							onDarkMat
								? 'text-[#FCF0D3] drop-shadow-[4px_4px_0_#050505]'
								: 'text-[#050505]'
						}`}
					>
						{title}
					</h2>
					<SparkleStar
						className='hidden sm:block absolute -top-4 -right-9 size-6 pointer-events-none'
						fill='#FFD426'
					/>
				</div>

				{bullets && bullets.length > 0 && (
					<div
						className={`flex flex-wrap gap-2 pt-0.5 ${
							align === 'center' ? 'justify-center' : ''
						}`}
					>
						{bullets.map((bullet) => (
							<span
								key={bullet}
								className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm border border-dashed text-xs font-mono font-bold select-none ${
									onDarkMat
										? 'border-[#FCF0D3]/55 bg-[#050505]/30 text-[#FCF0D3]'
										: 'border-[#050505]/45 bg-[#FCF0D3]/80 text-[#050505]'
								}`}
							>
								<span className='text-[#FD6141]' aria-hidden='true'>
									◆
								</span>
								{bullet}
							</span>
						))}
					</div>
				)}

				{description && (
					<p
						className={`text-sm md:text-base leading-relaxed max-w-2xl font-medium ${
							onDarkMat ? 'text-[#FAF3CF]' : 'text-[#2C313A]'
						}`}
					>
						{description}
					</p>
				)}
			</div>

			{rightSlot && <div className='shrink-0'>{rightSlot}</div>}
		</div>
	);
};

export default TitleHeader;

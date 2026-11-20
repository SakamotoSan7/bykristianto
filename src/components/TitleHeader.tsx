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

const DOT_ACCENT = {
	red: 'bg-[#FD6141]',
	blue: 'bg-[#4D9DE0]',
	yellow: 'bg-[#FFD426]',
	green: 'bg-[#5CE62E]',
	cream: 'bg-[#FD6141]',
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
			<div className={`flex flex-col gap-3 max-w-2xl ${alignCls}`}>
				<div className='inline-flex flex-wrap items-center gap-2.5 select-none'>
					{figCode && (
						<span
							className={`inline-flex items-center px-2 py-0.5 rounded-[3px] font-mono text-[11px] font-black tracking-wide ${
								onDarkMat
									? 'bg-[#FFD426] text-[#050505]'
									: 'bg-[#050505] text-[#FFD426]'
							}`}
						>
							{figCode}
						</span>
					)}
					<div
						className={`inline-flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider ${
							onDarkMat ? 'text-[#FAF3CF]/90' : 'text-[#3B404C]'
						}`}
					>
						<span
							className={`size-2 rounded-full border border-[#050505] inline-block shrink-0 ${DOT_ACCENT[badgeColor]}`}
							aria-hidden='true'
						/>
						<span>{sub}</span>
					</div>
				</div>

				<div className='relative w-fit max-w-full'>
					<h2
						className={`font-display font-black text-3xl sm:text-4xl md:text-[44px] leading-[1.06] tracking-tight ${
							onDarkMat
								? 'text-[#FCF0D3] drop-shadow-[3px_3px_0_#050505]'
								: 'text-[#050505]'
						}`}
					>
						{title}
					</h2>
					<SparkleStar
						className='hidden sm:block absolute -top-3 -right-8 size-5 pointer-events-none'
						fill='#FFD426'
					/>
				</div>

				{bullets && bullets.length > 0 && (
					<div
						className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-0.5 font-mono text-xs font-bold select-none ${
							align === 'center' ? 'justify-center' : ''
						} ${onDarkMat ? 'text-[#FAF3CF]/85' : 'text-[#3B404C]'}`}
					>
						{bullets.map((bullet, idx) => (
							<span key={bullet} className='inline-flex items-center gap-2'>
								{idx > 0 && (
									<span
										className={onDarkMat ? 'text-[#FFD426]/65' : 'text-[#050505]/30'}
										aria-hidden='true'
									>
										·
									</span>
								)}
								<span>{bullet}</span>
							</span>
						))}
					</div>
				)}

				{description && (
					<p
						className={`text-sm md:text-base leading-relaxed max-w-xl font-medium ${
							onDarkMat ? 'text-[#FAF3CF]/90' : 'text-[#2C313A]'
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

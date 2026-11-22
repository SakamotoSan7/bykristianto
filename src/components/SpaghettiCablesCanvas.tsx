import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/useLanguage';
import { useSound } from '../context/useSound';
import { isPageScrollLocked } from '../utils/scrollLock';

interface Point {
	x: number;
	y: number;
	ox: number;
	oy: number;
	pinned?: boolean;
}

interface BoxRect {
	left: number;
	right: number;
	top: number;
	bottom: number;
	width: number;
	height: number;
}

interface EndpointSpec {
	ax: number;
	ay: number;
	bx: number;
	by: number;
	sag: number;
}

interface StrandDef {
	id: string;
	color: string;
	tag: string;
	freq: number;
	weight: number;
	swayDir: number;
	preferredT: [number, number];
	pinA: { rx: number; ry: number; label: string };
	pinB: { rx: number; ry: number; label: string };
	sag: number;
}

interface Strand {
	id: string;
	color: string;
	tag: string;
	weight: number;
	swayDir: number;
	preferredT: [number, number];
	endpoint: EndpointSpec;
	points: Point[];
	segLen: number;
	tagIdx: number;
	smoothAngle: number;
}

interface SpaghettiCablesCanvasProps {
	pluckedCountRef?: { current: number };
	onPluck?: (label: string) => void;
}

const STRAND_DEFS: StrandDef[] = [
	{
		id: 'strand-red',
		color: '#FD6141',
		tag: 'STORY',
		freq: 261.63,
		weight: 1.06,
		swayDir: 1,
		preferredT: [0.22, 0.40],
		pinA: { rx: 0.53, ry: 0.22, label: 'STORY IN' },
		pinB: { rx: 0.96, ry: 0.29, label: 'SCRIPT OUT' },
		sag: 54,
	},
	{
		id: 'strand-blue',
		color: '#3886C0',
		tag: 'MOTION',
		freq: 329.63,
		weight: 0.94,
		swayDir: -1,
		preferredT: [0.24, 0.42],
		pinA: { rx: 0.58, ry: 0.34, label: 'MOTION' },
		pinB: { rx: 0.93, ry: 0.50, label: 'FINAL CUT' },
		sag: 52,
	},
	{
		id: 'strand-yellow',
		color: '#FFD426',
		tag: 'SOUND',
		freq: 392.0,
		weight: 0.88,
		swayDir: 1,
		preferredT: [0.42, 0.72],
		pinA: { rx: 0.54, ry: 0.72, label: 'AUDIO / SFX' },
		pinB: { rx: 0.96, ry: 0.85, label: 'CLEAR MIX' },
		sag: 30,
	},
	{
		id: 'strand-green',
		color: '#5CE62E',
		tag: 'CODE',
		freq: 587.33,
		weight: 1.12,
		swayDir: -1,
		preferredT: [0.60, 0.78],
		pinA: { rx: 0.79, ry: 0.16, label: 'WEB CODE' },
		pinB: { rx: 0.93, ry: 0.49, label: 'LIVE SITE' },
		sag: 46,
	},
];

// Place Red -> Green -> Blue -> Yellow when choosing obstacle-free collar tags
const TAG_PLACEMENT_ORDER = [0, 3, 1, 2] as const;

const POINT_COUNT = 20;
const GRAVITY = 0.48;
const DAMPING = 0.94;
const PRE_SETTLE_DAMPING = 0.80;
const CONSTRAINT_ITERS = 10;

const boxesOverlap = (a: BoxRect, b: BoxRect): boolean =>
	a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const padBox = (box: BoxRect, padX: number, padY: number): BoxRect => ({
	left: box.left - padX,
	right: box.right + padX,
	top: box.top - padY,
	bottom: box.bottom + padY,
	width: box.width + padX * 2,
	height: box.height + padY * 2,
});

const measureUnshiftedRect = (
	el: HTMLElement | null,
	canvasRect: DOMRect
): BoxRect | null => {
	if (!el) return null;
	const r = el.getBoundingClientRect();
	if (r.width === 0 && r.height === 0) return null;

	// Strip active CSS transform translation (e.g. GSAP entrance y: 12 -> 0) so
	// cable pins lock onto the resting layout immediately on frame 1 without snapping.
	let tx = 0;
	let ty = 0;
	const transform = window.getComputedStyle(el).transform;
	if (transform && transform !== 'none' && typeof DOMMatrixReadOnly !== 'undefined') {
		try {
			const matrix = new DOMMatrixReadOnly(transform);
			tx = matrix.m41;
			ty = matrix.m42;
		} catch {
			// Ignore malformed transform values
		}
	}

	const left = r.left - tx - canvasRect.left;
	const top = r.top - ty - canvasRect.top;
	return {
		left,
		right: left + r.width,
		top,
		bottom: top + r.height,
		width: r.width,
		height: r.height,
	};
};

const computeEndpointSpec = (
	sIdx: number,
	width: number,
	height: number,
	copyRect: BoxRect | null,
	h1Rect: BoxRect | null,
	bayRect: BoxRect | null,
	cardRect: BoxRect | null
): EndpointSpec => {
	const isStacked = bayRect !== null || !window.matchMedia('(min-width: 1024px)').matches;
	const isTablet = isStacked && window.matchMedia('(min-width: 640px)').matches;

	if (isStacked && bayRect) {
		const bL = bayRect.left;
		const bR = bayRect.right;
		const bW = bayRect.width;
		const bT = bayRect.top;
		const bH = bayRect.height;

		// 4 staggered lanes strictly inside the dedicated Hero bay above PATCH_CORDS.PHYSICS
		if (sIdx === 0) {
			return {
				ax: bL + bW * 0.03,
				ay: bT + bH * 0.08,
				bx: bR - bW * 0.14,
				by: bT + bH * 0.15,
				sag: isTablet ? 18 : 16,
			};
		}
		if (sIdx === 3) {
			return {
				ax: bL + bW * 0.40,
				ay: bT + bH * 0.10,
				bx: bR - bW * 0.02,
				by: bT + bH * 0.32,
				sag: isTablet ? 16 : 16,
			};
		}
		if (sIdx === 1) {
			return {
				ax: bL + bW * 0.04,
				ay: bT + bH * 0.35,
				bx: bR - bW * 0.32,
				by: bT + bH * 0.45,
				sag: isTablet ? 16 : 16,
			};
		}
		// Yellow (SOUND) hangs cleanly in the bottom bay lane, leaving full belly & tag clear above card
		return {
			ax: bL + bW * 0.10,
			ay: bT + bH * 0.56,
			bx: bR - bW * 0.02,
			by: bT + bH * 0.64,
			sag: isTablet ? 16 : 16,
		};
	}

	if (!isStacked && copyRect && cardRect) {
		const leftBarrier = Math.max(copyRect.right, h1Rect ? h1Rect.right : 0);
		const safeTop = Math.max(108, copyRect.top + 4);
		const stageLeft = Math.max(leftBarrier + 20, width * 0.56);
		const stageRight = Math.min(width - 20, Math.max(cardRect.right + 16, stageLeft + 340));
		const stageW = Math.max(240, stageRight - stageLeft);
		const upperBottom = Math.max(safeTop + 145, cardRect.top - 30);

		if (sIdx === 0) {
			return {
				ax: stageLeft + 8,
				ay: safeTop + 8,
				bx: stageRight - 8,
				by: safeTop + 44,
				sag: 54,
			};
		}
		if (sIdx === 3) {
			return {
				ax: stageLeft + stageW * 0.44,
				ay: safeTop + 2,
				bx: stageRight - 6,
				by: Math.min(upperBottom - 26, safeTop + 150),
				sag: 46,
			};
		}
		if (sIdx === 1) {
			return {
				ax: stageLeft + 10,
				ay: safeTop + (upperBottom - safeTop) * 0.42,
				bx: stageRight - stageW * 0.14,
				by: upperBottom - 10,
				sag: 52,
			};
		}
		// Yellow (SOUND) drapes cleanly below PATCH_CORDS.PHYSICS and above Hero bottom border
		const yellowLeft = Math.max(leftBarrier + 16, cardRect.left - 18);
		const yellowRight = Math.min(width - 18, cardRect.right + 12);
		const yellowTop = Math.min(height - 52, cardRect.bottom + 10);
		return {
			ax: yellowLeft,
			ay: yellowTop,
			bx: Math.max(yellowLeft + 180, yellowRight),
			by: Math.min(height - 46, yellowTop + 4),
			sag: 24,
		};
	}

	const def = STRAND_DEFS[sIdx];
	return {
		ax: def.pinA.rx * width,
		ay: def.pinA.ry * height,
		bx: def.pinB.rx * width,
		by: def.pinB.ry * height,
		sag: def.sag,
	};
};

const computeSegmentLength = ({ ax, ay, bx, by, sag }: EndpointSpec): number =>
	(Math.hypot(bx - ax, by - ay) + sag) / (POINT_COUNT - 1);

const relaxConstraints = (pts: Point[], segLen: number) => {
	for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
		for (let i = 0; i < pts.length - 1; i++) {
			const p1 = pts[i];
			const p2 = pts[i + 1];
			const dx = p2.x - p1.x;
			const dy = p2.y - p1.y;
			const d = Math.hypot(dx, dy) || 0.0001;
			const diff = (d - segLen) / d;
			if (p1.pinned && p2.pinned) continue;
			if (p1.pinned) {
				p2.x -= dx * diff;
				p2.y -= dy * diff;
			} else if (p2.pinned) {
				p1.x += dx * diff;
				p1.y += dy * diff;
			} else {
				p1.x += dx * diff * 0.5;
				p1.y += dy * diff * 0.5;
				p2.x -= dx * diff * 0.5;
				p2.y -= dy * diff * 0.5;
			}
		}
	}
};

const preSettleStrands = (strands: Strand[]) => {
	// Converge well past initial droop and clear residual momentum so reload starts motionless
	for (let step = 0; step < 96; step++) {
		for (const strand of strands) {
			const pts = strand.points;
			for (let i = 0; i < pts.length; i++) {
				const p = pts[i];
				if (p.pinned) continue;
				const vx = (p.x - p.ox) * PRE_SETTLE_DAMPING;
				const vy = (p.y - p.oy) * PRE_SETTLE_DAMPING;
				p.ox = p.x;
				p.oy = p.y;
				p.x += vx;
				p.y += vy + GRAVITY;
			}
			relaxConstraints(pts, strand.segLen);
		}
	}

	for (const strand of strands) {
		for (const p of strand.points) {
			p.ox = p.x;
			p.oy = p.y;
		}
	}
};

const getTagDimensions = (
	ctx: CanvasRenderingContext2D,
	label: string,
	isMobile: boolean
): { bw: number; bh: number; font: string } => {
	const font = isMobile
		? '800 9px "JetBrains Mono", monospace'
		: '800 10px "JetBrains Mono", monospace';
	ctx.font = font;
	const tw = ctx.measureText(label).width;
	return {
		bw: tw + (isMobile ? 14 : 18),
		bh: isMobile ? 19 : 21,
		font,
	};
};

const assignTagAnchors = (
	strands: Strand[],
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	obstacles: BoxRect[],
	safeTop: number
) => {
	const isMobile = width < 768;
	const placedBoxes: BoxRect[] = [];

	for (const sIdx of TAG_PLACEMENT_ORDER) {
		const strand = strands[sIdx];
		if (!strand) continue;

		const pts = strand.points;
		const { bw, bh } = getTagDimensions(ctx, strand.tag, isMobile);
		const [tMin, tMax] = strand.preferredT;
		const tCenter = (tMin + tMax) * 0.5;
		const minIdx = Math.max(3, Math.floor((POINT_COUNT - 1) * 0.16));
		const maxIdx = Math.min(POINT_COUNT - 4, Math.ceil((POINT_COUNT - 1) * 0.84));

		let bestIdx = Math.round((POINT_COUNT - 1) * tCenter);
		let bestScore = Infinity;

		for (let i = minIdx; i <= maxIdx; i++) {
			const pt = pts[i];
			const pPrev = pts[Math.max(0, i - 2)];
			const pNext = pts[Math.min(pts.length - 1, i + 2)];
			const slope =
				Math.abs(pNext.y - pPrev.y) / Math.max(1, Math.abs(pNext.x - pPrev.x));
			const t = i / (POINT_COUNT - 1);

			const box: BoxRect = {
				left: pt.x - bw * 0.5 - 2,
				right: pt.x + bw * 0.5 + 5,
				top: pt.y - bh * 0.5 - 2,
				bottom: pt.y + bh * 0.5 + 5,
				width: bw + 7,
				height: bh + 7,
			};

			let penalty = slope * 45;
			if (t < tMin || t > tMax) {
				const distOut = t < tMin ? tMin - t : t - tMax;
				penalty += 220 + distOut * 600;
			} else {
				penalty += Math.abs(t - tCenter) * 40;
			}

			// Hard penalty for clipping out of visible hero canvas / under navbar
			if (
				box.left < 6 ||
				box.right > width - 6 ||
				box.top < safeTop ||
				box.bottom > height - 6
			) {
				penalty += 10000;
			}

			for (const obs of obstacles) {
				if (boxesOverlap(box, obs)) {
					penalty += 10000;
				}
			}

			for (const placed of placedBoxes) {
				if (boxesOverlap(box, placed)) {
					penalty += 10000;
				}
			}

			if (penalty < bestScore) {
				bestScore = penalty;
				bestIdx = i;
			}
		}

		strand.tagIdx = bestIdx;
		const chosenPt = pts[bestIdx];
		placedBoxes.push({
			left: chosenPt.x - bw * 0.5 - 8,
			right: chosenPt.x + bw * 0.5 + 10,
			top: chosenPt.y - bh * 0.5 - 6,
			bottom: chosenPt.y + bh * 0.5 + 8,
			width: bw + 18,
			height: bh + 14,
		});

		const pPrev = pts[Math.max(0, bestIdx - 2)];
		const pNext = pts[Math.min(pts.length - 1, bestIdx + 2)];
		const rawInitAngle = Math.atan2(pNext.y - pPrev.y, pNext.x - pPrev.x);
		strand.smoothAngle = Math.max(-0.22, Math.min(0.22, rawInitAngle));
	}
};

const drawSpline = (
	ctx: CanvasRenderingContext2D,
	pts: Point[],
	offsetX = 0,
	offsetY = 0
) => {
	ctx.beginPath();
	ctx.moveTo(pts[0].x + offsetX, pts[0].y + offsetY);
	for (let i = 1; i < pts.length - 1; i++) {
		const xc = (pts[i].x + pts[i + 1].x) * 0.5 + offsetX;
		const yc = (pts[i].y + pts[i + 1].y) * 0.5 + offsetY;
		ctx.quadraticCurveTo(pts[i].x + offsetX, pts[i].y + offsetY, xc, yc);
	}
	const last = pts[pts.length - 1];
	ctx.lineTo(last.x + offsetX, last.y + offsetY);
};

const drawGrommetPin = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	color: string
) => {
	ctx.save();
	ctx.beginPath();
	ctx.arc(x + 3, y + 3, 9, 0, Math.PI * 2);
	ctx.fillStyle = '#050505';
	ctx.fill();

	ctx.beginPath();
	ctx.arc(x, y, 9, 0, Math.PI * 2);
	ctx.fillStyle = color;
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#050505';
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(x, y, 3.2, 0, Math.PI * 2);
	ctx.fillStyle = '#FCF0D3';
	ctx.fill();
	ctx.lineWidth = 1.8;
	ctx.stroke();
	ctx.restore();
};

/**
 * Interactive Verlet Physics Studio Patch Cords & Loose Ink Strands.
 * Displays 4 labeled cords (`STORY`, `MOTION`, `SOUND`, `CODE`) with obstacle-free tag boxes,
 * zero-snap resize/scroll stability, and Newtonian scroll inertia.
 */
const SpaghettiCablesCanvas = ({ onPluck }: SpaghettiCablesCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const hintRef = useRef<HTMLDivElement | null>(null);
	const { t } = useLanguage();
	const { playPluck, audioNeedsUnlock } = useSound();
	const playPluckRef = useRef(playPluck);
	playPluckRef.current = playPluck;
	const onPluckRef = useRef(onPluck);
	onPluckRef.current = onPluck;
	const audioNeedsUnlockRef = useRef(audioNeedsUnlock);

	useEffect(() => {
		audioNeedsUnlockRef.current = audioNeedsUnlock;
		if (!audioNeedsUnlock && hintRef.current) {
			hintRef.current.style.opacity = '0';
		}
	}, [audioNeedsUnlock]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let width = 0;
		let height = 0;
		let dpr = 1;
		let rafId = 0;
		let isVisible = true;
		let disposed = false;

		let lastScrollY = window.scrollY;
		let smoothScrollVel = 0;
		let prevSmoothScrollVel = 0;
		let lastFrameMs = 0;

		const pointer = {
			x: -9999,
			y: -9999,
			px: -9999,
			py: -9999,
			vx: 0,
			vy: 0,
			active: false,
		};

		let strands: Strand[] = [];

		const buildFreshStrands = (
			nextW: number,
			nextH: number,
			endpoints: EndpointSpec[],
			obstacles: BoxRect[],
			safeTop: number
		) => {
			strands = STRAND_DEFS.map((def, sIdx) => {
				const ep = endpoints[sIdx];
				const segLen = computeSegmentLength(ep);
				const pts: Point[] = [];
				for (let i = 0; i < POINT_COUNT; i++) {
					const t = i / (POINT_COUNT - 1);
					const x = ep.ax + (ep.bx - ep.ax) * t;
					const y = ep.ay + (ep.by - ep.ay) * t + Math.sin(t * Math.PI) * ep.sag * 0.6;
					pts.push({
						x,
						y,
						ox: x,
						oy: y,
						pinned: i === 0 || i === POINT_COUNT - 1,
					});
				}
				return {
					id: def.id,
					color: def.color,
					tag: def.tag,
					weight: def.weight,
					swayDir: def.swayDir,
					preferredT: def.preferredT,
					endpoint: ep,
					points: pts,
					segLen,
					tagIdx: Math.floor(POINT_COUNT * 0.36),
					smoothAngle: 0,
				};
			});

			preSettleStrands(strands);
			assignTagAnchors(strands, ctx, nextW, nextH, obstacles, safeTop);
		};

		const drawStrandsAndTags = () => {
			ctx.clearRect(0, 0, width, height);
			const isMobile = width < 768;

			for (const strand of strands) {
				const pts = strand.points;
				if (pts.length < 2) continue;

				ctx.save();
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';

				drawSpline(ctx, pts, 4, 5);
				ctx.strokeStyle = 'rgba(5, 5, 5, 0.28)';
				ctx.lineWidth = isMobile ? 7.5 : 10.5;
				ctx.stroke();

				drawSpline(ctx, pts, 0, 0);
				ctx.strokeStyle = '#050505';
				ctx.lineWidth = isMobile ? 8 : 11;
				ctx.stroke();

				drawSpline(ctx, pts, 0, 0);
				ctx.strokeStyle = strand.color;
				ctx.lineWidth = isMobile ? 4 : 5.8;
				ctx.stroke();

				drawGrommetPin(ctx, pts[0].x, pts[0].y, strand.color);
				drawGrommetPin(ctx, pts[pts.length - 1].x, pts[pts.length - 1].y, '#FCF0D3');
				ctx.restore();
			}

			if (width < 300) return;

			for (const strand of strands) {
				const pts = strand.points;
				if (pts.length < 4) continue;

				const mp = pts[strand.tagIdx];
				const pPrev = pts[Math.max(0, strand.tagIdx - 2)];
				const pNext = pts[Math.min(pts.length - 1, strand.tagIdx + 2)];
				const rawAngle = Math.atan2(pNext.y - pPrev.y, pNext.x - pPrev.x);
				const maxTilt = 0.24;
				const targetAngle = Math.max(-maxTilt, Math.min(maxTilt, rawAngle));
				strand.smoothAngle += (targetAngle - strand.smoothAngle) * 0.22;

				const { bw, bh, font } = getTagDimensions(ctx, strand.tag, isMobile);

				ctx.save();
				ctx.translate(mp.x, mp.y);
				ctx.rotate(strand.smoothAngle);
				ctx.font = font;

				ctx.fillStyle = '#050505';
				ctx.fillRect(-bw * 0.5 + 3, -bh * 0.5 + 3, bw, bh);
				ctx.fillStyle = '#FCF0D3';
				ctx.fillRect(-bw * 0.5, -bh * 0.5, bw, bh);
				ctx.lineWidth = 2;
				ctx.strokeStyle = '#050505';
				ctx.strokeRect(-bw * 0.5, -bh * 0.5, bw, bh);

				ctx.fillStyle = '#050505';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(strand.tag, 0, 1);
				ctx.restore();
			}
		};

		const syncLayout = () => {
			if (disposed) return;
			const rect = canvas.getBoundingClientRect();
			const nextW = Math.max(300, rect.width);
			const nextH = Math.max(300, rect.height);
			const nextDpr = Math.min(window.devicePixelRatio || 1, 2);

			const heroEl = canvas.closest('[data-hero-stage]') as HTMLElement | null;
			const copyRect = measureUnshiftedRect(
				heroEl?.querySelector('[data-hero-copy]') as HTMLElement | null,
				rect
			);
			const h1Rect = measureUnshiftedRect(
				heroEl?.querySelector('h1') as HTMLElement | null,
				rect
			);
			const bayRect = measureUnshiftedRect(
				heroEl?.querySelector('[data-hero-bay]') as HTMLElement | null,
				rect
			);
			const cardRect = measureUnshiftedRect(
				heroEl?.querySelector('[data-hero-card]') as HTMLElement | null,
				rect
			);

			const isStacked = bayRect !== null || !window.matchMedia('(min-width: 1024px)').matches;
			const safeTop = isStacked
				? Math.max(8, (bayRect?.top ?? 8) - 4)
				: Math.max(96, copyRect ? copyRect.top - 4 : 96);

			const obstacles: BoxRect[] = [];
			if (copyRect) obstacles.push(padBox(copyRect, 8, 6));
			if (h1Rect) obstacles.push(padBox(h1Rect, 8, 6));
			if (cardRect) obstacles.push(padBox(cardRect, 10, 10));

			const nextEndpoints = STRAND_DEFS.map((_, sIdx) =>
				computeEndpointSpec(sIdx, nextW, nextH, copyRect, h1Rect, bayRect, cardRect)
			);

			// Also protect every strand's grommet pins so tags never sit over an eyelet
			for (const ep of nextEndpoints) {
				obstacles.push(
					{
						left: ep.ax - 18,
						right: ep.ax + 18,
						top: ep.ay - 18,
						bottom: ep.ay + 18,
						width: 36,
						height: 36,
					},
					{
						left: ep.bx - 18,
						right: ep.bx + 18,
						top: ep.by - 18,
						bottom: ep.by + 18,
						width: 36,
						height: 36,
					}
				);
			}

			const targetPxW = Math.round(nextW * nextDpr);
			const targetPxH = Math.round(nextH * nextDpr);
			const pixelSizeChanged =
				canvas.width !== targetPxW || canvas.height !== targetPxH;

			const maxEndpointDelta =
				strands.length === STRAND_DEFS.length
					? strands.reduce((maxD, strand, idx) => {
							const ep = nextEndpoints[idx];
							const prev = strand.endpoint;
							return Math.max(
								maxD,
								Math.abs(ep.ax - prev.ax),
								Math.abs(ep.ay - prev.ay),
								Math.abs(ep.bx - prev.bx),
								Math.abs(ep.by - prev.by),
								Math.abs(ep.sag - prev.sag)
							);
						}, 0)
					: Infinity;

			// Ignore harmless mobile URL-bar scroll resizes when hero & pin layout did not move
			if (!pixelSizeChanged && maxEndpointDelta <= 1.5 && strands.length === STRAND_DEFS.length) {
				return;
			}

			const majorDimensionChange =
				strands.length !== STRAND_DEFS.length ||
				Math.abs(nextW - width) > 24 ||
				Math.abs(nextH - height) > 48;

			width = nextW;
			height = nextH;
			dpr = nextDpr;

			if (pixelSizeChanged) {
				canvas.width = targetPxW;
				canvas.height = targetPxH;
			}
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			if (majorDimensionChange) {
				buildFreshStrands(nextW, nextH, nextEndpoints, obstacles, safeTop);
			} else {
				// Smooth in-place pin adjustment (e.g. EN/ID font wrap): avoids velocity wipe & jump
				strands.forEach((strand, idx) => {
					const nextEp = nextEndpoints[idx];
					const prevEp = strand.endpoint;
					const pts = strand.points;
					const dAx = nextEp.ax - prevEp.ax;
					const dAy = nextEp.ay - prevEp.ay;
					const dBx = nextEp.bx - prevEp.bx;
					const dBy = nextEp.by - prevEp.by;
					for (let i = 0; i < pts.length; i++) {
						const t = i / (pts.length - 1);
						const dx = dAx * (1 - t) + dBx * t;
						const dy = dAy * (1 - t) + dBy * t;
						pts[i].x += dx;
						pts[i].ox += dx;
						pts[i].y += dy;
						pts[i].oy += dy;
					}
					strand.endpoint = nextEp;
					strand.segLen = computeSegmentLength(nextEp);
					relaxConstraints(pts, strand.segLen);
				});
				assignTagAnchors(strands, ctx, nextW, nextH, obstacles, safeTop);
			}

			drawStrandsAndTags();
		};

		syncLayout();
		window.addEventListener('resize', syncLayout);

		if (document.fonts && typeof document.fonts.ready?.then === 'function') {
			void document.fonts.ready.then(() => {
				syncLayout();
			});
		}

		const heroStageEl = canvas.closest('[data-hero-stage]') as HTMLElement | null;
		const heroResizeObserver =
			heroStageEl && typeof ResizeObserver !== 'undefined'
				? new ResizeObserver((entries) => {
						const entry = entries[0];
						if (!entry) return;
						const nextW = Math.max(300, entry.contentRect.width);
						const nextH = Math.max(300, entry.contentRect.height);
						if (Math.abs(nextW - width) > 3 || Math.abs(nextH - height) > 12) {
							syncLayout();
						}
					})
				: null;
		if (heroResizeObserver && heroStageEl) {
			heroResizeObserver.observe(heroStageEl);
		}

		const CORD_INTERACT_RADIUS = 88;
		const HINT_DETECT_RADIUS = 96;
		const HINT_LINGER_RADIUS = 160;
		const HINT_HOLD_MS = 650;

		let lastClientX = -9999;
		let lastClientY = -9999;
		let lastPointerType = '';
		let lastOverBlockedUi = false;
		let cordInteractUntil = 0;

		const getMinCordDist = (x: number, y: number): number => {
			let minDist = Infinity;
			for (const strand of strands) {
				for (const pt of strand.points) {
					const d = Math.hypot(pt.x - x, pt.y - y);
					if (d < minDist) minDist = d;
				}
			}
			return minDist;
		};

		const showCordHint = (clientX: number, clientY: number) => {
			const hintEl = hintRef.current;
			if (!hintEl) return;
			const hintW = hintEl.offsetWidth || 240;
			const hintX = Math.min(window.innerWidth - hintW - 12, Math.max(12, clientX + 16));
			const hintY = Math.max(12, clientY - 36);
			hintEl.style.transform = `translate3d(${hintX}px, ${hintY}px, 0)`;
			hintEl.style.opacity = '1';
		};

		const hideCordHint = () => {
			cordInteractUntil = 0;
			if (hintRef.current) {
				hintRef.current.style.opacity = '0';
			}
		};

		const handlePointerMove = (e: PointerEvent) => {
			lastClientX = e.clientX;
			lastClientY = e.clientY;
			lastPointerType = e.pointerType;

			if (!isVisible) {
				hideCordHint();
				return;
			}
			const rect = canvas.getBoundingClientRect();
			const nx = e.clientX - rect.left;
			const ny = e.clientY - rect.top;
			if (nx < 0 || ny < 0 || nx > rect.width || ny > rect.height) {
				pointer.active = false;
				hideCordHint();
				return;
			}
			if (pointer.px < -500) {
				pointer.px = nx;
				pointer.py = ny;
			}
			pointer.vx = Math.max(-42, Math.min(42, nx - pointer.px));
			pointer.vy = Math.max(-42, Math.min(42, ny - pointer.py));
			pointer.px = nx;
			pointer.py = ny;
			pointer.x = nx;
			pointer.y = ny;
			pointer.active = true;

			const targetEl = e.target as HTMLElement | null;
			const overBlockedUi = Boolean(
				targetEl?.closest('button, a, [data-hero-card], [data-hero-copy]')
			);
			lastOverBlockedUi = overBlockedUi;

			if (audioNeedsUnlockRef.current && e.pointerType === 'mouse' && !overBlockedUi && hintRef.current) {
				const minDist = getMinCordDist(nx, ny);
				const now = performance.now();
				if (minDist < HINT_DETECT_RADIUS) {
					cordInteractUntil = now + HINT_HOLD_MS;
					showCordHint(e.clientX, e.clientY);
					return;
				}
				if (now < cordInteractUntil && minDist < HINT_LINGER_RADIUS) {
					showCordHint(e.clientX, e.clientY);
					return;
				}
			}
			hideCordHint();
		};

		const handlePointerDown = (e: PointerEvent) => {
			hideCordHint();
			if (!isVisible) return;
			const targetEl = e.target as HTMLElement | null;
			if (targetEl?.closest('button, a, [data-hero-card]')) return;

			const rect = canvas.getBoundingClientRect();
			const cx = e.clientX - rect.left;
			const cy = e.clientY - rect.top;
			if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;

			pointer.x = cx;
			pointer.y = cy;
			pointer.px = cx;
			pointer.py = cy;
			pointer.active = true;

			let bestIdx = -1;
			let bestDist = Infinity;

			strands.forEach((strand, sIdx) => {
				strand.points.forEach((p) => {
					const d = Math.hypot(p.x - cx, p.y - cy);
					if (d < bestDist) {
						bestDist = d;
						bestIdx = sIdx;
					}
					if (!p.pinned && d < 120) {
						const force = (1 - d / 120) * 28;
						p.oy -= force;
						p.ox -= (Math.random() - 0.5) * 14;
					}
				});
			});

			if (bestIdx >= 0 && bestDist < 120) {
				const pluckedLabel = strands[bestIdx].tag;
				playPluckRef.current(STRAND_DEFS[bestIdx].freq, true, bestIdx);
				if (onPluckRef.current) onPluckRef.current(pluckedLabel);
			}
		};

		const handlePointerUp = () => {
			pointer.active = false;
			pointer.vx = 0;
			pointer.vy = 0;
			pointer.px = -9999;
			pointer.py = -9999;
			hideCordHint();
		};

		window.addEventListener('pointermove', handlePointerMove, { passive: true });
		window.addEventListener('pointerdown', handlePointerDown, { passive: true });
		window.addEventListener('pointerup', handlePointerUp, { passive: true });
		window.addEventListener('pointercancel', handlePointerUp, { passive: true });
		window.addEventListener('pointerleave', handlePointerUp, { passive: true });
		window.addEventListener('scroll', hideCordHint, { passive: true });

		const observer = new IntersectionObserver(
			(entries) => {
				const nowVisible = entries[0]?.isIntersecting ?? true;
				if (!isVisible && nowVisible && !isPageScrollLocked()) {
					// Clamp delta when scrolling back into Hero from deep sections
					lastFrameMs = performance.now();
					smoothScrollVel = Math.max(-36, Math.min(36, (window.scrollY - lastScrollY) * 0.35));
					prevSmoothScrollVel = smoothScrollVel;
					lastScrollY = window.scrollY;
				}
				isVisible = nowVisible;
			},
			{ threshold: 0.05 }
		);
		observer.observe(canvas);

		const stepPhysics = (dtScale: number) => {
			const currentScrollY = isPageScrollLocked() ? lastScrollY : window.scrollY;
			const rawScrollDelta = Math.max(-96, Math.min(96, currentScrollY - lastScrollY));
			lastScrollY = currentScrollY;

			// Newton inertial reaction in Hero's scrolling frame + subtle aerodynamic drag
			smoothScrollVel = smoothScrollVel * 0.68 + (rawScrollDelta / dtScale) * 0.32;
			const scrollAccel = smoothScrollVel - prevSmoothScrollVel;
			prevSmoothScrollVel = smoothScrollVel;

			const rawDriveY = scrollAccel * 0.095 + smoothScrollVel * 0.028;
			const clampedDriveY = Math.max(-2.5, Math.min(2.5, rawDriveY));
			const clampedSwayX = Math.max(-0.42, Math.min(0.42, smoothScrollVel * 0.0055));

			let touchedAnyStrand = false;

			strands.forEach((strand, sIdx) => {
				const pts = strand.points;
				let hitStrand = false;

				for (let i = 0; i < pts.length; i++) {
					const p = pts[i];
					if (p.pinned) continue;

					const vx = (p.x - p.ox) * DAMPING;
					const vy = (p.y - p.oy) * DAMPING;
					p.ox = p.x;
					p.oy = p.y;

					const slackEnv = Math.sin((i / (pts.length - 1)) * Math.PI);
					p.x += vx + clampedSwayX * strand.swayDir * slackEnv;
					p.y += vy + GRAVITY + clampedDriveY * strand.weight * slackEnv;

					if (pointer.active) {
						const dx = p.x - pointer.x;
						const dy = p.y - pointer.y;
						const dist = Math.hypot(dx, dy);
						if (dist < CORD_INTERACT_RADIUS && dist > 0.001) {
							touchedAnyStrand = true;
							const influence = 1 - dist / CORD_INTERACT_RADIUS;
							p.x += pointer.vx * influence * 0.42 + (dx / dist) * influence * 2.2;
							p.y += pointer.vy * influence * 0.42 + (dy / dist) * influence * 2.2;
							if (Math.hypot(pointer.vx, pointer.vy) > 3.5) {
								hitStrand = true;
							}
						}
					}

					p.x = Math.max(8, Math.min(width - 8, p.x));
					p.y = Math.max(10, Math.min(height - 10, p.y));
				}

				if (hitStrand) {
					playPluckRef.current(STRAND_DEFS[sIdx].freq, false, sIdx);
				}

				relaxConstraints(pts, strand.segLen);
			});

			if (
				touchedAnyStrand &&
				audioNeedsUnlockRef.current &&
				lastPointerType === 'mouse' &&
				!lastOverBlockedUi &&
				lastClientX > -500
			) {
				cordInteractUntil = performance.now() + HINT_HOLD_MS;
				showCordHint(lastClientX, lastClientY);
			} else if (hintRef.current && hintRef.current.style.opacity === '1') {
				if (
					!audioNeedsUnlockRef.current ||
					!pointer.active ||
					lastOverBlockedUi ||
					(performance.now() >= cordInteractUntil &&
						getMinCordDist(pointer.x, pointer.y) >= HINT_DETECT_RADIUS)
				) {
					hideCordHint();
				}
			}

			pointer.vx *= 0.8;
			pointer.vy *= 0.8;
		};

		const render = (nowMs: number) => {
			if (!isVisible) {
				lastScrollY = window.scrollY;
				rafId = requestAnimationFrame(render);
				return;
			}
			const dtRaw = lastFrameMs > 0 ? (nowMs - lastFrameMs) / 16.6667 : 1;
			lastFrameMs = nowMs;
			const dtScale = Math.max(0.5, Math.min(1.8, dtRaw));

			if (!reducedMotion) {
				stepPhysics(dtScale);
			}
			drawStrandsAndTags();

			rafId = requestAnimationFrame(render);
		};

		rafId = requestAnimationFrame(render);

		return () => {
			disposed = true;
			cancelAnimationFrame(rafId);
			observer.disconnect();
			heroResizeObserver?.disconnect();
			window.removeEventListener('resize', syncLayout);
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerdown', handlePointerDown);
			window.removeEventListener('pointerup', handlePointerUp);
			window.removeEventListener('pointercancel', handlePointerUp);
			window.removeEventListener('pointerleave', handlePointerUp);
			window.removeEventListener('scroll', hideCordHint);
		};
	}, []);

	return (
		<>
			<canvas
				ref={canvasRef}
				aria-hidden='true'
				className='pointer-events-none absolute inset-0 w-full h-full z-10'
			/>
			<div
				ref={hintRef}
				data-cord-audio-hint='true'
				aria-hidden='true'
				className='fixed top-0 left-0 z-[95] pointer-events-none px-2.5 py-1 rounded-full border-2 border-[#050505] bg-[#FFD426] text-[#050505] font-mono text-[11px] font-black shadow-[3px_3px_0_#050505] whitespace-nowrap transition-opacity duration-150 opacity-0'
			>
				{t({
					en: '♪ Click once for cord sound',
					id: '♪ Klik sekali untuk suara kabel',
				})}
			</div>
		</>
	);
};

export default SpaghettiCablesCanvas;

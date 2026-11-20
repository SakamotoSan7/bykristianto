import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Chess, type Color, type Move, type Piece, type PieceSymbol, type Square } from 'chess.js';
import { useLanguage } from '../../context/useLanguage';
import {
	useSound,
	type ChessOutcomeSoundId,
	type ChessPromotionCode,
} from '../../context/useSound';
import { useScrollLock } from '../../utils/scrollLock';
import { SparkleStar } from '../SpaghettiArt';
import {
	BgmToggleButton,
	LanguageSwitchPill,
	SfxToggleButton,
} from '../StudioAudioControls';
import { ChallengerAvatar, KristiantoAvatar, type ChessAvatarMood } from './ChessAvatars';
import { ChessPieceSvg } from './ChessPieces';
import {
	ARROW_COLOR_HEX,
	FILES,
	PROMOTION_PIECES,
	arrowColorFromModifiers,
	buildArrowSvgGeometry,
	buildCapturedSummary,
	buildTimelineFrame,
	formatClock,
	getGameResultFromPosition,
	parseUciMove,
	pickRandomColor,
	squareFromCoords,
	type ArrowColorKey,
	type BoardArrow,
	type GameResult,
	type SquareHighlight,
	type TimelineFrame,
} from './chessHelpers';
import {
	DEFAULT_KRIS_TIER,
	KRIS_PROFILES,
	KRIS_TIER_ORDER,
	type KrisTierId,
} from './chessProfiles';
import {
	analyzeKrisMoveDialogue,
	analyzePlayerMoveDialogue,
	pickKrisLine,
	type KrisDialogueCategory,
	type KrisLine,
} from './krisDialogue';
import { computeHumanThinkMs } from './krisMoveSelector';
import { pickBookMove } from './openingBook';
import { StockfishClient, type EngineState } from './stockfishClient';

interface ChessGameProps {
	isActive: boolean;
}

interface DragState {
	from: Square;
	piece: Piece;
	startX: number;
	startY: number;
	active: boolean;
	hoverSquare: Square | null;
	wasAlreadySelected: boolean;
}

interface ArrowDragState {
	from: Square;
	to: Square;
	color: ArrowColorKey;
}

interface PendingTouchSquareTap {
	pointerId: number;
	sq: Square;
	kind: 'move' | 'deselect';
	fromSquare: Square | null;
	startX: number;
	startY: number;
}

type FullscreenPhase = 'closed' | 'entering' | 'open' | 'exiting';

const PIECE_MATERIAL_VALUES: Record<PieceSymbol, number> = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
};

function getMaterialAdvantage(game: Chess, perspective: Color): number {
	let diff = 0;
	for (const row of game.board()) {
		for (const cell of row) {
			if (!cell) continue;
			const val = PIECE_MATERIAL_VALUES[cell.type];
			diff += cell.color === perspective ? val : -val;
		}
	}
	return diff;
}

const INTENSE_SPOKEN_MOODS = new Set<ChessAvatarMood>([
	'crying',
	'shocked',
	'curious',
	'hyped',
	'smug',
	'cheeky',
]);

interface DeriveMoodsInput {
	activeTier: KrisTierId;
	result: GameResult | null;
	playerColor: Color;
	krisColor: Color;
	viewTurn: Color;
	viewInCheck: boolean;
	playerLead: number;
	displayedPly: number;
	isViewingHistory: boolean;
	isKrisThinking: boolean;
	isPlayerClockLow: boolean;
	lastMove: Move | null;
	prevMove: Move | null;
	spokenMood: ChessAvatarMood;
}

function inspectCaptureBeat(lastMove: Move | null, prevMove: Move | null) {
	if (!lastMove) return null;
	const capturedVal = lastMove.captured ? PIECE_MATERIAL_VALUES[lastMove.captured] : 0;
	const prevCapturedVal = prevMove?.captured ? PIECE_MATERIAL_VALUES[prevMove.captured] : 0;
	const isDirectEvenTrade = Boolean(
		prevMove && prevMove.to === lastMove.to && prevCapturedVal === capturedVal && capturedVal > 0
	);
	const isMaterialSwing = Boolean(lastMove.promotion || (capturedVal >= 3 && !isDirectEvenTrade));
	return { lastMove, capturedVal, isMaterialSwing };
}

function deriveChallengerBoardMood({
	result,
	playerColor,
	krisColor,
	viewTurn,
	viewInCheck,
	playerLead,
	displayedPly,
	isPlayerClockLow,
	lastMove,
	prevMove,
}: DeriveMoodsInput): ChessAvatarMood {
	if (result) {
		if (result.kind === 'draw') return 'cheeky';
		return result.winner === playerColor ? 'win' : 'lose';
	}

	if (viewInCheck) {
		if (viewTurn === playerColor) {
			return playerLead <= -5 ? 'crying' : playerLead <= -2 ? 'shocked' : 'sweating';
		}
		return 'hyped';
	}

	const beat = inspectCaptureBeat(lastMove, prevMove);
	if (beat) {
		if (beat.lastMove.color === playerColor && beat.isMaterialSwing) {
			return beat.capturedVal >= 5 || beat.lastMove.promotion || playerLead >= 3 ? 'hyped' : 'smug';
		}

		if (beat.lastMove.color === krisColor && beat.isMaterialSwing) {
			if (beat.capturedVal >= 9 || beat.lastMove.promotion || playerLead <= -6) return 'crying';
			return beat.capturedVal >= 5 || playerLead <= -3 ? 'shocked' : 'sweating';
		}

		if (beat.lastMove.san === 'O-O' || beat.lastMove.san === 'O-O-O') {
			return beat.lastMove.color === playerColor
				? 'cheeky'
				: isPlayerClockLow
					? 'sweating'
					: 'curious';
		}
	}

	if (isPlayerClockLow) {
		return playerLead <= -4 ? 'crying' : 'sweating';
	}

	if (playerLead >= 5) return 'hyped';
	if (playerLead >= 2) return 'smug';
	if (playerLead === 1) return 'cheeky';
	if (playerLead <= -6) return 'crying';
	if (playerLead <= -3) return 'sweating';
	if (playerLead <= -1) return 'determined';
	if (displayedPly >= 1 && displayedPly <= 4 && lastMove?.color === krisColor) return 'curious';
	if (displayedPly > 0 && displayedPly <= 6 && displayedPly % 4 === 2) return 'cheeky';
	return 'calm';
}

function deriveKrisBoardMood({
	activeTier,
	result,
	playerColor,
	krisColor,
	viewTurn,
	viewInCheck,
	playerLead,
	displayedPly,
	isPlayerClockLow,
	lastMove,
	prevMove,
}: DeriveMoodsInput): ChessAvatarMood {
	if (result) {
		if (result.kind === 'draw') return 'cheeky';
		if (result.winner === krisColor) return 'win';
		return activeTier === '1000' ? 'crying' : 'lose';
	}

	const krisLead = -playerLead;

	if (viewInCheck) {
		if (viewTurn === playerColor) {
			return activeTier === '1900' && krisLead >= 1 ? 'smug' : 'hyped';
		}
		if (activeTier === '1000' && krisLead <= -2) return 'crying';
		return krisLead <= -5 ? 'shocked' : 'sweating';
	}

	const beat = inspectCaptureBeat(lastMove, prevMove);
	if (beat) {
		if (beat.lastMove.color === krisColor && beat.isMaterialSwing) {
			return beat.capturedVal >= 5 || beat.lastMove.promotion ? 'hyped' : 'smug';
		}

		if (beat.lastMove.color === playerColor && beat.isMaterialSwing) {
			const severeHit = beat.capturedVal >= 5 || Boolean(beat.lastMove.promotion) || krisLead <= -3;
			if (activeTier === '1000' && severeHit) return 'crying';
			return severeHit ? 'shocked' : 'determined';
		}

		if (beat.lastMove.san === 'O-O' || beat.lastMove.san === 'O-O-O') {
			if (beat.lastMove.color === krisColor) return 'cheeky';
			return activeTier === '1000' ? 'curious' : 'determined';
		}
	}

	if (isPlayerClockLow) return 'smug';

	if (krisLead >= 5) return 'hyped';
	if (krisLead >= 2) return 'smug';
	if (krisLead === 1) return activeTier === '1900' ? 'smug' : 'cheeky';
	if (activeTier === '1000' && krisLead <= -4) return 'crying';
	if (krisLead <= -5) return 'sweating';
	if (krisLead <= -1) return 'determined';
	if (activeTier === '1000' && displayedPly >= 1 && displayedPly <= 4) return 'curious';
	if (displayedPly > 0 && displayedPly <= 6 && displayedPly % 4 === 0) return 'cheeky';
	return 'calm';
}

function deriveChessMoods(input: DeriveMoodsInput): {
	kris: ChessAvatarMood;
	krisBubble: ChessAvatarMood;
	challenger: ChessAvatarMood;
} {
	const challenger = deriveChallengerBoardMood(input);
	const krisBoard = deriveKrisBoardMood(input);

	if (input.isViewingHistory) {
		return { kris: krisBoard, krisBubble: krisBoard, challenger };
	}

	// Keep live comic portrait 1:1 synced with Kris's spoken line & persona
	const krisBubble = input.spokenMood;
	const kris =
		input.result !== null
			? input.spokenMood
			: input.isKrisThinking
				? INTENSE_SPOKEN_MOODS.has(input.spokenMood)
					? input.spokenMood
					: 'thinking'
				: input.spokenMood;

	return { kris, krisBubble, challenger };
}

const INITIAL_CLOCK_MS = 15 * 60 * 1000; // 15:00 Rapid

const FullscreenExpandIcon = () => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.3'
		strokeLinecap='round'
		strokeLinejoin='round'
		className='size-3.5 shrink-0'
		aria-hidden='true'
	>
		<path d='M15 3h6v6' />
		<path d='M9 21H3v-6' />
		<path d='m21 3-7 7' />
		<path d='m3 21 7-7' />
	</svg>
);

const FullscreenExitIcon = () => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.3'
		strokeLinecap='round'
		strokeLinejoin='round'
		className='size-3.5 shrink-0'
		aria-hidden='true'
	>
		<path d='M8 3v3a2 2 0 0 1-2 2H3' />
		<path d='M21 8h-3a2 2 0 0 1-2-2V3' />
		<path d='M3 16h3a2 2 0 0 1 2 2v3' />
		<path d='M16 21v-3a2 2 0 0 1 2-2h3' />
	</svg>
);

const ArrowDrawIcon = () => (
	<svg
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2.3'
		strokeLinecap='round'
		strokeLinejoin='round'
		className='size-3.5 shrink-0'
		aria-hidden='true'
	>
		<path d='M5 19 19 5' />
		<path d='M10 5h9v9' />
	</svg>
);

const DRAW_OUTCOME_AUDIO: Record<
	Extract<GameResult, { kind: 'draw' }>['reason'],
	ChessOutcomeSoundId
> = {
	stalemate: 'draw_stalemate',
	threefold: 'draw_threefold',
	insufficient: 'draw_insufficient',
	'fifty-move': 'draw_fifty_move',
};

function mapGameResultToOutcomeAudio(res: GameResult, myColor: Color): ChessOutcomeSoundId {
	if (res.kind === 'draw') {
		return DRAW_OUTCOME_AUDIO[res.reason];
	}
	if (res.winner === myColor) {
		return res.kind === 'checkmate' ? 'win_checkmate' : 'win_timeout';
	}
	if (res.kind === 'checkmate') return 'loss_checkmate';
	if (res.kind === 'timeout') return 'loss_timeout';
	return 'loss_resign';
}

const ChessGame = ({ isActive }: ChessGameProps) => {
	const { t } = useLanguage();
	const { playPreset, playChessMove, playChessOutcome, setBgmFocusAttenuated } = useSound();

	const chessRef = useRef<Chess>(new Chess());
	const engineRef = useRef<StockfishClient | null>(null);
	const matchIdRef = useRef<number>(1);
	const embeddedRootRef = useRef<HTMLDivElement | null>(null);
	const boardWrapRef = useRef<HTMLDivElement | null>(null);
	const moveListRef = useRef<HTMLDivElement | null>(null);
	const dragRef = useRef<DragState | null>(null);
	const dragGhostElRef = useRef<HTMLDivElement | null>(null);
	const dragCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const dragRafRef = useRef<number | null>(null);
	const boardRectRef = useRef<DOMRect | null>(null);
	const arrowDragRef = useRef<ArrowDragState | null>(null);
	const pendingTouchTapRef = useRef<PendingTouchSquareTap | null>(null);
	const lastTickRef = useRef<number>(performance.now());
	const resignTimerRef = useRef<number | null>(null);
	const newMatchTimerRef = useRef<number | null>(null);
	const tierConfirmTimerRef = useRef<number | null>(null);
	const fullscreenTimerRef = useRef<number | null>(null);
	const bookTimerRef = useRef<number | null>(null);
	const saidLowClockRef = useRef<boolean>(false);
	const recentDialogueIdsRef = useRef<string[]>([]);
	const spokenOpeningTagRef = useRef<string | null>(null);
	const lastUrgentPlayerReactionPlyRef = useRef<number>(-1);
	const lastMoveRef = useRef<{ kris: Move | null; player: Move | null }>({
		kris: null,
		player: null,
	});

	const [activeTier, setActiveTier] = useState<KrisTierId>(DEFAULT_KRIS_TIER);
	const activeTierRef = useRef<KrisTierId>(DEFAULT_KRIS_TIER);
	const [pendingTierConfirm, setPendingTierConfirm] = useState<KrisTierId | null>(null);
	const [playerColor, setPlayerColor] = useState<Color>(() => pickRandomColor());
	const [boardOrientation, setBoardOrientation] = useState<Color>(() => playerColor);
	const [isBookThinking, setIsBookThinking] = useState<boolean>(false);
	const [krisLine, setKrisLine] = useState<{ line: KrisLine; seq: number }>(() => {
		const initial = pickKrisLine(
			playerColor === 'w' ? 'introWhite' : 'introBlack',
			DEFAULT_KRIS_TIER
		);
		recentDialogueIdsRef.current = [initial.id];
		return { line: initial, seq: 1 };
	});
	const [timeline, setTimeline] = useState<TimelineFrame[]>(() => [
		buildTimelineFrame(chessRef.current, null),
	]);
	const [viewPly, setViewPly] = useState<number | null>(null);
	const [revision, setRevision] = useState<number>(0);

	const [playerHasMoved, setPlayerHasMoved] = useState<boolean>(false);
	const [whiteMs, setWhiteMs] = useState<number>(INITIAL_CLOCK_MS);
	const [blackMs, setBlackMs] = useState<number>(INITIAL_CLOCK_MS);
	const [engineState, setEngineState] = useState<EngineState>('loading');
	const [downloadPct, setDownloadPct] = useState<number>(0);
	const [engineBootKey, setEngineBootKey] = useState<number>(0);

	const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
	const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(
		null
	);
	const [dragState, setDragState] = useState<DragState | null>(null);
	const [boardPx, setBoardPx] = useState<number>(480);

	// Board Annotations (Chess.com right-click / arrow-mode arrows & square highlights)
	const [arrowDrawMode, setArrowDrawMode] = useState<boolean>(false);
	const [boardArrows, setBoardArrows] = useState<BoardArrow[]>([]);
	const [squareHighlights, setSquareHighlights] = useState<SquareHighlight[]>([]);
	const [arrowDragPreview, setArrowDragPreview] = useState<ArrowDragState | null>(null);

	// Seamless In-App Studio Focus Window transition state
	const [fullscreenPhase, setFullscreenPhase] = useState<FullscreenPhase>('closed');
	const [embeddedHeightHold, setEmbeddedHeightHold] = useState<number | null>(null);

	const [result, setResult] = useState<GameResult | null>(null);
	const [dismissedEndModal, setDismissedEndModal] = useState<boolean>(false);
	const [confirmResign, setConfirmResign] = useState<boolean>(false);
	const [confirmNewMatch, setConfirmNewMatch] = useState<boolean>(false);
	const [copiedPgn, setCopiedPgn] = useState<boolean>(false);

	// Refs mirrored cleanly inside worker callbacks, interval clocks, and global listeners
	const playerColorRef = useRef<Color>(playerColor);
	const playerHasMovedRef = useRef<boolean>(playerHasMoved);
	const resultRef = useRef<GameResult | null>(result);
	const engineStateRef = useRef<EngineState>(engineState);
	const isActiveRef = useRef<boolean>(isActive);
	const isViewingHistoryRef = useRef<boolean>(false);
	const arrowDrawModeRef = useRef<boolean>(arrowDrawMode);
	const boardPxRef = useRef<number>(boardPx);
	const clocksRef = useRef<{ w: number; b: number }>({
		w: INITIAL_CLOCK_MS,
		b: INITIAL_CLOCK_MS,
	});
	const totalPlies = timeline.length - 1;
	const displayedPly =
		viewPly === null ? totalPlies : Math.max(0, Math.min(viewPly, totalPlies));
	const isViewingHistory = displayedPly < totalPlies;
	const isFullscreenVisible = fullscreenPhase !== 'closed';

	useEffect(() => {
		playerColorRef.current = playerColor;
	}, [playerColor]);

	useEffect(() => {
		playerHasMovedRef.current = playerHasMoved;
	}, [playerHasMoved]);

	useEffect(() => {
		resultRef.current = result;
	}, [result]);

	useEffect(() => {
		engineStateRef.current = engineState;
	}, [engineState]);

	useEffect(() => {
		isActiveRef.current = isActive;
	}, [isActive]);

	useEffect(() => {
		isViewingHistoryRef.current = isViewingHistory;
	}, [isViewingHistory]);

	useEffect(() => {
		arrowDrawModeRef.current = arrowDrawMode;
	}, [arrowDrawMode]);

	useEffect(() => {
		boardPxRef.current = boardPx;
	}, [boardPx]);

	useEffect(() => {
		clocksRef.current.w = whiteMs;
		clocksRef.current.b = blackMs;
	}, [whiteMs, blackMs]);

	useEffect(() => {
		return () => {
			if (dragRafRef.current !== null) {
				window.cancelAnimationFrame(dragRafRef.current);
				dragRafRef.current = null;
			}
		};
	}, []);

	// Re-measure active board container pixel size whenever layout switches embedded <-> fullscreen
	useEffect(() => {
		const el = boardWrapRef.current;
		if (!el) return;
		const updateSize = () => {
			const rect = el.getBoundingClientRect();
			boardRectRef.current = rect;
			if (rect.width > 0) setBoardPx(rect.width);
		};
		updateSize();
		const ro = new ResizeObserver(updateSize);
		ro.observe(el);
		return () => ro.disconnect();
	}, [fullscreenPhase]);

	const enterFullscreen = useCallback(() => {
		if (fullscreenTimerRef.current !== null) {
			window.clearTimeout(fullscreenTimerRef.current);
			fullscreenTimerRef.current = null;
		}
		if (embeddedRootRef.current) {
			setEmbeddedHeightHold(embeddedRootRef.current.getBoundingClientRect().height);
		}
		playPreset('switch');
		setFullscreenPhase('entering');
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				setFullscreenPhase('open');
			});
		});
	}, [playPreset]);

	const exitFullscreen = useCallback(() => {
		if (fullscreenPhase === 'closed' || fullscreenPhase === 'exiting') return;
		if (fullscreenTimerRef.current !== null) {
			window.clearTimeout(fullscreenTimerRef.current);
		}
		playPreset('close');
		setFullscreenPhase('exiting');
		fullscreenTimerRef.current = window.setTimeout(() => {
			setFullscreenPhase('closed');
			setEmbeddedHeightHold(null);
			fullscreenTimerRef.current = null;
		}, 220);
	}, [fullscreenPhase, playPreset]);

	// Lock underlying page scroll (wheel, touch drag, and overscroll) while Studio Focus Window is active
	useScrollLock(isFullscreenVisible);

	// Smoothly attenuate background music while Chess Fullscreen Focus Studio is active
	const isFullscreenFocused = fullscreenPhase === 'entering' || fullscreenPhase === 'open';
	useEffect(() => {
		setBgmFocusAttenuated(isFullscreenFocused);
	}, [isFullscreenFocused, setBgmFocusAttenuated]);

	useEffect(() => {
		return () => {
			setBgmFocusAttenuated(false);
		};
	}, [setBgmFocusAttenuated]);

	const clearConfirmTimers = useCallback(() => {
		if (resignTimerRef.current !== null) {
			window.clearTimeout(resignTimerRef.current);
			resignTimerRef.current = null;
		}
		if (newMatchTimerRef.current !== null) {
			window.clearTimeout(newMatchTimerRef.current);
			newMatchTimerRef.current = null;
		}
		if (tierConfirmTimerRef.current !== null) {
			window.clearTimeout(tierConfirmTimerRef.current);
			tierConfirmTimerRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			clearConfirmTimers();
			if (fullscreenTimerRef.current !== null) {
				window.clearTimeout(fullscreenTimerRef.current);
			}
		};
	}, [clearConfirmTimers]);

	const playOutcomeSound = useCallback(
		(gameResult: GameResult, myColor: Color) => {
			playChessOutcome(mapGameResultToOutcomeAudio(gameResult, myColor));
		},
		[playChessOutcome]
	);

	const playMoveSound = useCallback(
		(move: Move, gameAfter: Chess, myColor: Color) => {
			const terminal = getGameResultFromPosition(gameAfter);
			const terminalKind = terminal
				? mapGameResultToOutcomeAudio(terminal, myColor)
				: null;

			const promo =
				move.promotion &&
				(move.promotion === 'q' ||
					move.promotion === 'r' ||
					move.promotion === 'b' ||
					move.promotion === 'n')
					? (move.promotion as ChessPromotionCode)
					: null;

			playChessMove({
				piece: move.piece,
				isCapture: move.isCapture(),
				isEnPassant: move.isEnPassant(),
				castleSide: move.isKingsideCastle()
					? 'k'
					: move.isQueensideCastle()
						? 'q'
						: null,
				promotion: promo,
				isCheck: gameAfter.inCheck(),
				terminal: terminalKind,
			});
		},
		[playChessMove]
	);

	const clearBookTimer = useCallback(() => {
		if (bookTimerRef.current !== null) {
			window.clearTimeout(bookTimerRef.current);
			bookTimerRef.current = null;
		}
		setIsBookThinking(false);
	}, []);

	useEffect(() => {
		return () => {
			if (bookTimerRef.current !== null) {
				window.clearTimeout(bookTimerRef.current);
				bookTimerRef.current = null;
			}
		};
	}, []);

	const commitDialogueLine = useCallback((line: KrisLine) => {
		const nextRecent = [...recentDialogueIdsRef.current.slice(-13), line.id];
		recentDialogueIdsRef.current = nextRecent;
		setKrisLine((prev) => ({ line, seq: prev.seq + 1 }));
	}, []);

	const sayKris = useCallback(
		(category: KrisDialogueCategory) => {
			const moveNum = Math.max(1, Math.ceil(chessRef.current.history().length / 2));
			const nextLine = pickKrisLine(
				category,
				activeTierRef.current,
				recentDialogueIdsRef.current,
				{ moveNum }
			);
			commitDialogueLine(nextLine);
		},
		[commitDialogueLine]
	);

	const applyKrisUciMove = useCallback(
		(expectedMatchId: number, uciMove: string, fromBook: boolean) => {
			if (
				matchIdRef.current !== expectedMatchId ||
				resultRef.current !== null ||
				!uciMove
			) {
				return;
			}

			const parsed = parseUciMove(uciMove);
			if (!parsed) return;

			const game = chessRef.current;
			const krisColor: Color = playerColorRef.current === 'w' ? 'b' : 'w';
			if (game.turn() !== krisColor || game.isGameOver()) return;

			const preMoveKrisLead = getMaterialAdvantage(game, krisColor);
			const move = game.move(parsed);
			const postMoveKrisLead = getMaterialAdvantage(game, krisColor);
			const prevPlayerMove = lastMoveRef.current.player;
			lastMoveRef.current.kris = move;

			const nextFrame = buildTimelineFrame(game, { from: move.from, to: move.to });
			setTimeline((prev) => [...prev, nextFrame]);
			setRevision((r) => r + 1);
			setSelectedSquare(null);
			setBoardArrows([]);
			setSquareHighlights([]);
			lastTickRef.current = performance.now();

			playMoveSound(move, game, playerColorRef.current);

			const terminal = getGameResultFromPosition(game);
			if (terminal) {
				resultRef.current = terminal;
				setResult(terminal);
				setConfirmResign(false);
				setConfirmNewMatch(false);
				setDismissedEndModal(false);
				if (terminal.kind !== 'draw' && terminal.winner === krisColor) {
					sayKris('winCheckmate');
				} else if (terminal.kind !== 'draw' && terminal.winner === playerColorRef.current) {
					sayKris('loseGame');
				} else {
					sayKris('drawGame');
				}
				return;
			}

			const plyCount = game.history().length;
			// Preserve introBlack greeting cleanly when Kris opens 1. ... as White before challenger's move
			if (plyCount === 1 && !playerHasMovedRef.current) {
				return;
			}

			const decision = analyzeKrisMoveDialogue({
				game,
				move,
				tier: activeTierRef.current,
				fromBook,
				krisColor,
				preMoveKrisLead,
				postMoveKrisLead,
				prevPlayerMove,
				spokenOpeningTag: spokenOpeningTagRef.current,
				recentIds: recentDialogueIdsRef.current,
			});

			if (decision) {
				const didJustReactToPlayer = lastUrgentPlayerReactionPlyRef.current === plyCount - 1;
				if (decision.priority === 'critical' || !didJustReactToPlayer) {
					if (decision.openingTag) {
						spokenOpeningTagRef.current = decision.openingTag;
					}
					commitDialogueLine(decision.line);
				}
			}
		},
		[commitDialogueLine, playMoveSound, sayKris]
	);

	const requestOpponentMove = useCallback(
		async (expectedMatchId: number, currentFen: string) => {
			clearBookTimer();

			const game = chessRef.current;
			const currentTier = activeTierRef.current;
			const profile = KRIS_PROFILES[currentTier];
			const ply = game.history().length;
			const krisColor: Color = playerColorRef.current === 'w' ? 'b' : 'w';
			const krisClockMs = clocksRef.current[krisColor];
			const prevOpponentToSquare = lastMoveRef.current.player?.to ?? null;
			const isInCheck = game.inCheck();
			const legalMoveCount = game.moves().length;

			const bookMove = pickBookMove(game, currentTier, profile.openingBookMaxPly);
			if (bookMove) {
				setIsBookThinking(true);
				const bookDelayMs = computeHumanThinkMs({
					tier: currentTier,
					fromBook: true,
					ply,
					legalMoveCount,
					isRecapture: false,
					isInCheck,
					evalSpreadCp: 0,
					isOnlyMove: legalMoveCount <= 1,
					krisClockMs,
				});
				bookTimerRef.current = window.setTimeout(() => {
					bookTimerRef.current = null;
					setIsBookThinking(false);
					applyKrisUciMove(expectedMatchId, bookMove, true);
				}, bookDelayMs);
				return;
			}

			const client = engineRef.current;
			if (!client) return;

			try {
				const bestUci = await client.findBestMove(currentFen, currentTier, {
					ply,
					prevOpponentToSquare,
					krisClockMs,
				});
				if (bestUci) {
					applyKrisUciMove(expectedMatchId, bestUci, false);
				}
			} catch {
				// Ignore stale worker calls during restarts/unmount
			}
		},
		[applyKrisUciMove, clearBookTimer]
	);

	useEffect(() => {
		let cancelled = false;
		const client = new StockfishClient({
			initialTier: activeTierRef.current,
			onStateChange: (next) => {
				if (!cancelled) setEngineState(next);
			},
			onDownloadProgress: (pct) => {
				if (!cancelled) setDownloadPct(pct);
			},
		});
		engineRef.current = client;

		const bootMatchId = matchIdRef.current;
		client
			.ensureReady()
			.then(() => {
				if (cancelled || matchIdRef.current !== bootMatchId) return;
				lastTickRef.current = performance.now();
				const game = chessRef.current;
				const krisColor: Color = playerColorRef.current === 'w' ? 'b' : 'w';
				if (game.turn() === krisColor && !game.isGameOver() && resultRef.current === null) {
					void requestOpponentMove(bootMatchId, game.fen());
				}
			})
			.catch(() => {
				if (!cancelled) setEngineState('error');
			});

		return () => {
			cancelled = true;
			client.dispose();
			if (engineRef.current === client) {
				engineRef.current = null;
			}
		};
	}, [engineBootKey, requestOpponentMove]);

	// 15:00 Rapid clock starts ONLY once the challenger completes their first move
	useEffect(() => {
		lastTickRef.current = performance.now();
		if (
			!playerHasMoved ||
			!isActive ||
			engineState === 'loading' ||
			engineState === 'error' ||
			result !== null
		) {
			return;
		}

		const intervalId = window.setInterval(() => {
			const now = performance.now();
			const delta = now - lastTickRef.current;
			lastTickRef.current = now;

			if (
				!playerHasMovedRef.current ||
				!isActiveRef.current ||
				document.hidden ||
				resultRef.current !== null
			) {
				return;
			}

			const activeTurn = chessRef.current.turn();
			if (activeTurn === 'w') {
				setWhiteMs((prev) => {
					const next = Math.max(0, prev - delta);
					if (
						next < 90_000 &&
						prev >= 90_000 &&
						playerColorRef.current === 'w' &&
						!saidLowClockRef.current
					) {
						saidLowClockRef.current = true;
						queueMicrotask(() => sayKris('lowPlayerClock'));
					}
					if (next === 0 && prev > 0 && resultRef.current === null) {
						queueMicrotask(() => clearBookTimer());
						engineRef.current?.cancelCurrentSearch();
						const timeoutRes: GameResult = { kind: 'timeout', winner: 'b' };
						resultRef.current = timeoutRes;
						setResult(timeoutRes);
						setDismissedEndModal(false);
						playOutcomeSound(timeoutRes, playerColorRef.current);
						queueMicrotask(() =>
							sayKris(playerColorRef.current === 'w' ? 'winTimeout' : 'loseGame')
						);
					}
					return next;
				});
			} else {
				setBlackMs((prev) => {
					const next = Math.max(0, prev - delta);
					if (
						next < 90_000 &&
						prev >= 90_000 &&
						playerColorRef.current === 'b' &&
						!saidLowClockRef.current
					) {
						saidLowClockRef.current = true;
						queueMicrotask(() => sayKris('lowPlayerClock'));
					}
					if (next === 0 && prev > 0 && resultRef.current === null) {
						queueMicrotask(() => clearBookTimer());
						engineRef.current?.cancelCurrentSearch();
						const timeoutRes: GameResult = { kind: 'timeout', winner: 'w' };
						resultRef.current = timeoutRes;
						setResult(timeoutRes);
						setDismissedEndModal(false);
						playOutcomeSound(timeoutRes, playerColorRef.current);
						queueMicrotask(() =>
							sayKris(playerColorRef.current === 'b' ? 'winTimeout' : 'loseGame')
						);
					}
					return next;
				});
			}
		}, 100);

		return () => window.clearInterval(intervalId);
	}, [
		playerHasMoved,
		isActive,
		engineState,
		result,
		playOutcomeSound,
		clearBookTimer,
		sayKris,
	]);

	const startNewMatch = useCallback(
		async (overrideTier?: KrisTierId) => {
			const nextMatchId = matchIdRef.current + 1;
			matchIdRef.current = nextMatchId;

			const nextTier = overrideTier ?? activeTierRef.current;
			activeTierRef.current = nextTier;
			setActiveTier(nextTier);

			clearConfirmTimers();
			setConfirmResign(false);
			setConfirmNewMatch(false);
			setPendingTierConfirm(null);
			setCopiedPgn(false);

			const nextColor = pickRandomColor();
			const freshGame = new Chess();
			chessRef.current = freshGame;
			playerColorRef.current = nextColor;
			playerHasMovedRef.current = false;
			resultRef.current = null;

			setPlayerColor(nextColor);
			setBoardOrientation(nextColor);
			setTimeline([buildTimelineFrame(freshGame, null)]);
			setViewPly(null);
			setRevision((r) => r + 1);
			setPlayerHasMoved(false);
			clocksRef.current = { w: INITIAL_CLOCK_MS, b: INITIAL_CLOCK_MS };
			setWhiteMs(INITIAL_CLOCK_MS);
			setBlackMs(INITIAL_CLOCK_MS);
			setSelectedSquare(null);
			setPendingPromotion(null);
			if (dragRafRef.current !== null) {
				window.cancelAnimationFrame(dragRafRef.current);
				dragRafRef.current = null;
			}
			dragRef.current = null;
			setDragState(null);
			arrowDragRef.current = null;
			setArrowDragPreview(null);
			pendingTouchTapRef.current = null;
			setBoardArrows([]);
			setSquareHighlights([]);
			setResult(null);
			setDismissedEndModal(false);
			clearBookTimer();
			saidLowClockRef.current = false;
			spokenOpeningTagRef.current = null;
			lastUrgentPlayerReactionPlyRef.current = -1;
			lastMoveRef.current = { kris: null, player: null };
			sayKris(nextColor === 'w' ? 'introWhite' : 'introBlack');
			lastTickRef.current = performance.now();

			playPreset('switch');

			const client = engineRef.current;
			if (client) {
				await client.startNewGame(nextTier);
				if (matchIdRef.current !== nextMatchId) return;
				lastTickRef.current = performance.now();
				if (nextColor === 'b' && resultRef.current === null) {
					void requestOpponentMove(nextMatchId, freshGame.fen());
				}
			}
		},
		[clearBookTimer, clearConfirmTimers, playPreset, requestOpponentMove, sayKris]
	);

	const handleSelectTier = (nextTier: KrisTierId) => {
		if (nextTier === activeTier) {
			if (tierConfirmTimerRef.current !== null) {
				window.clearTimeout(tierConfirmTimerRef.current);
				tierConfirmTimerRef.current = null;
			}
			setPendingTierConfirm(null);
			return;
		}
		const hasActiveLiveGame = playerHasMoved && result === null;
		if (!hasActiveLiveGame || pendingTierConfirm === nextTier) {
			void startNewMatch(nextTier);
			return;
		}
		clearConfirmTimers();
		setConfirmResign(false);
		setConfirmNewMatch(false);
		setPendingTierConfirm(nextTier);
		tierConfirmTimerRef.current = window.setTimeout(() => {
			setPendingTierConfirm(null);
			tierConfirmTimerRef.current = null;
		}, 3500);
	};

	const handleNewMatchClick = () => {
		if (!playerHasMoved || result !== null) {
			void startNewMatch();
			return;
		}
		if (!confirmNewMatch) {
			setConfirmResign(false);
			setPendingTierConfirm(null);
			if (resignTimerRef.current !== null) {
				window.clearTimeout(resignTimerRef.current);
				resignTimerRef.current = null;
			}
			if (tierConfirmTimerRef.current !== null) {
				window.clearTimeout(tierConfirmTimerRef.current);
				tierConfirmTimerRef.current = null;
			}
			setConfirmNewMatch(true);
			if (newMatchTimerRef.current !== null) {
				window.clearTimeout(newMatchTimerRef.current);
			}
			newMatchTimerRef.current = window.setTimeout(() => {
				setConfirmNewMatch(false);
				newMatchTimerRef.current = null;
			}, 3500);
			return;
		}
		void startNewMatch();
	};

	const handleResignClick = () => {
		if (result !== null || engineState === 'loading' || !playerHasMoved) return;
		if (!confirmResign) {
			setConfirmNewMatch(false);
			if (newMatchTimerRef.current !== null) {
				window.clearTimeout(newMatchTimerRef.current);
				newMatchTimerRef.current = null;
			}
			setConfirmResign(true);
			if (resignTimerRef.current !== null) {
				window.clearTimeout(resignTimerRef.current);
			}
			resignTimerRef.current = window.setTimeout(() => {
				setConfirmResign(false);
				resignTimerRef.current = null;
			}, 3500);
			return;
		}

		clearBookTimer();
		clearConfirmTimers();
		setConfirmResign(false);
		setConfirmNewMatch(false);
		setPendingTierConfirm(null);
		engineRef.current?.cancelCurrentSearch();
		const krisColor: Color = playerColor === 'w' ? 'b' : 'w';
		const resignResult: GameResult = { kind: 'resign', winner: krisColor };
		resultRef.current = resignResult;
		setResult(resignResult);
		setDismissedEndModal(false);
		setPendingPromotion(null);
		setSelectedSquare(null);
		setViewPly(null);
		playOutcomeSound(resignResult, playerColor);
		sayKris('winResign');
	};

	const commitPlayerMove = useCallback(
		(from: Square, to: Square, promotion?: PieceSymbol) => {
			const game = chessRef.current;
			if (
				isViewingHistoryRef.current ||
				resultRef.current !== null ||
				game.turn() !== playerColorRef.current ||
				engineStateRef.current === 'loading' ||
				engineStateRef.current === 'error'
			) {
				return;
			}

			try {
				const krisColor: Color = playerColorRef.current === 'w' ? 'b' : 'w';
				const preMoveKrisLead = getMaterialAdvantage(game, krisColor);
				const prevKrisMove = lastMoveRef.current.kris;
				const move = game.move(
					promotion ? { from, to, promotion } : { from, to }
				);
				const postMoveKrisLead = getMaterialAdvantage(game, krisColor);
				lastMoveRef.current.player = move;

				const wasFirstPlayerMove = !playerHasMovedRef.current;
				if (wasFirstPlayerMove) {
					playerHasMovedRef.current = true;
					setPlayerHasMoved(true);
				}
				const nextFrame = buildTimelineFrame(game, { from: move.from, to: move.to });
				setTimeline((prev) => [...prev, nextFrame]);
				setViewPly(null);
				setRevision((r) => r + 1);
				setSelectedSquare(null);
				setPendingPromotion(null);
				setBoardArrows([]);
				setSquareHighlights([]);
				clearConfirmTimers();
				setConfirmResign(false);
				setConfirmNewMatch(false);
				setPendingTierConfirm(null);
				lastTickRef.current = performance.now();

				playMoveSound(move, game, playerColorRef.current);

				const terminal = getGameResultFromPosition(game);
				if (terminal) {
					resultRef.current = terminal;
					setResult(terminal);
					setDismissedEndModal(false);
					if (terminal.kind !== 'draw' && terminal.winner === playerColorRef.current) {
						sayKris('loseGame');
					} else if (terminal.kind !== 'draw') {
						sayKris('winCheckmate');
					} else {
						sayKris('drawGame');
					}
					return;
				}

				const playerDialogue = analyzePlayerMoveDialogue({
					game,
					move,
					tier: activeTierRef.current,
					wasFirstPlayerMove,
					preMoveKrisLead,
					postMoveKrisLead,
					prevKrisMove,
					recentIds: recentDialogueIdsRef.current,
				});
				if (playerDialogue) {
					commitDialogueLine(playerDialogue.line);
					lastUrgentPlayerReactionPlyRef.current = game.history().length;
				}

				void requestOpponentMove(matchIdRef.current, game.fen());
			} catch {
				// Illegal move ignored cleanly
			}
		},
		[clearConfirmTimers, commitDialogueLine, playMoveSound, requestOpponentMove, sayKris]
	);

	// Derive displayed board state (either Live or historical ply) + full move log
	const snapshot = useMemo(() => {
		const liveGame = chessRef.current;
		const verboseHistory = liveGame.history({ verbose: true });
		const activeFrame = timeline[displayedPly] ?? timeline[timeline.length - 1];
		const displayChess =
			displayedPly === timeline.length - 1 ? liveGame : new Chess(activeFrame.fen);
		const board = displayChess.board();
		const turn = liveGame.turn();
		const viewInCheck = displayChess.inCheck();

		const { capturedByWhite, capturedByBlack, materialDiff } = buildCapturedSummary(
			verboseHistory.slice(0, displayedPly),
			board
		);

		const movePairs: Array<{ moveNo: number; white?: string; black?: string }> = [];
		for (let i = 0; i < verboseHistory.length; i += 2) {
			movePairs.push({
				moveNo: i / 2 + 1,
				white: verboseHistory[i]?.san,
				black: verboseHistory[i + 1]?.san,
			});
		}

		return {
			board,
			turn,
			viewTurn: displayChess.turn(),
			liveInCheck: liveGame.inCheck(),
			viewInCheck,
			lastMove: activeFrame?.lastMove ?? null,
			lastVerboseMove: displayedPly > 0 ? (verboseHistory[displayedPly - 1] ?? null) : null,
			prevVerboseMove: displayedPly > 1 ? (verboseHistory[displayedPly - 2] ?? null) : null,
			checkedKingSquare: activeFrame?.inCheckSquare ?? null,
			capturedByWhite,
			capturedByBlack,
			materialDiff,
			movePairs,
			plyCount: verboseHistory.length,
			pgnText: liveGame.pgn(),
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeline, displayedPly, revision]);

	// Keep the currently viewed or newest move inside MOVES.PGN scrolled smoothly inside the list container only
	useEffect(() => {
		const listEl = moveListRef.current;
		if (!listEl) return;
		if (displayedPly === 0) {
			listEl.scrollTop = 0;
			return;
		}
		const targetBtn = listEl.querySelector(
			`[data-ply="${displayedPly}"]`
		) as HTMLElement | null;
		if (!targetBtn) return;
		const containerRect = listEl.getBoundingClientRect();
		const itemRect = targetBtn.getBoundingClientRect();
		if (itemRect.top < containerRect.top) {
			listEl.scrollTop -= containerRect.top - itemRect.top + 8;
		} else if (itemRect.bottom > containerRect.bottom) {
			listEl.scrollTop += itemRect.bottom - containerRect.bottom + 8;
		}
	}, [displayedPly, fullscreenPhase]);

	const goToPly = useCallback(
		(targetPly: number | null) => {
			if (timeline.length <= 1) return;
			const maxPly = timeline.length - 1;
			if (targetPly === null || targetPly >= maxPly) {
				if (viewPly !== null) {
					setViewPly(null);
					setSelectedSquare(null);
					playPreset('paper');
				}
				return;
			}
			const clamped = Math.max(0, targetPly);
			if (clamped !== displayedPly) {
				setViewPly(clamped);
				setSelectedSquare(null);
				playPreset('paper');
			}
		},
		[displayedPly, playPreset, timeline.length, viewPly]
	);

	// Keyboard support: ArrowLeft/Right/Home/End step history, Escape exits Fullscreen Studio
	useEffect(() => {
		if (!isActive && fullscreenPhase === 'closed') return;
		const handleKeyDown = (e: KeyboardEvent) => {
			const activeEl = document.activeElement;
			const isTyping =
				activeEl instanceof HTMLInputElement ||
				activeEl instanceof HTMLTextAreaElement ||
				activeEl instanceof HTMLSelectElement;
			if (isTyping) return;

			if (e.key === 'Escape') {
				if (pendingPromotion) {
					setPendingPromotion(null);
					return;
				}
				if (fullscreenPhase === 'open' || fullscreenPhase === 'entering') {
					exitFullscreen();
				}
				return;
			}

			if (timeline.length <= 1) return;
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				goToPly(displayedPly - 1);
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				goToPly(displayedPly + 1);
			} else if (e.key === 'Home') {
				e.preventDefault();
				goToPly(0);
			} else if (e.key === 'End') {
				e.preventDefault();
				goToPly(null);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [displayedPly, exitFullscreen, fullscreenPhase, goToPly, isActive, pendingPromotion, timeline.length]);

	const activeSourceSquare = dragState?.from ?? selectedSquare;
	const legalMovesByTarget = useMemo(() => {
		const map = new Map<Square, Move[]>();
		if (!activeSourceSquare || result !== null || isViewingHistory || arrowDrawMode) {
			return map;
		}
		const game = chessRef.current;
		if (game.turn() !== playerColor) return map;
		const moves = game.moves({ verbose: true, square: activeSourceSquare });
		for (const mv of moves) {
			const list = map.get(mv.to) ?? [];
			list.push(mv);
			map.set(mv.to, list);
		}
		return map;
	}, [activeSourceSquare, arrowDrawMode, isViewingHistory, playerColor, result]);

	const legalMovesRef = useRef(legalMovesByTarget);
	useEffect(() => {
		legalMovesRef.current = legalMovesByTarget;
	}, [legalMovesByTarget]);

	const attemptPlayerMove = useCallback(
		(from: Square, to: Square, movesMap: Map<Square, Move[]>) => {
			const candidates = movesMap.get(to);
			if (!candidates || candidates.length === 0) return false;
			if (candidates.some((m) => Boolean(m.promotion))) {
				setPendingPromotion({ from, to });
				setSelectedSquare(from);
				playPreset('paper');
				return true;
			}
			commitPlayerMove(from, to);
			return true;
		},
		[commitPlayerMove, playPreset]
	);

	const getSquareFromClientPoint = useCallback(
		(clientX: number, clientY: number, useCachedRect = false): Square | null => {
			const wrap = boardWrapRef.current;
			if (!wrap) return null;
			const rect =
				useCachedRect && boardRectRef.current
					? boardRectRef.current
					: wrap.getBoundingClientRect();
			if (
				rect.width <= 0 ||
				clientX < rect.left ||
				clientX > rect.right ||
				clientY < rect.top ||
				clientY > rect.bottom
			) {
				return null;
			}
			const colIdx = Math.min(7, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * 8)));
			const rowIdx = Math.min(7, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * 8)));
			return squareFromCoords(rowIdx, colIdx, boardOrientation);
		},
		[boardOrientation]
	);

	const syncDragGhostTransform = useCallback(() => {
		const el = dragGhostElRef.current;
		if (!el) return;
		const half = Math.max(36, Math.round(boardPxRef.current / 8)) / 2;
		const tx = dragCursorRef.current.x - half;
		const ty = dragCursorRef.current.y - half;
		el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(1.12)`;
	}, []);

	useLayoutEffect(() => {
		if (dragState?.active) {
			syncDragGhostTransform();
		}
	}, [dragState?.active, boardPx, syncDragGhostTransform]);

	const finalizeArrowDrag = useCallback((drag: ArrowDragState, endSq: Square | null) => {
		const targetSq = endSq ?? drag.to;
		if (targetSq === drag.from) {
			setSquareHighlights((prev) => {
				const exists = prev.some((h) => h.square === drag.from && h.color === drag.color);
				if (exists) {
					return prev.filter((h) => !(h.square === drag.from && h.color === drag.color));
				}
				return [...prev.filter((h) => h.square !== drag.from), { square: drag.from, color: drag.color }];
			});
			return;
		}
		setBoardArrows((prev) => {
			const exists = prev.some(
				(a) => a.from === drag.from && a.to === targetSq && a.color === drag.color
			);
			if (exists) {
				return prev.filter(
					(a) => !(a.from === drag.from && a.to === targetSq && a.color === drag.color)
				);
			}
			return [
				...prev.filter((a) => !(a.from === drag.from && a.to === targetSq)),
				{ from: drag.from, to: targetSq, color: drag.color },
			];
		});
	}, []);

	useEffect(() => {
		const handleWindowPointerMove = (e: PointerEvent) => {
			const pendingTap = pendingTouchTapRef.current;
			if (
				pendingTap &&
				e.pointerId === pendingTap.pointerId &&
				Math.hypot(e.clientX - pendingTap.startX, e.clientY - pendingTap.startY) > 12
			) {
				pendingTouchTapRef.current = null;
			}

			const arrowCur = arrowDragRef.current;
			if (arrowCur) {
				const hoverSq = getSquareFromClientPoint(e.clientX, e.clientY, true);
				if (hoverSq && hoverSq !== arrowCur.to) {
					const updatedArrow: ArrowDragState = { ...arrowCur, to: hoverSq };
					arrowDragRef.current = updatedArrow;
					setArrowDragPreview(updatedArrow);
				}
				return;
			}

			const current = dragRef.current;
			if (!current) return;

			dragCursorRef.current.x = e.clientX;
			dragCursorRef.current.y = e.clientY;

			const nextActive =
				current.active || Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > 6;
			if (!nextActive) return;

			// Coalesce transform writes strictly on display vsync with zero React re-renders per pixel
			if (dragRafRef.current === null) {
				dragRafRef.current = window.requestAnimationFrame(() => {
					dragRafRef.current = null;
					if (dragRef.current?.active) {
						syncDragGhostTransform();
					}
				});
			}

			const hoverSq = getSquareFromClientPoint(e.clientX, e.clientY, true);
			if (!current.active || hoverSq !== current.hoverSquare) {
				const updated: DragState = {
					...current,
					active: true,
					hoverSquare: hoverSq,
				};
				dragRef.current = updated;
				setDragState(updated);
			}
		};

		const handleWindowPointerUp = (e: PointerEvent) => {
			const pendingTap = pendingTouchTapRef.current;
			if (pendingTap && e.pointerId === pendingTap.pointerId) {
				pendingTouchTapRef.current = null;
				if (Math.hypot(e.clientX - pendingTap.startX, e.clientY - pendingTap.startY) <= 12) {
					if (pendingTap.kind === 'move' && pendingTap.fromSquare) {
						attemptPlayerMove(pendingTap.fromSquare, pendingTap.sq, legalMovesRef.current);
					} else if (pendingTap.kind === 'deselect') {
						setBoardArrows([]);
						setSquareHighlights([]);
						setSelectedSquare(null);
					}
				}
			}

			const arrowCur = arrowDragRef.current;
			if (arrowCur) {
				arrowDragRef.current = null;
				setArrowDragPreview(null);
				const endSq = getSquareFromClientPoint(e.clientX, e.clientY);
				finalizeArrowDrag(arrowCur, endSq);
				return;
			}

			const current = dragRef.current;
			if (!current) return;
			if (dragRafRef.current !== null) {
				window.cancelAnimationFrame(dragRafRef.current);
				dragRafRef.current = null;
			}
			dragRef.current = null;
			setDragState(null);

			if (current.active) {
				const targetSq = getSquareFromClientPoint(e.clientX, e.clientY);
				if (targetSq && targetSq !== current.from) {
					const moved = attemptPlayerMove(current.from, targetSq, legalMovesRef.current);
					if (moved) return;
				}
				setSelectedSquare(targetSq === current.from ? current.from : null);
			} else if (current.wasAlreadySelected) {
				setSelectedSquare(null);
			}
		};

		const handleWindowPointerCancel = () => {
			pendingTouchTapRef.current = null;
			arrowDragRef.current = null;
			setArrowDragPreview(null);
			if (dragRafRef.current !== null) {
				window.cancelAnimationFrame(dragRafRef.current);
				dragRafRef.current = null;
			}
			dragRef.current = null;
			setDragState(null);
		};

		window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
		window.addEventListener('pointerup', handleWindowPointerUp);
		window.addEventListener('pointercancel', handleWindowPointerCancel);
		return () => {
			window.removeEventListener('pointermove', handleWindowPointerMove);
			window.removeEventListener('pointerup', handleWindowPointerUp);
			window.removeEventListener('pointercancel', handleWindowPointerCancel);
		};
	}, [attemptPlayerMove, finalizeArrowDrag, getSquareFromClientPoint, syncDragGhostTransform]);

	const handleSquarePointerDown = (
		e: ReactPointerEvent<HTMLButtonElement>,
		sq: Square,
		piece: { type: PieceSymbol; color: Color } | null
	) => {
		// Right-click drag OR Arrow Draw Mode (mobile/trackpad friendly) draws Chess.com arrows & highlights
		if (e.button === 2 || (e.button === 0 && arrowDrawModeRef.current)) {
			e.preventDefault();
			boardRectRef.current = boardWrapRef.current?.getBoundingClientRect() ?? null;
			const color = arrowColorFromModifiers(e);
			const nextArrow: ArrowDragState = { from: sq, to: sq, color };
			arrowDragRef.current = nextArrow;
			setArrowDragPreview(nextArrow);
			setSelectedSquare(null);
			return;
		}

		if (e.button !== 0) return;

		const isTouchPointer = e.pointerType === 'touch';

		// On desktop mouse/pen, clear annotations immediately; on touch, defer to tap release so vertical scroll doesn't accidentally clear arrows
		if (
			!isTouchPointer &&
			(boardArrows.length > 0 || squareHighlights.length > 0) &&
			!(selectedSquare && legalMovesByTarget.has(sq))
		) {
			setBoardArrows([]);
			setSquareHighlights([]);
		}

		if (
			isViewingHistory ||
			result !== null ||
			pendingPromotion !== null ||
			engineState === 'loading' ||
			engineState === 'error' ||
			snapshot.turn !== playerColor
		) {
			if (isTouchPointer && (boardArrows.length > 0 || squareHighlights.length > 0 || selectedSquare)) {
				pendingTouchTapRef.current = {
					pointerId: e.pointerId,
					sq,
					kind: 'deselect',
					fromSquare: null,
					startX: e.clientX,
					startY: e.clientY,
				};
			}
			return;
		}

		if (selectedSquare && legalMovesByTarget.has(sq)) {
			if (isTouchPointer) {
				pendingTouchTapRef.current = {
					pointerId: e.pointerId,
					sq,
					kind: 'move',
					fromSquare: selectedSquare,
					startX: e.clientX,
					startY: e.clientY,
				};
			} else {
				attemptPlayerMove(selectedSquare, sq, legalMovesByTarget);
			}
			return;
		}

		if (piece && piece.color === playerColor) {
			pendingTouchTapRef.current = null;
			if (boardArrows.length > 0 || squareHighlights.length > 0) {
				setBoardArrows([]);
				setSquareHighlights([]);
			}
			boardRectRef.current = boardWrapRef.current?.getBoundingClientRect() ?? null;
			dragCursorRef.current.x = e.clientX;
			dragCursorRef.current.y = e.clientY;
			const wasAlreadySelected = selectedSquare === sq;
			setSelectedSquare(sq);
			const nextDrag: DragState = {
				from: sq,
				piece: { type: piece.type, color: piece.color },
				startX: e.clientX,
				startY: e.clientY,
				active: false,
				hoverSquare: sq,
				wasAlreadySelected,
			};
			dragRef.current = nextDrag;
			return;
		}

		if (isTouchPointer) {
			pendingTouchTapRef.current = {
				pointerId: e.pointerId,
				sq,
				kind: 'deselect',
				fromSquare: null,
				startX: e.clientX,
				startY: e.clientY,
			};
		} else {
			setSelectedSquare(null);
		}
	};

	const handleCopyPgn = () => {
		const pgn = snapshot.pgnText || '*';
		navigator.clipboard
			?.writeText(pgn)
			.then(() => {
				setCopiedPgn(true);
				window.setTimeout(() => setCopiedPgn(false), 1800);
			})
			.catch(() => {});
	};

	const clearAllAnnotations = () => {
		setBoardArrows([]);
		setSquareHighlights([]);
		setArrowDragPreview(null);
		arrowDragRef.current = null;
	};

	const krisColor: Color = playerColor === 'w' ? 'b' : 'w';
	const topColor: Color = boardOrientation === 'w' ? 'b' : 'w';
	const bottomColor: Color = boardOrientation;

	const isPlayerTurn = snapshot.turn === playerColor && result === null;
	const isKrisThinking =
		result === null &&
		(isBookThinking || (snapshot.turn === krisColor && engineState === 'thinking'));
	const playerLead = playerColor === 'w' ? snapshot.materialDiff : -snapshot.materialDiff;
	const playerClockMs = playerColor === 'w' ? whiteMs : blackMs;
	const isPlayerClockLow = playerHasMoved && playerClockMs < 90_000;
	const {
		kris: krisMood,
		krisBubble: krisAvatarMood,
		challenger: challengerMood,
	} = deriveChessMoods({
		activeTier,
		result,
		playerColor,
		krisColor,
		viewTurn: snapshot.viewTurn,
		viewInCheck: snapshot.viewInCheck,
		playerLead,
		displayedPly,
		isViewingHistory,
		isKrisThinking,
		isPlayerClockLow,
		lastMove: snapshot.lastVerboseMove,
		prevMove: snapshot.prevVerboseMove,
		spokenMood: krisLine.line.mood,
	});

	const activeProfile = KRIS_PROFILES[activeTier];
	const opponentLabel = t(activeProfile.name);
	const opponentElo = activeProfile.elo;

	const getOutcomeHeadline = (res: GameResult) => {
		if (res.kind === 'draw') {
			const reasonLabel =
				res.reason === 'stalemate'
					? t({ en: 'Stalemate', id: 'Pat / Stalemate' })
					: res.reason === 'threefold'
						? t({ en: 'Threefold Repetition', id: 'Pengulangan 3 Kali' })
						: res.reason === 'insufficient'
							? t({ en: 'Insufficient Material', id: 'Materi Tidak Cukup' })
							: t({ en: '50-Move Rule', id: 'Aturan 50 Langkah' });
			return {
				badge: t({ en: 'DRAW', id: 'SERI' }),
				title: t({ en: `Draw · ${reasonLabel}`, id: `Seri · ${reasonLabel}` }),
				subtitle: t({
					en: `Balanced finish against ${opponentLabel} (${opponentElo} Elo).`,
					id: `Hasil imbang melawan ${opponentLabel} (${opponentElo} Elo).`,
				}),
				tone: 'yellow' as const,
			};
		}

		const playerWon = res.winner === playerColor;
		const reasonText =
			res.kind === 'checkmate'
				? t({ en: 'Checkmate', id: 'Skakmat' })
				: res.kind === 'timeout'
					? t({ en: 'Time Out', id: 'Waktu Habis' })
					: t({ en: 'Resignation', id: 'Menyerah' });

		if (playerWon) {
			return {
				badge: t({ en: 'VICTORY!', id: 'MENANG!' }),
				title: t({
					en: `You Beat ${opponentLabel} (${reasonText})`,
					id: `Kamu Menang Lawan ${opponentLabel} (${reasonText})`,
				}),
				subtitle: t({
					en: `Impressive win against ${opponentLabel} (${opponentElo} Elo).`,
					id: `Kemenangan mantap melawan ${opponentLabel} (${opponentElo} Elo).`,
				}),
				tone: 'green' as const,
			};
		}

		return {
			badge: t({ en: 'DEFEAT', id: 'KALAH' }),
			title: t({
				en: `${opponentLabel} (${opponentElo}) Wins · ${reasonText}`,
				id: `${opponentLabel} (${opponentElo}) Menang · ${reasonText}`,
			}),
			subtitle: t({
				en: 'Ready for a rematch with a fresh random side?',
				id: 'Siap tanding ulang dengan warna bidak acak baru?',
			}),
			tone: 'red' as const,
		};
	};

	const renderPlayerCard = (side: Color) => {
		const isKris = side === krisColor;
		const ms = side === 'w' ? whiteMs : blackMs;
		const isSideTurn = result === null && snapshot.turn === side;
		const isClockActivelyCounting = isSideTurn && playerHasMoved;
		const isLowClock = playerHasMoved && ms > 0 && ms < 60_000;
		const isClockZero = ms <= 0;
		const capturedList = side === 'w' ? snapshot.capturedByWhite : snapshot.capturedByBlack;
		const enemyColor: Color = side === 'w' ? 'b' : 'w';
		const lead = side === 'w' ? snapshot.materialDiff : -snapshot.materialDiff;

		return (
			<div
				className={`w-full rounded-sm border-[2.5px] sm:border-[3px] border-[#050505] px-2.5 py-1.5 sm:px-3 sm:py-1.5 flex items-center justify-between gap-2.5 transition-colors shadow-[4px_4px_0_#050505] ${
					isSideTurn ? 'bg-[#FFFFFF]' : 'bg-[#FCF0D3]'
				}`}
			>
				<div className='flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1'>
					<div
						className={`size-11 sm:size-12 rounded-md border-2 border-[#050505] shrink-0 overflow-hidden shadow-[2px_2px_0_#050505] ${
							isSideTurn ? 'ring-2 ring-[#FFD426]' : ''
						}`}
					>
						{isKris ? (
							<KristiantoAvatar mood={krisMood} tier={activeTier} />
						) : (
							<ChallengerAvatar mood={challengerMood} />
						)}
					</div>

					<div className='min-w-0 flex-1'>
						<div className='flex items-center gap-1.5 flex-wrap'>
							<span className='font-display font-black text-xs sm:text-sm text-[#050505] truncate leading-tight'>
								{isKris
									? opponentLabel
									: t({ en: 'You (Challenger)', id: 'Kamu (Penantang)' })}
							</span>

							{isKris && (
								<span
									className='px-1.5 py-0.5 rounded-sm border border-[#050505] font-mono text-[9px] font-black text-[#050505] leading-none shrink-0'
									style={{ backgroundColor: activeProfile.accentHex }}
								>
									{opponentElo}
								</span>
							)}

							<span
								className={`px-1.5 py-0.5 rounded-sm border border-[#050505] font-mono text-[9px] font-black leading-none shrink-0 ${
									side === 'w'
										? 'bg-[#FFFFFF] text-[#050505]'
										: 'bg-[#181A20] text-[#FCF0D3]'
								}`}
							>
								{side === 'w'
									? t({ en: 'WHITE', id: 'PUTIH' })
									: t({ en: 'BLACK', id: 'HITAM' })}
							</span>
						</div>

						<div className='flex items-center gap-1 mt-0.5 min-h-[16px] flex-wrap'>
							{capturedList.length > 0 ? (
								<div className='flex items-center -space-x-1'>
									{capturedList.map((pieceType, idx) => (
										<span key={`${pieceType}-${idx}`} className='size-3.5 sm:size-4 inline-block'>
											<ChessPieceSvg type={pieceType} color={enemyColor} />
										</span>
									))}
								</div>
							) : (
								<span className='font-mono text-[9.5px] sm:text-[10px] font-bold text-[#3B404C] truncate'>
									{isKris
										? t(activeProfile.tagline)
										: !playerHasMoved
											? t({
													en: 'Clock starts on your 1st move',
													id: 'Waktu jalan saat langkah ke-1',
												})
											: t({ en: 'Ready on the board', id: 'Siap bertanding' })}
								</span>
							)}
							{lead > 0 && (
								<span className='ml-0.5 px-1 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] font-mono text-[9px] font-black text-[#050505] leading-none'>
									+{lead}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Digital Rapid Clock */}
				<div
					className={`px-2 sm:px-2.5 py-1 rounded-sm border-2 border-[#050505] shadow-[2px_2px_0_#050505] font-mono text-xs sm:text-sm font-black tabular-nums tracking-tight shrink-0 flex items-center gap-1.5 ${
						isClockZero
							? 'bg-[#FD6141] text-[#050505]'
							: isClockActivelyCounting
								? isLowClock
									? 'bg-[#FD6141] text-[#050505] animate-pulse'
									: 'bg-[#5CE62E] text-[#050505]'
								: isSideTurn
									? 'bg-[#FFD426] text-[#050505]'
									: 'bg-[#F6EDD6] text-[#3B404C]'
					}`}
				>
					{isClockActivelyCounting && !isClockZero && (
						<span className='size-1.5 sm:size-2 rounded-full bg-[#050505] shrink-0 animate-pulse' />
					)}
					<span>{formatClock(ms)}</span>
				</div>
			</div>
		);
	};

	const outcomeBanner = result ? getOutcomeHeadline(result) : null;
	const dragPieceSize = Math.max(36, Math.round(boardPx / 8));
	const allRenderedArrows = arrowDragPreview && arrowDragPreview.from !== arrowDragPreview.to
		? [
				...boardArrows.filter(
					(a) => !(a.from === arrowDragPreview.from && a.to === arrowDragPreview.to)
				),
				{
					from: arrowDragPreview.from,
					to: arrowDragPreview.to,
					color: arrowDragPreview.color,
				},
			]
		: boardArrows;
	const annotationCount = boardArrows.length + squareHighlights.length;
	const hasMatchMoves = totalPlies > 0;

	const renderBoardViewport = (inFullscreen: boolean) => (
		<div
			className={`flex flex-col w-full mx-auto ${
				inFullscreen
					? 'gap-1.5 lg:max-w-[min(100%,max(280px,calc(min(97dvh,1040px)-214px)),800px)] max-lg:max-w-[540px]'
					: 'gap-2 lg:max-w-[min(100%,max(280px,calc(100dvh-325px)),540px)] max-lg:max-w-[520px]'
			}`}
		>
			{renderPlayerCard(topColor)}

			{/* Drafting Cream Bezel Framing the Chessboard */}
			<div className='relative w-full'>
				<div
					className='hidden sm:block absolute -top-2.5 left-4 z-20 px-2 py-0.5 bg-[#FFD426] border-2 border-[#050505] font-mono text-[10px] font-black text-[#050505] -rotate-2 shadow-[2px_2px_0_#050505] pointer-events-none select-none'
					aria-hidden='true'
				>
					{isViewingHistory
						? `PLY ${displayedPly}/${totalPlies}`
						: 'Fig.Board · 15:00'}
				</div>
				<SparkleStar
					className='hidden sm:block absolute -top-3 -right-3 size-6 z-20 pointer-events-none'
					fill='#FFFFFF'
				/>

				<div className='rounded-sm border-[2.5px] sm:border-[3.5px] border-[#050505] bg-[#FCF0D3] p-1 sm:p-2 shadow-[5px_5px_0_#050505] sm:shadow-[7px_7px_0_#050505]'>
					<div
						ref={boardWrapRef}
						onContextMenu={(e) => e.preventDefault()}
						className='relative aspect-square w-full border-[2.5px] sm:border-[3px] border-[#050505] bg-[#050505] overflow-hidden touch-pan-y select-none'
					>
						<div className='grid grid-cols-8 grid-rows-8 w-full h-full'>
							{Array.from({ length: 64 }, (_, idx) => {
								const rowIdx = Math.floor(idx / 8);
								const colIdx = idx % 8;
								const sq = squareFromCoords(rowIdx, colIdx, boardOrientation);
								const isLightSquare = (rowIdx + colIdx) % 2 === 0;

								const fileIdx = FILES.indexOf(sq[0] as (typeof FILES)[number]);
								const rankNum = Number.parseInt(sq[1], 10);
								const boardCell = snapshot.board[8 - rankNum]?.[fileIdx] ?? null;

								const isSelected = selectedSquare === sq;
								const isLastFrom = snapshot.lastMove?.from === sq;
								const isLastTo = snapshot.lastMove?.to === sq;
								const isCheckedKing = snapshot.checkedKingSquare === sq;
								const isLegalTarget = legalMovesByTarget.has(sq);
								const isDragOrigin = Boolean(dragState?.active && dragState.from === sq);
								const isDragHoverTarget = Boolean(
									dragState?.active && dragState.hoverSquare === sq && isLegalTarget
								);
								const userSquareMark = squareHighlights.find((h) => h.square === sq);

								const showRankLabel = colIdx === 0;
								const showFileLabel = rowIdx === 7;
								const coordColor = isLightSquare ? 'text-[#39754F]' : 'text-[#FCF0D3]';

								let squareBg = isLightSquare ? 'bg-[#FCF0D3]' : 'bg-[#39754F]';
								if (isCheckedKing) {
									squareBg = 'bg-[#FD6141]';
								} else if (isSelected) {
									squareBg = isLightSquare ? 'bg-[#94C9F2]' : 'bg-[#2C6EA8]';
								} else if (isLastFrom || isLastTo) {
									squareBg = isLightSquare ? 'bg-[#FFE57F]' : 'bg-[#748B2E]';
								}

								const canDragSquare =
									arrowDrawMode ||
									(!isViewingHistory &&
										isPlayerTurn &&
										pendingPromotion === null &&
										engineState !== 'loading' &&
										engineState !== 'error' &&
										Boolean(boardCell && boardCell.color === playerColor));

								return (
									<button
										key={sq}
										type='button'
										data-sfx='custom'
										data-chess-square='true'
										data-hover-sfx={
											boardCell && !dragState?.active && !arrowDrawMode
												? `chess-${boardCell.type}`
												: 'none'
										}
										aria-label={`Square ${sq}${
											boardCell
												? ` ${boardCell.color === 'w' ? 'white' : 'black'} ${boardCell.type}`
												: ''
										}`}
										onPointerDown={(e) => handleSquarePointerDown(e, sq, boardCell)}
										className={`relative flex items-center justify-center p-0 m-0 border-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFD426] ${squareBg} ${
											canDragSquare ? 'touch-none' : 'touch-pan-y'
										} ${
											arrowDrawMode
												? 'cursor-crosshair'
												: !isViewingHistory &&
													  isPlayerTurn &&
													  engineState !== 'loading' &&
													  engineState !== 'error' &&
													  ((boardCell && boardCell.color === playerColor) || isLegalTarget)
													? 'cursor-pointer'
													: 'cursor-default'
										}`}
									>
										{/* Subtle Cutting-Mat Micro Grid Lines on Dark Squares */}
										{!isLightSquare &&
											!isCheckedKing &&
											!isSelected &&
											!isLastFrom &&
											!isLastTo && (
												<span
													aria-hidden='true'
													className='pointer-events-none absolute inset-0 opacity-25'
													style={{
														backgroundImage:
															'linear-gradient(to right, rgba(155,224,178,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(155,224,178,0.45) 1px, transparent 1px)',
														backgroundSize: '100% 100%',
													}}
												/>
											)}

										{/* User Right-Click Square Highlight Overlay */}
										{userSquareMark && (
											<span
												aria-hidden='true'
												className='pointer-events-none absolute inset-0 z-10'
												style={{
													backgroundColor: ARROW_COLOR_HEX[userSquareMark.color].highlight,
												}}
											/>
										)}

										{/* Drag Hover Target Highlight */}
										{isDragHoverTarget && (
											<span
												aria-hidden='true'
												className='pointer-events-none absolute inset-0 border-[3px] border-[#050505] bg-[#FFD426]/45 z-10'
											/>
										)}

										{/* Rank Coordinate */}
										{showRankLabel && (
											<span
												aria-hidden='true'
												className={`pointer-events-none absolute top-[1.5px] left-[2.5px] sm:top-0.5 sm:left-1 font-mono text-[7.5px] sm:text-[10px] font-black leading-none z-10 ${
													isCheckedKing ? 'text-[#050505]' : coordColor
												}`}
											>
												{sq[1]}
											</span>
										)}

										{/* File Coordinate */}
										{showFileLabel && (
											<span
												aria-hidden='true'
												className={`pointer-events-none absolute bottom-[1.5px] right-[2.5px] sm:bottom-0.5 sm:right-1 font-mono text-[7.5px] sm:text-[10px] font-black leading-none z-10 ${
													isCheckedKing ? 'text-[#050505]' : coordColor
												}`}
											>
												{sq[0]}
											</span>
										)}

										{/* Chess Piece SVG */}
										{boardCell && (
											<span
												className={`relative z-10 w-[76%] h-[76%] sm:w-[82%] sm:h-[82%] transition-opacity duration-75 pointer-events-none ${
													isDragOrigin ? 'opacity-25' : 'opacity-100'
												}`}
											>
												<ChessPieceSvg type={boardCell.type} color={boardCell.color} />
											</span>
										)}

										{/* Legal Move Hints */}
										{isLegalTarget && !boardCell && (
											<span
												aria-hidden='true'
												className='pointer-events-none relative z-20 size-[29%] rounded-full bg-[#5CE62E] border-2 border-[#050505] shadow-[1.5px_1.5px_0_#050505]'
											/>
										)}
										{isLegalTarget && boardCell && (
											<span
												aria-hidden='true'
												className='pointer-events-none absolute inset-[5%] z-20 rounded-full border-[3.5px] border-[#FD6141] shadow-[inset_0_0_0_1px_#050505]'
											/>
										)}
									</button>
								);
							})}
						</div>

						{/* Chess.com-Style Vector Arrows Overlay (Right-drag or Arrow Draw Mode) */}
						{(allRenderedArrows.length > 0 || arrowDragPreview) && (
							<svg
								viewBox='0 0 800 800'
								className='pointer-events-none absolute inset-0 w-full h-full z-25'
								aria-hidden='true'
							>
								{allRenderedArrows.map((arrow) => {
									const geom = buildArrowSvgGeometry(arrow.from, arrow.to, boardOrientation);
									if (!geom) return null;
									const palette = ARROW_COLOR_HEX[arrow.color];
									const isPreview =
										arrowDragPreview &&
										arrowDragPreview.from === arrow.from &&
										arrowDragPreview.to === arrow.to;
									return (
										<g
											key={`${arrow.from}-${arrow.to}-${arrow.color}`}
											opacity={isPreview ? 0.65 : 0.92}
										>
											<path
												d={geom.pathD}
												fill='none'
												stroke={palette.stroke}
												strokeWidth='17'
												strokeLinecap='round'
												strokeLinejoin='round'
											/>
											<polygon points={geom.headPoints} fill={palette.fill} />
										</g>
									);
								})}
							</svg>
						)}

						{/* Engine Loading / Error Retro OS Overlay */}
						{(engineState === 'loading' || engineState === 'error') && (
							<div className='absolute inset-0 z-30 bg-[#050505]/65 backdrop-blur-[1px] flex items-center justify-center p-4'>
								<div className='w-full max-w-xs ds-os-window rounded-sm overflow-hidden text-[#050505]'>
									<div className='px-3 py-1.5 bg-[#FFD426] border-b-[3px] border-[#050505] flex items-center justify-between gap-2'>
										<span className='font-mono text-[10px] font-black uppercase shrink-0'>
											KRIS_CHESS.EXE
										</span>
										<div className='flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
										<span className='font-mono text-[10px] font-black shrink-0'>
											{opponentElo} ELO
										</span>
									</div>
									<div className='p-4 bg-[#FCF0D3] text-center space-y-2.5'>
										{engineState === 'loading' ? (
											<>
												<p className='font-display font-black text-sm'>
													{t({
														en: `Initializing ${opponentLabel} (${opponentElo} Elo)...`,
														id: `Menyiapkan ${opponentLabel} (${opponentElo} Elo)...`,
													})}
												</p>
												<div className='w-full h-3 rounded-sm border-2 border-[#050505] bg-white overflow-hidden'>
													<div
														className='h-full bg-[#5CE62E] transition-all duration-150'
														style={{ width: `${Math.max(18, downloadPct)}%` }}
													/>
												</div>
												<p className='font-mono text-[10px] font-bold text-[#3B404C]'>
													{downloadPct >= 100
														? t({
																en: 'Compiling WebAssembly...',
																id: 'Menyiapkan WebAssembly...',
															})
														: downloadPct > 0
															? `${downloadPct}% · 1.8 MB Chess Core`
															: t({
																	en: 'Fetching 1.8 MB WASM worker (only once)...',
																	id: 'Mengunduh modul WASM 1,8 MB (cukup sekali)...',
																})}
												</p>
											</>
										) : (
											<>
												<p className='font-display font-black text-sm text-[#C5432F]'>
													{t({
														en: 'Failed to load chess engine.',
														id: 'Gagal memuat engine catur.',
													})}
												</p>
												<button
													type='button'
													data-sfx='keycap'
													onClick={() => {
														setEngineState('loading');
														setDownloadPct(0);
														setEngineBootKey((k) => k + 1);
													}}
													className='px-4 py-1.5 rounded-lg border-2 border-[#050505] bg-[#FFD426] hover:bg-[#5CE62E] font-display text-xs font-black shadow-[3px_3px_0_#050505] cursor-pointer'
												>
													{t({ en: 'Retry Engine', id: 'Coba Muat Ulang' })}
												</button>
											</>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Pawn Promotion Picker Overlay */}
						{pendingPromotion && !isViewingHistory && (
							<div
								className='absolute inset-0 z-30 bg-[#050505]/65 flex items-center justify-center p-4'
								onClick={() => setPendingPromotion(null)}
							>
								<div
									className='ds-os-window rounded-sm overflow-hidden text-[#050505] w-full max-w-[270px]'
									onClick={(e) => e.stopPropagation()}
								>
									<div className='px-3 py-1.5 bg-[#4D9DE0] border-b-[3px] border-[#050505] flex items-center justify-between gap-2'>
										<span className='font-mono text-[10px] font-black uppercase shrink-0'>
											{t({ en: 'PROMOTE PAWN', id: 'PROMOSI BIDAK' })}
										</span>
										<div className='flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
										<button
											type='button'
											data-sfx='close'
											onClick={() => setPendingPromotion(null)}
											className='size-4 rounded-sm bg-[#FCF0D3] border border-[#050505] font-mono text-[9px] font-black leading-none cursor-pointer shrink-0'
											aria-label='Cancel promotion'
										>
											✕
										</button>
									</div>
									<div className='p-3 bg-[#FCF0D3] grid grid-cols-4 gap-2'>
										{PROMOTION_PIECES.map((promoType) => (
											<button
												key={promoType}
												type='button'
												data-sfx='custom'
												data-hover-sfx={`chess-${promoType}`}
												onClick={() =>
													commitPlayerMove(
														pendingPromotion.from,
														pendingPromotion.to,
														promoType
													)
												}
												className='aspect-square rounded-md border-2 border-[#050505] bg-white hover:bg-[#FFD426] p-1.5 shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
												aria-label={`Promote to ${promoType}`}
											>
												<ChessPieceSvg type={promoType} color={playerColor} />
											</button>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Game Over Retro OS Modal Overlay */}
						{outcomeBanner && !dismissedEndModal && !isViewingHistory && (
							<div className='absolute inset-0 z-30 bg-[#050505]/60 flex items-center justify-center p-4'>
								<div className='ds-os-window rounded-sm overflow-hidden text-[#050505] w-full max-w-xs'>
									<div
										className={`px-3 py-1.5 border-b-[3px] border-[#050505] flex items-center justify-between gap-2 ${
											outcomeBanner.tone === 'green'
												? 'bg-[#5CE62E]'
												: outcomeBanner.tone === 'red'
													? 'bg-[#FD6141]'
													: 'bg-[#FFD426]'
										}`}
									>
										<span className='font-mono text-[11px] font-black uppercase shrink-0'>
											MATCH_RESULT · {outcomeBanner.badge}
										</span>
										<div className='flex-1 h-2 ds-titlebar-grips' aria-hidden='true' />
										<button
											type='button'
											data-sfx='close'
											onClick={() => setDismissedEndModal(true)}
											aria-label='Inspect board'
											className='size-5 rounded-sm bg-[#FCF0D3] border border-[#050505] font-mono text-[10px] font-black leading-none cursor-pointer shrink-0'
										>
											✕
										</button>
									</div>
									<div className='p-4 bg-[#FCF0D3] text-center space-y-3'>
										<div>
											<h4 className='font-display font-black text-base sm:text-lg leading-snug'>
												{outcomeBanner.title}
											</h4>
											<p className='text-xs text-[#3B404C] mt-1 leading-relaxed'>
												{outcomeBanner.subtitle}
											</p>
										</div>
										<div className='flex flex-col sm:flex-row gap-2'>
											<button
												type='button'
												data-sfx='keycap'
												onClick={() => void startNewMatch()}
												className='flex-1 py-2 px-3 rounded-lg border-2 border-[#050505] bg-[#5CE62E] hover:bg-[#FFD426] font-display text-xs font-black shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all cursor-pointer'
											>
												{t({ en: '↻ Play Again', id: '↻ Main Lagi' })}
											</button>
											<button
												type='button'
												data-sfx='close'
												onClick={() => setDismissedEndModal(true)}
												className='py-2 px-3 rounded-lg border-2 border-[#050505] bg-white hover:bg-[#FFD426] font-mono text-[11px] font-black shadow-[3px_3px_0_#050505] cursor-pointer'
											>
												{t({ en: 'View Board', id: 'Lihat Papan' })}
											</button>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{renderPlayerCard(bottomColor)}
		</div>
	);

	const renderSidebarConsole = (inFullscreen: boolean) => (
		<div
			className={`flex flex-col gap-2.5 ${
				inFullscreen ? 'lg:h-full lg:min-h-0' : 'lg:h-full lg:min-h-0'
			}`}
		>
			{/* Opponent Difficulty Switcher: Unc Kris (1900) / Teen Kris (1500) / Lil' Kris (1000) */}
			<div className='rounded-sm border-[2.5px] border-[#050505] bg-[#FCF0D3] p-1.5 shadow-[3px_3px_0_#050505]'>
				<div className='mb-1 flex items-center justify-between px-0.5 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-[#3B404C]'>
					<span>{t({ en: 'OPPONENT LEVEL', id: 'LEVEL LAWAN' })}</span>
					<span className='text-[#050505]'>
						{pendingTierConfirm
							? t({ en: 'CLICK AGAIN TO SWITCH', id: 'KLIK LAGI UTK GANTI' })
							: `${opponentLabel} · ${opponentElo}`}
					</span>
				</div>
				<div className='grid grid-cols-3 gap-1.5'>
					{KRIS_TIER_ORDER.map((tierId) => {
						const prof = KRIS_PROFILES[tierId];
						const isSelected = activeTier === tierId;
						const isConfirming = pendingTierConfirm === tierId;
						return (
							<button
								key={tierId}
								type='button'
								data-sfx='switch'
								aria-pressed={isSelected}
								onClick={() => handleSelectTier(tierId)}
								style={
									isConfirming
										? { backgroundColor: '#FD6141' }
										: isSelected
											? { backgroundColor: prof.accentHex }
											: undefined
								}
								className={`px-2 py-1 rounded-sm border-2 border-[#050505] text-left transition-all cursor-pointer ${
									isSelected
										? 'translate-y-[1px] shadow-none text-[#050505]'
										: isConfirming
											? 'text-[#050505] shadow-[2px_2px_0_#050505]'
											: 'bg-[#FFFFFF] hover:bg-[#FCF0D3] text-[#050505] shadow-[2px_2px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none'
								}`}
							>
								<span className='block font-display text-[10.5px] sm:text-[11px] font-black leading-tight truncate'>
									{isConfirming
										? t({ en: 'Switch?', id: 'Ganti?' })
										: t(prof.pillLabel)}
								</span>
								<span className='block font-mono text-[9px] font-black leading-tight opacity-85'>
									{prof.elo} ELO
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{/* Chess.com-style Opponent Character & Live Dialogue Bubble */}
			<div className='flex items-start gap-3 pb-1'>
				<div className='relative shrink-0'>
					<div className='h-16 w-16 sm:h-[68px] sm:w-[68px] overflow-hidden border-[2.5px] border-[#050505] bg-[#FFFDF5] shadow-[3px_3px_0_#050505]'>
						<KristiantoAvatar mood={krisAvatarMood} tier={activeTier} className='h-full w-full' />
					</div>
					<span
						style={{ backgroundColor: '#050505', color: activeProfile.accentHex }}
						className='absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-[1.5px] border-[#050505] px-1.5 py-[1px] font-mono text-[9px] font-black tracking-wider whitespace-nowrap shadow-[1.5px_1.5px_0_#FFD426]'
						aria-label={`${opponentElo} Elo`}
					>
						{opponentElo}
					</span>
				</div>

				<div className='relative flex-1 min-w-0 min-h-[68px] flex flex-col justify-center rounded-xl border-[2.5px] border-[#050505] bg-[#FFFFFF] px-3.5 py-2 shadow-[4px_4px_0_#050505]'>
					{/* Left-pointing comic speech tail overlapping left ink border cleanly */}
					<svg
						width='12'
						height='16'
						viewBox='0 0 12 16'
						aria-hidden='true'
						className='pointer-events-none absolute top-4 -left-[11px]'
					>
						<path d='M12 1 L1 8 L12 15 Z' fill='#FFFFFF' />
						<path
							d='M12 1.3 L1.5 8 L12 14.7'
							fill='none'
							stroke='#050505'
							strokeWidth='2.5'
							strokeLinejoin='round'
						/>
					</svg>
					<div className='mb-0.5 flex items-center justify-between gap-2'>
						<span className='font-mono text-[9px] font-black uppercase tracking-[0.14em] text-[#555555]'>
							{opponentLabel} · {opponentElo}
						</span>
						{isKrisThinking && (
							<span className='inline-flex items-center gap-1 border border-[#050505] bg-[#FFD426] px-1.5 py-[1px] font-mono text-[8.5px] font-black uppercase tracking-[0.12em] text-[#050505]'>
								<span className='h-1.5 w-1.5 rounded-full bg-[#050505] animate-pulse' />
								{t({ en: 'THINKING', id: 'MIKIR' })}
							</span>
						)}
					</div>
					<p
						key={krisLine.seq}
						className='text-[12.5px] sm:text-[13px] font-semibold leading-snug text-[#050505]'
						aria-live='polite'
					>
						{t(krisLine.line.text)}
					</p>
				</div>
			</div>

			{/* Live Status / History Banner */}
			<div
				className={`rounded-sm border-[2.5px] sm:border-[3px] border-[#050505] px-3 py-2 shadow-[4px_4px_0_#050505] flex items-center justify-between gap-2 font-mono text-xs transition-colors ${
					isViewingHistory
						? 'bg-[#94C9F2]'
						: outcomeBanner
							? outcomeBanner.tone === 'green'
								? 'bg-[#5CE62E]'
								: outcomeBanner.tone === 'red'
									? 'bg-[#FD6141]'
									: 'bg-[#FFD426]'
							: snapshot.liveInCheck
								? 'bg-[#FD6141]'
								: isKrisThinking
									? 'bg-[#FFD426]'
									: 'bg-[#FCF0D3]'
				}`}
			>
				<div className='flex items-center gap-2 min-w-0 flex-1'>
					{isViewingHistory ? (
						<>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-black shrink-0'>
								{t({ en: 'HISTORY', id: 'RIWAYAT' })} {displayedPly}/{totalPlies}
							</span>
							<span className='text-[#050505] font-bold truncate'>
								{t({ en: 'Reviewing past move', id: 'Melihat langkah lalu' })}
							</span>
						</>
					) : outcomeBanner ? (
						<>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-black shrink-0'>
								{outcomeBanner.badge}
							</span>
							<span className='text-[#050505] font-black truncate'>
								{outcomeBanner.title}
							</span>
						</>
					) : snapshot.liveInCheck ? (
						<>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-black shrink-0'>
								{t({ en: 'CHECK!', id: 'SKAK!' })}
							</span>
							<span className='text-[#050505] font-black truncate'>
								{isPlayerTurn
									? t({ en: 'Defend your King!', id: 'Lindungi Rajamu!' })
									: t({
											en: `${opponentLabel} is under check...`,
											id: `${opponentLabel} dalam posisi skak...`,
										})}
							</span>
						</>
					) : isKrisThinking ? (
						<>
							<span className='px-2 py-0.5 rounded-sm bg-[#050505] text-[#FFD426] font-black shrink-0'>
								{t({ en: 'THINKING', id: 'MIKIR' })}
							</span>
							<span className='text-[#050505] font-black truncate'>
								{t({
									en: `${opponentLabel} (${opponentElo}) calculating...`,
									id: `${opponentLabel} (${opponentElo}) menghitung...`,
								})}
							</span>
						</>
					) : (
						<>
							<span className='px-2 py-0.5 rounded-sm bg-[#5CE62E] border border-[#050505] text-[#050505] font-black shrink-0'>
								● {t({ en: 'YOUR TURN', id: 'GILIRANMU' })}
							</span>
							<span className='text-[#050505] font-bold truncate'>
								{!playerHasMoved
									? t({
											en: 'Clock starts on 1st move',
											id: 'Jam mulai di langkah ke-1',
										})
									: t({
											en: 'Tap or drag a piece',
											id: 'Klik atau geser bidak',
										})}
							</span>
						</>
					)}
				</div>

				{isViewingHistory && (
					<button
						type='button'
						data-sfx='keycap'
						onClick={() => goToPly(null)}
						className='px-2 py-0.5 rounded-sm border-2 border-[#050505] bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] font-mono text-[10px] font-black shrink-0 cursor-pointer shadow-[1.5px_1.5px_0_#050505]'
					>
						LIVE ▸|
					</button>
				)}
			</div>

			{/* Primary Controls: New Match (with confirm guard), Flip Board, Resign (with confirm guard) */}
			<div className='grid grid-cols-3 gap-2'>
				<button
					type='button'
					data-sfx={
						confirmNewMatch || !playerHasMoved || result !== null ? 'keycap' : 'switch'
					}
					onClick={handleNewMatchClick}
					className={`h-[38px] sm:h-[40px] px-2 rounded-xl border-[2.5px] sm:border-[3px] border-[#050505] font-display text-[11px] sm:text-xs font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer transition-all ${
						confirmNewMatch
							? 'bg-[#FFD426] text-[#050505] shadow-[3px_3px_0_#050505] animate-pulse'
							: 'bg-[#5CE62E] hover:bg-[#FFD426] text-[#050505] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none'
					}`}
				>
					{confirmNewMatch
						? t({ en: '↻ Confirm?', id: '↻ Yakin?' })
						: t({ en: '↻ New Match', id: '↻ Main Baru' })}
				</button>

				<button
					type='button'
					data-sfx='shutter'
					onClick={() => setBoardOrientation((o) => (o === 'w' ? 'b' : 'w'))}
					className='h-[38px] sm:h-[40px] px-2 rounded-xl bg-[#FCF0D3] hover:bg-[#FFD426] text-[#050505] border-[2.5px] sm:border-[3px] border-[#050505] font-display text-[11px] sm:text-xs font-black leading-none whitespace-nowrap flex items-center justify-center cursor-pointer shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none transition-all'
				>
					{t({ en: '⇅ Flip', id: '⇅ Balik' })}
				</button>

				<button
					type='button'
					data-sfx={confirmResign ? 'custom' : 'switch'}
					data-hover-sfx='switch'
					disabled={result !== null || engineState === 'loading' || !playerHasMoved}
					onClick={handleResignClick}
					className={`h-[38px] sm:h-[40px] px-2 rounded-xl border-[2.5px] sm:border-[3px] border-[#050505] font-display text-[11px] sm:text-xs font-black leading-none whitespace-nowrap flex items-center justify-center transition-all ${
						result !== null || engineState === 'loading' || !playerHasMoved
							? 'bg-[#F6EDD6] text-[#050505]/35 cursor-not-allowed shadow-none'
							: confirmResign
								? 'bg-[#FD6141] text-[#050505] shadow-[3px_3px_0_#050505] cursor-pointer animate-pulse'
								: 'bg-[#FFFFFF] hover:bg-[#FD6141] text-[#050505] shadow-[3px_3px_0_#050505] hover:-translate-y-0.5 active:translate-y-[1px] active:shadow-none cursor-pointer'
					}`}
				>
					{confirmResign
						? t({ en: '⚑ Confirm?', id: '⚑ Yakin?' })
						: t({ en: '⚑ Resign', id: '⚑ Menyerah' })}
				</button>
			</div>

			{/* Chess.com-style Annotation Bar (Right-drag + Touch Arrow Draw Toggle + Clear) */}
			<div className='flex items-center gap-2'>
				<button
					type='button'
					data-sfx='switch'
					aria-pressed={arrowDrawMode}
					onClick={() => {
						setArrowDrawMode((v) => !v);
						setSelectedSquare(null);
					}}
					className={`flex-1 h-[34px] px-2.5 rounded-lg border-2 border-[#050505] font-mono text-[11px] font-black leading-none flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
						arrowDrawMode
							? 'bg-[#4D9DE0] text-[#050505] shadow-[2px_2px_0_#050505]'
							: 'bg-[#FCF0D3] hover:bg-[#FFD426] text-[#050505] shadow-[2px_2px_0_#050505]'
					}`}
				>
					<ArrowDrawIcon />
					<span>
						{arrowDrawMode
							? t({ en: 'Arrow Mode: ON (Drag)', id: 'Mode Panah: AKTIF' })
							: t({ en: 'Draw Arrows (Right-Drag)', id: 'Gambar Panah (Klik Kanan)' })}
					</span>
				</button>

				{annotationCount > 0 && (
					<button
						type='button'
						data-sfx='close'
						onClick={clearAllAnnotations}
						className='h-[34px] px-2.5 rounded-lg border-2 border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] text-[#050505] font-mono text-[11px] font-black leading-none whitespace-nowrap cursor-pointer shadow-[2px_2px_0_#050505]'
					>
						{t({ en: `✕ Clear (${annotationCount})`, id: `✕ Hapus (${annotationCount})` })}
					</button>
				)}
			</div>

			{/* Retro OS Move History Log + Chess.com History Navigator Strip */}
			<div className='ds-os-window rounded-sm overflow-hidden flex-1 flex flex-col min-h-0'>
				<div className='flex items-center justify-between gap-2 px-3 py-1.5 bg-[#1A2636] border-b-[3px] border-[#050505] shrink-0'>
					<div className='flex items-center gap-2 min-w-0 flex-1'>
						<span className='size-2.5 rounded-full bg-[#FFD426] border border-[#050505] shrink-0' />
						<span className='font-mono text-[11px] font-black text-[#FFD426] shrink-0'>
							MOVES.PGN
						</span>
						<div className='hidden sm:block flex-1 border-t border-[#FCF0D3]/20' aria-hidden='true' />
					</div>

					<div className='flex items-center gap-1.5 shrink-0'>
						<span className='px-1.5 py-0.5 rounded-none bg-[#050505] border border-[#FCF0D3]/25 font-mono text-[10px] font-black text-[#5CE62E] tabular-nums'>
							PLY {snapshot.plyCount}
						</span>
						<button
							type='button'
							data-sfx='copy'
							disabled={snapshot.plyCount === 0}
							onClick={handleCopyPgn}
							className='px-2 py-0.5 rounded-sm border-2 border-[#050505] bg-[#FCF0D3] hover:bg-[#FFD426] font-mono text-[10px] font-black text-[#050505] disabled:opacity-45 cursor-pointer disabled:cursor-not-allowed transition-colors'
						>
							{copiedPgn
								? t({ en: '✓ COPIED', id: '✓ TERSALIN' })
								: t({ en: 'COPY PGN', id: 'SALIN PGN' })}
						</button>
					</div>
				</div>

				<div
					ref={moveListRef}
					className={`substrate-legal-pad overflow-y-auto overscroll-contain p-2.5 sm:pl-14 font-mono text-xs text-[#050505] ${
						inFullscreen
							? 'h-[120px] sm:h-[150px] lg:h-auto lg:flex-1 lg:min-h-[140px]'
							: 'h-[175px] sm:h-[210px] lg:flex-1 lg:min-h-[150px]'
					}`}
				>
					{snapshot.movePairs.length === 0 ? (
						<div className='h-full flex flex-col items-center justify-center text-center px-3 space-y-1.5'>
							<p className='font-display font-black text-xs sm:text-sm text-[#050505]'>
								{playerColor === 'w'
									? t({
											en: 'You play White. Make your opening move!',
											id: 'Kamu memegang Putih. Silakan mulai langkah pembuka!',
										})
									: t({
											en: `${opponentLabel} opens as White. Your turn next!`,
											id: `${opponentLabel} membuka dengan Putih. Kini giliranmu!`,
										})}
							</p>
							<p className='text-[10.5px] font-bold text-[#3B404C]'>
								{t({
									en: 'Your 15:00 clock stays paused until your 1st move.',
									id: 'Waktu 15:00 belum berjalan hingga langkah pertamamu.',
								})}
							</p>
						</div>
					) : (
						<div className='space-y-1'>
							{snapshot.movePairs.map((pair, idx) => {
								const whitePly = idx * 2 + 1;
								const blackPly = idx * 2 + 2;
								const isWhiteActive = displayedPly === whitePly;
								const isBlackActive = displayedPly === blackPly;
								return (
									<div
										key={pair.moveNo}
										className='grid grid-cols-[2.25rem_1fr_1fr] items-center gap-1.5 px-1.5 py-0.5 rounded-sm odd:bg-[#050505]/[0.04]'
									>
										<span className='font-black text-[#3B404C] tabular-nums'>
											{pair.moveNo}.
										</span>
										{pair.white ? (
											<button
												type='button'
												data-ply={whitePly}
												data-sfx='paper'
												onClick={() => goToPly(whitePly)}
												className={`text-left px-1.5 py-0.5 rounded-sm font-black cursor-pointer transition-colors ${
													isWhiteActive
														? 'bg-[#FFD426] border border-[#050505] text-[#050505]'
														: 'text-[#050505] hover:bg-[#FFD426]/40'
												}`}
											>
												{pair.white}
											</button>
										) : (
											<span />
										)}
										{pair.black ? (
											<button
												type='button'
												data-ply={blackPly}
												data-sfx='paper'
												onClick={() => goToPly(blackPly)}
												className={`text-left px-1.5 py-0.5 rounded-sm font-black cursor-pointer transition-colors ${
													isBlackActive
														? 'bg-[#FFD426] border border-[#050505] text-[#050505]'
														: 'text-[#204275] hover:bg-[#FFD426]/40'
												}`}
											>
												{pair.black}
											</button>
										) : (
											<span />
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Chess.com-style History Navigation Stepper Bar (|<  <  >  >|) */}
				<div className='px-2.5 py-1.5 bg-[#FCF0D3] border-t-[3px] border-[#050505] grid grid-cols-4 gap-1.5 shrink-0'>
					<button
						type='button'
						data-sfx='shutter'
						disabled={!hasMatchMoves || displayedPly === 0}
						onClick={() => goToPly(0)}
						aria-label={t({ en: 'First position', id: 'Posisi awal' })}
						title={t({ en: 'Start (Home)', id: 'Awal (Home)' })}
						className='h-8 rounded border-2 border-[#050505] bg-white hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-white font-mono text-xs font-black text-[#050505] cursor-pointer disabled:cursor-not-allowed shadow-[1.5px_1.5px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all'
					>
						|&lt;
					</button>
					<button
						type='button'
						data-sfx='shutter'
						disabled={!hasMatchMoves || displayedPly === 0}
						onClick={() => goToPly(displayedPly - 1)}
						aria-label={t({ en: 'Previous move', id: 'Langkah sebelumnya' })}
						title={t({ en: 'Back (←)', id: 'Mundur (←)' })}
						className='h-8 rounded border-2 border-[#050505] bg-white hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-white font-mono text-xs font-black text-[#050505] cursor-pointer disabled:cursor-not-allowed shadow-[1.5px_1.5px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all'
					>
						&lt;
					</button>
					<button
						type='button'
						data-sfx='shutter'
						disabled={!hasMatchMoves || displayedPly >= totalPlies}
						onClick={() => goToPly(displayedPly + 1)}
						aria-label={t({ en: 'Next move', id: 'Langkah berikutnya' })}
						title={t({ en: 'Forward (→)', id: 'Maju (→)' })}
						className='h-8 rounded border-2 border-[#050505] bg-white hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-white font-mono text-xs font-black text-[#050505] cursor-pointer disabled:cursor-not-allowed shadow-[1.5px_1.5px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all'
					>
						&gt;
					</button>
					<button
						type='button'
						data-sfx='shutter'
						disabled={!hasMatchMoves || displayedPly >= totalPlies}
						onClick={() => goToPly(null)}
						aria-label={t({ en: 'Latest live position', id: 'Posisi terbaru' })}
						title={t({ en: 'Live (End)', id: 'Terbaru (End)' })}
						className={`h-8 rounded border-2 border-[#050505] font-mono text-xs font-black text-[#050505] cursor-pointer disabled:cursor-not-allowed shadow-[1.5px_1.5px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all ${
							isViewingHistory
								? 'bg-[#5CE62E] hover:bg-[#FFD426]'
								: 'bg-white hover:bg-[#FFD426] disabled:opacity-40 disabled:hover:bg-white'
						}`}
					>
						&gt;|
					</button>
				</div>

				{/* Compact Rules & Tip Footer inside MOVES.PGN */}
				<div className='px-3 py-1.5 bg-[#F6EDD6] border-t-2 border-[#050505]/20 font-mono text-[10px] text-[#3B404C] shrink-0 leading-snug'>
					<span className='font-black text-[#050505]'>15+0 RAPID · RANDOM SIDE:</span>{' '}
					<span>
						{t({
							en: 'Clock starts on 1st move · Right-drag or Arrow Mode to mark · ←/→ steps moves.',
							id: 'Waktu mulai di langkah ke-1 · Klik kanan / Mode Panah utk tandai · ←/→ tinjau langkah.',
						})}
					</span>
				</div>
			</div>
		</div>
	);

	const renderHeaderToolbar = (inFullscreen: boolean) => (
		<div
			className={`border-[2.5px] sm:border-[3px] border-[#050505] px-2 sm:px-3.5 lg:px-4 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 shrink-0 ${
				inFullscreen
					? 'bg-[#FFD426] rounded-none border-x-0 border-t-0'
					: 'bg-[#FCF0D3] rounded-sm shadow-[4px_4px_0_#050505]'
			}`}
		>
			<div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
				<span className='px-1.5 sm:px-2 py-0.5 bg-[#050505] text-[#FFD426] font-mono text-[9.5px] sm:text-[10px] font-black tracking-wide shrink-0'>
					{inFullscreen ? (
						<>
							<span className='md:hidden'>CHESS.EXE</span>
							<span className='hidden md:inline xl:hidden'>KRIS_CHESS.EXE</span>
							<span className='hidden xl:inline'>KRIS_CHESS_STUDIO.EXE</span>
						</>
					) : (
						'FIG.CHESS'
					)}
				</span>
				<h3
					className={`font-display font-black text-sm sm:text-base text-[#050505] leading-tight truncate ${
						inFullscreen ? 'hidden lg:block' : ''
					}`}
				>
					{t({
						en: `Chess vs ${opponentLabel}`,
						id: `Catur Lawan ${opponentLabel}`,
					})}
				</h3>
				{inFullscreen && (
					<div className='hidden lg:block flex-1 h-2.5 ds-titlebar-grips mx-1' aria-hidden='true' />
				)}
			</div>

			<div className='flex flex-wrap items-center justify-end gap-1 sm:gap-1.5 select-none shrink-0'>
				<span
					className={`inline-flex items-center gap-1 sm:gap-1.5 h-6 sm:h-7 px-2 rounded-sm border-2 border-[#050505] font-mono text-[9.5px] sm:text-[10px] font-black leading-none ${
						engineState === 'error'
							? 'bg-[#FD6141] text-[#050505]'
							: engineState === 'loading' || isKrisThinking
								? 'bg-[#3886C0] text-[#FFFFFF]'
								: 'bg-[#FCF0D3] text-[#050505]'
					}`}
				>
					<span
						className={`size-2 rounded-full border border-[#050505] shrink-0 ${
							engineState === 'error'
								? 'bg-[#FFFFFF]'
								: engineState === 'loading' || isKrisThinking
									? 'bg-[#FFD426] animate-pulse'
									: 'bg-[#5CE62E]'
						}`}
					/>
					{engineState === 'loading' ? (
						downloadPct > 0 && downloadPct < 100
							? `WASM ${downloadPct}%`
							: t({ en: 'LOADING...', id: 'MEMUAT...' })
					) : engineState === 'error' ? (
						t({ en: 'ERROR', id: 'GAGAL' })
					) : isKrisThinking ? (
						t({
							en: 'THINKING...',
							id: 'MIKIR...',
						})
					) : (
						<>
							<span className={inFullscreen ? 'md:hidden' : 'sm:hidden'}>
								{t({ en: 'READY', id: 'SIAP' })}
							</span>
							<span className={inFullscreen ? 'hidden md:inline' : 'hidden sm:inline'}>
								{`${opponentElo} ELO · 15+0`}
							</span>
						</>
					)}
				</span>

				{inFullscreen && (
					<>
						<LanguageSwitchPill variant='chess' />
						<BgmToggleButton variant='chess' />
						<SfxToggleButton variant='chess' />
					</>
				)}

				{inFullscreen ? (
					<button
						type='button'
						data-sfx='custom'
						data-hover-sfx='close'
						onClick={exitFullscreen}
						className='inline-flex items-center gap-1 sm:gap-1.5 h-6 sm:h-7 px-2 sm:px-2.5 lg:px-3 rounded-sm border-2 border-[#050505] bg-[#FD6141] hover:bg-[#FFD426] text-[#050505] font-display text-[10px] sm:text-xs font-black leading-none cursor-pointer shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap'
					>
						<FullscreenExitIcon />
						<span className='md:hidden'>{t({ en: 'Exit', id: 'Keluar' })}</span>
						<span className='hidden md:inline'>
							{t({ en: 'Exit Fullscreen', id: 'Keluar Penuh' })}
						</span>
					</button>
				) : (
					<button
						type='button'
						data-sfx='custom'
						data-hover-sfx='switch'
						onClick={enterFullscreen}
						className='inline-flex items-center gap-1.5 h-6 sm:h-7 px-2 sm:px-2.5 rounded-sm border-2 border-[#050505] bg-[#FFD426] hover:bg-[#5CE62E] text-[#050505] font-display text-[10px] sm:text-[11px] font-black leading-none cursor-pointer shadow-[2px_2px_0_#050505] active:translate-y-[1px] active:shadow-none transition-all whitespace-nowrap'
					>
						<FullscreenExpandIcon />
						<span>{t({ en: 'Fullscreen', id: 'Layar Penuh' })}</span>
					</button>
				)}
			</div>
		</div>
	);

	const dragGhostOverlay =
		dragState?.active && typeof document !== 'undefined'
			? createPortal(
					<div
						ref={dragGhostElRef}
						aria-hidden='true'
						className='fixed top-0 left-0 z-[220] pointer-events-none will-change-transform [contain:layout_style]'
						style={{
							width: `${dragPieceSize}px`,
							height: `${dragPieceSize}px`,
						}}
					>
						<span
							aria-hidden='true'
							className='pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 w-[62%] h-[18%] rounded-full bg-[#050505]/35'
						/>
						<span className='relative block w-full h-full'>
							<ChessPieceSvg type={dragState.piece.type} color={dragState.piece.color} />
						</span>
					</div>,
					document.body
				)
			: null;

	const fullscreenWindowPortal =
		isFullscreenVisible && typeof document !== 'undefined'
			? createPortal(
					<div
						role='dialog'
						aria-modal='true'
						aria-label={t({
							en: `Chess vs ${opponentLabel} Focus Studio`,
							id: `Mode Fokus Catur Lawan ${opponentLabel}`,
						})}
						className={`fixed inset-0 z-[180] flex items-center justify-center p-0 sm:p-2 lg:p-2 overflow-hidden overscroll-none transition-opacity duration-200 ease-out ${
							fullscreenPhase === 'open'
								? 'bg-[#050505]/84 opacity-100'
								: 'bg-[#050505]/0 opacity-0'
						}`}
					>
						<div
							className={`w-full max-w-[1440px] h-[100dvh] sm:h-[97dvh] sm:max-h-[1040px] ds-os-window rounded-none sm:rounded-md overflow-hidden flex flex-col transition-[opacity,transform] duration-200 ease-out ${
								fullscreenPhase === 'open'
									? 'opacity-100 scale-100 translate-y-0'
									: 'opacity-0 scale-[0.96] translate-y-2'
							}`}
						>
							{renderHeaderToolbar(true)}

							<div className='substrate-blue-mat flex-1 min-h-0 overflow-y-auto overscroll-contain lg:overflow-hidden p-2 sm:p-3 lg:p-3'>
								<div className='flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(350px,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:gap-5 lg:h-full lg:items-stretch'>
									<div className='flex flex-col items-center lg:justify-center lg:min-h-0'>
										{renderBoardViewport(true)}
									</div>
									<div className='flex flex-col lg:min-h-0'>
										{renderSidebarConsole(true)}
									</div>
								</div>
							</div>
						</div>
					</div>,
					document.body
				)
			: null;

	return (
		<div
			ref={embeddedRootRef}
			className='substrate-blue-mat relative p-2 sm:p-4 lg:p-3.5 text-[#050505]'
			style={
				isFullscreenVisible && embeddedHeightHold
					? { minHeight: `${embeddedHeightHold}px` }
					: undefined
			}
		>
			{!isFullscreenVisible ? (
				<div className='space-y-2.5 sm:space-y-3'>
					{renderHeaderToolbar(false)}
					<div className='grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 items-stretch'>
						<div className='lg:col-span-7 flex flex-col items-center justify-center'>
							{renderBoardViewport(false)}
						</div>
						<div className='lg:col-span-5 flex flex-col min-h-0'>
							{renderSidebarConsole(false)}
						</div>
					</div>
				</div>
			) : (
				<div className='min-h-[320px] flex items-center justify-center p-6 text-center'>
					<div className='ds-os-window px-5 py-4 bg-[#FCF0D3] font-mono text-xs font-black text-[#050505]'>
						{t({
							en: 'CHESS_STUDIO.EXE RUNNING IN FOCUS WINDOW...',
							id: 'CHESS_STUDIO.EXE BERJALAN DI MODE FOKUS...',
						})}
					</div>
				</div>
			)}

			{fullscreenWindowPortal}
			{dragGhostOverlay}
		</div>
	);
};

export default ChessGame;

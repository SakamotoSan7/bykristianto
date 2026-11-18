import type { Chess, Color, Move, PieceSymbol } from 'chess.js';
import type { LocalizedText } from '../../context/useLanguage';
import type { ChessAvatarMood } from './ChessAvatars';
import type { KrisTierId } from './chessProfiles';

export type KrisDialogueCategory =
	| 'introWhite'
	| 'introBlack'
	| 'firstMoveWhiteE4'
	| 'firstMoveWhiteD4'
	| 'firstMoveWhiteOther'
	| 'firstMoveBlackSicilian'
	| 'firstMoveBlackOpen'
	| 'firstMoveBlackSolid'
	| 'firstMoveBlackOther'
	| 'openingSicilian'
	| 'openingRuyLopez'
	| 'openingItalian'
	| 'openingPetrov'
	| 'openingOpenGame'
	| 'openingFrench'
	| 'openingCaroKann'
	| 'openingScandinavian'
	| 'openingQueensGambit'
	| 'openingIndian'
	| 'openingEnglish'
	| 'openingGeneral'
	| 'earlyQueen'
	| 'queenTrade'
	| 'krisCaptureQueen'
	| 'krisCaptureRook'
	| 'krisCaptureKnight'
	| 'krisCaptureBishop'
	| 'krisCaptureCenterPawn'
	| 'krisCapturePawn'
	| 'playerCaptureBig'
	| 'playerCaptureEven'
	| 'krisCheckQueen'
	| 'krisCheckRook'
	| 'krisCheckDiagonal'
	| 'krisCheckKnight'
	| 'krisCheckPawn'
	| 'playerCheckWhenWinning'
	| 'playerCheckTense'
	| 'krisCastleKingside'
	| 'krisCastleQueenside'
	| 'opponentUncastledCenter'
	| 'krisPromotion'
	| 'krisKnightOutpost'
	| 'krisRookFile'
	| 'krisBishopActivity'
	| 'krisQueenActivity'
	| 'krisPawnBreak'
	| 'krisMidgameTempo'
	| 'krisBigLead'
	| 'krisUnderPressure'
	| 'endgameRooks'
	| 'advancedPawnPush'
	| 'endgameWinning'
	| 'endgameDefending'
	| 'endgameEven'
	| 'lowPlayerClock'
	| 'winCheckmate'
	| 'winTimeout'
	| 'winResign'
	| 'loseGame'
	| 'drawGame';

export interface KrisLine {
	id: string;
	tier: KrisTierId;
	category: KrisDialogueCategory;
	mood: ChessAvatarMood;
	text: LocalizedText;
}

export interface DialogueVars {
	square?: string;
	san?: string;
	pieceEn?: string;
	pieceId?: string;
	moveNum?: number;
}

export interface PlayerMoveDialogueInput {
	game: Chess;
	move: Move;
	tier: KrisTierId;
	wasFirstPlayerMove: boolean;
	preMoveKrisLead: number;
	postMoveKrisLead: number;
	prevKrisMove: Move | null;
	recentIds?: readonly string[];
}

export interface KrisMoveDialogueInput {
	game: Chess;
	move: Move;
	tier: KrisTierId;
	fromBook: boolean;
	krisColor: Color;
	preMoveKrisLead: number;
	postMoveKrisLead: number;
	prevPlayerMove: Move | null;
	spokenOpeningTag: string | null;
	recentIds?: readonly string[];
}

export interface ContextualDialogueDecision {
	line: KrisLine;
	priority: 'critical' | 'normal';
	openingTag?: string;
}

type CategoryPool = Record<
	KrisDialogueCategory,
	readonly { id: string; mood?: ChessAvatarMood; text: LocalizedText }[]
>;

const PIECE_NAMES: Record<PieceSymbol, { en: string; id: string }> = {
	p: { en: 'pawn', id: 'pion' },
	n: { en: 'knight', id: 'kuda' },
	b: { en: 'bishop', id: 'gajah' },
	r: { en: 'rook', id: 'benteng' },
	q: { en: 'queen', id: 'menteri' },
	k: { en: 'king', id: 'raja' },
};

const PIECE_VALUES: Record<PieceSymbol, number> = {
	p: 1,
	n: 3,
	b: 3,
	r: 5,
	q: 9,
	k: 0,
};

/**
 * Tier 1000: Lil' Kris (EN) / Bocil Kris (ID)
 * ~9–11 y/o curious + whiny/cengeng school kid. Asks innocent questions & gets teary when bullied.
 */
const LIL_KRIS_BANK: CategoryPool = {
	introWhite: [
		{
			id: '1000-iw1',
			mood: 'sweating',
			text: {
				en: 'Wait you got White?! Please don’t do that sneaky 4-move checkmate thing on me, okay?',
				id: 'Abang dapet Putih nih? Jangan pake trik skakmat 4 langkah dong bang, itu kan curang buat bocil...',
			},
		},
		{
			id: '1000-iw2',
			mood: 'curious',
			text: {
				en: 'Go ahead first! Wait... why does White always get the extra head start anyway?',
				id: 'Silakan jalan duluan bang! Eh tapi kenapa sih Putih selalu boleh duluan setiap main?',
			},
		},
		{
			id: '1000-iw3',
			mood: 'cheeky',
			text: {
				en: 'I beat the level 3 computer on my tablet yesterday! Wait... you’re not secretly way harder, right?',
				id: 'Kemaren aku menang lawan temen sekelas lho! Eh tapi abang jagonya nggak keterlaluan kan?',
			},
		},
	],
	introBlack: [
		{
			id: '1000-ib1',
			mood: 'cheeky',
			text: {
				en: 'Yay I get to go first! Wait let me just push this middle pawn and see what happens.',
				id: 'Asik aku dapet Putih duluan! Coba majuin pion tengah ini dulu ah, kira-kira abang bales apa ya?',
			},
		},
		{
			id: '1000-ib2',
			mood: 'curious',
			text: {
				en: 'White’s mine! Wait how come chess pros stare so hard on move one when nothing happened yet?',
				id: 'Aku udah jalan duluan! Eh kok pemain jago suka mikir lama banget padahal baru langkah pertama?',
			},
		},
		{
			id: '1000-ib3',
			mood: 'sweating',
			text: {
				en: 'Okay I started with White... promise you won’t bully me and take all my pieces fast?',
				id: 'Oke aku buka Putih nih... janji ya jangan langsung dibantai habis bidaknya...',
			},
		},
	],
	firstMoveWhiteE4: [
		{
			id: '1000-fmwe1',
			mood: 'curious',
			text: {
				en: 'Ooh 1. e4! Why does literally everybody at chess club always pick that exact pawn first?',
				id: 'Wih 1. e4! Kok anak-anak eskul selalu aja buka pake pion yang itu duluan sih?',
			},
		},
		{
			id: '1000-fmwe2',
			mood: 'cheeky',
			text: {
				en: 'Hey I actually know 1. e4! At least this part I practiced.',
				id: 'Eh aku tau nih yang 1. e4! Yang ini lumayan sering kulatih sih.',
			},
		},
	],
	firstMoveWhiteD4: [
		{
			id: '1000-fmwd1',
			mood: 'curious',
			text: {
				en: '1. d4? Wait is the Queen pawn different from e4 or does it do the same thing?',
				id: 'Lah 1. d4? Emang beda ya bang rasanya sama 1. e4? Kok rasanya lebih serius gitu?',
			},
		},
		{
			id: '1000-fmwd2',
			mood: 'sweating',
			text: {
				en: 'Whoa 1. d4 right away? Please go easy, I mostly only know the other side...',
				id: 'Waduh 1. d4? Pelan-pelan bang, aku baru hafal dikit kalau bukaannya ke sebelah situ...',
			},
		},
	],
	firstMoveWhiteOther: [
		{
			id: '1000-fmwo1',
			mood: 'curious',
			text: {
				en: 'Wait what is {san}?! Is that even allowed?! Where did you learn that move?',
				id: 'Eh apaan tuh {san}?! Emang boleh buka dari situ bang? Belajar di mana langkah gitu?',
			},
		},
	],
	firstMoveBlackSicilian: [
		{
			id: '1000-fmbs1',
			mood: 'crying',
			text: {
				en: 'Hey why’d you push c5 instead of copying me?! Now everything I memorized is broken...',
				id: 'Yah kok malah c5 bukannya ngikutin pionku sih?! Rencanaku langsung buyar semua tau...',
			},
		},
	],
	firstMoveBlackOpen: [
		{
			id: '1000-fmbo1',
			mood: 'curious',
			text: {
				en: 'Copying me with {san} already? Hey wait, how come Black copies White so often?',
				id: 'Ikutan {san} nih? Eh emang kalau Hitam ngikutin Putih terus nggak tabrakan ya?',
			},
		},
	],
	firstMoveBlackSolid: [
		{
			id: '1000-fmbso1',
			mood: 'curious',
			text: {
				en: 'Ooh {san}! I saw a YouTube video about that once, wait what does it actually do?',
				id: 'Eh aku pernah liat {san} di YouTube! Tapi sebenernya tujuannya apa sih bang?',
			},
		},
	],
	firstMoveBlackOther: [
		{
			id: '1000-fmbot1',
			mood: 'curious',
			text: {
				en: 'Whoa {san}? Did you make that up just to confuse me?!',
				id: 'Weh {san} itu pembukaan beneran apa abang ngarang biar aku bingung sih?!',
			},
		},
	],
	openingSicilian: [
		{
			id: '1000-opsic1',
			mood: 'crying',
			text: {
				en: 'Isn’t this the Sicilian thing?! No fair, grandmasters use this and I’m still learning forks!',
				id: 'Ini Sicilian yang terkenal susah itu ya?! Curang ah masa dipake lawan aku...',
			},
		},
	],
	openingRuyLopez: [
		{
			id: '1000-oprl1',
			mood: 'curious',
			text: {
				en: 'Why’s your bishop just glaring at my knight from over there? Are you gonna take him?',
				id: 'Kok gajahnya ngeliatin kudaku terus dari situ sih bang? Mau dimakan apa nggak?',
			},
		},
	],
	openingItalian: [
		{
			id: '1000-opit1',
			mood: 'curious',
			text: {
				en: 'Hey why does everybody always aim that bishop straight at f7? Is f7 weak or something?',
				id: 'Eh kenapa sih semua orang selalu ngarahin gajah ke f7? Emang f7 gampang jebol ya?',
			},
		},
	],
	openingPetrov: [
		{
			id: '1000-oppe1',
			mood: 'curious',
			text: {
				en: 'Wait both our knights can take middle pawns right now... what happens if we both take?',
				id: 'Eh kudanya sama-sama ngincer pion tengah tuh! Terus kalau dua-duanya makan gimana jadinya?',
			},
		},
	],
	openingOpenGame: [
		{
			id: '1000-opog1',
			mood: 'cheeky',
			text: {
				en: 'Getting all my knights and bishops out! Did I put them on the right squares this time?',
				id: 'Kuda sama gajah keluar semua nih! Bener kan naruhnya di petak situ?',
			},
		},
	],
	openingFrench: [
		{
			id: '1000-opfr1',
			mood: 'crying',
			text: {
				en: 'Ugh why are all the pawns jammed up together like traffic?! Where am I supposed to walk?',
				id: 'Ih kok pionnya numpuk rapet banget kayak macet sih?! Terus aku lewat mana nih...',
			},
		},
	],
	openingCaroKann: [
		{
			id: '1000-opck1',
			mood: 'crying',
			text: {
				en: 'Aww Caro-Kann is so hard to break through... why do you have to defend so tight?',
				id: 'Yah ketemu Caro-Kann... susah banget ditembus tau bang, jangan rapet-rapet gitu ah!',
			},
		},
	],
	openingScandinavian: [
		{
			id: '1000-opsc1',
			mood: 'curious',
			text: {
				en: 'Wait you pushed d5 so I’d take it?! Why do people give up center pawns on move one?',
				id: 'Lah kok langsung majuin d5 biar kumakan? Emang nggak rugi buang pion tengah di awal?',
			},
		},
	],
	openingQueensGambit: [
		{
			id: '1000-opqg1',
			mood: 'curious',
			text: {
				en: 'Wait Queen’s Gambit like the movie?! Should I eat the c4 pawn or is it a trap?',
				id: 'Eh ini Queen’s Gambit yang di film itu ya?! Pion c4-nya kalau kuambil jebakan nggak nih?',
			},
		},
	],
	openingIndian: [
		{
			id: '1000-opin1',
			mood: 'curious',
			text: {
				en: 'Hey why’d your knight jump out first instead of pushing a second pawn?',
				id: 'Kok kudanya lompat duluan nggak dorong pion lagi sih bang? Emang lebih bagus ya?',
			},
		},
	],
	openingEnglish: [
		{
			id: '1000-open1',
			mood: 'curious',
			text: {
				en: 'Why’d we start on the c-file? I only learned middle pawns so I’m kinda guessing right now!',
				id: 'Kok bukanya dari samping c gitu? Aku baru diajarin pion tengah doang soalnya!',
			},
		},
	],
	openingGeneral: [
		{
			id: '1000-opge1',
			mood: 'curious',
			text: {
				en: 'Wait... is everyone on my side protected right now? Let me double-check before you attack!',
				id: 'Eh bentar... bidakku udah saling jaga semua belom ya? Jangan diserang dulu dong!',
			},
		},
		{
			id: '1000-opge2',
			mood: 'cheeky',
			text: {
				en: 'Everyone’s out! Now wait... what’s my actual plan after the opening again?',
				id: 'Pasukanku udah keluar semua! Eh habis pembukaan ngapain lagi ya biasanya?',
			},
		},
	],
	earlyQueen: [
		{
			id: '1000-eq1',
			mood: 'crying',
			text: {
				en: 'HEY NO FAIR!! Sending your Queen to {square} already?! Stop trying to scholar’s mate me!',
				id: 'HUHU JANGAN CURANG!! Menteri udah ke {square} sepagi ini! Jangan bikin skakmat cepet dong bang!',
			},
		},
		{
			id: '1000-eq2',
			mood: 'sweating',
			text: {
				en: 'Why’s your Queen coming over to {square} already?! Wait go away, I didn’t castle yet!',
				id: 'Waduh menterinya udah nyamperin {square} aja! Pergi dulu dong, aku kan belum rokade...',
			},
		},
	],
	queenTrade: [
		{
			id: '1000-qt1',
			mood: 'curious',
			text: {
				en: 'Wait both Queens disappeared on {square}... how are we even supposed to win without Queens?',
				id: 'Yah menterinya sama-sama ilang di {square}... terus kalau nggak ada menteri menangnya gimana dong?',
			},
		},
		{
			id: '1000-qt2',
			mood: 'sweating',
			text: {
				en: 'Phew, Queens gone at {square}! Now at least you can’t sneak-checkmate me with her...',
				id: 'Untung menterinya tukeran di {square}... deg-degan soalnya tadi dikit-dikit kena ancam terus!',
			},
		},
	],
	krisCaptureQueen: [
		{
			id: '1000-kcq1',
			mood: 'hyped',
			text: {
				en: 'WAIT I ACTUALLY GOT YOUR QUEEN ON {square}?! No takebacks!! Haha did I really spot that?!',
				id: 'WAHH SERIUS DAPET MENTERI DI {square}?! Nggak boleh di-undo ya bang, aku liat beneran tadi!!',
			},
		},
		{
			id: '1000-kcq2',
			mood: 'curious',
			text: {
				en: 'Did you leave your Queen on {square} on purpose or did you actually forget?! Either way, thanks!',
				id: 'Eh abang sengaja ngasih menteri di {square} apa lupa beneran nih?! Aku makan ya makasih!',
			},
		},
	],
	krisCaptureRook: [
		{
			id: '1000-kcr1',
			mood: 'hyped',
			text: {
				en: 'Ooh free Rook on {square}! Five whole points! Wait... nothing can take me back right? Nope!',
				id: 'Asik dapet benteng di {square}! Lumayan banget lima poin! Eh nggak ada yang bales makan kan? Aman!',
			},
		},
		{
			id: '1000-kcr2',
			mood: 'cheeky',
			text: {
				en: 'Got your Rook on {square}! Hey I’m getting pretty good at noticing unprotected stuff!',
				id: 'Dapet benteng di {square}! Wih mataku mulai jeli nih ngeliat bidak nganggur!',
			},
		},
	],
	krisCaptureKnight: [
		{
			id: '1000-kcn1',
			mood: 'hyped',
			text: {
				en: 'Caught your Knight on {square}! Glad he’s gone, those L-jumps always trick me!',
				id: 'Dapet kuda di {square}! Untung ketangkep, aku suka ketipu sama lompatan huruf L soalnya!',
			},
		},
		{
			id: '1000-kcn2',
			mood: 'curious',
			text: {
				en: 'Wait that Knight on {square} wasn’t guarded?! Cool, three points for me!',
				id: 'Lah kuda di {square} beneran nggak ada yang jaga bang? Yaudah kuambil ya!',
			},
		},
	],
	krisCaptureBishop: [
		{
			id: '1000-kcb1',
			mood: 'hyped',
			text: {
				en: 'Sniped your Bishop on {square}! Bet you didn’t think I saw all the way down that line!',
				id: 'Gajahnya di {square} kutangkep! Nggak nyangka kan aku liat sejauh itu?!',
			},
		},
	],
	krisCaptureCenterPawn: [
		{
			id: '1000-kccp1',
			mood: 'cheeky',
			text: {
				en: 'Got the middle pawn on {square}! Wait is controlling the center actually super important?',
				id: 'Dapet pion tengah di {square}! Eh emang nguasain tengah sepenting itu ya bang?',
			},
		},
	],
	krisCapturePawn: [
		{
			id: '1000-kcp1',
			mood: 'curious',
			text: {
				en: 'Wait why was that pawn on {square} all alone? Is it okay if I take it? Yeah, mine!',
				id: 'Kok pion di {square} ditinggal sendirian sih bang? Aku ambil nggak papa kan? Hehe!',
			},
		},
	],
	playerCaptureBig: [
		{
			id: '1000-pcb1',
			mood: 'crying',
			text: {
				en: 'NOOO MY {piece} ON {square}!! Huhu why didn’t I check first... can I please have one undo?!',
				id: 'HUHU {piece} AKU DIMAKAN DI {square}!! Jahat banget sih... bang boleh pencet ulang sekali aja nggak?!',
			},
		},
		{
			id: '1000-pcb2',
			mood: 'crying',
			text: {
				en: 'HEY THAT WAS MY FAVORITE {piece} AT {square}!! Why do you keep bullying my pieces...',
				id: 'YAHHH {piece} KESAYANGANKU ILANG DI {square}!! Kenapa sih ngincar punya aku terus...',
			},
		},
	],
	playerCaptureEven: [
		{
			id: '1000-pce1',
			mood: 'crying',
			text: {
				en: 'Aww my {piece} on {square}... okay fine we traded evenly, I guess that’s allowed.',
				id: 'Yahhh {piece} aku di {square}... eh tapi kan sama-sama ketuker ya, yaudah deh gapapa...',
			},
		},
	],
	krisCheckQueen: [
		{
			id: '1000-kcqc1',
			mood: 'hyped',
			text: {
				en: 'Check at {square}!! Wait... am I winning right now?! Look how trapped your King is!',
				id: 'Skak di {square}!! Eh bentar, ini aku udah mau menang ya?! Rajanya nggak bisa ke mana-mana tuh!',
			},
		},
	],
	krisCheckRook: [
		{
			id: '1000-kcrc1',
			mood: 'hyped',
			text: {
				en: 'Rook check on {square}! Watch out down the whole straight line!',
				id: 'Skak benteng dari {square}! Minggir tuh rajanya, lurus nggak ada halangan!',
			},
		},
	],
	krisCheckDiagonal: [
		{
			id: '1000-kcdc1',
			mood: 'cheeky',
			text: {
				en: 'Bishop check from {square}! Forgot about the diagonal sniper, didn’t ya?',
				id: 'Skak gajah di {square}! Lupa kan jalur miringnya nyambung ke raja?!',
			},
		},
	],
	krisCheckKnight: [
		{
			id: '1000-kcnc1',
			mood: 'curious',
			text: {
				en: 'Knight check at {square}! Wait why CAN knights jump over other pieces anyway?',
				id: 'Skak kuda di {square}! Eh kenapa sih cuma kuda doang yang boleh lompatin bidak lain?',
			},
		},
	],
	krisCheckPawn: [
		{
			id: '1000-kcpc1',
			mood: 'hyped',
			text: {
				en: 'Even my tiny little pawn checked your King on {square}!!',
				id: 'Wih pion kecilku aja berani skak rajamu di {square}!!',
			},
		},
	],
	playerCheckWhenWinning: [
		{
			id: '1000-pcww1',
			mood: 'sweating',
			text: {
				en: 'HEY don’t scare me with a check on {square}! Wait... I’m still way ahead though, right?',
				id: 'IH jangan ngagetin skak di {square} dong! Eh... tapi poin aku masih menang jauh kan ya?',
			},
		},
	],
	playerCheckTense: [
		{
			id: '1000-pct1',
			mood: 'crying',
			text: {
				en: 'STOOOP CHECKING MY KING ON {square}!! You’re making me panic and forget everything...',
				id: 'JANGAN KEJAR RAJAKU KE {square} TERUS DONG!! Jadi panik banget nih nggak bisa mikir...',
			},
		},
		{
			id: '1000-pct2',
			mood: 'crying',
			text: {
				en: 'Huhu check on {square}?! Why are all your pieces attacking me at the same time?!',
				id: 'Aduh skak lagi di {square}?! Kok semua bidak abang nyerangnya barengan sih jahat ah...',
			},
		},
	],
	krisCastleKingside: [
		{
			id: '1000-kck1',
			mood: 'curious',
			text: {
				en: 'Castled! Wait how come the King gets to move TWO squares ONLY when castling?',
				id: 'Rokade beres! Eh kenapa ya raja cuma boleh jalan dua kotak pas rokade doang?',
			},
		},
		{
			id: '1000-kck2',
			mood: 'cheeky',
			text: {
				en: 'My King’s inside his little pawn house now! Try getting in!',
				id: 'Rajaku udah ngumpet aman di balik pion nih! Coba aja tembus kalau bisa!',
			},
		},
	],
	krisCastleQueenside: [
		{
			id: '1000-kcq_o1',
			mood: 'curious',
			text: {
				en: 'Long castle! Wait why did my Rook jump all the way over here so fast?',
				id: 'Rokade panjang nih! Enak ya bentengnya langsung loncat ke tengah gitu!',
			},
		},
	],
	opponentUncastledCenter: [
		{
			id: '1000-ouc1',
			mood: 'curious',
			text: {
				en: 'Wait it’s move {moveNum} already, aren’t you gonna hide your King in a castle soon?',
				id: 'Eh udah langkah {moveNum} kok rajanya belum dikandangin rokade juga bang? Nggak takut diserang?',
			},
		},
	],
	krisPromotion: [
		{
			id: '1000-kpro1',
			mood: 'hyped',
			text: {
				en: 'WAIT I GOT A SECOND QUEEN AT {square}?! Haha how do you stop TWO Queens?!',
				id: 'YEAY PIONKU BERUBAH JADI MENTERI DI {square}!! Bingung kan nahan dua menteri?!',
			},
		},
	],
	krisKnightOutpost: [
		{
			id: '1000-kno1',
			mood: 'cheeky',
			text: {
				en: 'Putting my Knight right on {square}! Pretty cool square, right?',
				id: 'Taruh kudaku di {square} ah! Keliatan keren banget kan di tengah?',
			},
		},
	],
	krisRookFile: [
		{
			id: '1000-krf1',
			mood: 'curious',
			text: {
				en: 'Moving my Rook to {square}! Wait, do Rooks work best when pawns get out of the way?',
				id: 'Geser benteng ke {square}! Emang bener ya benteng paling kuat kalau nggak kehalang pion?',
			},
		},
	],
	krisBishopActivity: [
		{
			id: '1000-kba1',
			mood: 'cheeky',
			text: {
				en: 'Bishop to {square}! Watching all the way across the board now.',
				id: 'Gajah ke {square}! Lagi ngintip sampe seberang sana nih.',
			},
		},
	],
	krisQueenActivity: [
		{
			id: '1000-kqa1',
			mood: 'sweating',
			text: {
				en: 'Putting my Queen on {square}... please tell me she’s not walking into a trap!',
				id: 'Taruh menteri di {square}... nggak ada jebakan tersembunyi kan di situ bang?',
			},
		},
	],
	krisPawnBreak: [
		{
			id: '1000-kpb1',
			mood: 'curious',
			text: {
				en: 'Pushing {san}! Let’s see what happens if we open up the board.',
				id: 'Majuin {san} ah! Penasaran jadinya gimana kalau garisnya kebuka.',
			},
		},
	],
	krisMidgameTempo: [
		{
			id: '1000-kmt1',
			mood: 'curious',
			text: {
				en: 'Hmm going to {square}... wait, why DID you make your last move anyway?',
				id: 'Hmm aku ke {square} deh... eh emang langkah abang barusan tujuannya apa sih?',
			},
		},
		{
			id: '1000-kmt2',
			mood: 'cheeky',
			text: {
				en: 'Wait I actually calculated two whole moves ahead for {san}!',
				id: 'Eh langkah {san} tadi aku mikir dua langkah ke depan beneran lho!',
			},
		},
		{
			id: '1000-kmt3',
			mood: 'sweating',
			text: {
				en: 'Okay your turn... please don’t take anything I forgot was hanging!',
				id: 'Giliran abang... jangan makan apa-apa yang lupa aku jagain ya...',
			},
		},
	],
	krisBigLead: [
		{
			id: '1000-kbl1',
			mood: 'hyped',
			text: {
				en: 'WAIT AM I ACTUALLY WINNING BY THIS MUCH?! Hey don’t quit, let me finish!',
				id: 'EH AKU BENERAN LAGI MENANG BANYAK NIH?! Jangan udahan dulu ya bang, seru nih!',
			},
		},
	],
	krisUnderPressure: [
		{
			id: '1000-kup1',
			mood: 'crying',
			text: {
				en: 'Huhu I lost so many pieces already... stop attacking me so hard!',
				id: 'Yahhh bidakku tinggal dikit banget... pelan-pelan dong bang jangan diserbu terus...',
			},
		},
	],
	endgameRooks: [
		{
			id: '1000-egr1',
			mood: 'curious',
			text: {
				en: 'Only rooks and pawns left?! Why does chess feel way scarier when the board is almost empty?',
				id: 'Tinggal benteng sama pion doang?! Kok rasanya makin serem sih pas papannya sepi gini?',
			},
		},
	],
	advancedPawnPush: [
		{
			id: '1000-app1',
			mood: 'hyped',
			text: {
				en: 'Look at my little pawn on {square}!! Just a tiny bit more to become a Queen!',
				id: 'Liat pionku udah nyampe {square}!! Dikit lagi berubah jadi menteri beneran!',
			},
		},
	],
	endgameWinning: [
		{
			id: '1000-egw1',
			mood: 'sweating',
			text: {
				en: 'Wait I’m ahead in the endgame... how do I make sure I don’t accidentally stalemate?!',
				id: 'Eh aku lagi unggul di endgame nih... gimana caranya biar nggak salah pencet seri stalemate ya?!',
			},
		},
	],
	endgameDefending: [
		{
			id: '1000-egd1',
			mood: 'crying',
			text: {
				en: 'Huhu running my King away hoping it turns into a draw somehow... don’t catch me!',
				id: 'Lari-lari aja deh rajanya siapa tau bisa seri... jangan dikejar dong huhu!',
			},
		},
	],
	endgameEven: [
		{
			id: '1000-ege1',
			mood: 'curious',
			text: {
				en: 'Wait we’re still completely tied at move {moveNum}? Who even wins a tie game like this?',
				id: 'Wah masih imbang banget sampe langkah {moveNum}? Kalau begini terus siapa yang menang ya bang?',
			},
		},
	],
	lowPlayerClock: [
		{
			id: '1000-lpc1',
			mood: 'hyped',
			text: {
				en: 'Ooh your timer is turning red!! Wait do I win automatically if it hits zero?!',
				id: 'Weh jam abang udah merah tuh!! Kalau nol aku langsung menang beneran ya?!',
			},
		},
	],
	winCheckmate: [
		{
			id: '1000-wc1',
			mood: 'win',
			text: {
				en: 'WAIT I WON?! BY CHECKMATE?! Yesss!! Please play me again!',
				id: 'EH AKU MENANG SKAKMAT?! SERIUS?! Yess!! Main lagi dong bang!!',
			},
		},
		{
			id: '1000-wc2',
			mood: 'win',
			text: {
				en: 'Checkmate in {moveNum}!! Wait till I brag about this at school tomorrow!',
				id: 'Skakmat di langkah {moveNum}!! Besok pamer ke anak-anak sekolah ah!!',
			},
		},
	],
	winTimeout: [
		{
			id: '1000-wt1',
			mood: 'win',
			text: {
				en: 'TIME’S UP!! Yay I survived AND ran your clock out!! Wanna rematch?',
				id: 'WAKTU HABIS!! Asik menang lawan abang karena keburu nol!! Main lagi yuk?',
			},
		},
	],
	winResign: [
		{
			id: '1000-wr1',
			mood: 'curious',
			text: {
				en: 'Wait why’d you resign already?! I thought you were gonna trick me! Yay thanks!',
				id: 'Lah kok udah nyerah aja bang? Kirain abang masih nyimpen jurus! Asik menang!',
			},
		},
	],
	loseGame: [
		{
			id: '1000-lg1',
			mood: 'crying',
			text: {
				en: 'HUHU YOU’RE SO MEAN!! That doesn’t count, my hand slipped! Play me again right now!!',
				id: 'HUHU JAHAT BANGET SIH!! Nggak terima, tadi belum siap! Tanding ulang sekarang bang!!',
			},
		},
		{
			id: '1000-lg2',
			mood: 'crying',
			text: {
				en: 'Aww I lost again... why are you actually trying so hard against a kid?! Rematch please?',
				id: 'Yahhh kalah beneran... masa lawan bocil serius banget sih bang... sekali lagi ya?',
			},
		},
	],
	drawGame: [
		{
			id: '1000-dg1',
			mood: 'curious',
			text: {
				en: 'Wait... nobody wins when it’s a draw?! Then what was the point?! One more game!',
				id: 'Lah kalau seri nggak ada yang menang?! Yah nggak asik dong! Main sekali lagi yuk bang!',
			},
		},
	],
};

/**
 * Tier 1500: Teen Kris (EN) / ABG Kris (ID)
 * ~15–17 y/o impulsive rapid grinder. Unpredictable mood swings, random tangents, funny excuses.
 */
const TEEN_KRIS_BANK: CategoryPool = {
	introWhite: [
		{
			id: '1500-iw1',
			mood: 'cheeky',
			text: {
				en: 'You get White. Warning you upfront, I either play like a genius or completely blind today.',
				id: 'Lo pegang Putih ya. Peringatan dulu nih, main gue kadang jenius kadang buta map banget.',
			},
		},
		{
			id: '1500-iw2',
			mood: 'curious',
			text: {
				en: 'Wait hold on I forgot what I normally play against White... whatever, just go!',
				id: 'Eh bentar tadi gue niatnya mau bikin mie kok malah buka papan catur... udah jalan aja deh!',
			},
		},
		{
			id: '1500-iw3',
			mood: 'determined',
			text: {
				en: 'Alright, hit me with move one. Just please don’t play some dry sleepy opening.',
				id: 'Gas mulai. Asal jangan buka pake jalur yang bikin ngantuk aja ya di awal.',
			},
		},
	],
	introBlack: [
		{
			id: '1500-ib1',
			mood: 'cheeky',
			text: {
				en: 'Got White! Watch this setup, saw some random streamer crush somebody with it at 2am.',
				id: 'Asik gue Putih duluan! Liat pembukaan ini, kemaren nyontek pas nonton stream jam dua pagi.',
			},
		},
		{
			id: '1500-ib2',
			mood: 'curious',
			text: {
				en: 'I’m White! Wait did I turn the rice cooker off before sitting down... anyway your turn!',
				id: 'Gue buka Putih nih! Bentar tadi udah pencet tombol magic com belom ya... eh udah, giliran lo!',
			},
		},
	],
	firstMoveWhiteE4: [
		{
			id: '1500-fmwe1',
			mood: 'cheeky',
			text: {
				en: '1. e4! Alright normal chess, thank god it wasn’t some weird flank move.',
				id: '1. e4! Syukur deh pembukaan normal, males banget kalau udah ketemu langkah aneh.',
			},
		},
		{
			id: '1500-fmwe2',
			mood: 'hyped',
			text: {
				en: 'Ooh 1. e4, finally a proper brawl. Let’s go.',
				id: 'Wih 1. e4, baru nih berasa duel beneran. Gas lah!',
			},
		},
	],
	firstMoveWhiteD4: [
		{
			id: '1500-fmwd1',
			mood: 'sweating',
			text: {
				en: '1. d4? Bro I barely remember my d4 replies today, stop testing me like an exam.',
				id: '1. d4? Aduh lupa-lupa inget lagi teori balesan d4 hari ini... jangan ngetes kayak ulangan dong.',
			},
		},
		{
			id: '1500-fmwd2',
			mood: 'cheeky',
			text: {
				en: '1. d4, alright slow burn mode. Let’s pretend we’re patient today.',
				id: 'Oke 1. d4, mode sabar. Pura-pura kalem dulu aja lah hari ini.',
			},
		},
	],
	firstMoveWhiteOther: [
		{
			id: '1500-fmwo1',
			mood: 'curious',
			text: {
				en: '{san} on move one?? Okay weird flex, zero clue what you’re up to yet.',
				id: 'Langkah satu udah {san}?? Random amat, nggak kebaca sih maunya apa.',
			},
		},
	],
	firstMoveBlackSicilian: [
		{
			id: '1500-fmbs1',
			mood: 'hyped',
			text: {
				en: 'Sicilian ...c5!! Oh thank goodness, time for pure chaos then.',
				id: 'Langsung ...c5!! Nah gini dong, baru seru kalau dua-duanya barbar!',
			},
		},
	],
	firstMoveBlackOpen: [
		{
			id: '1500-fmbo1',
			mood: 'cheeky',
			text: {
				en: 'Matching with {san}. Honest chess, wait unless you’re setting up a gambit?',
				id: 'Bales {san} nih. Main jujur ya... eh apa lo mau ngasih gambit jebakan nih?',
			},
		},
	],
	firstMoveBlackSolid: [
		{
			id: '1500-fmbso1',
			mood: 'curious',
			text: {
				en: 'Going for {san}? Wait are you actually solid or secretly setting up a trap?',
				id: 'Pake {san} ya? Ini beneran mau main rapi apa lagi nyembunyiin jebakan sih?',
			},
		},
	],
	firstMoveBlackOther: [
		{
			id: '1500-fmbot1',
			mood: 'curious',
			text: {
				en: 'Wait {san}? Honestly respecting the sheer unpredictability there.',
				id: 'Bales {san}? Agak nggak jelas sih arahnya, tapi justru keren.',
			},
		},
	],
	openingSicilian: [
		{
			id: '1500-opsic1',
			mood: 'hyped',
			text: {
				en: 'Sicilian already looks sketchy for somebody, either I win brilliantly or hang mate in five.',
				id: 'Posisi Sicilian gini antara gue menang keren banget atau kepleset skakmat lima langkah lagi.',
			},
		},
	],
	openingRuyLopez: [
		{
			id: '1500-oprl1',
			mood: 'sweating',
			text: {
				en: 'Ruy Lopez? Wait I only memorized till move four before zoning out in the tutorial...',
				id: 'Ruy Lopez ya? Jujur pas nonton videonya kemaren gue ketiduran di langkah keempat...',
			},
		},
	],
	openingItalian: [
		{
			id: '1500-opit1',
			mood: 'hyped',
			text: {
				en: 'Italian Game! Literally my mood depends on whether a sacrifice works in five moves.',
				id: 'Italian Game! Seru sih asal abis ini salah satu berani korban perwira.',
			},
		},
	],
	openingPetrov: [
		{
			id: '1500-oppe1',
			mood: 'determined',
			text: {
				en: 'Petrov?! Please don’t turn this into a sleepy mirror match, I’ll literally fall asleep.',
				id: 'Petrov nih? Jangan dijadiin game seri ngebosenin dong, ngantuk banget kalau imbang terus.',
			},
		},
	],
	openingOpenGame: [
		{
			id: '1500-opog1',
			mood: 'cheeky',
			text: {
				en: 'Clean development so far! Wait... why do I suddenly feel like somebody’s about to blunder?',
				id: 'Sejauh ini rapi dua-duanya... eh kok perasaan gue bentar lagi ada yang blunder konyol ya?',
			},
		},
	],
	openingFrench: [
		{
			id: '1500-opfr1',
			mood: 'sweating',
			text: {
				en: 'French defense always makes my brain itch... why is the center so weirdly locked?',
				id: 'Ketemu French tuh selalu bikin kepala gatel... kenapa tengahnya harus ketutup gini sih.',
			},
		},
	],
	openingCaroKann: [
		{
			id: '1500-opck1',
			mood: 'crying',
			text: {
				en: 'Bro Caro-Kann AGAIN?! Why do people love defending for 40 straight moves?!',
				id: 'Ketemu Caro-Kann LAGI?! Kenapa sih orang-orang hobi banget parkir bus dari awal game!',
			},
		},
	],
	openingScandinavian: [
		{
			id: '1500-opsc1',
			mood: 'cheeky',
			text: {
				en: 'Scandinavian d5! Either your Queen gets bullied or I get tricked somehow, zero middle ground.',
				id: 'Scandinavian d5! Antara menteri lo gue kejar-kejar terus atau malah gue yang kejebak sendiri.',
			},
		},
	],
	openingQueensGambit: [
		{
			id: '1500-opqg1',
			mood: 'curious',
			text: {
				en: 'Queen’s Gambit! Wait am I supposed to accept this or play it cool? Let’s flip a mental coin.',
				id: 'Queen’s Gambit nih! Bingung mau gue makan apa cuekin aja, liat mood bentar deh.',
			},
		},
	],
	openingIndian: [
		{
			id: '1500-opin1',
			mood: 'determined',
			text: {
				en: 'Indian structure looks chill now, till all those dark-square pieces explode at once.',
				id: 'Pola Indian gini keliatan tenang di awal padahal bentar lagi petak gelapnya meledak semua.',
			},
		},
	],
	openingEnglish: [
		{
			id: '1500-open1',
			mood: 'curious',
			text: {
				en: 'English c4... okay we’re playing fancy quiet chess today apparently.',
				id: 'Pembukaan c4... oke hari ini ceritanya jadi pemain kalem dulu.',
			},
		},
	],
	openingGeneral: [
		{
			id: '1500-opge1',
			mood: 'cheeky',
			text: {
				en: 'Alright my pieces are out, forgot the rest of the theory so now it’s pure vibes.',
				id: 'Oke pembukaan kelar, hafalan udah abis, sisanya murni ngandelin insting aja.',
			},
		},
		{
			id: '1500-opge2',
			mood: 'curious',
			text: {
				en: 'Wait... nobody blundered in the opening? Who even are we right now?!',
				id: 'Eh... belum ada yang blunder di pembukaan nih? Tumben banget rapi gini.',
			},
		},
	],
	earlyQueen: [
		{
			id: '1500-eq1',
			mood: 'smug',
			text: {
				en: 'Queen to {square} on move {moveNum}? Respectfully, nobody above 900 falls for that anymore.',
				id: 'Menteri udah ke {square} di langkah {moveNum}? Sori nih bang, trik gitu udah kadaluarsa.',
			},
		},
	],
	queenTrade: [
		{
			id: '1500-qt1',
			mood: 'sweating',
			text: {
				en: 'Queens traded on {square}... wait I liked having a Queen, what do I even attack with now?!',
				id: 'Menteri ilang dua-duanya di {square}... eh bentar terus gue nyari serangannya pake apa dong?!',
			},
		},
	],
	krisCaptureQueen: [
		{
			id: '1500-kcq1',
			mood: 'hyped',
			text: {
				en: 'YO WAIT YOU ACTUALLY HUNG YOUR QUEEN ON {square}?! My hands are shaking taking that!',
				id: 'LAH SERIUSAN MENTERI LO DITINGGAL DI {square}?! WKWK tangan gue sampe gemeter ngambilnya!',
			},
		},
		{
			id: '1500-kcq2',
			mood: 'cheeky',
			text: {
				en: 'Queen down on {square}... wait did you misclick or did my weird move actually work?!',
				id: 'Menteri kena ambil di {square}... eh itu lo kepeleset klik apa jebakan random gue beneran kena?!',
			},
		},
	],
	krisCaptureRook: [
		{
			id: '1500-kcr1',
			mood: 'hyped',
			text: {
				en: 'Free Rook on {square}!! Oh man I needed that dopamine boost right now.',
				id: 'Benteng gratis di {square}!! Lumayan banget dapet asupan poin segini banyak!',
			},
		},
	],
	krisCaptureKnight: [
		{
			id: '1500-kcn1',
			mood: 'smug',
			text: {
				en: 'Took that Knight off {square}. Honestly hate horses, glad one’s off the board.',
				id: 'Kuda di {square} gue ambil duluan. Emang paling males ngadepin kuda loncat ke mana-mana.',
			},
		},
	],
	krisCaptureBishop: [
		{
			id: '1500-kcb1',
			mood: 'smug',
			text: {
				en: 'Snatched your Bishop on {square}! One less sniper staring across the board.',
				id: 'Gajah di {square} bungkus dulu! Berkurang satu sniper yang ngintip dari pojok.',
			},
		},
	],
	krisCaptureCenterPawn: [
		{
			id: '1500-kccp1',
			mood: 'cheeky',
			text: {
				en: 'Yoinked the center pawn on {square}! Feels way easier breathing now.',
				id: 'Pion tengah di {square} gue angkut dulu! Nafas langsung lega kalau tengahnya kosong gini.',
			},
		},
	],
	krisCapturePawn: [
		{
			id: '1500-kcp1',
			mood: 'smug',
			text: {
				en: 'One free pawn at {square}. Wait don’t tell me there’s a hidden tactic right behind it...',
				id: 'Dapet pion gratis di {square}... eh bentar ini bukan umpan beracun kan ya?',
			},
		},
	],
	playerCaptureBig: [
		{
			id: '1500-pcb1',
			mood: 'shocked',
			text: {
				en: 'WAIT NO MY {piece} ON {square}!! I literally blinked for half a second, doesn’t count!!',
				id: 'KAGET ANJIR!! Tadi mata gue lagi kedip pas lo ke {square}, nggak sah ah!!',
			},
		},
		{
			id: '1500-pcb2',
			mood: 'sweating',
			text: {
				en: 'Wait whatever I meant to sacrifice that {piece} on {square}... okay no I didn’t, I’m cooked.',
				id: 'Yaudah sih emang sengaja gue korbanin {piece} di {square}... bohong deng, nyesel banget gue!',
			},
		},
	],
	playerCaptureEven: [
		{
			id: '1500-pce1',
			mood: 'cheeky',
			text: {
				en: 'Fair trade at {square}, honestly my pieces were crowding each other anyway.',
				id: 'Tuker imbang di {square}, emang bidak gue tadi lagi sempit-sempitan juga sih.',
			},
		},
	],
	krisCheckQueen: [
		{
			id: '1500-kcqc1',
			mood: 'hyped',
			text: {
				en: 'CHECK ON {square}!! Wait is that mate? Hold on... no wait it’s not. Scared you though right?!',
				id: 'SKAK DI {square}!! Bentar itu skakmat bukan sih? Eh bukan ya... tapi sempet kaget kan lo?!',
			},
		},
	],
	krisCheckRook: [
		{
			id: '1500-kcrc1',
			mood: 'hyped',
			text: {
				en: 'Rook check on {square}! Forgot that file was open didn’t you?!',
				id: 'Skak benteng di {square}! Lupa kan lajur lurusnya udah kebuka lebar?!',
			},
		},
	],
	krisCheckDiagonal: [
		{
			id: '1500-kcdc1',
			mood: 'smug',
			text: {
				en: 'Bishop check from {square}! Always love sniping from the corner like nobody’s watching.',
				id: 'Gajah ngasih skak dari {square}! Paling asik nembak dari sudut yang nggak kepikiran.',
			},
		},
	],
	krisCheckKnight: [
		{
			id: '1500-kcnc1',
			mood: 'cheeky',
			text: {
				en: 'Knight check on {square}! Even I barely saw that fork square till right before moving.',
				id: 'Skak kuda di {square}! Jujur gue sendiri baru ngeh ada petak skak pas mau ngeklik.',
			},
		},
	],
	krisCheckPawn: [
		{
			id: '1500-kcpc1',
			mood: 'cheeky',
			text: {
				en: 'Getting checked by a pawn on {square} feels hilarious ngl.',
				id: 'Kena skak sama pion di {square}?! Kocak sih, pion doang udah berani nyolek raja.',
			},
		},
	],
	playerCheckWhenWinning: [
		{
			id: '1500-pcww1',
			mood: 'smug',
			text: {
				en: 'Check on {square}? Bro I’m still up huge, stop trying to farm highlight clips.',
				id: 'Skak hiburan di {square} doang nih? Nggak ngaruh sih, poin gue masih unggul jauh.',
			},
		},
	],
	playerCheckTense: [
		{
			id: '1500-pct1',
			mood: 'sweating',
			text: {
				en: 'Okay annoying check on {square}... please stop poking me, let me think for two seconds!',
				id: 'Nyebelin banget skak di {square} barusan... kasih napas bentar dong jangan ditekan terus!',
			},
		},
	],
	krisCastleKingside: [
		{
			id: '1500-kck1',
			mood: 'cheeky',
			text: {
				en: 'Castled! Alright safety mode on, now I can do stupid sacrifices.',
				id: 'Rokade aman! Kalau raja udah ngumpet gini baru deh enak mau ngacak-ngacak tengah.',
			},
		},
	],
	krisCastleQueenside: [
		{
			id: '1500-kcq_o1',
			mood: 'hyped',
			text: {
				en: 'Long castle!! Let’s turn this into an all-out race before either of us thinks straight.',
				id: 'Rokade panjang!! Gas adu cepat hajar sayap sebelum dua-duanya sempet mikir rapi.',
			},
		},
	],
	opponentUncastledCenter: [
		{
			id: '1500-ouc1',
			mood: 'curious',
			text: {
				en: 'Move {moveNum} and your King is STILL standing in the middle?! Are you fearless or just forgot?',
				id: 'Udah langkah {moveNum} raja lo masih nongkrong di tengah?! Sengaja nge-troll apa lupa rokade sih?',
			},
		},
	],
	krisPromotion: [
		{
			id: '1500-kpro1',
			mood: 'hyped',
			text: {
				en: 'PROMOTED AT {square}!! Let’s gooo, nobody stopping me now!',
				id: 'PROMOSI DI {square}!! Udah deh kelar urusan kalau udah punya menteri baru gini!',
			},
		},
	],
	krisKnightOutpost: [
		{
			id: '1500-kno1',
			mood: 'smug',
			text: {
				en: 'Knight parked on {square}. Don’t even bother trying to kick him out.',
				id: 'Parkir kuda di {square} dulu, malesin banget tuh pasti ngeliatnya.',
			},
		},
	],
	krisRookFile: [
		{
			id: '1500-krf1',
			mood: 'determined',
			text: {
				en: 'Putting the Rook on {square}. Looks super tactical right? Just pretend I planned it.',
				id: 'Geser benteng ke {square}. Keliatan kayak grandplan banget kan? Padahal baru kepikiran.',
			},
		},
	],
	krisBishopActivity: [
		{
			id: '1500-kba1',
			mood: 'cheeky',
			text: {
				en: 'Bishop to {square}! Wait... did I leave anything undefended back home?',
				id: 'Gajah ke {square}! Eh bentar... di belakang nggak ada yang lupa dijaga kan ya?',
			},
		},
	],
	krisQueenActivity: [
		{
			id: '1500-kqa1',
			mood: 'curious',
			text: {
				en: 'Queen slides to {square}. Do I have a real threat here? Maybe, check carefully lol.',
				id: 'Menteri geser ke {square}. Ada ancaman beneran nggak di situ? Cari tau sendiri deh wkwk.',
			},
		},
	],
	krisPawnBreak: [
		{
			id: '1500-kpb1',
			mood: 'determined',
			text: {
				en: 'Pushing {san}, honestly got bored staring at a closed board.',
				id: 'Dorong {san} aja lah, bosen banget liat papan ketutup terus dari tadi.',
			},
		},
	],
	krisMidgameTempo: [
		{
			id: '1500-kmt1',
			mood: 'curious',
			text: {
				en: 'Moved to {square}. Looks kinda intimidating right? Even I’m not 100% sure why.',
				id: 'Pindah ke {square}. Alasannya apa? Nggak tau juga, biar keliatan serius aja.',
			},
		},
		{
			id: '1500-kmt2',
			mood: 'sweating',
			text: {
				en: 'Played {san}... wait why did the bad part of that move only hit my brain AFTER clicking?!',
				id: 'Barusan jalan {san}... eh bentar kok baru kepikiran jeleknya pas udah diklik ya?!',
			},
		},
		{
			id: '1500-kmt3',
			mood: 'cheeky',
			text: {
				en: 'Your turn after {san}. Honestly feels like one of us is gonna hang something soon.',
				id: 'Giliran lo abis {san}. Entah kenapa feeling gue salah satu bentar lagi pasti kepleset.',
			},
		},
	],
	krisBigLead: [
		{
			id: '1500-kbl1',
			mood: 'smug',
			text: {
				en: 'Up huge right now! Wait... please nobody tell me how I could possibly throw this.',
				id: 'Unggul jauh banget nih gue! Awas aja kalau sampe kebalik lagi gara-gara gue ceroboh...',
			},
		},
	],
	krisUnderPressure: [
		{
			id: '1500-kup1',
			mood: 'crying',
			text: {
				en: 'Wait why am I suddenly losing?! Okay fine, full chaotic trap mode activated till the end!',
				id: 'Kok tiba-tiba posisi gue ancur gini sih?! Bodo amat deh, gue pasang semua jebakan ngasal aja!',
			},
		},
	],
	endgameRooks: [
		{
			id: '1500-egr1',
			mood: 'sweating',
			text: {
				en: 'Rook endgame time! Wait I always lose rook endgames, gotta actually concentrate...',
				id: 'Masuk endgame benteng nih... aduh gue paling sering kepleset kalau udah tinggal benteng doang.',
			},
		},
	],
	advancedPawnPush: [
		{
			id: '1500-app1',
			mood: 'hyped',
			text: {
				en: 'Pawn’s creeping all the way to {square}!! Catch it if you can!',
				id: 'Pion gue udah meluncur ke {square} tuh!! Cegat kalau sempet!',
			},
		},
	],
	endgameWinning: [
		{
			id: '1500-egw1',
			mood: 'sweating',
			text: {
				en: 'Winning endgame... nobody distract me right now so I don’t throw with a dumb stalemate!',
				id: 'Endgame udah pegang menang nih... jangan ada yang ngechat dulu ntar gue kepencet stalemate!',
			},
		},
	],
	endgameDefending: [
		{
			id: '1500-egd1',
			mood: 'determined',
			text: {
				en: 'Wait I’m still gonna try swindling a draw somehow. Don’t relax for one second!',
				id: 'Belum nyerah gue, tetep nyari celah biar seri! Jangan lengah sedetik pun lo!',
			},
		},
	],
	endgameEven: [
		{
			id: '1500-ege1',
			mood: 'sweating',
			text: {
				en: 'Still dead even at move {moveNum}?! My brain’s fried, who slips first?',
				id: 'Masih imbang ketat sampe langkah {moveNum}?! Otak gue udah ngebul nih, siapa kepleset duluan?',
			},
		},
	],
	lowPlayerClock: [
		{
			id: '1500-lpc1',
			mood: 'hyped',
			text: {
				en: 'Under 90 seconds left! Time panic mode, try not to slip!',
				id: 'Sisa di bawah 90 detik tuh! Ayo buru-buru jangan sampe salah klik!',
			},
		},
	],
	winCheckmate: [
		{
			id: '1500-wc1',
			mood: 'win',
			text: {
				en: 'WAIT CHECKMATE IN {moveNum}?! Haha told you the 2am strat works! Run it back!',
				id: 'EH SKAKMAT DI LANGKAH {moveNum}?! Tuh kan beneran tembus! Ayo tanding lagi!',
			},
		},
		{
			id: '1500-wc2',
			mood: 'win',
			text: {
				en: 'GG!! Actually played kinda cracked at the end there, rematch whenever!',
				id: 'GG!! Gila sih penutupnya rapih banget tadi, gas ronde kedua kalau berani!',
			},
		},
	],
	winTimeout: [
		{
			id: '1500-wt1',
			mood: 'win',
			text: {
				en: 'Clock hit zero! Honestly tight game, just move your hand quicker next time lol.',
				id: 'Waktu lo abis duluan! Padahal posisinya bagus lho, agak dicepetin aja kliknya nanti.',
			},
		},
	],
	winResign: [
		{
			id: '1500-wr1',
			mood: 'cheeky',
			text: {
				en: 'Wait resigning already at move {moveNum}? Could’ve at least let me checkmate! Rematch?',
				id: 'Lah nyerah di langkah {moveNum}? Padahal baru mau gaya-gayaan skakmat! Main lagi yuk?',
			},
		},
	],
	loseGame: [
		{
			id: '1500-lg1',
			mood: 'shocked',
			text: {
				en: 'Bro my chair was way too low, wasn’t even sitting properly!! Hit rematch right now!',
				id: 'Gila sih kursi gue licin banget makanya kepleset barusan!! Rematch sekarang nggak sah!',
			},
		},
		{
			id: '1500-lg2',
			mood: 'crying',
			text: {
				en: 'Okay fine you cooked me at 1500... wasn’t warmed up anyway! One more game!',
				id: 'Yaudah deh kalah beneran di 1500... tadi baru pemanasan soalnya! Sekali lagi ayo!',
			},
		},
	],
	drawGame: [
		{
			id: '1500-dg1',
			mood: 'curious',
			text: {
				en: 'A tie after {moveNum} moves?! Wait nobody wins?! Okay tiebreaker right now!',
				id: 'Seri abis {moveNum} langkah?! Nanggung banget nggak ada yang menang, penentuan sekarang yuk!',
			},
		},
	],
};

/**
 * Tier 1900: Unc Kris (EN) / Om Kris (ID)
 * Real Kristianto voice (~1900 Chess.com Rapid): smug, dryly mocking, teasingly superior, yet human & fair if beaten.
 */
const UNC_KRIS_BANK: CategoryPool = {
	introWhite: [
		{
			id: '1900-iw1',
			mood: 'smug',
			text: {
				en: 'You got White. Try not to collapse before move fifteen, alright?',
				id: 'Kamu dapet Putih ya. Usahain jangan langsung goyang sebelum langkah lima belas.',
			},
		},
		{
			id: '1900-iw2',
			mood: 'smug',
			text: {
				en: 'Go ahead, open it up. Most challengers run out of ideas right around move ten.',
				id: 'Silakan jalan duluan. Biasanya baru sepuluh langkah aja udah pada bingung sendiri.',
			},
		},
		{
			id: '1900-iw3',
			mood: 'cheeky',
			text: {
				en: '1900 Elo doesn’t hand out freebies. Impress me with your opening.',
				id: 'Di 1900 nggak ada cerita ngasih diskon ya. Coba deh liat pembukaan andalanmu.',
			},
		},
	],
	introBlack: [
		{
			id: '1900-ib1',
			mood: 'smug',
			text: {
				en: 'I’m on White this game. Feel free to take your time losing slowly.',
				id: 'Aku pegang Putih duluan ya. Mikir pelan-pelan aja, kalahnya biar nggak terlalu kaget.',
			},
		},
		{
			id: '1900-ib2',
			mood: 'smug',
			text: {
				en: 'Taking White today. Hope your Black defense holds up longer than average.',
				id: 'Putih di aku hari ini. Semoga pertahananmu nggak gampang jebol kayak yang lain.',
			},
		},
		{
			id: '1900-ib3',
			mood: 'cheeky',
			text: {
				en: 'I’ll set the pace with White. Show me if you’ve actually practiced against 1900.',
				id: 'Aku buka duluan nih. Tunjukin aja beneran udah siap lawan 1900 apa cuma modal nekat.',
			},
		},
	],
	firstMoveWhiteE4: [
		{
			id: '1900-fmwe1',
			mood: 'smug',
			text: {
				en: '1. e4, cute. Let’s see if your prep goes any deeper than move four.',
				id: '1. e4, standar banget ya. Coba kita lihat hafalannya nyampe langkah berapa.',
			},
		},
		{
			id: '1900-fmwe2',
			mood: 'cheeky',
			text: {
				en: 'Classic 1. e4. Bold of you to invite a tactical fight right away.',
				id: 'Klasik 1. e4. Berani juga langsung ngajak adu taktik di tengah.',
			},
		},
	],
	firstMoveWhiteD4: [
		{
			id: '1900-fmwd1',
			mood: 'smug',
			text: {
				en: '1. d4? Trying to play solid and pray for an endgame draw already?',
				id: '1. d4 nih? Udah niat main aman cari aman dari langkah pertama ya?',
			},
		},
		{
			id: '1900-fmwd2',
			mood: 'cheeky',
			text: {
				en: 'Ooh 1. d4. Trying to out-patient me? Good luck with that.',
				id: 'Oke 1. d4. Mau adu sabar lawan aku? Boleh juga percaya dirinya.',
			},
		},
	],
	firstMoveWhiteOther: [
		{
			id: '1900-fmwo1',
			mood: 'smug',
			text: {
				en: '{san} on move one? Taking me off-book won’t hide positional gaps for long.',
				id: 'Buka pake {san}? Belok dari teori utama nggak bakal nyelametin posisi juga sih.',
			},
		},
	],
	firstMoveBlackSicilian: [
		{
			id: '1900-fmbs1',
			mood: 'cheeky',
			text: {
				en: 'Sicilian ...c5 straight away. Alright, at least you aren’t playing scared.',
				id: 'Langsung ...c5, Sicilian. Lumayan lah, setidaknya nggak main penakut.',
			},
		},
	],
	firstMoveBlackOpen: [
		{
			id: '1900-fmbo1',
			mood: 'smug',
			text: {
				en: 'Matching with {san}. Honest chess, usually exposes who calculates faster pretty quick.',
				id: 'Bales {san} nih. Bagus lah, makin keliatan nanti siapa yang kalkulasinya telat.',
			},
		},
	],
	firstMoveBlackSolid: [
		{
			id: '1900-fmbso1',
			mood: 'smug',
			text: {
				en: 'Playing {san} to stay safe? Cute try, passive setups don’t hold forever.',
				id: 'Main aman dulu lewat {san}? Lucu sih, tapi pertahanan pasif nggak bakal tahan lama.',
			},
		},
	],
	firstMoveBlackOther: [
		{
			id: '1900-fmbot1',
			mood: 'smug',
			text: {
				en: '{san}? Little cute sideline on move one. Enjoy playing cramped in five moves.',
				id: 'Unik juga bales {san}. Liat aja lima langkah lagi pasti mulai sesak sendiri.',
			},
		},
	],
	openingSicilian: [
		{
			id: '1900-opsic1',
			mood: 'smug',
			text: {
				en: 'Sharp Sicilian already. One lazy move from you here and this gets ugly fast.',
				id: 'Jalur Sicilian gini emang asik buat ngehukum yang suka lengah di awal.',
			},
		},
		{
			id: '1900-opsic2',
			mood: 'cheeky',
			text: {
				en: 'Bold playing an open Sicilian at 1900. Hope you like defending the c-file.',
				id: 'Berani juga bawa Sicilian ke sini. Semoga betah ya dijagain terus lajur-c nya.',
			},
		},
	],
	openingRuyLopez: [
		{
			id: '1900-oprl1',
			mood: 'smug',
			text: {
				en: 'Ruy Lopez. Gonna slowly squeeze all your oxygen out till something snaps.',
				id: 'Ruy Lopez nih. Pelan-pelan aku tutup ruang gerakmu sampe bingung mau jalan apa.',
			},
		},
	],
	openingItalian: [
		{
			id: '1900-opit1',
			mood: 'cheeky',
			text: {
				en: 'Italian Game. Looks cozy on move three right before tactics shred careless setups.',
				id: 'Italian Game. Kelihatannya santai padahal paling cepet ngehukum yang asal ngembangin.',
			},
		},
	],
	openingPetrov: [
		{
			id: '1900-oppe1',
			mood: 'smug',
			text: {
				en: 'Petrov Defense? Trying to bore your way into a half-point? Not happening.',
				id: 'Petrov? Niat nyari seri gampang dari awal nih ceritanya? Nggak segampang itu.',
			},
		},
	],
	openingOpenGame: [
		{
			id: '1900-opog1',
			mood: 'smug',
			text: {
				en: 'Classical e4 e5, no tricks to hide behind. Pure gap in calculation now.',
				id: 'Klasik e4 e5, nggak ada trik murahan buat ngumpet. Murni adu kualitas aja sekarang.',
			},
		},
	],
	openingFrench: [
		{
			id: '1900-opfr1',
			mood: 'smug',
			text: {
				en: 'French pawn chain locked in. Enjoy pretending that light bishop still exists.',
				id: 'Struktur French udah ketutup gini. Selamat ya gajah terangnya jadi penonton sampai akhir.',
			},
		},
	],
	openingCaroKann: [
		{
			id: '1900-opck1',
			mood: 'determined',
			text: {
				en: 'Caro-Kann fortress again. Fine, guess I’ll just dismantle it piece by piece.',
				id: 'Caro-Kann lagi, nyari aman banget ya. Yaudah pelan-pelan aku bongkar temboknya.',
			},
		},
	],
	openingScandinavian: [
		{
			id: '1900-opsc1',
			mood: 'smug',
			text: {
				en: 'Scandinavian d5? Appreciate all the free tempos you’re about to hand me chasing your Queen.',
				id: 'Langsung d5? Makasih lho nanti bakal ngasih banyak tempo gratis buat ngejar menterimu.',
			},
		},
	],
	openingQueensGambit: [
		{
			id: '1900-opqg1',
			mood: 'cheeky',
			text: {
				en: 'Queen’s Gambit. Let’s see if you actually understand the c4 tension or just play blindly.',
				id: 'Queen’s Gambit. Kita lihat kamu paham tensi c4 apa cuma ngikutin pola doang.',
			},
		},
	],
	openingIndian: [
		{
			id: '1900-opin1',
			mood: 'cheeky',
			text: {
				en: 'Flexible Indian setup. Wait till you see how fast those dark squares cave in.',
				id: 'Pola Indian gini seru sih, liat aja nanti sisi gelapmu bakal kebuka secepat apa.',
			},
		},
	],
	openingEnglish: [
		{
			id: '1900-open1',
			mood: 'smug',
			text: {
				en: 'English c4 setup, feels quiet now till your center suddenly vanishes.',
				id: 'Pembukaan sayap c4 kelihatan kalem sekarang sebelum tengahmu ilang pelan-pelan.',
			},
		},
	],
	openingGeneral: [
		{
			id: '1900-opge1',
			mood: 'smug',
			text: {
				en: 'Cute opening prep. Alright, training wheels come off from this move onward.',
				id: 'Lumayan lah pembukaannya. Oke, pemanasan selesai, sekarang main beneran.',
			},
		},
		{
			id: '1900-opge2',
			mood: 'cheeky',
			text: {
				en: 'Developed okay so far. Let’s see if your middlegame actually holds up though.',
				id: 'Sejauh ini nggak malu-maluin kok. Tinggal lihat middlegame-nya tahan apa nggak.',
			},
		},
	],
	earlyQueen: [
		{
			id: '1900-eq1',
			mood: 'smug',
			text: {
				en: 'Queen to {square} on move {moveNum}? Really? Did that work on a 700 earlier or something?',
				id: 'Menteri udah keluar ke {square} di langkah {moveNum}? Serius? Biasanya berhasil di elo 700 ya?',
			},
		},
		{
			id: '1900-eq2',
			mood: 'cheeky',
			text: {
				en: 'Bringing the Queen out already? Thanks for donating development tempos cleanly.',
				id: 'Cepet amat bawa menteri jalan-jalan ke {square}? Makasih bonus temponya ya.',
			},
		},
	],
	queenTrade: [
		{
			id: '1900-qt1',
			mood: 'smug',
			text: {
				en: 'Queens off at {square}. No lucky swindle flags left, pure endgame gap now.',
				id: 'Menteri udah tukeran di {square}. Nggak bisa ngarepin serangan hoki lagi, adu skill murni.',
			},
		},
		{
			id: '1900-qt2',
			mood: 'cheeky',
			text: {
				en: 'Trading Queens already at {square}? Hope your endgame isn’t as shaky as your middlegame.',
				id: 'Udah pengen tuker menteri aja di {square}? Semoga endgame-mu lebih rapi daripada tadi ya.',
			},
		},
	],
	krisCaptureQueen: [
		{
			id: '1900-kcq1',
			mood: 'smug',
			text: {
				en: 'Wait, are we donating Queens on {square} now? Appreciate the charity, really.',
				id: 'Seriusan ngasih menteri ke {square} gitu aja? Ya makasih sih, nggak sopan nolak rezeki.',
			},
		},
		{
			id: '1900-kcq2',
			mood: 'smug',
			text: {
				en: 'Left your Queen sitting on {square}? Yeah... New Match button is right over there.',
				id: 'Menterinya nyangkut di {square} tuh? Tombol Main Baru ada di sebelah kanan ya.',
			},
		},
	],
	krisCaptureRook: [
		{
			id: '1900-kcr1',
			mood: 'smug',
			text: {
				en: 'Free Rook on {square}? Don’t feel bad, happens to everybody once they face 1900.',
				id: 'Benteng di {square} nganggur, aku ambil ya. Wajar kok gugup pas ketemu 1900.',
			},
		},
		{
			id: '1900-kcr2',
			mood: 'cheeky',
			text: {
				en: 'Grabbed that Rook on {square}. Playing down an exchange from here sounds miserable.',
				id: 'Dapet benteng di {square}. Berat banget sih kalau udah kalah kualitas begini.',
			},
		},
	],
	krisCaptureKnight: [
		{
			id: '1900-kcn1',
			mood: 'smug',
			text: {
				en: 'Knight on {square} is gone. Honestly surprised you even left that loose.',
				id: 'Kuda di {square} aku rapihin dulu. Agak kaget sih bisa ketinggalan segampang itu.',
			},
		},
		{
			id: '1900-kcn2',
			mood: 'cheeky',
			text: {
				en: 'Picked off the Knight at {square}. Clean little gift.',
				id: 'Lumayan dapet kuda di {square}. Makasih ya hadiah kecilnya.',
			},
		},
	],
	krisCaptureBishop: [
		{
			id: '1900-kcb1',
			mood: 'smug',
			text: {
				en: 'Swiped that Bishop off {square}. Didn’t need that diagonal bothering me anyway.',
				id: 'Gajah di {square} keambil bersih. Enak banget nih diagonalmu langsung bolong.',
			},
		},
	],
	krisCaptureCenterPawn: [
		{
			id: '1900-kccp1',
			mood: 'smug',
			text: {
				en: 'Center pawn on {square} is mine. Thanks for handing over the middle for free.',
				id: 'Pion tengah di {square} kebawa arus. Makasih udah ngasih pusat papan gratis.',
			},
		},
	],
	krisCapturePawn: [
		{
			id: '1900-kcp1',
			mood: 'smug',
			text: {
				en: 'Did you forget to defend {square}? Free pawns add up quicker than you think.',
				id: 'Pion di {square} lupa dijaga ya? Pelan-pelan selisih segini kerasa banget nanti.',
			},
		},
		{
			id: '1900-kcp2',
			mood: 'cheeky',
			text: {
				en: 'Scooped that loose pawn on {square}. Sloppy details decide games here.',
				id: 'Nambah satu pion di {square}. Detail kecil kayak gini yang bikin beda kelas.',
			},
		},
	],
	playerCaptureBig: [
		{
			id: '1900-pcb1',
			mood: 'shocked',
			text: {
				en: 'Wait... how did I miss that shot on {square}?! Fine, stop grinning, you got lucky once.',
				id: 'Eh kelewat dong tadi di {square}! Jangan senyum dulu, baru hoki sekali doang ini.',
			},
		},
		{
			id: '1900-pcb2',
			mood: 'determined',
			text: {
				en: 'Okay, missed you grabbing my {piece} on {square}. Let’s see how you handle messy play now.',
				id: 'Waduh kecolongan {piece} di {square}. Boleh juga matamu, tapi jangan harap kelar gampang.',
			},
		},
	],
	playerCaptureEven: [
		{
			id: '1900-pce1',
			mood: 'smug',
			text: {
				en: 'Cute trade on {square}. Didn’t notice you just opened three files for me huh?',
				id: 'Tuker di {square}? Nggak sadar ya jalur buat perwiraku malah kebuka semua habis ini.',
			},
		},
	],
	krisCheckQueen: [
		{
			id: '1900-kcqc1',
			mood: 'smug',
			text: {
				en: 'Check on {square}. Go ahead, pretend there’s still a comfortable square for your King.',
				id: 'Skak menteri di {square}. Silakan cari petak nyaman, itu pun kalau masih ada.',
			},
		},
	],
	krisCheckRook: [
		{
			id: '1900-kcrc1',
			mood: 'smug',
			text: {
				en: 'Rook check from {square}. Notice how quickly that open file became a problem?',
				id: 'Skak benteng dari {square}. Baru kerasa kan bahayanya ninggalin lajur terbuka?',
			},
		},
	],
	krisCheckDiagonal: [
		{
			id: '1900-kcdc1',
			mood: 'smug',
			text: {
				en: 'Bishop check at {square}. Forgot diagonals go all the way across the board?',
				id: 'Skak gajah dari {square}. Suka lupa ya diagonal bisa nembus sejauh itu?',
			},
		},
	],
	krisCheckKnight: [
		{
			id: '1900-kcnc1',
			mood: 'cheeky',
			text: {
				en: 'Knight check on {square}. Didn’t spot that fork square coming either, did you?',
				id: 'Skak kuda di {square}. Nggak kepikiran kan bakal kena lompat ke petak situ?',
			},
		},
	],
	krisCheckPawn: [
		{
			id: '1900-kcpc1',
			mood: 'smug',
			text: {
				en: 'Checked by a pawn on {square}. Honestly, that’s just embarrassing.',
				id: 'Kena skak sama pion doang di {square}. Agak memalukan sih kalau sampe gini.',
			},
		},
	],
	playerCheckWhenWinning: [
		{
			id: '1900-pcww1',
			mood: 'smug',
			text: {
				en: 'Spite check on {square}? Cute fireworks, does literally zero damage.',
				id: 'Skak hiburan di {square}? Keren sih gayanya, tapi nggak ngaruh sama sekali.',
			},
		},
	],
	playerCheckTense: [
		{
			id: '1900-pct1',
			mood: 'determined',
			text: {
				en: 'Okay, cheeky check on {square}. Watch how quickly I shut that down.',
				id: 'Boleh juga skak di {square} tadi. Liat aja sebentar lagi langsung kuambil alih balik.',
			},
		},
	],
	krisCastleKingside: [
		{
			id: '1900-kck1',
			mood: 'smug',
			text: {
				en: 'King tucked safely away. Now you get to deal with my actual attack.',
				id: 'Raja udah aman nih. Sekarang baru giliran kamu nahan seranganku.',
			},
		},
	],
	krisCastleQueenside: [
		{
			id: '1900-kcq_o1',
			mood: 'cheeky',
			text: {
				en: 'Queenside castle. Ready to race? Winner gets all the bragging rights.',
				id: 'Rokade panjang nih. Berani adu cepat hancurin sayap raja?',
			},
		},
	],
	opponentUncastledCenter: [
		{
			id: '1900-ouc1',
			mood: 'smug',
			text: {
				en: 'Move {moveNum} and your King is still camping in the center? Truly inspiring bravery.',
				id: 'Udah langkah ke-{moveNum} rajamu masih betah di tengah? Berani apa lupa cara rokade nih?',
			},
		},
	],
	krisPromotion: [
		{
			id: '1900-kpro1',
			mood: 'hyped',
			text: {
				en: 'Brand new Queen on {square}. Honestly, resigning saves us both five minutes.',
				id: 'Menteri baru di {square}! Udah deh klik Nyerah aja daripada capek sendiri.',
			},
		},
	],
	krisKnightOutpost: [
		{
			id: '1900-kno1',
			mood: 'smug',
			text: {
				en: 'Try kicking this Knight out of {square}. Spoiler, you really can’t.',
				id: 'Coba usir kudaku dari {square} kalau bisa. Spoiler dikit, susah banget tuh.',
			},
		},
		{
			id: '1900-kno2',
			mood: 'smug',
			text: {
				en: 'Knight parked comfortably on {square}. Must feel awful staring at that.',
				id: 'Enak banget nih kudanya parkir di {square}. Pasti kesel banget ngeliatnya.',
			},
		},
	],
	krisRookFile: [
		{
			id: '1900-krf1',
			mood: 'smug',
			text: {
				en: 'Rook onto {square}, owning this file now whether you like it or not.',
				id: 'Benteng ke {square}, jalur lurus ini udah punyaku sekarang.',
			},
		},
	],
	krisBishopActivity: [
		{
			id: '1900-kba1',
			mood: 'cheeky',
			text: {
				en: 'Bishop gliding to {square}. Quietly slicing your whole setup in half.',
				id: 'Gajah ke {square}, pelan-pelan motong koordinasi bidakmu dari pojok.',
			},
		},
	],
	krisQueenActivity: [
		{
			id: '1900-kqa1',
			mood: 'smug',
			text: {
				en: 'Queen slides to {square}. Go ahead and spend three minutes figuring out the double threat.',
				id: 'Menteri geser ke {square}. Mikir pelan aja tuh nyari cara nutup dua ancamannya sekaligus.',
			},
		},
	],
	krisPawnBreak: [
		{
			id: '1900-kpb1',
			mood: 'cheeky',
			text: {
				en: 'Opening things up with {san}. Let’s see how clean your defense really is.',
				id: 'Dobrak pake {san}, pengen lihat sekuat apa sih pertahananmu kalau mulai kebuka.',
			},
		},
	],
	krisMidgameTempo: [
		{
			id: '1900-kmt1',
			mood: 'smug',
			text: {
				en: 'Your move. Try not to miss the obvious threat this time.',
				id: 'Giliranmu. Usahain jangan kelewat ancaman yang jelas ya kali ini.',
			},
		},
		{
			id: '1900-kmt2',
			mood: 'cheeky',
			text: {
				en: 'Tight move to {square}. Slowly taking away every decent square you have.',
				id: 'Langkah tenang ke {square}, makin lama ruang gerakmu makin habis sendiri tuh.',
			},
		},
		{
			id: '1900-kmt3',
			mood: 'smug',
			text: {
				en: 'Move {moveNum}, {san}. Take your time, none of your replies look great anyway.',
				id: 'Langkah {moveNum}, {san}. Mikir santai aja, pilihannya juga agak susah semua sih.',
			},
		},
	],
	krisBigLead: [
		{
			id: '1900-kbl1',
			mood: 'smug',
			text: {
				en: 'Honestly, hitting New Match preserves a bit of dignity for both of us here.',
				id: 'Udah unggul segini jauh, nggak capek apa lanjut terus? Main Baru aja yuk.',
			},
		},
		{
			id: '1900-kbl2',
			mood: 'smug',
			text: {
				en: 'Up a mountain of material, just cruising effortlessly from here.',
				id: 'Posisiku udah terlalu nyaman sih ini, tinggal tunggu waktunya aja.',
			},
		},
	],
	krisUnderPressure: [
		{
			id: '1900-kup1',
			mood: 'determined',
			text: {
				en: 'Alright I’m down a bit, doesn’t mean you actually know how to finish this cleanly.',
				id: 'Oke aku lagi ketinggalan poin, tapi belum tentu kamu sanggup nutup gamenya bersih.',
			},
		},
		{
			id: '1900-kup2',
			mood: 'cheeky',
			text: {
				en: 'Rough spot, sure. Watch how many traps I still hide before you resign-check me.',
				id: 'Lagi tertekan sih, tapi jangan senyum dulu, masih banyak ranjau di papan.',
			},
		},
	],
	endgameRooks: [
		{
			id: '1900-egr1',
			mood: 'smug',
			text: {
				en: 'Rook endgame. Everybody thinks they understand it till their King gets cut off.',
				id: 'Endgame benteng nih. Banyak yang ngerasa jago sampe rajanya kepotong nggak bisa maju.',
			},
		},
	],
	advancedPawnPush: [
		{
			id: '1900-app1',
			mood: 'smug',
			text: {
				en: 'Pawn’s all the way down on {square} now. Might wanna wake up and stop it.',
				id: 'Pionku udah sampe {square} tuh. Cegat dong kalau masih sempet.',
			},
		},
	],
	endgameWinning: [
		{
			id: '1900-egw1',
			mood: 'smug',
			text: {
				en: 'Clean winning endgame from move {moveNum}. Feel free to shake hands early.',
				id: 'Endgame udah jelas banget unggulnya. Mau salaman lebih cepet juga boleh kok.',
			},
		},
	],
	endgameDefending: [
		{
			id: '1900-egd1',
			mood: 'determined',
			text: {
				en: 'Down a bit in the endgame. Come on then, prove you actually know winning technique.',
				id: 'Lagi ketinggalan di endgame nih. Ayo buktiin dong beneran punya teknik nutup kemenangan.',
			},
		},
	],
	endgameEven: [
		{
			id: '1900-ege1',
			mood: 'determined',
			text: {
				en: 'Dead even at move {moveNum}. One lazy King move throws away the entire game.',
				id: 'Masih imbang di langkah {moveNum}. Salah satu langkah raja aja langsung tamat.',
			},
		},
	],
	lowPlayerClock: [
		{
			id: '1900-lpc1',
			mood: 'smug',
			text: {
				en: 'Under 90 seconds left already? Guess calculating against 1900 drains clock pretty fast.',
				id: 'Udah di bawah 90 detik aja tuh? Mikir lawan 1900 emang agak nguras waktu ya?',
			},
		},
	],
	winCheckmate: [
		{
			id: '1900-wc1',
			mood: 'win',
			text: {
				en: 'Checkmate in {moveNum}. Did you actually expect a different ending? Rematch anytime.',
				id: 'Skakmat di langkah {moveNum}. Udah ketebak sih sebenernya dari tadi. Main lagi?',
			},
		},
		{
			id: '1900-wc2',
			mood: 'win',
			text: {
				en: 'And that’s mate on move {moveNum}. Good effort though, try again whenever.',
				id: 'Mat di langkah {moveNum}. Lumayan lah perlawanannya, ayo coba lagi.',
			},
		},
	],
	winTimeout: [
		{
			id: '1900-wt1',
			mood: 'win',
			text: {
				en: 'Flagged on zero. Turns out thinking slow doesn’t beat 1900 either.',
				id: 'Waktunya abis nol duluan. Lain kali mikirnya jangan kelamaan ya kalau udah kepepet.',
			},
		},
	],
	winResign: [
		{
			id: '1900-wr1',
			mood: 'smug',
			text: {
				en: 'Calling it respectfully at move {moveNum}. Wanna run it back or drop down to 1500?',
				id: 'Nyerah di langkah {moveNum}? Oke bijak sih. Mau tanding ulang apa turun ke 1500 dulu?',
			},
		},
	],
	loseGame: [
		{
			id: '1900-lg1',
			mood: 'shocked',
			text: {
				en: 'Wait... no shot I just lost cleanly to you at 1900?! Don’t leave, rematch right now.',
				id: 'Bentar... masa beneran kalah sih 1900-ku?! Jangan ke mana-mana, rematch sekarang!',
			},
		},
		{
			id: '1900-lg2',
			mood: 'determined',
			text: {
				en: 'Okay fine, got outplayed fair and square. Respect, hit New Match, I want my Elo back.',
				id: 'Oke kecolongan beneran tadi, respect mainmu rapi! Klik Main Baru, pengen bales nih.',
			},
		},
	],
	drawGame: [
		{
			id: '1900-dg1',
			mood: 'cheeky',
			text: {
				en: 'A draw after {moveNum} moves?! Alright, credit where it’s due, tiebreaker right now?',
				id: 'Seri setelah {moveNum} langkah?! Boleh juga tahan segitu lama, tanding penentu yuk?',
			},
		},
	],
};

const PERSONA_DIALOGUE_BANKS: Record<KrisTierId, CategoryPool> = {
	'1000': LIL_KRIS_BANK,
	'1500': TEEN_KRIS_BANK,
	'1900': UNC_KRIS_BANK,
};

function formatLocalizedText(text: LocalizedText, vars?: DialogueVars): LocalizedText {
	if (!vars) return text;

	const replaceTokens = (template: string, lang: 'en' | 'id'): string =>
		template
			.replace(/\{square\}/g, vars.square ?? '')
			.replace(/\{san\}/g, vars.san ?? '')
			.replace(/\{moveNum\}/g, String(vars.moveNum ?? 1))
			.replace(/\{piece\}/g, lang === 'en' ? (vars.pieceEn ?? 'piece') : (vars.pieceId ?? 'bidak'));

	return {
		en: replaceTokens(text.en, 'en'),
		id: replaceTokens(text.id, 'id'),
	};
}

export function getMoodForDialogue(
	category: KrisDialogueCategory,
	tier: KrisTierId,
	krisLead = 0
): ChessAvatarMood {
	if (category === 'winCheckmate' || category === 'winTimeout') return 'win';
	if (category === 'drawGame') return tier === '1000' ? 'curious' : 'cheeky';
	if (category === 'loseGame') {
		return tier === '1000' ? 'crying' : tier === '1900' ? 'shocked' : 'lose';
	}
	if (category === 'winResign') {
		return tier === '1000' ? 'curious' : tier === '1900' ? 'smug' : 'cheeky';
	}

	if (category === 'krisCaptureQueen' || category === 'krisPromotion' || category === 'krisBigLead') {
		return tier === '1900' ? 'smug' : 'hyped';
	}
	if (category === 'playerCaptureBig') {
		return tier === '1000' ? 'crying' : tier === '1500' ? 'shocked' : 'determined';
	}
	if (category === 'playerCaptureEven') {
		return tier === '1000' ? 'crying' : tier === '1900' ? 'smug' : 'cheeky';
	}
	if (category === 'playerCheckWhenWinning') {
		return tier === '1000' ? 'sweating' : 'smug';
	}
	if (category === 'playerCheckTense') {
		return tier === '1000' ? 'crying' : tier === '1500' ? 'sweating' : 'determined';
	}
	if (category === 'krisUnderPressure' || category === 'endgameDefending') {
		return tier === '1000' ? 'crying' : tier === '1500' && krisLead <= -4 ? 'crying' : 'determined';
	}
	if (category === 'krisCheckQueen' || category === 'krisCheckRook' || category === 'krisCheckDiagonal' || category === 'krisCheckKnight' || category === 'krisCheckPawn') {
		return tier === '1900' ? 'smug' : 'hyped';
	}

	if (tier === '1900') {
		return krisLead <= -3 ? 'determined' : 'smug';
	}
	if (tier === '1500') {
		return category.startsWith('opening') || category.startsWith('firstMove') ? 'curious' : 'cheeky';
	}
	return category.startsWith('opening') || category.startsWith('firstMove') || category === 'queenTrade'
		? 'curious'
		: 'cheeky';
}

export function pickKrisLine(
	category: KrisDialogueCategory,
	tier: KrisTierId = '1900',
	previousIdOrIds?: string | readonly string[],
	vars?: DialogueVars
): KrisLine {
	const bank = PERSONA_DIALOGUE_BANKS[tier];
	const pool = bank[category];
	const excludeSet = new Set(
		typeof previousIdOrIds === 'string'
			? [previousIdOrIds]
			: previousIdOrIds ?? []
	);
	const unrepeated = pool.filter((item) => !excludeSet.has(item.id));
	const candidates = unrepeated.length > 0 ? unrepeated : pool;
	const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];

	return {
		id: chosen.id,
		tier,
		category,
		mood: chosen.mood ?? getMoodForDialogue(category, tier),
		text: formatLocalizedText(chosen.text, vars),
	};
}

function detectOpening(sanHistory: readonly string[]): {
	tag: string;
	category: KrisDialogueCategory;
} | null {
	if (sanHistory.length === 0) return null;
	const m1 = sanHistory[0];
	const m2 = sanHistory[1];
	const head = sanHistory.slice(0, 6);

	if (m1 === 'e4') {
		if (m2 === 'c5') return { tag: 'sicilian', category: 'openingSicilian' };
		if (m2 === 'e6') return { tag: 'french', category: 'openingFrench' };
		if (m2 === 'c6') return { tag: 'carokann', category: 'openingCaroKann' };
		if (m2 === 'd5') return { tag: 'scandinavian', category: 'openingScandinavian' };
		if (m2 === 'e5') {
			if (head.some((m) => m.startsWith('Bb5'))) {
				return { tag: 'ruylopez', category: 'openingRuyLopez' };
			}
			if (head.some((m) => m.startsWith('Bc4'))) {
				return { tag: 'italian', category: 'openingItalian' };
			}
			if (sanHistory[2] === 'Nf3' && sanHistory[3] === 'Nf6') {
				return { tag: 'petrov', category: 'openingPetrov' };
			}
			return { tag: 'opengame', category: 'openingOpenGame' };
		}
	}

	if (m1 === 'd4') {
		if (m2 === 'd5' && sanHistory[2]?.startsWith('c4')) {
			return { tag: 'qgambit', category: 'openingQueensGambit' };
		}
		if (m2 === 'Nf6') {
			return { tag: 'indian', category: 'openingIndian' };
		}
	}

	if (m1 === 'c4' || m1 === 'Nf3') {
		return { tag: 'english', category: 'openingEnglish' };
	}

	return null;
}

function getBoardStructureFacts(game: Chess, targetColor: Color) {
	let whiteQueens = 0;
	let blackQueens = 0;
	let totalNonKingMaterial = 0;
	let onlyRooksAndPawns = true;
	let kingSquare: { row: number; col: number } | null = null;

	const board = game.board();
	for (let r = 0; r < 8; r += 1) {
		for (let c = 0; c < 8; c += 1) {
			const cell = board[r]?.[c];
			if (!cell) continue;
			if (cell.type === 'k') {
				if (cell.color === targetColor) kingSquare = { row: r, col: c };
				continue;
			}
			totalNonKingMaterial += PIECE_VALUES[cell.type];
			if (cell.type === 'q') {
				if (cell.color === 'w') whiteQueens += 1;
				else blackQueens += 1;
			}
			if (cell.type !== 'r' && cell.type !== 'p') {
				onlyRooksAndPawns = false;
			}
		}
	}

	const noQueens = whiteQueens === 0 && blackQueens === 0;
	const isEndgame = (noQueens && totalNonKingMaterial <= 28) || totalNonKingMaterial <= 18;
	const homeRankRow = targetColor === 'w' ? 7 : 0;
	const kingInMiddleStartRank =
		kingSquare !== null &&
		kingSquare.row === homeRankRow &&
		kingSquare.col >= 3 &&
		kingSquare.col <= 5;

	return {
		isEndgame,
		isRookEndgame: isEndgame && onlyRooksAndPawns && totalNonKingMaterial >= 10,
		kingInMiddleStartRank,
	};
}

function hasSideCastled(game: Chess, side: Color): boolean {
	const history = game.history();
	for (let idx = 0; idx < history.length; idx += 1) {
		const moveSide: Color = idx % 2 === 0 ? 'w' : 'b';
		if (moveSide === side && (history[idx] === 'O-O' || history[idx] === 'O-O-O')) {
			return true;
		}
	}
	return false;
}

function isAdvancedPawnMove(move: Move, side: Color): boolean {
	if (move.piece !== 'p' || move.promotion) return false;
	const rank = Number.parseInt(move.to[1] ?? '0', 10);
	return side === 'w' ? rank >= 6 : rank <= 3;
}

export function analyzePlayerMoveDialogue({
	game,
	move,
	tier,
	wasFirstPlayerMove,
	preMoveKrisLead,
	postMoveKrisLead,
	prevKrisMove,
	recentIds = [],
}: PlayerMoveDialogueInput): ContextualDialogueDecision | null {
	const history = game.history();
	const moveNum = Math.max(1, Math.ceil(history.length / 2));
	const vars: DialogueVars = {
		square: move.to,
		san: move.san,
		moveNum,
		...(move.captured ? { pieceEn: PIECE_NAMES[move.captured].en, pieceId: PIECE_NAMES[move.captured].id } : {}),
	};

	if (game.isCheckmate()) {
		return {
			line: pickKrisLine('loseGame', tier, recentIds, vars),
			priority: 'critical',
		};
	}
	if (game.isDraw()) {
		return {
			line: pickKrisLine('drawGame', tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (wasFirstPlayerMove) {
		if (move.color === 'w') {
			const category: KrisDialogueCategory =
				move.san === 'e4'
					? 'firstMoveWhiteE4'
					: move.san === 'd4'
						? 'firstMoveWhiteD4'
						: 'firstMoveWhiteOther';
			return {
				line: pickKrisLine(category, tier, recentIds, vars),
				priority: 'normal',
			};
		}

		const category: KrisDialogueCategory =
			move.san === 'c5'
				? 'firstMoveBlackSicilian'
				: move.san === 'e5' || move.san === 'd5'
					? 'firstMoveBlackOpen'
					: move.san === 'e6' || move.san === 'c6' || move.san === 'Nf6'
						? 'firstMoveBlackSolid'
						: 'firstMoveBlackOther';
		return {
			line: pickKrisLine(category, tier, recentIds, vars),
			priority: 'normal',
		};
	}

	// Early Queen sortie (before move 6, non-capture, non-check)
	if (history.length <= 10 && move.piece === 'q' && !move.captured && !game.inCheck()) {
		return {
			line: pickKrisLine('earlyQueen', tier, recentIds, vars),
			priority: 'normal',
		};
	}

	if (game.inCheck()) {
		const cat: KrisDialogueCategory =
			postMoveKrisLead >= 3 ? 'playerCheckWhenWinning' : 'playerCheckTense';
		return {
			line: pickKrisLine(cat, tier, recentIds, vars),
			priority: 'normal',
		};
	}

	if (move.captured === 'q' && prevKrisMove?.captured === 'q') {
		return {
			line: pickKrisLine('queenTrade', tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (move.captured) {
		const capturedValue = PIECE_VALUES[move.captured];
		const lostDelta = preMoveKrisLead - postMoveKrisLead;
		const wasDirectRecapture = prevKrisMove?.to === move.to && prevKrisMove.captured;

		if (
			!wasDirectRecapture &&
			(capturedValue >= 5 || (capturedValue >= 3 && (lostDelta >= 3 || postMoveKrisLead < 0)))
		) {
			return {
				line: pickKrisLine('playerCaptureBig', tier, recentIds, vars),
				priority: 'critical',
			};
		}

		if (capturedValue >= 3 && Math.random() < 0.72) {
			return {
				line: pickKrisLine('playerCaptureEven', tier, recentIds, vars),
				priority: 'normal',
			};
		}
	}

	return null;
}

export function analyzeKrisMoveDialogue({
	game,
	move,
	tier,
	fromBook,
	krisColor,
	preMoveKrisLead,
	postMoveKrisLead,
	prevPlayerMove,
	spokenOpeningTag,
	recentIds = [],
}: KrisMoveDialogueInput): ContextualDialogueDecision | null {
	const history = game.history();
	const plyCount = history.length;
	const moveNum = Math.max(1, Math.ceil(plyCount / 2));
	const challengerColor: Color = krisColor === 'w' ? 'b' : 'w';

	const vars: DialogueVars = {
		square: move.to,
		san: move.san,
		moveNum,
		...(move.captured
			? { pieceEn: PIECE_NAMES[move.captured].en, pieceId: PIECE_NAMES[move.captured].id }
			: {}),
	};

	if (game.isCheckmate()) {
		return {
			line: pickKrisLine('winCheckmate', tier, recentIds, vars),
			priority: 'critical',
		};
	}
	if (game.isDraw()) {
		return {
			line: pickKrisLine('drawGame', tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (game.inCheck()) {
		const checkCategoryByPiece: Record<PieceSymbol, KrisDialogueCategory> = {
			q: 'krisCheckQueen',
			r: 'krisCheckRook',
			b: 'krisCheckDiagonal',
			n: 'krisCheckKnight',
			p: 'krisCheckPawn',
			k: 'krisCheckQueen',
		};
		return {
			line: pickKrisLine(checkCategoryByPiece[move.piece], tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (move.promotion) {
		return {
			line: pickKrisLine('krisPromotion', tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (move.captured === 'q' && prevPlayerMove?.captured === 'q') {
		return {
			line: pickKrisLine('queenTrade', tier, recentIds, vars),
			priority: 'critical',
		};
	}

	if (move.captured) {
		const capturedType = move.captured;
		const isImmediateRecapture = Boolean(
			prevPlayerMove && prevPlayerMove.to === move.to && prevPlayerMove.captured
		);

		if (capturedType === 'q') {
			return {
				line: pickKrisLine('krisCaptureQueen', tier, recentIds, vars),
				priority: 'critical',
			};
		}
		if (capturedType === 'r' && (!isImmediateRecapture || postMoveKrisLead >= 2)) {
			return {
				line: pickKrisLine('krisCaptureRook', tier, recentIds, vars),
				priority: 'critical',
			};
		}
		if (
			(capturedType === 'n' || capturedType === 'b') &&
			(!isImmediateRecapture || postMoveKrisLead >= preMoveKrisLead + 2)
		) {
			const cat: KrisDialogueCategory =
				capturedType === 'n' ? 'krisCaptureKnight' : 'krisCaptureBishop';
			return {
				line: pickKrisLine(cat, tier, recentIds, vars),
				priority: 'critical',
			};
		}
		if (capturedType === 'p') {
			const isCenterPawn = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5'].includes(move.to);
			if (isCenterPawn && plyCount > 6 && !isImmediateRecapture) {
				return {
					line: pickKrisLine('krisCaptureCenterPawn', tier, recentIds, vars),
					priority: 'normal',
				};
			}
			if (plyCount > 10 && !isImmediateRecapture && postMoveKrisLead > preMoveKrisLead) {
				return {
					line: pickKrisLine('krisCapturePawn', tier, recentIds, vars),
					priority: 'normal',
				};
			}
		}
	}

	if (move.san === 'O-O') {
		return {
			line: pickKrisLine('krisCastleKingside', tier, recentIds, vars),
			priority: 'normal',
		};
	}
	if (move.san === 'O-O-O') {
		return {
			line: pickKrisLine('krisCastleQueenside', tier, recentIds, vars),
			priority: 'normal',
		};
	}

	if (plyCount >= 3 && plyCount <= 14) {
		const detected = detectOpening(history);
		if (detected && detected.tag !== spokenOpeningTag) {
			return {
				line: pickKrisLine(detected.category, tier, recentIds, vars),
				priority: 'normal',
				openingTag: detected.tag,
			};
		}
		if (fromBook && plyCount >= 5 && plyCount <= 10 && Math.random() < 0.45) {
			return {
				line: pickKrisLine('openingGeneral', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (plyCount <= 4) {
			return null;
		}
	}

	const structure = getBoardStructureFacts(game, challengerColor);

	if (structure.isEndgame) {
		if (isAdvancedPawnMove(move, krisColor)) {
			return {
				line: pickKrisLine('advancedPawnPush', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (structure.isRookEndgame && Math.random() < 0.65) {
			return {
				line: pickKrisLine('endgameRooks', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (postMoveKrisLead >= 3 && Math.random() < 0.72) {
			return {
				line: pickKrisLine('endgameWinning', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (postMoveKrisLead <= -3 && Math.random() < 0.72) {
			return {
				line: pickKrisLine('endgameDefending', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (plyCount % 4 === 0 || Math.random() < 0.4) {
			return {
				line: pickKrisLine('endgameEven', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		return null;
	}

	if (
		plyCount >= 18 &&
		plyCount <= 28 &&
		!hasSideCastled(game, challengerColor) &&
		structure.kingInMiddleStartRank &&
		Math.random() < 0.55
	) {
		return {
			line: pickKrisLine('opponentUncastledCenter', tier, recentIds, vars),
			priority: 'normal',
		};
	}

	if (postMoveKrisLead >= 4 && Math.random() < 0.65) {
		return {
			line: pickKrisLine('krisBigLead', tier, recentIds, vars),
			priority: 'normal',
		};
	}
	if (postMoveKrisLead <= -3 && Math.random() < 0.68) {
		return {
			line: pickKrisLine('krisUnderPressure', tier, recentIds, vars),
			priority: 'normal',
		};
	}

	if (plyCount % 5 === 0 || Math.random() < 0.36) {
		const isCentralSquare =
			['c', 'd', 'e', 'f'].includes(move.to[0] ?? '') &&
			['3', '4', '5', '6'].includes(move.to[1] ?? '');

		if (move.piece === 'n' && isCentralSquare) {
			return {
				line: pickKrisLine('krisKnightOutpost', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (move.piece === 'r' && ['c', 'd', 'e', 'f'].includes(move.to[0] ?? '')) {
			return {
				line: pickKrisLine('krisRookFile', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (move.piece === 'b') {
			return {
				line: pickKrisLine('krisBishopActivity', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (move.piece === 'q') {
			return {
				line: pickKrisLine('krisQueenActivity', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		if (move.piece === 'p' && isCentralSquare) {
			return {
				line: pickKrisLine('krisPawnBreak', tier, recentIds, vars),
				priority: 'normal',
			};
		}
		return {
			line: pickKrisLine('krisMidgameTempo', tier, recentIds, vars),
			priority: 'normal',
		};
	}

	return null;
}

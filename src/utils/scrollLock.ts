import { useLayoutEffect } from 'react';

interface SavedScrollStyles {
	htmlOverflow: string;
	htmlOverscroll: string;
	bodyOverflow: string;
	bodyOverscroll: string;
	bodyPosition: string;
	bodyTop: string;
	bodyLeft: string;
	bodyRight: string;
	bodyWidth: string;
	bodyPaddingRight: string;
}

let activeLockCount = 0;
let lockedScrollX = 0;
let lockedScrollY = 0;
let savedStyles: SavedScrollStyles | null = null;
let lastTouchY = 0;
let listenersAttached = false;

function isVerticallyScrollable(el: HTMLElement): boolean {
	if (el.scrollHeight <= el.clientHeight + 1) return false;
	const { overflowY } = window.getComputedStyle(el);
	return overflowY === 'auto' || overflowY === 'scroll';
}

function canConsumeVerticalTouch(target: EventTarget | null, deltaY: number): boolean {
	if (!(target instanceof Element)) return false;

	if (target.closest('input, textarea, select, video, [role="slider"]')) {
		return true;
	}

	let node: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;
	while (node && node !== document.body && node !== document.documentElement) {
		if (isVerticallyScrollable(node)) {
			const maxScroll = node.scrollHeight - node.clientHeight;
			const atTop = node.scrollTop <= 0;
			const atBottom = node.scrollTop >= maxScroll - 1;

			if ((deltaY > 0 && !atTop) || (deltaY < 0 && !atBottom)) {
				return true;
			}
			// Direction is blocked at this scroller's edge: allow outer scrollable container only if it can move that way
			if (deltaY === 0) return true;
		}
		node = node.parentElement;
	}

	return false;
}

function handleTouchStart(event: TouchEvent): void {
	if (event.touches.length === 1) {
		lastTouchY = event.touches[0].clientY;
	}
}

function handleTouchMove(event: TouchEvent): void {
	if (activeLockCount <= 0 || event.touches.length > 1) return;

	const currentY = event.touches[0]?.clientY ?? lastTouchY;
	const deltaY = currentY - lastTouchY;
	lastTouchY = currentY;

	if (!canConsumeVerticalTouch(event.target, deltaY) && event.cancelable) {
		event.preventDefault();
	}
}

function attachTouchGuard(): void {
	if (listenersAttached || typeof document === 'undefined') return;
	document.addEventListener('touchstart', handleTouchStart, { passive: true });
	document.addEventListener('touchmove', handleTouchMove, { passive: false });
	listenersAttached = true;
}

function detachTouchGuard(): void {
	if (!listenersAttached || typeof document === 'undefined') return;
	document.removeEventListener('touchstart', handleTouchStart);
	document.removeEventListener('touchmove', handleTouchMove);
	listenersAttached = false;
}

export function isPageScrollLocked(): boolean {
	if (typeof document === 'undefined') return false;
	return document.documentElement.dataset.scrollLocked === 'true';
}

export function acquireScrollLock(): () => void {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return () => {};
	}

	activeLockCount += 1;

	if (activeLockCount === 1) {
		const html = document.documentElement;
		const body = document.body;

		lockedScrollX = window.scrollX || window.pageXOffset || html.scrollLeft || 0;
		lockedScrollY = window.scrollY || window.pageYOffset || html.scrollTop || 0;
		const scrollbarGap = Math.max(0, window.innerWidth - html.clientWidth);

		savedStyles = {
			htmlOverflow: html.style.overflow,
			htmlOverscroll: html.style.overscrollBehavior,
			bodyOverflow: body.style.overflow,
			bodyOverscroll: body.style.overscrollBehavior,
			bodyPosition: body.style.position,
			bodyTop: body.style.top,
			bodyLeft: body.style.left,
			bodyRight: body.style.right,
			bodyWidth: body.style.width,
			bodyPaddingRight: body.style.paddingRight,
		};

		// Flag before applying fixed positioning so scroll listeners ignore the synthetic Y->0 transition
		html.dataset.scrollLocked = 'true';
		html.style.setProperty('--scroll-lock-gap', `${scrollbarGap}px`);

		html.style.overflow = 'hidden';
		html.style.overscrollBehavior = 'none';

		if (scrollbarGap > 0) {
			const computedPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
			body.style.paddingRight = `${computedPaddingRight + scrollbarGap}px`;
		}

		body.style.overflow = 'hidden';
		body.style.overscrollBehavior = 'none';
		body.style.position = 'fixed';
		body.style.top = `-${lockedScrollY}px`;
		body.style.left = `-${lockedScrollX}px`;
		body.style.right = '0';
		body.style.width = '100%';

		attachTouchGuard();
	}

	let released = false;
	return () => {
		if (released) return;
		released = true;

		activeLockCount = Math.max(0, activeLockCount - 1);
		if (activeLockCount > 0) return;

		detachTouchGuard();

		const html = document.documentElement;
		const body = document.body;
		const prevInlineScrollBehavior = html.style.scrollBehavior;

		// Disable smooth scrolling momentarily so restoring the frozen Y offset never animates from 0
		html.style.scrollBehavior = 'auto';

		if (savedStyles) {
			html.style.overflow = savedStyles.htmlOverflow;
			html.style.overscrollBehavior = savedStyles.htmlOverscroll;
			body.style.overflow = savedStyles.bodyOverflow;
			body.style.overscrollBehavior = savedStyles.bodyOverscroll;
			body.style.position = savedStyles.bodyPosition;
			body.style.top = savedStyles.bodyTop;
			body.style.left = savedStyles.bodyLeft;
			body.style.right = savedStyles.bodyRight;
			body.style.width = savedStyles.bodyWidth;
			body.style.paddingRight = savedStyles.bodyPaddingRight;
			savedStyles = null;
		} else {
			html.style.overflow = '';
			html.style.overscrollBehavior = '';
			body.style.overflow = '';
			body.style.overscrollBehavior = '';
			body.style.position = '';
			body.style.top = '';
			body.style.left = '';
			body.style.right = '';
			body.style.width = '';
			body.style.paddingRight = '';
		}

		html.style.removeProperty('--scroll-lock-gap');
		window.scrollTo(lockedScrollX, lockedScrollY);
		void html.offsetHeight;
		html.style.scrollBehavior = prevInlineScrollBehavior;
		delete html.dataset.scrollLocked;
	};
}

/**
 * Prevents background page scrolling (wheel, touch drag, and overscroll chaining)
 * across desktop and mobile browsers while an overlay/fullscreen window is open.
 */
export function useScrollLock(locked: boolean): void {
	useLayoutEffect(() => {
		if (!locked) return;
		return acquireScrollLock();
	}, [locked]);
}

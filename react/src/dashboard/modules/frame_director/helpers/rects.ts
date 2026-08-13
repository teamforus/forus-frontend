import type { FDObserverRect } from '../types';

export function isRectWithin(rect1: FDObserverRect, rect2: FDObserverRect): boolean {
    return (
        rect2.x >= rect1.x &&
        rect2.y >= rect1.y &&
        rect2.x + rect2.width <= rect1.x + rect1.width &&
        rect2.y + rect2.height <= rect1.y + rect1.height
    );
}

export function getRectOverlapArea(rect1: FDObserverRect, rect2: FDObserverRect): number {
    return (
        Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x)) *
        Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y))
    );
}

export function sortRectsByOverlapArea<T extends FDObserverRect>(
    canvas: FDObserverRect,
    rectangles: Array<T>,
): Array<T> {
    return [...rectangles].sort((a, b) => getRectOverlapArea(canvas, b) - getRectOverlapArea(canvas, a));
}

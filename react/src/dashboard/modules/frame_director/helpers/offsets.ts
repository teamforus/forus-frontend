import { FD_ALIGNS } from '../constants';
import type { FDAlign, FDItemResolvedOffset, FDObserverRect, FDOffsetCandidate, FDPosition } from '../types';
import { isRectWithin, sortRectsByOverlapArea } from './rects';

export function prioritizeFDAligns(requestedAlign: FDAlign): Array<FDAlign> {
    return [requestedAlign, ...FD_ALIGNS.filter((align) => align !== requestedAlign)];
}

export function prioritizeFDVerticalPositions(requestedPosition: FDPosition): Array<FDPosition> {
    return requestedPosition === 'top' ? ['top', 'bottom'] : ['bottom', 'top'];
}

export function resolveAvailableOffset({
    canvasRect,
    requestedOffset,
    candidateOffsets,
    size,
}: {
    canvasRect: FDObserverRect;
    requestedOffset: NonNullable<FDItemResolvedOffset>;
    candidateOffsets: Array<FDOffsetCandidate>;
    size: Pick<FDObserverRect, 'width' | 'height'>;
}): FDItemResolvedOffset {
    if (isRectWithin(canvasRect, { ...requestedOffset, ...size })) {
        return requestedOffset;
    }

    return sortRectsByOverlapArea(canvasRect, candidateOffsets)?.[0] ?? null;
}

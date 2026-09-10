import { useCallback } from 'react';
import { prioritizeFDAligns, prioritizeFDVerticalPositions, resolveAvailableOffset } from '../helpers/offsets';
import type { FDItem, FDItemPosition, FDItemResolvedOffset, FDOffsetCandidate } from '../types';
import useFDMeasuredOffset from './useFDMeasuredOffset';

export default function useFDOffsetMenu(item: FDItem) {
    const observedHeight = item.observedRect?.height || 0;
    const observedWidth = item.observedRect?.width || 0;

    const resolveOffset = useCallback(
        (elRect: DOMRect): FDItemResolvedOffset => {
            const menuWidth = elRect?.width ?? 0;
            const menuHeight = elRect?.height ?? 0;
            const requestedPosition = item?.requestedPosition?.position ?? 'bottom';
            const requestedAlign = item?.requestedPosition?.align ?? 'start';

            const getOffset = (position: FDItemPosition): NonNullable<FDItemResolvedOffset> => {
                const calcXOffset = () => {
                    if (position.align === 'end') {
                        return observedWidth - menuWidth;
                    }

                    if (position.align === 'center') {
                        return (observedWidth - menuWidth) / 2;
                    }

                    return 0;
                };

                const calcYOffset = (): number => {
                    if (position.position === 'top') {
                        return -menuHeight;
                    }

                    if (position.position === 'bottom') {
                        return observedHeight;
                    }

                    return 0;
                };

                return {
                    x: item?.observedRect?.x + calcXOffset(),
                    y: item?.observedRect?.y + calcYOffset(),
                    position: position.position,
                    align: position.align,
                };
            };

            const candidateOffsets = prioritizeFDVerticalPositions(requestedPosition).reduce<Array<FDOffsetCandidate>>(
                (list, position) => [
                    ...list,
                    ...prioritizeFDAligns(requestedAlign).map((align) => ({
                        ...getOffset({ position, align }),
                        width: elRect?.width,
                        height: elRect?.height,
                    })),
                ],
                [],
            );

            return resolveAvailableOffset({
                canvasRect: {
                    x: 0,
                    y: 0,
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.clientHeight,
                },
                requestedOffset: getOffset({ align: requestedAlign, position: requestedPosition }),
                candidateOffsets,
                size: { width: elRect?.width, height: elRect?.height },
            });
        },
        [
            observedHeight,
            observedWidth,
            item?.observedRect?.x,
            item?.observedRect?.y,
            item?.requestedPosition?.align,
            item?.requestedPosition?.position,
        ],
    );

    return useFDMeasuredOffset(item, resolveOffset);
}

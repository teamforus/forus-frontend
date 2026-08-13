import { useEffect, useMemo, useState } from 'react';
import type { FDItem, FDItemResolvedOffset } from '../types';
import { FD_POSITION_READY_TIMEOUT } from '../constants';

export function isFDItemResolvedOffset(offset: FDItemResolvedOffset): offset is NonNullable<FDItemResolvedOffset> {
    return !!offset && Number.isFinite(offset.x) && Number.isFinite(offset.y);
}

export default function useFDPositionReady(item: FDItem, offset: FDItemResolvedOffset): boolean {
    const isPositionCommitted = useMemo(() => {
        return isFDItemResolvedOffset(offset) && item.offset?.x === offset.x && item.offset?.y === offset.y;
    }, [item.offset?.x, item.offset?.y, offset]);

    const positionKey = useMemo(() => {
        if (!isFDItemResolvedOffset(offset)) {
            return `${item.key}:unresolved`;
        }

        return `${item.key}:${offset.x}:${offset.y}:${offset.position}:${offset.align}`;
    }, [item.key, offset]);

    const [timedOutPositionKey, setTimedOutPositionKey] = useState<string | null>(null);

    useEffect(() => {
        if (isPositionCommitted) {
            setTimedOutPositionKey(null);
            return;
        }

        setTimedOutPositionKey(null);

        const timeoutId = window.setTimeout(() => setTimedOutPositionKey(positionKey), FD_POSITION_READY_TIMEOUT);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [isPositionCommitted, positionKey]);

    return isPositionCommitted || timedOutPositionKey === positionKey;
}

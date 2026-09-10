import React from 'react';
import { FDTargetContainerProps } from '../components/FDTargetClick';
import useFDOffsetMenu from '../hooks/useFDOffsetMenu';

export default function FDTargetContainerTableMenu(props: FDTargetContainerProps) {
    const { item, content } = props;
    const { ref, isPositionReady } = useFDOffsetMenu(item);

    return (
        <div
            className="form"
            style={{
                pointerEvents: isPositionReady ? undefined : 'none',
                visibility: isPositionReady ? undefined : 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}>
            <div ref={ref}>{typeof content === 'function' ? content(props) : content}</div>
        </div>
    );
}

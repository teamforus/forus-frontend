import type { ReactElement } from 'react';

export type FDAlign = 'start' | 'center' | 'end';
export type FDPosition = 'top' | 'right' | 'bottom' | 'left';

export interface FDItem {
    key: string;
    parentKey?: string | null;
    rootKey?: string;
    targetElement?: HTMLElement | null;
    offset?: FDItemOffset;
    close?: () => void;
    element: (e: FDItem) => ReactElement;
    observedRect?: FDObserverRect;
    requestedPosition?: FDItemPosition;
}

export interface FDItemPosition {
    position: FDPosition;
    align: FDAlign;
}

export interface FDItemOffset {
    x: number;
    y: number;
}

export type FDObserverRect = {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

export type FDItemResolvedOffset = (FDItemOffset & FDItemPosition) | null;
export type FDOffsetCandidate = NonNullable<FDItemResolvedOffset> & FDObserverRect;

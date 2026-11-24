import type { ReactNode } from 'react';

export interface BlockEmptyProps {
    title?: string;
    description?: string;
    imageIcon?: string;
    imageIconImg?: string;
    imageIconSvg?: ReactNode;
    textAlign?: 'left' | 'center' | 'right';
    variant?: 'default' | 'compact';
    dataDusk?: string;
    actions?: ReactNode;
}

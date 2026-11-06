import React, { CSSProperties, useRef } from 'react';
import classNames from 'classnames';
import useRenderedMarkdownTables from './hooks/useRenderedMarkdownTables';

export default function Markdown({
    align,
    content,
    className = '',
    ariaLevel = null,
    fontSize = undefined,
    textColor,
    role = null,
}: {
    content: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    ariaLevel?: number;
    fontSize?: number;
    textColor?: string;
    role?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const renderedContent = useRenderedMarkdownTables(content);

    return (
        <div
            ref={ref}
            role={role}
            aria-level={ariaLevel}
            style={
                {
                    fontSize: fontSize ? `${fontSize}px` : undefined,
                    '--markdown-text-color': textColor || undefined,
                } as CSSProperties
            }
            className={classNames(
                'block',
                'block-markdown',
                align === 'left' && 'block-markdown-left',
                align === 'center' && 'block-markdown-center',
                align === 'right' && 'block-markdown-right',
                textColor && 'block-markdown-custom-color',
                className,
            )}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
    );
}

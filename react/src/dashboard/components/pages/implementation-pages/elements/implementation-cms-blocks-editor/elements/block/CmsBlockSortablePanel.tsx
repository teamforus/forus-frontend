import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useTranslate from '../../../../../../../hooks/useTranslate';

export default function CmsBlockSortablePanel({
    id,
    title,
    isCollapsed,
    onCollapse,
    onExpand,
    actions,
    children,
}: {
    id: string;
    title: React.ReactNode;
    isCollapsed: boolean;
    onCollapse: () => void;
    onExpand: () => void;
    actions?: React.ReactNode;
    children: React.ReactNode;
}) {
    const translate = useTranslate();

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className="block-item" ref={setNodeRef} style={style}>
            <div className="block-header">
                <em className="mdi mdi-dots-vertical block-drag" {...attributes} {...listeners} />

                <div className="block-title">{title}</div>

                <div className="block-actions">
                    {!isCollapsed ? (
                        <button className="button button-default button-sm" type="button" onClick={onCollapse}>
                            <em className="mdi mdi-arrow-collapse-vertical icon-start" />
                            {translate('components.implementation_cms_block_editor.buttons.collapse')}
                        </button>
                    ) : (
                        <button className="button button-primary button-sm" type="button" onClick={onExpand}>
                            <em className="mdi mdi-arrow-expand-vertical icon-start" />
                            {translate('components.implementation_cms_block_editor.buttons.expand')}
                        </button>
                    )}

                    {actions}
                </div>
            </div>

            {!isCollapsed && <div className="block-body">{children}</div>}
        </div>
    );
}

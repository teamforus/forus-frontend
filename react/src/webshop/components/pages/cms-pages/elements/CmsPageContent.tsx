import React, { ReactNode } from 'react';
import ImplementationPage from '../../../../props/models/ImplementationPage';
import CmsBlocks from '../../../elements/cms-blocks/CmsBlocks';
import CmsBlocksNext from '../../../elements/cms-blocks-next/CmsBlocksNext';

export default function CmsPageContent({ page, children }: { page: ImplementationPage; children: ReactNode }) {
    return (
        <div className="flex flex-vertical">
            {page.description_position === 'after' ? (
                <>
                    {children}
                    <CmsBlocksNext page={page} />
                    <CmsBlocks page={page} largeMarkdown={true} />
                </>
            ) : (
                <>
                    <CmsBlocksNext page={page} />
                    <CmsBlocks page={page} largeMarkdown={true} />
                    {children}
                </>
            )}
        </div>
    );
}

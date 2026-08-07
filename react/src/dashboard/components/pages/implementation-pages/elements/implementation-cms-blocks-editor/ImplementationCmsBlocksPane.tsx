import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ResponseErrorData } from '../../../../../props/ApiResponses';
import Implementation from '../../../../../props/models/Implementation';
import ImplementationPage from '../../../../../props/models/ImplementationPage';
import useTranslate from '../../../../../hooks/useTranslate';
import useOpenModal from '../../../../../hooks/useOpenModal';
import usePushApiError from '../../../../../hooks/usePushApiError';
import useImplementationPageService from '../../../../../services/ImplementationPageService';
import EmptyCard from '../../../../elements/empty-card/EmptyCard';
import ImplementationCmsBlockConfig from '../../../../../props/models/ImplementationCmsBlockConfig';
import ImplementationCmsBlocksEditor from './ImplementationCmsBlocksEditor';
import ModalCmsBlockCreate from './modals/ModalCmsBlockCreate';
import { ImplementationCmsBlockForm } from './types';
import FormPane from '../../../../elements/forms/elements/FormPane';

export default function ImplementationCmsBlocksPane({
    blocks,
    setBlocks,
    errors,
    setErrors,
    implementation,
    page,
    pageType,
    validateRef,
}: {
    blocks: Array<ImplementationCmsBlockForm>;
    setBlocks: React.Dispatch<React.SetStateAction<Array<ImplementationCmsBlockForm>>>;
    errors?: ResponseErrorData;
    setErrors: (errors: ResponseErrorData) => void;
    implementation: Implementation;
    page?: ImplementationPage;
    pageType: string;
    validateRef: React.RefObject<(() => Promise<boolean>) | null>;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushApiError = usePushApiError();
    const implementationPageService = useImplementationPageService();

    const [blockConfigs, setBlockConfigs] = useState<Array<ImplementationCmsBlockConfig>>([]);
    const [expandedBlockUids, setExpandedBlockUids] = useState<Array<string>>([]);
    const hasBlocks = blocks.length > 0;
    const hasBlockConfigs = blockConfigs.length > 0;

    const blockStructureKey = useMemo(() => {
        return JSON.stringify(blocks.map((block) => [block.uid, (block.items || []).map((item) => item.uid)]));
    }, [blocks]);

    const previousBlockStructureKey = useRef(blockStructureKey);

    const createBlock = useCallback(
        (block: ImplementationCmsBlockForm) => {
            setBlocks((blocks) => [...blocks, block]);
            setExpandedBlockUids((list) => [...list, block.uid]);
        },
        [setBlocks],
    );

    const openCreateModal = useCallback(() => {
        if (!hasBlockConfigs) {
            return;
        }

        openModal((modal) => (
            <ModalCmsBlockCreate modal={modal} blockConfigs={blockConfigs} onCreateBlock={createBlock} />
        ));
    }, [blockConfigs, createBlock, hasBlockConfigs, openModal]);

    useEffect(() => {
        if (previousBlockStructureKey.current === blockStructureKey) {
            return;
        }

        previousBlockStructureKey.current = blockStructureKey;

        const currentErrors = errors || {};
        const nextErrors = Object.fromEntries(
            Object.entries(currentErrors).filter(([key]) => {
                return key !== 'cms_blocks' && !key.startsWith('cms_blocks.');
            }),
        );

        if (Object.keys(nextErrors).length !== Object.keys(currentErrors).length) {
            setErrors(nextErrors);
        }
    }, [blockStructureKey, errors, setErrors]);

    useEffect(() => {
        implementationPageService
            .cmsBlockConfigs(implementation.organization_id, implementation.id, { page_type: pageType })
            .then((res) => setBlockConfigs(res.data.data))
            .catch(pushApiError);
    }, [implementation.id, implementation.organization_id, implementationPageService, pageType, pushApiError]);

    return (
        <FormPane title={translate('components.implementation_cms_block_editor.sections.blocks')}>
            {hasBlocks ? (
                <Fragment>
                    <ImplementationCmsBlocksEditor
                        blocks={blocks}
                        setBlocks={setBlocks}
                        errors={errors}
                        setErrors={setErrors}
                        validateRef={validateRef}
                        blockConfigs={blockConfigs}
                        implementation={implementation}
                        page={page}
                        pageType={pageType}
                        expandedBlockUids={expandedBlockUids}
                        setExpandedBlockUids={setExpandedBlockUids}
                    />
                    <button
                        className="button button-primary"
                        type="button"
                        disabled={!hasBlockConfigs}
                        onClick={openCreateModal}>
                        <em className="mdi mdi-plus-circle icon-start" />
                        {translate('components.implementation_cms_block_editor.buttons.add_block')}
                    </button>
                </Fragment>
            ) : (
                <EmptyCard
                    type={'card-section'}
                    title={translate('components.implementation_cms_block_editor.empty.title')}
                    actions={
                        <button
                            className="button button-primary"
                            type="button"
                            disabled={!hasBlockConfigs}
                            onClick={openCreateModal}>
                            <em className="mdi mdi-plus-circle icon-start" />
                            {translate('components.implementation_cms_block_editor.buttons.add_block')}
                        </button>
                    }
                />
            )}
        </FormPane>
    );
}

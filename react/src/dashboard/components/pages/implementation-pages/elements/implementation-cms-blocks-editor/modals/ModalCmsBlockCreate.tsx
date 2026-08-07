import React, { useCallback, useState } from 'react';
import { uniqueId } from 'lodash';
import { ModalState } from '../../../../../../modules/modals/context/ModalContext';
import ImplementationCmsBlockConfig from '../../../../../../props/models/ImplementationCmsBlockConfig';
import useTranslate from '../../../../../../hooks/useTranslate';
import Modal from '../../../../../modals/elements/Modal';
import FormGroup from '../../../../../elements/forms/elements/FormGroup';
import SelectControl from '../../../../../elements/select-control/SelectControl';
import { ImplementationCmsBlockForm } from '../types';
import { defaultValuesFromFields, defaultValuesHtmlFromFields } from '../helpers/blocks';

export default function ModalCmsBlockCreate({
    modal,
    blockConfigs,
    onCreateBlock,
}: {
    modal: ModalState;
    blockConfigs: Array<ImplementationCmsBlockConfig>;
    onCreateBlock: (block: ImplementationCmsBlockForm) => void;
}) {
    const [blockTypeKey, setBlockTypeKey] = useState(blockConfigs[0]?.key || null);
    const translate = useTranslate();
    const selectedBlockConfig = blockConfigs.find((blockConfig) => blockConfig.key === blockTypeKey);

    const submit = useCallback(
        (e?: React.FormEvent<HTMLFormElement>) => {
            e?.preventDefault();

            if (!selectedBlockConfig) {
                return;
            }

            onCreateBlock({
                uid: uniqueId(),
                block_type_key: selectedBlockConfig.key,
                state: 'draft',
                values: defaultValuesFromFields(selectedBlockConfig.fields),
                values_html: defaultValuesHtmlFromFields(selectedBlockConfig.fields),
                items: [],
            });

            modal.close();
        },
        [modal, onCreateBlock, selectedBlockConfig],
    );

    return (
        <Modal
            modal={modal}
            size="sm"
            title={translate('components.implementation_cms_block_editor.modals.create_block.title')}
            bodyOverflowVisible={true}
            onSubmit={submit}
            footer={
                <div className="button-group flex-center">
                    <button className="button button-default" type="button" onClick={modal.close}>
                        {translate('funds_edit.buttons.cancel')}
                    </button>

                    <button className="button button-primary" type="submit" disabled={!selectedBlockConfig}>
                        {translate('components.implementation_cms_block_editor.buttons.add_block')}
                    </button>
                </div>
            }>
            <div className="form">
                <FormGroup
                    required={true}
                    label={translate('components.implementation_cms_block_editor.labels.block_type')}
                    input={(id) => (
                        <SelectControl
                            id={id}
                            className="form-control"
                            propKey={'key'}
                            propValue={'name'}
                            value={blockTypeKey}
                            onChange={(block_type_key: string) => setBlockTypeKey(block_type_key)}
                            options={blockConfigs}
                            allowSearch={false}
                        />
                    )}
                />
            </div>
        </Modal>
    );
}

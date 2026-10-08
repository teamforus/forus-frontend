import React from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import { ModalState } from '../../../../../modules/modals/context/ModalContext';
import type IdentityProviderEvent from '../../../../../props/models/IdentityProvider/IdentityProviderEvent';
import Modal from '../../../../modals/elements/Modal';
import CardBlockKeyValue from '../../../../elements/card/blocks/CardBlockKeyValue';
import BlockInlineCopy from '../../../../elements/block-inline-copy/BlockInlineCopy';
import Label from '../../../../elements/label/Label';
import { outcomeLabels, outcomeTypes } from '../../constants';

export default function EntraEventDetailsModal({ modal, event }: { modal: ModalState; event: IdentityProviderEvent }) {
    const translate = useTranslate();
    const provisioning = event.category === 'requester_provisioning';

    return (
        <Modal
            modal={modal}
            size="lg"
            title={translate('organizations_identity_provider_entra.events.details_title')}
            footer={
                <button type="button" className="button button-default" onClick={modal.close}>
                    {translate('organizations_identity_provider_entra.events.close')}
                </button>
            }>
            <CardBlockKeyValue
                size="md"
                items={[
                    {
                        label: translate('organizations_identity_provider_entra.ui.created_at'),
                        value: event.created_at_locale,
                    },
                    {
                        label: translate('organizations_identity_provider_entra.ui.event'),
                        value: event.event_type_locale,
                    },
                    {
                        label: translate('organizations_identity_provider_entra.ui.outcome'),
                        value: (
                            <Label type={outcomeTypes[event.outcome] || 'default'}>
                                {outcomeLabels[event.outcome] ? translate(outcomeLabels[event.outcome]) : event.outcome}
                            </Label>
                        ),
                    },
                    ...(provisioning
                        ? [
                              {
                                  label: translate('organizations_identity_provider_entra.events.account'),
                                  value: event.account,
                              },
                              {
                                  label: translate('organizations_identity_provider_entra.events.external_id'),
                                  value: event.external_id,
                              },
                          ]
                        : []),
                    ...(provisioning && event.profile_id !== null
                        ? [
                              {
                                  label: translate('organizations_identity_provider_entra.events.profile_id'),
                                  value: event.profile_id,
                              },
                          ]
                        : []),
                    ...(provisioning
                        ? [
                              {
                                  label: translate('organizations_identity_provider_entra.events.requested_fields'),
                                  value: event.requested_fields.map((field) => field.name).join(', ') || null,
                              },
                              {
                                  label: translate('organizations_identity_provider_entra.events.result'),
                                  value: event.result_locale,
                              },
                          ]
                        : []),
                    {
                        label: translate('organizations_identity_provider_entra.ui.error'),
                        value: event.error_code_locale,
                    },
                    ...(provisioning
                        ? [
                              {
                                  label: translate('organizations_identity_provider_entra.events.next_action'),
                                  value: event.next_action_locale,
                              },
                          ]
                        : []),
                    {
                        label: translate('organizations_identity_provider_entra.events.diagnostic_id'),
                        value: event.diagnostic_id ? (
                            <BlockInlineCopy value={event.diagnostic_id}>
                                <span className="text-word-break">{event.diagnostic_id}</span>
                            </BlockInlineCopy>
                        ) : null,
                    },
                ]}
            />
        </Modal>
    );
}

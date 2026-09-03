import React from 'react';
import FileUploader from '../../../elements/file-uploader/FileUploader';
import FundRequest from '../../../../../dashboard/props/models/FundRequest';
import FundRequestClarification from '../../../../../dashboard/props/models/FundRequestClarification';
import MultilineText from '../../../../../dashboard/components/elements/multiline-text/MultilineText';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';

export default function FundRequestClarificationAnswered({
    fundRequest,
    clarification,
}: {
    fundRequest: FundRequest;
    clarification: FundRequestClarification;
}) {
    const translate = useTranslate();

    return (
        <div className="conversation-item-body" data-dusk={`clarificationCard${clarification.id}`}>
            <div className="conversation-item-section conversation-item-section-question">
                <div className="conversation-item-section-header">
                    <div className="conversation-item-section-header-date">
                        {clarification?.created_at_locale}
                        {!!clarification?.changed_at && (
                            <span>
                                | {translate('fund_request.labels.edited')}: {clarification?.changed_at_locale}
                            </span>
                        )}
                    </div>
                </div>

                <div className="conversation-item-section-body">
                    <div className="conversation-item-section-body-bubble">
                        <div className="conversation-item-section-body-label">
                            {fundRequest?.fund?.organization_name}:
                        </div>
                        <div
                            className="conversation-item-section-body-bubble-content"
                            data-dusk="clarificationQuestion">
                            <MultilineText text={clarification.question} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="conversation-item-section conversation-item-section-answer">
                <div className="conversation-item-section-header">
                    <div className="conversation-item-section-header-date">{clarification?.resolved_at_locale}</div>
                </div>

                {clarification.state === 'closed' ? (
                    <div className="conversation-item-section-body" data-dusk="clarificationAnswer">
                        <div className="conversation-item-section-body-bubble">
                            <div className="conversation-item-section-body-label">
                                {translate('fund_request.labels.closed_by_sponsor', {
                                    sponsor_name: fundRequest?.fund?.organization_name,
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="conversation-item-section-body" data-dusk="clarificationAnswer">
                        <div className="conversation-item-section-body-bubble">
                            <div className="conversation-item-section-body-label">
                                {translate('fund_request.labels.your_answer')}:
                            </div>

                            {clarification.answer && (
                                <div className="conversation-item-section-body-bubble-content">
                                    <MultilineText text={clarification.answer} />
                                </div>
                            )}

                            {clarification.files?.length > 0 && (
                                <div className="conversation-item-section-body-bubble-files">
                                    <FileUploader
                                        type="fund_request_clarification_proof"
                                        files={clarification.files}
                                        template={'compact'}
                                        readOnly={true}
                                        hidePreviewButton={true}
                                        hideDownloadButton={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

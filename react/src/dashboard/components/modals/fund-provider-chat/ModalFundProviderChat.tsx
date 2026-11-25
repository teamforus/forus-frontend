import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { groupBy } from 'lodash';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import useEnvData from '../../../hooks/useEnvData';
import useSetProgress from '../../../hooks/useSetProgress';
import usePushApiError from '../../../hooks/usePushApiError';
import useFormBuilder from '../../../hooks/useFormBuilder';
import FormError from '../../elements/forms/errors/FormError';
import Modal from '../elements/Modal';
import FundProviderChatMessage from '../../../props/models/FundProviderChatMessage';
import { ApiResponse, ApiResponseSingle } from '../../../props/ApiResponses';

export default function ModalFundProviderChat({
    modal,
    className,
    counterpartName,
    listMessages,
    sendMessage,
}: {
    modal: ModalState;
    className?: string;
    counterpartName: string;
    listMessages: (perPage: number) => Promise<ApiResponse<FundProviderChatMessage>>;
    sendMessage: (message: string) => Promise<ApiResponseSingle<FundProviderChatMessage>>;
}) {
    const envData = useEnvData();

    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [updateInterval] = useState(10000);
    const [messages, setMessages] = useState<FundProviderChatMessage[][] | null>(null);

    const forceScrollRef = useRef(false);
    const chatRootRef = useRef<HTMLDivElement>(null);

    const panelType = envData.client_type;

    const loadMessages = useCallback(
        (forceScroll: boolean) => {
            setProgress(0);

            listMessages(100)
                .then((res) => {
                    forceScrollRef.current = forceScroll;
                    setMessages(Object.values(groupBy(res.data.data, 'date')));
                })
                .catch(pushApiError)
                .finally(() => setProgress(100));
        },
        [listMessages, setProgress, pushApiError],
    );

    const form = useFormBuilder(
        {
            message: '',
        },
        (values) => {
            sendMessage(values.message)
                .then(() => {
                    form.reset();
                    loadMessages(true);
                })
                .catch((err) => {
                    form.setErrors(err.data.errors);
                    form.setIsLocked(false);
                });
        },
    );

    useLayoutEffect(() => {
        if (!messages) {
            return;
        }

        const chatRoot = chatRootRef.current;
        const lastMessage: HTMLElement = chatRoot.querySelector('.chat-interval:last-child .chat-message:last-child');
        const threshold = lastMessage ? lastMessage.offsetHeight + 25 : 0;

        const fullHeight = chatRoot.scrollTop + chatRoot.clientHeight;
        const autoScrollThreshold = chatRoot.scrollHeight - threshold;

        if (forceScrollRef.current || fullHeight >= autoScrollThreshold) {
            chatRoot.scrollTo({ top: chatRoot.scrollHeight, behavior: 'auto' });
        }
    }, [messages]);

    useEffect(() => {
        loadMessages(true);

        const interval = window.setInterval(() => loadMessages(false), updateInterval);

        return () => {
            window.clearInterval(interval);
        };
    }, [loadMessages, updateInterval]);

    return (
        <Modal
            modal={modal}
            className={className}
            title={`Chat met ${counterpartName}`}
            onSubmit={form.submit}
            body={
                <div className="modal-body form">
                    <div className="modal-section modal-section-light modal-section-sm">
                        <div className="block block-chat">
                            <div className="chat-wrapper" ref={chatRootRef}>
                                {messages?.map((dayMessages, index) => (
                                    <div className="chat-interval" key={index}>
                                        <div className="chat-timeline">
                                            <div className="chat-timeline-value">{dayMessages[0]?.date}</div>
                                        </div>

                                        {dayMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={classNames(
                                                    'chat-message',
                                                    message.counterpart == 'system' && 'chat-message-system',
                                                    message.counterpart != 'system' &&
                                                        panelType != message.counterpart &&
                                                        'chat-message-in',
                                                    message.counterpart != 'system' &&
                                                        panelType == message.counterpart &&
                                                        'chat-message-out',
                                                )}>
                                                <div className="chat-message-time">
                                                    {message.time}
                                                    {message.counterpart == 'system' ? ' - Systeembericht' : ''}
                                                </div>
                                                <div className="chat-message-text">{message.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="modal-section modal-section-light modal-section-sm">
                        <textarea
                            className="r-n form-control"
                            placeholder="Bericht"
                            value={form.values.message}
                            onChange={(e) => form.update({ message: e.target.value })}
                        />
                        <FormError error={form.errors.message} />
                    </div>
                </div>
            }
            footerClassName="text-center"
            footer={
                <>
                    <button type={'button'} className="button button-default button-sm" onClick={modal.close}>
                        Annuleer
                    </button>
                    <button type={'submit'} className="button button-primary button-sm">
                        Bevestigen
                    </button>
                </>
            }
        />
    );
}

import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useFundProviderChatService from '../../services/FundProviderChatService';
import Organization from '../../props/models/Organization';
import FundProviderChat from '../../props/models/FundProviderChat';
import Fund from '../../props/models/Fund';
import FundProvider from '../../props/models/FundProvider';
import ModalFundProviderChat from './fund-provider-chat/ModalFundProviderChat';

export default function ModalFundProviderChatSponsor({
    modal,
    className,
    chat,
    fund,
    organization,
    fundProvider,
}: {
    modal: ModalState;
    className?: string;
    chat: FundProviderChat;
    fund: Fund;
    organization: Organization;
    fundProvider: FundProvider;
}) {
    const chatService = useFundProviderChatService();

    const listMessages = useCallback(
        (perPage: number) => {
            return chatService.listMessages(organization.id, fund.id, fundProvider.id, chat.id, { per_page: perPage });
        },
        [chatService, organization.id, fund.id, fundProvider.id, chat.id],
    );

    const sendMessage = useCallback(
        (message: string) => {
            return chatService.storeMessage(organization.id, fund.id, fundProvider.id, chat.id, { message });
        },
        [chatService, organization.id, fund.id, fundProvider.id, chat.id],
    );

    return (
        <ModalFundProviderChat
            modal={modal}
            className={className}
            counterpartName={fundProvider.organization.name}
            listMessages={listMessages}
            sendMessage={sendMessage}
        />
    );
}

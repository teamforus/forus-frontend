import React, { useCallback } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useProductChatService from '../../services/ProductChatService';
import Organization from '../../props/models/Organization';
import FundProviderChat from '../../props/models/FundProviderChat';
import Product from '../../props/models/Product';
import ModalFundProviderChat from './fund-provider-chat/ModalFundProviderChat';

export default function ModalFundProviderChatProvider({
    modal,
    className,
    chat,
    product,
    providerOrganization,
    sponsorOrganization,
}: {
    modal: ModalState;
    className?: string;
    chat: FundProviderChat;
    product: Product;
    providerOrganization: Organization;
    sponsorOrganization: Organization;
}) {
    const chatService = useProductChatService();

    const listMessages = useCallback(
        (perPage: number) => {
            return chatService.listMessages(providerOrganization.id, product.id, chat.id, { per_page: perPage });
        },
        [chatService, providerOrganization.id, product.id, chat.id],
    );

    const sendMessage = useCallback(
        (message: string) => {
            return chatService.storeMessage(providerOrganization.id, product.id, chat.id, { message });
        },
        [chatService, providerOrganization.id, product.id, chat.id],
    );

    return (
        <ModalFundProviderChat
            modal={modal}
            className={className}
            counterpartName={sponsorOrganization.name}
            listMessages={listMessages}
            sendMessage={sendMessage}
        />
    );
}

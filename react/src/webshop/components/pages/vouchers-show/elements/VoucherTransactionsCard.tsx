import React from 'react';
import Voucher from '../../../../../dashboard/props/models/Voucher';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import TransactionIconBg from '../../../../../../assets/forus-webshop/resources/_webshop-common/assets/img/transaction-icon-bg.svg';
import useVoucherCard from '../hooks/useVoucherCard';
import classNames from 'classnames';
import { WebshopRoutes } from '../../../../modules/state_router/RouterBuilder';

export default function VoucherTransactionsCard({ voucher }: { voucher: Voucher }) {
    const translate = useTranslate();
    const voucherCard = useVoucherCard(voucher);

    return (
        <div className="block block-transactions">
            <div className="transactions-list">
                {voucherCard.transactionsList?.map((transaction) => (
                    <div
                        key={transaction.unique_id}
                        className={classNames('transactions-item', transaction.incoming && 'transactions-item-out')}>
                        <div className="transactions-item-icon">
                            <TransactionIconBg aria-hidden="true" />

                            {transaction.type == 'product_voucher' && (
                                <em className="mdi mdi-tag-multiple-outline" aria-hidden="true"></em>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'provider' && (
                                <em className="mdi mdi-qrcode" aria-hidden="true"></em>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'iban' && (
                                <em className="mdi mdi-receipt-text-check-outline" aria-hidden="true"></em>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'top_up' && (
                                <em className="mdi mdi-cash-plus" aria-hidden="true"></em>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'payout' && (
                                <em className="mdi mdi-cash-refund" aria-hidden="true"></em>
                            )}
                        </div>

                        <div className="transactions-item-details">
                            {transaction.type == 'product_voucher' && transaction.product_reservation && (
                                <div className="transactions-item-counterpart">
                                    {translate('voucher.transactions.reservation') + ' '}
                                    <StateNavLink
                                        name={WebshopRoutes.RESERVATION}
                                        params={{
                                            id: transaction.product_reservation.id,
                                        }}>
                                        #{transaction.product_reservation.code}
                                    </StateNavLink>
                                </div>
                            )}

                            {transaction.type == 'product_voucher' && !transaction.product_reservation && (
                                <div className="transactions-item-counterpart">{transaction.product.name}</div>
                            )}

                            {transaction.type == 'transaction' &&
                                transaction.target == 'provider' &&
                                transaction.initiator == 'provider' && (
                                    <div className="transactions-item-counterpart">{transaction.organization.name}</div>
                                )}

                            {transaction.type == 'transaction' &&
                                transaction.target == 'provider' &&
                                transaction.initiator == 'sponsor' && (
                                    <div className="transactions-item-counterpart">
                                        {translate('voucher.transactions.provider_by_sponsor')}
                                    </div>
                                )}

                            {transaction.type == 'transaction' &&
                                transaction.target == 'iban' &&
                                !transaction.reimbursement && (
                                    <div className="transactions-item-counterpart">
                                        {translate('voucher.transactions.bank_transfer')}
                                    </div>
                                )}

                            {transaction.type == 'transaction' && transaction.reimbursement && (
                                <div className="transactions-item-counterpart">
                                    {translate('voucher.transactions.reimbursement') + ' '}
                                    <StateNavLink
                                        name={WebshopRoutes.REIMBURSEMENT}
                                        params={{
                                            id: transaction.reimbursement.id,
                                        }}>
                                        #{transaction.reimbursement.code}
                                    </StateNavLink>
                                </div>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'top_up' && (
                                <div className="transactions-item-counterpart">
                                    {translate('voucher.transactions.top_up')}
                                </div>
                            )}

                            {transaction.type == 'transaction' && transaction.target == 'payout' && (
                                <div className="transactions-item-counterpart">
                                    {translate('voucher.transactions.payout')}
                                </div>
                            )}

                            <div className="transactions-item-date">{transaction.created_at_locale}</div>
                        </div>

                        <div className="transactions-item-amount">
                            <div className="transactions-item-value">
                                {(transaction.incoming ? '+' : '-') + ' ' + transaction.amount_locale}
                            </div>
                            <div className="transactions-item-type">
                                {transaction.type == 'product_voucher' && translate('voucher.transactions.reservation')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'provider' &&
                                    transaction.initiator == 'provider' &&
                                    translate('voucher.transactions.qr_code')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'provider' &&
                                    transaction.initiator == 'sponsor' &&
                                    translate('voucher.transactions.provider_by_sponsor')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'iban' &&
                                    !transaction.reimbursement &&
                                    translate('voucher.transactions.bank_transfer')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'iban' &&
                                    transaction.reimbursement &&
                                    translate('voucher.transactions.reimbursement')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'top_up' &&
                                    translate('voucher.transactions.top_up')}

                                {transaction.type == 'transaction' &&
                                    transaction.target == 'payout' &&
                                    translate('voucher.transactions.payout')}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

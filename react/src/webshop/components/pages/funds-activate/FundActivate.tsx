import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import useEnvData from '../../../hooks/useEnvData';
import useAppConfigs from '../../../hooks/useAppConfigs';
import { useDigiDService } from '../../../services/DigiDService';
import { useWalletService } from '../../../services/WalletService';
import { useNavigateState } from '../../../modules/state_router/Router';
import FundsListItemModel from '../../../services/types/FundsListItemModel';
import { ResponseError } from '../../../../dashboard/props/ApiResponses';
import usePushInfo from '../../../../dashboard/hooks/usePushInfo';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import Fund from '../../../props/models/Fund';
import Identity from '../../../../dashboard/props/models/Identity';
import Voucher from '../../../../dashboard/props/models/Voucher';
import FundRequest from '../../../../dashboard/props/models/FundRequest';
import { useFundService } from '../../../services/FundService';
import { useVoucherService } from '../../../services/VoucherService';
import { useIdentityService } from '../../../../dashboard/services/IdentityService';
import { useFundRequestService } from '../../../services/FundRequestService';
import { startCase } from 'lodash';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useAssetUrl from '../../../hooks/useAssetUrl';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { StringParam, useQueryParams } from 'use-query-params';
import useFormBuilder from '../../../../dashboard/hooks/useFormBuilder';
import PincodeControl from '../../../../dashboard/components/elements/forms/controls/PincodeControl';
import FormError from '../../../../dashboard/components/elements/forms/errors/FormError';
import UIControlCheckbox from '../../../../dashboard/components/elements/forms/ui-controls/UIControlCheckbox';
import FundCriteriaCustomOverview from '../funds/elements/FundCriteriaCustomOverview';
import BlockCard2FAWarning from '../../elements/block-card-2fa-warning/BlockCard2FAWarning';
import { useInterval } from '../../../../dashboard/hooks/useInterval';
import useOpenModal from '../../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../modals/ModalNotification';
import useFetchAuthIdentity from '../../../hooks/useFetchAuthIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import BlockShowcase from '../../elements/block-showcase/BlockShowcase';
import BlockLoader from '../../elements/block-loader/BlockLoader';
import BlockWarning from '../../elements/block-warning/BlockWarning';
import { clickOnKeyEnter } from '../../../../dashboard/helpers/wcag';
import useSetTitle from '../../../hooks/useSetTitle';
import SignUpFooter from '../../elements/sign-up/SignUpFooter';
import TranslateHtml from '../../../../dashboard/components/elements/translate-html/TranslateHtml';
import usePayoutTransactionService from '../../../services/PayoutTransactionService';
import PayoutTransaction from '../../../../dashboard/props/models/PayoutTransaction';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import type { WalletFlow } from '../../../../dashboard/props/models/WalletFlow';
import useFundApply from '../../../hooks/useFundApply';
import Markdown from '../../elements/markdown/Markdown';

export default function FundActivate() {
    const { id } = useParams();
    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const translate = useTranslate();

    const [state, setState] = useState('');

    const envData = useEnvData();
    const appConfigs = useAppConfigs();
    const authIdentity = useAuthIdentity();

    const fundService = useFundService();
    const digIdService = useDigiDService();
    const walletService = useWalletService();
    const voucherService = useVoucherService();
    const identityService = useIdentityService();
    const fundRequestService = useFundRequestService();
    const payoutTransactionService = usePayoutTransactionService();

    const setTitle = useSetTitle();
    const pushInfo = usePushInfo();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const navigateState = useNavigateState();
    const fetchAuthIdentity = useFetchAuthIdentity();

    const [digidResponse, setDigidResponse] = useQueryParams({
        digid_error: StringParam,
        digid_success: StringParam,
        wallet_error: StringParam,
        wallet_success: StringParam,
        disclosure_success: StringParam,
        wallet_disclosure: StringParam,
    });

    const handledDisclosureResponse = useRef<string>(null);
    const introSeenFundId = useRef<number>(null);

    const [fund, setFund] = useState<FundsListItemModel>(null);
    const [payouts, setPayouts] = useState<Array<PayoutTransaction>>(null);
    const [vouchers, setVouchers] = useState<Array<Voucher>>(null);

    const payoutsActive = useMemo(() => {
        return payouts?.filter((payout) => payout.fund.id === fund?.id && !payout.expired);
    }, [fund?.id, payouts]);

    const vouchersActive = useMemo(() => {
        return vouchers?.filter((voucher) => voucher.fund_id === fund?.id && !voucher.expired);
    }, [fund?.id, vouchers]);

    const [criteriaChecked, setCriteriaChecked] = useState(false);
    const [criteriaCheckedWarning, setCriteriaCheckedWarning] = useState(false);

    const [fundRequests, setFundRequests] = useState<Array<FundRequest>>(null);
    const [fundRequest, setFundRequest] = useState<FundRequest>(null);
    const [options, setOptions] = useState(null);

    const [fetchingData, setFetchingData] = useState(false);
    const [bsnVerificationMethod, setBsnVerificationMethod] = useState<'digid' | 'wallet'>('digid');
    const [bsnVerificationWalletFlow, setBsnVerificationWalletFlow] = useState<WalletFlow>(null);

    const walletFlows = useMemo(() => {
        return appConfigs?.wallet ? appConfigs.wallet_config?.flows || [] : [];
    }, [appConfigs]);

    const disclosureFlow = useMemo(() => {
        return appConfigs?.wallet_disclosure_flows?.find((flow) => flow.id === fund?.wallet_disclosure_flow_id);
    }, [appConfigs?.wallet_disclosure_flows, fund?.wallet_disclosure_flow_id]);

    const walletOptions = useMemo(() => {
        if (!fund?.wallet_disclosure_flow_id) {
            return walletFlows;
        }

        return disclosureFlow ? (walletFlows.length > 0 ? walletFlows : [disclosureFlow]) : [];
    }, [disclosureFlow, fund?.wallet_disclosure_flow_id, walletFlows]);

    const getTimeToSkipDigid = useCallback(
        (identity: Identity, fund: Fund, witOffset = true) => {
            if (!identity || !fund) {
                return null;
            }

            const timeOffset = witOffset
                ? Math.min(appConfigs.bsn_confirmation_offset || 300, fund.bsn_confirmation_time / 2)
                : 0;

            if (fund.bsn_confirmation_time === null || !identity.bsn) {
                return null;
            }

            return Math.max(fund.bsn_confirmation_time - (identity.bsn_time + timeOffset), 0);
        },
        [appConfigs.bsn_confirmation_offset],
    );

    const skipBsnLimit = useMemo(() => {
        return Date.now() + getTimeToSkipDigid(authIdentity, fund, false) * 1000;
    }, [authIdentity, fund, getTimeToSkipDigid]);

    const skipBsnLimitSoft = useMemo(() => {
        return Date.now() + getTimeToSkipDigid(authIdentity, fund, true) * 1000;
    }, [authIdentity, fund, getTimeToSkipDigid]);

    // Start digid sign-in
    const startDigId = useCallback(
        (fund: Fund) => {
            digIdService
                .startFundRequest(fund.id)
                .then((res) => (document.location = res.data.redirect_url))
                .catch((err: ResponseError) => {
                    if (fund.wallet_disclosure_flow_id) {
                        setFetchingData(false);
                        setState('select');
                        return pushDanger(translate('push.error'), translate('fund_activate.disclosure.failed'));
                    }

                    if (err.status === 403 && err.data.message) {
                        return pushDanger(translate('push.error'), err.data.message);
                    }

                    navigateState(WebshopRoutes.ERROR, {
                        errorCode: err.headers['error-code'] || 'digid_unknown_error',
                    });
                });
        },
        [digIdService, navigateState, pushDanger, translate],
    );

    const startWallet = useCallback(
        (fund: Fund, flow: WalletFlow) => {
            if (!flow) {
                setFetchingData(false);

                if (fund.wallet_disclosure_flow_id) {
                    pushDanger(translate('push.error'), translate('fund_activate.disclosure.failed'));
                }

                return;
            }

            walletService
                .startFundRequest(fund.id, flow, !!fund.wallet_disclosure_flow_id)
                .then((res) => (document.location = res.data.redirect_url))
                .catch((err: ResponseError) => {
                    setFetchingData(false);

                    if (fund.wallet_disclosure_flow_id) {
                        return pushDanger(translate('push.error'), translate('fund_activate.disclosure.failed'));
                    }

                    if (err.status === 403 && err.data.message) {
                        return pushDanger(translate('push.error'), err.data.message);
                    }

                    navigateState(WebshopRoutes.ERROR, {
                        errorCode: walletService.errorCode(err),
                    });
                });
        },
        [navigateState, walletService, pushDanger, translate],
    );

    const startFundDisclosure = useCallback(
        (fund: Fund) => {
            walletService
                .startFundDisclosure(fund.id)
                .then((res) => window.location.assign(res.data.redirect_url))
                .catch(() => {
                    setFetchingData(false);
                    setState('select');
                    pushDanger(translate('push.error'), translate('fund_activate.disclosure.failed'));
                });
        },
        [walletService, pushDanger, translate],
    );

    const startBsnVerification = useCallback(
        (fund: Fund, method = bsnVerificationMethod, flow = bsnVerificationWalletFlow || walletFlows[0]) => {
            return method === 'wallet' ? startWallet(fund, flow) : startDigId(fund);
        },
        [bsnVerificationMethod, bsnVerificationWalletFlow, walletFlows, startDigId, startWallet],
    );

    const applyFund = useFundApply({
        onApplied: (voucher) => navigateState(WebshopRoutes.VOUCHER, { number: voucher.number }),
        onError: (_err, fund) => navigateState(WebshopRoutes.FUND, { id: fund.id }),
    });

    const codeForm = useFormBuilder({ code: '' }, (values) => {
        if (!values.code) {
            return codeForm.setErrors({ code: true });
        }

        let code = values.code;

        if (typeof code == 'string') {
            code = code.replace(/[oO]/g, '0');
            code = code.substring(0, 4) + '-' + code.substring(4);
        }

        fundService
            .redeem(code)
            .then((res) => {
                if (res.data.vouchers.length === 1) {
                    return navigateState(WebshopRoutes.VOUCHER, res.data.vouchers[0]);
                }

                return res.data.vouchers.length > 0
                    ? navigateState(WebshopRoutes.VOUCHERS)
                    : navigateState(WebshopRoutes.FUNDS);
            })
            .catch((err: ResponseError) => {
                if ((err.status == 404 || err.status === 403) && err.data.meta) {
                    codeForm.setErrors({ code: [err.data.meta.message] });
                } else if (err.data.meta || err.status == 429) {
                    openModal((modal) => (
                        <ModalNotification
                            modal={modal}
                            type={'info'}
                            title={err.data.meta.title}
                            description={err.data.meta.message}
                        />
                    ));
                } else {
                    openModal((modal) => (
                        <ModalNotification
                            modal={modal}
                            type={'info'}
                            title={translate('push.error')}
                            description={err.data.message}
                        />
                    ));
                }

                codeForm.setIsLocked(false);
                codeForm.setIsLoading(true);

                window.setTimeout(() => codeForm.setIsLoading(false), 1000);
            });
    });

    const fundRequestIsAvailable = useMemo(() => {
        return (
            fund?.allow_fund_requests &&
            (!appConfigs?.digid_mandatory || (appConfigs?.digid_mandatory && authIdentity?.bsn))
        );
    }, [appConfigs, authIdentity, fund]);

    const checkFund = useCallback(
        (fromVerification = false, method = bsnVerificationMethod, flow = bsnVerificationWalletFlow) => {
            if (fetchingData) {
                return;
            }

            setFetchingData(true);

            identityService
                .identity()
                .then((res) => {
                    const identity = res.data;
                    const timeToSkipBsn = getTimeToSkipDigid(identity, fund);

                    if (fund.wallet_disclosure_flow_id) {
                        if (
                            !fromVerification &&
                            (!identity.bsn || (fund.bsn_confirmation_time !== null && timeToSkipBsn <= 0))
                        ) {
                            return startBsnVerification(fund, method, flow);
                        }

                        return startFundDisclosure(fund);
                    }

                    if (!fromVerification && (timeToSkipBsn === null || timeToSkipBsn <= 0)) {
                        return startBsnVerification(fund, method, flow);
                    }

                    fundService
                        .check(fund.id)
                        .then((res) => {
                            const { backoffice, prevalidations } = res.data;
                            const { vouchers, prevalidation_vouchers } = res.data;

                            const { backoffice_fallback, backoffice_redirect } = backoffice || {};
                            const { backoffice_error, backoffice_error_key } = backoffice || {};

                            // Backoffice not responding and fallback is disabled
                            if (backoffice && backoffice_error && !backoffice_fallback) {
                                return setState(`backoffice_error_${backoffice_error_key || 'not_eligible'}`);
                            }

                            // Fund requesting is not available after successful BSN verification
                            if (
                                !prevalidations &&
                                !vouchers &&
                                !prevalidation_vouchers.length &&
                                !fundRequestIsAvailable
                            ) {
                                return setState('error_not_available');
                            }

                            // User is not eligible and has to be redirected
                            if (backoffice_redirect) {
                                return (document.location = backoffice_redirect);
                            }

                            if (prevalidation_vouchers.length > 0) {
                                return prevalidation_vouchers.length > 1
                                    ? navigateState(WebshopRoutes.VOUCHERS)
                                    : navigateState(WebshopRoutes.VOUCHER, prevalidation_vouchers[0]);
                            }

                            navigateState(
                                WebshopRoutes.FUND_REQUEST,
                                { id: fund.id },
                                {},
                                { state: { from: 'fund-activate' } },
                            );
                        })
                        .catch((err: ResponseError) => {
                            if (err.status === 403 && err.data.message) {
                                pushDanger(translate('push.error'), err.data.message);
                            }

                            if (err.data?.meta || err.status == 429) {
                                openModal((modal) => (
                                    <ModalNotification
                                        modal={modal}
                                        type={'info'}
                                        header={err.data.meta.title}
                                        description={err.data.meta.message}
                                    />
                                ));
                            }

                            setDigidResponse({
                                digid_error: null,
                                digid_success: null,
                                wallet_error: null,
                                wallet_success: null,
                            });
                            setState('select');
                        })
                        .finally(() => setFetchingData(false));
                })
                .catch((err: ResponseError) => {
                    setFetchingData(false);
                    pushDanger(
                        translate('push.error'),
                        fund.wallet_disclosure_flow_id
                            ? translate('fund_activate.disclosure.failed')
                            : err.data.message,
                    );
                });
        },
        [
            bsnVerificationWalletFlow,
            bsnVerificationMethod,
            translate,
            fetchingData,
            fund,
            fundRequestIsAvailable,
            fundService,
            getTimeToSkipDigid,
            identityService,
            navigateState,
            openModal,
            pushDanger,
            setDigidResponse,
            startBsnVerification,
            startFundDisclosure,
        ],
    );

    const getTimeToSkip = useCallback(() => {
        const timeToSkipBsn = Math.max((skipBsnLimit - Date.now()) / 1000, 0);
        const timeToSkipBsnSoft = Math.max((skipBsnLimitSoft - Date.now()) / 1000, 0);

        return { timeToSkipBsn, timeToSkipBsnSoft };
    }, [skipBsnLimit, skipBsnLimitSoft]);

    const selectBsnVerificationOption = useCallback(
        (fund: Fund, method: 'digid' | 'wallet', flow?: WalletFlow) => {
            setBsnVerificationMethod(method);
            setBsnVerificationWalletFlow(method === 'wallet' ? flow : null);

            const hasCustomCriteria = ['IIT', 'bus_2020', 'meedoen'].includes(fund.key);
            const autoValidation = fund.auto_validation;

            //- Show custom criteria screen
            if (!fund.wallet_disclosure_flow_id && autoValidation && hasCustomCriteria) {
                return getTimeToSkip().timeToSkipBsnSoft > 0
                    ? setState('digid')
                    : startBsnVerification(fund, method, flow);
            }

            checkFund(false, method, flow);
        },
        [checkFund, startBsnVerification, getTimeToSkip],
    );

    const selectDigiDOption = useCallback(
        (fund: Fund) => selectBsnVerificationOption(fund, 'digid'),
        [selectBsnVerificationOption],
    );

    const selectWalletOption = useCallback(
        (fund: Fund, flow = bsnVerificationWalletFlow || walletFlows[0]) =>
            selectBsnVerificationOption(fund, 'wallet', flow?.id === disclosureFlow?.id ? walletFlows[0] : flow),
        [bsnVerificationWalletFlow, disclosureFlow, walletFlows, selectBsnVerificationOption],
    );

    const confirmCriteria = useCallback(() => {
        checkFund(false, bsnVerificationMethod, bsnVerificationWalletFlow);
    }, [bsnVerificationMethod, bsnVerificationWalletFlow, checkFund]);

    const handleDigiDResponse = useCallback(() => {
        const { digid_success, digid_error, wallet_success, wallet_error, disclosure_success, wallet_disclosure } =
            digidResponse;

        if ((!digid_success && !digid_error && !wallet_success && !wallet_error && !disclosure_success) || !fund) {
            return;
        }

        introSeenFundId.current = fund.id;

        if (fund.wallet_disclosure_flow_id) {
            const responseKey = JSON.stringify([fund.id, digidResponse]);

            if (handledDisclosureResponse.current === responseKey) {
                return;
            }

            handledDisclosureResponse.current = responseKey;

            if (!wallet_error && !digid_error && disclosure_success && wallet_disclosure) {
                return navigateState(
                    WebshopRoutes.FUND_REQUEST,
                    { id: fund.id },
                    { wallet_disclosure },
                    { replace: true, state: { from: 'fund-activate' } },
                );
            }

            setDigidResponse(
                {
                    digid_error: undefined,
                    digid_success: undefined,
                    wallet_error: undefined,
                    wallet_success: undefined,
                    disclosure_success: undefined,
                    wallet_disclosure: undefined,
                },
                'replaceIn',
            );

            if (digid_error || wallet_error) {
                setState('select');

                if (wallet_error === 'disclosure_cancelled') {
                    pushInfo(
                        translate('fund_activate.disclosure.cancelled_title'),
                        translate('fund_activate.disclosure.cancelled'),
                    );
                } else {
                    pushDanger(
                        translate('push.error'),
                        translate(
                            wallet_error === 'disclosure_invalid'
                                ? 'fund_activate.disclosure.invalid'
                                : 'fund_activate.disclosure.failed',
                        ),
                    );
                }

                return;
            }

            if (wallet_success || digid_success) {
                checkFund(true);
            }

            return;
        }

        // got verification error, abort
        if (digid_error || wallet_error) {
            const errorProvider = wallet_error ? 'wallet' : 'digid';
            const error = wallet_error || digid_error;

            const custom404Link = {
                name: 'fund-activate',
                params: { id: fund.id },
                icon: 'mdi-arrow-left',
                text: translate('error.home_button'),
                button: true,
            };

            navigateState(
                WebshopRoutes.ERROR,
                { errorCode: `${errorProvider}_${error}` },
                {},
                {
                    state: {
                        hideHomeLinkButton: true,
                        customLink: digid_error === 'error_0040' ? custom404Link : null,
                    },
                },
            );
        }

        // BSN verification flow
        if (
            digid_success == 'signed_up' ||
            digid_success == 'signed_in' ||
            wallet_success == 'signed_up' ||
            wallet_success == 'signed_in'
        ) {
            const method = wallet_success ? 'wallet' : 'digid';

            pushSuccess(translate('push.success'), translate(`push.fund_activation.${method}_success`));

            window.setTimeout(() => {
                method === 'wallet' ? selectWalletOption(fund) : selectDigiDOption(fund);

                setDigidResponse({
                    digid_error: null,
                    digid_success: null,
                    wallet_error: null,
                    wallet_success: null,
                });
            }, 1000);
        }
    }, [
        digidResponse,
        checkFund,
        fund,
        navigateState,
        pushSuccess,
        pushInfo,
        pushDanger,
        selectDigiDOption,
        selectWalletOption,
        setDigidResponse,
        translate,
    ]);

    const fetchFund = useCallback(
        (id: number) => {
            setProgress(0);

            fundService
                .read(id, { check_criteria: 1 })
                .then((res) => setFund(res.data.data))
                .finally(() => setProgress(100));
        },
        [fundService, setProgress],
    );

    const fetchVouchers = useCallback(() => {
        if (!authIdentity || !fund) {
            return setVouchers(null);
        }

        setProgress(0);

        voucherService
            .list()
            .then((res) => setVouchers(res.data.data))
            .finally(() => setProgress(100));
    }, [authIdentity, fund, setProgress, voucherService]);

    const fetchPayouts = useCallback(() => {
        if (!authIdentity || !fund) {
            return setPayouts(null);
        }

        setProgress(0);

        payoutTransactionService
            .list()
            .then((res) => setPayouts(res.data.data))
            .finally(() => setProgress(100));
    }, [authIdentity, fund, setProgress, payoutTransactionService]);

    const fetchFundRequests = useCallback(() => {
        if (!authIdentity || !fund) {
            return setFundRequests(null);
        }

        setProgress(0);

        fundRequestService
            .index(fund.id)
            .then((res) => setFundRequests(res.data.data))
            .catch((err: ResponseError) => {
                pushDanger(translate('push.error'), err.data.message);
                navigateState(WebshopRoutes.FUND, { id: id });
            })
            .finally(() => setProgress(100));
    }, [authIdentity, fund, fundRequestService, id, navigateState, pushDanger, setProgress, translate]);

    const getAvailableOptions = useCallback(
        (fund: Fund) => {
            const options = [];

            if (fund.allow_prevalidations) {
                options.push('code');
            }

            if (appConfigs.digid) {
                options.push('digid');
            }

            if (walletOptions.length > 0) {
                options.push('wallet');
            }

            if (
                !appConfigs.digid &&
                walletOptions.length === 0 &&
                !fund.wallet_disclosure_flow_id &&
                !appConfigs.digid_mandatory &&
                fund.allow_fund_requests
            ) {
                options.push('request');
            }

            return options;
        },
        [appConfigs, walletOptions],
    );

    const initState = useCallback(
        (fund: Fund) => {
            const options = getAvailableOptions(fund);

            // The fund is already taken by identity partner
            if (fund.taken_by_partner_voucher) {
                return setState('taken_by_partner_voucher');
            }

            if (fund.taken_by_partner_pending_fund_request) {
                return setState('taken_by_partner_pending_fund_request');
            }

            if (options.length == 0) {
                return navigateState(WebshopRoutes.FUNDS);
            }

            if (fund.fund_request_intro_html && introSeenFundId.current !== fund.id) {
                return setState('intro');
            }

            if (options[0] === 'request') {
                return navigateState(WebshopRoutes.FUND_REQUEST, fund, {}, { state: { from: 'fund-activate' } });
            }

            if (options.length === 1 && !['digid', 'wallet'].includes(options[0])) {
                return setState(options[0]);
            }

            setOptions(options);
            setState('select');
        },
        [getAvailableOptions, navigateState],
    );

    useEffect(() => {
        setFund(null);
        fetchFund(parseInt(id));
    }, [fetchFund, id]);

    useEffect(() => {
        fetchPayouts();
        fetchVouchers();
    }, [fetchPayouts, fetchVouchers]);

    useEffect(() => {
        fetchAuthIdentity().then();
    }, [fetchAuthIdentity]);

    useEffect(() => {
        fetchFundRequests();
    }, [fetchFundRequests]);

    useEffect(() => {
        handleDigiDResponse();
    }, [handleDigiDResponse]);

    useEffect(() => {
        if (!fund || !vouchers || !fundRequests) {
            return;
        }

        initState(fund);
    }, [fund, initState, vouchers, fundRequests]);

    useEffect(() => {
        if (!fund || !vouchersActive || !payoutsActive || !fundRequests) {
            return;
        }

        const request = fundRequests?.find(
            (request) => request.state === 'pending' || (request.state === 'approved' && request.current_period),
        );

        if (request) {
            setFundRequest(request);
            setState('fund_already_applied');
            return;
        }

        // The fund is already taken by identity partner
        if (fund?.taken_by_partner_voucher) {
            return setState('taken_by_partner_voucher');
        }

        if (fund?.taken_by_partner_pending_fund_request) {
            return setState('taken_by_partner_pending_fund_request');
        }

        // Voucher already received, go to the voucher
        if (vouchersActive?.length > 0) {
            return navigateState(WebshopRoutes.VOUCHER, { number: vouchersActive[0]?.number });
        }

        // Payout already received, go to the payouts
        if (payoutsActive?.length > 0) {
            return navigateState(WebshopRoutes.PAYOUTS);
        }

        // All the criteria are meet, request the voucher
        if (!fund.wallet_disclosure_flow_id && fund.criteria.filter((criterion) => !criterion.is_valid).length == 0) {
            applyFund(fund);
        }
    }, [applyFund, fund, navigateState, vouchersActive, fundRequests, payoutsActive]);

    useInterval(() => {
        const { timeToSkipBsn } = getTimeToSkip();

        if ((!timeToSkipBsn || timeToSkipBsn <= 0) && state === 'digid') {
            setState('select');
            pushInfo(translate('push.session_expired.title'), translate('push.session_expired.description'));
        }
    }, 1000);

    useEffect(() => {
        if (fund) {
            setTitle(translate('page_state_titles.fund-activate', { fund_name: fund.name }));
        }
    }, [setTitle, translate, fund]);

    if (digidResponse?.digid_success || digidResponse?.wallet_success || digidResponse?.disclosure_success) {
        return <BlockShowcase />;
    }

    return (
        <BlockShowcase breadcrumbItems={[]} loaderElement={<BlockLoader type={'full'} />}>
            {fund && vouchers && appConfigs && (
                <div className="block block-sign_up">
                    <div className="block-wrapper">
                        {state && !['intro', 'select', 'digid', 'code'].includes(state) && (
                            <h1 className="block-title">
                                {translate('fund_request.sign_up.header.main', {
                                    fund_name: startCase(fund.name || ''),
                                })}
                            </h1>
                        )}

                        {state === 'intro' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_request.sign_up.header.main', {
                                            fund_name: startCase(fund.name || ''),
                                        })}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <Markdown content={fund.fund_request_intro_html} />
                                </div>
                                <SignUpFooter
                                    startActions={
                                        <StateNavLink
                                            name={WebshopRoutes.FUND}
                                            params={{ id: fund.id }}
                                            className="button button-text button-text-padless">
                                            <em className="mdi mdi-chevron-left" aria-hidden="true" />
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    }
                                    endActions={
                                        <button
                                            type="button"
                                            className="button button-text button-text-padless"
                                            onClick={() => {
                                                introSeenFundId.current = fund.id;
                                                initState(fund);
                                            }}>
                                            {translate('fund_activate.intro.continue')}
                                            <em className="mdi mdi-chevron-right icon-right" aria-hidden="true" />
                                        </button>
                                    }
                                />
                            </div>
                        )}

                        {state == 'select' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_request.sign_up.header.main', {
                                            fund_name: startCase(fund.name || ''),
                                        })}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <h3 className="sign_up-pane-text">
                                        <div className="sign_up-pane-heading">
                                            {translate(
                                                `signup.items.${envData.client_key}.signup_option`,
                                                null,
                                                `signup.items.signup_option`,
                                            )}
                                        </div>
                                    </h3>
                                    <div className="sign_up-options" data-dusk={'fundRequestOptions'}>
                                        {options?.includes('code') && (
                                            <div
                                                data-dusk="codeOption"
                                                className="sign_up-option"
                                                onClick={() => setState('code')}
                                                onKeyDown={clickOnKeyEnter}
                                                tabIndex={0}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-me_app.svg')}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">
                                                        {translate('fund_activate.options.code.title')}
                                                    </div>
                                                    <div className="sign_up-option-description">
                                                        {translate('fund_activate.options.code.description')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {options?.includes('digid') && (
                                            <div
                                                data-dusk="digidOption"
                                                className="sign_up-option"
                                                onClick={() => selectDigiDOption(fund)}
                                                onKeyDown={clickOnKeyEnter}
                                                tabIndex={0}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-digid.svg')}
                                                        alt="logo DigiD"
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">
                                                        {translate('fund_activate.options.digid.title')}
                                                    </div>
                                                    <div className="sign_up-option-description">
                                                        {translate('fund_activate.options.digid.description')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(options?.includes('wallet') ? walletOptions : []).map((flow) => (
                                            <div
                                                key={flow.key}
                                                data-dusk="walletOption"
                                                className="sign_up-option"
                                                onClick={() => selectWalletOption(fund, flow)}
                                                onKeyDown={clickOnKeyEnter}
                                                tabIndex={0}>
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl(
                                                            `/assets/img/icon-auth/icon-auth-${flow.id === disclosureFlow?.id ? 'openid' : flow.key}.svg`,
                                                        )}
                                                        alt={`logo ${flow.name}`}
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">{flow.name}</div>
                                                    <div className="sign_up-option-description">
                                                        {translate(
                                                            fund.wallet_disclosure_flow_id
                                                                ? 'fund_activate.options.wallet.disclosure_description'
                                                                : 'fund_activate.options.wallet.description',
                                                            {
                                                                flow_name: flow.name,
                                                            },
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {options?.includes('request') && (
                                            <StateNavLink
                                                name={WebshopRoutes.FUND_REQUEST}
                                                params={{ id: fund?.id }}
                                                state={{ from: WebshopRoutes.FUND_ACTIVATE }}
                                                tabIndex={0}
                                                onKeyDown={clickOnKeyEnter}
                                                dataDusk="requestOption"
                                                className="sign_up-option">
                                                <div className="sign_up-option-media">
                                                    <img
                                                        className="sign_up-option-media-img"
                                                        src={assetUrl('/assets/img/icon-auth/icon-auth-me_app.svg')}
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="sign_up-option-details">
                                                    <div className="sign_up-option-title">
                                                        {translate('fund_activate.options.request.title')}
                                                    </div>
                                                    <div className="sign_up-option-description">
                                                        {translate('fund_activate.options.request.description')}
                                                    </div>
                                                </div>
                                            </StateNavLink>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'code' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.code.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <form className="form" onSubmit={codeForm.submit}>
                                        <div className="form-group text-center">
                                            <div className="form-label flex-center">
                                                {translate('popup_auth.input.code')}
                                            </div>
                                            <PincodeControl
                                                value={codeForm.values.code}
                                                onChange={(code) => codeForm.update({ code: code?.trim() })}
                                                blockCount={2}
                                                blockSize={4}
                                                valueType={'alphaNum'}
                                            />
                                            <FormError error={codeForm.errors.code} />
                                        </div>
                                        <div className="form-group" />
                                        <div className="form-group text-center">
                                            <button
                                                data-dusk="codeFormSubmit"
                                                className="button button-primary"
                                                disabled={codeForm.values.code.length != 8 || codeForm.isLoading}
                                                type="submit">
                                                {translate('popup_auth.buttons.submit')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                <SignUpFooter
                                    startActions={
                                        options?.length > 1 && (
                                            <button
                                                className="button button-text button-text-padless"
                                                type={'button'}
                                                onClick={() => setState('select')}
                                                tabIndex={0}>
                                                <em className="mdi mdi-chevron-left icon-lefts" />
                                                {translate('fund_activate.cards.back')}
                                            </button>
                                        )
                                    }
                                />
                            </div>
                        )}

                        {state == 'digid' && !fetchingData && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h1 className="sign_up-pane-header-title">
                                        {translate(
                                            `fund_activate.header.${envData.client_key}.title`,
                                            null,
                                            `fund_activate.header.title`,
                                        )}
                                    </h1>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="form">
                                        <FundCriteriaCustomOverview fundKey={fund.key} />

                                        <div className="sign_up-pane-text">
                                            <UIControlCheckbox
                                                id={'confirm_criteria'}
                                                dataDusk={'confirmCriteriaCheckbox'}
                                                checked={criteriaChecked}
                                                label={translate('fund_activate.cards.digid.confirm')}
                                                onChange={(e) => setCriteriaChecked(e.target.checked)}
                                            />
                                        </div>

                                        {fund.key == 'IIT' && (
                                            <div className="sign_up-pane-text">
                                                <UIControlCheckbox
                                                    id={'confirm_criteria_warning'}
                                                    checked={criteriaCheckedWarning}
                                                    label={
                                                        'Ik weet dat het verstrekken van onjuiste informatie strafbaar is, dat ik een onterecht of een teveel ontvangen vergoeding terug moet betalen en dat ik een boete kan krijgen.'
                                                    }
                                                    onChange={(e) => setCriteriaCheckedWarning(e.target.checked)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {criteriaChecked && (fund.key != 'IIT' || criteriaCheckedWarning) && (
                                    <SignUpFooter
                                        endActions={
                                            <div
                                                className="button button-text button-text-padless"
                                                onClick={confirmCriteria}
                                                role="button"
                                                data-dusk="nextStepButton"
                                                tabIndex={0}>
                                                {translate('fund_request.sign_up.pane.footer.next')}
                                                <em className="mdi mdi-chevron-right icon-right" />
                                            </div>
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {state == 'digid' && fetchingData && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-body">
                                    <br />
                                    <div className="sign_up-pane-loading">
                                        <div className="mdi mdi-loading mdi-spin" />
                                    </div>
                                    <div className="sign_up-pane-text text-center text-muted">
                                        {translate('fund_activate.cards.digid.loading')}
                                    </div>
                                    <br />
                                </div>
                            </div>
                        )}

                        {state == 'error_not_available' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.not_available.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <p className="sign_up-pane-text text-center">
                                        {translate('fund_activate.cards.not_available.description', {
                                            name: fund.name,
                                        })}
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        {translate('fund_activate.cards.not_available.contacts', {
                                            name: fund.organization.name,
                                        })}
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'taken_by_partner_voucher' && (
                            <div className="sign_up-pane" data-dusk="takenByPartnerVoucher">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.taken_by_partner_voucher.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">
                                        {translate('fund_activate.cards.taken_by_partner_voucher.heading')}
                                    </p>
                                    <p className="sign_up-pane-text">
                                        <TranslateHtml
                                            i18n={'fund_activate.cards.taken_by_partner_voucher.description'}
                                        />
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        {translate('fund_activate.cards.taken_by_partner_voucher.contacts', {
                                            name: fund.organization.name,
                                        })}
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'taken_by_partner_pending_fund_request' && (
                            <div className="sign_up-pane" data-dusk="takenByPartnerPendingFundRequest">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.taken_by_partner_pending_fund_request.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">
                                        {translate('fund_activate.cards.taken_by_partner_pending_fund_request.heading')}
                                    </p>
                                    <p className="sign_up-pane-text">
                                        <TranslateHtml
                                            i18n={
                                                'fund_activate.cards.taken_by_partner_pending_fund_request.description'
                                            }
                                        />
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        {translate(
                                            'fund_activate.cards.taken_by_partner_pending_fund_request.contacts',
                                            {
                                                name: fund.organization.name,
                                            },
                                        )}
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_not_resident' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.backoffice_error_not_resident.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-text">
                                        <TranslateHtml
                                            i18n={'fund_activate.cards.backoffice_error_not_resident.description'}
                                            values={{ fund_name: fund.name }}
                                        />
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        <TranslateHtml
                                            i18n={'fund_activate.cards.backoffice_error_not_resident.contacts'}
                                            values={{
                                                fund_name: fund.name,
                                                email_value: 'inkomensondersteuning@nijmegen.nl',
                                                email_label: 'inkomensondersteuning@nijmegen.nl',
                                                phone: '14 024',
                                            }}
                                        />
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_not_eligible' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.backoffice_error_not_eligible.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">
                                        {translate('fund_activate.cards.backoffice_error_not_eligible.heading')}
                                    </p>
                                    <p className="sign_up-pane-text">
                                        {translate('fund_activate.cards.backoffice_error_not_eligible.description', {
                                            fund_name: fund.name,
                                        })}
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        {translate('fund_activate.cards.backoffice_error_not_eligible.contacts')}
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_taken_by_partner' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.backoffice_error_taken_by_partner.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-text">
                                        {translate('fund_activate.cards.backoffice_error_taken_by_partner.description')}
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        Telefoonnumer: 14 024
                                        <TranslateHtml
                                            i18n={'fund_activate.cards.backoffice_error_taken_by_partner.contacts'}
                                            values={{
                                                fund_name: fund.name,
                                                email_value: 'inkomensondersteuning@nijmegen.nl',
                                                email_label: 'inkomensondersteuning@nijmegen.nl',
                                                phone: '14 024',
                                            }}
                                        />
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'backoffice_error_no_response' && (
                            <div className="sign_up-pane">
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate('fund_activate.cards.backoffice_error_no_response.title')}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body text-center">
                                    <p className="sign_up-pane-heading sign_up-pane-heading-lg">
                                        {translate('fund_activate.cards.backoffice_error_no_response.heading')}
                                    </p>
                                    <p className="sign_up-pane-text">
                                        {translate('fund_activate.cards.backoffice_error_no_response.description', {
                                            fund_name: fund.name,
                                        })}
                                    </p>
                                    <div className="block-icon">
                                        <img
                                            src={assetUrl('/assets/img/icon-sign_up-error.svg')}
                                            alt="icon sign-up error"
                                        />
                                    </div>
                                    <p className="sign_up-pane-text text-center">
                                        {translate('fund_activate.cards.backoffice_error_no_response.contacts')}
                                    </p>
                                    <div className="text-center">
                                        <StateNavLink
                                            name={WebshopRoutes.FUNDS}
                                            className="button button-text button-text-primary button-text-padless">
                                            {translate('fund_activate.cards.back')}
                                        </StateNavLink>
                                    </div>
                                    <div className="form-group col col-lg-12 hidden-xs">
                                        <br />
                                    </div>
                                </div>
                            </div>
                        )}

                        {state == 'fund_already_applied' && fundRequest && (
                            <div
                                className="sign_up-pane"
                                data-dusk={
                                    fundRequest.state === 'approved' ? 'approvedFundRequest' : 'existingFundRequest'
                                }>
                                <div className="sign_up-pane-header">
                                    <h2 className="sign_up-pane-header-title">
                                        {translate(
                                            `fund_request.sign_up.fund_already_applied.title.${fundRequest.state}`,
                                        )}
                                    </h2>
                                </div>
                                <div className="sign_up-pane-body">
                                    <div className="sign_up-pane-media">
                                        {fundRequest.state === 'approved' ? (
                                            <img
                                                src={assetUrl('/assets/img/fund-request-success.png')}
                                                alt="icon fund request success"
                                            />
                                        ) : (
                                            <Fragment>
                                                {fundRequest.state === 'pending' ? (
                                                    <img
                                                        src={assetUrl('/assets/img/fund-request-pending.svg?color=red')}
                                                        alt="icon fund request pending"
                                                    />
                                                ) : (
                                                    <img
                                                        src={assetUrl('/assets/img/fund-request-error.png')}
                                                        alt="icon fund request error"
                                                    />
                                                )}
                                            </Fragment>
                                        )}
                                    </div>
                                    <div className="sign_up-pane-heading sign_up-pane-heading-md text-center">
                                        {translate(
                                            `fund_request.sign_up.fund_already_applied.subtitle.${fundRequest.state}`,
                                            { date: fundRequest.created_at_locale },
                                        )}
                                    </div>
                                    {fundRequest.state === 'pending' && (
                                        <Fragment>
                                            <div className="sign_up-pane-separator sign_up-pane-separator-sm" />
                                            <div className="sign_up-pane-heading">
                                                {translate(`fund_request.sign_up.fund_already_applied.heading.pending`)}
                                            </div>
                                        </Fragment>
                                    )}
                                    <ul className="sign_up-pane-list sign_up-pane-list-criteria">
                                        {fund.criteria?.map((criterion) => (
                                            <li key={criterion.id}>
                                                <div className="item-icon">
                                                    <em className="mdi mdi-information-outline" />
                                                </div>

                                                {criterion.title && criterion.title}

                                                {!criterion.title &&
                                                    translate(
                                                        `fund_request.sign_up.pane.criterion_${
                                                            {
                                                                '>': 'more',
                                                                '<': 'less',
                                                                '=': 'same',
                                                            }[criterion.operator]
                                                        }`,
                                                        {
                                                            name: criterion?.record_type?.name,
                                                            value: criterion?.value,
                                                        },
                                                    )}
                                            </li>
                                        ))}
                                    </ul>

                                    {fundRequest.state === 'pending' && (
                                        <BlockWarning>
                                            {translate('fund_request.sign_up.fund_already_applied.information')}
                                        </BlockWarning>
                                    )}
                                </div>

                                <div className="sign_up-pane-footer text-center">
                                    <StateNavLink
                                        name={WebshopRoutes.FUND_REQUEST_SHOW}
                                        params={{ id: fundRequest.id }}
                                        className="button button-primary">
                                        {translate(
                                            'fund_request.sign_up.fund_already_applied.buttons.open_fund_request',
                                        )}
                                    </StateNavLink>
                                </div>
                            </div>
                        )}

                        {state == 'select' && (
                            <div>
                                <br />
                                {fund && <BlockCard2FAWarning fund={fund} buttonPosition={'bottom'} />}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </BlockShowcase>
    );
}

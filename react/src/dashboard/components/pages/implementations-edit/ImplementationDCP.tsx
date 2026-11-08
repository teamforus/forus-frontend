import React, { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { uniqueId } from 'lodash';
import { mainContext } from '../../../contexts/MainContext';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useFormBuilder from '../../../hooks/useFormBuilder';
import usePushSuccess from '../../../hooks/usePushSuccess';
import useSetProgress from '../../../hooks/useSetProgress';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { ResponseError } from '../../../props/ApiResponses';
import Implementation from '../../../props/models/Implementation';
import DCPConnection, { DCPConnectionOptions, DCPConnectionTag } from '../../../props/models/DCPConnection';
import useImplementationService from '../../../services/ImplementationService';
import { useDCPConnectionService } from '../../../services/DCPConnectionService';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FormPaneContainer from '../../elements/forms/elements/FormPaneContainer';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import FormError from '../../elements/forms/errors/FormError';
import ToggleControl from '../../elements/forms/controls/ToggleControl';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import SelectControl from '../../elements/select-control/SelectControl';
import InfoBox from '../../elements/info-box/InfoBox';
import Label from '../../elements/label/Label';
import ImplementationsRootBreadcrumbs from '../implementations/elements/ImplementationsRootBreadcrumbs';

const FIXED_VALUE = '__fixed_value';

type TagRow = {
    uid: string;
    key: string;
    source: string;
    value: string;
    required: boolean;
    format: string;
    max: string;
};

type OrderTypeValues = {
    label: string;
    item: string;
    tags: Array<TagRow>;
};

type FormValues = {
    enabled: boolean;
    url: string;
    username: string;
    password: string;
    order_types: { [type: string]: OrderTypeValues };
};

const makeTagRow = (tag: Partial<DCPConnectionTag> = {}): TagRow => {
    const fixed = tag.value !== undefined && tag.value !== null;

    return {
        uid: uniqueId('dcp_tag_'),
        key: tag.key || '',
        source: fixed ? FIXED_VALUE : tag.source || null,
        value: fixed ? tag.value : '',
        required: !!tag.required,
        format: tag.format || '',
        max: tag.max ? tag.max.toString() : '',
    };
};

const makeOrderTypes = (connection: DCPConnection) => {
    return Object.keys(connection.order_types || {}).reduce(
        (list, type) => ({
            ...list,
            [type]: {
                label: connection.order_types[type].label || '',
                item: connection.order_types[type].item || '',
                tags: (connection.order_types[type].tags || []).map((tag) => makeTagRow(tag)),
            },
        }),
        {},
    );
};

export default function ImplementationDCP() {
    const { id } = useParams();

    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();
    const navigateState = useNavigateState();
    const activeOrganization = useActiveOrganization();
    const { fetchOrganizations } = useContext(mainContext);

    const implementationService = useImplementationService();
    const dcpConnectionService = useDCPConnectionService();

    const [implementation, setImplementation] = useState<Implementation>(null);
    const [connection, setConnection] = useState<DCPConnection>(null);
    const [options, setOptions] = useState<DCPConnectionOptions>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string }>(null);
    const [testing, setTesting] = useState(false);

    const form = useFormBuilder<FormValues>(
        {
            enabled: false,
            url: null,
            username: '',
            password: '',
            order_types: {},
        },
        (values) => {
            setProgress(0);

            dcpConnectionService
                .update(activeOrganization.id, implementation.id, {
                    enabled: values.enabled,
                    url: values.url,
                    username: values.username,
                    password: values.password || null,
                    order_types: Object.keys(values.order_types).reduce(
                        (list, type) => ({
                            ...list,
                            [type]: {
                                label: values.order_types[type].label,
                                item: values.order_types[type].item || null,
                                tags: values.order_types[type].tags.map((tag) => ({
                                    key: tag.key,
                                    source: tag.source === FIXED_VALUE ? null : tag.source,
                                    value: tag.source === FIXED_VALUE ? tag.value : null,
                                    required: tag.required,
                                    format: tag.format || null,
                                    max: tag.max ? parseInt(tag.max) : null,
                                })),
                            },
                        }),
                        {},
                    ),
                })
                .then((res) => {
                    setConnection(res.data.data);
                    form.setErrors({});
                    pushSuccess(translate('implementation_dcp.notifications.saved'));

                    if (res.data.data.enabled !== activeOrganization.has_dcp) {
                        // Show or hide the DCP menu item and columns
                        fetchOrganizations().then();
                    }
                })
                .catch((err: ResponseError) => {
                    form.setErrors(err.data.errors);
                    pushApiError(err);
                })
                .finally(() => {
                    setProgress(100);
                    form.setIsLocked(false);
                });
        },
    );

    const { update } = form;

    const updateOrderType = useCallback(
        (type: string, values: Partial<OrderTypeValues> | null) => {
            const orderTypes = { ...form.values.order_types };

            if (values === null) {
                delete orderTypes[type];
            } else {
                orderTypes[type] = { ...(orderTypes[type] || { label: '', item: '', tags: [] }), ...values };
            }

            update({ order_types: orderTypes });
        },
        [form.values?.order_types, update],
    );

    const updateTag = useCallback(
        (type: string, uid: string, values: Partial<TagRow>) => {
            updateOrderType(type, {
                tags: form.values.order_types[type].tags.map((tag) => (tag.uid === uid ? { ...tag, ...values } : tag)),
            });
        },
        [form.values?.order_types, updateOrderType],
    );

    const testConnection = useCallback(() => {
        setTesting(true);
        setTestResult(null);

        dcpConnectionService
            .test(activeOrganization.id, implementation.id, {
                url: form.values.url,
                username: form.values.username || null,
                password: form.values.password || null,
            })
            .then((res) => setTestResult(res.data))
            .catch((err: ResponseError) => {
                setTestResult({ success: false, message: err.data?.message });
                form.setErrors(err.data?.errors || {});
            })
            .finally(() => setTesting(false));
    }, [activeOrganization.id, dcpConnectionService, form, implementation?.id]);

    const fetchData = useCallback(() => {
        const implementationId = parseInt(id);

        Promise.all([
            implementationService.read(activeOrganization.id, implementationId),
            dcpConnectionService.show(activeOrganization.id, implementationId),
            dcpConnectionService.options(activeOrganization.id, implementationId),
        ])
            .then(([implementationRes, connectionRes, optionsRes]) => {
                setImplementation(implementationRes.data.data);
                setConnection(connectionRes.data.data);
                setOptions(optionsRes.data.data);
            })
            .catch((err: ResponseError) => {
                if (err.status === 403) {
                    return navigateState(DashboardRoutes.IMPLEMENTATIONS, { organizationId: activeOrganization.id });
                }

                pushApiError(err);
            });
    }, [id, implementationService, dcpConnectionService, activeOrganization.id, navigateState, pushApiError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (connection) {
            update({
                enabled: connection.enabled,
                url: connection.url,
                username: connection.username || '',
                password: '',
                order_types: makeOrderTypes(connection),
            });
        }
    }, [update, connection]);

    if (!implementation || !connection || !options) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <ImplementationsRootBreadcrumbs implementation={implementation} />
                <div className="breadcrumb-item active">{translate('implementation_dcp.header.title')}</div>
            </div>

            <form className="form" onSubmit={form.submit}>
                <div className="card">
                    <div className="card-header">
                        <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                            <span>{translate('implementation_dcp.header.title')}</span>
                            <Label type={connection.is_active ? 'success' : 'default'}>
                                {translate(
                                    connection.is_active
                                        ? 'implementation_dcp.labels.active'
                                        : 'implementation_dcp.labels.inactive',
                                )}
                            </Label>
                        </div>
                    </div>

                    <FormPaneContainer className="card-section">
                        <FormPane title={translate('implementation_dcp.header.connection')}>
                            <FormGroup
                                label={translate('implementation_dcp.labels.enabled')}
                                input={(id) => (
                                    <ToggleControl
                                        id={id}
                                        className="form-label"
                                        checked={form.values?.enabled}
                                        onChange={(_, checked) => form.update({ enabled: checked })}
                                    />
                                )}
                            />

                            <FormGroup
                                required={true}
                                label={translate('implementation_dcp.labels.url')}
                                error={form.errors?.url}
                                input={(id) => (
                                    <SelectControl
                                        id={id}
                                        propKey="key"
                                        propValue="name"
                                        allowSearch={false}
                                        options={options.urls.map((url) => ({ key: url, name: url }))}
                                        value={form.values?.url}
                                        onChange={(url: string) => form.update({ url })}
                                    />
                                )}
                            />

                            <FormGroup
                                required={form.values?.enabled}
                                label={translate('implementation_dcp.labels.username')}
                                error={form.errors?.username}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type="text"
                                        className="form-control"
                                        autoComplete="off"
                                        value={form.values?.username || ''}
                                        onChange={(e) => form.update({ username: e.target.value })}
                                    />
                                )}
                            />

                            <FormGroup
                                required={form.values?.enabled && !connection.has_password}
                                label={translate('implementation_dcp.labels.password')}
                                error={form.errors?.password}
                                input={(id) => (
                                    <input
                                        id={id}
                                        type="password"
                                        className="form-control"
                                        autoComplete="new-password"
                                        placeholder={
                                            connection.has_password
                                                ? translate('implementation_dcp.placeholders.password_saved')
                                                : ''
                                        }
                                        value={form.values?.password || ''}
                                        onChange={(e) => form.update({ password: e.target.value })}
                                    />
                                )}
                            />

                            <FormGroup
                                input={() => (
                                    <div className="flex flex-vertical flex-gap">
                                        <div>
                                            <button
                                                type="button"
                                                className="button button-default"
                                                disabled={testing}
                                                onClick={testConnection}>
                                                <em
                                                    className={
                                                        testing
                                                            ? 'mdi mdi-loading mdi-spin icon-start'
                                                            : 'mdi mdi-connection icon-start'
                                                    }
                                                />
                                                {translate('implementation_dcp.buttons.test')}
                                            </button>
                                        </div>

                                        {testResult && (
                                            <InfoBox
                                                type={testResult.success ? 'primary' : 'danger'}
                                                iconType={testResult.success ? 'info' : 'warning'}
                                                iconColor={testResult.success ? 'primary' : 'warning'}>
                                                <p>{testResult.message}</p>
                                            </InfoBox>
                                        )}

                                        <InfoBox>
                                            <p>{translate('implementation_dcp.info.connection')}</p>
                                        </InfoBox>
                                    </div>
                                )}
                            />
                        </FormPane>
                    </FormPaneContainer>
                </div>

                {options.orderable_types.map((orderableType) => {
                    const type = orderableType.key;
                    const values = form.values?.order_types?.[type];
                    const errorKey = `order_types.${type}`;

                    const sourceOptions = [
                        ...orderableType.source_fields,
                        { key: FIXED_VALUE, name: translate('implementation_dcp.labels.fixed_value') },
                    ];

                    const formatOptions = (format: string) => [
                        { key: '', name: translate('implementation_dcp.labels.no_format') },
                        ...options.formats,
                        ...(format && !options.formats.find((item) => item.key === format)
                            ? [{ key: format, name: format }]
                            : []),
                    ];

                    return (
                        <div className="card" key={type}>
                            <div className="card-header">
                                <div className="flex flex-grow card-title flex-align-items-center flex-gap">
                                    <span>
                                        {translate('implementation_dcp.header.order_type', {
                                            name: orderableType.name,
                                        })}
                                    </span>
                                </div>
                                <div className="card-header-filters">
                                    <ToggleControl
                                        id={`dcp_order_type_${type}`}
                                        title={translate('implementation_dcp.labels.order_type_enabled')}
                                        checked={!!values}
                                        onChange={(_, checked) => updateOrderType(type, checked ? {} : null)}
                                    />
                                </div>
                            </div>

                            {values && (
                                <Fragment>
                                    <FormPaneContainer className="card-section">
                                        <FormPane title={translate('implementation_dcp.header.settings')}>
                                            <FormGroup
                                                required={true}
                                                label={translate('implementation_dcp.labels.label')}
                                                error={form.errors?.[`${errorKey}.label`]}
                                                input={(id) => (
                                                    <input
                                                        id={id}
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={translate('implementation_dcp.placeholders.label')}
                                                        value={values.label}
                                                        onChange={(e) =>
                                                            updateOrderType(type, { label: e.target.value })
                                                        }
                                                    />
                                                )}
                                            />

                                            <FormGroup
                                                label={translate('implementation_dcp.labels.item')}
                                                error={form.errors?.[`${errorKey}.item`]}
                                                input={(id) => (
                                                    <input
                                                        id={id}
                                                        type="text"
                                                        className="form-control"
                                                        placeholder={translate('implementation_dcp.placeholders.item')}
                                                        value={values.item}
                                                        onChange={(e) =>
                                                            updateOrderType(type, { item: e.target.value })
                                                        }
                                                    />
                                                )}
                                            />

                                            <FormGroup
                                                input={() => (
                                                    <InfoBox>
                                                        <p>{translate('implementation_dcp.info.order_type')}</p>
                                                    </InfoBox>
                                                )}
                                            />
                                        </FormPane>
                                    </FormPaneContainer>

                                    <div className="card-section">
                                        <div className="card-subtitle">
                                            {translate('implementation_dcp.header.tags')} ({values.tags.length})
                                        </div>

                                        <FormError error={form.errors?.[`${errorKey}.tags`]} />

                                        {values.tags.length === 0 && (
                                            <div className="text-muted">
                                                {translate('implementation_dcp.info.no_tags')}
                                            </div>
                                        )}
                                    </div>

                                    {values.tags.length > 0 && (
                                        <div className="card-section">
                                            <div className="card-block card-block-table">
                                                <div className="table-wrapper">
                                                    <table className="table">
                                                        <thead>
                                                            <tr>
                                                                <th>
                                                                    {translate('implementation_dcp.labels.tag_key')}
                                                                </th>
                                                                <th>
                                                                    {translate('implementation_dcp.labels.tag_source')}
                                                                </th>
                                                                <th>
                                                                    {translate('implementation_dcp.labels.tag_value')}
                                                                </th>
                                                                <th>
                                                                    {translate('implementation_dcp.labels.tag_format')}
                                                                </th>
                                                                <th>
                                                                    {translate('implementation_dcp.labels.tag_max')}
                                                                </th>
                                                                <th>
                                                                    {translate(
                                                                        'implementation_dcp.labels.tag_required',
                                                                    )}
                                                                </th>
                                                                <th className="text-right" />
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {values.tags.map((tag, index) => {
                                                                const tagErrorKey = `${errorKey}.tags.${index}`;

                                                                return (
                                                                    <tr key={tag.uid}>
                                                                        <td>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder={translate(
                                                                                    'implementation_dcp.placeholders.tag_key',
                                                                                )}
                                                                                value={tag.key}
                                                                                onChange={(e) =>
                                                                                    updateTag(type, tag.uid, {
                                                                                        key: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                            <FormError
                                                                                error={
                                                                                    form.errors?.[`${tagErrorKey}.key`]
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <SelectControl
                                                                                propKey="key"
                                                                                propValue="name"
                                                                                allowSearch={false}
                                                                                options={sourceOptions}
                                                                                value={tag.source}
                                                                                onChange={(source: string) =>
                                                                                    updateTag(type, tag.uid, { source })
                                                                                }
                                                                            />
                                                                            <FormError
                                                                                error={
                                                                                    form.errors?.[
                                                                                        `${tagErrorKey}.source`
                                                                                    ]
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            {tag.source === FIXED_VALUE && (
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                    value={tag.value}
                                                                                    onChange={(e) =>
                                                                                        updateTag(type, tag.uid, {
                                                                                            value: e.target.value,
                                                                                        })
                                                                                    }
                                                                                />
                                                                            )}
                                                                            <FormError
                                                                                error={
                                                                                    form.errors?.[
                                                                                        `${tagErrorKey}.value`
                                                                                    ]
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <SelectControl
                                                                                propKey="key"
                                                                                propValue="name"
                                                                                allowSearch={false}
                                                                                options={formatOptions(tag.format)}
                                                                                value={tag.format}
                                                                                onChange={(format: string) =>
                                                                                    updateTag(type, tag.uid, { format })
                                                                                }
                                                                            />
                                                                            <FormError
                                                                                error={
                                                                                    form.errors?.[
                                                                                        `${tagErrorKey}.format`
                                                                                    ]
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <input
                                                                                type="number"
                                                                                className="form-control"
                                                                                min={1}
                                                                                value={tag.max}
                                                                                onChange={(e) =>
                                                                                    updateTag(type, tag.uid, {
                                                                                        max: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                            <FormError
                                                                                error={
                                                                                    form.errors?.[`${tagErrorKey}.max`]
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <CheckboxControl
                                                                                checked={tag.required}
                                                                                onChange={(_, required) =>
                                                                                    updateTag(type, tag.uid, {
                                                                                        required,
                                                                                    })
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="text-right">
                                                                            <button
                                                                                type="button"
                                                                                className="button button-default button-icon"
                                                                                title={translate(
                                                                                    'implementation_dcp.buttons.remove_tag',
                                                                                )}
                                                                                onClick={() =>
                                                                                    updateOrderType(type, {
                                                                                        tags: values.tags.filter(
                                                                                            (item) =>
                                                                                                item.uid !== tag.uid,
                                                                                        ),
                                                                                    })
                                                                                }>
                                                                                <em className="mdi mdi-delete-outline" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="card-section">
                                        <div className="flex flex-gap">
                                            <button
                                                type="button"
                                                className="button button-primary button-sm"
                                                onClick={() =>
                                                    updateOrderType(type, { tags: [...values.tags, makeTagRow()] })
                                                }>
                                                <em className="mdi mdi-plus-circle icon-start" />
                                                {translate('implementation_dcp.buttons.add_tag')}
                                            </button>
                                        </div>
                                    </div>
                                </Fragment>
                            )}
                        </div>
                    );
                })}

                <div className="card">
                    <div className="card-footer card-footer-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.IMPLEMENTATION}
                                params={{ id: implementation.id, organizationId: activeOrganization.id }}
                                className="button button-default">
                                {translate('implementation_dcp.buttons.cancel')}
                            </StateNavLink>
                            <button className="button button-primary" type="submit" disabled={form.isLocked}>
                                {translate('implementation_dcp.buttons.save')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </Fragment>
    );
}

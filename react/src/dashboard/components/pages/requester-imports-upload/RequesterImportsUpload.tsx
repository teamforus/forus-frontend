import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Papa from 'papaparse';
import { countBy } from 'lodash';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useTranslate from '../../../hooks/useTranslate';
import useCanManageRequesterImports from '../../../hooks/permissions/useCanManageRequesterImports';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import useLatestRequest from '../../../hooks/useLatestRequest';
import usePushApiError from '../../../hooks/usePushApiError';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import { useRequesterImportService } from '../../../services/RequesterImportService';
import { useFileService } from '../../../services/FileService';
import { RequesterImportRecordType } from '../../../props/models/RequesterImportRow';
import { RequesterImportConfiguration } from '../../../props/models/RequesterImportConfiguration';
import { fileSize } from '../../../helpers/string';
import sortProfileRecordTypes from '../../../helpers/sortProfileRecordTypes';
import { Button } from '../../elements/button/Button';
import Card from '../../elements/card/Card';
import InfoBox from '../../elements/info-box/InfoBox';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import RequesterImportErrorsCard from './elements/RequesterImportErrorsCard';
import RequesterImportPreviewCard from './elements/RequesterImportPreviewCard';
import RequesterImportResultsCard from './elements/RequesterImportResultsCard';
import BatchProgress from '../../../modules/batch-progress/BatchProgress';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useRequesterImportValidation from './hooks/useRequesterImportValidation';
import useRequesterImportUpload from './hooks/useRequesterImportUpload';
import { parseRequesterImportCsv } from './helpers/parseRequesterImportCsv';
import { RequesterImportCsv, RequesterImportCsvError } from './types';

export default function RequesterImportsUpload() {
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();

    if (!canManageRequesterImports) {
        return <OrganizationsNoPermissions />;
    }

    return <RequesterImportsUploadContent key={organization.id} organizationId={organization.id} />;
}

function RequesterImportsUploadContent({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runFileRequest = useLatestRequest();
    const runCatalogRequest = useLatestRequest();

    const fileService = useFileService();
    const recordTypeService = useRecordTypeService();
    const requesterImportService = useRequesterImportService();

    const [file, setFile] = useState<File>(null);
    const [parsing, setParsing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [csv, setCsv] = useState<RequesterImportCsv>(null);
    const [skipUnchanged, setSkipUnchanged] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [errors, setErrors] = useState<RequesterImportCsvError[]>([]);
    const [recordTypes, setRecordTypes] = useState<RequesterImportRecordType[]>(null);
    const [configuration, setConfiguration] = useState<RequesterImportConfiguration>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const allowedKeys = useMemo(() => {
        const keys = sortProfileRecordTypes(recordTypes || []).map((type) => type.key);

        return [
            'bsn',
            ...keys.filter((key) => key === 'client_number'),
            ...keys.filter((key) => key !== 'client_number'),
        ];
    }, [recordTypes]);

    const templateHeaders = useMemo(() => {
        if (!configuration) {
            return [];
        }

        return allowedKeys
            .filter((key) => Object.hasOwn(configuration.columns, key))
            .map((key) => configuration.columns[key].column);
    }, [allowedKeys, configuration]);

    const upload = useRequesterImportUpload(organizationId);
    const validation = useRequesterImportValidation(organizationId);

    const { reset: resetValidation } = validation;

    const unchangedCount = validation.preview?.filter((row) => row.action === 'unchanged').length || 0;
    const allErrors = [...errors, ...validation.errors];
    const canSelect =
        !catalogLoading &&
        !!configuration &&
        !!recordTypes?.length &&
        !parsing &&
        !validation.validating &&
        !upload.results;

    const selectFile = useCallback(
        (selectedFile?: File) => {
            if (!canSelect) {
                return;
            }

            setCsv(null);
            setErrors([]);
            setSkipUnchanged(false);
            setFile(selectedFile || null);
            resetValidation();

            if (!selectedFile) {
                return;
            }

            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                setErrors([{ message: translate('requester_imports.errors.file_type') }]);
                return;
            }

            runFileRequest(
                () =>
                    selectedFile
                        .text()
                        .then((text) => parseRequesterImportCsv(text, allowedKeys, translate, configuration.columns)),
                {
                    onStart: () => setParsing(true),
                    onSuccess: (result) => {
                        setCsv(result);
                        setErrors(result.errors);
                    },
                    onError: () => setErrors([{ message: translate('requester_imports.errors.read_failed') }]),
                    onFinally: () => setParsing(false),
                },
            );
        },
        [allowedKeys, canSelect, configuration, resetValidation, runFileRequest, translate],
    );

    const downloadTemplate = useCallback(() => {
        fileService.downloadFile(
            'requester_imports_template.csv',
            Papa.unparse({ fields: templateHeaders, data: [] }) + '\r\n',
        );
    }, [fileService, templateHeaders]);

    const downloadPreview = useCallback(() => {
        fileService.downloadFile(
            `requester-import-preview-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'requester_import_preview',
                    file_name: file.name,
                    skip_unchanged: skipUnchanged,
                    counts: countBy(validation.preview, 'action'),
                    preview: validation.preview.map((result) => ({
                        ...result,
                        row: csv.rowNumbers[result.index],
                        bsn: csv.rows[result.index].bsn,
                        client_number: csv.rows[result.index].client_number,
                    })),
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [csv, file, fileService, organizationId, skipUnchanged, validation.preview]);

    const downloadResults = useCallback(() => {
        fileService.downloadFile(
            `requester-import-results-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'requester_import',
                    file_name: file.name,
                    completed_at: upload.completedAt,
                    skip_unchanged: upload.skipUnchanged,
                    skipped_count: upload.results.filter((row) => row.status === 'skipped').length,
                    results: upload.results.map((result) => ({
                        ...result,
                        row: csv.rowNumbers[result.index],
                        bsn: csv.rows[result.index].bsn,
                        client_number: csv.rows[result.index].client_number,
                    })),
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [csv, file, fileService, organizationId, upload.completedAt, upload.results, upload.skipUnchanged]);

    useEffect(() => {
        runCatalogRequest(
            (config) =>
                Promise.all([
                    recordTypeService.list<RequesterImportRecordType>({
                        requester_imports: 1,
                        organization_id: organizationId,
                    }),
                    requesterImportService.configs(organizationId, config),
                ]),
            {
                onStart: () => setCatalogLoading(true),
                onSuccess: ([catalog, mapping]) => {
                    setRecordTypes(catalog.data);
                    setConfiguration(mapping.data.data);
                },
                onError: pushApiError,
                onFinally: () => setCatalogLoading(false),
            },
        );
    }, [organizationId, pushApiError, recordTypeService, requesterImportService, runCatalogRequest]);

    return (
        <div data-dusk="requesterImportsUploadPage">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.REQUESTER_IMPORTS}
                    params={{ organizationId }}
                    activeExact
                    className="breadcrumb-item">
                    {translate('requester_imports.title')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('requester_imports.csv_title')}</div>
            </div>

            <input
                hidden
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                disabled={!canSelect}
                onChange={(event) => {
                    selectFile(event.target.files?.[0]);
                    event.target.value = '';
                }}
            />

            {catalogLoading ? (
                <LoadingCard />
            ) : upload.uploading ? (
                <Card
                    title={translate('requester_imports.upload.importing')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('requester_imports.buttons.stop')}
                                disabled={upload.stopping}
                                onClick={upload.stop}
                            />
                        </div>
                    }>
                    <BatchProgress
                        processed={upload.processed}
                        total={upload.total}
                        timing={upload.timing}
                        status={
                            upload.stopping
                                ? translate('requester_imports.status.stopping')
                                : translate('requester_imports.upload.progress', {
                                      processed: upload.processed,
                                      total: upload.total,
                                  })
                        }
                    />
                </Card>
            ) : upload.results ? (
                <RequesterImportResultsCard
                    csv={csv}
                    results={upload.results}
                    skipUnchanged={upload.skipUnchanged}
                    recordTypes={recordTypes}
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('requester_imports.upload.results.download')}
                                onClick={downloadResults}
                            />

                            <StateNavLink
                                name={DashboardRoutes.REQUESTER_IMPORTS}
                                params={{ organizationId }}
                                activeExact
                                className="button button-primary">
                                {translate('requester_imports.buttons.back_to_overview')}
                            </StateNavLink>
                        </div>
                    }
                />
            ) : validation.validating ? (
                <Card
                    title={translate('requester_imports.upload.validating')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('requester_imports.upload.cancel_validation')}
                                onClick={resetValidation}
                            />
                        </div>
                    }>
                    <BatchProgress
                        processed={validation.checked}
                        total={csv.rows.length}
                        timing={validation.timing}
                        status={translate('requester_imports.upload.validation_progress', {
                            checked: validation.checked,
                            total: csv.rows.length,
                        })}
                    />
                </Card>
            ) : allErrors.length > 0 ? (
                <RequesterImportErrorsCard
                    errors={allErrors}
                    footer={
                        <div className="button-group flex-center">
                            <Button text={translate('requester_imports.upload.back')} onClick={() => selectFile()} />

                            <Button
                                type="primary"
                                icon="upload"
                                text={translate('requester_imports.upload.choose_another')}
                                onClick={() => inputRef.current?.click()}
                            />
                        </div>
                    }
                />
            ) : validation.preview ? (
                <RequesterImportPreviewCard
                    csv={csv}
                    fileName={file.name}
                    preview={validation.preview}
                    recordTypes={recordTypes}
                    options={
                        unchangedCount > 0 && (
                            <div className="form">
                                <CheckboxControl
                                    narrow={true}
                                    checked={skipUnchanged}
                                    title={translate('requester_imports.upload.skip_unchanged', {
                                        unchanged: unchangedCount,
                                        remaining: validation.preview.length - unchangedCount,
                                    })}
                                    onChange={(_, checked) => setSkipUnchanged(checked)}
                                />
                            </div>
                        )
                    }
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('requester_imports.upload.back')}
                                onClick={() => {
                                    setSkipUnchanged(false);
                                    resetValidation();
                                }}
                            />

                            <Button
                                text={translate('components.batch_processing.download_preview')}
                                onClick={downloadPreview}
                            />

                            <Button
                                type="primary"
                                icon="upload"
                                text={translate('requester_imports.upload.import_records')}
                                onClick={() => upload.start(csv, validation.preview, skipUnchanged)}
                            />
                        </div>
                    }
                />
            ) : (
                <Card
                    title={translate('requester_imports.upload.select')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <StateNavLink
                                name={DashboardRoutes.REQUESTER_IMPORTS}
                                params={{ organizationId }}
                                activeExact
                                className="button button-default">
                                {translate('requester_imports.buttons.back_to_overview')}
                            </StateNavLink>

                            <Button
                                type="primary"
                                icon="check-circle-outline"
                                text={translate('requester_imports.upload.validate')}
                                disabled={!canSelect || !csv?.rows.length || !!csv.errors.length}
                                onClick={() => {
                                    setSkipUnchanged(false);
                                    validation.validate(csv);
                                }}
                            />
                        </div>
                    }>
                    {parsing ? (
                        <LoadingCard type="card-section" description={translate('requester_imports.status.parsing')} />
                    ) : recordTypes?.length === 0 ? (
                        <div className="card-section">
                            <InfoBox iconType="warning" iconColor="warning">
                                <p>{translate('requester_imports.no_enabled_columns')}</p>
                            </InfoBox>
                        </div>
                    ) : (
                        <div className="card-section">
                            <div
                                className={classNames('block block-csv', isDragOver && 'on-dragover')}
                                onDragOver={(event) => {
                                    event.preventDefault();

                                    if (canSelect) {
                                        setIsDragOver(true);
                                    }
                                }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setIsDragOver(false);
                                    selectFile(event.dataTransfer.files[0]);
                                }}>
                                <div className="csv-inner">
                                    <div
                                        className="csv-upload-btn"
                                        role="button"
                                        tabIndex={canSelect ? 0 : -1}
                                        aria-disabled={!canSelect}
                                        onClick={() => canSelect && inputRef.current?.click()}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();

                                                if (canSelect) {
                                                    inputRef.current?.click();
                                                }
                                            }
                                        }}>
                                        <div className="csv-upload-icon">
                                            <em className="mdi mdi-upload" />
                                        </div>

                                        <div className="csv-upload-text">
                                            {translate('requester_imports.buttons.choose_file')}
                                            <br />
                                            <span>{translate('requester_imports.drop_file')}</span>
                                        </div>
                                    </div>

                                    <div className="button-group flex-center">
                                        <Button
                                            icon="file-table-outline"
                                            disabled={!canSelect}
                                            text={translate('requester_imports.buttons.template')}
                                            onClick={downloadTemplate}
                                        />

                                        <Button
                                            type="primary"
                                            icon="upload"
                                            disabled={!canSelect}
                                            text={translate('requester_imports.buttons.choose_file')}
                                            onClick={() => inputRef.current?.click()}
                                        />
                                    </div>

                                    {file && csv && (
                                        <div className="csv-upload-actions">
                                            <div className="block block-file">
                                                <div className="block-file-details">
                                                    <div className="file-icon">
                                                        <em className="mdi mdi-file-document-outline" />
                                                    </div>

                                                    <div className="file-details">
                                                        <div className="file-name">{file.name}</div>
                                                        <div className="file-size">{fileSize(file.size)}</div>
                                                    </div>

                                                    <div
                                                        className="file-remove mdi mdi-close"
                                                        role="button"
                                                        tabIndex={0}
                                                        aria-label={translate('requester_imports.buttons.remove_file')}
                                                        onClick={() => selectFile()}
                                                        onKeyDown={(event) => {
                                                            if (event.key === 'Enter' || event.key === ' ') {
                                                                event.preventDefault();
                                                                selectFile();
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <InfoBox>
                                                <p>
                                                    {translate('requester_imports.parsed', {
                                                        count: csv.rows.length,
                                                        file: file.name,
                                                    })}
                                                </p>
                                            </InfoBox>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}

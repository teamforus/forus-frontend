import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Papa from 'papaparse';
import { countBy } from 'lodash';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageVoucherPasses from '../../../hooks/permissions/useCanManageVoucherPasses';
import useTranslate from '../../../hooks/useTranslate';
import useLatestRequest from '../../../hooks/useLatestRequest';
import usePushApiError from '../../../hooks/usePushApiError';
import { useVoucherPassService } from '../../../services/VoucherPassService';
import { useFileService } from '../../../services/FileService';
import { VoucherPassConfiguration } from '../../../props/models/VoucherPass';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import Card from '../../elements/card/Card';
import { Button } from '../../elements/button/Button';
import InfoBox from '../../elements/info-box/InfoBox';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import BatchProgress from '../../../modules/batch-progress/BatchProgress';
import { fileSize } from '../../../helpers/string';
import { VoucherPassCsv, VoucherPassCsvError } from './types';
import { parseVoucherPassCsv } from './helpers/parseVoucherPassCsv';
import useVoucherPassValidation from './hooks/useVoucherPassValidation';
import useVoucherPassUpload from './hooks/useVoucherPassUpload';
import VoucherPassOverviewCard from './elements/VoucherPassOverviewCard';
import VoucherPassErrorsCard from './elements/VoucherPassErrorsCard';

export default function VoucherPassesUpload() {
    const organization = useActiveOrganization();
    const allowed = useCanManageVoucherPasses();

    return allowed ? (
        <VoucherPassesUploadContent key={organization.id} organizationId={organization.id} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function VoucherPassesUploadContent({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runFileRequest = useLatestRequest();
    const runCatalogRequest = useLatestRequest();

    const fileService = useFileService();
    const passService = useVoucherPassService();

    const [file, setFile] = useState<File>(null);
    const [parsing, setParsing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [csv, setCsv] = useState<VoucherPassCsv>(null);
    const [skipUnchanged, setSkipUnchanged] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [errors, setErrors] = useState<VoucherPassCsvError[]>([]);
    const [configuration, setConfiguration] = useState<VoucherPassConfiguration>(null);

    const inputRef = useRef<HTMLInputElement>(null);

    const templateHeaders = useMemo(() => {
        return Object.values(configuration?.columns || {}).map((column) => column.column);
    }, [configuration]);

    const upload = useVoucherPassUpload(organizationId);
    const validation = useVoucherPassValidation(organizationId);

    const { reset: resetValidation } = validation;

    const unchangedCount = validation.preview?.filter((row) => row.action === 'unchanged').length || 0;
    const allErrors = [...errors, ...validation.errors];
    const canSelect = !catalogLoading && !!configuration && !parsing && !validation.validating && !upload.results;

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
                setErrors([{ message: translate('voucher_passes.errors.file_type') }]);
                return;
            }

            runFileRequest(
                () => selectedFile.text().then((text) => parseVoucherPassCsv(text, configuration, translate)),
                {
                    onStart: () => setParsing(true),
                    onSuccess: (result) => {
                        setCsv(result);
                        setErrors(result.errors);
                    },
                    onError: () => setErrors([{ message: translate('voucher_passes.errors.read') }]),
                    onFinally: () => setParsing(false),
                },
            );
        },
        [canSelect, configuration, resetValidation, runFileRequest, translate],
    );

    const downloadTemplate = useCallback(() => {
        fileService.downloadFile(
            'voucher_passes_template.csv',
            Papa.unparse({ fields: templateHeaders, data: [] }) + '\r\n',
        );
    }, [fileService, templateHeaders]);

    const downloadPreview = useCallback(() => {
        fileService.downloadFile(
            `voucher-pass-preview-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'voucher_pass_preview',
                    file_name: file.name,
                    skip_unchanged: skipUnchanged,
                    counts: countBy(validation.preview, 'action'),
                    preview: validation.preview.map((result) => ({
                        ...result,
                        row: csv.rowNumbers[result.index],
                        input: csv.rows[result.index],
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
            `voucher-pass-results-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'voucher_pass_import',
                    file_name: file.name,
                    completed_at: upload.completedAt,
                    skip_unchanged: upload.skipUnchanged,
                    counts: countBy(upload.results, 'status'),
                    results: upload.results.map((result) => ({
                        ...result,
                        row: csv.rowNumbers[result.index],
                        input: csv.rows[result.index],
                    })),
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [csv, file, fileService, organizationId, upload.completedAt, upload.results, upload.skipUnchanged]);

    useEffect(() => {
        runCatalogRequest((config) => passService.configs(organizationId, config), {
            onSuccess: (response) => setConfiguration(response.data.data),
            onError: pushApiError,
            onFinally: () => setCatalogLoading(false),
        });
    }, [organizationId, passService, pushApiError, runCatalogRequest]);

    const overviewLink = (primary = false) => (
        <StateNavLink
            name={DashboardRoutes.VOUCHER_PASSES}
            params={{ organizationId }}
            activeExact
            className={primary ? 'button button-primary' : 'button button-default'}>
            {translate('voucher_passes.buttons.overview')}
        </StateNavLink>
    );

    return (
        <div data-dusk="voucherPassesUploadPage">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.VOUCHER_PASSES}
                    params={{ organizationId }}
                    activeExact
                    className="breadcrumb-item">
                    {translate('voucher_passes.title')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('voucher_passes.upload_title')}</div>
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
                    title={translate('voucher_passes.upload.importing')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('voucher_passes.buttons.stop')}
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
                                ? translate('voucher_passes.upload.stopping')
                                : translate('voucher_passes.upload.progress', {
                                      processed: upload.processed,
                                      total: upload.total,
                                  })
                        }
                    />
                </Card>
            ) : upload.results ? (
                <VoucherPassOverviewCard
                    key="results"
                    csv={csv}
                    rows={upload.results}
                    fileName={file.name}
                    skipUnchanged={upload.skipUnchanged}
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('voucher_passes.buttons.download_results')}
                                onClick={downloadResults}
                            />

                            {overviewLink(true)}
                        </div>
                    }
                />
            ) : validation.validating ? (
                <Card
                    title={translate('voucher_passes.upload.validating')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('voucher_passes.buttons.cancel_validation')}
                                onClick={resetValidation}
                            />
                        </div>
                    }>
                    <BatchProgress
                        processed={validation.checked}
                        total={csv.rows.length}
                        timing={validation.timing}
                        status={translate('voucher_passes.upload.progress', {
                            processed: validation.checked,
                            total: csv.rows.length,
                        })}
                    />
                </Card>
            ) : allErrors.length > 0 ? (
                <VoucherPassErrorsCard
                    errors={allErrors}
                    footer={
                        <div className="button-group flex-center">
                            <Button text={translate('voucher_passes.buttons.back')} onClick={() => selectFile()} />

                            <Button
                                type="primary"
                                icon="upload"
                                text={translate('voucher_passes.buttons.another')}
                                onClick={() => inputRef.current?.click()}
                            />
                        </div>
                    }
                />
            ) : validation.preview ? (
                <VoucherPassOverviewCard
                    key="preview"
                    csv={csv}
                    rows={validation.preview.map((row) => ({ ...row, status: row.action }))}
                    estimated
                    fileName={file.name}
                    options={
                        unchangedCount > 0 && (
                            <div className="form">
                                <CheckboxControl
                                    narrow={true}
                                    checked={skipUnchanged}
                                    title={translate('voucher_passes.upload.skip', {
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
                                text={translate('voucher_passes.buttons.back')}
                                onClick={() => {
                                    setSkipUnchanged(false);
                                    resetValidation();
                                }}
                            />

                            <Button
                                text={translate('voucher_passes.buttons.download_preview')}
                                onClick={downloadPreview}
                            />

                            <Button
                                type="primary"
                                icon="upload"
                                text={translate('voucher_passes.buttons.confirm')}
                                onClick={() => upload.start(csv, validation.preview, skipUnchanged)}
                            />
                        </div>
                    }
                />
            ) : (
                <Card
                    title={translate('voucher_passes.upload.select')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            {overviewLink()}

                            <Button
                                type="primary"
                                icon="check-circle-outline"
                                text={translate('voucher_passes.buttons.validate')}
                                disabled={!canSelect || !csv?.rows.length || !!csv.errors.length}
                                onClick={() => {
                                    setSkipUnchanged(false);
                                    validation.validate(csv);
                                }}
                            />
                        </div>
                    }>
                    {parsing ? (
                        <LoadingCard type="card-section" description={translate('voucher_passes.upload.parsing')} />
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
                                            {translate('voucher_passes.buttons.choose')}
                                            <br />
                                            <span>{translate('voucher_passes.upload.drop')}</span>
                                        </div>
                                    </div>

                                    <div className="button-group flex-center">
                                        <Button
                                            icon="file-table-outline"
                                            text={translate('voucher_passes.buttons.template')}
                                            disabled={!canSelect}
                                            onClick={downloadTemplate}
                                        />

                                        <Button
                                            type="primary"
                                            icon="upload"
                                            text={translate('voucher_passes.buttons.choose')}
                                            disabled={!canSelect}
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
                                                        aria-label={translate('voucher_passes.buttons.remove')}
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
                                                    {translate('voucher_passes.upload.parsed', {
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

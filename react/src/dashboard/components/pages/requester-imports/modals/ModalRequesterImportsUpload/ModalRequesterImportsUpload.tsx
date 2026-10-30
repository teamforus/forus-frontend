import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import Papa from 'papaparse';
import useTranslate from '../../../../../hooks/useTranslate';
import useLatestRequest from '../../../../../hooks/useLatestRequest';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import useCanManageRequesterImports from '../../../../../hooks/permissions/useCanManageRequesterImports';
import { fileSize } from '../../../../../helpers/string';
import { useFileService } from '../../../../../services/FileService';
import { RequesterImportRecordType } from '../../../../../props/models/RequesterImportRow';
import { ModalState } from '../../../../../modules/modals/context/ModalContext';
import { parseRequesterImportCsv } from './helpers/parseRequesterImportCsv';
import { RequesterImportCsv, RequesterImportCsvError } from './types';
import useRequesterImportUpload from './hooks/useRequesterImportUpload';
import RequesterImportUploadResults from './elements/RequesterImportUploadResults';
import TableTopScroller from '../../../../elements/tables/TableTopScroller';
import CSVProgressBar from '../../../../elements/csv-progress-bar/CSVProgressBar';
import Modal from '../../../../modals/elements/Modal';

export default function ModalRequesterImportsUpload({
    modal,
    organizationId,
    recordTypes,
    onChanged,
}: {
    modal: ModalState;
    organizationId: number;
    recordTypes: RequesterImportRecordType[];
    onChanged: () => void;
}) {
    const translate = useTranslate();
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();
    const runLatestRequest = useLatestRequest();

    const fileService = useFileService();

    const [file, setFile] = useState<File>(null);
    const [parsing, setParsing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [csv, setCsv] = useState<RequesterImportCsv>(null);
    const [fileErrors, setFileErrors] = useState<RequesterImportCsvError[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);

    const allowedKeys = useMemo(() => {
        return ['bsn', ...recordTypes.map((type) => type.key)];
    }, [recordTypes]);

    const upload = useRequesterImportUpload(csv, organizationId, onChanged);
    const { progress, validated, results, stopping, run, stop } = upload;

    const busy = parsing ? 'parsing' : upload.busy;
    const errors = [...fileErrors, ...upload.errors];
    const canRetry = results.some(({ status }) => status === 'failed' || status === 'unsubmitted');

    const completed =
        !busy &&
        results.length > 0 &&
        results.every(({ status }) => ['created', 'updated', 'unchanged'].includes(status));

    const closeModal = useCallback(() => {
        if (!stop()) {
            modal.close();
        }
    }, [modal, stop]);

    const selectFile = useCallback(
        (selectedFile?: File) => {
            if (busy || completed) {
                return;
            }

            setCsv(null);
            setFileErrors([]);
            setFile(selectedFile || null);

            if (!selectedFile) {
                return;
            }

            if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
                setFileErrors([{ message: translate('requester_imports.errors.file_type') }]);
                return;
            }

            runLatestRequest(async () => parseRequesterImportCsv(await selectedFile.text(), allowedKeys, translate), {
                onStart: () => setParsing(true),
                onSuccess: (result) => {
                    setCsv(result);
                    setFileErrors(result.errors);
                },
                onError: () => setFileErrors([{ message: translate('requester_imports.errors.read_failed') }]),
                onFinally: () => setParsing(false),
            });
        },
        [allowedKeys, busy, completed, runLatestRequest, translate],
    );

    const downloadTemplate = useCallback(() => {
        fileService.downloadFile(
            'requester_imports_template.csv',
            Papa.unparse({ fields: allowedKeys, data: [] }) + '\r\n',
        );
    }, [allowedKeys, fileService]);

    useEffect(() => {
        if (organization?.id !== organizationId || !canManageRequesterImports) {
            closeModal();
        }
    }, [busy, canManageRequesterImports, closeModal, organization, organizationId]);

    return (
        <Modal
            modal={{ ...modal, close: closeModal }}
            className="modal-bulk-upload"
            title={translate('requester_imports.csv_title')}
            footerClassName="text-center"
            body={
                <div className="modal-body form">
                    <div
                        className={classNames('block', 'block-csv', isDragOver && 'on-dragover')}
                        onDragOver={(event) => {
                            event.preventDefault();
                            if (!busy && !completed) {
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
                            <input
                                hidden
                                ref={inputRef}
                                type="file"
                                accept=".csv,text/csv"
                                disabled={!!busy}
                                onChange={(event) => {
                                    selectFile(event.target.files?.[0]);
                                    event.target.value = '';
                                }}
                            />
                            {!busy && !results.length && (
                                <>
                                    <div
                                        className="csv-upload-btn"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => inputRef.current?.click()}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                inputRef.current?.click();
                                            }
                                        }}>
                                        <div className="csv-upload-icon">
                                            <div className="mdi mdi-upload" />
                                        </div>
                                        <div className="csv-upload-text">
                                            {translate('requester_imports.buttons.choose_file')}
                                            <br />
                                            <span>{translate('requester_imports.drop_file')}</span>
                                        </div>
                                    </div>
                                    <div className="button-group flex-center">
                                        <button
                                            className="button button-default"
                                            type="button"
                                            onClick={downloadTemplate}>
                                            <em className="mdi mdi-file-table-outline icon-start" />
                                            {translate('requester_imports.buttons.template')}
                                        </button>
                                        <button
                                            className="button button-primary"
                                            type="button"
                                            onClick={() => inputRef.current?.click()}>
                                            <em className="mdi mdi-upload icon-start" />
                                            {translate('requester_imports.buttons.choose_file')}
                                        </button>
                                    </div>
                                </>
                            )}
                            {file && !busy && !results.length && (
                                <div className="csv-upload-actions">
                                    <div
                                        className={classNames('block', 'block-file', errors.length > 0 && 'has-error')}>
                                        <div className="block-file-details">
                                            <div className="file-icon">
                                                <div
                                                    className={classNames('mdi', {
                                                        'mdi-close-circle': errors.length > 0,
                                                        'mdi-check-circle': !errors.length && validated,
                                                        'mdi-file-document-outline': !errors.length && !validated,
                                                    })}
                                                />
                                            </div>
                                            <div className="file-details">
                                                <div className="file-name">{file.name}</div>
                                                <div className="file-size">{fileSize(file.size)}</div>
                                            </div>
                                            {!busy && (
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
                                            )}
                                        </div>
                                    </div>
                                    {csv && !results.length && (
                                        <p>
                                            {translate('requester_imports.parsed', {
                                                count: csv.rows.length,
                                                file: file.name,
                                            })}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div role="status" aria-live="polite">
                                {busy === 'parsing' && <p>{translate('requester_imports.status.parsing')}</p>}
                                {(busy === 'validating' || busy === 'uploading' || validated || results.length > 0) && (
                                    <div className={classNames('csv-upload-progress', !busy && 'done')}>
                                        <div
                                            className={classNames(
                                                'csv-upload-icon',
                                                !busy && results.length > 0 && !completed && 'csv-upload-icon-warning',
                                            )}>
                                            <div
                                                className={classNames('mdi', {
                                                    'mdi-loading': !!busy,
                                                    'mdi-check': !busy && (completed || !results.length),
                                                    'mdi-alert-circle-outline':
                                                        !busy && results.length > 0 && !completed,
                                                })}
                                            />
                                        </div>
                                        <CSVProgressBar
                                            progressBar={completed ? 100 : progress}
                                            status={
                                                stopping
                                                    ? translate('requester_imports.status.stopping')
                                                    : busy === 'uploading'
                                                      ? translate('requester_imports.status.uploading')
                                                      : busy === 'validating'
                                                        ? translate('requester_imports.status.validating')
                                                        : completed
                                                          ? translate('requester_imports.status.completed')
                                                          : results.length
                                                            ? translate('requester_imports.status.results')
                                                            : translate('requester_imports.valid')
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {csv && results.length > 0 && (
                        <RequesterImportUploadResults csv={csv} results={results} busy={!!busy} />
                    )}
                    {errors.length > 0 && (
                        <div className="modal-section" role="alert">
                            <TableTopScroller>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{translate('requester_imports.labels.row')}</th>
                                            <th>{translate('requester_imports.labels.column')}</th>
                                            <th>{translate('requester_imports.labels.error')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {errors.map((error, index) => (
                                            <tr key={index}>
                                                <td>{error.row || '-'}</td>
                                                <td>{error.column || '-'}</td>
                                                <td>{error.message}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableTopScroller>
                        </div>
                    )}
                </div>
            }
            footer={
                <>
                    {(busy || !results.length || canRetry) && (
                        <button
                            className="button button-default"
                            type="button"
                            onClick={closeModal}
                            disabled={stopping}>
                            {upload.busy
                                ? translate('requester_imports.buttons.stop')
                                : results.length
                                  ? translate('requester_imports.buttons.close')
                                  : translate('requester_imports.buttons.cancel')}
                        </button>
                    )}
                    <div className="flex-grow" />
                    {!busy && results.length > 0 && !completed && (
                        <button
                            className="button button-default"
                            type="button"
                            onClick={() => inputRef.current?.click()}>
                            {translate('requester_imports.buttons.choose_file')}
                        </button>
                    )}
                    {completed || (!busy && results.length > 0 && !canRetry) ? (
                        <button className="button button-primary" type="button" onClick={closeModal}>
                            {translate('requester_imports.buttons.close')}
                        </button>
                    ) : (
                        <button
                            className="button button-primary"
                            type="button"
                            disabled={
                                !!busy || !csv?.rows.length || !!csv.errors.length || (!!results.length && !canRetry)
                            }
                            onClick={() => run()}>
                            {results.length
                                ? translate('requester_imports.buttons.retry_remaining')
                                : translate('requester_imports.buttons.import')}
                        </button>
                    )}
                </>
            }
        />
    );
}

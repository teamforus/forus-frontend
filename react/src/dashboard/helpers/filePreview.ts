import FileModel from '../props/models/File';

const PDF_EXTENSIONS = ['pdf'];
const IMAGE_EXTENSIONS = ['png', 'jpeg', 'jpg'];
const PREVIEW_EXTENSIONS = [...IMAGE_EXTENSIONS, ...PDF_EXTENSIONS];
const REIMBURSEMENT_PROOF_TYPE = 'reimbursement_proof';

const normalizeFileExtension = (ext?: string) => {
    return (ext || '').toLowerCase();
};

const isPreviewableExtension = (ext?: string) => {
    return PREVIEW_EXTENSIONS.includes(normalizeFileExtension(ext));
};

const isImageExtension = (ext?: string) => {
    return IMAGE_EXTENSIONS.includes(normalizeFileExtension(ext));
};

const isPdfExtension = (ext?: string) => {
    return PDF_EXTENSIONS.includes(normalizeFileExtension(ext));
};

const usesReimbursementPreview = (file?: FileModel) => {
    return file?.type === REIMBURSEMENT_PROOF_TYPE;
};

const getReimbursementPreviewUrl = (file?: FileModel) => {
    return !usesReimbursementPreview(file)
        ? undefined
        : file?.preview?.sizes?.thumbnail || file?.preview?.sizes?.medium || file?.preview?.sizes?.large;
};

const usesPdfPreviewPages = (file?: FileModel) => {
    return file?.uses_pdf_preview ?? false;
};

const hasPdfPreviewPages = (file?: FileModel) => {
    return file?.has_pdf_preview_pages ?? false;
};

const canPreviewFile = (file?: FileModel) => {
    return usesPdfPreviewPages(file) ? true : isPreviewableExtension(file?.ext);
};

export {
    IMAGE_EXTENSIONS,
    PREVIEW_EXTENSIONS,
    canPreviewFile,
    getReimbursementPreviewUrl,
    hasPdfPreviewPages,
    isImageExtension,
    isPdfExtension,
    isPreviewableExtension,
    normalizeFileExtension,
    usesReimbursementPreview,
    usesPdfPreviewPages,
};

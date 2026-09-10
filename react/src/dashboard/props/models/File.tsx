import Media from './Media';

export default interface File {
    uid: string;
    type?: string;
    ext?: string;
    size?: string;
    original_name?: string;
    uses_pdf_preview: boolean;
    has_pdf_preview_pages: boolean;
    preview?: Media | null;
}

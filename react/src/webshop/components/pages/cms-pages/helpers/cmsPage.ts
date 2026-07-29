import ImplementationPage from '../../../../props/models/ImplementationPage';

export function shouldShowCmsPageDefaultContent(page: ImplementationPage): boolean {
    return page.description_position !== 'replace' || !page.description_html;
}

export function getElementAncestors(element: HTMLElement): Array<HTMLElement> {
    if (!element.parentElement) {
        return [];
    }

    return [element.parentElement, ...getElementAncestors(element.parentElement)];
}

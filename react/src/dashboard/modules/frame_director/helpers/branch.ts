import type { FDItem } from '../types';

export function resolveAncestorKeys(parentKey: string | null | undefined, elements: Array<FDItem>): Set<string> {
    const ancestors = new Set<string>();
    let nextParentKey = parentKey ?? null;

    while (nextParentKey && !ancestors.has(nextParentKey)) {
        ancestors.add(nextParentKey);
        nextParentKey = elements.find((element) => element.key === nextParentKey)?.parentKey ?? null;
    }

    return ancestors;
}

export function resolveDescendantKeys(parentKey: string, elements: Array<FDItem>): Set<string> {
    const descendants = new Set<string>();
    let hasNewDescendant = true;

    while (hasNewDescendant) {
        hasNewDescendant = false;

        elements.forEach((element) => {
            if (!element.parentKey || descendants.has(element.key)) {
                return;
            }

            if (element.parentKey === parentKey || descendants.has(element.parentKey)) {
                descendants.add(element.key);
                hasNewDescendant = true;
            }
        });
    }

    return descendants;
}

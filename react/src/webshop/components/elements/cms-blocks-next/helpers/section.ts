import { CSSProperties } from 'react';
import classNames from 'classnames';
import { ImplementationCmsBlockValue } from '../../../../props/models/ImplementationCmsBlock';
import { stringValue } from './values';

export function cmsSectionClassName(values: Record<string, ImplementationCmsBlockValue> = {}): string {
    const sectionSpacing = stringValue(values.section_spacing);

    return classNames(
        sectionSpacing === 'none' && 'section-cms-next-spacing-none',
        sectionSpacing === 'no_top' && 'section-cms-next-spacing-no-top',
        sectionSpacing === 'no_bottom' && 'section-cms-next-spacing-no-bottom',
    );
}

export function cmsSectionStyle(values: Record<string, ImplementationCmsBlockValue> = {}): CSSProperties | undefined {
    const sectionBackgroundColor = stringValue(values.section_background_color);

    return sectionBackgroundColor ? { backgroundColor: sectionBackgroundColor } : undefined;
}

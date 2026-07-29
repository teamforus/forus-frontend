import { toString as stringValue } from 'lodash';
import { ImplementationCmsBlockValue } from '../../../../props/models/ImplementationCmsBlock';

export { stringValue };

export function valueIsTrue(value: ImplementationCmsBlockValue | undefined): boolean {
    return value === true || value === 1 || value === '1';
}

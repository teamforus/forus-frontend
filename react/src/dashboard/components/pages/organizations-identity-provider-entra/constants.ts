import { LabelType } from '../../elements/label/Label';

export const outcomeLabels: Record<string, string> = {
    success: 'organizations_identity_provider_entra.ui.successful',
    failure: 'organizations_identity_provider_entra.ui.failed',
    conflict: 'organizations_identity_provider_entra.ui.conflict',
};

export const outcomeTypes: Record<string, LabelType> = {
    success: 'success',
    failure: 'danger',
    conflict: 'warning',
};

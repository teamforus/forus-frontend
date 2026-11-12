import { ResponseErrorData } from '../../../../props/ApiResponses';
import { SponsorIdentityRecordsPayload } from '../../../../services/SponsorIdentitesService';

export default function mapProfileRecordErrors(
    errors: ResponseErrorData | undefined,
    records: SponsorIdentityRecordsPayload['records'],
): ResponseErrorData {
    const fields = new Map<string, string[]>();

    for (const [attribute, messages] of Object.entries(errors || {})) {
        const index = attribute.match(/^records\.(\d+)(?:\.|$)/)?.[1];
        const key = index === undefined ? attribute : records[Number(index)]?.record_type_key || attribute;

        fields.set(key, [...(fields.get(key) || []), ...messages]);
    }

    return Object.fromEntries(fields);
}

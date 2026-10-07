import { AppConfigProp } from '../../dashboard/services/ConfigService';

export default function isFundDigIdAvailable(appConfigs: AppConfigProp, tvsConfigured?: boolean): boolean {
    return Boolean(appConfigs?.digid && (!appConfigs.digid_tvs || tvsConfigured));
}

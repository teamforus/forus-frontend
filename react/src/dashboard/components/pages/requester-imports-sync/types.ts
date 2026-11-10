import { RequesterImportSyncOutcome } from '../../../props/models/RequesterImportRow';

export type RequesterImportSyncResult =
    | RequesterImportSyncOutcome
    | {
          id: number;
          bsn: string;
          profile_id: number | null;
          status: 'skipped';
      };

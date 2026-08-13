import { createContext } from 'react';

export interface FrameDirectorInternalItemContextValue {
    itemKey: string;
    rootKey: string;
}

export const frameDirectorInternalItemContext = createContext<FrameDirectorInternalItemContextValue | null>(null);

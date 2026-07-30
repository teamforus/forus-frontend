import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type TrackCmsBlockUpload = <T>(upload: Promise<T>) => Promise<T>;

const CmsBlockUploadContext = createContext<TrackCmsBlockUpload | null>(null);

export function useTrackCmsBlockUpload() {
    const trackUpload = useContext(CmsBlockUploadContext);

    if (!trackUpload) {
        throw new Error('CmsBlockUploadProvider is missing');
    }

    return trackUpload;
}

export function useCmsBlockUploadManager() {
    const [pendingUploads, setPendingUploads] = useState(0);

    const trackUpload = useCallback(<T,>(upload: Promise<T>): Promise<T> => {
        setPendingUploads((count) => count + 1);

        void upload.then(
            () => setPendingUploads((count) => count - 1),
            () => setPendingUploads((count) => count - 1),
        );

        return upload;
    }, []);

    return {
        trackUpload,
        hasPendingUploads: pendingUploads > 0,
    };
}

export function CmsBlockUploadProvider({
    children,
    trackUpload,
}: {
    children: ReactNode;
    trackUpload: TrackCmsBlockUpload;
}) {
    return <CmsBlockUploadContext.Provider value={trackUpload}>{children}</CmsBlockUploadContext.Provider>;
}

import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import File from '../../props/models/File';
import { useFileService } from '../FileService';
import { hasPdfPreviewPages } from '../../helpers/filePreview';

export default function useFilePdfPreviewArchive(file: File) {
    const fileService = useFileService();

    const [pages, setPages] = useState<Array<{ page: number; url: string }>>([]);
    const [failed, setFailed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let canceled = false;
        const objectUrls: Array<string> = [];

        setPages([]);
        setFailed(false);

        if (!hasPdfPreviewPages(file)) {
            setLoading(false);

            return;
        }

        setLoading(true);

        fileService
            .downloadPreviewArchive(file)
            .then(async (res) => {
                const zip = await JSZip.loadAsync(res.data);
                const entries = Object.entries(zip.files)
                    .flatMap(([name, entry]) => {
                        const match = name.match(/^pages\/(\d+)\.jpg$/);

                        return match && !entry.dir ? [{ entry, page: Number(match[1]) }] : [];
                    })
                    .sort((left, right) => left.page - right.page);

                const loadedPages = await Promise.all(
                    entries.map(async ({ entry, page }) => {
                        const content = await entry.async('arraybuffer');
                        const blob = new Blob([content], { type: 'image/jpeg' });
                        const url = URL.createObjectURL(blob);

                        objectUrls.push(url);

                        return { page, url };
                    }),
                );

                if (canceled) {
                    objectUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));

                    return;
                }

                setPages(loadedPages);
                setLoading(false);
            })
            .catch(() => {
                if (canceled) {
                    return;
                }

                setFailed(true);
                setLoading(false);
            });

        return () => {
            canceled = true;
            objectUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [file, fileService]);

    return { failed, loading, pages };
}

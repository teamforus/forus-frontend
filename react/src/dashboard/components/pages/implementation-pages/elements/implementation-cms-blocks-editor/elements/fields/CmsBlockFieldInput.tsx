import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImplementationCmsBlockField } from '../../../../../../../props/models/ImplementationCmsBlockConfig';
import { ImplementationCmsBlockValue } from '../../../../../../../props/models/ImplementationCmsBlock';
import MarkdownEditor from '../../../../../../elements/forms/markdown-editor/MarkdownEditor';
import SelectControl from '../../../../../../elements/select-control/SelectControl';
import ColorPickerControl from '../../../../../../elements/forms/controls/ColorPickerControl';
import ToggleControl from '../../../../../../elements/forms/controls/ToggleControl';
import PhotoSelector from '../../../../../../elements/photo-selector/PhotoSelector';
import Media from '../../../../../../../props/models/Media';
import { useMediaService } from '../../../../../../../services/MediaService';
import usePushApiError from '../../../../../../../hooks/usePushApiError';
import useTranslate from '../../../../../../../hooks/useTranslate';
import { CmsBlockFieldChangeEvent } from '../../types';
import { useTrackCmsBlockUpload } from '../../context/CmsBlockUploadContext';

export default function CmsBlockFieldInput({
    field,
    id,
    value,
    valueHtml,
    media,
    placeholder,
    onChange,
    onChangeMedia,
}: {
    field: ImplementationCmsBlockField;
    id?: string;
    value: ImplementationCmsBlockValue;
    valueHtml?: string;
    media?: Media | null;
    placeholder: string;
    onChange: (e: CmsBlockFieldChangeEvent) => void;
    onChangeMedia?: (media: Media | null) => void;
}) {
    const [mediaInputRevision, setMediaInputRevision] = useState(0);
    const mediaRequestRef = useRef(0);

    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const mediaService = useMediaService();
    const trackUpload = useTrackCmsBlockUpload();

    const numberOptions = useMemo(() => {
        const min = Number(field.min);
        const max = Number(field.max);

        if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
            return [];
        }

        return Array.from({ length: max - min + 1 }, (_, index) => {
            const value = min + index;

            return { value, name: value };
        });
    }, [field.max, field.min]);

    const selectOptions = useMemo(() => {
        return field.options?.map((option) => ({
            value: option.value,
            name: option.name ?? String(option.value ?? ''),
        }));
    }, [field.options]);

    const selectMedia = useCallback(
        (mediaFile: Blob) => {
            const request = ++mediaRequestRef.current;
            const upload = mediaService
                .store(field.media_type || 'implementation_block_media', mediaFile, ['thumbnail', 'public', 'large'])
                .then((res) => {
                    if (request === mediaRequestRef.current) {
                        onChangeMedia?.(res.data.data);
                    }
                });

            void trackUpload(upload).catch((error) => {
                if (request === mediaRequestRef.current) {
                    setMediaInputRevision((revision) => revision + 1);
                    pushApiError(error);
                }
            });
        },
        [field.media_type, mediaService, onChangeMedia, pushApiError, trackUpload],
    );

    const resetMedia = useCallback(() => {
        mediaRequestRef.current += 1;
        onChangeMedia?.(null);
    }, [onChangeMedia]);

    useEffect(() => {
        return () => {
            mediaRequestRef.current += 1;
        };
    }, []);

    if (field.control === 'select' && selectOptions?.length) {
        return (
            <SelectControl
                id={id}
                propKey={'value'}
                allowSearch={false}
                value={value ?? field.default ?? null}
                onChange={(value: ImplementationCmsBlockValue) => onChange({ value })}
                options={selectOptions}
            />
        );
    }

    if (field.type === 'text' && field.control === 'textarea') {
        return (
            <textarea
                id={id}
                className="form-control"
                rows={4}
                value={(value as string) || ''}
                onChange={(e) => onChange({ value: e.target.value })}
                placeholder={placeholder}
            />
        );
    }

    if (field.type === 'text' || field.type === 'url') {
        return (
            <input
                id={id}
                className="form-control"
                type="text"
                value={(value as string) || ''}
                onChange={(e) => onChange({ value: e.target.value })}
                placeholder={placeholder}
            />
        );
    }

    if (field.type === 'markdown') {
        return (
            <MarkdownEditor
                value={valueHtml || ''}
                onChangeRaw={(e) => onChange({ value: e.data.content ?? '', valueHtml: e.data.content_html ?? '' })}
                placeholder={placeholder}
            />
        );
    }

    if (field.type === 'color') {
        return (
            <ColorPickerControl
                id={id}
                value={typeof value === 'string' ? value : ''}
                placeholder={placeholder}
                onChange={(value) => onChange({ value })}
            />
        );
    }

    if (field.type === 'number') {
        if (numberOptions.length > 0) {
            return (
                <SelectControl
                    id={id}
                    propKey={'value'}
                    value={value ?? field.default ?? null}
                    onChange={(value: number) => onChange({ value })}
                    options={numberOptions}
                />
            );
        }

        return (
            <input
                id={id}
                className="form-control"
                type="number"
                min={field.min}
                max={field.max}
                value={(value as number) ?? ''}
                onChange={(e) => onChange({ value: e.target.value ? Number(e.target.value) : null })}
                placeholder={placeholder}
            />
        );
    }

    if (field.type === 'media') {
        return (
            <PhotoSelector
                key={mediaInputRevision}
                id={id}
                type={field.media_type || 'implementation_block_media'}
                selectPhoto={selectMedia}
                thumbnail={media?.sizes?.thumbnail}
                resetPhoto={value ? resetMedia : null}
                resetPhotoText={translate('components.implementation_cms_block_editor.buttons.remove_media')}
            />
        );
    }

    if (field.type === 'boolean') {
        return (
            <ToggleControl
                id={id}
                checked={value === true || value === 1 || value === '1'}
                onChange={(_, checked) => onChange({ value: Boolean(checked) })}
            />
        );
    }

    return <input id={id} className="form-control" type="text" disabled={true} value={field.type} />;
}

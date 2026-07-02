import React, { useCallback } from 'react';
import ImageCropper, {
    ImageCropperPresetValue,
} from '../../../../../dashboard/components/elements/image_cropper/ImageCropper';
import { ModalPhotoCropperFile } from '../ModalPhotoCropper';

export default function ModalPhotoCropperControl({
    file,
    onCropperChange,
}: {
    file: ModalPhotoCropperFile;
    onCropperChange: (file: ModalPhotoCropperFile, previewData: Blob) => void;
}) {
    const onChange = useCallback(
        (presets: ImageCropperPresetValue[]) => {
            const blob = presets[0]?.blob;

            if (!blob) {
                return;
            }

            onCropperChange(file, blob);
        },
        [file, onCropperChange],
    );

    return (
        <ImageCropper
            file={file.file}
            presets={[{ width: null, height: null }]}
            initialWidth={100}
            onChange={onChange}
        />
    );
}

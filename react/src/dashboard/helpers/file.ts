const IMAGE_CROPPER_ADDITIONAL_EXTENSIONS = ['svg', 'webp'];

const formatFileExtensionsForAccept = (extensions: Array<string>): Array<string> => {
    return extensions.map((extension) => `.${extension}`);
};

const getImageCropperAcceptedFiles = (sourceExtensions: Array<string>): Array<string> => {
    return formatFileExtensionsForAccept([...new Set([...sourceExtensions, ...IMAGE_CROPPER_ADDITIONAL_EXTENSIONS])]);
};

export { formatFileExtensionsForAccept, getImageCropperAcceptedFiles };

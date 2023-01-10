const dataURItoBlob = (dataURI) => {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {
        type: mimeString
    });
};

const createObjectURL = (file) => {
    return (
        window.URL || window.webkitURL || window.mozURL || window.msURL
    ).createObjectURL(file);
};

const fit = (contains) => {
    return (parentWidth, parentHeight, childWidth, childHeight, scale = 1, offsetX = 0.5, offsetY = 0.5) => {
        const childRatio = childWidth / childHeight
        const parentRatio = parentWidth / parentHeight
        let width = parentWidth * scale
        let height = parentHeight * scale

        if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
            height = width / childRatio
        } else {
            width = height * childRatio
        }

        return {
            width,
            height,
            offsetX: (parentWidth - width) * offsetX,
            offsetY: (parentHeight - height) * offsetY
        }
    }
};

const contain = (offsetX, offsetY, width, height) => {
    return fit(true)(offsetX, offsetY, width, height);
};

const cover = (offsetX, offsetY, width, height) => {
    return fit(false)(offsetX, offsetY, width, height);
};

function ImageConvertor(file) {
    const converter = {};
    const imageObj = new Image();

    converter.isReady = false;
    converter.createObjectURL = createObjectURL;

    converter.originalRatio = () => imageObj.width / imageObj.height;
    converter.base64ToBlob = (base64) => converter.dataURItoBlob(base64);

    converter.resize = (x, y, fillStyle = "#ffffff") => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = x;
        canvas.height = y;

        if (fillStyle) {
            context.fillStyle = fillStyle;
            context.fillRect(0, 0, x, y);
        }

        const position = cover(canvas.width, canvas.height, imageObj.width, imageObj.height);

        context.drawImage(imageObj, position.offsetX, position.offsetY, position.width, position.height);

        return canvas.toDataURL('image/jpeg');
    };

    converter.rotate = (imageType = "image/jpg", degrees = 0) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = imageObj.height;
        canvas.height = imageObj.width;

        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(degrees * Math.PI / 180);

        context.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);
        context.rotate(-(degrees * Math.PI / 180));
        context.translate(-canvas.width / 2, -canvas.height / 2);

        return canvas.toDataURL(imageType);
    };

    converter.resizeToBlob = (x, y) => dataURItoBlob(converter.resize(x, y));
    converter.dataURItoBlob = dataURItoBlob;

    converter.getImage = () => imageObj;
    converter.getBlob = () => imageObj;

    return new Promise((done, error) => {
        imageObj.onload = () => {
            converter.isReady = true;
            setTimeout(() => done(converter), 100);
        };

        imageObj.onerror = (e) => error(e);

        imageObj.src = converter.createObjectURL(file);
    });
};

module.exports = ['$q', function ($q) {
    return new (function (value) {
        this.cover = cover;
        this.dataURItoBlob = dataURItoBlob;
        this.createObjectURL = createObjectURL;
        this.instance = (image) => $q((done, error) => ImageConvertor(image).then(done, error));
    });
}];
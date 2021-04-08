let AwesomeQR = require('../libs/AwesomeQrCode');

let dataURItoBlob = (dataURI) => {
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

let createObjectURL = (file) => {
    return (
        window.URL || window.webkitURL || window.mozURL || window.msURL
    ).createObjectURL(file);
};

let maxImageSize = (file, callback) => {
    // Make sure the file is an image and the file API is supported.
    if( !file.type.match(/image.*/)) {
        callback(file);
        return;
    }

    var img    = document.createElement("img"),
        reader = new FileReader();

    // Wait until the image is loaded (after file reader is loaded)
    img.onload = function() {
        var canvas   = document.createElement('canvas'),
            max_size = 2000,
            width    = img.width,
            height   = img.height,
            ctx      = null,
            dataurl  = null;

        // If the image fits within the constraints, use the original image
        if( width <= max_size && height <= max_size ) {
            callback(file);
            return;

        // Calculate the new image size
        } else {
            if(width > height) {
                height *= max_size / width;
                width = max_size;
            } else {
                width *= max_size / height;
                height = max_size;
            }
        }

        // Use canvas to resize the image.
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        if(canvas.toBlob) {
            canvas.toBlob(function(blob) {
                if(blob && blob.type === file.type) {
                    callback(blob);
                } else {
                    callback(file);
                }
            }, file.type, 80);
        } else {
            callback(file);
        }
        return;
    };

    // Wait until after the file reader has loader.
    reader.onload = function(e) { img.src = e.target.result; };
    reader.readAsDataURL(file);
};

function ImageConvertor(file) {
    let converter = {};
    let imageObj = new Image();
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    converter.isReady = false;

    converter.createObjectURL = createObjectURL;

    converter.originalRatio = () => {
        return imageObj.width / imageObj.height;
    };

    converter.base64ToBlob = (base64) => {
        return converter.dataURItoBlob(base64);
    };

    converter.resize = (x, y) => {
        canvas.width = x;
        canvas.height = y;

        let aspect = x / y;

        if (imageObj.width > imageObj.height) {
            var sourceWidth = imageObj.height * aspect;
            var sourceHeight = imageObj.height;

            var sourceX = (imageObj.width - imageObj.height) / 2;
            var sourceY = 0;
        } else if (imageObj.width < imageObj.height) {
            var sourceWidth = imageObj.width;
            var sourceHeight = imageObj.width * aspect;

            var sourceX = 0;
            var sourceY = (imageObj.height - imageObj.width) / 2;
        } else {
            var sourceWidth = imageObj.width;
            var sourceHeight = imageObj.width;

            var sourceX = 0;
            var sourceY = 0;
        }

        var destWidth = x;
        var destHeight = y;
        var destX = 0;
        var destY = 0;

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, destWidth, destHeight);

        context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

        return canvas.toDataURL('image/jpeg');
    };

    converter.resizeToBlob = (x, y) => {
        return dataURItoBlob(converter.resize(x, y));
    };

    converter.dataURItoBlob = dataURItoBlob;

    converter.getImage = () => {
        return imageObj;
    };
    converter.getBlob = () => {
        return imageObj;
    };

    return new Promise(done => {
        imageObj.onload = () => {
            converter.isReady = true;

            setTimeout(() => {
                done(converter);
            }, 100);
        };

        imageObj.src = converter.createObjectURL(file);
    });
};

module.exports = ['$q', function($q) {
    return new (function(value) {
        this.dataURItoBlob = dataURItoBlob;
        this.createObjectURL = createObjectURL;
        this.instance = (image) => $q(done => ImageConvertor(image).then(done));
        this.makeQrImage = (value, type = 'voucher') => {
            return new Promise((resolve, reject) => {
                AwesomeQR.create({
                    text: JSON.stringify({ type, value }),
                    size: 400,
                    margin: 15,
                    dotScale: 0.8,
                    autoColor: true,
                    callback: (data) => {
                        if (data === undefined) {
                            console.error("failed to generate the QR code");
                            reject("failed to generate the QR code");
                        } else {
                            resolve(data);
                        }
                    },
                })
            });
        };
    });
}];
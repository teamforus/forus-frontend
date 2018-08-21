module.exports = ['$q', function($q) {
    return new(function() {
        var html = window.document.querySelector('html');

        this.scan = function() {
            html.style.cssText = 'background: transparent !important;';

            return $q(function(resolve, reject) {
                function runScanner(argument) {
                    if (typeof QRScanner == 'undefined') {
                        let content = prompt("Qr-code content");

                        if (content == null) {
                            reject("You have not provided any input.");
                        }

                        return resolve(content);
                    }

                    html.style.cssText = 'background: transparent !important;';
                    document.querySelector('body').style.cssText = 'background: transparent !important;';

                    // For the best user experience, make sure the user is ready to give your app
                    // camera access before you show the prompt. On iOS, you only get one chance.
                    // show the prompt
                    QRScanner.prepare(onDone);

                    function onDone(err, status) {
                        if (err) {
                            // here we can handle errors and clean up any loose ends.
                            console.error(err);
                        }

                        if (status.authorized) {
                            html.style.display = 'none';

                            setTimeout(function() {
                                html.style.display = 'block';
                            }, 1);
                            // W00t, you have camera access and the scanner is initialized.
                            // QRscanner.show() should feel very fast.


                            // Start a scan. Scanning will continue until something is detected or
                            // `QRScanner.cancelScan()` is called.
                            QRScanner.scan(displayContents);

                            function displayContents(err, text) {
                                if (err) {
                                    reject(err);
                                    // an error occurred, or the scan was canceled (error code `6`)
                                } else {
                                    navigator.vibrate(250);
                                    resolve(text);
                                }
                            }

                            // Make the webview transparent so the video preview is visible behind it.
                            QRScanner.show();
                            // Be sure to make any opaque HTML elements transparent here to avoid
                            // covering the video.

                        } else if (status.denied) {
                            reject("You have denied permission request for the camera.");
                            // The video preview will remain black, and scanning is disabled. We can
                            // try to ask the user to change their mind, but we'll have to send them
                            // to their device settings with `QRScanner.openSettings()`.
                        } else {
                            reject("Camera permission is required.");
                            // we didn't get permission, but we didn't get permanently denied. (On
                            // Android, a denial isn't permanent unless the user checks the "Don't
                            // ask again" box.) We can ask again at the next relevant opportunity.
                        }
                    }
                };

                if (typeof QRScanner == 'undefined') {
                    setTimeout(runScanner, 1000);
                } else {
                    runScanner();
                }
            });
        };

        this.cancelScan = function() {
            if (typeof QRScanner == 'undefined') {
                return;
            }
            
            QRScanner.hide();
            QRScanner.cancelScan();
            QRScanner.destroy();

            html.style.cssText = 'background: #fff !important;';
            document.querySelector('body').style.cssText = 'background: #fff !important;';
        }
    })();
}]
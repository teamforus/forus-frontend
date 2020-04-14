let PdfPreviewDirective = function($scope, $element) {
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    let currPage = 1; //Pages are 1-based not 0-based
    let numPages = 0;
    let thePDF = null;

    $scope.rawPdfFile.arrayBuffer().then(buffer => {
        // Asynchronous download of PDF
        var loadingTask = pdfjsLib.getDocument({
            data: buffer
        });

        loadingTask.promise.then(function(pdf) {
            thePDF = pdf;

            // Fetch the first page
            numPages = pdf.numPages;

            let fetchPage = function(fetchPageNumber) {
                thePDF.getPage(fetchPageNumber).then(page => {
                    let scale = 1.5;
                    let viewport = page.getViewport({
                        scale: scale
                    });

                    let canvas = document.createElement('canvas');

                    $element.append(canvas);

                    // Prepare canvas using PDF page dimensions
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);

                    renderTask.promise.then(function() {
                        if (++currPage < numPages) {
                            fetchPage(currPage)
                        }
                    });
                });
            };

            fetchPage(currPage);
        }, function(reason) {
            // PDF loading error
            console.error(reason);
        });
    });
};

module.exports = () => {
    return {
        scope: {
            rawPdfFile: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$scope',
            '$element',
            PdfPreviewDirective
        ],
        template: '<div class="block block-pdf-preview"></div>'
    };
};
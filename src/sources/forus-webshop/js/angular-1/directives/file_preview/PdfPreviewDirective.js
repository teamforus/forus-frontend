const PdfPreviewDirective = function($scope, $element) {
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    const pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    // pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

    new Response($scope.rawPdfFile).arrayBuffer().then((data) => {
        pdfjsLib.getDocument({ data }).promise.then(function(pdf) {
            // Fetch the first page
            let currPage = 1; // Pages are 1-based not 0-based
            let numPages = pdf.numPages;

            const fetchPage = function(fetchPageNumber) {
                pdf.getPage(fetchPageNumber).then((page) => {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');

                    $element.append(canvas);

                    // Prepare canvas using PDF page dimensions
                    const canvasContext = canvas.getContext('2d');

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    page.render({ canvasContext, viewport }).promise.then(() => {
                        if (++currPage < numPages) {
                            fetchPage(currPage)
                        }
                    });
                });
            };

            fetchPage(currPage);
        }, console.error);
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
        template: '<div class="file-pdf"></div>'
    };
};
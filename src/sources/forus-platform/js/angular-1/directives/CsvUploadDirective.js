let CsvUploadDirective = function(
    $q,
    $scope,
    $rootScope,
    $element,
    $timeout,
    PrevalidationService,
    ProgressFakerService
) {
    let $ctrl = this;
    let csvParser = {};
    let input = false;

    let setProgress = function(progress) {
        $scope.progressBar = progress;
        
        if (progress < 100) {
            $scope.progressStatus = "Uploading...";
        } else {
            $scope.progressStatus = "Completed";
        }
    };

    $scope.progressBar = 0;
    $scope.progressStatus = "";

    let bind = function() {
        csvParser.selectFile = function(e) {
            e && (e.preventDefault() & e.stopPropagation());
            
            if (input && input.remove) {
                input.remove();
            }

            input = document.createElement('input');
            input.setAttribute("type", "file");
            input.style.display = 'none';

            input.addEventListener('change', function(e) {
                var target_file = this.files[0];

                new $q(function(resolve, reject) {
                    Papa.parse(target_file, {
                        complete: resolve
                    });
                }).then(function(results) {
                    var header = results.data[0];
                    var body = results.data.slice(1);
                    var bsnPos = header.indexOf('bsn');

                    if (bsnPos === -1) {
                        return alert("Bsn ecord is required.");
                    }

                    csvParser.data = body.map(function(val, key) {
                        let row = {};

                        header.forEach((hVal, hKey) => {
                            row[hVal] = val[hKey];
                        });

                        return row;
                    });

                    csvParser.csvFile = target_file;
                    csvParser.progress = 1;
                }, console.log);
            });

            $element[0].appendChild(input);

            input.click();
        };

        csvParser.uploadToServer = function(e) {
            e && (e.preventDefault() & e.stopPropagation());
            
            csvParser.progress = 2;

            var submitData = JSON.parse(JSON.stringify(csvParser.data));

            PrevalidationService.submitData(
                submitData
            ).then(function(response) {
                ProgressFakerService.make(1000).on('progress', function(progress) {
                    $timeout(function() {
                        setProgress(progress);
                        csvParser.progressBar = progress;
                    }, 0);
                }).on('end', function(progress) {
                    $timeout(function() {
                        setProgress(100);
                        csvParser.progressBar = 100;
                        csvParser.progress = 3;

                        $rootScope.$broadcast('csv:uploaded', true);
                    }, 0);
                });
            });
        }
    };

    let init = function() {
        input = false;
        csvParser = {};
        csvParser.progress = 0;

        bind();

        $scope.csvParser = csvParser;
    };

    init();

    $scope.reset = function() {
        init();
    };
};

module.exports = () => {
    return {
        scope: {
            text: '=',
            button: '=',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$q',
            '$scope',
            '$rootScope',
            '$element',
            '$timeout',
            'PrevalidationService',
            'ProgressFakerService',
            CsvUploadDirective
        ],
        templateUrl: 'assets/tpl/directives/csv-upload.html' 
    };
};
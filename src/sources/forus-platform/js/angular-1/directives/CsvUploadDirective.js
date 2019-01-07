let CsvUploadDirective = function(
    $q,
    $scope,
    $rootScope,
    $element,
    $timeout,
    PrevalidationService
) {
    let csvParser = {};
    let input = false;
    let dataChunkSize = 100;

    let setProgress = function(progress) {
        $scope.progressBar = progress;

        if (progress < 100) {
            $scope.progressStatus = "Uploading...";
        } else {
            $scope.progressStatus = "Completed";
        }
    };

    let chunk = function(arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    }

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
                csvParser.uploadFile(this.files[0]);
            });

            $element[0].appendChild(input);

            input.click();
        };

        csvParser.uploadFile = (file) => {
            if (file.name.indexOf('.csv') != file.name.length - 4) {
                return;
            }

            new $q(function(resolve, reject) {
                Papa.parse(file, {
                    complete: resolve
                });
            }).then(function(results) {
                var header = results.data[0];
                var body = results.data.slice(1);

                csvParser.data = body.reduce(function(result, val, key) {
                    let row = {};

                    header.forEach((hVal, hKey) => {
                        if (val[hKey] && val[hKey] != '') {
                            row[hVal] = val[hKey];
                        }
                    });

                    if (_.isEmpty(row)) {
                        return result;
                    }

                    if ($scope.fund) {
                        row[$scope.fund.key + '_eligible'] = 'Ja';
                    }

                    result.push(row);
                    return result;
                }, []);

                csvParser.csvFile = file;
                csvParser.progress = 1;
                csvParser.isValid = csvParser.validateFile();
            }, console.log);
        };

        csvParser.validateFile = function() {
            let invalidRows = csvParser.data.filter(row => {
                let keys = Object.keys(row);

                return keys.filter((key) => $scope.recordTypeKeys.indexOf(key) == -1).length > 0;
            });

            return invalidRows.length === 0;
        };

        csvParser.uploadToServer = function(e) {
            e && (e.preventDefault() & e.stopPropagation());

            if (!csvParser.isValid) {
                return false;
            }

            csvParser.progress = 2;

            var submitData = chunk(JSON.parse(JSON.stringify(
                csvParser.data
            )), dataChunkSize);

            var chunksCount = submitData.length;
            var currentChunkNth = 0;
            
            setProgress(0);

            let uploadChunk = function(data) {
                PrevalidationService.submitData(data, $scope.fund.id).then(function() {
                    currentChunkNth++;
                    setProgress((currentChunkNth / chunksCount) * 100);

                    if (currentChunkNth == chunksCount) {
                        $timeout(function() {
                            csvParser.progressBar = 100;
                            csvParser.progress = 3;

                            $rootScope.$broadcast('csv:uploaded', true);
                        }, 0);
                    } else {
                        uploadChunk(submitData[currentChunkNth]);
                    }
                }, (res) => {
                    if (res.status == 422 && res.data.errors.data) {
                        return alert(res.data.errors.data[0]);
                    }

                    alert('Unknown error.');
                });
            };

            uploadChunk(submitData[currentChunkNth]);
        }

        $element.on('dragenter dragover', function(e) {
            e.preventDefault()
            $element.addClass('on-dragover');
        });

        $element.on('dragleave', function(e) {
            e.preventDefault()
            $element.removeClass('on-dragover');
        });

        $element.on('drop dragdrop', function(e) {
            e.preventDefault();
            $element.removeClass('on-dragover');

            let file = e.originalEvent.dataTransfer.files[0];

            csvParser.uploadFile(file);
        });
    };

    let init = function() {
        input = false;
        csvParser = {};
        csvParser.progress = 0;

        bind();

        $scope.recordTypeKeys = $scope.recordTypes.map(recordType => recordType.key);
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
            fund: '=',
            button: '=',
            recordTypes: '='
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
            CsvUploadDirective
        ],
        templateUrl: 'assets/tpl/directives/csv-upload.html'
    };
};
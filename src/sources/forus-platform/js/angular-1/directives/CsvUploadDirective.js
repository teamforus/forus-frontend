let sprintf = require('sprintf-js').sprintf;

let CsvUploadDirective = function(
    $q,
    $state,
    $scope,
    $rootScope,
    $element,
    $timeout,
    PrevalidationService,
    FundService,
    ModalService,
    FileService
) {
    let csvParser = {};
    let input = false;
    let dataChunkSize = 100;

    let setProgress = function(progress) {
        $scope.progressBar = progress;

        if (progress < 100) {
            $scope.progressStatus = "Aan het uploaden...";
        } else {
            $scope.progressStatus = "Klaar!";
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
            input.setAttribute("accept", ".csv");
            input.style.display = 'none';

            input.addEventListener('change', function(e) {
                csvParser.uploadFile(this.files[0]);
            });

            $element[0].appendChild(input);

            input.click();
        };

        csvParser.setError = (error, file, progress = 1) => {
            csvParser.error = Array.isArray(error) ? error : [error];
            csvParser.csvFile = file;
            csvParser.progress = progress;
        };

        csvParser.setWarning = (warning) => {
            csvParser.warning = Array.isArray(warning) ? warning : [warning];
        };

        csvParser.uploadFile = (file) => {
            if (file.name.indexOf('.csv') != file.name.length - 4) {
                return csvParser.setError("Please select a .csv file.");
            }

            new $q(function(resolve, reject) {
                Papa.parse(file, {
                    complete: resolve
                });
            }).then(function(results) {
                let csvData = results.data = results.data.filter(item => !!item);
                let header = csvData.length > 0 ? csvData[0] : [];
                let body = csvData.length > 0 ? csvData.slice(1) : [];
                let fundRecordKey = $scope.fund.key + '_eligible';

                if (header.length == 0) {
                    return csvParser.setError("Your .csv file is empty, please check your csv file.", file);
                }

                if (body.length == 0) {
                    return csvParser.setError("Your .csv file has an empty body, please check your csv file.", file);
                }

                if ($scope.fund && (header.indexOf(fundRecordKey) !== -1)) {
                    header.unshift(fundRecordKey);

                    body.forEach(row => {
                        row.unshift('Ja');
                    });
                }

                let invalidRecordTypes = header.filter(recordTypeKey => {
                    return $scope.recordTypeKeys.indexOf(recordTypeKey) == -1;
                });

                let missingRecordTypes = $scope.fund.csv_required_keys.filter(recordTypeKey => {
                    return header.indexOf(recordTypeKey) == -1;
                });

                let optionalRecordTypes = header.filter(recordTypeKey => {
                    return $scope.fund.csv_required_keys.indexOf(recordTypeKey) == -1;
                });

                if (invalidRecordTypes.length > 0) {
                    return csvParser.setError(sprintf(
                        "Your .csv file has following invalid record types: '%s'",
                        invalidRecordTypes.join("', '")
                    ), file);
                }

                if (missingRecordTypes.length > 0) {
                    return csvParser.setError(sprintf(
                        "Your .csv file is missing following records which are mandatory for the fund '%s': '%s'",
                        $scope.fund.name,
                        missingRecordTypes.join("', '")
                    ), file);
                }

                if (optionalRecordTypes.length > 0) {
                    csvParser.setWarning([
                        sprintf(
                            "Your .csv file seems to by just fine, but it also contains " +
                            "records of types not required nor used by \"%s\" fund.",
                            $scope.fund.name,
                        ),
                        "It's advised to check if you actually need them.",
                        sprintf(
                            "This is the list of the redundant records from the file: \"%s\".",
                            optionalRecordTypes.join("', '")
                        ),
                    ]);
                }

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

                    result.push(row);
                    return result;
                }, []);

                let invalidRows = csvParser.validateFile(csvParser.data);

                if (invalidRows.length > 0) {
                    return csvParser.setError([
                        "Following errors where found in your csv file:"
                    ].concat(invalidRows), file);
                }

                csvParser.csvFile = file;
                csvParser.progress = 1;
                csvParser.isValid = invalidRows.length === 0;
            }, console.error);
        };

        csvParser.validateFile = function(data) {
            return data.map((row, row_key) => {
                let rowRecordKeys = Object.keys(row);

                let missingRecordTypes = $scope.fund.csv_required_keys.filter(recordTypeKey => {
                    return rowRecordKeys.indexOf(recordTypeKey) == -1;
                });

                if (missingRecordTypes.length > 0) {
                    return sprintf(
                        'Line %s: has missing mandatory records: "%s"',
                        row_key + 1,
                        missingRecordTypes.join('", "')
                    );
                }

                return null;
            }).filter(error => error !== null);
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
                PrevalidationService.submitCollection(data, $scope.fund.id).then(function() {
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

    $scope.downloadSample = () => {
        FileService.downloadFile(
            ($scope.fund.key || 'fund') + '_sample.csv',
            FundService.sampleCSV($scope.fund)
        );
    };

    $scope.addSinglePrevalidation = () => {
        ModalService.open('createPrevalidation', {
            fund: $scope.fund,
            recordTypes: $scope.recordTypes,
            onClose: () => {
                $state.reload();
            }
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
            '$state',
            '$scope',
            '$rootScope',
            '$element',
            '$timeout',
            'PrevalidationService',
            'FundService',
            'ModalService',
            'FileService',
            CsvUploadDirective
        ],
        templateUrl: 'assets/tpl/directives/csv-upload.html'
    };
};
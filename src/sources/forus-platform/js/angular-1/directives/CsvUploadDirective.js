let sprintf = require('sprintf-js').sprintf;

let CsvUploadDirective = function(
    $q,
    $scope,
    $rootScope,
    $element,
    $timeout,
    PrevalidationService,
    FundService,
    ModalService,
    HelperService,
    FileService,
    PushNotificationsService
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

    let compareRecordRowRecordsSort = (a, b) => {
        return a.key > b.key ? 1 : (a.key < b.key ? -1 : 0);
    };

    let compareRecordRowRecords = (first_records, second_records) => {
        // first_records.sort(compareRecordRowRecordsSort);
        // second_records.sort(compareRecordRowRecordsSort);

        if (first_records.length !== second_records.length) {
            return false;
        }

        return first_records.filter((record, key) => {
            return (record.key === second_records[key].key) &&
                (record.value == second_records[key].value);
        }).length === first_records.length;
    };

    let compareRecordRows = (first_row, second_row) => {
        return (first_row.primaryKey === second_row.primaryKey) &&
            (first_row.primaryKeyValue === second_row.primaryKeyValue) &&
            (compareRecordRowRecords(first_row.records, second_row.records));
    };

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
                return csvParser.setError("Kies eerst een .csv bestand.");
            }

            new $q(function(resolve, reject) {
                Papa.parse(file, {
                    complete: resolve
                });
            }).then(function(results) {
                let csvData = results.data = results.data.filter(item => !!item);
                let header = csvData.length > 0 ? csvData[0] : [];

                let body = (csvData.length > 0 ? csvData.slice(1) : []).filter(row => {
                    return Array.isArray(row) && row.filter(item => !!item).length > 0;
                });

                let fundRecordKey = $scope.fund.csv_required_keys.filter(key => {
                    return key.indexOf('_eligible') === key.length - 9;
                })[0] || false;

                let fundRecordKeyValue = ($scope.fund.criteria.filter(
                    criteria => criteria.record_type_key == fundRecordKey && criteria.operator == '='
                )[0] || false).value || false;

                if (header.length == 0) {
                    return csvParser.setError("Het .csv bestand is leeg, controleer het bestand.", file);
                }

                if (body.length == 0) {
                    return csvParser.setError("Het .csv bestand heeft kolomnamen maar geen inhoud, controleer de inhoud.", file);
                }

                if ($scope.fund && fundRecordKey && fundRecordKeyValue &&
                    (header.indexOf(fundRecordKey) === -1)) {
                    header.unshift(fundRecordKey);

                    body.forEach(row => {
                        row.unshift(fundRecordKeyValue);
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
                        "Het .csv bestand heeft de volgende ongeldige eigenschappen: '%s'",
                        invalidRecordTypes.join("', '")
                    ), file);
                }

                if (missingRecordTypes.length > 0) {
                    return csvParser.setError(sprintf(
                        "In het .csv bestand ontbreken eigenschappen die verplicht zijn voor dit fonds '%s': '%s'",
                        $scope.fund.name,
                        missingRecordTypes.join("', '")
                    ), file);
                }

                if (optionalRecordTypes.length > 0) {
                    csvParser.setWarning([
                        sprintf(
                            "In het .csv bestand zijn eigenschappen toegevoegd die " +
                            "optioneel zijn voor \"%s\" fonds.",
                            $scope.fund.name,
                        ),
                        "Controleer of deze eigenschappen echt nodig zijn voor de toekenning.",
                        sprintf(
                            "De volgende eigenschappen zijn optioneel: \"%s\".",
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
                        "Volgende problemen zijn opgetreden bij dit .csv bestand:"
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
                        'Lijn %s: heet ontbrekende verplichte eigenschappen: "%s"',
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

            PushNotificationsService.success('Loading...', 'Loading existing pre validations to check for duplicates!', 'download-outline');
            $scope.csvParser.comparing = true;

            HelperService.recursiveLeacher((page/* , last_page, concurrency */) => {
                return PrevalidationService.list({
                    per_page: 1000,
                    page: page,
                    state: 'pending',
                    fund_id: $scope.fund.id
                });
            }, 5).then(data => {
                $timeout(() => {
                    PushNotificationsService.success('Comparing...', 'Pre validations loaded! Comparing with .csv...', 'timer-sand');
                }, 1);

                // required for the notification to work
                $timeout(() => csvParser.compareCsvAndDb(data), 1000);
            });
        }

        csvParser.compareCsvAndDb = (data) => {
            let primaryKey = $scope.fund.csv_primary_key;

            let csvRecords = csvParser.data.map(row => ({
                primaryKey: primaryKey,
                primaryKeyValue: row[primaryKey],
                records: Object.keys(row).map(key => ({
                    key: key,
                    value: row[key],
                }))
            }));

            let dbRecords = data.filter(row => row.state == 'pending').map(row => ({
                primaryKey: primaryKey,
                primaryKeyValue: row.records.filter(
                    record => record.key === primaryKey
                )[0].value || null,
                records: row.records.map(record => ({
                    key: record.key,
                    value: record.value,
                }))
            }));

            csvRecords.forEach((row) => {
                row.records.sort(compareRecordRowRecordsSort);
            });

            dbRecords.forEach((row) => {
                row.records.sort(compareRecordRowRecordsSort);
            });

            let dbPrimaryKeys = dbRecords.map(row => row.primaryKeyValue);
            let fullyMathingRecords = [];
            let updatedRecords = [];


            // csv records with primary key present in db
            let overlappingRecords = csvRecords.filter(row => {
                return dbPrimaryKeys.indexOf(row.primaryKeyValue) !== -1;
            });

            let newRecords = csvRecords.filter(row => {
                return dbPrimaryKeys.indexOf(row.primaryKeyValue) === -1;
            });

            overlappingRecords.forEach(row => {
                if (dbRecords.filter(dbRow => compareRecordRows(row, dbRow)).length >= 1) {
                    fullyMathingRecords.push(row);
                } else {
                    updatedRecords.push(row);
                }
            });

            let fullOverlappingRecordKeys = fullyMathingRecords.map(record => record.primaryKeyValue);
            let newAndOverlappingRecords = csvParser.data.filter(row => {
                return fullOverlappingRecordKeys.indexOf(row[primaryKey]) === -1;
            });

            $scope.csvParser.comparing = false;

            if (updatedRecords.length === 0) {
                if (newRecords.length > 0) {
                    PushNotificationsService.success('Uploading!', 'No duplicates found, uploading ' + newRecords.length + ' new pre validations(s)...');
                    csvParser.startUploadingToServer(newAndOverlappingRecords);
                } else {
                    PushNotificationsService.success('Nothing to upload!', 'No new prevalidations or updates found in your .csv file...');
                    csvParser.progressBar = 100;
                    csvParser.progress = 3;
                    setProgress(100);
                    $rootScope.$broadcast('csv:uploaded', true);
                }
            } else {
                let items = updatedRecords.map(row => ({
                    value: row.primaryKeyValue,
                    label_on: "Update",
                    label_off: "Skip",
                    button_all: "Update all",
                }));

                ModalService.open('duplicatesPicker', {
                    hero_title: "Duplicate prevalidations detected.",
                    hero_subtitle: [
                        `Are you sure you want to create extra prevalidations for these ${items.length} uid(s)`,
                        "that already have a prevalidation?"
                    ],
                    items: items,
                    onConfirm: (items) => {
                        let skipUids = items.filter(item => !item.model).map(item => item.value);
                        let updateUids = items.filter(item => item.model).map(item => item.value);

                        newAndOverlappingRecords = newAndOverlappingRecords.filter(csvRow => {
                            return skipUids.indexOf(csvRow[primaryKey]) === -1;
                        });

                        if (newAndOverlappingRecords.length > 0) {
                            return csvParser.startUploadingToServer(newAndOverlappingRecords.filter(row => {
                                return skipUids.indexOf(row.primaryKeyValue) === -1;
                            }), updateUids).then(() => {
                                if (skipUids.length > 0) {
                                    PushNotificationsService.success('Done!', skipUids.length + ' pre validation(s) skipped!');
                                }

                                PushNotificationsService.success(
                                    'Done!',
                                    (updatedRecords.length - skipUids.length) + ' pre validation(s) updated!'
                                );

                                PushNotificationsService.success(
                                    'Done!',
                                    newRecords.length + ' new pre validation(s) created!'
                                );
                            }, console.error);
                        }

                        $timeout(() => {
                            csvParser.progressBar = 100;
                            csvParser.progress = 3;
                            setProgress(100);
                            $rootScope.$broadcast('csv:uploaded', true);

                            PushNotificationsService.success(
                                'Done!',
                                skipUids.length + ' pre validation(s) skpped, no new pre validations were added!'
                            );
                        }, 0);
                    },
                    onCancel: () => $rootScope.$broadcast('csv:uploaded', true),
                });
            }
        };

        csvParser.startUploadingToServer = (data, overwriteUids = []) => {
            return $q((resolve, reject) => {
                csvParser.progress = 2;

                var submitData = chunk(JSON.parse(JSON.stringify(data)), dataChunkSize);
                var chunksCount = submitData.length;
                var currentChunkNth = 0;

                setProgress(0);

                let uploadChunk = function(data) {
                    PrevalidationService.submitCollection(data, $scope.fund.id, overwriteUids).then(() => {
                        currentChunkNth++;
                        setProgress((currentChunkNth / chunksCount) * 100);

                        if (currentChunkNth == chunksCount) {
                            $timeout(function() {
                                csvParser.progressBar = 100;
                                csvParser.progress = 3;
                                $rootScope.$broadcast('csv:uploaded', true);

                                resolve();
                            }, 0);
                        } else {
                            uploadChunk(submitData[currentChunkNth]);
                        }
                    }, (res) => {
                        if (res.status == 422 && res.data.errors.data) {
                            return alert(res.data.errors.data[0]);
                        }

                        alert('Onbekende error.');
                        reject();
                    });
                };

                uploadChunk(submitData[currentChunkNth]);
            });
        };

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
            onPrevalidationCreated: () => {
                $rootScope.$broadcast('csv:uploaded', true);
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
            '$scope',
            '$rootScope',
            '$element',
            '$timeout',
            'PrevalidationService',
            'FundService',
            'ModalService',
            'HelperService',
            'FileService',
            'PushNotificationsService',
            CsvUploadDirective
        ],
        templateUrl: 'assets/tpl/directives/csv-upload.html'
    };
};
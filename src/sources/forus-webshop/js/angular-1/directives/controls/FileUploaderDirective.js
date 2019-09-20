let FileUploaderDirective = function(
    $timeout,
    $scope,
    $element
) {
    let input = false;
    let $dir = {};
    let accept = ['.doc', '.pdf'];
    let $dropArea = $element.find('.uploader-droparea');
    let multiple = $scope.multiple ? $scope.multiple : true;

    $dropArea.on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on('dragover dragenter', function(e) {
            $dropArea.addClass('is-dragover');
        })
        .on('dragleave dragend drop', function() {
            $dropArea.removeClass('is-dragover');
        })
        .on('drop', function(e) {
            $scope.addFiles(e.originalEvent.dataTransfer.files);
        });

    $dir.selectFile = (e) => {
        e && e.preventDefault() && e.stopPropagation();

        if (input && input.remove) {
            input.remove();
        }

        input = document.createElement('input');
        input.setAttribute("type", "file");
        input.setAttribute("accept", accept.join(','));
        input.style.display = 'none';
        
        if (multiple) {
            input.setAttribute('multiple', '');
        }

        input.addEventListener('change', function(e) {
            $scope.addFiles(e.target.files);
        });

        $element[0].appendChild(input);

        input.click();
    };

    $dir.removeFile = (file) => {
        let index = $scope.files.indexOf(file);

        if (index != -1) {
            $scope.files.splice(index, 1);
        }
    };

    let fileListToArray = (files) => {
        let filesArr = [];

        for (let index = 0; index < files.length; index++) {
            filesArr.push(files[index]);
        }

        return filesArr;
    };

    let filterValidFiles = (files) => {
        return files.filter(file => {
            let ext = file.name.split('.')[file.name.split('.').length - 1];

            return accept.indexOf('.' + ext) != -1;
        });
    };

    $scope.addFiles = (files) => {
        $timeout(() => {
            filterValidFiles(fileListToArray(files)).forEach((file) => {
                $scope.files.push(file);
            });
        }, 0);
    };

    if ($scope.accept) {
        accept = $scope.accept;
    }

    $scope.$dir = $dir;
};

module.exports = () => {
    return {
        scope: {
            files: '=',
            accept: '=',
            multiple: '@',
        },
        restrict: "EA",
        replace: true,
        controller: [
            '$timeout',
            '$scope',
            '$element',
            FileUploaderDirective
        ],
        templateUrl: 'assets/tpl/directives/controls/file-uploader.html'
    };
};
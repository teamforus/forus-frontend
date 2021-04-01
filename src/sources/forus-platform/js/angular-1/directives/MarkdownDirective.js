let MarkdownDirective = function($scope, $element, ModalService) {
    $scope.value = "";

    $element.find('.toolbar-item').on("click", function(e) {
        e.preventDefault();

        let $toolBarItem = angular.element(this);
        let $textarea = $element.find('textarea');

        if ($textarea.length) {
            replaceSelectedText(
                $textarea[0],
                $toolBarItem.data('start'),
                $toolBarItem.data('end'),
                $toolBarItem.data('markType')
            );
        }
    });

    function getInputSelection(el) {
        const start = typeof el.selectionStart == "number" ? el.selectionStart : 0;
        const end = typeof el.selectionEnd == "number" ? el.selectionEnd : 0;
        const selected = el.value.substring(start, end);

        return { start, end, selected };
    }

    function replaceSelectedText(el, start, end, type) {
        const selection = getInputSelection(el);
        const value = el.value;
        const arrayOfSelected = selection.selected.split("\n");

        let needSelectAll = true;
        let moveStartSelection = selection.start;
        let finalRes = '';
        let offsetSelection = 0;

        type = type ? type : 'text';

        if (type == 'list' && arrayOfSelected.length > 1) {
            arrayOfSelected.forEach((selectedRow, selectedRowIndex) => {
                if (start == '1. ') {
                    finalRes += (selectedRowIndex + 1) + '. ' + selectedRow + end + "\n";
                } else {
                    finalRes += start + selectedRow + end + "\n";
                }
            })

            offsetSelection = selection.end + arrayOfSelected.length * (start.length + end.length);
        } else if (type == 'custom-link' || type == 'image-link' || type == 'youtube') {
            ModalService.open('markdownCustomLink', {
                pages: $scope.pages,
                selection: selection.selected,
                type: type,
                hasDescription: type != 'youtube',
                success: (data) => {
                    let url = data.url;
                    let text = selection.selected ? selection.selected : data.description;
                    let components = ['[', text, '](', url, ')'];

                    finalRes = components.join('');
                    if (type == 'image-link') {
                        finalRes = '!' + finalRes;
                    }

                    if (selection.selected == '') {
                        needSelectAll = false;
                    } else {
                        //Leave only the dynamic components
                        delete components[1];
                    }

                    offsetSelection = selection.end + (selection.selected == '' ?
                        finalRes.length : components.join('').length);

                    $scope.value = value.slice(0, selection.start) + finalRes + value.slice(selection.end);

                    applySelection(el, needSelectAll, moveStartSelection, offsetSelection);
                }
            });
        } else {
            finalRes = start + selection.selected + end;
            offsetSelection = selection.end + start.length + (selection.selected == '' ? 0 : end.length);

            if (selection.selected == '') {
                needSelectAll = false;
            }

            if (type == 'list' || type == 'header') {
                moveStartSelection += start.length;
            }
        }

        if (offsetSelection) {
            $scope.$apply(function() {
                $scope.value = value.slice(0, selection.start) + finalRes + value.slice(selection.end);
            });

            applySelection(el, needSelectAll, moveStartSelection, offsetSelection);
        }

        $scope.onChange();
    }

    function applySelection(el, needSelectAll, moveStartSelection, offsetSelection) {
        el.focus({
            preventScroll: true
        });

        if (needSelectAll) {
            el.selectionStart = moveStartSelection;
        }

        el.selectionEnd = offsetSelection;
    }

    $scope.onChange = () => $scope.ngModel = $scope.value.replaceAll(/([ ][ ][\n])|([ ][\n])|([\n])/g, "  \n");
    $scope.value = ($scope.ngModel || '').replaceAll(/([ ][ ][\n])|([ ][\n])|([\n])/g, "\n");;
};

module.exports = () => {
    return {
        restrict: "EA",
        scope: {
            ngModel: '=',
            modal: '=',
            pages: '=',
            disabled: '@',
            extendedOptions: '='
        },
        replace: true,
        controller: [
            '$scope',
            '$element',
            'ModalService',
            MarkdownDirective
        ],
        templateUrl: 'assets/tpl/directives/markdown.html'
    };
};
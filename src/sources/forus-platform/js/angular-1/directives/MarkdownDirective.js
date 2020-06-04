let MarkdownDirective = function($scope, $element, ModalService) {
    $($element).find('.toolbar-item').unbind('click').bind('click', function(e) {
        e.preventDefault();

        let el = $(this);
        let textarea = $($element).find('textarea');

        if (textarea.length) {
            replaceSelectedText(textarea[0], el.data('start'), el.data('end'), el.data('markType'));
        }
    });

    function getInputSelection(el) {
        let start = 0,
            end = 0;

        if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
            start = el.selectionStart;
            end = el.selectionEnd;
        }

        return {
            start: start,
            end: end,
            selected: el.value.substring(start, end)
        };
    }

    function replaceSelectedText(el, start, end, type) {
        let sel = getInputSelection(el);
        let val = el.value;
        let arrayOfSelected = sel.selected.split("\n");
        let moveSelection = 0;
        let needSelectAll = true;
        let moveStartSelection = sel.start;
        let finalRes = '';

        type = type ? type : 'text';

        if (arrayOfSelected.length > 1 && type == 'list') {
            $.each(arrayOfSelected, function(i, value) {

                if (start == '1. ') {
                    finalRes += (i + 1) + '. ' + value + end + "\n";
                } else {
                    finalRes += start + value + end + "\n";
                }
            });

            moveSelection = sel.end + arrayOfSelected.length * (
                start.length + end.length
            );
        } else if (type == 'custom-link' || type == 'image-link') {
            ModalService.open('markdownCustomLink', {
                pages: $scope.pages,
                selection: sel.selected,
                type: type,
                success: (data) => {
                    let url = data.url;
                    let text = sel.selected ? sel.selected : data.description;
                    let components = ['[', text, '](', url, ')'];

                    finalRes = components.join('');
                    if (type == 'image-link') {
                        finalRes = '!' + finalRes;
                    }

                    if (sel.selected == '') {
                        needSelectAll = false;
                    } else {
                        //Leave only the dynamic components
                        delete components[1];
                    }

                    moveSelection = sel.end + (sel.selected == '' ?
                        finalRes.length : components.join('').length);

                    $scope.ngModel = val.slice(0, sel.start) + finalRes + val.slice(sel.end);

                    applySelection(el, needSelectAll, moveStartSelection, moveSelection);
                }
            });
        } else {
            finalRes = start + sel.selected + end;

            moveSelection = sel.end + start.length + (sel.selected == '' ? 0 : end.length);

            if (sel.selected == '')
                needSelectAll = false;

            if (type == 'list' || type == 'header')
                moveStartSelection += start.length;
        }

        if (moveSelection) {
            $scope.$apply(function() {
                $scope.ngModel = val.slice(0, sel.start) + finalRes + val.slice(sel.end);
            });

            applySelection(el, needSelectAll, moveStartSelection, moveSelection);
        }
    }

    function applySelection(el, needSelectAll, moveStartSelection, moveSelection) {
        el.focus({
            preventScroll: true
        });

        if (needSelectAll)
            el.selectionStart = moveStartSelection;

        el.selectionEnd = moveSelection;
    }
};

module.exports = () => {
    return {
        restrict: "EA",
        scope: {
            ngModel: '=',
            modal: '=',
            pages: '='
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
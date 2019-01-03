let MarkdownDirective = function($scope, $element) {
    $($element).find('.toolbar-item').unbind('click').bind('click', function (e) {
        e.preventDefault();

        let el = $(this),
            textarea = $($element).find('textarea');

        if(textarea.length) {
            replaceSelectedText(textarea[0], el.data('start'), el.data('end'), el.data('markType'));
        }
    });

    function getInputSelection(el) {
        let start = 0, end = 0;

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
        let sel = getInputSelection(el),
            val = el.value,
            arrayOfSelected = sel.selected.split("\n"),
            moveSelection = 0,
            needSelectAll = true,
            moveStartSelection = sel.start,
            finalRes = '';

        type = type ? type : 'text';

        if(arrayOfSelected.length > 1 && type == 'list'){

            $.each(arrayOfSelected, function (i, value) {

                if(start == '1. ') {
                    finalRes += (i + 1) + '. ' + value + end + "\n";
                }else {
                    finalRes += start + value + end + "\n";
                }
            });

            moveSelection = sel.end + arrayOfSelected.length * (start.length + end.length);
        }else{
            finalRes = start + sel.selected + end;

            moveSelection = sel.end + start.length + (sel.selected == '' ? 0 : end.length);

            if(sel.selected == '')
                needSelectAll = false;

            if(type == 'list' || type == 'header')
                moveStartSelection += start.length;
        }

        $scope.$apply(function() {
            $scope.ngModel = val.slice(0, sel.start) + finalRes + val.slice(sel.end);
        });

        el.focus();

        if(needSelectAll)
            el.selectionStart = moveStartSelection;

        el.selectionEnd = moveSelection;
    }
};

module.exports = () => {
    return {
        restrict: "EA",
        scope: {
            ngModel: '='
        },
        replace: true,
        controller: [
            '$scope',
            '$element',
            MarkdownDirective
        ],
        templateUrl: 'assets/tpl/directives/markdown.html'
    };
};
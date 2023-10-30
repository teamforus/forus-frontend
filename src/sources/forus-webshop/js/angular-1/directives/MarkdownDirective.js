const MarkdownDirective = function ($sce, $scope, $element) {
    const { $dir } = $scope;

    const observer = new MutationObserver(function (mutationsList) {
        const tables = [...mutationsList].reduce((list, mutation) => {
            if (mutation.type == 'childList') {
                return [...list, ...[...mutation.addedNodes].filter((node) => node.nodeName == 'TABLE')];
            }

            return list;
        }, []);

        tables.forEach((table) => {
            const head = table.querySelector('tHead tr');
            const headers = [...table.querySelectorAll('tHead tr th')];
            const emptyHeaders = headers.filter((th) => th.innerText == '')
            const firstRow = table.querySelector('tBody tr:first-child');

            if (emptyHeaders.length > 0 && emptyHeaders.length == headers.length) {
                [...firstRow.querySelectorAll('td')].forEach((td) => {
                    const th = document.createElement('th');
                    th.innerHTML = td.innerHTML;
                    td.replaceWith(th);
                })
                head.replaceWith(firstRow);
            }
        });
    });

    $dir.$onInit = () => {
        observer.observe($element[0], { childList: true, subtree: true });
    }

    $dir.$onDestroy = () => {
        observer.disconnect();
    }
};

module.exports = () => {
    return {
        scope: {
            align: '=',
            content: '=',
        },
        bindToController: true,
        controllerAs: '$dir',
        restrict: "EA",
        replace: true,
        controller: [
            '$sce',
            '$scope',
            '$element',
            MarkdownDirective,
        ],
        templateUrl: 'assets/tpl/directives/markdown.html',
    };
};
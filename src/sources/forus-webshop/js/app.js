require("./angular-1/angular-app");

(new MutationObserver(function (mutationsList) {
    const transformTable = (table) => {
        const head = table.querySelector('tHead tr');
        const headers = [...table.querySelectorAll('tHead tr th')].filter((th) => th.innerText == '');
        const firstRow = table.querySelector('tBody tr:first-child');

        if (headers.length > 1) {
            [...firstRow.querySelectorAll('td')].forEach((td) => {
                const th = document.createElement('th');
                th.innerHTML = td.innerHTML;
                td.replaceWith(th);
            })
            head.replaceWith(firstRow);
        }
    };

    const list = [...mutationsList].reduce((list, mutation) => {
        if (mutation.type == 'childList') {
            return [...list, ...[...mutation.addedNodes].filter((node) => node.classList?.contains('block-markdown'))];
        }

        return list;
    }, []);

    list
        .reduce((tables, node) => [...tables, ...node.querySelectorAll('table')], [])
        .forEach((table) => transformTable(table))
})).observe(document.body, { childList: true, subtree: true });
let HelperService = function($q) {
    return new (function() {
        this.recursiveLeacher = (request, concurrency = 1, page = 1, last_page = null, data = []) => {
            return $q((resolve, reject) => {
                let requests = [];
                let _concurrency = last_page === null ? 1 : Math.min(
                    concurrency,
                    Math.max((last_page - page) + 1, 1)
                );

                for (let requestIndex = 0; requestIndex < _concurrency; requestIndex++) {
                    requests.push(request(page + requestIndex, last_page, _concurrency));
                }

                return $q.all(requests).then(res => {
                    let _data = data.concat((res.reduce((arr, __data) => {
                        return arr.concat(__data.data.data);
                    }, [])));

                    if ((res[0].data.meta.last_page === last_page) && ((page + (_concurrency - 1)) >= last_page)) {
                        resolve(_data);
                    } else {
                        this.recursiveLeacher(
                            request,
                            concurrency,
                            page + _concurrency,
                            res[0].data.meta.last_page,
                            _data
                        ).then(resolve);
                    }
                }, reject);
            });
        };

        this.openInNewTab = (url) => {
            return url ? window.open(url, '_blank').focus() : null;
        };

        this.getEmailServiceProviderUrl = (email) => {
            const host = email ? email.split("@").splice(-1)[0] : '';
            const provider = typeof host === 'string' ? host.toLocaleLowerCase().trim() : null;

            const providersList = [
                'aol.com', 'fastmail.com', 'googlemail.com', 'gmail.com', 'gmx.net',
                'gmx.de', 'hotmail.com', 'icloud.com', 'inbox.com', 'mail.com', 'mail.ru',
                'me.com', 'outlook.com', 'protonmail.com', 'yahoo.com', 'yandex.ru'
            ];

            return provider && providersList.includes(provider) ? ('https://' + provider) : null;
        };

        this.isHTML = (str) => {
            var a = document.createElement('div');
            a.innerHTML = str;
          
            for (var c = a.childNodes, i = c.length; i--; ) {
                if (c[i].nodeType == 1) return true; 
            }
            
            return false;
        }

        this.createElementFromHTML = (htmlString) => {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();
            
            // Change this to div.childNodes to support multiple top-level nodes
            return div.firstChild; 
        }

        this.addTableHeader = (string) => {
            let element; 
            
            try {
                element = (angular.element(string) && angular.element(string).length) ? angular.element(string)[0] : null;
            } catch (error) {
                return null;
            }

            // Check if table or already has the thead element
            if (!element || element.tagName != 'TABLE' || element.getElementsByTagName('thead').length) {
                return null;
            }

            let tempTable   = angular.element("<table><thead><tr></tr></thead></table>")[0];
            let thead       = tempTable.querySelector('thead');
            let theadRow    = thead.querySelector('tr');

            for (let i = 0; i < element.querySelector('tbody tr').querySelectorAll('td').length; i++) {
                theadRow.innerHTML += '<th></th>';
            }

            element.insertBefore(thead, element.querySelector('tbody'));
            
            return element.outerHTML;
        }
    });
};

module.exports = [
    '$q',
    HelperService
];
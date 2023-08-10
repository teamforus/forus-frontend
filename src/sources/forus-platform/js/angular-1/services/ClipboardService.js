const ClipboardService = function ($q) {
    return new (function () {
        this.copy = function (value) {
            return $q((resolve) => {
                const el = document.createElement('textarea');

                el.value = value;
                el.setAttribute('readonly', '');
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                resolve();
            })
        };
    });
};

module.exports = [
    '$q',
    ClipboardService,
];
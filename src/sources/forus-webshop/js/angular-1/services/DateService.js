const DateService = function() {
    return new(function() {
        this.dateFormat = 'dd-MM-yyyy'
        this.datePrettyFormat = 'MMM DD, YYYY'

        this._dateParse = (date, strict = true) => {
            return moment(date, this.dateFormat.toUpperCase(), strict);
        };

        this._dateParseYmd = (date) => {
            return moment(date, 'YYYY-MM-DD');
        };

        this._dateArrayParse = (dates) => {
            return dates.map(this._dateParse);
        };

        this._dateFormat = (date) => {
            return date.format(this.dateFormat.toUpperCase());
        };

        this._dateFormatYmd = (date) => {
            return date.format('YYYY-MM-DD');
        };

        this._dateArrayFormat = (dates) => {
            return dates.map(this._dateFormat);
        };

        this._datePrettyFormat = (date) => {
            return date.format(this.datePrettyFormat);
        };

        this._frontToBack = (date) => {
            return this._dateFormatYmd(this._dateParse(date));
        };

        this._datesToRangeArray = (start_date, end_date) => {
            let _start_date = start_date.clone();
            let _dates = [];
            let _max = 999999;

            while (_start_date.isBefore(end_date)) {
                _dates.push(_start_date.clone());
                _start_date.add(1, 'days');

                if (_max-- <= 0) {
                    console.log('Posible, infinite loop?');
                    break;
                }
            };

            return _dates;
        };

        this._dateRangeArraysUniq = (ranges) => {
            let _dates = [];

            ranges.forEach(range => {
                range.forEach(date => {
                    if (_dates.indexOf(this._dateFormat(date)) == -1) {
                        _dates.push(date);
                    }
                });
            });

            return _dates;
        };

        this.diffInDays = (first, last) => {
            return this._dateParse(first).diff(this._dateParse(last), 'days');
        }
    });
};

module.exports = [
    DateService
];
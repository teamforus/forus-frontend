import { parse, format } from 'date-fns';

const DateService = function() {
    return new(function() {
        this.dateFormat = 'dd-MM-yyyy'

        this._dateParse = (date) => {
            return parse(date, this.dateFormat, new Date());
        };

        this._dateFormatYmd = (date) => {
            return format(date, 'yyyy-MM-dd');
        };

        this._frontToBack = (date) => {
            try {
                return this._dateFormatYmd(this._dateParse(date));
            } catch (e) {
                return date;
            }
        };
    });
};

module.exports = [
    DateService
];
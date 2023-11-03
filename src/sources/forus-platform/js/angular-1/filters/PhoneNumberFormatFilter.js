const phones = require('libphonenumber-js');

module.exports = [() => function (phoneNumber = '') {
    if ((typeof phoneNumber != 'string') || phoneNumber.length < 3) {
        return phoneNumber;
    }

    const parser = phones.parsePhoneNumber(phoneNumber);
    let number = '';

    for (let i = 0; i < phoneNumber.length / 3; i++) {
        number += ' ' + phoneNumber.slice(i * 3, i * 3 + 3);
    }

    return parser.isValid() ? parser.formatInternational() : number;
}];
module.exports = function() {
    return function(time, short = false) {
        if (time === 0) {
            return '-';
        }

        let minutes = time / 60;
        let hours = Math.floor(minutes / 60);
        let days = Math.floor(hours / 24);

        hours = Math.floor(hours - (days * 24));
        minutes = Math.floor((minutes - (hours * 60)) - (days * 60 * 24));

        let format = [];

        if (days > 0) {
            format.push(days + 'd');
        }

        if (hours > 0) {
            format.push(hours + 'h');
        }

        if (minutes > 0) {
            if ((time > (9 * 60)) && !short) {
                format.push(minutes.toString().padStart(2, '0') + 'm');
            } else {
                format.push(minutes + ' min');
            }
        }
        
        return format.slice(0, 2).join(' ');
    }
};
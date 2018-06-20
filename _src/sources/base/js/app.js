window.pushNotifications = new (function($node) {
    $node = $('[push-notifications]');

    var self = this;
    var notes = $node.find('.notification');
    var template = $node.find('.template');
    var shownNotes = [];
    var maxCount = 5;

    self.bind = function($note) {
        if (!$note.hasClass('shown')) {
            $note.addClass('shown');
        }

        var note = {
            note: $note
        };

        note.timeout = setTimeout(function() {
            self.deleteNotification(note);
        }, parseInt(note.note.attr('expire')) * 1);

        shownNotes.push(note);

        note.note.find('.close').unbind('click').bind('click', function() {
            self.deleteNotification(note);
        });

        if (shownNotes.length > maxCount) {
            var _note = shownNotes[0];

            self.deleteNotification(_note);
        }

        note.delete = function() {
            self.deleteNotification(note);
        }

        return note;
    };

    self.deleteNotification = function(note) {
        clearTimeout(note.timeout);
        note.note.removeClass('shown');
        shownNotes.splice(shownNotes.indexOf(note), 1);

        setTimeout(function() {
            note.note.remove();
        }, 450);
    };

    self.clear = function() {
        shownNotes.forEach((note) => {
            this.deleteNotification(note);
        });
    };

    self.init = function() {
        notes.each(function(index, note) {
            self.bind($(note));
        });
    };

    self.push = function(type, icon, text, timeout) {
        var notification = template.clone();

        notification.removeClass('template');
        notification.addClass('notification');
        notification.addClass('notification-' + type);

        notification.removeAttr('hidden');
        notification.attr('expire', timeout);
        notification.find('.text').html(text);
        
        if (icon)
            notification.find('.icon').addClass('mdi mdi-' + icon);
        else
            notification.find('.icon').remove();

        $node.find('.inner').append(notification);

        return self.bind(notification);
    };

    self.init();
})();
require("./angular-1/angular-app");

setTimeout(() => {
    $('.nano').nanoScroller({
        iOSNativeScrolling: true 
    });
    
    $('.nano.nano-scrolldown').nanoScroller({
        iOSNativeScrolling: true,
        scroll: 'bottom' 
    });
}, 500);

window.pushNotifications = new(function($node) {
    $node = $('[push-notifications]');

    var self = this;
    var notes = $node.find('.notification');
    var template = $node.find('.template');
    var shownNotes = [];
    var maxCount = 4;

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
    };

    self.deleteNotification = function(note) {
        clearTimeout(note.timeout);
        note.note.removeClass('shown');
        shownNotes.splice(shownNotes.indexOf(note), 1);

        setTimeout(function() {
            note.note.remove();
        }, 450);
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
        notification.find('.text').text(text);
        notification.find('.icon').addClass('mdi mdi-' + icon);

        $node.find('.inner').prepend(notification);

        setTimeout(function() {
            self.bind(notification);
        }, 100);
    };

    self.init();
})();

if (env_data.client_key == 'nijmegen') {
    function onPageLoaded() {

        var OFFSET_TOP = 50;

        $(window).unbind('scroll').bind('scroll', function() {
            $(".block-navbar").length && ($(".block-navbar").offset().top > OFFSET_TOP ? $(".block-navbar").addClass("top-nav-collapse") : $(".block-navbar").removeClass("top-nav-collapse"))
        });

        $('.form-label').addClass('active');
    }

    $(document).ready(function() {
        onPageLoaded();
    });
}
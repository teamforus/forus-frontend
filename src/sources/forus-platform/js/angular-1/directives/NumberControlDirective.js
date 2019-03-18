let NumberControlDirective = function($scope, $element, $attributes) {
    var limit = $attributes.ngDecimal;

    console.log('NumberControlDirective');
    function caret(node) {
        if (node.selectionStart) {
            return node.selectionStart;
        } else if (!document.selection) {
            return 0;
        }
        //node.focus();
        var c = parseInt('001', 8);
        var sel = document.selection.createRange();
        var txt = sel.text;
        var dul = sel.duplicate();
        var len = 0;
        try {
            dul.moveToElementText(node);
        } catch (e) {
            return 0;
        }
        sel.text = txt + c;
        len = (dul.text.indexOf(c));
        sel.moveStart('character', -1);
        sel.text = "";
        return len;
    }

    $element.bind('keypress', function(event) {
        var charCode = (event.which) ? event.which : event.keyCode;
        var elem = document.getElementById($element.attr("id"));
        if (charCode == 45) {
            var caretPosition = caret(elem);
            if (caretPosition == 0) {
                if ($element.val().charAt(0) != "-") {
                    if ($element.val() <= limit) {
                        $element.val("-" + $element.val());
                    }
                }
                if ($element.val().indexOf("-") != -1) {
                    event.preventDefault();
                    return false;
                }
            } else {
                event.preventDefault();
            }
        }

        if (charCode == 46) {
            if ($element.val().length > limit - 1) {
                event.preventDefault();
                return false;
            }
            if ($element.val().indexOf('.') != -1) {
                event.preventDefault();
                return false;
            }
            return true;
        }

        if (charCode != 45 && charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }

        if ($element.val().length > limit - 1) {
            event.preventDefault();
            return false;
        }

        return true;
    });
};

module.exports = () => {
    return {
        restrict: "EA",
        link: NumberControlDirective
    };
};
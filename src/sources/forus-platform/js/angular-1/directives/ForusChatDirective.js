let ForusChatDirective = function(scope, element, attributes) {
    element.append(`
        <script>
        var $zoho=$zoho || {};
        $zoho.salesiq = $zoho.salesiq || {widgetcode:"` +
            attributes.chatId +
        `", values:{},ready:function(){}};
        var d=document;
        s=d.createElement("script");
        s.type="text/javascript";
        s.id="zsiqscript";
        s.defer=true;
        s.src="https://salesiq.zoho.eu/widget";
        t=d.getElementsByTagName("script")[0];
        t.parentNode.insertBefore(s,t);
        d.write("<div id='zsiqwidget'></div>");
        </script>
    `);
};

module.exports = () => {
    return {
        restrict: "EA",
        link: ForusChatDirective
    };
};
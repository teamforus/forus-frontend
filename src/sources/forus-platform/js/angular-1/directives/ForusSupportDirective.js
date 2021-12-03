const ForusSupportDirective = function(scope, element, attributes) {
    element.append(`
        <script>    
        window.ZohoHCAsap=window.ZohoHCAsap||function(a,b) {
        ZohoHCAsap[a]=b;};(function() {
        var d=document; 
        var s=d.createElement("script");
        s.type="text/javascript";
        s.defer=true; 
        s.src="https://desk.zoho.eu/portal/api/web/inapp/` + 
            attributes.supportId + `"; 
        d.getElementsByTagName("head")[0].appendChild(s);
        })(); 
     </script>
    `);
};

module.exports = () => {
    return {
        restrict: "EA",
        link: ForusSupportDirective
    };
};
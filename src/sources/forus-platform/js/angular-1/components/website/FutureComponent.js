let FutureComponent = function() {
    $('.tab').on('click', function(e) {
    
        e.preventDefault();
    
        $(this).toggleClass('active');
    });
    $(document).ready(function(){
    
        $( 'a[data-toggle="tab"]' ).on('shown.bs.tab', function(e) {
    
            e.preventDefault();
    
            var target = $(e.target).attr("id");

            $( '.row' ).each(function (i, el) {
                var btn = $(el).find('.tab');
    
                $(btn).removeClass('active');
            });
    
            if (target == '#panel1') {
                tab_block=$('#panel1-techtree');
            } else if (target == '#panel2'){
                tab_block=$('#panel2-techtree');
            } else if (target == '#panel3'){
                tab_block=$('#panel3-techtree');
            } else if (target == '#panel4'){
                tab_block=$('#panel4-techtree');
            }
            $(this).toggleClass('active');
    
        });
    });
    


};

module.exports = {
    controller: [
        FutureComponent
    ],
    templateUrl: 'assets/tpl/pages/website/future.html'
};
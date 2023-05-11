let HomeComponent = function() {
    $('.play_btn_link').on('click', function(e) {
        e.preventDefault();
    
        var target = $(this).attr("id");
        var video = $(target).closest('.tab-pane').find('.wrapper_tab_video video');
    
        $(this).toggleClass('active');

        if ($(this).hasClass('active')) {
            $(video)[0].play();
        } else {
            $(video)[0].pause();
        }
    });
    
    $('.wrapper_tab_video video').hover(function toggleControls() {
        if (this.hasAttribute("controls")) {
            this.removeAttribute("controls")
        } else {
            this.setAttribute("controls", "controls")
        }
    });
    
    $(document).ready(function(){
        $( 'a[data-toggle="tab"]' ).on('shown.bs.tab', function(e) {
            e.preventDefault();
    
            var target = $(e.target).attr("id");
            var tab_block;
            var video;
    
            $('.wrapper_tab_video').each(function (i, el) {
                var video = $(el).find('video');
                var play_btn = $(el).closest('.tab-pane').find('.btn_link');
    
                $(play_btn).removeClass('active');
    
                $(video)[0].pause();
            });

            $( 'a[data-toggle="tab"]' ).each(function (i, el) {
                var btn = $(el).find('.play_btn_link');
    
                $(btn).removeClass('active');
            });
    
            if (target == '#panel1') {
                tab_block=$('#panel1-video');
            } else if (target == '#panel2'){
                tab_block=$('#panel2-video');
            } else if (target == '#panel3'){
                tab_block=$('#panel3-video');
            } else if (target == '#panel4'){
                tab_block=$('#panel4-video');
            }
    
            video = $(tab_block).find('.wrapper_tab_video video');
    
            $(this).find('.play_btn_link').toggleClass('active');
    
            $(video)[0].currentTime = 0;
            $(video)[0].play();
        });
    });
};

module.exports = {
    controller: [
        HomeComponent
    ],
    templateUrl: 'assets/tpl/pages/website/home.html'
};
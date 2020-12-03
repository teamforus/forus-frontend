require("./angular-1/angular-app-website");


// Analytics snippet
$(window).on('load', function () {
    var _paq = window._paq || [];
	/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
	_paq.push(['trackPageView']);
	_paq.push(['enableLinkTracking']);
	(function() {
		var u="//analytics.forus.io/";
		_paq.push(['setTrackerUrl', u+'matomo.php']);
		_paq.push(['setSiteId', '2']);
		var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
		g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
	})();
});

var previousScroll = 0,
    headerOrgOffset = $('.cf-wr').height();

$('.navbar').height($('.navbar').height());

$(window).scroll(function () {
    var currentScroll = $(this).scrollTop();
    if (currentScroll > headerOrgOffset) {
        if (currentScroll > previousScroll) {
            $('.navbar').addClass('nav-hide');
        } else {
            $('.navbar').removeClass('nav-hide');
        }
    } 
    previousScroll = currentScroll;
});

$('.navbar-collapse ul li a').click(function() {
	$('.navbar-toggle:visible').click();
});

$(document).on('click','.navbar-collapse.in',function(e) {
  	if( $(e.target).is('a') && ( $(e.target).attr('class') != 'dropdown-toggle' ) ) {
    	$(this).collapse('hide');
  	}
});

setTimeout(() => {
    $('.nano').nanoScroller({
        iOSNativeScrolling: true
    });

    $('.nano.nano-scrolldown').nanoScroller({
        iOSNativeScrolling: true,
        scroll: 'bottom'
    });
}, 500);
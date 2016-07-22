(function($) {
    $(function() {
        $('#intro-carousel').jcarousel();
        $('#intro-carousel').jcarouselAutoscroll({
            interval: 6000,
            target: '+=1',
            autostart: true
        })


        $('#intro-jcarousel-control-prev').on('click',function() {
            $('#intro-carousel').jcarousel('scroll', '-=1');
        })

        $('#intro-jcarousel-control-next').on('click',function() {
            $('#intro-carousel').jcarousel('scroll', '+=1');
        })


        $('#intro-carousel').on('jcarousel:scrollend', function(event, carousel) {
            $('#intro-carousel').jcarousel('scroll', 0);
        });

        $('#intro-carousel')
            .on('jcarousel:create jcarousel:reload', function() {
                var element = $(this),
                    width = element.innerWidth();

                // This shows 1 item at a time.
                // Divide `width` to the number of items you want to display,
                // eg. `width = width / 3` to display 3 items at a time.
                element.jcarousel('items').css('width', width + 'px');
            })
            .jcarousel({
                // Your configurations options
            });
    });
})(jQuery);
(function($) {
    $(function() {
        var jcarousel = $('#super-products-jcarousel');


        jcarousel
            .on('jcarousel:reload jcarousel:create', function () {
                var width = jcarousel.innerWidth();

                if (width >= 600) {
                    width = width / 6;
                } else if (width >= 350) {
                    width = width / 4;
                }

                jcarousel.jcarousel('items').css('width', width + 'px');
            })
            .jcarousel({
                wrap: 'circular'
            })
            .jcarouselAutoscroll({
                interval: 2000,
                target: '+=1',
                autostart: true
            })


        $('#super-products-control-prev')
            .jcarouselControl({
                target: '-=1'
            });

        $('#super-products-control-next')
            .jcarouselControl({
                target: '+=1'
            });

        $('#super-products-jcarousel').on('jcarousel:scrollend', function(event, carousel) {
            $('#super-products-jcarousel').jcarousel('scroll', 0);
        });

        $('#super-products-jcarousel').hover(function() {
            $(this).jcarouselAutoscroll('stop');
        }, function() {
            $(this).jcarouselAutoscroll('start');
        });

    });
})(jQuery);
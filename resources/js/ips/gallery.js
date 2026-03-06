$(function() {	
    if ( $('.board-view').length > 0 ) {        
        // 내용보기 가로값 고정
        $(window).on('load resize', function() { $('.board-view').css({ maxWidth: $('#frameLayout').width() }); });

        // 내용보기 슬라이더
        if ( $('.slide-photo').length > 0 ) {
            const gallery = new Swiper(".board-view .slide-photo", {
                autoplay                : {
                    delay               : 2500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter   : true,
                },
                wrapperClass            : "list-photoview",
                slideClass              : "list-photoview>li",
                slidesPerView           : "auto",
                loop                    : true,
                navigation              : {
                    nextEl              : ".board-view .slide-photo #btnRight",
                    prevEl              : ".board-view .slide-photo #btnLeft",
                }
            });
        }
    }
});
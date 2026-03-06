/*-------------------------------------------------
title       : 상단띠배너
Author      : ㅈㅁㅈ
Create date : 2024-10-29
-------------------------------------------------*/

$(function()
{
    // 배너 없으면 #topbanner 삭제    
    if ( $('#topbanner .item').length == 0 ) { $('.topbanner').remove(); }
    else
    {
        $('.topbanner').classtoggle({'close': ''});

        setTimeout(function()
        {
            // 스와이퍼
            const topbanner = new Swiper(".topbanner .swiper",
            {
                autoplay:
                {
                    delay: 2500,
                    disableOnInteraction: false,
                },
                direction: "vertical",
                wrapperClass: "list",
                slideClass: "item",
                slidesPerView: "auto",
                loop: true,
                navigation:
                {
                    nextEl: ".topbanner .next",
                    prevEl: ".topbanner .prev",
                },
                pagination:
                {
                    el: ".topbanner .pager",
                    clickable: true,
                },
            });
    
            const topbannerCount = new Swiper(".topbanner .swiper",
            {
                direction: "vertical",
                wrapperClass: "list",
                slideClass: "item",
                slidesPerView: "auto",
                loop: true,
                pagination:
                {
                    el: ".topbanner .count",
                    type: "fraction",
                },
            });
    
            topbanner.controller.control = topbannerCount;
            swiperOption('.topbanner', topbanner, '.open b');            
        }, 400);
    }
});


$(function () {
    // 오늘 하루 열지 않음
    $(document).on('click', '.btnTopBannerTodayClose', function () {
        $(".topbanner").removeClass('active');
        setStorage("topBannerPopup", "done", 1);
    });

    // 닫기
    $(document).on('click', '.btnTopBannerClose', function () {
        $(".topbanner").removeClass('active');
    });
});
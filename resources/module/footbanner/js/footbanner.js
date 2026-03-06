/*-------------------------------------------------
title       : 하단배너
Author      : ㅈㅁㅈ
Create date : 2024-10-29
-------------------------------------------------*/

$(function()
{
    // 배너 없으면 .footbanner 삭제    
    if ( $('.footbanner .item').length == 0 ) { $('.footbanner').remove(); }
    else
    {
        $('.footbanner').classtoggle();

        // 스와이퍼
        const footbanner = new Swiper(".footbanner .swiper", 
        {
            autoplay                : 
            {
                delay               : 2500,
                disableOnInteraction: false,
            },
            wrapperClass            : "list",
            slideClass              : "item",
            slidesPerView           : "auto",
            loop                    : true,
            loopAdditionalSlides    : 1,            
            navigation              : 
            {
                nextEl              : ".footbanner .next",
                prevEl              : ".footbanner .prev",
            },
            pagination              : 
            {
                el                  : ".footbanner .pager",
                clickable           : true,
            },
        });

        const footbannerCount = new Swiper(".footbanner .swiper", 
        {
            wrapperClass            : "list",
            slideClass              : "item",
            slidesPerView           : "auto",
            loop                    : true,
            loopAdditionalSlides    : 1,       
            pagination              : 
            {
                el                  : ".footbanner .count",
                type                : "fraction",
            },
        });

        footbanner.controller.control = footbannerCount;
        swiperOption('.footbanner', footbanner, false);
    }
});
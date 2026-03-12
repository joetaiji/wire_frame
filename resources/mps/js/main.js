import { tabs } from './modules/index.js';

$(function () {
    tabs(".tab-nav", ".tab-conts");

    /* swiper slides */
    const btnNext = ".swiper-button-next",
        btnPrev = ".swiper-button-prev",
        paging = ".swiper-pagination"

    var slides = {

        cardNews: new Swiper(".card-news .swiper", {
            //lazy: true,
            slidesPerView: 2,
            spaceBetween: 18,
            breakpoints: {
                768: {
                    spaceBetween: 36,
                    slidesPerView: 3
                }
            },
            autoplay: false,
            //loop: this.SwiperLength > 1,
            watchOverflow: true,
            //effect: "fade",
            navigation: {
                nextEl: btnNext,
                prevEl: btnPrev,
            },
            pagination: {
                el: paging,
                type: "fraction"
            }
        })
    };

    /* $('.swiper-pagination-current').before('<span class="sr-only">현재 슬라이드</span>')
    $('.swiper-pagination-total').before('<span class="sr-only">전체 슬라이드 개수</span>')
    $(btnPrev).add(btnNext).removeAttr('aria-label'); */

});


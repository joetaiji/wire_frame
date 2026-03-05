/**
 * 헤더 고정 & Top 버튼 고정
 */
import { FX } from './config.js';

let lastScroll;

/**
 * 헤더 고정 초기화
 */
export function initHeaderFixed() {
    $(window).on('load scroll', function () {
        const $fixedItem = $('header');

        if ($(window).scrollTop() > 110) {
            let scrollT = $(this).scrollTop();
            scrollT > lastScroll ? $fixedItem.addClass(FX) : $fixedItem.removeClass(FX);
            lastScroll = scrollT;
        }

        // top버튼
        $(window).scrollTop() > 0 ? $('.go-top').addClass(FX) : $('.go-top').removeClass(FX);
    });
}

// 자동 실행을 위해 export
export { lastScroll };

/**
 * 헤더 고정 & Top 버튼 고정
 */
import { FX } from './config.js';

let lastScroll = 0;

/**
 * 헤더 고정 초기화
 */
export function headerFixed() {
    const $win = $(window);
    const $header = $('header');

    $win.on('load scroll', () => {
        const scrollT = $win.scrollTop();

        if (scrollT > 110) {
            $header.toggleClass(FX, scrollT > lastScroll);
            lastScroll = scrollT;
        }
    });
}

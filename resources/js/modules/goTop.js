/**
 * Top 버튼
 */
import { FX } from './config.js';
import { mobile } from './utils.js';

/**
 * Top 버튼 기능
 */
export function goTop() {
    const $win = $(window);
    const $goTop = $(".btn_go_top");
    const $footer = $('footer');
    const $sideRightUtil = $goTop.parent(".side_right_util");

    $win.on("load scroll", () => {
        const scrollT = $win.scrollTop();

        $goTop.toggleClass(FX, scrollT > 0);

        if (!mobile() && $footer.length) {
            $sideRightUtil.toggleClass("stick", scrollT > $footer.offset().top - $win.height());
        }
    });

    $goTop.on("click", () => {
        $("html,body").stop().animate({ scrollTop: 0 }, 800);
    });
}

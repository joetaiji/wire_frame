/**
 * Top 버튼
 */
import { FX } from './config.js';
import { mobile } from './utils.js';

/**
 * Top 버튼 기능
 */
export function goTop() {
    const $goTop = $(".btn_go_top");

    $(window).on("load scroll", () => {
        const scrollT = $(window).scrollTop();
        scrollT > 0 ? $goTop.addClass(FX) : $goTop.removeClass(FX);

        if (!mobile()) {
            const $sideRightUtil = $goTop.parent(".side_right_util");
            const $footer = $('footer');
            if ($footer.length) {
                scrollT > $footer.offset().top - $(window).height()
                    ? $sideRightUtil.addClass("stick")
                    : $sideRightUtil.removeClass("stick");
            }
        }
    });

    $goTop.on("click", () => {
        $("html,body").stop().animate({ scrollTop: 0 }, 800);
    });
}

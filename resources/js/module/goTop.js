/**
 * Top 버튼
 */
import { FX } from './config.js';
import { mobile } from './utils.js';

/**
 * Top 버튼 기능
 */
export function goTop() {
    var $goTop = $(".btn_go_top");

    $(window).on("load scroll", function () {
        var scrollT = $(window).scrollTop();
        scrollT > 0 ? $goTop.addClass(FX) : $goTop.removeClass(FX);

        if (!mobile()) {
            var $sideRightUtil = $goTop.parent(".side_right_util");
            var $footer = $('footer');
            if ($footer.length) {
                scrollT > $footer.offset().top - $(window).height() 
                    ? $sideRightUtil.addClass("stick") 
                    : $sideRightUtil.removeClass("stick");
            }
        }
    });

    $goTop.on("click", function () {
        $("html,body").stop().animate({ scrollTop: 0 }, 800);
    });
}

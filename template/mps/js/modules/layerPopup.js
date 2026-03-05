/**
 * 레이어 팝업
 */
import { AC, ScrollNo, $html } from './config.js';

let $clickSpot;

/**
 * 레이어 팝업 기능
 * @param {string} el - 팝업 트리거 선택자
 */
export function layerPopup(el) {
    const OL = 'opened-layer';

    $(el).on('click', function (e) {
        e.preventDefault();

        $clickSpot = $(this);
        const isActive = $clickSpot.hasClass(AC);

        $clickSpot.toggleClass(AC).attr('aria-expanded', isActive ? 'false' : 'true');
        $('#' + $(this).data('id')).attr('tabindex', 0).fadeIn(300).focus().addClass(OL);
        $html.addClass(ScrollNo);
    });

    $html.on('click', '.opened-layer .popup-close', function (e) {
        e.preventDefault();
        $(this).closest('.opened-layer').removeAttr('tabindex').fadeOut(100).removeClass(OL);
        $html.removeClass(ScrollNo);
        $clickSpot.focus().removeClass(AC).attr('aria-expanded', 'false');
    });

    $html.on('keydown', '.opened-layer .popup-close', function (e) {
        if (e.keyCode == 9) $(this).closest('.opened-layer').focus();
    });
}

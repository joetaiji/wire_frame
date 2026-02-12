/**
 * 화면 크기 조절
 */
import { AC, $html } from './config.js';

/**
 * 화면 줌 기능
 * @param {string} el - 줌 버튼 선택자
 */
export function zoom(el) {
    const zoomLevels = [0.9, 1, 1.1, 1.2, 1.3],
        classNames = ['xsm', 'sm', 'md', 'lg', 'xlg'],
        $item = $(el);
    let zoom = 1;

    $html.on('click', el, function () {
        const $na = $(this);

        $na.attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected');
        $.each(classNames, function (index, className) {
            if ($na.hasClass(className)) zoom = zoomLevels[index];
        });
        // 초기화
        if ($na.hasClass('ico-reset')) {
            $html.css('zoom', 1);
            $item.eq(1).attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected');
        }
        localStorage.setItem('zoomDefault', zoom);
        $html.css('zoom', zoom);
    });

    // 로컬 저장
    zoom = localStorage.getItem('zoomDefault') || 1;
    $html.css('zoom', zoom);
    $.each(zoomLevels, function (index, zoomLevel) {
        if (zoom == zoomLevel) $item.eq(index).attr('aria-selected', true).parent().addClass(AC);
    });
}

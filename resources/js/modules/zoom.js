/**
 * 화면 크기 조절
 */
import { AC, $html } from './config.js';

/**
 * 화면 줌 기능
 * @param {string} el - 줌 버튼 선택자
 */
export function zoom(el) {
    const zoomLevels = [0.9, 1, 1.1, 1.2, 1.3];
    const classNames = ['xsm', 'sm', 'md', 'lg', 'xlg'];
    const $item = $(el);

    // aria-selected 및 active 상태 설정 헬퍼
    const setActive = ($btn) => {
        $btn.attr('aria-selected', 'true')
            .parent().addClass(AC).siblings().removeClass(AC)
            .children().removeAttr('aria-selected');
    };

    let zoomValue = parseFloat(localStorage.getItem('zoomDefault')) || 1;
    $html.css('zoom', zoomValue);
    zoomLevels.forEach((level, index) => {
        if (zoomValue == level) setActive($item.eq(index));
    });

    $html.on('click', el, function () {
        const $na = $(this);

        if ($na.hasClass('ico-reset')) {
            zoomValue = 1;
            setActive($item.eq(zoomLevels.indexOf(1)));
        } else {
            classNames.forEach((className, index) => {
                if ($na.hasClass(className)) zoomValue = zoomLevels[index];
            });
            setActive($na);
        }

        localStorage.setItem('zoomDefault', zoomValue);
        $html.css('zoom', zoomValue);
    });
}

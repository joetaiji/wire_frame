/**
 * 아코디언
 */
import { AC, OpenTxt, CloseTxt } from './config.js';

/**
 * 아코디언 기능
 * @param {string} el - 아코디언 컨테이너 선택자
 */
export function accordion(el) {
    const $el = $(el);

    // 전체 details 스캔해서 open 되어 있는거에 active지정
    $el.children('details').each(function () {
        $(this).attr('open') 
            ? $(this).addClass(AC).find('summary i').append('<span class="sr-only">' + CloseTxt + '</span>') 
            : $(this).removeClass(AC).find('summary i').append('<span class="sr-only">' + OpenTxt + '</span>');
    });

    // summary클릭했을때
    $el.on('click', 'summary', function () {
        const $details = $(this).parent('details'),
            isOpen = $details.attr('open'),
            $accordion = $(this).parents(el),
            $btnAll = $accordion.find('.btn-all');

        $details.toggleClass(AC, !isOpen).find("summary i .sr-only").text(!isOpen ? CloseTxt : OpenTxt);

        // details가 열리면? 전체버튼 닫기 : 열기
        $accordion.children('details').hasClass(AC) 
            ? $btnAll.addClass(AC).find("span").text(CloseTxt) 
            : $btnAll.removeClass(AC).find("span").text(OpenTxt);
    });

    // 전체 버튼 클릭했을때
    $el.on('click', '.btn-all', function () {
        $(this).hasClass(AC) 
            ? $(this).parents(el).find('details.active summary').trigger('click') 
            : $(this).parents(el).find('summary').trigger('click');
    });
}

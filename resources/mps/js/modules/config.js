/**
 * 전역 설정 변수
 */
export const AC = "active";
export const FX = "fixed";
export const ALL = "all_nav";
export const ScrollNo = 'scroll-no';
export const srOnly = '.sr-only';
export const OpenTxt = '열기';
export const CloseTxt = '닫기';
export const $html = $('html');


/**
 * 유틸리티 함수
 */

/**
 * 모바일 여부 체크
 * @returns {boolean}
 */
export const mobile = () => window.innerWidth < 1024;

/**
 * 접근성 초기 설정
 * @param {string|jQuery} el - 대상 요소 선택자
 */
export const accessInit = (el) => $(el).attr('aria-expanded', 'false');

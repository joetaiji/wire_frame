/*-------------------------------------------------
Common Javascript
사용자페이지 js
Version : 1.0
author : mcahn
create date : 2017. 05. 01.
create date : 2017. 05. 01.
-------------------------------------------------*/
/*********************************************************************
 * 비밀번호 표시/숨김 토글 함수
 *
 * 사용 : onclick="togglePasswordVisibility(this, 'inputId')"
 * 파라미터 :
 *   - button: 클릭된 버튼 요소 (this)
 *   - inputId: 비밀번호 input 요소의 ID
 * 기능 : 비밀번호 input의 type을 password와 text로 전환하고 버튼 내 아이콘 변경
 *
 * 예시 : <button onclick="togglePasswordVisibility(this, 'enpswd')">토글</button>
 *       <a onclick="togglePasswordVisibility(this, 'password1')">보기</a>
 **********************************************************************/
function togglePasswordVisibility(button, inputId) {
    var input = document.getElementById(inputId);

    if (!input) {
        console.error('ID가 "' + inputId + '"인 입력 필드를 찾을 수 없습니다.');
        return;
    }

    // 클릭된 버튼 내의 아이콘 찾기
    var icon = button.querySelector('i');

    // type 전환 및 아이콘 변경
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) icon.className = 'ri-eye-off-line';
    } else {
        input.type = 'password';
        if (icon) icon.className = 'ri-eye-line';
    }
}
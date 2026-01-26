const bShowAuthDLG = true;
const __pPermpstr = "3f621caa5cf979da7832f075ad2787dbd3c2245af284de3f6ac0d14cef3209c7";

$(function () {

	$('a[target="_blank"]').attr('title', '새창으로 열림')

	zoom('.zoom-drop .drop-menu button') //화면크기조정
	listOpen('.drop-btn', '.drop-wrap') //drop메뉴

	$('#head_menu').clone().appendTo('#popSiteMap .popup-body');//사이트맵 메뉴복제
	layerPopup('.header .btn-navi') 	//통합검색, 전체메뉴

	gnb('nodepth2')	//gnb메뉴

	mobileGnb()	//모바일 gnb메뉴

	if (bShowAuthDLG) {
		let _AuthUser = sessionStorage.getItem('__CMMDLG_AUTH2');

		if (_AuthUser != "Y")
			$("#divCommonloginDialog").show();
	}

	$("#clPassword").on("keypress", (e) => {
		if (e.key == "Enter") {
			e.preventDefault();
			_fnCommonloginCommit();
			return false;
		}
	});

});

function hashSHA256CryptoJS(password) {
	const hash = CryptoJS.SHA256(password);
	return hash.toString(CryptoJS.enc.Hex);
}

function _fnCommonloginCommit() {

	let ipwd = $("#clPassword").val();

	if (ipwd == "") {
		alert("패스워드를 입력해주십시오.");
		$("#clPassword").focus();
		return;
	}

	let encryptPwd = hashSHA256CryptoJS(ipwd);

	if (encryptPwd.toString() == __pPermpstr) {
		sessionStorage.setItem('__CMMDLG_AUTH2', 'Y');
		$("#divCommonloginDialog").fadeOut();
	}

	else {
		alert("패스워드가 정확하지 않습니다.");
		$("#clPassword").val("").focus();
		return;
	}

}

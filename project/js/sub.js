$(function () {
	snb();

	tabs("#snb .list");

	//tab 2차뎁스
	const $tabDpth2 = $('.head_menu_depth>li>ul');
	$tabDpth2.wrap('<div class="tabs depth2-tab"></div>');

	tabs(".depth2-tab");
	inPageNav(".title-2");

	accordion(".accordion");


	//통합검색-고급검색
	tabs(".total-search-cont .tabs");
	listOpen('.sch-etc .ico-sch1', '.sch-etc', true)

	//모바일에서 원본이미지보기
	if (mobile()) {
		$('.img-zoom').each(function () {
			const imgSrc = $(this).find('img').attr('src')
			$(this).append('<a href="' + imgSrc + '" target="_blank" title="이미지 새창열기" class="btn-zoom"></a>')
		})
	}




	// 공통 sitemap footer에서 footer.jsp파일을 대표홈페이지의 footer 파일을 쓰고 있어서
	// 의료개혁 아카이브 footer에 맞도록 별도 처리함
	if ($("ul.sitemap_area").length >= 1) {
		if ($("footer").hasClass("footer") == false)
			$("footer").addClass("footer").before("<br/><br/>");
		$("li.home").after("<li><a href='#' aria-current='true' class='active'>사이트맵</a></li>");
		$("title").html("사이트맵" + $("title").html());
	}

	// 의료개혁 아카이브 통합검색에 맞게 별도 처리함
	if ($("div.total-search-top-box").length >= 1) {
		$("li.home").after("<li><a href='#' aria-current='true' class='active'>통합검색</a></li>");
		let hTitle = $("title").html();
		let arrTitle = hTitle.split(":");
		$("title").html("통합검색 : " + (arrTitle.length > 2 ? arrTitle[1] : "보건복지부 의료개혁 아카이브"));
	}

});


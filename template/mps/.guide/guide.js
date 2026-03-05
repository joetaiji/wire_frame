$(function(){		 	
	const snbActive = $(".snb").data("active")
	$(".head_menu_depth>li").removeClass("active").eq(snbActive).addClass("active");
});
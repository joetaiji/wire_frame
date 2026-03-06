define([
	'jquery',
	'jquery.mCustomScrollbar'
], function($) {
	$('head link').first()
	.before('<link rel="stylesheet" type="text/css" href="css/jquery.mCustomScrollbar.css" />');
});

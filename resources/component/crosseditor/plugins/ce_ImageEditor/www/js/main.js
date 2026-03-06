require([
	'require.config',
	'lib/jquery/jquery-1.10.2.min'
], function(config) {
	$(function(){
		$('.NHIE-loading-prepare-mask .message p').html('Loading Resources..');
	});
	require([
		'app/launcher'
	]);
});

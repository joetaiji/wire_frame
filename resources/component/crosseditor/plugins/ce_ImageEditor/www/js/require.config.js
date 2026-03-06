define(function() {
	require.config({
		paths: {
			'text': 'lib/require/text',
			'css': 'lib/require/css',
			'resources': '../resources',
			'underscore': 'lib/underscore/underscore-min',
			'jquery': 'lib/jquery/jquery-1.10.2.min',
			'jquery-ui': 'lib/jquery/jquery-ui-1.11.4',
			'jquery.mCustomScrollbar': 'lib/jquery/jquery.mCustomScrollbar.concat.min',
		},
		shim: {
			'jquery-ui': ['jquery'],
			'jquery.mCustomScrollbar': ['jquery']
		}
	});
});

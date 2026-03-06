({
	appDir: './www',
	baseUrl: './js',
	dir: './dist',
	optimizeCss: 'standard',
	removeCombined: true,

	mainConfigFile:'./www/js/require.config.js',

	modules: [{
		name: 'main'
	},{
		name: 'app/launcher',
		exclude:['jquery']
	},{
		name: 'app/nhie',
		exclude:['jquery']
	}]
})

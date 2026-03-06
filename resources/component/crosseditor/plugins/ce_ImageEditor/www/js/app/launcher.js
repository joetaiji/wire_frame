define([
	'text!app/app.config.json',
	'app/external_adapter'
], function(config, adapter) {
	// 기본 설정 로딩
	config = config || '{}';
	try {
		config = JSON.parse(config);
	} catch (e) {
		config = {};
	}

	window.NHIE = {
		adapter: adapter,
		config: config
	};

	var launchNHIE = function() {
		require([
			'text!../NHIE.config.json',
			'app/nhie'
		], function(user_config, NHIE) {
			user_config = user_config || '{}';
			try {
				user_config = JSON.parse(user_config);
			} catch (e) {
				user_config = {};
			}
			config = _.extend(config, user_config);
			NHIE.init(config);
			NHIE.launch();
		});
	}
	// 외부 프로그램 연결 설정 및 언어 리소스 로드
	if(adapter.localeResource && adapter.localeResource.url) {
		require([
			adapter.localeResource.url
		], function(langResource) {
			if(adapter.localeResource.shim) {
				langResource = eval(adapter.localeResource.shim+';');
			}
			NHIE.Lang = langResource;
			launchNHIE();
		});
	} else {
		NHIE.Lang = {};
		launchNHIE();
	}
});

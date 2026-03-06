define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'history-redo',
		iconCls:'fa fa-fw fa-share',
		propertyTpl: 'history-redo',
		handler: function($button, toggleStatus) {
			console.log('history-redo');
			NHIE.history.redo();
		},
		enableStatus: function() {
			return NHIE.history.__current_index < NHIE.history.__history_inventory__.length - 1;;
		}
	});
});

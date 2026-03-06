define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'history-undo',
		iconCls:'fa fa-fw fa-reply',
		propertyTpl: 'history-undo',
		handler: function($button, toggleStatus) {
			console.log('history-undo');
			NHIE.history.undo();
		},
		enableStatus: function() {
			return NHIE.history.__current_index > 0;;
		}
	});
});

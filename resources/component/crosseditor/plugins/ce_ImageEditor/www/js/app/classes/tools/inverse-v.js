define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'inverse-v',
		iconCls:'fa fa-fw fa-arrows-v',
		propertyTpl: 'inverse-v',
		handler: function($button, toggleStatus) {
			NHIE.workspace.flipWorkspace('v');
		}
	});
});

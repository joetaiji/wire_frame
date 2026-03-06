define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'inverse-h',
		iconCls:'fa fa-fw fa-arrows-h',
		propertyTpl: 'inverse-h',
		handler: function($button, toggleStatus) {
			NHIE.workspace.flipWorkspace('h');
		}
	});
});

define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'rotate-left',
		iconCls:'fa fa-fw fa-rotate-left',
		propertyTpl: 'rotate-left',
		handler: function($button, toggleStatus) {
			NHIE.workspace.rotateWorkspace('left');
		}
	});
});

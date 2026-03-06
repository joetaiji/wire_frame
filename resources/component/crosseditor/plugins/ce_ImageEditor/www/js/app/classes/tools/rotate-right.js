define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase'
], function(_, $, ToolBase) {
	return new ToolBase({
		name: 'rotate-right',
		iconCls:'fa fa-fw fa-rotate-right',
		propertyTpl: 'rotate-right',
		handler: function($button, toggleStatus) {
			NHIE.workspace.rotateWorkspace('right');
		}
	});
});

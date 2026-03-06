define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'text!resources/tpl/ui/property/ui-property-item-resize-workspace.tpl.html'
], function(_, $, ToolBase, _propertyTpl) {
	return new ToolBase({
		name: 'resize-workspace',
		type: 'toggle',
		iconCls:'fa fa-fw fa-arrows-alt',
		propertyTpl: _propertyTpl,


		handler: function($button, toggleStatus) {
			NHIE.workspace.activateResizer(toggleStatus);
			if(toggleStatus === false) {
				this.onApplyProperty();
			}
		},
		enableStatus: function() {
			return true;
		},
		onShowProperty: function(data) {
			var size = NHIE.workspace.getSize();
			NHIE.propertyPanel.setPropertyContent('resize-workspace', size);
		},
		onApplyProperty: function() {
			NHIE.workspace.syncResizerSize(true);
			NHIE.workspace.workspace_resizer.resetScale();

			var size = NHIE.workspace.getSize();
			NHIE.workspace.restore_state_resize = size;
		},
		onRestoreProperty: function() {
			var size = NHIE.workspace.restore_state_resize;
			if(size) {
				NHIE.workspace.setStyle(size);
				NHIE.workspace.syncResizerSize();
				NHIE.workspace.workspace_resizer.resetScale();
				NHIE.app.fireEvent('changeproperty', size);
			}
		}
	});
});

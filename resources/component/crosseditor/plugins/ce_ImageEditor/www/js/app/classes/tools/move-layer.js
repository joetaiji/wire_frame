define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',

	'text!resources/tpl/ui/property/ui-property-item-move-layer.tpl.html'

], function(_, $, ToolBase, _propertyTpl) {
	return new ToolBase({
		name: 'move-layer',
		iconCls:'fa fa-fw fa-arrows',
		propertyTpl: _propertyTpl,
		type: 'toggle',
		handler: function($button, toggleStatus) {
			var layer = NHIE.workspace.getSelectedLayer();
			if(toggleStatus === false) {
				if(layer && layer.modified) {
					this.onApplyProperty();
				}
				$('.nhie-body').css('cursor', '');
			} else {
				if(layer) {
					layer.restore_state = layer.getCurrentState();
				}
				$('.nhie-body').css('cursor', 'move');
			}
		},
		enableStatus: function() {
			return !!(NHIE.workspace.getSelectedLayer() && !NHIE.workspace.getSelectedLayer().empty);
		},
		onShowProperty: function(data) {
			var layer = NHIE.workspace.getSelectedLayer();
			if(layer) {
				data = _.clone(layer.style);
				data.left = parseInt(data.left);
				data.top = parseInt(data.top);
				data.width = parseInt(data.width);
				data.height = parseInt(data.height);

				NHIE.propertyPanel.setPropertyContent('move-layer', data);
			}
		},
		onApplyProperty: function() {
			var layer = NHIE.workspace.getSelectedLayer();
			if (layer) {
				layer.restore_state = layer.getCurrentState();
				layer.modified = false;
				NHIE.app.fireEvent('changecontent');
			}

		},
		onRestoreProperty: function() {
			var layer = NHIE.workspace.getSelectedLayer();
			if(layer) {
				var restore_state = layer.restore_state;
				if(restore_state) {
					layer.setCanvasStyle(restore_state.style);
					NHIE.app.fireEvent('changeproperty', restore_state.style);
					layer.modified = false;
				}
			}
		}
	});
});

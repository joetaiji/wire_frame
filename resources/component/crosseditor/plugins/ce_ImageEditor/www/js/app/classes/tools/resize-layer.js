define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',

	'text!resources/tpl/ui/property/ui-property-item-resize-layer.tpl.html'

], function(_, $, ToolBase, _propertyTpl) {
	return new ToolBase({
		name: 'resize-layer',
		type: 'toggle',
		iconCls:'fa fa-fw fa-arrows-alt',

		propertyTpl: _propertyTpl,
		handler: function($button, toggleStatus) {
			//console.log('handle - filter', $button, toggleStatus)
			if(toggleStatus === false) {
				var layer = NHIE.workspace.getSelectedLayer();
				if(layer && layer.modified) {
					this.onApplyProperty();
				}
			} else {
				var layer = NHIE.workspace.getSelectedLayer();
				if (layer) {
					data = layer.style;
					layer.restore_state = layer.getCurrentState();
					layer.tracker.show();
				}
			}
		},
		enableStatus: function() {
			return !!(NHIE.workspace.getSelectedLayer() && !NHIE.workspace.getSelectedLayer().empty);
		},
		onShowProperty: function(data) {
			var layer = NHIE.workspace.getSelectedLayer();
			if (layer) {
				data = layer.getStyle();
				var rotation = data.rotation;

				data = _.clone(layer.style);
				data.left = parseInt(data.left);
				data.top = parseInt(data.top);
				data.width = parseInt(data.width);
				data.height = parseInt(data.height);

				rotation = parseInt(rotation || 0);
				rotation = (rotation % 360);
				if(rotation > 180 && rotation < 360) {
					rotation -= 360;
				}
				data.rotation = rotation;

				layer.tracker.show();
				NHIE.propertyPanel.setPropertyContent('resize-layer', data);
			}
		},
		onApplyProperty: function() {
			var layer = NHIE.workspace.getSelectedLayer();
			if (layer) {
				layer.rasterize().then(function() {
					layer.restore_state = layer.getCurrentState();
					layer.modified = false;
				});
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

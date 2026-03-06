define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'app/classes/ui/Dialog',
	'text!resources/tpl/ui/dialog/ui-dialog-confirm_history_reset.tpl.html'
], function(_, $, ToolBase, Dialog, _dialog_content) {

	var dialogBtns = {};
	dialogBtns[NHIE.Lang['PluginImageEditor_button_confirm']] = function() {
		NHIE.history.applyHistoryItem(0);
		NHIE.toolbar.resetButtonStatus();
		$(this).dialog('close');
	};
	dialogBtns[NHIE.Lang['PluginImageEditor_button_cancel']] = function() {
		$(this).dialog('close');
	};
	var dialog = new Dialog({
		title: NHIE.Lang['PluginImageEditor_tool_title_history_reset'],
		type: 'confirm',
		content: _dialog_content,
		width: 400,
		modal: true,
		buttons: dialogBtns
	});

	return new ToolBase({
		name: 'history-reset',
		iconCls:'fa fa-fw fa-reply-all',
		propertyTpl: 'history-reset',
		dialog: dialog,
		handler: function($button, toggleStatus) {
			dialog.show();
		},
		enableStatus: function() {
			return NHIE.history.__current_index > 0;
		}
	});
});

define([
	'underscore',
	'jquery',
	'app/classes/Observable'
], function(_, $, Observable) {
	var History = Observable.extend({
		classname: 'History',
		__history_inventory__: [],

		reset: function() {
			this.__history_inventory__ = [];
			this.__current_index = -1;
		},
		undo: function() {
			if(this.__current_index > 0) {
				this.applyHistoryItem(this.__current_index - 1);
			}
		},
		redo: function() {
			if(this.__history_inventory__[this.__current_index + 1]) {
				this.applyHistoryItem(this.__current_index + 1);
			}
		},
		saveHistory: function() {
			console.warn('save history!!')
			var workspace_size = NHIE.workspace.getSize();
			var workspace_content = $('.workspace-contents .workspace-contents-wrapper .layer-wrapper').html();

			var historyItem = {
				size: workspace_size,
				content: workspace_content
			};
			if(this.__current_index < 0) {

			} else {
				var arr = this.__history_inventory__.slice(0, this.__current_index + 1);
				this.__history_inventory__ = arr;
			}
			this.__history_inventory__.push(historyItem);
			this.__current_index = this.__history_inventory__.length - 1;
		},
		getCurrentHistoryItem: function() {
			var index = this.__current_index;
			return this.__history_inventory__[index];
		},
		applyHistoryItem: function(index) {
			var historyItem = this.__history_inventory__[index];
			if (historyItem) {
				NHIE.workspace.reload({
					size: historyItem.size,
					content: historyItem.content
				});
				this.__current_index = index;
			}
		}
	});


	return History;
});

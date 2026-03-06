define([
	'underscore',
	'jquery',
	'app/classes/tools/ToolBase',
	'text!resources/tpl/ui/property/ui-property-item-crop-workspace.tpl.html'
], function(_, $, ToolBase, _propertyTpl) {
	return new ToolBase({
		name: 'crop-workspace',
		type: 'toggle',
		iconCls:'fa fa-fw fa-crop',
		propertyTpl: _propertyTpl,


		handler: function($button, toggleStatus) {
			NHIE.workspace.activateCropper(toggleStatus);
			if(toggleStatus === false) {
				//this.onApplyProperty();
			}
		},
		enableStatus: function() {
			return true;
		},
		onRenderProperty: function($property) {
			// console.log('rendered..', $property.find('input'));
			var me = this;
			var changeHandler = function(form) {
				me.applyChangedFieldValue(form);
			}
			$property.find('input').off('._nhie_workspacecropper')
			.on('change._nhie_workspacecropper', function(e) {
				if(!$property.find('.property-crop-workspace').hasClass('suspend-change-events')) {
					changeHandler(e.target);
				}
			})
			.on('keydown', function(e) {
				if(e.keyCode === 13) {
					e.preventDefault();
					changeHandler(e.target);
				}
			})
		},
		onShowProperty: function(data) {

			if(typeof data.width === 'undefined') {
				NHIE.workspace.workspace_cropper.target.style = {};
			}

			var style = NHIE.workspace.workspace_cropper.target.getStyle();
			// console.log(data, style)
			if(!style || typeof style.width === 'undefined') {
				style = this.getBasicPropertyValues();
			}
			NHIE.propertyPanel.setPropertyContent('crop-workspace', {
				width: parseInt(style.width),
				height: parseInt(style.height),
				marginLeft: parseInt(style.marginLeft),
				marginTop: parseInt(style.marginTop),
				left: parseInt(style.left + style.marginLeft),
				top: parseInt(style.top + style.marginTop)
			});	
				//console.log('-after render property');		
		},
		onApplyProperty: function() {
			if(!this.isCropperModified()) {
				return;
			}
			NHIE.workspace.syncCropperSize(true);
			NHIE.workspace.workspace_cropper.resetCropper(true);

			// var size = NHIE.workspace.getSize();
			// NHIE.workspace.restore_state_resize = size;
			// //this.rendered = false;
		},

		onRestoreProperty: function() {
			var size = NHIE.workspace.restore_state_crop;
			if(size) {

				// NHIE.workspace.setStyle(size);
				// NHIE.workspace.syncCropperSize();

				NHIE.workspace.workspace_cropper.resetCropper(size);
				NHIE.app.fireEvent('changeproperty', size);
				//this.rendered = false;
			}
		},
		getBasicPropertyValues: function() {
			var workspace_size = NHIE.workspace.getSize();
			var zoom = (NHIE.app.data('navigator-zoom') || 100)/100;
			
			var cropperSize = NHIE.workspace.workspace_cropper.getDefaultCropperSize();

			return {
				width: cropperSize.width * zoom ,
				height: cropperSize.height * zoom,
				left: workspace_size.width * zoom / 2,
				top: workspace_size.height * zoom / 2,
				marginLeft: cropperSize.width * zoom /-2,
				marginTop: cropperSize.height * zoom /-2
			};
		},
		setPropertyValues: function(data, skipChanggeEvent) {
			var $wrapper = $('.property-item.property-crop-workspace');

			var size = NHIE.workspace.getSize();
			// var zoom = (NHIE.app.data('navigator-zoom') || 100)/100;
			var checkValue = function(val, callback) {
				if(typeof val !== 'undefined' && typeof callback === 'function') {
					callback(val);
				}
			}
			checkValue(data.width, function(v) {
				$wrapper.find('[name=width]').val(parseInt(v));	
			});
			checkValue(data.height, function(v) {
				$wrapper.find('[name=height]').val(parseInt(v));	
			});
			checkValue(data.left, function(v) {
				$wrapper.find('[name=left]').val(parseInt(v + size.width /-2));	
			});
			checkValue(data.top, function(v) {
				$wrapper.find('[name=top]').val(parseInt(v + size.height / -2));	
			});
		},
		applyChangedFieldValue: function(field) {
			var $field = $(field);
			var fieldName = $field.attr('name');
			var fieldValue = parseFloat($field.val())||0;
			
			var cropper = NHIE.workspace.workspace_cropper;
			var cropperStyle = cropper.target.getStyle();

			if(fieldName === 'left') {
				fieldValue -= cropperStyle.marginLeft;
			} else if (fieldName === 'top') {
				fieldValue -= cropperStyle.marginTop;
			}

			var zoom = (NHIE.app.data('navigator-zoom') || 100)/100;
			var style = {};
			style[fieldName] = fieldValue * zoom;
			$(cropper.dom).css(style);
			cropper.syncSize(true);
			
		},
		isCropperModified: function() {
			var $workspace_cropper = NHIE.workspace.$getCropper();
			var workspace_cropper = NHIE.workspace.workspace_cropper;

			var currentTrackerStyle = workspace_cropper.target.getStyle();
			var modified = false;
			_.each(['left','top','width','height'], function(name) {
				var val = parseFloat($workspace_cropper.attr('data-org-'+name));
				modified = modified || (currentTrackerStyle[name] !== val);
			});	

			// 최초 crop 수행시, 작업영역 크기와 기본 cropper 크기가 다른 경우는 무조건 변경되었다 인식하도록 처리
			var workspace_size = NHIE.workspace.getSize();
			if(workspace_size.width != currentTrackerStyle.width || workspace_size.height != currentTrackerStyle.height) {
				modified = true;
			}

			return modified;
		}

	});
});

/**
 * Inline Text Editor for Angular-based Websites
 * @version $VERSION
 * {@link}
 * @license MIT License
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
	module.exports = 'inlineEditor';
}

(function(window,angular)
{
'use strict';

var marked = require('marked');
var AWS = require('aws-sdk');

angular.module('inlineEditor', [])
.factory( 'inlineEditor', inlineEditorFactory)
.factory('inlineEditorItemController', inlineEditorItemController)
.directive('inlineEditor', inlineEditorDirective)
.directive('editorItem', inlineEditorItemDirective)
.directive('s3upload', s3uploadDirective)
;


inlineEditorFactory.$inject = [];
function inlineEditorFactory ()
{
	var factory = {
		data: {},
		initialData: {},
		isAuth: false,
		_call: _call,
		on: on,
		setData: setData,
		updateData: updateData,
		setInitialData: setInitialData,
		updateInitialData: updateInitialData,
		getData: getData,
		getInitialData: getInitialData,
		submitFn: submitFn,
		successFn: successFn,
		failFn: failFn,
		cancelFn: cancelFn
	},
	_events = {}
	;

	function _call (event, data)
	{
		if( _events[event] ) {
			_events[event].call(this, data );
		}
	}

	function on (event, fn)
	{
		_events[event] = fn;
	}

	function setData (data)
	{
		this.data = data;
		this._call.call(this, 'setData', data);
	}

	function updateData (data)
	{
		this.data = angular.merge(this.data, data);
		this._call.call(this, 'updateData', this.data);
	}

	function setInitialData (data)
	{
		this.initialData = data;
		this._call.call(this, 'setInitialData', data);
	}

	function updateInitialData (data)
	{
		this.initialData = angular.merge(this.initialData, data);
		this._call.call(this, 'updateInitialData', this.initialData);
	}

	function getData ()
	{
		return this.data;
	}

	function getInitialData ()
	{
		return this.initialData;
	}

	function submitFn (data)
	{
		this._call.call(this, 'submit', data);
	}

	function successFn (data)
	{
		this._call.call(this, 'success', data);
	}

	function failFn (data)
	{
		this._call.call(this, 'fail', data);
	}

	function cancelFn (data)
	{
		this._call.call(this, 'cancel', data);
	}

	return factory;
}


inlineEditorController.$inject = ['$scope','$element','$attrs','$parse','$compile','$document','inlineEditor','$timeout'];
function inlineEditorController ($scope, $element, $attrs, $parse, $compile, $document, inlineEditor, $timeout)
{
	// if( !inlineEditor.isAuth ) return;
	var _self = this;
	this.visible = false;
	this.min = false;
	this.initialData = {};
	this.scope = $scope.$new();
	this.sectionId = null;
	this.scope.formData = {};
	this.scope.$success = null;
	this.scope.$fail = null;
	this.inlineEditor = inlineEditor;

	var bodyEl = $document.find('body').eq(0);

	// Build Mask
	var maskEl = angular.element('<div>');
	maskEl.attr('class','angular-inline-editor-mask');

	// Build Form Wrap
	var wrapEl = angular.element('<div>');
	wrapEl.attr('class','angular-inline-editor');

	// Build Header
	var headerEl = angular.element('<div>');
	headerEl.attr('class','angular-inline-editor-header');

	var closeEl = angular.element('<a>');
	closeEl.html('x');

	var minEl = angular.element('<a>');
	minEl.html('&ndash;');
	headerEl.append(minEl);
	headerEl.append(closeEl);
	wrapEl.append(headerEl);

	// Build Form
	var formEl = angular.element('<form>');
	formEl.attr('class', 'angular-inline-editor-form');
	formEl.attr('action','');
	formEl.attr('name','inlineForm');

	var buttonsEl = angular.element('<div>');
	buttonsEl.attr('class','angular-inline-editor-buttons');

	var submitEl = angular.element('<button>');
	submitEl.attr('type','submit');
	submitEl.html('Save');
	submitEl.attr('ng-disabled','isLoading');

	var cancelEl = angular.element('<a>');
	cancelEl.html('cancel');

	buttonsEl.append(cancelEl);
	buttonsEl.append(submitEl);

	var messageEl = angular.element('<div>');
	messageEl.html("{{formData.$success || formData.$fail}}");
	messageEl.attr('class','angular-inline-editor-msg');
	messageEl.attr('ng-class','{"success":formData.$success,"fail":formData.$fail,"loading":formData.$loading}')
	formEl.append(messageEl);

	inlineEditor.on('updateData', function (data)
	{
		_self.scope.formData = data;
		inlineEditor.initialData = angular.copy(data);
	});

	inlineEditor.on('loading', function (state)
	{
		_self.scope.isLoading = state;
		if( state ) {
			_self.scope.formData.$success = null;
			_self.scope.formData.$fail = null;
		}
	});

	inlineEditor.on('success', function (msg)
	{
		_self.scope.$success = msg;
		_self.scope.formData.$success = msg;
		_self.scope.$digest();
	});

	inlineEditor.on('fail', function (err)
	{
		_self.scope.$fail = err;
		_self.scope.$digest();
	});

	// Add Elements to Form
	this.addElement = function (element, original, clone)
	{
		$compile(clone)(_self.scope);
		original.replaceWith(clone);
		formEl.append(element);
	}

	this.getUpload = function (onSuccess, onFail, sectionId, itemId)
	{
		var uploadEl = angular.element('<s3upload content="Drag Image Here" on-success="'+ onSuccess +'" on-fail="'+onFail+'" section-id="'+ sectionId +'" item-id="'+ itemId +'"></s3upload>');
		return uploadEl;
	}

	// Toggle Form Display
	this.toggle = function (state)
	{
		if( typeof state !== 'undefined' ) {
			_self.visible = state;
		} else {
			_self.visible = !_self.visible;
		}

		_self.scope.formData.$success = null;
		_self.scope.formData.$fail = null;
		_self.scope.$digest();

		// Display (append) form
		if( _self.visible ) {

			formEl.append(buttonsEl);
			cancelEl.on('click', function ()
			{
				_self.toggle(false);
			});

			closeEl.on('click', function ()
			{
				_self.toggle(false);
			});

			minEl.on('click', function ()
			{
				_self.min = !_self.min;
				if( _self.min ) {
					wrapEl.addClass('min');
				} else {
					wrapEl.removeClass('min');
				}
			});

			formEl.on('submit', function (evt)
			{
				evt.preventDefault();
				inlineEditor.updateInitialData( angular.copy(_self.scope.formData) );
				var updateData = angular.copy(_self.scope.formData) || {};
				updateData = updateData[_self.sectionId];
				updateData.$id = _self.sectionId;
				inlineEditor.submitFn(updateData);
			});

			$compile(formEl)(_self.scope);
			wrapEl.append(formEl);
			bodyEl.append(wrapEl);
			bodyEl.append(maskEl);
			$element.addClass('editing');

		// Remove Form
		} else {
			wrapEl.remove();
			maskEl.remove();
			$element.removeClass('editing');
			// _self.scope.formData = angular.copy(inlineEditor.initialData);
			_self.scope.$apply();
			// _self.sectionId = null;
		}
	}

}

inlineEditorDirective.$inject = ['inlineEditor', '$document'];
function inlineEditorDirective (inlineEditor, $document)
{
	var directive = {
		restrict: 'A',
		controller: inlineEditorController,
		link: {
			pre: function ($scope, $elem, $attr, $controller)
			{
				var sectionId = $attr.inlineEditor;
				if( !sectionId ) return false;
				
				$controller.sectionId = sectionId;
				$controller.scope.formData[sectionId] = {};
				$controller.initialData[sectionId] = {};
				
				if( !inlineEditor.isAuth ) return;
				if( !$attr['inlineEditorNoblock'] ) {				
					$elem.addClass('angular-inline-editor-block');
				}

				$elem.on('click', function (evt)
				{
					evt.preventDefault();
					$controller.toggle();
				})
			}
		}
	};

	return directive;
}

inlineEditorItemController.$inject = ['$scope','$element','$attrs','$parse','$compile','inlineEditor'];
function inlineEditorItemController ($scope, $element, $attrs, $parse, $compile, inlineEditor)
{
	var $parent = $element.parent().controller('inlineEditor');
	if( !inlineEditor.isAuth ) return;
	this.onUploadSuccess = function (data, sectionId, itemId)
	{
		$parent.scope.formData[sectionId][itemId] = data.Location;
		$parent.scope.$apply();
	}

	this.onUploadFail = function (err)
	{
		console.log( 'onUploadFail', err );
	}
}

inlineEditorItemDirective.$inject = ['$document','inlineEditor']
function inlineEditorItemDirective ($document, inlineEditor)
{
	var directive = {
		restrict: 'AE',
		require: '^inlineEditor',
		transclude: false,
		controllerAs: 'editorItem',
		controller: inlineEditorItemController,
		link: function ($scope, $element, $attrs, $controller)
		{
			var itemId = $attrs.editorItem;
			if( !itemId ) return;
			var sectionId = $controller.sectionId;
			if( !sectionId ) return;

			function addWrapper (element, extra)
			{
				var wrap = angular.element('<div>');
				wrap.attr('class','angular-inline-editor-item');
				wrap.append(element);
				if( extra ) {
					wrap.append(extra);
				}

				return wrap;
			}

			// Add NG-BIND
			$element.removeAttr('editor-item');

			var clone = $element.clone();
			var _key = ['formData',sectionId,itemId].join('.');
			var data = {};
			data[sectionId] = {};

			// Determine Input Type
			switch( $element[0].nodeName ) {
				case 'IMG' :
					var element = angular.element('<input>');
					element.attr('name', itemId);
					element.attr('class','angular-inline-editor-input');
					element.attr('ng-model', _key);
					clone.attr('ng-src', '{{'+_key+'}}');
					$scope[itemId] = $element.attr('src');
					data[sectionId][itemId] = $element.attr('src');
					$controller.inlineEditor.updateData(data);
					var upload = $controller.getUpload('editorItem.onUploadSuccess', 'editorItem.onUploadFail', sectionId, itemId);
					$controller.addElement( addWrapper(element, upload), $element, clone);
					break;
				default:
					var element = angular.element('<input>');
					element.attr('name', itemId);
					element.attr('class','angular-inline-editor-input');
					element.attr('ng-model', _key);
					clone.attr('ng-bind-html', _key);
					$scope[itemId] = $element.html();
					data[sectionId][itemId] = $element.html();
					$controller.inlineEditor.updateData(data);
					$controller.addElement( addWrapper(element), $element, clone );
					break;
			}
			if (!inlineEditor.isAuth) return;

			// Add Element to Form
			if( element ) {
				// $controller.addElement( addWrapper(element), $element, clone );
			}
		}
	}

	return directive;
}

function s3uploadDirective ()
{
	var directive = {
		bindToController: true,
		controllerAs: 's3upload',
		restrict: 'E',
		transclude: true,
		template: '<div class="s3upload" ng-bind="s3upload.content"></div>',
		scope: {onSuccess:'=',onFail:'=',prefix:'@',content:'@',sectionId:'@',itemId:'@'},
		controller: function ()
		{
			//
			// Internal
			//
			var _self = this;

			// Defaults
			AWS.config.update({accessKeyId: 'AKIAJDCYLHIAXBDZCK7A', secretAccessKey: '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'});

			// Expose Functions
			this.doUpload = doUpload;

			//
			// Events
			//


			//
			// Triggers
			//


			//
			// Functions
			//

			function doUpload (file)
			{

				var	options = {
						Bucket : 'instantkegs-dev'
					},
					filename = uniqueFilename(file.name),
					params = {
						Key: [_self.prefix,filename].clean().join('/'),
						ContentType: file.type,
						Body: file,
						ACL : 'public-read'
					},
					bucket = new AWS.S3({params:options});

				bucket.upload(params, function (err, data)
				{
					if( err ) {
						_self.onFail(err);
					} else {
						_self.onSuccess(data, _self.sectionId, _self.itemId);
					}
				});
			}


			function uniqueFilename( filename )
			{
				var time = moment().utc().valueOf(),
					timestamp = (time / 1000),
					extension = '.'+filename.split('.').pop(),
					name = filename.replace(extension,''),
					name = (name +'-'+ timestamp).replace(/\s+|\./g, '-') + extension;

				return name;
			}
		},
		link: function ($scope, $elem, $attr, controller)
		{
			var draggedOver = false;

			$elem.on('dragenter', function(){
				$elem.addClass('drag-over');
			});

			$elem.on('dragover', function (evt){
				evt.preventDefault();
				if( !draggedOver ) {
					draggedOver = true;
					$elem.addClass('drag-over');
				}
			});

			$elem.on('dragleave', function () {
				draggedOver = false;
				$elem.removeClass('drag-over');
			});

			$elem.on('dragend', function ()
			{
				draggedOver = false;
				$elem.removeClass('drag-over');
			});

			$elem.bind('drop', function (evt)
			{
				evt.preventDefault();
				$elem.removeClass('drag-over').addClass('loading');
				controller.doUpload(evt.dataTransfer.files[0]);
			})
		}
	}

	return directive;
}

})(window, angular || global.angular);
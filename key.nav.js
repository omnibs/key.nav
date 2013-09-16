//http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
//http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
var injectedJS = "(function(original) {    Element.prototype.addEventListener = function(type, listener, useCapture) { 	var attr = this.getAttribute('_handlerTypes'); 	var types = attr ? attr.split(',') : []; 	var found = false; 	for (var i = 0; i < types.length; ++i) { 	  if (types[i] == type) { 		found = true; 		break; 	  } 	} 	if (!found) { 	  types.push(type); 	}        	this.setAttribute('_handlerTypes', types.join(',')); 	return original.apply(this, arguments);   } })(Element.prototype.addEventListener); (function(original) {   Element.prototype.removeEventListener = function(type, listener, useCapture) { 	var attr = this.getAttribute('_handlerTypes'); 	var types = attr ? attr.split(',') : []; 	var removed = false; 	for (var i = 0; i < types.length; ++i) { 	  if (types[i] == type) { 		types.splice(i, 1); 		removed = true;    		break;        	  }         	}        	if (removed) { 	  this.setAttribute('_handlerTypes', types.join(',')); 	} 	return original.apply(this, arguments);   } })(Element.prototype.removeEventListener);";
var script = document.createElement("script");
script.type = "text/javascript";
script.appendChild(document.createTextNode(injectedJS));
document.documentElement.appendChild(script);

(function ($) {
	var elements = [];
	var tooltips = [];
	var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","-","=","[","]","\\","/","."];
	// necessary because fucking keydown.keyCode + String.fromCharCode are totally unrealiable
	var keyCodes = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 189, 187, 219, 221, 220, 191, 190];
	var keymap = [];
	var tooltipsVisible = false;
	var offset = 0;

	function addTooltip(elm, letter) {
		var style = "position: absolute;z-index: 999999999;color: rgba(0,0,0,0.8);font-weight: bold;text-indent: 0px;background: rgba(255,255,255,0.8);"
					+ "float: none;width: 25px;height: 20px;border: 1px solid rgba(0,0,0,0.3);text-align: center;vertical-align: middle;"
					+ "margin: 0px 0px 0px 0px;font-family: Arial;font-size: 14px;padding: 0px 0px 0px 0px;outline: none;";

		var tooltip = $('<span style="'+style+'">'+letter+'</span>');
		tooltip.css('top',(elm.offset().top) + 'px');
		tooltip.css('left',(elm.offset().left) + 'px');

		$('body').append(tooltip);
		tooltips.push(tooltip);
	}
	function addTooltips() {
		
		var i = 0;
		var offsetSkip = offset;
		$.each(getClickable().filter(function(idx,val){return isScrolledIntoView(val);}), function(idx, val){
			if (i == letters.length) return;
			if (offsetSkip-- > 0) return; // pulamos offset vezes
			elements[letters[i++]] = {elm: val, type: 'click'};
		});

		$.each(getFocusable().filter(function(idx,val){return isScrolledIntoView(val);}), function(idx, val){
			if (i == letters.length) return;
			if (offsetSkip-- > 0) return; // pulamos offset vezes
			elements[letters[i++]] = {elm: val, type: 'focus'};
		});

		elements = unique(elements);
		
		for (i = 0; i<letters.length;i++){
			var val = letters[i];
			if (elements[val] == undefined){
				console.log(val);
				break;
			}
			addTooltip($(elements[val].elm), val);
		}
	}

	function getClickable(){
		var clickable = $('*').filter(function(idx, val){
							// TODO: getEventListeners nao existe fora do console...
							// to testando ver se _handlerTypes do tests.html funciona
							// se funcionar da pra combinar ele com .onclick != undefined ou algo assim
							var evts = this.getAttribute('_handlerTypes');
							return this.onclick != undefined || (evts != undefined && evts.indexOf('click') >= 0);
						});
		$('input[type="submit"],input[type="file"],a[href]').each(function(idx,val){clickable.push(val);});
		return unique(clickable);
	}
	
	function unique(array){
		array = array.toArray != undefined ? array.toArray() : array;
		return array.filter(function (idx) {
			return array.lastIndexOf(array[idx]) === idx;
		});
	}

	function getFocusable(){
		var focusable = $('*').filter(function(idx, val){
							var evts = this.getAttribute('_handlerTypes');
							return this.onfocus != undefined || (evts != undefined && evts.indexOf('focus') >= 0) 
								|| this.onmouseover != undefined || (evts != undefined && evts.indexOf('onmouseover') >= 0);
						});
		$('select,input[type="text"]').each(function(idx,val){focusable.push(val);});
		return focusable;
	}
	
	function isScrolledIntoView(elem) {
		var docViewTop = $(window).scrollTop();
		var docViewBottom = docViewTop + $(window).height();
		
		
		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();

		return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}

	function removeTooltips(){
		for (var i=0;i<tooltips.length;i++){
			$(tooltips[i]).remove();
		}
	}
	
	function simulatedClick(target, options) {
		var event = target.ownerDocument.createEvent('MouseEvents'),
			options = options || {};

		//Set your default options to the right of ||
		var opts = {
			type: options.type                  || 'click',
			canBubble:options.canBubble             || true,
			cancelable:options.cancelable           || true,
			view:options.view                       || target.ownerDocument.defaultView, 
			detail:options.detail                   || 1,
			screenX:options.screenX                 || 0, //The coordinates within the entire page
			screenY:options.screenY                 || 0,
			clientX:options.clientX                 || 0, //The coordinates within the viewport
			clientY:options.clientY                 || 0,
			ctrlKey:options.ctrlKey                 || false,
			altKey:options.altKey                   || false,
			shiftKey:options.shiftKey               || false,
			metaKey:options.metaKey                 || false, //I *think* 'meta' is 'Cmd/Apple' on Mac, and 'Windows key' on Win. Not sure, though!
			button:options.button                   || 0, //0 = left, 1 = middle, 2 = right
			relatedTarget:options.relatedTarget     || null,
		}

		//Pass in the options
		event.initMouseEvent(
			opts.type,
			opts.canBubble,
			opts.cancelable,
			opts.view, 
			opts.detail,
			opts.screenX,
			opts.screenY,
			opts.clientX,
			opts.clientY,
			opts.ctrlKey,
			opts.altKey,
			opts.shiftKey,
			opts.metaKey,
			opts.button,
			opts.relatedTarget
		);

		//Fire the event
		target.dispatchEvent(event);
	}

	var handler = function(e){
		if(keymap[17] && keymap[16] && keymap[18] && (e.keyCode == 16 || e.keyCode == 17 || e.keyCode == 18) && e.type=='keyup'){
			console.log('removeTooltips');
			removeTooltips();
			tooltipsVisible = false;
		}
		
		if (tooltipsVisible){
			// detects up or down, to shift tooltip placement
			if (e.keyCode == 38 || e.keyCode == 40) { // up or down
				var change = e.keyCode - 39;
				offset = offset + (change * 10);
				
				if (offset < 0)
					offset = 0;
				// if (offset+letters.length > elements.length)
					// offset = elements.length-letters.length;
				
				console.log('offsetting: ' + offset);
				removeTooltips();
				addTooltips();
			}
			
			// detects hotkey pressed
			var letter = letters[keyCodes.indexOf(e.keyCode)]; // necessary because fucking keydown.keyCode + String.fromCharCode are totally unrealiable
			var elementFromLetter = elements[letter];
			if (!keymap[e.keyCode] && elementFromLetter != undefined) {
				var elm = elementFromLetter;
				if (elm.type == 'click') {
					console.log('clicking...');
					console.log(elm.elm);
					simulatedClick(elm.elm);
				}
				else if (elm.type == 'focus') {
					console.log('focusing...');
					console.log(elm.elm);
					elm.elm.focus();
				}
			}
		}

		keymap[e.keyCode] = e.type == 'keydown';
		
		if(keymap[17] && keymap[16] && keymap[18]){
			if (tooltipsVisible == true)
				return;
			tooltipsVisible = true;
			offset = 0;
			addTooltips();
		}
	}
	window.onkeydown = handler;
	window.onkeyup = handler;
})(Zepto || jQuery);
//})(jQuery);
//http://stackoverflow.com/questions/5203407/javascript-multiple-keys-pressed-at-once
//http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
var injectedJS = "(function(original) {    Element.prototype.addEventListener = function(type, listener, useCapture) { 	var attr = this.getAttribute('_handlerTypes'); 	var types = attr ? attr.split(',') : []; 	var found = false; 	for (var i = 0; i < types.length; ++i) { 	  if (types[i] == type) { 		found = true; 		break; 	  } 	} 	if (!found) { 	  types.push(type); 	}        	this.setAttribute('_handlerTypes', types.join(',')); 	return original.apply(this, arguments);   } })(Element.prototype.addEventListener); (function(original) {   Element.prototype.removeEventListener = function(type, listener, useCapture) { 	var attr = this.getAttribute('_handlerTypes'); 	var types = attr ? attr.split(',') : []; 	var removed = false; 	for (var i = 0; i < types.length; ++i) { 	  if (types[i] == type) { 		types.splice(i, 1); 		removed = true;    		break;        	  }         	}        	if (removed) { 	  this.setAttribute('_handlerTypes', types.join(',')); 	} 	return original.apply(this, arguments);   } })(Element.prototype.removeEventListener);";
var script = document.createElement("script");
script.type = "text/javascript";
script.appendChild(document.createTextNode(injectedJS));
document.documentElement.appendChild(script);
var elements = []; // array of elements for each valid keyCode

(function ($) {
	var elements = []; // array of elements for each valid keyCode
	var tooltips = [];
	var letters = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","-","=","[","]","\\","/","."];
	// necessary because fucking keydown.keyCode + String.fromCharCode are totally unrealiable
	var keyCodes = [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 189, 187, 219, 221, 220, 191, 190];
	var keymap = [];
	var tooltipsVisible = false;
	var offset = 0;
	
	var tooltipStyle = "position: absolute;z-index: 999999999;color: rgba(0,0,0,0.8);font-weight: bold;text-indent: 0px;background: rgba(255,255,255,0.8);"
					+ "float: none;width: 25px;height: 20px;border: 1px solid rgba(0,0,0,0.3);text-align: center;vertical-align: middle;"
					+ "margin: 0px 0px 0px 0px;font-family: Arial;font-size: 14px;padding: 0px 0px 0px 0px;outline: none;";

	function addTooltip(elm, letter) {
		var pos = {y: elm.offset().top, x: elm.offset().left};

		// find a better way to detect occluded elements
		// this one gets false positives for stuff like <a href=""><span>hi</span></a>
		// elementFromPoint gives us the span, when the clickable dude is the <a>
		if (false && document.elementFromPoint(pos.x,pos.y) != elm[0]) {
			console.log({
				What: 'Possibly occluded element', 
				x: pos.x, 
				y: pos.y, 
				letter: letter, elm:elm
			});

			return;
		}
		
		if (pos.x == 0 && pos.y == 0) {
			console.log({
				What: 'Possibly invisible element', 
				x: pos.x, 
				y: pos.y, 
				letter: letter, elm:elm
			});

			return;
		}
		
		var tooltip = $('<span style="'+tooltipStyle+'">'+letter+'</span>');
		
		tooltip.css('top',(pos.y) + 'px');
		tooltip.css('left',(pos.x) + 'px');

		$('body').append(tooltip);
		tooltips.push(tooltip);
	}
	function addTooltips() {
		elements = [];
		var i = 0;
		var offsetSkip = offset;
		$.each(getClickable().filter(function(val){return isScrolledIntoView(val);}), function(idx, val){
			if (offsetSkip-- > 0) return; // skip 'offset' times
			if (i == keyCodes.length) return; // add only as many tooltips as there are hotkeys available
			elements.push({elm: val, type: 'click'});
			i++;
		});

		$.each(getFocusable().filter(function(val){return isScrolledIntoView(val);}), function(idx, val){
			if (offsetSkip-- > 0) return; // skip 'offset' times
			if (i == keyCodes.length) return; // add only as many tooltips as there are hotkeys available
			elements.push({elm: val, type: 'focus'});
			i++;
		});

		elements = unique(elements);
		
		var temp = [];
		for (i-=1;i>=0;i--){
			var letter = letters[i];
			var keyCode = keyCodes[i];
			temp[keyCode] = elements[i];
			if (elements[i] == undefined){
				console.log('Key.Nav: ['+letter+'='+keyCode+'] has no element assigned');
				break;
			}
			
			if (typeof document.debug_keynav_letter != 'undefined' && letter == document.debug_keynav_letter)
				console.log(elements[i]);

			addTooltip($(elements[i].elm), letter);
		}

		elements = temp;
	}

	function getClickable(){
		var clickable = $('*').filter(function(idx, val){
							// TODO: getEventListeners nao existe fora do console...
							// to testando ver se _handlerTypes do tests.html funciona
							// se funcionar da pra combinar ele com .onclick != undefined ou algo assim
							var evts = this.getAttribute('_handlerTypes');
							return (this.onclick != undefined || (evts != undefined && evts.indexOf('click') >= 0)) && this != window && visible(this);
						});
		$('input[type="submit"],input[type="file"],a[href]').each(function(idx,val) {
			if (visible(val)) clickable.push(val);
		});
		return unique(clickable);
	}
	
	// Definition of visible taken from jquery on:
	// http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/#:visible.2F:hidden_Overhauled
	function visible(elm){
		return elm.offsetWidth > 0 && elm.offsetHeight > 0;
	}

	function unique(array){
		array = array.toArray != undefined ? array.toArray() : array;
		return array.filter(function (val, idx) {
			return array.lastIndexOf(val) === idx;
		});
	}
	
	function getFocusable() {
		var focusable = $('*').filter(function(idx, val){
							var evts = this.getAttribute('_handlerTypes');
							return (this.onfocus != undefined || (evts != undefined && evts.indexOf('focus') >= 0) 
								|| this.onmouseover != undefined || (evts != undefined && evts.indexOf('onmouseover') >= 0)) 
								&& this != window;
								//&& $(this).css('display') != 'none';
						});
		$('select,input[type="text"]').each(function(idx,val) {
			if (visible(val)) focusable.push(val);
		});
		return unique(focusable);
	}
	
	function isScrolledIntoView(elem) {
		if (elem == window) return false;

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
	
	// gotten from somewhere in stackoverflow
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
			//console.log('removeTooltips');
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

				//console.log('offsetting: ' + offset);
				removeTooltips();
				addTooltips();
			}
			
			// detects hotkey pressed
			var elementFromLetter = elements[e.keyCode];
			if (!keymap[e.keyCode] && elementFromLetter != undefined) {
				var elm = elementFromLetter;
				if (elm.type == 'click') {
					//console.log('clicking...');
					//console.log(elm.elm);
					simulatedClick(elm.elm);
				}
				else if (elm.type == 'focus') {
					//console.log('focusing...');
					//console.log(elm.elm);
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

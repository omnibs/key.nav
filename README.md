key.nav
=======

Keyboard Navigation for Chrome inspired on Konqueror's keyboard navigation feature.

Usage:
* Add as developer extension on chrome.
* Open any web page.
* Press CTRL + ALT + SHIFT and see little tooltips appear over every clickable and focusable element on the page.
* Hold CTRL + ALT + SHIFT and press any key shown in any tooltip and Key.nav will click or focus that element.
* Dispose of your mice (not really)

Known issues:
* Flash content is not acessible to the plugin.
* There probably are issues with frames and iframes, didn't test them yet.
* All elements that are :visible by jquery's standards get a tooltip, even if they're occluded, which causes a bit of a mess.

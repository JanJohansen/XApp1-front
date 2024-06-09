export default {
	// NOTE: If using the same event (mousedown) triggering mounting of the component having this directive, 
	// callback will be called right after as the event bubles to the parent (body!) and is captured there!
	mounted(el: Element, bindingArgs, vnode, prevVNode) {
		el.clickOutsideEvent = function (event: MouseEvent) {
			// Check that click was outside the el and its children
			if (!(el == event.target || el.contains(event.target))) {
				// Call calback provided in attribute value
				bindingArgs.value(event)
			}
		}
		document.addEventListener("mousedown", el.clickOutsideEvent)
	},
	unmounted(el) {
		document.removeEventListener("mousedown", el.clickOutsideEvent)
	}
}

/** Usage: 
 * import ClickOutsideDeirective from "./directives/ClickOutsideDirective"
 * app.directive("click-outside", ClickOutsideDeirective)
 **/

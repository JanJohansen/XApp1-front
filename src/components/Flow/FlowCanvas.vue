<template>
	<div class="editor">
		<!-- FIXME: embed contextmenu and mousedown in context-meny element-->
		<context-menu ref="contextmenu">
			<flow-tree-menu-item 
				ref="rootMenu" 
				:items="editorModel.contextMenu.subMenu" 
				@menuSelected="$emit('menuSelected', $event)" 
			/>
		</context-menu>
		<svg
			class="svgCanvas"
			ref="svgCanvas"
			@mousewheel.prevent="zoom($event)"
			:viewBox="viewBox"
			tabindex="1"
			preserveAspectRatio="xMinYMin meet"
			@mousedown.left="mouseDown($event); contextmenu.close();"
			@click.right.prevent.stop="contextmenu.open($event);rootMenu.selectedItem = null;"
		>
			<flow-node
				v-for="node in flowModel.nodes"
				:editorNodeModel="node"
				:newconnection="newconnection"
				:editorModel="editorModel"
				@onnewconnection="newConnection($event)"
			/>
			<!-- @nodeSelected="$emit('nodeSelected', node)" -->
			<flow-connection v-for="(value, name) in flowModel.connections" :key="name" :connection="value" :nodes="flowModel.nodes" />
			<flow-drag-connection v-if="true" :newconnection="newconnection" />

			<!-- New connection 
            <svg:path *ngIf="flow._newConnection"
                class="dragging-connection-line"
                [attr.d]= "getNewConnectionPath(flow._newConnection.x1, flow._newConnection.y1, flow._newConnection.x2, flow._newConnection.y2)"
            >
            </svg:path>-->
		</svg>
	</div>
</template>

<script setup lang="ts">
	import FlowNode from "./FlowNode.vue"
	import FlowConnection from "./FlowConnection.vue"
	import FlowDragConnection from "./FlowDragConnection.vue"
	import ContextMenu from "./ContextMenu.vue"
	import FlowTreeMenu from "./FlowTreeMenu.vue"
	import FlowTreeMenuItem from "./FlowTreeMenuItem.vue"
	import { ref, computed } from "vue"

	const props = defineProps<{
		editorModel: any,
		flowModel: any
	}>()

	const svgCanvas = ref(null)
	const contextmenu = ref(null)
	const rootMenu = ref(null)
	const newconnection = ref({ inNode: null, outNode: null, inIdx: 0, outIdx: 0, dragpos: { x: 0, y: 0 } })
	const vBox = ref({ x: 0, y: 0, w: 900, h: 500 })

	let dragging = false
	let dragstart = null
	let dragPos

	console.log("FlowCanvas.props.editorModel", props.editorModel)

	const viewBox = computed(() => {
		return vBox.value.x + " " + vBox.value.y + " " + vBox.value.w + " " + 10 //this.vBox.h;//"0 0 900 500";
	})

	const mouseDown = (evt) => {
		// console.log("MouseDown", evt)
		evt.preventDefault() // Dont mark text etc.
		window.addEventListener("mousemove", mouseMove)
		window.addEventListener("mouseup", mouseUp)
		dragging = true
		dragstart = { m: cursorPoint(evt), boxX: vBox.x, boxY: vBox.y }
		dragPos = cursorPoint(evt)
		props.editorModel.selectedNode = null
	}
	const mouseMove = (evt) => {
		if (dragging) {
			// console.log(evt);
			var p = cursorPoint(evt)

			//this.vBox.x -= p.x - this.dragPos.x;
			vBox.value.x -= p.x - dragstart.m.x
			vBox.value.y -= p.y - dragstart.m.y
			//this.dragPos = this.cursorPoint(evt);
		}
	}
	const mouseUp = (evt) => {
		window.removeEventListener("mousemove", mouseMove)
		window.removeEventListener("mouseup", mouseUp)
		dragging = false
	}
	const svgKeyDown = (evt) => {}
	const newConnection = (evt) => {
		console.log(evt)
		props.editorModel.connections.push(evt)
	}
	// Get point in global SVG space
	const cursorPoint = (evt) => {
		var pt = svgCanvas.value.createSVGPoint()
		pt.x = evt.clientX
		pt.y = evt.clientY
		var ctm = svgCanvas.value.getScreenCTM()
		return pt.matrixTransform(ctm.inverse())
	}
	const zoom = (evt) => {
		//console.log("Zooming:", evt, -evt.deltaY / 50);
		var factor = -evt.deltaY / 1500
		if (factor > 0 && vBox.value.w < 200) return // Limit zoom
		if (factor < 0 && vBox.value.w > 5000) return // Limit zoom

		var m = cursorPoint(evt)
		let x = vBox.value.x
		let y = vBox.value.y
		let w = vBox.value.w
		let h = (svgCanvas.value.clientHeight / svgCanvas.value.clientWidth) * w

		var dx = (m.x - x) / w
		vBox.value.w -= w * factor
		vBox.value.x += dx * factor * w

		var dy = (m.y - y) / h
		vBox.value.y += dy * factor * h
	}
	const contextmenuSelected = (evt) => {
		// $emit("")
		console.log("MENU!!!!:", evt)
	}
</script>
<style>
	.editor {
		background: lightgray;
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
	}
	.svgCanvas {
		background: darkgray;
		margin: 0;
		flex: 1 1 auto;
	}

	.contextmenu {
		border-radius: 5px;
		background: slategrey;
		padding: 3px;
		border: 1px black solid;
	}

	.contextmenu li {
		list-style-position: inside;
	}
</style>

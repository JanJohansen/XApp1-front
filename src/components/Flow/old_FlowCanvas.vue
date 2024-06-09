<template>
	<div class="editor">
		<!-- touch-position context-menu needed for top level context menu - but not remaining template! -->
		<context-menu touch-position context-menu :context-menu-model="editorModel.contextMenu"/>
		<svg
			class="svgCanvas"
			ref="svgCanvas"
			@mousewheel.prevent="zoom($event)"
			:viewBox="viewBox"
			tabindex="1"
			preserveAspectRatio="xMinYMin meet"
			@mousedown.left="mouseDown($event)"
		>
			<flow-node
				v-for="node in flowModel.nodes"
				:flow-editor-model="props.flowEditorModel"
				:node-id="node.id"
				:nodeModel="node"
				:editorModel="editorModel"
				:newconnection="newconnection"
				:nodes="flowEditorModel.nodeModels"
				:flow-model="flowModel"
				@onnewconnection="newConnection($event)"
			/>
			<flow-connection v-for="(value, name) in flowModel.connections" :key="name" :flow-store="flowEditorModel" :connection="value" />
			<flow-drag-connection v-if="true" :newconnection="newconnection" />
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
	import { IFlowDragConnection, IFlowEditorModel } from "../../common/flowTypes"

	const props = defineProps<{
		flowEditorModel: IFlowEditorModel
		// editorModel: any
		// flowModel: IFlow
	}>()
	let editorModel = props.flowEditorModel.editorModel
	let flowModel = props.flowEditorModel.flowModel
	// let nodes = props.flowEditorModel.nodeModels

	const svgCanvas = ref(null)
	const contextmenu = ref(null)
	const rootMenu = ref(null)
	const newconnection = ref<IFlowDragConnection>({})
	const vBox = ref({ x: 0, y: 0, w: 900, h: 500 })

	let dragging = false
	let dragstart = { m: { x: 0, y: 0 } }
	// let dragstart = null
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
		// dragstart = { m: cursorPoint(evt), boxX: vBox.value.x, boxY: vBox.y }
		dragstart = { m: cursorPoint(evt) }
		dragPos = cursorPoint(evt)
		editorModel.selectedNodeId = []
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
		flowModel.connections.push(evt)
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

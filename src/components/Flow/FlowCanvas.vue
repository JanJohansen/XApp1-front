<template>
	<div
		class="editor"
		ref="editor"
		@mousedown.self.prevent="onEditorMouseDown"
		@mousewheel="canvasZoom"
	>
		{{ flowModel.scale }} | {{ flowModel.origin.x }} |
		{{ flowModel.origin.y }} |
		<!-- touch-position context-menu needed for top level context menu - but not remaining template! -->
		<context-menu
			touch-position
			context-menu
			:context-menu-model="editorModel.contextMenu"
		/>
		<div
			class="canvas"
			ref="canvas"
			:style="getCanvasStyle"
			@mousedown.prevent="onEditorMouseDown"
			v-on:contextmenu.self.prevent
			@wheel="canvasZoom"
		>
			<Node
				v-for="(node, i) in flowModel.nodes"
				:key="i"
				:node="node"
				:flowEditorModel="flowEditorModel"
			/>
			<svg class="svg" id="flowCanvasSVG" style="overflow: visible">
				<flow-connection
					v-for="connection in flowModel.connections"
					:flow-store="flowEditorModel"
					:connection="connection"
				/>
				<flow-drag-connection :flow-editor-model="flowEditorModel" />
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ref, computed, onMounted, onUpdated } from "vue"

	import Node from "./FlowNode.vue"
	import ContextMenu from "./ContextMenu.vue"
	import FlowConnection from "./FlowConnection.vue"
	import FlowDragConnection from "./FlowDragConnection.vue"

	import { TFlowStore } from "../../stores/flowStore"

	const zoomFactor = ref(1.1)
	const panActive = ref(false)
	const panStartX = ref(0)
	const panStartY = ref(0)

	const editor = ref<HTMLElement | null>(null)
	const canvas = ref<HTMLElement | null>(null)

	const props = defineProps<{
		flowEditorModel: TFlowStore
	}>()
	let editorModel = props.flowEditorModel.editorModel
	let flowModel = props.flowEditorModel.flowModel

	// let nodes = props.flowEditorModel.nodeModels

	// TMP TEST!
	// 	onUpdated(()=>{
	// 		console.log("EditorLeft:", editor.value!.getBoundingClientRect().left)
	// 	})

	// onMounted(() => {
	// 	// canvas.value?.addEventListener("mousemove", onTestMouseMoveCanvas)
	// 	// editorModel.offsetLeft = editor.value?.offsetLeft
	// })

	const canvasZoom = (event: WheelEvent) => {
		// event.preventDefault();
		if (!canvas.value) return
		if (event.deltaY == 0) return // Don't react on horizontal wheel!

		const boundingRect = editor.value.getBoundingClientRect()
		const editorLeft = boundingRect.left
		const editorRight = boundingRect.right
		const editorTop = boundingRect.top
		// const caBottom = boundingRect.bottom
		const editorWidth = editorRight - editorLeft

		const canvasX =
			(event.clientX - editorLeft - flowModel.origin.x) / flowModel.scale
		const canvasY =
			(event.clientY - editorTop - flowModel.origin.y) / flowModel.scale
		// const editorX = event.clientX - editorLeft
		// const editorY = event.clientY - editorTop

		// Calculate new scale
		const oldScale = flowModel.scale
		// FIXME: Change to percent pr. zoom . e.g. factor 1.1...
		if (event.deltaY < 0) flowModel.scale = flowModel.scale * zoomFactor.value
		else flowModel.scale = flowModel.scale / zoomFactor.value

		// Limit min + max zoom
		flowModel.scale = Math.max(0.1, flowModel.scale)
		flowModel.scale = Math.min(10, flowModel.scale)

		// Calculate new offsets to maintain point under mouse.
		// Subtract mouse offset * increase in scaling from trnslation, to keep same point under mouse.
		flowModel.origin.x =
			flowModel.origin.x - canvasX * (flowModel.scale - oldScale)
		flowModel.origin.y =
			flowModel.origin.y - canvasY * (flowModel.scale - oldScale)

		// console.log("editorX, clX:", editorX, event.clientX)
		// console.log("editorLeft, editorRight, editorWidth:", editorLeft, editorRight, editorWidth)

		event.preventDefault()
	}

	const onEditorMouseDown = (event: MouseEvent) => {
		if (event.button == 2) {
			// Mouse button 2 "typically" = right button
			editorModel.rightMouseDownPos = { x: event.clientX, y: event.clientY }
			return
		}
		panActive.value = true
		panStartX.value = event.clientX
		panStartY.value = event.clientY

		editorModel.selectedNodeIds.length = 0

		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)

		// console.log("EditorMouseDown: e =", event)
	}

	const onMouseMove = (event: MouseEvent) => {
		if (!panActive.value || !canvas.value) return
		event.preventDefault()

		// if scaling before translating!!! --> const deltaX = (event.clientX - panStartX.value) * canvasScale.value
		const deltaX = event.clientX - panStartX.value
		const deltaY = event.clientY - panStartY.value
		// const p = cursorPoint(event)
		// const deltaX = p.x - panStartX.value
		// const deltaY = p.y - panStartY.value

		flowModel.origin.x += deltaX
		flowModel.origin.y += deltaY

		panStartX.value = event.clientX
		panStartY.value = event.clientY
	}

	const onMouseUp = (event: MouseEvent) => {
		panActive.value = false
		window.removeEventListener("mousemove", onMouseMove)
		window.removeEventListener("mouseup", onMouseUp)
	}

	const getCanvasStyle = computed(() => {
		/*  NOTE: 
			Transfiormation order matters! translation before scaling is not the same as scaling before tramslation.
			The trsnalation will be scaled if done first!
		*/
		return `transform: translate(${flowModel.origin.x}px, ${flowModel.origin.y}px) scale(${flowModel.scale})`
	})
</script>

<style>
	.editor {
		background: #000000ff;
		position: relative;
		overflow: clip;
		height: 100%;
		width: 100%;
		display: flex;
	}
	.canvas {
		background: #ffffff05;
		position: absolute;
		overflow: visible;
		height: 1000000px;
		width: 1000000px;
		transform-origin: top left;
		line-height: 1;
	}
	.canvas > * {
		position: absolute;
	}

	.svg {
		position: absolute;
		overflow: visible;
		pointer-events: none;
	}

	.nodes {
		position: relative;
	}

	.node {
		position: absolute;
		border: 1px solid #000;
		background-color: #fff;
		padding: 10px;
		cursor: move;
	}

	.node > div {
		position: absolute;
		width: 10px;
		height: 10px;
		background-color: #000;
	}

	.wires {
		position: absolute;
		pointer-events: none;
	}

	.wire {
		position: absolute;
		border: 1px solid #000;
	}
</style>

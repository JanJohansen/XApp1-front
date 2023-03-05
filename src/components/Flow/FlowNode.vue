<template>
	<g v-if="n.nodeTypeInfo && n.nodeModel" :transform="'translate(' + flowModelNodeData.x + ',' + flowModelNodeData.y + ')'">
		<defs>
			<linearGradient spreadMethod="pad" y2="0" x2="0" y1="1" x1="0" id="nodeBackgroundGradient">
				<stop offset="0" stop-color="#dddddd" />
				<stop offset="0.6" stop-color="#f7f7f7" />
			</linearGradient>
		</defs>
		<rect
			@mousedown.prevent="mouseDown($event)"
			:class="{
				'node-rect': true,
				'selected-node-rect': editorModel.selectedNodeId == nodeId
			}"
			ry="5"
			rx="5"
			x="0"
			y="0"
			:width="width"
			:height="height"
			fill="url(#nodeBackgroundGradient)"
		/>
		<text ref="svgTextHeading" class="node-name-text" :x="width / 2" y="3" text-anchor="middle" dominant-baseline="hanging">
			{{ n.nodeTypeInfo.nodeType }}
		</text>

		<g
			v-for="(input, name, i) in n.nodeTypeInfo.ins"
			:key="'in_' + name"
			@mousedown.stop.prevent="inputMouseDown($event, i)"
			@mouseup.stop.prevent="inputMouseUp($event, i)"
		>
			<circle class="port-circle" r="10" cx="0" :cy="35 + i * 25" />
			<!-- ref="inTexts" -->
			<text
				:ref="
					(el) => {
						inTextElements[i] = el
					}
				"
				class="node-port-text"
				dominant-baseline="central"
				x="15"
				:y="35 + i * 25"
				>{{ name }}</text
			>
		</g>

		<g
			v-for="(output, name, i) in n.nodeTypeInfo.outs"
			:key="'out_' + name"
			@mousedown.stop.prevent="outputMouseDown($event, i)"
			@mouseup.stop.prevent="outputMouseUp($event, i)"
		>
			<circle class="port-circle" r="10" :cx="width" :cy="35 + i * 25" />
			<!-- ref="outTexts" -->
			<text
				:ref="
					(el) => {
						outTextElements[i] = el
					}
				"
				class="node-port-text"
				dominant-baseline="central"
				text-anchor="end"
				:x="width - 15"
				:y="35 + i * 25"
				>{{ name }}</text
			>
		</g>
	</g>
	<g v-else :transform="'translate(' + flowModelNodeData.x + ',' + flowModelNodeData.y + ')'">
		<rect
			@mousedown.prevent="mouseDown($event)"
			:class="{
				'node-rect': true,
				'selected-node-rect': editorModel.selectedNodeId == nodeId
			}"
			ry="5"
			rx="5"
			x="0"
			y="0"
			:width="width"
			:height="height"
			fill="red"
		/>
		<text ref="svgTextHeading" class="node-name-text" :x="width / 2" y="3" text-anchor="middle" dominant-baseline="hanging">
			Unknown node!
		</text>
	</g>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, computed, defineEmits, watchEffect } from "vue"
	import { IFlowDragConnection, IFlowEditorModel, IFlowNodeTypeInfo, IFlowNode } from "../../common/flowTypes"

	// const props = defineProps(["editorModel", "editorNodeModel", "newconnection"])
	const props = defineProps<{
		flowEditorModel: IFlowEditorModel
		nodeId: string
		newconnection: IFlowDragConnection
	}>()
	const emit = defineEmits(["onnewconnection"])

	// const width = ref(100)
	const svgTextHeading = ref<SVGGraphicsElement>(null)
	const inTextElements = ref<SVGGraphicsElement[]>([])
	const outTextElements = ref<SVGGraphicsElement[]>([])

	let editorModel = props.flowEditorModel.editorModel
	// Get data (nodeModel + nodeTypeInfo) for node
	const n = reactive<{nodeModel: IFlowNode, nodeTypeInfo: IFlowNodeTypeInfo }>({})
	watchEffect( () => {
		n.nodeModel = props.flowEditorModel.nodeModels[props.nodeId]
		if(n.nodeModel) n.nodeTypeInfo = props.flowEditorModel.flowNodeTypeInfos[n.nodeModel.nodeTypeId]
		console.log(props.nodeId, n)
	})

	let flowModelNodeData = props.flowEditorModel.flowModel.nodes[props.nodeId]

	let dragging = false
	let nodeStartX = 0
	let nodeStartY = 0

	onMounted(() => {
		flowModelNodeData.x = flowModelNodeData.x || 0
		flowModelNodeData.y = flowModelNodeData.y || 0
	})

	const width = computed(() => {
		// Calculate with based on texts in node.
		let widths: number[] = []

		// console.log("svgTextHeading.value", svgTextHeading.value)
		if (svgTextHeading.value) widths.push(svgTextHeading.value.getBBox().width)

		if (inTextElements.value) {
			inTextElements.value.forEach((el) => {
				widths.push(el.getBBox().width + 15)
			})
		}
		if (outTextElements.value) {
			let idx = 1
			outTextElements.value.forEach((el: SVGGraphicsElement) => {
				if (!widths[idx]) widths[idx] = 0
				widths[idx++] += el.getBBox().width + 15
			})
		}
		let maxWidth = 0
		for (let w in widths) {
			if (widths[w] > maxWidth) maxWidth = widths[w]
		}

		// width.value = maxWidth + 15
		// FIXME: Dont set width on the model?
		flowModelNodeData.__width = width // Used on connections!
		return maxWidth + 15
	}, {})

	const height = computed(() => {
		if (!n.nodeTypeInfo) return 30
		n.nodeTypeInfo.ins ||= {}
		n.nodeTypeInfo.outs ||= {}
		return Math.max(Object.keys(n.nodeTypeInfo.ins).length, Object.keys(n.nodeTypeInfo.outs).length) * 25 + 30
	})
	const mouseDown = (evt) => {
		evt.stopPropagation()
		console.log("MouseDown:, ", evt)
		window.addEventListener("mousemove", mouseMove)
		window.addEventListener("mouseup", mouseUp)
		dragging = true
		var pos = cursorPoint(evt)
		nodeStartX = pos.x - flowModelNodeData.x
		nodeStartY = pos.y - flowModelNodeData.y

		editorModel.selectedNodeId = props.nodeId // nodeModel._oid
	}
	const mouseMove = (evt) => {
		evt.stopPropagation()
		//console.log("MouseMove:, ", event);
		if (dragging) {
			//console.log("nodeMouseMove:", event);
			var pos = cursorPoint(evt)

			// Only set values if changed! - To avoid sending data change notification on every mouse move!
			// props.node.x = pos.x - nodeStartX
			// props.node.y = pos.y - nodeStartY
			let newX = pos.x - nodeStartX
			let newY = pos.y - nodeStartY
			if (true) {
				// If grid tuned on - FIXME: Make part of flowEditorModel
				newX -= newX % 12.5
				newY -= newY % 12.5
				// props.node.x -= props.node.x % 12.5
				// props.node.y -= props.node.y % 12.5
			}
			if (newX != flowModelNodeData.x) flowModelNodeData.x = newX
			if (newY != flowModelNodeData.y) flowModelNodeData.y = newY
		}
	}
	const mouseUp = (evt) => {
		evt.stopPropagation()
		//console.log("MouseUp:, ", event);
		window.removeEventListener("mousemove", mouseMove)
		window.removeEventListener("mouseup", mouseUp)
		dragging = false
	}
	//-------------------------------------------------------------------------
	// Helpers
	//-------------------------------------------------------------------------
	// Get point in global SVG space
	let svg: any
	const cursorPoint = (evt) => {
		if (!svg) svg = evt.target.ownerSVGElement // Cache this svg element!
		var pt = svg.createSVGPoint()
		pt.x = evt.clientX
		pt.y = evt.clientY
		var ctm = svg.getScreenCTM()
		return pt.matrixTransform(ctm.inverse())
	}
	//-------------------------------------------------------------------------
	// New connection handling
	const inputMouseDown = (evt, i) => {
		console.log("InputMouseDown:", evt, i, n.nodeTypeInfo)
		props.newconnection.startX = flowModelNodeData.x
		props.newconnection.startY = flowModelNodeData.y + i * 25
		props.newconnection.inputNodeId = props.nodeId
		props.newconnection.inputName = Object.keys(n.nodeTypeInfo.ins!)[i]
		props.newconnection.dragpos = cursorPoint(evt)

		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const inputMouseUp = (evt, i) => {
		if (props.newconnection && props.newconnection.outputNodeId) {
			console.log("New connection:", props.newconnection)
			emit("onnewconnection", {
				outputNodeId: props.newconnection.outputNodeId,
				outputName: props.newconnection.outputName,
				inputNodeId: props.nodeId,
				inputName: Object.keys(n.nodeTypeInfo.ins!)[i]
			})
		}
		newConnectorMouseUp()
		// window.removeEventListener("mousemove", newConnectorMouseMove)
		// window.removeEventListener("mouseup", newConnectorMouseUp)
	}
	const outputMouseDown = (evt, i) => {
		props.newconnection.startX = flowModelNodeData.x + width.value
		props.newconnection.startY = flowModelNodeData.y + i * 25
		props.newconnection.outputNodeId = props.nodeId
		props.newconnection.outputName = Object.keys(n.nodeTypeInfo.outs!)[i]
		props.newconnection.dragpos = cursorPoint(evt)
		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const outputMouseUp = (evt, i) => {
		if (props.newconnection && props.newconnection.inputNodeId) {
			console.log("New connection:", props.newconnection)
			emit("onnewconnection", {
				outputNodeId: props.nodeId,
				outputName: Object.keys(n.nodeTypeInfo.outs!)[i],
				inputNodeId: props.newconnection.inputNodeId,
				inputName: props.newconnection.inputName
			})
		}
		newConnectorMouseUp()
		// window.removeEventListener("mousemove", newConnectorMouseMove)
		// window.removeEventListener("mouseup", newConnectorMouseUp)
	}
	const newConnectorMouseMove = (evt) => {
		evt.stopPropagation()
		props.newconnection.dragpos = cursorPoint(evt)
	}
	const newConnectorMouseUp = () => {
		console.log("NewConnMouseUp!")
		props.newconnection.inputNodeId = undefined
		props.newconnection.outputNodeId = undefined
		window.removeEventListener("mousemove", newConnectorMouseMove)
		window.removeEventListener("mouseup", newConnectorMouseUp)
	}
</script>

<style>
	.node-rect {
		stroke: black;
		stroke-width: 1;
		cursor: move;
	}

	.mouseover-node-rect {
		stroke-width: 3;
	}

	.selected-node-rect {
		stroke: blue;
		stroke-width: 3;
	}

	.node-name-text {
		font-weight: bold;
		fill: black;
		text-decoration: underline;
		pointer-events: none;
	}

	.node-port-text {
		pointer-events: none;
	}

	.port-circle {
		fill: white;
		stroke: grey;
		stroke-width: 0.5;

		cursor: pointer;
	}

	.port-circle:hover {
		fill: white;
		stroke: black;
		stroke-width: 3;
	}
</style>

<template>
	<g :transform="'translate(' + editorNodeModel.x + ',' + editorNodeModel.y + ')'">
		<defs>
			<linearGradient
				spreadMethod="pad"
				y2="0"
				x2="0"
				y1="1"
				x1="0"
				id="nodeBackgroundGradient"
			>
				<stop offset="0" stop-color="#dddddd" />
				<stop offset="0.6" stop-color="#f7f7f7" />
			</linearGradient>
		</defs>
		<rect
			@mousedown.prevent="mouseDown($event)"
			:class="{
				'node-rect': true,
				'selected-node-rect': editorModel.selectedNode == editorNodeModel,
			}"
			ry="5"
			rx="5"
			x="0"
			y="0"
			:width="width"
			:height="height"
			fill="url(#nodeBackgroundGradient)"
		/>
		<text
			ref="svgTextHeading"
			class="node-name-text"
			:x="width / 2"
			y="3"
			text-anchor="middle"
			dominant-baseline="hanging"
			>{{ nodeModel.type }}</text
		>

		<g
			v-for="(input, name, i) in nodeModel.ins"
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
			v-for="(output, name, i) in nodeModel.outs"
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
</template>

<script setup lang="ts">
	import { ref, onMounted, computed, defineEmits } from "vue"
	import appBB from "../../WsBBClient"

	const props = defineProps(["editorModel", "editorNodeModel", "newconnection"])
	const emit = defineEmits(["onnewconnection"])

	// const width = ref(100)
	const svgTextHeading = ref<SVGGraphicsElement>(null)
	const inTextElements = ref<SVGGraphicsElement[]>([])
	const outTextElements = ref<SVGGraphicsElement[]>([])
	const nodeModel = ref({ type: "..." })

	let dragging = false
	let nodeStartX = 0
	let nodeStartY = 0

	console.log("NEW NODE:", props.editorNodeModel.id, "=", props.node)

	// Check if node exists
	appBB.exists(props.editorNodeModel.id).then((exists) => {
		if (!exists) {
			// If not - show "missing node"
			console.log("MISSING NODE:", props.editorNodeModel.id, exists)
			nodeModel.value.type = "Unknown?"
		} else {
			// If it does - subcscribe to object
			console.log("EXISTING NODE:", props.editorNodeModel.id, exists)
			appBB.sub(props.editorNodeModel.id, (v, n) => {
				console.log("EXISTING NODE:", n, "=", v)
				nodeModel.value = v
			})
		}
	})
	setTimeout(() => {
		nodeModel.value.type = "Unknown?---1"
		setTimeout(() => {
			nodeModel.value.type = "Unknown?---2"
		}, 2000)
	}, 2000)

	onMounted(() => {
		props.editorNodeModel.x = props.editorNodeModel.x || 0
		props.editorNodeModel.y = props.editorNodeModel.y || 0
	})

	const width = computed(() => {
		// Calculate with based on texts in node.
		let widths: number[] = []

		let test = nodeModel.value.type	// HACK: Force recalculation of the computed propoerty when this reactive value changes!

		console.log("svgTextHeading.value", svgTextHeading.value)
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
		// FIXME: Dont set width onthe model!?
		props.editorNodeModel.__width = width
		return maxWidth + 15
	}, {})

	const height = computed(() => {
		nodeModel.value.ins ||= {}
		nodeModel.value.outs ||= {}
		return (
			Math.max(
				Object.keys(nodeModel.value.ins).length,
				Object.keys(nodeModel.value.outs).length
			) *
				25 +
			30
		)
	})
	const mouseDown = (evt) => {
		evt.stopPropagation()
		//console.log("MouseDown:, ", event);
		window.addEventListener("mousemove", mouseMove)
		window.addEventListener("mouseup", mouseUp)
		dragging = true
		var pos = cursorPoint(evt)
		nodeStartX = pos.x - props.editorNodeModel.x
		nodeStartY = pos.y - props.editorNodeModel.y

		props.editorModel.selectedNode = props.node
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
				// If grid tuned on
				newX -= newX % 12.5
				newY -= newY % 12.5
				// props.node.x -= props.node.x % 12.5
				// props.node.y -= props.node.y % 12.5
			}
			if (newX != props.editorNodeModel.x) props.editorNodeModel.x = newX
			if (newY != props.editorNodeModel.y) props.editorNodeModel.y = newY
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
		if (!svg) svg = evt.target.ownerSVGElement // Cache the svg element!
		var pt = svg.createSVGPoint()
		pt.x = evt.clientX
		pt.y = evt.clientY
		var ctm = svg.getScreenCTM()
		return pt.matrixTransform(ctm.inverse())
	}
	//-------------------------------------------------------------------------
	// New connection handling
	const inputMouseDown = (evt, i) => {
		props.newconnection.value.inNode = props.node
		props.newconnection.inIdx = i
		props.newconnection.dragpos = cursorPoint(evt)
		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const inputMouseUp = (evt, i) => {
		if (props.newconnection && props.newconnection.outNode) {
			var outName = Object.keys(props.newconnection.outNode.outs)[
				props.newconnection.outIdx
			]
			var inName = Object.keys(props.node.ins)[i]
			console.log(
				"New connection:",
				props.newconnection.outNode.type + "." + outName,
				props.node.type + "." + inName
			)
			emit("onnewconnection", {
				outNode: props.newconnection.outNode.nid,
				outName: outName,
				inNode: props.node.nid,
				inName: inName,
			})
		}
		props.newconnection.inNode = null
		props.newconnection.outNode = null
		window.removeEventListener("mousemove", newConnectorMouseMove)
		window.removeEventListener("mouseup", newConnectorMouseUp)
	}
	const outputMouseDown = (evt, i) => {
		props.newconnection.outNode = props.node
		props.newconnection.outIdx = i
		props.newconnection.dragpos = cursorPoint(evt)
		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const outputMouseUp = (evt, i) => {
		if (props.newconnection && props.newconnection.inNode) {
			var inName = Object.keys(props.newconnection.inNode.ins)[
				props.newconnection.inIdx
			]
			var outName = Object.keys(nodeModel.value.outs)[i]
			console.log(
				"New connection:",
				nodeModel.value.type + "." + outName,
				props.newconnection.inNode.type + "." + inName
			)
			emit("onnewconnection", {
				outNode: nodeModel.value.id,
				outName: outName,
				inNode: props.newconnection.inNode.nid,
				inName: inName,
			})
		}
		props.newconnection.inNode = null
		props.newconnection.outNode = null
		window.removeEventListener("mousemove", newConnectorMouseMove)
		window.removeEventListener("mouseup", newConnectorMouseUp)
	}
	const newConnectorMouseMove = (evt) => {
		evt.stopPropagation()
		props.newconnection.dragpos = cursorPoint(evt)
	}
	const newConnectorMouseUp = () => {
		props.newconnection.inNode = null
		props.newconnection.outNode = null
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

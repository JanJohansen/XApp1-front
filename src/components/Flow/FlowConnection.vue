<template>
	<path
		:class="{ connection: true, selected: selected }"
		:d="connectionPath"
		tabindex="-1"
		@mousedown.prevent="mouseDown($event)"
		stroke-linecap="round"
	></path>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue"
	import { IFlowEditorModel, IFlowConnection } from "../../common/flowTypes"
	import {TFlowStore} from "../../stores/flowStore"
	const props = defineProps<{
		flowStore: TFlowStore
		connection: IFlowConnection
	}>()
	let nodes = props.flowStore.nodeModels
	let nodeTypes = props.flowStore.flowNodeTypeInfos

	const selected = ref(false)

	const connectionPath = computed(() => {
		// Find node IO positions
		const outNode = props.flowStore.editorModel.nodes[props.connection.outputNodeId]
		const inNode = props.flowStore.editorModel.nodes[props.connection.inputNodeId]
		if(!outNode || !inNode) return ""

		const output = outNode.outs[props.connection.outputName]
		const input = inNode.ins[props.connection.inputName]
		if(!output || !input) return ""

		// Create path.
		const straightPull = 30
		var d =
			"M " +
			output.x +
			"," +
			output.y +
			" C " +
			(output.x + straightPull) +
			"," +
			output.y +
			" " +
			(input.x - straightPull) +
			"," +
			input.y +
			" " +
			input.x +
			"," +
			input.y		


		// var outNode = nodes[props.connection.outputNodeId]
		// var inNode = nodes[props.connection.inputNodeId]
		// if (!outNode || !inNode) {
		// 	console.log(
		// 		"Error: Node not found for NodeConnection!",
		// 		props.connection.outputNodeId,
		// 		"or",
		// 		props.connection.inputNodeId
		// 	)
		// 	return // error - ignore.
		// }
		// var outNodeType = nodeTypes[outNode.nodeTypeId]
		// var inNodeType = nodeTypes[inNode.nodeTypeId]
		// if (!outNodeType || !inNodeType) {
		// 	console.log(
		// 		"Error: Node Type info not found for NodeConnection!",
		// 		props.connection.outputNodeId,
		// 		"or",
		// 		props.connection.inputNodeId
		// 	)
		// 	return // error - ignore.
		// }
		// // Find port indexes.
		// var outIdx = Object.keys(outNodeType.outs!).indexOf(props.connection.outputName)
		// var inIdx = Object.keys(inNodeType.ins!).indexOf(props.connection.inputName)
		// if (outIdx < 0 || inIdx < 0) {
		// 	console.log("Error: Index of IO name not found in nodes.")
		// 	return // error - ignore.
		// }

		// // console.log("**Indexes", outIdx, inIdx)
		// let EditorInputNodeInfo = props.flowStore.flowModel.nodes[props.connection.inputNodeId]
		// let EditorOutputNodeInfo = props.flowStore.flowModel.nodes[props.connection.outputNodeId]
		// // Create path.
		// const straightPull = 30
		// var d =
		// 	"M " +
		// 	(EditorOutputNodeInfo.x + (EditorOutputNodeInfo.__width || 100) + 0) +
		// 	"," +
		// 	(EditorOutputNodeInfo.y + 28 + outIdx * 25) +
		// 	" C " +
		// 	(EditorOutputNodeInfo.x + (EditorOutputNodeInfo.__width || 100) + 0 + straightPull) +
		// 	"," +
		// 	(EditorOutputNodeInfo.y + 28 + outIdx * 25) +
		// 	" " +
		// 	(EditorInputNodeInfo.x - 0 - straightPull) +
		// 	"," +
		// 	(EditorInputNodeInfo.y + 28 + inIdx * 25) +
		// 	" " +
		// 	(EditorInputNodeInfo.x - 0) +
		// 	"," +
		// 	(EditorInputNodeInfo.y + 28 + inIdx * 25)
		return d
	})

	const mouseDown = (evt) => {
		//console.log("MouseDown:, ", event);
		if (!selected.value) window.addEventListener("mousedown", mousedownHandler)
		selected.value = true
		evt.stopPropagation()
		evt.preventDefault()
	}

	const mousedownHandler = (evt) => {
		//console.log("ExtMouseDown:, ", event);
		selected.value = false
		window.removeEventListener("mousedown", mousedownHandler)
		evt.stopPropagation()
		evt.preventDefault()
	}
</script>

<style scoped>
	.connection {
		stroke: gray;
		stroke-width: 3;
		fill: transparent;
		pointer-events: all;
	}

	.connection:hover {
		stroke: blue;
		stroke-width: 6;
		fill: transparent;
	}

	.selected {
		stroke: red;
		stroke-width: 4;
		fill: transparent;
	}

	.selected:hover {
		stroke: red;
		stroke-width: 6;
		fill: transparent;
	}
</style>

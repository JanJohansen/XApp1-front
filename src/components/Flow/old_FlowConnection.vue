<template>
	<path :class="{ connection: true, selected: selected }" :d="connectionPath" tabindex="-1" @mousedown.prevent="mouseDown($event)"> </path>
</template>

<script setup lang="ts">
	import { ref, defineProps, computed } from 'vue';
	import { IFlowEditorModel, IFlowConnection } from '../../common/flowTypes'
	
	const props = defineProps<{
		flowEditorModel: IFlowEditorModel,
		connection: IFlowConnection, 
	}>()
	let nodes = props.flowEditorModel.nodeModels
	let nodeTypes = props.flowEditorModel.flowNodeTypeInfos

	const selected = ref(false)

	const connectionPath = computed(()=> {
        // Find nodes
        var outNode = nodes[props.connection.outputNodeId];
        var inNode = nodes[props.connection.inputNodeId];
        if(!outNode || !inNode) {
			console.log("Error: Node not found for NodeConnection!", props.connection.outputNodeId, "or", props.connection.inputNodeId)
			return; // error - ignore.
		}
		var outNodeType = nodeTypes[outNode.nodeTypeId];
        var inNodeType = nodeTypes[inNode.nodeTypeId];
		if(!outNodeType || !inNodeType) {
			console.log("Error: Node Type info not found for NodeConnection!", props.connection.outputNodeId, "or", props.connection.inputNodeId)
			return; // error - ignore.
		}
        // Find port indexes.
        var outIdx = Object.keys(outNodeType.outs!).indexOf(props.connection.outputName);
        var inIdx = Object.keys(inNodeType.ins!).indexOf(props.connection.inputName);
        if(outIdx < 0 || inIdx < 0) {
			console.log("Error: Index of IO name not found in nodes.")
			return; // error - ignore.
		}
		
		// console.log("**Indexes", outIdx, inIdx)
		let EditorInputNodeInfo = props.flowEditorModel.flowModel.nodes[props.connection.inputNodeId]
		let EditorOutputNodeInfo = props.flowEditorModel.flowModel.nodes[props.connection.outputNodeId]
        // Create path.
        var d = "M " + (EditorOutputNodeInfo.x + (EditorOutputNodeInfo.__width || 100) + 10) + "," + (EditorOutputNodeInfo.y + 35 + outIdx * 25) +
        " C " + (EditorOutputNodeInfo.x + (EditorOutputNodeInfo.__width || 100)  + 10 + 50) + "," + (EditorOutputNodeInfo.y + 35 + outIdx * 25) +
        " " + (EditorInputNodeInfo.x - 10 - 50) + "," + (EditorInputNodeInfo.y + 35 + inIdx * 25) +
        " " + (EditorInputNodeInfo.x - 10) + "," + (EditorInputNodeInfo.y + 35 + inIdx * 25);
        return d;
	})
	
	const mouseDown = (evt)=> {
	       //console.log("MouseDown:, ", event);
	       if(!selected.value) window.addEventListener("mousedown", mousedownHandler);
	       selected.value = true;
	       evt.stopPropagation();
	       evt.preventDefault();
	}

	const mousedownHandler = (evt)=>{
	       //console.log("ExtMouseDown:, ", event);
	       selected.value = false;
	       window.removeEventListener("mousedown", mousedownHandler);
	       evt.stopPropagation();
	       evt.preventDefault();
	}
	//*************************************************************************
	// Helpers
	//*************************************************************************
	// Get point in global SVG space
	const cursorPoint = (evt)=> {
	       //var pt = evt.target.farthestViewportElement.createSVGPoint();
	       var pt = evt.target.ownerSVGElement.createSVGPoint();
	       pt.x = evt.clientX;
	       pt.y = evt.clientY;
	       //var ctm = evt.target.farthestViewportElement.getScreenCTM();
	       var ctm = evt.target.ownerSVGElement.getScreenCTM();
	       return pt.matrixTransform(ctm.inverse());
	}
</script>

<style scoped>
	.connection {
		stroke: gray;
		stroke-width: 4;
		fill: transparent;
	}

	.connection:hover {
		stroke: blue;
		stroke-width: 6;
		fill: transparent;
	}

	.selected {
		stroke: red;
		stroke-width: 5;
		fill: transparent;
	}

	.selected:hover {
		stroke: red;
		stroke-width: 6;
		fill: transparent;
	}
</style>

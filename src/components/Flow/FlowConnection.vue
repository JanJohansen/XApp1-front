<template>
	<path :class="{ connection: true, selected: selected }" :d="connectionPath" tabindex="-1" @mousedown.prevent="mouseDown($event)"> </path>
</template>

<script setup lang="ts">
	import { ref, defineProps, computed } from 'vue';
	const props = defineProps<{connection: any, nodes: any}>()

	const selected = ref(null)

	const connectionPath = computed(()=> {
        // Find nodes
        var outNode = props.nodes[props.connection.outNode];
        var inNode = props.nodes[props.connection.inNode];
        if(!outNode || !inNode) return; // error - ignore.

        // Find port indexes.
        var outIdx = Object.keys(outNode.outs).indexOf(props.connection.outName);
        var inIdx = Object.keys(inNode.ins).indexOf(props.connection.inName);
        if(outIdx == undefined || inIdx == undefined) return; // error - ignore.

        // Create path.
        var d = "M " + (outNode.x + (outNode.__width || 100) + 10) + "," + (outNode.y + 35 + outIdx * 25) +
        " C " + (outNode.x + (outNode.__width || 100)  + 10 + 50) + "," + (outNode.y + 35 + outIdx * 25) +
        " " + (inNode.x - 10 - 50) + "," + (inNode.y + 35 + inIdx * 25) +
        " " + (inNode.x - 10) + "," + (inNode.y + 35 + inIdx * 25);
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

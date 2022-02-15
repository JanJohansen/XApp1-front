<template>
	<path :class="{ connection: true }" :d="connectionPath" tabindex="-1"> </path>
</template>

<script setup lang="ts">
    import { computed } from "vue";

    const props = defineProps(["newconnection"])

    const connectionPath=computed(()=> {
        if(props.newconnection.inNode){
            // Dragging new connection from an input port.
            let inNode = props.newconnection.inNode;
            let inIdx = props.newconnection.inIdx;
            let dragpos = props.newconnection.dragpos;

            // Create path.
            var d = "M " + (dragpos.x + 10) + "," + dragpos.y +
                " C " + (dragpos.x + 10 + 50) + "," + dragpos.y +
                " " + (inNode.x - 10 - 50) + "," + (inNode.y + 35 + inIdx * 25) +
                " " + (inNode.x - 10) + "," + (inNode.y + 35 + inIdx * 25);
            return d;
        } else if(props.newconnection.outNode){
            // Dragging new connection from an output port.
            let outNode = props.newconnection.outNode;
            let outIdx = props.newconnection.outIdx;
            let dragpos = props.newconnection.dragpos;

            // Create path.
            var d = "M " + (outNode.x + outNode.__width + 10) + "," + (outNode.y + 35 + outIdx * 25) +
            " C " + (outNode.x + outNode.__width + 10 + 50) + "," + (outNode.y + 35 + outIdx * 25) +
            " " + (dragpos.x - 10 - 50) + "," + dragpos.y +
            " " + (dragpos.x - 10) + "," + dragpos.y;
            return d;
        }
        return null;
    })
</script>

<style scoped>
	.connection {
		stroke: red;
		stroke-width: 6;
		fill: transparent;
		pointer-events: none;
	}
</style>

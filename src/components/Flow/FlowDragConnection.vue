<template>
	<path :class="{ connection: true }" :d="connectionPath" tabindex="-1"> </path>
</template>

<script setup lang="ts">
    import { computed } from "vue";
    import { IFlowDragConnection } from "../../common/flowTypes"

    const props = defineProps<{
		newconnection: IFlowDragConnection, 
	}>()

    const connectionPath=computed(()=> {
        let dragpos = props.newconnection.dragpos;
        let connection = props.newconnection

        if(props.newconnection.inputNodeId){
            // Dragging new connection from an input port.
            var d = "M " + (dragpos.x + 10) + "," + dragpos.y +
                " C " + (dragpos.x + 10 + 50) + "," + dragpos.y +
                " " + (connection.startX - 10 - 50) + "," + (connection.startY + 35) +
                " " + (connection.startX - 10) + "," + (connection.startY + 35);
            return d;
        } else if(props.newconnection.outputNodeId){
            // Dragging new connection from an output port.
            var d = "M " + (connection.startX + 10) + "," + (connection.startY + 35) +
            " C " + (connection.startX + 10 + 50) + "," + (connection.startY + 35) +
            " " + (dragpos.x - 10 - 50) + "," + dragpos.y +
            " " + (dragpos.x - 10) + "," + dragpos.y;
            return d;
        }
        return "";
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

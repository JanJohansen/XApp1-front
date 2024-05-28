<template>
	<svg class="svg">
		<path :class="{ connection: true }" :d="connectionPath" tabindex="-1" stroke-linecap="round"></path>
	</svg>
</template>

<script setup lang="ts">
	import { computed } from "vue"
	import { IFlowEditorModel } from "../Flow/types"

	const props = defineProps<{
		flowEditorModel: IFlowEditorModel
	}>()

	const connectionPath = computed(() => {
		const connection = props.flowEditorModel.editorModel.newConnection
		if (connection == null) return ""

		let pull = 0
		if (connection.inputNodeId) pull = 50
		else pull = -50

		var d =
			"M " +
			connection.mouseX +
			"," +
			connection.mouseY +
			" C " +
			(connection.mouseX + pull) +
			"," +
			connection.mouseY +
			" " +
			(connection.startX - pull) +
			"," +
			connection.startY +
			" " +
			connection.startX +
			"," +
			connection.startY
		return d
	})
</script>

<style scoped>
	.svg {
		position: absolute;
		overflow: visible;
		pointer-events: none;
	}
	.connection {
		stroke: red;
		stroke-width: 6;
		fill: transparent;
		pointer-events: none;
	}
</style>

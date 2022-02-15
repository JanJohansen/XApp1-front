<template>
	<div id="list" ref="list">
		<slot></slot>
	</div>
</template>

<style scoped>
#list{
	border: 2px solid blue;
}
</style>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, onUpdated, watchEffect, computed, watch } from "vue"

	// defineProps<{ msg: string }>()

	onMounted(() => {
		console.log("mounted!") // .height.baseVal.value)

		// Handle automatic sizing and resizing...
		// const resizeObserver = new ResizeObserver((entries) => {
		// 	// console.log("RESIZED!", root)
		// 	width = entries[0].contentRect.width
		// 	height = entries[0].contentRect.height
		// 	draw()
		// })
		// resizeObserver.observe(graph.value)
	})
</script>

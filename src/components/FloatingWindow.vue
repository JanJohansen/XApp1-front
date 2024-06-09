<template>
	<div class="floating-window" :style="windowStyle" ref="floatngWindowRef">
		<div @mousedown.prevent.stop="onHeaderMouseDown" style="cursor: grab; margin-bottom: 2px;">
			<slot name="header">hEADER</slot>
		</div>
		<slot>ss</slot>
	</div>
</template>

<script setup lang="ts">
	import { computed, ref, onMounted } from "vue"

	const floatngWindowRef = ref<Element>()
	let grabPosX = 0
	let grabPosY = 0
	let translateX = ref(0)
	let translateY = ref(0)
	const left = ref(0)
	const top = ref(0)

	const props = defineProps<{
		contentClass?: string
	}>()

	onMounted(() => {
		left.value = floatngWindowRef.value!.getBoundingClientRect().left
		top.value = floatngWindowRef.value!.getBoundingClientRect().top
	})

	const onHeaderMouseDown = (event: MouseEvent) => {
		console.log("MouseDown!", translateX.value)
		grabPosX = event.clientX - translateX.value
		grabPosY = event.clientY - translateY.value

		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)
	}

	const onMouseMove = (event: MouseEvent) => {
		console.log("MouseMove!")
		translateX.value = event.clientX - grabPosX
		translateY.value = event.clientY - grabPosY

		let posX = floatngWindowRef.value!.getBoundingClientRect().left
		// if(left.value < 0)
		let posY = floatngWindowRef.value!.getBoundingClientRect().top
	}

	const onMouseUp = (event: MouseEvent) => {
		console.log("MouseUp!")
		window.removeEventListener("mousemove", onMouseMove)
		window.removeEventListener("mouseup", onMouseUp)
	}

	const windowStyle = computed(() => {
		return {
			// left: `${posX.value}px`,
			// top: `${posY.value}px`
			translate: `${translateX.value}px ${translateY.value}px`
		}
	})
</script>

<style scoped>
	.floating-window {
		position: absolute;
		overflow: hidden;
		min-width: 50px;
		min-height: 50px;
		max-height: 100%;

		border: 2px solid darkslategray;
		border-radius: 8px;
		padding: 2px;
	}
</style>

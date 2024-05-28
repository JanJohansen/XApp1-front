<template>
	<q-layout view="hHh LpR fFf" class="bg-dark-900">
		<q-header bordered class="bg-primary text-white">
			<q-toolbar>
				<q-btn v-if="slots.left" dense flat round icon="menu" @click="toggleLeftDrawer" />
				<slot name="top"> </slot>
				<q-space />
				<navigation-menu></navigation-menu>
				<q-btn v-if="slots.right" dense flat round icon="menu" @click="toggleRightDrawer" />
			</q-toolbar>
		</q-header>

		<q-drawer
			v-model="leftDrawerOpen"
			side="left"
			behavior="desktop"
			bordered
			show-if-above
			:width="leftWidth"
			:breakpoint="0"
		>
			<slot name="left"> Left </slot>
			<div v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeLeftDrawer" class="q-left-drawer__resizer" />
		</q-drawer>

		<q-drawer
			v-model="rightDrawerOpen"
			side="right"
			behavior="desktop"
			bordered
			show-if-above
			:width="rightWidth"
			:breakpoint="0"
		>
			<div v-touch-pan.preserveCursor.prevent.mouse.horizontal="resizeRightDrawer" class="q-right-drawer__resizer" />
			<slot name="right"> Right </slot>
		</q-drawer>

		<q-page-container class="column full-height">
			<!-- class="column full-height" needed to allow default slot to fill space in flexbox layout used by quasar q-page-container -->
			<slot> Default slot... </slot>
		</q-page-container>

		<q-footer bordered class="bg-grey-8 text-white">
			<!-- <q-toolbar> -->
			<q-bar dense>
				<slot name="bottom"> </slot>
			</q-bar>
			<!-- </q-toolbar> -->
		</q-footer>
	</q-layout>
</template>

<script setup lang="ts">
	import { ref, useSlots, onMounted } from "vue"
	import NavigationMenu from "./NavigationMenu.vue"

	const slots = useSlots()
	const leftDrawerOpen = ref(false) // computed(slots. .left != undefined) // ref(slots.left != undefined)
	const rightDrawerOpen = ref(false)

	const leftWidth = ref(0)
	const rightWidth = ref(0)
	let initialLeftWidth = -1
	let initialRightWidth = -1

	// Set initial panel sizes based on ocupancy of slots.
	onMounted(()=> {
		leftDrawerOpen.value = slots.left != undefined
		rightDrawerOpen.value = slots.right != undefined

		if(initialLeftWidth < 0) leftWidth.value = 300
		if(initialRightWidth < 0) rightWidth.value = 300
	})

	function toggleLeftDrawer() {
		leftDrawerOpen.value = !leftDrawerOpen.value
	}

	function toggleRightDrawer() {
		rightDrawerOpen.value = !rightDrawerOpen.value
	}

	function resizeLeftDrawer(ev) {
		if (ev.isFirst === true) {
			initialLeftWidth = leftWidth.value
		}
		leftWidth.value = initialLeftWidth + ev.offset.x
	}
	function resizeRightDrawer(ev) {
		if (ev.isFirst === true) {
			initialRightWidth = rightWidth.value
		}
		rightWidth.value = initialRightWidth - ev.offset.x
	}
</script>
<style scoped>
	.q-left-drawer__resizer {
		position: absolute;
		top: 0;
		bottom: 0;
		right: -10px;
		width: 10px;
		background-color: #FFF1;
		cursor: ew-resize;
	}
	.q-right-drawer__resizer {
		z-index: 1000;
		position: absolute;
		top: 0;
		bottom: 0;
		left: -10px;
		width: 10px;
		background-color: #FFF1;
		cursor: ew-resize;
	}
</style>

<template>
	<q-layout view="hHh LpR fFf">
		<q-header bordered class="bg-primary text-white">
			<q-toolbar>
				<q-btn v-if="slots.left" dense flat round icon="menu" @click="toggleLeftDrawer" />
				<slot name="top"> </slot>
				<q-space />
				<navigation-menu></navigation-menu>
				<q-btn v-if="slots.right" dense flat round icon="menu" @click="toggleRightDrawer" />
			</q-toolbar>
		</q-header>

		<q-drawer v-model="leftDrawerOpen" side="left" behavior="desktop" bordered>
			<slot name="left"> Left </slot>
		</q-drawer>

		<q-drawer overlay v-model="rightDrawerOpen" side="right" behavior="desktop" bordered>
			<slot name="right"> Right </slot>
		</q-drawer>

		<q-page-container class="column full-height" >
		<!-- class="column full-height" needed to allow default slot to fill space in flexbox layout used by quasar q-page-container -->
			<slot> Default slot... </slot>
		</q-page-container>

		<q-footer bordered class="bg-grey-8 text-white">
			<!-- <q-toolbar> -->
			<q-bar dense >
				<slot name="bottom"> </slot>
			</q-bar>
			<!-- </q-toolbar> -->
		</q-footer>
	</q-layout>
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
	import { ref, useSlots } from "vue"
	import NavigationMenu from "./NavigationMenu.vue";

	const slots = useSlots()
	const leftDrawerOpen = ref(slots.left != undefined)
	const rightDrawerOpen = ref(slots.right != undefined)

	function toggleLeftDrawer() {
		leftDrawerOpen.value = !leftDrawerOpen.value
	}

	function toggleRightDrawer() {
		rightDrawerOpen.value = !rightDrawerOpen.value
	}
</script>

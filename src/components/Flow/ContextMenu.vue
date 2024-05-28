<template>
	<q-menu anchor="top end" self="top start" transition-duration="0">
		<!-- touch-position context-menu -->
		<q-list dense>
			<q-item
				clickable
				v-for="(item, label) in contextMenuModel"
				@click="(e) => onclick(item, e)"
				v-close-popup="item.subMenu != undefined ? false : true"
				@mouseenter="mouseEnter"
				@mouseleave="mouseLeave"
			>
				<q-item-section :icon="item.icon">
					{{ label }}
				</q-item-section>
				<q-item-section side v-if="item.subMenu">
					<q-icon name="keyboard_arrow_right" />
				</q-item-section>
				<context-menu
					:ref="(el) => setItemRef(el)"
					v-if="item.subMenu"
					:context-menu-model="item.subMenu!"
				></context-menu>
					<!-- v-model="showSubMenu" -->
			</q-item>
			<q-separator />
		</q-list>
	</q-menu>
</template>

<script setup lang="ts">
	import { onMounted, ref } from "vue"
	import ContextMenu from "./ContextMenu.vue"
	import { QMenu } from "quasar"

	interface IContextMenu {
		[label: string]: {
			icon?: string
			onClick?: (e: Event) => void
			subMenu?: IContextMenu
		}
	}

	const props = defineProps<{
		contextMenuModel: IContextMenu
	}>()

	const showSubMenu = ref(false)

	const subMenuEl = ref<QMenu[]>([])
	function setItemRef(el) {
		console.log("Adding ref:", el)
		if (el) {
			subMenuEl.value.push(el)
		}
	}
	
	function onclick(item, e) {
		if (item.onClick) item.onClick(e)
	}
	
	// FIXME: Auto open submenu on hover...
	function mouseEnter() {
		// showSubMenu.value = true
		// console.log("SobMenuEl:", subMenuEl.value[0])
		// subMenuEl.value[0].show()
	}
	function mouseLeave() {
		// showSubMenu.value = false
		// console.log("SobMenuEl:", subMenuEl.value[0])
		// subMenuEl.value[0].show()
	}
</script>

<style scoped></style>

<template>
	<q-menu anchor="top end" self="top start" transition-duration="0">
		<!-- touch-position context-menu -->
		<q-list dense>
			<q-item
				clickable
				v-for="(item, label) in contextMenuModel"
				@click="(e)=>onclick(item, e)"
				v-close-popup="item.subMenu != undefined ? false: true"
			>
				<q-item-section :icon="item.icon">
					{{ label }}
				</q-item-section>
				<q-item-section side v-if="item.subMenu">
					<q-icon name="keyboard_arrow_right" />
				</q-item-section>
				<context-menu v-if="item.subMenu" :context-menu-model="item.subMenu!"></context-menu>
			</q-item>
			<q-separator />
		</q-list>
	</q-menu>
</template>

<script setup lang="ts">
	import { ref } from "vue"
	import ContextMenu from "./ContextMenu.vue"
	// interface IContextMenuItem {
	// 	label?: string
	// 	icon?: string
	// 	onClick?: () => void
	// 	subMenu?: IContextMenuItem[]
	// }
	interface IContextMenu {
		[label: string]: {
			icon?: string
			onClick?: () => void
			subMenu?: IContextMenu
		}
	}

	const props = defineProps<{
		contextMenuModel: IContextMenu
	}>()

	function onclick(item, e){
		if (item.onClick) item.onClick(e)
	}

</script>

<style scoped></style>

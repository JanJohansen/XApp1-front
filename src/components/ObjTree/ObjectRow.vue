<template>
	<tr class="table-row" @click="rowClick">
		<template v-if="typeof value == 'object'">
			<td>
				<div :style="rowStyle(level)">
					<span v-if="expanded">-</span>
					<span v-else>+</span>
					{{ prop }}
				</div>
			</td>
			<td>
				<!-- {{ value }} -->
			</td>
		</template>
		<template v-else>
			<td>
				<div :style="rowStyle(level)">{{ prop }}</div>
			</td>
			<td>
				<transition name="fade" mode="out-in">
					<div :key="value">
						{{ value }}
					</div>
				</transition>
			</td>
		</template>
	</tr>

	<object-row 
		v-if="expanded && typeof value == 'object'" 
		v-for="(v, p) in value" 
		:value="v" 
		:prop="p" 
		:level="level + 1" 
		:expandChildren="expandChildren" />
</template>

<script setup lang="ts">
	import { valueToNode } from "@babel/types"
	import { ref, defineProps, onMounted } from "vue"
	// import ValueRow from "./ValueRow.vue"
	const props = defineProps(["prop", "value", "level", "expandChildren", "tableSettings"])

	const expanded = ref(props.expandChildren)
	const expandChildren = ref(props.expandChildren)

	const rowClick = (e) => {
		expandChildren.value = e.altKey || e.shiftKey || e.ctrlKey
		expanded.value = !expanded.value
	}

	// onMounted(() => {
	// 	console.log("NEW:", props.prop, props.value)
	// })

	const rowStyle = (level: number) => {
		return "margin: 0 " + level * 20 + "px;"
	}
</script>

<style scoped>
	.fade-enter-from {
		color: red;
	}
	.fade-enter-active {
		transition: 10s ease;
	}
</style>

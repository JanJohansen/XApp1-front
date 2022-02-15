<template>
	<tr class="table-row" @click="rowClick" >
		<template v-if="typeof value == 'object'" :key="value">
			<td>
				<div :style="rowStyle(level)">
                    <span v-if="expanded" >-</span>
                    <span v-else >+</span>
                    {{ prop }}
                </div>
			</td>
			<td>
				<!-- {{ propValue }} -->
			</td>
		</template>
		<template v-else>
			<td>
				<div :style="rowStyle(level)">{{ prop }}</div>
			</td>
			<td>
				{{ value }}
			</td>
		</template>
	</tr>

	<object-row
		v-if="expanded && typeof value == 'object'"
		v-for="(v, p) in value"
		:value="v"
		:prop="p"
		:level="level + 1"
        :expandChildren="expandChildren"
	/>
</template>

<script setup lang="ts">
	import { ref, defineProps, onMounted } from "vue"
	import ValueRow from "./ValueRow.vue"
	const props = defineProps(["prop", "value", "level", "expandChildren", "tableSettings"])

    const expanded = ref(props.expandChildren)
    const expandChildren = ref(props.expandChildren)

    const rowClick = (e)=>{
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
	/* tr {
		border: 1px solid lightgray;
	} */
</style>

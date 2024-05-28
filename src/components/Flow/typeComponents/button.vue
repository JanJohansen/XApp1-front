<template>
	<node-template :node="node" :flow-editor-model="flowEditorModel">
		<template #header><span></span></template>
		<template #inputs>
			<q-btn style="margin: 1px auto 1px" dense @click="handleClick">Button</q-btn>
		</template>
	</node-template>
</template>

<script setup lang="ts">
	import { TFlowStore, IChildNodeInfo} from "../../../stores/flowStore"
	import nodeTemplate from "./default.vue"

	const props = defineProps<{
		node: IChildNodeInfo
		flowEditorModel: TFlowStore
	}>()

	const handleClick = function () {
		props.flowEditorModel.vPub(props.node.id + ".ins.in", Date.now())
	}
</script>

<style scoped></style>

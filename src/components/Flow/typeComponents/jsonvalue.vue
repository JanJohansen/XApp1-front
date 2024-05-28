<template>
	<node-template :node="node" :flow-editor-model="flowEditorModel">
		<template #header><span></span></template>
		<div>
			<textarea dense v-model="value" style="width: 100%" @mousedown.stop="" ></textarea>
		</div>
		<q-btn dense :disable="!validJSON" @click="onSendButtonClick">Send</q-btn>
		<q-btn dense @click="onClearButtonClick">Clear</q-btn>
	</node-template>
</template>

<script setup lang="ts">
	import { ref, computed } from "vue"
	import { TFlowStore, IChildNodeInfo } from "../../../stores/flowStore"
	import nodeTemplate from "./default.vue"

	const value = ref('{"Message": "Hey there😀"}')
	// const validJSON = ref(false)

	const props = defineProps<{
		node: IChildNodeInfo
		flowEditorModel: TFlowStore
	}>()

	props.flowEditorModel.vSub(props.node.id + ".ins.in", (v) => {
		value.value = JSON.stringify(v)
	})

	const onInput = (e: Event) => {
		// console.log(value.value)
		// validJSON.value = validateJSON()
	}

	// function validateJSON() {
	// 	try {
	// 		JSON.parse(value.value)
	// 		return true
	// 	} catch {
	// 		return false
	// 	}
	// }
	const validJSON = computed(() => {
		try {
			JSON.parse(value.value)
			return true
		} catch {
			return false
		}
	})

	const onSendButtonClick = function () {
		props.flowEditorModel.vPub(props.node.id + ".outs.out", JSON.parse(value.value))
	}
	const onClearButtonClick = function () {
		value.value = "{}"
	}
</script>

<style scoped></style>

<template>
	<q-scroll-area style="height: 100%">
		<q-table
			style="flex: 1"
			hide-bottom
			:rows="properties"
			:columns="columns"
			row-key="name"
			:rows-per-page-options="[0]"
			dense
			type="table"
			virtual-scroll
			:virtual-scroll-item-size="48"
			:virtual-scroll-sticky-size-start="48"
			:virtual-scroll-sticky-size-end="32"
			:pagination="{ sortBy: 'id', descending: false }"
			separator="vertical"
		>
			<template v-slot:top="props">
				<p class="text-weight-bolder">Properties:&nbsp;</p>
				<p class="text-caption">{{ nodeId }}</p>
			</template>
			<template v-slot:body-cell-value="props">
				<q-td :props="props">
					<q-toggle
						v-if="props.row.inInfo.vType == 'boolean'"
						:false-value="props.row.inInfo.falseString"
						:true-value="props.row.inInfo.trueString"
						v-model="props.row.value"
						dense
					/>
					<!-- TODO: number slider -->
					<q-input 
						v-else-if="props.row.inInfo.vType == 'string'" 
						:model-value="props.row.value" 
						dense filled 
					/>
					<q-select 
						v-else-if="props.row.inInfo.vType == 'enum'"
						v-model="props.value" 
						:options="props.row.inInfo.options" 
						dense 
						options-dense 
						filled 
						menu-shrink
					/>
					<!-- TODO: object -->
					<textarea v-else filled >{{ props }}</textarea>
					<!-- <q-input v-if="props.row.type=='string'" dense :model-value="props.value" /> -->
				</q-td>
			</template>
		</q-table>
	</q-scroll-area>
</template>

<style></style>

<script setup lang="ts">
	import { computed, reactive, ref, watchEffect } from "vue"
	import { IFlowEditorModel, IFlowNode, IFlowNodeTypeInfo } from "../../common/flowTypes"

	const props = defineProps<{
		flowEditorModel: IFlowEditorModel
	}>()
	// const n = reactive<any>({})
	const nodeId = ref(props.flowEditorModel.editorModel.selectedNodeId)
	const nodeModel = ref()
	const nodeTypeInfo = ref()

	watchEffect(() => {
		nodeId.value = props.flowEditorModel.editorModel.selectedNodeId
		nodeModel.value = props.flowEditorModel.nodeModels[nodeId.value]
		if (nodeModel.value) nodeTypeInfo.value = props.flowEditorModel.flowNodeTypeInfos[nodeModel.value.nodeTypeId]
	})

	const properties = computed(() => {
		if (!(nodeModel.value && nodeTypeInfo.value?.ins)) return []
		let properties = []
		for (let inProp in nodeTypeInfo.value.ins) {
			// let value = nodeModel.value.ins[inProp] ?
			// TODO: Get value from nodeModel - or from "nodeId.ins.inx.v"
			properties.push({ name: inProp, inInfo: nodeTypeInfo.value.ins[inProp], value: 42 })

			// IDEA: Icon for each input/output? icon: node.ins[inProp].icon
		}
		return properties
	})

	const columns = [
		{
			align: "left",
			name: "name",
			label: "Input",
			field: "name",
			sortable: true,
			sortOrder: "ad",
			format: (name: string) => name || "??"
		},
		{
			align: "left",
			name: "value",
			label: "Value",
			field: "value",
			sortable: true
			// format: (value: any) => JSON.stringify(value)
		}
	]
</script>

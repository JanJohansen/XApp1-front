<template>
	<q-scroll-area style="height: 100%">
		<q-card class="card" v-if="nodeId">
			<q-card-section class="">
				<div class="text-h4" style="display: inline-block; white-space: nowrap">
					<q-icon v-if="nodeTypeInfo?.icon" :name="nodeTypeInfo?.icon"></q-icon>
					{{ nodeModel?.displayName || nodeTypeInfo?.nodeTypeName }}
					<q-btn icon="edit" dense text-color="green" />
				</div>
				<!-- <q-space />
				<q-btn icon="close" flat round dense v-close-popup /> -->
				<div>{{ nodeId }}</div>
			</q-card-section>

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
					<div class="text-h5">Properties:&nbsp;</div>
				</template>
				<template v-slot:body-cell-value="props">
					<q-td :props="props">
						<!-- <q-toggle
							v-if="props.row.inInfo.vType == 'boolean'"
							:false-value="props.row.inInfo.falseString"
							:true-value="props.row.inInfo.trueString"
							v-model="props.row.value"
							dense
						/>
						<q-slider
							v-else-if="props.row.inInfo.vType == 'number'"
							v-model="props.row.value"
							:min="props.row.inInfo.min"
							:max="props.row.inInfo.max"
							:label-value="props.row.value + props.row.inInfo.unit"
							:step="props.row.inInfo.step"
							label
							label-always
							markers
							dark
							dense
						/>
						<q-input
							v-else-if="props.row.inInfo.vType == 'string'"
							:model-value="props.row.value"
							dense
							filled
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
						<q-input v-if="props.row.type=='string'" dense :model-value="props.value" />
						<textarea v-else style="width: 100%; resize: vertical">{{ props }}</textarea> -->
						<!-- <q-input dense :model-value="props.value" /> -->
						<q-input
							dense
							borderless
							type="text"
							v-model="nodeModel!.config.ins![props.row.name]"
						/>
					</q-td>
				</template>
			</q-table>
		</q-card>
	</q-scroll-area>
</template>

<style></style>

<script setup lang="ts">
	import { computed, reactive, ref, watchEffect } from "vue"
	// import { IFlowEditorModel, IFlowNode, IFlowNodeTypeInfo } from "./types"
	import { IChildNodeInfo, TFlowStore } from "../../stores/flowStore"
	import { IFlowNodeTypeInfo } from "./types"

	const props = defineProps<{
		flowEditorModel: TFlowStore
	}>()
	// const n = reactive<any>({})
	const nodeId = ref(props.flowEditorModel.editorModel.configNodeId)
	const nodeModel = ref<IChildNodeInfo>()
	const nodeTypeInfo = ref<IFlowNodeTypeInfo | null>()

	watchEffect(() => {
		nodeId.value = props.flowEditorModel.editorModel.configNodeId
		nodeModel.value = props.flowEditorModel.flowModel.nodes[nodeId.value]
		console.log("nodeModel:", nodeModel.value)
		if (nodeModel.value) nodeTypeInfo.value = props.flowEditorModel.flowNodeTypeInfos[nodeModel.value.nodeTypeId]
		else nodeTypeInfo.value = null
	})

	const properties = computed(() => {
		if (!(nodeModel.value && nodeTypeInfo.value?.ins)) return []
		let properties = []
		for (let inProp in nodeTypeInfo.value.ins) {
			// TODO: Get value from nodeModel - or from "nodeId.ins.inx.v"
			nodeModel.value.config ||= { ins: {} }
			nodeModel.value.config.ins ||= {} // Ensure ins exist!
			properties.push({
				name: inProp,
				inInfo: nodeTypeInfo.value.ins[inProp],
				// value: JSON.stringify(nodeTypeInfo.value.ins[inProp].default) || 42
				value: nodeModel.value.config.ins[inProp] // nodeTypeInfo.value.ins[inProp].default || 42
			})

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

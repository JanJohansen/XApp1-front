<template>
	<q-dialog v-model="show" position="right" full-height>
		<q-card class="card">
			<q-card-section class="row items-center q-pb-none">
				<div class="text-h6">
					<icon :name="nodeTypeInfo.icon"></icon>
					{{ nodeTypeInfo.nodeTypeName }} ({{ nodeId }})
				</div>
				<q-space />
				<q-btn icon="close" flat round dense v-close-popup />
			</q-card-section>
			<q-card-section>
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
							<!-- TODO: object -->
							<textarea v-else filled>{{ props }}</textarea>
							<!-- <q-input v-if="props.row.type=='string'" dense :model-value="props.value" /> -->
						</q-td>
					</template>
				</q-table>
			</q-card-section>
			<q-card-section>
				<div>{{ nodeTypeInfo.description }}</div>
			</q-card-section>
			<q-card-section>
				<div>Author: {{ nodeTypeInfo.author }}</div>
				<div>Version: {{ nodeTypeInfo.version }}</div>
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script setup lang="ts">
	import { computed, ref, watch, watchEffect } from "vue"
	import { TFlowStore } from "../../stores/flowStore"

	const props = defineProps<{
		store: TFlowStore
	}>()
	// const nodeId = props.store.editorModel.configNodeId

	// Use watcher isnatead of computed, since show model is being written to in q-dialog!
	const show = ref(false)
	watchEffect(() => {
		show.value = props.store.editorModel.configNodeId != ""
	})
	const nodeId = computed(() => {
		return props.store.editorModel.configNodeId
	})
	const nodeModel = computed(() => {
		return props.store.nodeModels[nodeId.value]
	})
	const nodeTypeInfo = computed(() => {
		return props.store.flowNodeTypeInfos[nodeModel.value.nodeTypeId]
	})

	// const nodeId = ref(props.flowEditorModel.editorModel.selectedNodeId)
	// const nodeModel = ref()
	// const nodeTypeInfo = ref()

	// watchEffect(() => {
	// 	nodeId.value = props.flowEditorModel.editorModel.selectedNodeId
	// 	nodeModel.value = props.flowEditorModel.nodeModels[nodeId.value]
	// 	if (nodeModel.value) nodeTypeInfo.value = props.flowEditorModel.flowNodeTypeInfos[nodeModel.value.nodeTypeId]
	// })

	const properties = computed(() => {
		if (!(nodeModel.value && nodeTypeInfo.value?.ins)) return []
		let properties = []
		for (let inProp in nodeTypeInfo.value.ins) {
			// let value = nodeModel.value.ins[inProp] ?
			// TODO: Get value from nodeModel - or from "nodeId.ins.inx.v"
			properties.push({
				name: inProp,
				inInfo: nodeTypeInfo.value.ins[inProp],
				value: 42
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

<style>
	/* .card {
		min-width: 50vw;
		max-width: 90vw;
		min-height: 50vw;
		max-height: 90vw;
	} */
</style>

<template>
	<editor-page-layout>
		<title>ARI - Flow</title>
		<template #top>
			Flow: {{ flowNodeId }}
			<q-space />
			<q-btn label="Deploy flow" color="green" dense @click="flowStore.deployFlow"></q-btn>
		</template>
		<template #left>
			<q-toolbar-title> Flow Items: </q-toolbar-title>
			<q-btn
				align="left"
				style="width: 100%"
				v-for="(val, key) in flowList"
				:icon="val.icon"
				:to="'/flow/' + key"
			>
				&nbsp;&nbsp;{{ val.name }} ({{ key }})</q-btn
			>
			<q-btn style="width: 100%" icon="add" v-on:click="newFlow()"></q-btn>
		</template>
		<template #right width="500">
			<!-- <q-scroll-area style="height: 100%; width: 100%" class="outerScroll">
				<div> -->
					<property-editor :flowEditorModel="flowStore" style="height: 100%" />
					<q-scroll-area style="height: 100%; font-family:monospace; width=500px;">
						<div style="font-size: xx-small; line-height: 100%; white-space: pre-wrap">
							{{
								YAML.stringify(JSON.parse(JSON.stringify(flowStore)), {
									indent: 4
								})
							}}
						</div>
					</q-scroll-area>
				<!-- </div>
			</q-scroll-area> -->
		</template>
		<template #bottom>
			ARI
			<q-btn dense flat>
				<q-badge transparent color="green"> v1.0.0 </q-badge>
			</q-btn>

			&NonBreakingSpace;
			<q-btn dense flat icon="email">
				<q-badge transparent color="yellow">10</q-badge>
			</q-btn>

			&NonBreakingSpace;
			<q-btn dense flat icon="notifications">
				<q-badge transparent color="red">3</q-badge>
			</q-btn>
		</template>

		<div style="flex: 1; height: 100%" class="flow-page">
			<!-- style="flex: 1" needed to fill space in flexbox layout used by quasar q-page-container -->
			<flow-canvas :flowEditorModel="flowStore" />
			<!-- <config-modal :store="flowStore"></config-modal> -->
		</div>
	</editor-page-layout>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, watch, computed, watchEffect } from "vue"
	import { useStore } from "../stores/flowStore"

	import { IFlowModel } from "../common/flowTypes"

	import appBB from "../WsBBClient"
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import flowCanvas from "../components/Flow/FlowCanvas.vue" // @ is an alias to /src
	import PropertyEditor from "../components/Flow/PropertyEditor.vue"
	import configModal from "../components/Flow/ConfigModal.vue"
	import { useRoute } from "vue-router"
	import router from "../routes"
	import { storeToRefs } from "pinia"
	import YAML from "yaml"
	import ConfigModal from "../components/Flow/ConfigModal.vue"

	const route = useRoute()

	const flowStore = useStore()
	const flowList = flowStore.flowList

	// let flowEditorModel: IFlowEditorModel = {
	// 	editorModel: flowStore.editorModel,
	// 	flowModel: flowStore.flowModel,
	// 	flowNodeTypeInfos: flowStore.flowNodeTypeInfos,
	// 	nodeModels: flowStore.nodeModels
	// }

	// TODO: Use nodeId from router-route. Use watchEffect to retrieve new SubFlowNode data
	const flowNodeId = ref<string>(route.params.id as string)

	onMounted(async () => {
		flowStore.loadFlowList()
		flowStore.loadFlowNodeTypeInfos()

		console.log(YAML.stringify(JSON.parse(JSON.stringify(flowStore))))
	})

	function newFlow() {
		flowStore.newFlow()
	}
</script>

<style scoped>
	.flow-page {
		height: 100%;
		color: grey;
	}
	.inputtable {
		/* background-color: black; */
		width: 100%;
		border-top: 2px solid darkslategrey;
		border-bottom: 2px solid darkslategrey;
		/* background-color: darkslategrey; */
	}
	.inputtable tr input {
		display: inline-block;
		width: 100%;
	}
	.inputtable tr textarea {
		display: inline-block;
		width: 100%;
	}
	code {
		white-space: pre-wrap;
	}
	.propExplorer {
		position: absolute;
		right: 0px;
		top: 0;
		bottom: 0;
		background-color: grey;
		border-color: grey;
		border-width: 0px 0px 0px 2px;
		border-style: solid;
		width: 300px;
	}
	.center {
		text-align: center;
		background-color: darkslategrey;
	}
</style>

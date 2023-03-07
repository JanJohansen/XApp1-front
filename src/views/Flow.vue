<template>
	<editor-page-layout>
		<template #top>
			Flow: {{ flowNodeId }}
			<q-space />
			<q-btn label="Deploy flow" color="green" dense></q-btn>
		</template>
		<template #left>
			<q-toolbar-title> Flow Items: </q-toolbar-title>
			<q-btn align="left" style="width: 100%" v-for="(val, key) in flowList" :icon="val.icon" :to="'/flow/' + key">
				&nbsp;&nbsp;{{ val.name }} ({{ key }})</q-btn
			>
			<q-btn style="width: 100%" icon="add" v-on:click="newFlow()"></q-btn>
		</template>
		<template #right>
			<property-editor :flowEditorModel="flowEditorModel">
			</property-editor>
			<q-scroll-area style="height: 100%">
				<div style="font-size: xx-small; line-height: 100%; white-space: pre-wrap">
					<!-- {{ YAML.stringify(flowEditorModel, (key: any, value: any) => (typeof value == "function" ? "F" : value), {}) }} -->
					{{ JSON.stringify(flowEditorModel, null, 4) }}
				</div>
			</q-scroll-area>
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

		<div style="flex: 1">
			<!-- style="flex: 1" needed to fill space in flexbox layout used by quasar q-page-container -->
			<flow-canvas v-if="flowDataLoaded" :flowEditorModel="flowEditorModel" />
			<div v-else>Loading flow data...</div>
		</div>
	</editor-page-layout>
</template>

<script setup lang="ts">
	import { ref, reactive, onMounted, watch, computed, watchEffect } from "vue"
	import { IFlowEditorModel, IFlowModel, IFlowNode, IFlowNodeTypeInfo } from "../common/flowTypes"
	import { patch } from "../common/util"
	import flowCanvas from "../components/Flow/FlowCanvas.vue" // @ is an alias to /src
	import appBB from "../WsBBClient"
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import { useRoute } from "vue-router"
	import PropertyEditor from "../components/Flow/PropertyEditor.vue"
	import YAML from "yaml"
import { NodeTypes } from "@vue/compiler-core"
import router from "../routes"

	const route = useRoute()
	const flowNodeTypes = reactive({})
	const flowList = reactive<{ [flowId: string]: IFlowModel }>({})
	const selectedNode = ref<IFlowNode>()
	const selectedNodeTypeInfo = ref<IFlowNodeTypeInfo>()
	const flowModel = reactive<IFlowModel>({
		_oid: "testID",
		name: "FlowModelName",
		type: ["FlowNode"],
		nodeType: "Flow",
		ins: {},
		outs: {},
		nodes: {},
		connections: []
	})
	const editorModel = reactive({
		selectedNodeId: "",
		contextMenu: computed(generateContextMenu)
	})
	let nodeModels = reactive<{ [nodeId: string]: IFlowNode }>({}) // FIXME: Load dynamically based on nodes in flowModel!
	let flowNodeTypeInfos = reactive<{ [typeName: string]: IFlowNodeTypeInfo }>({})
	let flowEditorModel: IFlowEditorModel = { editorModel, flowModel, flowNodeTypeInfos, nodeModels }

	// TODO: Use nodeId from router-route. Use watchEffect to retrieve new SubFlowNode data
	const flowNodeId = ref<string>(route.params.id as string)
	const flowDataLoaded = ref(true)

	// Load all nodeModels for the nodes used in this FlowModel
	watchEffect(async () => {
		for(let nodeId in flowModel.nodes){
			if(nodeId in nodeModels) continue
			console.log("Getting nodeModel for:", nodeId)
			appBB.sub(nodeId, (upd)=>{
				nodeModels[nodeId] ||= {}
				patch(upd, nodeModels[nodeId])
			})
		}
		// TODO: Unsibscribe and remove nodeModels for nodes removed from this flowmodel.
	})

	onMounted(async () => {
		await loadFlowNodeTypeInfos()
		await loadFlowList()
		await loadFlow()

		// Keep nodeModels updated
		// flowModel.nodes
	})

	async function loadFlowNodeTypeInfos() {
		appBB.sub("idx:type=FlowNodeType", (upd) => {
			for (let flowTypeInfoId in upd) {
				if (upd[flowTypeInfoId] != null) {
					appBB.sub(flowTypeInfoId, (flowTypeInfo) => {
						console.log("flowTypeInfo", flowTypeInfoId, JSON.stringify(upd))
						// group.push({
						// 	label: flowTypeInfo.nodeType,
						// 	icon: "add"
						// })
						flowNodeTypeInfos[flowTypeInfoId] = flowTypeInfo
					})
				} else {
					// TODO: remove ...
				}
			}
		})
	}

	interface IContextMenu {
		[label: string]: {
			icon?: string
			onClick?: () => void
			subMenu?: IContextMenu
		}
	}

	function generateContextMenu() {
		let groupMenu: IContextMenu = {}
		let menu: IContextMenu = {
			"Add function node": {
				icon: "add",
				subMenu: groupMenu
			}
		}
		for (let flowTypeInfoId in flowNodeTypeInfos) {
			let flowTypeInfo = flowNodeTypeInfos[flowTypeInfoId]
			let nodeGroup = flowTypeInfo.nodeGroup
			if (!(nodeGroup in groupMenu)) groupMenu[nodeGroup] = { subMenu: {} }
			groupMenu[nodeGroup].subMenu![flowTypeInfo.nodeType] = {
				icon: flowTypeInfo.icon,
				onClick: (evt) => {
					console.log("Clicked to add", flowTypeInfo, evt)
					// Add new node.
					// Add to FlowNode
					let newNodeId = "~" + Math.random().toString()

					flowModel.nodes[newNodeId] = { id: newNodeId, x: 0, y: 0 }
					// Add model for node... (To be instantiated on server side.)
					appBB.pub(newNodeId, { type: ["FlowNode"], nodeTypeId: flowTypeInfoId })
				}
			}
		}
		return menu
	}

	async function loadFlowList() {
		appBB.sub("idx:type=RootFlow", (upd) => {
			patch(upd, flowList)
			for (let flowId in upd) {
				appBB.sub(flowId, (upd) => {
					flowList[flowId] ||= {}
					patch(upd, flowList[flowId])
				})
			}
		})
	}

	async function loadFlow() {
		console.log("Loading node:", flowNodeId.value)
		// TODO: Create loader "icon"
		if (!(await appBB.exists(flowNodeId.value))) {
			console.log("Flow", flowNodeId.value, "does not exist!")
			// Reload route to first in list
			// flowNodeId.value = Object.keys(flowList)[0]
			router.push({ path: "/flow/" + Object.keys(flowList)[0] })
		}
		console.log("Getting data for flow:", flowNodeId.value)
		appBB.sub(flowNodeId.value, (upd, n) => {
			console.log("Got data for flow:", upd)
			patch(upd, flowModel, { setIfSame: false }) // Dynamically update if model changes on server.
			if (upd.nodes) {
				// update to nodes in flow.
				// Subscribe to these nodes info!
				for (let nodeId in upd.nodes) {
					appBB.sub(nodeId, (upd) => {
						nodeModels[nodeId] ||= {}
						patch(upd, nodeModels[nodeId])
					})
				}
			}
			// flowModel.nodes = v.nodes
			// flowModel.connections = v.connections
			flowDataLoaded.value = true
		})
	}

	function newFlow() {
		console.log("Creating new flow...")
		let newFlowId = "@ID:" + (Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
		let newFlow: IFlowModel = {
			type: ["FlowNode", "RootFlow"],
			nodeTypeId: "Flow",
			name: "New Flow...",
			nodes: {},
			connections: []
		}
		appBB.pub(newFlowId, newFlow)
	}

	// editorModel.contextMenu =[
	// 	{
	// 		label: "Add function node",
	// 		icon: "add",
	// 		subMenu: [
	// 			{
	// 				label: "Logic",
	// 				icon: "add",
	// 				subMenu: [
	// 					{
	// 						label: "And",
	// 						icon: "and",
	// 						onClick: () => {
	// 							console.log("And clicked!")
	// 						}
	// 					},
	// 					{
	// 						label: "Or",
	// 						icon: "or",
	// 						onClick: () => {
	// 							console.log("Or clicked!")
	// 						}
	// 					}
	// 				]
	// 			},
	// 			{
	// 				label: "Timing",
	// 				icon: "clock",
	// 				subMenu: [
	// 					{
	// 						label: "Interval",
	// 						icon: "clock",
	// 						onClick: () => {
	// 							console.log("Interval clicked!")
	// 						}
	// 					},
	// 					{
	// 						label: "Delay",
	// 						icon: "delay",
	// 						onClick: () => {
	// 							console.log("Delay clicked!")
	// 						}
	// 					}
	// 				]
	// 			}
	// 		]
	// 	},
	// 	{
	// 		label: "Do more stuffs",
	// 		icon: "question",
	// 		onClick: () => {
	// 			console.log("More stuffs?")
	// 		}
	// 	}
	// ]
</script>

<style scoped>
	flow-page {
		height: 100%;
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

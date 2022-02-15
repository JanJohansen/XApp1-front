<template>
	<div>
		<flow-canvas
			v-if="flowDataLoaded"
			:editorModel="editorModel"
			:flowModel="flowModel"
			@menuSelected="contextmenuSelected"
		/>
		<div v-else>Loading flow data...</div>
		<aside v-if="editorModel.selectedNode" class="propExplorer">
			<div class="center">Property Explorer</div>
			<div>
				<h2>{{ editorModel.selectedNode?.nodeType || "-" }}</h2>
				<div>{{ editorModel.selectedNode?.description || "-" }}</div>
				<div>ID: {{ editorModel.selectedNode?._id || "-" }}</div>
			</div>
			<div
				v-if="
					editorModel.selectedNode &&
					Object.keys(editorModel.selectedNode.ins).length > 0
				"
			>
				&nbsp;
				<h2>Inputs:</h2>
				<table class="inputtable">
					<tr v-for="(i, name) in editorModel.selectedNode?.ins" :key="i">
						<td>{{ name }}</td>
						<td>
							<input type="text" v-model="i.v" />
							<textarea v-model="i.v" />
						</td>
					</tr>
				</table>
			</div>
			<div
				v-if="
					editorModel.selectedNode &&
					Object.keys(editorModel.selectedNode.outs).length > 0
				"
			>
				&nbsp;
				<h2>Outputs:</h2>
				<table class="inputtable">
					<tr v-for="(o, name) in editorModel.selectedNode?.outs" :key="o">
						<td>{{ name }}</td>
						<td>
							<div>{{ o.v }}</div>
						</td>
					</tr>
				</table>
			</div>
			<code>{{ editorModel.selectedNode }}</code>
		</aside>
	</div>
</template>

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

<script setup lang="ts">
	import { ref, reactive, onMounted, watch } from "vue"
	import { IDbObject, IFlow, IIdDbObject } from "../common/flowTypes"
	import { patch } from "../common/util"
	import flowCanvas from "../components/Flow/FlowCanvas.vue" // @ is an alias to /src
	import appBB from "../WsBBClient"

	const flowModel = reactive({
		nodes: {},
		connections: {},
	})
	const editorModel = reactive({
		selectedNode: null,
		contextMenu: {},
	})

	// let flowNodeCache: any = null
	// TODO: Use nodeId from router-route. Use watchEffect to retrieve new SubFlowNode data
	const flowNodeId = ref("randomFlowNode")
	const flowDataLoaded = ref(false)

	onMounted(async () => {
		await loadFlow()
	})

	async function loadFlow() {
		// TODO: Create loader "icon"
		// get flow structure or root flowNode
		// Get flowNode
		// Display flowNode
		// If desired flowNodeId doesn't exist try the root node.
		if (!(await appBB.exists(flowNodeId.value))) {
			console.log("Flow", flowNodeId.value, "does not exist!")
			// If root node doesn't exist create it and use it!
			flowNodeId.value = "rootFlowNode"
			if (!(await appBB.exists(flowNodeId.value))) {
				console.log("Flow", flowNodeId.value, "does not exist - creating it!")
				appBB.pub("rootFlowNode", {
					id: "rootFlowNode",
					type: "subflowNode",
					ins: {},
					outs: {},
					nodes: [
						{ id: "nodeWithID1", x: 50, y: 10 },
						{ id: "nodeWithID2", x: 350, y: 10 },
					],
					connections: [
						{
							outNode: "nodeWithID1",
							inNode: "nodeWithID2",
							outName: "motion",
							inName: "brightness",
						},
					],
				})
			}
		}
		console.log("Getting data for flow:", flowNodeId.value)
		appBB.sub(flowNodeId.value, (v, n) => {
			flowNodeCache = v
			patch(v.nodes, flowModel.nodes, { setIfSame: false })
			patch(v.connections, flowModel.connections, { setIfSame: false })
			// flowModel.nodes = v.nodes
			// flowModel.connections = v.connections
			flowDataLoaded.value = true
		})
	}

	let flowNodeCache: any = null
	watch(flowModel, (n: any, o: any) => {
		// if (!flowDataLoaded.value) return
		console.log("WATCH:", n, o)
		// TODO: Debounce to not save on every change!
		// FIXME: Only send if we changed something - not if someone else changed something!
		if(flowNodeCache) {
			flowNodeCache.nodes = n.nodes
			flowNodeCache.connections = n.connections
			console.log("PUB:", JSON.stringify(n.nodes))
			appBB.pub(flowNodeId.value, flowNodeCache)
		}
	})

	let contextmenuSelected = (evt: any) => {
		console.log("MenuAction:", evt)
		appBB.pub("newNode", { id: "newNode", type: "newNodeType" })
		flowModel.nodes["newNode"] = { type: "NewNodeType", x: 0, y: 0 }
	}

	editorModel.contextMenu = {
		root: true,
		subMenu: [
			{
				text: "Add function",
				subMenu: [
					{
						text: "Logic",
						subMenu: [{ text: "AND" }, { text: "OR" }, { text: "NOT" }],
					},
					{
						text: "Math",
						subMenu: [{ text: "Add" }],
					},
					{
						text: "Timing",
						subMenu: [{ text: "Ticker" }, { text: "Delay" }],
					},
					{
						text: "System",
						subMenu: [{ text: "Execute" }],
					},
				],
			},
		],
	}
	// const isObj = (obj: any) => obj && typeof obj == "object"
	// const isArr = (arr: any) => Array.isArray(arr)
	// const different = (newO: any, oldO: any): boolean => {
	// 	for (let newP in newO) {
	// 		if (!(newP in oldO)) return true

	// 		if (isObj(newO[newP])) {
	// 			if (isObj(oldO[newP])) return different(newO[newP], oldO[newP])
	// 			else return true
	// 		} else {
	// 			if (isObj(oldO[newP])) return true
	// 			else return newO[newP] != oldO[newP]
	// 		}
	// 	}
	// 	return false
	// }

	// let subflowModel = {
	// 	nid: "nid1",
	// 	type: "subflowNode",
	// 	ins: {},
	// 	outs: {},
	// 	nodes: {
	// 		nid1: {
	// 			x: 50,
	// 			y: 10,
	// 		},
	// 	},
	// 	connections: {},
	// }

	// editorModel.nodes = {
	// 	nid1: {
	// 		nid: "nid1",
	// 		type: "MySGW.Device",
	// 		x: 50,
	// 		y: 10,
	// 		ins: {},
	// 		outs: {
	// 			motion: { type: "oBoolean" },
	// 		},
	// 	},
	// 	nid2: {
	// 		nid: "nid2",
	// 		type: "HueGW.Lamp",
	// 		x: 300,
	// 		y: 10,
	// 		ins: {
	// 			brightness: { type: "iValue" },
	// 			colorTemp: { type: "oNumber" },
	// 		},
	// 		outs: {
	// 			brightness: { type: "oValue" },
	// 			colorTemp: { type: "oNumber" },
	// 		},
	// 		settings: {},
	// 	},
	// 	nid3: {
	// 		nid: "nid3",
	// 		type: "Graph Input",
	// 		x: 550,
	// 		y: 10,
	// 		ins: {},
	// 		outs: {
	// 			name: {},
	// 		},
	// 		settings: {},
	// 	},
	// }
	// editorModel.connections = [
	// 	{
	// 		outNode: "nid1",
	// 		inNode: "nid2",
	// 		outName: "motion",
	// 		inName: "brightness",
	// 	},
	// ]
</script>

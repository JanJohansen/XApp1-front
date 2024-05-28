import { IFlowNode, IFlowConnection, IChildNodeInfo } from "./../common/flowTypes"
import { defineStore } from "pinia"
import { computed, reactive, ref, watch, watchEffect } from "vue"

import { IFlowNodeTypeInfo, IFlowModel, IContextMenu, IEditorModel } from "../components/Flow/types"
import appBB from "../WsBBClient"
import { patch, generateBase64Uuid } from "../common/util"

import { useRoute } from "vue-router"
import router from "../routes"

export * from "../../../back/src/common/flowTypes"

export const useStore = defineStore("flowStore", () => {
	const IOElemSym = Symbol("IOElement")
	const flowList = reactive({}) as { [flowId: string]: IFlowModel }

	// TODO: Use nodeId from router-route. Use watchEffect to retrieve new SubFlowNode data
	const route = useRoute()
	const flowNodeId = ref<string>(route.params.id as string)
	// watch(
	// 	() => route.fullPath,
	// 	async () => {
	// 		console.log("route fullPath updated", route.fullPath)
	// 		console.log("Load new flow...", route.params.id)
	// 	}
	// )

	const flowModel = reactive({
		_oid: "testID",
		name: "FlowModelName",
		type: ["FlowNode"],
		nodeType: "Flow",
		ins: {},
		outs: {},
		nodes: {} as { [nodeId: string]: IChildNodeInfo },
		connections: [] as IFlowConnection[]
	})

	// If id of this flow node chnges, load relevant data!
	watchEffect(() => {
		const id = typeof route.params.id == "string" ? route.params.id : route.params.id[0]
		loadFlow(id)
	})

	// Load all nodeModels for the nodes used in this FlowModel
	watchEffect(async () => {
		for (let nodeId in flowModel.nodes) {
			if (nodeId in nodeModels) continue
			console.log("Getting nodeModel for:", nodeId)
			appBB.oSub(nodeId, (upd) => {
				nodeModels[nodeId] ||= {} as IFlowModel
				patch(upd, nodeModels[nodeId])
			})
		}
		// TODO: Unsibscribe and remove nodeModels for nodes removed from this flowmodel.
	})

	const flowNodeTypeInfos = reactive({}) as { [typeName: string]: IFlowNodeTypeInfo }
	const editorModel = reactive({
		scale: 2.0,
		origin: { x: 0, y: 0 },
		selectedNodeId: "",
		configNodeId: "",
		contextMenu: {}, //contextMenu,
		rightMouseDownPos: { x: 0, y: 0 },
		newConnection: null as {
			outputNodeId?: string
			outputName?: string
			inputNodeId?: string
			inputName?: string
			startX: number
			startY: number
			mouseX: number
			mouseY: number
		} | null,
		// nodes: {} as {
		// 	[nodeId: string]: {
		// 		ins: { [inName: string]: { element: HTMLElement; x: number; y: number } }
		// 		outs: { [inName: string]: { element: HTMLElement; x: number; y: number } }
		// 	}
		// }
		nodes: {} as { [nodeId: string]: IChildNodeInfo }
	})
	const nodeModels = reactive<{ [nodeId: string]: IFlowNode }>({})

	function loadFlowList() {
		// FIXME: Use store.$patch?
		appBB.oSub("idx:type=RootFlow", (upd) => {
			patch(upd, flowList)
			for (let flowId in upd) {
				appBB.oSub(flowId, (upd) => {
					flowList[flowId] ||= {}
					patch(upd, flowList[flowId])
				})
			}
		})
	}
	function loadFlowNodeTypeInfos() {
		appBB.oSub("idx:type=FlowNodeType", (upd) => {
			for (let flowTypeInfoId in upd) {
				if (upd[flowTypeInfoId] != null) {
					appBB.oSub(flowTypeInfoId, (flowTypeInfo) => {
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
	// function loadFlow(flowId: string) {}
	async function loadFlow(flowId: string) {
		console.log("Loading flow:", flowId)
		// TODO: Create loader "icon"
		if (!(await appBB.oExists(flowId))) {
			console.log("Flow", flowId, "does not exist!")
			// Reload route to first in list
			// flowNodeId.value = Object.keys(flowList)[0]
			router.push({ path: "/flow/" + Object.keys(flowList)[0] })
		}

		console.log("Getting data for flow:", flowId)
		appBB.oSub(flowNodeId.value, (upd, n) => {
			console.log("Got data for flow:", upd)
			patch(upd, flowModel, { setIfSame: false }) // Dynamically update if model changes on server.
			if (upd.nodes) {
				// update to nodes in flow.
				for (let nodeId in upd.nodes) {
					nodeModels[nodeId] ||= {} as IFlowNode
					// Subscribe to node model.
					appBB.oSub(nodeId, (upd) => {
						patch(upd, nodeModels[nodeId])
					})
					// Subscribe to node events...
					appBB.vSub(nodeId + ".__UIEvent", (args) => {
						// TODO: Consider if this is the roght place/object to put this reactive variable!
						nodeModels[nodeId].__UIEvent = args
						setTimeout(() => {
							nodeModels[nodeId].__UIEvent = ""
						}, 10)
					})
				}
			}
		})
	}
	async function addNode(nodeTypeId: string, x: number, y: number) {
		console.log("Adding node:", nodeTypeId)
		let newNodeId = generateBase64Uuid()
		// Add model for node... (To be instantiated on server side after deployment of this flow.)
		flowModel.nodes[newNodeId] = { id: newNodeId, x, y, nodeTypeId, config: { ins: {} } }
		// Set initial config based on default values of inputs.
		const nodetype = flowNodeTypeInfos[nodeTypeId]
		if (nodetype && nodetype.ins) {
			for (const input in nodetype.ins) {
				flowModel.nodes[newNodeId].config.ins[input] = nodetype.ins[input].default
			}
		}
	}

	async function removeNode(nodeId: string) {}
	async function moveNode() {}
	async function addConnection() {}
	async function removeConnection() {}

	function setSvgCanvas(svgCanvasElement: Element) {}
	// Get point in global SVG space
	let svg: SVGSVGElement
	function client2CanvasPos(clientX: number, clientY: number) {
		// Find and cache the SVG element used for the canvas. This has been scaled + translated by its containing div.
		// Use this to convert device coordinates to canvas coordinates!! 👍😀
		// if (!svg)
		svg = document.getElementById("flowCanvasSVG")

		const pt = svg.createSVGPoint()
		pt.x = clientX
		pt.y = clientY
		const ctm = svg.getScreenCTM()
		const newPos = pt.matrixTransform(ctm!.inverse())
		return newPos
	}

	function newFlow() {
		console.log("Creating new flow...")
		let newFlowId = "@ID:" + (Math.random() * Number.MAX_SAFE_INTEGER).toString(16)
		let newFlow: IFlowModel = {
			type: ["FlowNode", "RootFlow"],
			nodeTypeId: "Flow",
			name: "New Flow...",
			nodes: {},
			connections: [] as IFlowConnection[]
		}
		appBB.oPub(newFlowId, newFlow)

		flowNodeId.value = newFlowId
	}

	function deployFlow() {
		appBB.oPub(flowNodeId.value, flowModel)
	}

	// computed
	const contextMenu = computed(() => {
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
			groupMenu[nodeGroup].subMenu![flowTypeInfo.nodeTypeName] = {
				icon: flowTypeInfo.icon,
				onClick: (evt: MouseEvent) => {
					console.log("Clicked to add", flowTypeInfo, evt)

					// Add new node.
					const newPos = client2CanvasPos(editorModel.rightMouseDownPos.x, editorModel.rightMouseDownPos.y)
					addNode(flowTypeInfo.nodeTypeId, newPos.x, newPos.y)
				}
			}
		}
		return menu
	})
	editorModel.contextMenu = contextMenu

	return {
		flowModel,
		editorModel,
		nodeModels,
		flowNodeTypeInfos,
		flowList,
		newFlow,
		loadFlowList,
		loadFlowNodeTypeInfos,
		loadFlow,
		deployFlow,
		vPub: appBB.vPub.bind(appBB),
		vSub: appBB.vSub.bind(appBB),

		client2CanvasPos
	}
})

export type TFlowStore = ReturnType<typeof useStore>

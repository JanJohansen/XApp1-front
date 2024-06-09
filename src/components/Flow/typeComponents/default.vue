<template>
	<div class="template-content" ref="nodeRef">
		<slot name="header">
			<div class="function-name">{{ n.nodeTypeInfo?.nodeTypeName }}</div>
		</slot>
		<div class="ios">
			<slot name="inputs">
				<div class="inputs" @mousedown.prevent>
					<div class="input" v-for="inputName in ins">
						<span
							class="input-circle"
							:class="{ 'circle-flash': flash('ins.' + inputName) }"
							@mousedown.stop.prevent="inputMouseDown($event, inputName as string)"
							@mouseup.self="inputMouseUp($event, inputName as string)"
							:ref="
								(el) => {
									updateInput(inputName, el)
								}
							"
						></span>
						<span class="input-name">{{ inputName }}</span>
					</div>
				</div>
			</slot>
			<slot name="ioSplitter">
				<div class="io-splitter" v-if="n.nodeTypeInfo?.ins && n.nodeTypeInfo?.outs" @mousedown.prevent></div>
			</slot>
			<slot name="outputs">
				<div class="outputs" @mousedown.prevent>
					<div
						class="output"
						v-for="outputName in outs"
					>
						<span class="output-name">{{ outputName }}</span>
						<span
							class="output-circle"
							:class="{ 'circle-flash': flash('outs.' + outputName) }"
							@mousedown.stop.prevent="outputMouseDown($event, outputName as string)"
							@mouseup.self="outputMouseUp($event, outputName as string)"
							:ref="
								(el) => {
									updateOutput(outputName, el)
								}
							"
						></span>
					</div>
				</div>
			</slot>
		</div>
	</div>
	<slot></slot>
</template>

<script lang="ts">
// 	// Testing if we can add server side code + info to vue component...

// 	// normal <script>, executed in module scope (only once)
// 	// runSideEffectOnce()

// 	// declare additional options
// 	export default {
// 		nodeType: "Default Node",
// 		desctiption: "Test..."
// 	}
// 	export const NodeInfo = {
// 		nodeType: "DefaultNodeUI",
// 		desctiption: "Test..."
// 	}
</script>

<script setup lang="ts">
	import { reactive, ref, watchEffect, watch, computed } from "vue"
	import { IFlowEditorModel, IFlowNodeTypeInfo, IFlowNode, IChildNodeInfo } from "../../../common/flowTypes"
	import { TFlowStore } from "../../../stores/flowStore"

	const props = defineProps<{
		node: IChildNodeInfo
		flowEditorModel: TFlowStore
		// nodeModel: IFlowNode
		// nodeTypeInfo: IFlowNodeTypeInfo
	}>()
	const emit = defineEmits(["onnewconnection"])

	const nodeRef = ref(null)
	const inputRefs = ref<any>({})
	const outputRefs = ref([])

	let editorModel = props.flowEditorModel.editorModel
	// Get data (nodeModel + nodeTypeInfo) for node
	const n = reactive<{ nodeModel: IFlowNode; nodeTypeInfo: IFlowNodeTypeInfo }>({})
	watchEffect(() => {
		n.nodeModel = props.flowEditorModel.nodeModels[props.node.id]
		n.nodeTypeInfo = props.flowEditorModel.flowNodeTypeInfos[props.node.nodeTypeId]
	})
	const ins = computed(()=>{
		let ins = []
		// Ad inputs from type definition
		for(const input in n.nodeTypeInfo.ins) {
			ins.push(input)
		}
		// Ad inputs from live object definition
		for(const input in n.nodeModel?.ins) {
			ins.push(input)
		}
		return ins
	})
	const outs = computed(()=>{
		let outs = []
		// Ad outputs from type definition
		for(const output in n.nodeTypeInfo.outs) {
			outs.push(output)
		}
		// Ad outputs from live object definition
		for(const output in n.nodeModel?.outs) {
			outs.push(output)
		}
		return outs
	})
	const flash = (arg)=>{
		// console.log("*** DEBUG!", arg)
		if(props.flowEditorModel.nodeModels[props.node.id]?.__UIEvent == arg) return true 
		else return false
	}
	
	// Ensure propoerty exists for later.
	// props.flowEditorModel.nodeModels[props.node.id].__UIEvent = ""
	// watchEffect(()=>{
	// 	console.log("*** DEBUG --- ", val)
	// 	let val = props.flowEditorModel.nodeModels[props.node.id].__UIEvent
	// 	if(val.startsWith("outs.")) {
	// 		flash[val] = true
	// 		flash[val] = false
	// 		// props.flowEditorModel.nodeModels[props.node.id].__UIEvent = ""
	// 	}
	// })

	let flowModelNodeData = props.flowEditorModel.flowModel.nodes[props.node.id]

	function updateInput(name: string | number, el: HTMLElement) {
		// console.log("Updating Input element:", el)
		// const pos = el.getBoundingClientRect()
		// const tl = props.flowEditorModel.client2CanvasPos(pos.x, pos.y)
		// const br = props.flowEditorModel.client2CanvasPos(pos.right, pos.bottom)
		// console.log(tl.x + (br.x - tl.x) / 2, tl.y + (br.y - tl.y) / 2)

		editorModel.nodes ||= {}
		editorModel.nodes[props.node.id] ||= {}
		editorModel.nodes[props.node.id].ins ||= {}
		editorModel.nodes[props.node.id].ins[name] ||= {}
		editorModel.nodes[props.node.id].ins[name].x = flowModelNodeData.x + el?.offsetLeft + el?.clientWidth! / 2 + 2 // 2= node border thickness!!!
		editorModel.nodes[props.node.id].ins[name].y = flowModelNodeData.y + el?.offsetTop + el?.offsetHeight! / 2 + 2

	}

	function updateOutput(name: string | number, el: HTMLElement | null) {
		// console.log("Updating Input element:", el)
		editorModel.nodes ||= {}
		editorModel.nodes[props.node.id] ||= {}
		editorModel.nodes[props.node.id].outs ||= {}
		editorModel.nodes[props.node.id].outs[name] ||= {}
		editorModel.nodes[props.node.id].outs[name].x = flowModelNodeData.x + el?.offsetLeft + el?.offsetWidth! / 2 + 2
		editorModel.nodes[props.node.id].outs[name].y = flowModelNodeData.y + el?.offsetTop + el?.offsetHeight! / 2 + 2
	}

	//-------------------------------------------------------------------------
	// Helper
	// Get point in global SVG space
	let svg: SVGSVGElement
	const client2SvgPos = (clientX: number, clientY: number) => {
		// Find and cache the SVG element used for the canvas. This has been scaled + translated by its containing div.
		// Use this to convert device coordinates to canvas coordinates!! 👍😀
		if (!svg) svg = document.getElementById("flowCanvasSVG")
		const pt = svg.createSVGPoint()
		pt.x = clientX
		pt.y = clientY
		const ctm = svg.getScreenCTM()
		return pt.matrixTransform(ctm.inverse())
	}

	//-------------------------------------------------------------------------
	// New connection handling
	const inputMouseDown = (evt: MouseEvent, name: string) => {
		console.log("InputMouseDown:", evt, name, n.nodeTypeInfo)

		props.flowEditorModel.editorModel.newConnection = {
			inputNodeId: props.node.id,
			inputName: name,
			startX: editorModel.nodes[props.node.id].ins[name].x,
			startY: editorModel.nodes[props.node.id].ins[name].y,
			mouseX: editorModel.nodes[props.node.id].ins[name].x,
			mouseY: editorModel.nodes[props.node.id].ins[name].y
		}
		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const inputMouseUp = (evt: MouseEvent, name: string) => {
		console.log("inputMouseUp")
		const connection = props.flowEditorModel.editorModel.newConnection
		if (connection) {
			console.log("New connection:", connection)
			props.flowEditorModel.flowModel.connections.push({
				outputNodeId: connection.outputNodeId!,
				outputName: connection.outputName!,
				inputNodeId: props.node.id,
				inputName: name
			})
		}
		// newConnectorMouseUp()
	}
	const outputMouseDown = (evt: MouseEvent, name: string) => {
		// console.log("CWidth:", nodeRef.value.clientWidth)
		props.flowEditorModel.editorModel.newConnection = {
			outputNodeId: props.node.id,
			outputName: name,
			startX: editorModel.nodes[props.node.id].outs[name].x,
			startY: editorModel.nodes[props.node.id].outs[name].y,
			mouseX: editorModel.nodes[props.node.id].outs[name].x,
			mouseY: editorModel.nodes[props.node.id].outs[name].y
		}
		window.addEventListener("mousemove", newConnectorMouseMove)
		window.addEventListener("mouseup", newConnectorMouseUp)
	}
	const outputMouseUp = (evt: MouseEvent, name: string) => {
		const connection = props.flowEditorModel.editorModel.newConnection
		console.log("outputMouseUp", connection)
		if (connection) {
			console.log("New connection:", connection)
			props.flowEditorModel.flowModel.connections.push({
				outputNodeId: props.node.id,
				outputName: name,
				inputNodeId: connection.inputNodeId!,
				inputName: connection.inputName!
			})
		}
		// newConnectorMouseUp()
	}
	const newConnectorMouseMove = (evt: MouseEvent) => {
		// console.log("MouseMove:", evt.clientX)
		// evt.stopPropagation()
		let mouseCanvasPos = client2SvgPos(evt.clientX, evt.clientY)
		props.flowEditorModel.editorModel.newConnection!.mouseX = mouseCanvasPos.x
		props.flowEditorModel.editorModel.newConnection!.mouseY = mouseCanvasPos.y
	}
	const newConnectorMouseUp = () => {
		console.log("NewConnMouseUp!")
		props.flowEditorModel.editorModel.newConnection = null
		window.removeEventListener("mousemove", newConnectorMouseMove)
		window.removeEventListener("mouseup", newConnectorMouseUp)
	}
</script>

<style scoped>
	.template-content {
		/* border: 3px solid red; */
	}
</style>

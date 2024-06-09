<template>
	<div
		v-if="props.node != null"
		class="function-block"
		:style="getNodeStyle"
		@mousedown.self.prevent.stop="nodeMouseDown"
		:class="{ 'selected-node-rect': editorModel.selectedNodeIds.includes(node.id) }"
	>
		<div class="node-toolbar" @mousedown.prevent.stop="nodeMouseDown">
			<q-icon name="edit" @click="editorModel.editNodeId = props.node.id" />
			<q-icon name="settings" @click="editorModel.configNodeId = props.node.id"	/>
		</div>
		<!-- Node status - below node/function block -->
		<div class="function-node-id" @mousedown.prevent.stop="nodeMouseDown">
			<span>{{ n.nodeModel?.deployed == true ? "Deployed" : "UnDeployed" }}</span
			>: {{ node.id }}
		</div>
		<!-- <div v-if="n.nodeModel == null" class=".error-function-block" @mousedown.self.prevent.stop="nodeMouseDown">
			Unknown node ID!
		</div> -->
		<div v-if="n.nodeTypeInfo == null" class=".error-function-block" @mousedown.self.prevent.stop="nodeMouseDown">
			Unknown nodeTypeId: {{ n.nodeModel.nodeTypeId }}
		</div>
		<div
			v-else-if="dynamicNodeContentComponent == null"
			class=".error-function-block"
			@mousedown.self.prevent.stop="nodeMouseDown"
		>
			Component UI missing from server.
		</div>
		<div v-else @mousedown.stop="nodeMouseDown">
			<component
				v-if="dynamicNodeContentComponent"
				:is="dynamicNodeContentComponent"
				:node="node"
				:flowEditorModel="flowEditorModel"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { reactive, computed, watchEffect, shallowRef } from "vue"
	import { IFlowEditorModel, IFlowNodeTypeInfo, IFlowNode, IChildNodeInfo } from "../../common/flowTypes"
	import { TFlowStore } from "../../stores/flowStore"

	const props = defineProps<{
		flowEditorModel: TFlowStore
		node: IChildNodeInfo | null
	}>()

	const dynamicNodeContentComponent = shallowRef(null)
	const n = reactive<{ nodeModel: IFlowNode | null; nodeTypeInfo: IFlowNodeTypeInfo | null }>({
		nodeModel: null,
		nodeTypeInfo: null
	})
	let editorModel = props.flowEditorModel.editorModel
	const flowModel = props.flowEditorModel.flowModel

	const snapX = 10
	const snapY = 10
	let grabPosX = 0
	let grabPosY = 0

	// let flowModelNodeData = props.flowEditorModel.flowModel.nodes[props.node.id]

	const loadComponent = async (componentPath: string) => {
		dynamicNodeContentComponent.value = (await import(componentPath)).default
	}

	// Get data (nodeModel + nodeTypeInfo) for node
	watchEffect(() => {
		if(props.node == null) return 
		n.nodeModel = props.flowEditorModel.nodeModels[props.node.id]
		n.nodeTypeInfo = props.flowEditorModel.flowNodeTypeInfos[props.node.nodeTypeId]

		// FIXME: Use UI id from type info...
		if (n.nodeTypeInfo) {
			if (n.nodeTypeInfo.nodeUiTypeId) {
				loadComponent("../Flow/typeComponents/" + n.nodeTypeInfo.nodeUiTypeId + ".vue")
			} else loadComponent("../Flow/typeComponents/default.vue")
		}

		// console.log(props.node.id, n)
	})

	const nodeMouseDown = (event: MouseEvent) => {
		grabPosX = event.clientX - (props.node.x - snapX / 2) * flowModel.scale
		grabPosY = event.clientY - (props.node.y - snapY / 2) * flowModel.scale

		if(event.ctrlKey || event.shiftKey) editorModel.selectedNodeIds.push(props.node!.id)
		else editorModel.selectedNodeIds[0] = props.node!.id

		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup", onMouseUp)
	}

	const onMouseMove = (event: MouseEvent) => {
		// props.node.x = (event.clientX - nodeOffsetX) / flowModel.scale
		// props.node.y = (event.clientY - nodeOffsetY) / flowModel.scale
		let newX = (event.clientX - grabPosX) / flowModel.scale
		let newY = (event.clientY - grabPosY) / flowModel.scale

		// Snapo to grid
		newX = Math.ceil(newX / snapX) * snapX
		newY = Math.ceil(newY / snapY) * snapY
		if (newX != props.node.x) props.node.x = newX
		if (newY != props.node.y) props.node.y = newY
	}

	const onMouseUp = (event: MouseEvent) => {
		window.removeEventListener("mousemove", onMouseMove)
		window.removeEventListener("mouseup", onMouseUp)
	}

	const getNodeStyle = computed(() => {
		return {
			left: `${props.node.x}px`,
			top: `${props.node.y}px`
		}
	})
</script>

<style>
	/* Don't scope theese as they are reused in child node-templates! */

	.function-block {
		position: absolute;
		background-color: #151515;
		border: 2px solid #666;
		border-radius: 5px;
		padding: 0px 2px 0px 2px;
		cursor: grab;
	}

	.function-block:hover {
		border-color: red;
	}

	.selected-node-rect {
		border: 2px solid red;
	}

	.error-function-block {
		background-color: #ff0000;
		border: 2px solid #ffffff;
	}

	.function-block .node-toolbar {
		position: absolute;
		top: -1.1rem;
		right: -0.1rem;
		cursor: pointer;
		color: grey;
		opacity: 0;
		transition: opacity 0.5s ease-in;
		/* display: none; */
	}
	.function-block:hover .node-toolbar {
		/* display: block; */
		opacity: 1;
		transition: opacity 0s ease-in;
	}

	.function-node-id {
		font-size: 0.3rem;
		opacity: 0.5;
		position: absolute;
		bottom: -0.5rem;
	}
	.function-name {
		color: lightblue;
		text-align: center;
		font-size: 16px;
		font-weight: bold;
		user-select: none;
	}

	.ios {
		display: flex;
		justify-content: space-between;
		color: white;
	}

	.io-splitter {
		background-color: rgb(43, 43, 43);
		width: 1px;
	}

	.inputs,
	.outputs {
		font-size: 0.8rem;
	}

	.input {
		opacity: 1;
	}

	.output {
		opacity: 1;
	}

	.input-name,
	.output-name {
		opacity: 1;
	}

	.input-name {
		display: inline-block;
		position: relative;
		left: -7px;
	}

	.output-name {
		display: inline-block;
		position: relative;
		right: -7px;
		text-align: right;
	}

	.input-circle,
	.output-circle {
		display: inline-block;
		position: relative;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background-color: black;
		border: 1px solid grey;
		cursor: crosshair;
		transition: background-color 1s;
		transition-timing-function: ease-out;
	}

	.input-circle {
		left: -10px;
		top: 3px;
	}

	.output-circle {
		right: -10px;
		top: 3px;
	}

	.circle-flash {
		/* border: 3px solid white; */
		background-color: gray;
		transition: 0s;
		/* transition-timing-function: linear; */
	}

	.input-circle:hover,
	.output-circle:hover {
		/* background-color: red; */
		border: 2px solid white;
	}
</style>

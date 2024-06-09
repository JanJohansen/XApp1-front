import { IChildNodeInfo, IFlowModel, IFlowNode, IFlowNodeTypeInfo } from "../../../../back/src/common/flowTypes"

export interface IEditorModel {
	selectedNodeIds: string[]
	configNodeId: string
	editNodeId: string
	contextMenu: any
	rightMouseDownPos: { x: number, y: number }
	newConnection: {
		outputNodeId?: string
		outputName?: string
		inputNodeId?: string
		inputName?: string
		startX: number
		startY: number
		mouseX: number
		mouseY: number
	} | null
	nodes: { [nodeId: string]: IChildNodeInfo }
}

export interface IFlowEditorModel {
	editorModel: IEditorModel
	flowModel: IFlowModel
	flowNodeTypeInfos: { [typeName: string]: IFlowNodeTypeInfo }
	nodeModels: { [nodeId: string]: IFlowNode }
	// findNode: ()=>{}
}

export interface IContextMenu {
	[label: string]: {
		icon?: string
		onClick?: (evt: MouseEvent) => void
		subMenu?: IContextMenu
	}
}
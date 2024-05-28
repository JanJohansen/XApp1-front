
import { IFlowModel, IFlowNode, IFlowNodeTypeInfo } from "../../../../back/src/common/flowTypes"

export * from "../../../../back/src/common/flowTypes"

export interface IEditorModel {
	scale: number
	origin: { x: number; y: number }
	selectedNodeId: string
	contextMenu: any
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
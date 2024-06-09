function on(ioName: string, cb: (value: any)=>void): void {}
function set(ioName: string, value: any): void {}


// abstract class ModelInstance {
// 	nodeId: string
// 	bb: BB
// 	nodeModel: IFlowNode
// 	constructor(bb: BB, nodeId: string, nodeModel: IFlowNode) {
// 		this.bb = bb
// 		this.nodeId = nodeId
// 		this.nodeModel = nodeModel
// 		setImmediate(this.initializeBaseNode.bind(this))
// 	}
// 	private async initializeBaseNode() {
// 		// Define "static" part of the object model to replresent instnce.
// 		// Messages and UI variable to be sent via vPub...
// 		this.bb.oPub(this.nodeId, {
// 			type: "FlowNode",
// 			flowNodeTypeId: this.typeInfo?.nodeTypeId,
// 			deployed: true 
// 		}) 
// 		// // set default inputs if not existing
// 		// this.bb.oSub(this.nodeId, (nodeUpd: IFlowNode) => {
// 		// 	if (nodeUpd.nodeTypeId) {
// 		// 		this.bb.oSub(nodeUpd.nodeTypeId, (nodeTypeUpd: IFlowNodeTypeInfo) => {
// 		// 			if (nodeTypeUpd.ins) {
// 		// 				for (let input in nodeTypeUpd.ins) {
// 		// 					if (!this.bb.vExists(this.nodeId + ".ins." + input)) {
// 		// 						// Input doesn't exist as variable. Create it.
// 		// 						let inputType = nodeTypeUpd.ins[input]
// 		// 						if ("default" in inputType)
// 		// 							this.bb.vPub(this.nodeId + ".ins." + input, inputType.default)
// 		// 						else console.log("***NO default value")
// 		// 					} else console.log("***Value exists")
// 		// 				}
// 		// 			}
// 		// 		})
// 		// 	} 
// 		// })

// 		// Run node specific setup
// 		// await this.setup() // Set up specialized node as per implementation.
// 	}
// 	abstract setup(): Promise<void> // Implemented by node Type definition! - Lifecycle handler called in FlowCore.
// 	async close() {
// 		// TODO: Store state?
// 		// TODO: Unsubscribe all?
// 		// more cleanup?
// 	}
// 	set(path: string, value: any): void {
// 		this.bb.vPub(this.nodeId + "." + path, value)
// 		this.bb.vPub(this.nodeId + ".__UIEvent", path)
// 		log.debug("SET:" + this.nodeId + "." + path, "=", value)
// 	}
// 	on(path: string, cb: (value: any, path: string) => void): void {
// 		// FIXME: Returned path not same as subscribed path as nodeId is added!
// 		console.log("ModelInstnce SUBBIING", this.nodeId + ":" + path)

// 		// -----------------------------------------------------------------------------------------------
// 		// FIXME: No object with id path + ins.x.v created???

// 		this.bb.vSub(this.nodeId + "." + path, (...args) => {
// 			// Call callback
// 			cb(...args)
// 			// Indicate IO event to UI model.
// 			this.bb.vPub(this.nodeId + ".__UIEvent", path)
// 		})
// 	}
// 	onAny(cb: (value: any, path: string) => void): void {}
// 	onAll(paths: string[], cb: (value: any, path: string) => void): void {}

// 	log = {
// 		developer: console.log
// 	}
// }
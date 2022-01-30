import { AriProtocolHandler } from "./AriProtocolHandler"

class AriWsClient {
	private protocolHandler = new AriProtocolHandler()
	private authenticated: boolean = false

	private ws?: WebSocket
	private pingTimer: number = 0
	public pingInterval: number = 10000
	public reconnectInterval!: number
	public connected: boolean = false
	public ping: number = -1

	// Public API
	call = this.protocolHandler.call.bind(this.protocolHandler)
	notify = this.protocolHandler.notify.bind(this.protocolHandler)
	on = this.protocolHandler.on.bind(this.protocolHandler)

	constructor(config: any = undefined) {
		this._connect()

		// Incomming msgs
		// this.protocolHandler.on("upd", (args) => {
		// 	// console.log("UPD:", args, this.subs)
		// 	let sub = this.subs[args.subId]
		// 	if (sub) {
        //         // console.log("Sub found")
		// 		sub.cb(args.patch, sub.iName, sub.iVal)
		// 	}
		// })

	}

	//-------------------------------------------------------------------------
	// Public API


	// async upsert(obj: any): Promise<IIdObject> {
	// 	console.log("upsert->:", obj)
	// 	return this.protocolHandler.call("upsert", obj)
	// }
	// async find(indexName: string, indexValue: string): Promise<string[]> {
	// 	console.log("find->:")
	// 	return await this.protocolHandler.call("find", {
	// 		iName: indexName,
	// 		iVal: indexValue
	// 	})
	// }
	// async get(indexName: string, indexValue: string): Promise<IIdObject> {
	// 	console.log("get->:")
	// 	return await this.protocolHandler.call("get", {
	// 		iName: indexName,
	// 		iVal: indexValue
	// 	})
    // }
    // subs: {[subId:number]: {iName: string, iVal: any, cb: (upd: any, iName: string, iVal: any)=>void}} = {}
	// async sub(indexName: string, indexValue: string, cb: (patc: object, indexName: string, indexValue: string) => void): Promise<number> {
	// 	// console.log("sub->:")
    //     let subId = await this.protocolHandler.call("sub", { iName: indexName, iVal: indexValue })
    //     // console.log("sub-stting subId", subId)
    //     this.subs[subId] = {iName: indexName, iVal: indexValue, cb}
    //     return subId
	// }

	// pub(id: string, value: any) {
	//     console.log("PUB->:", value)
	//     this.protocolHandler.notify("pub", { id, value })
	// }
	// // sub(id: string, cb: (obj: any) => void) {
	// //     let result: any
	// //     if (!this.subs[id]) {
	// //         // No subscriptions for this id yet...
	// //         this.subs[id] = []
	// //         console.log("SUB->:", id)
	// //         this.protocolHandler.notify("sub", id)
	// //     }
	// //     this.subs[id].push(cb)
	// // }
	// sub(sub: any, cb: (value: any, id?: string) => void) {
	//     let id = sub._$id
	//     if (!this.subs[id]) {
	//         // No subscriptions for this id yet...
	//         this.subs[id] = []
	//         console.log("SUB->:", id)
	//         this.protocolHandler.notify("sub",sub)
	//     }
	//     this.subs[id].push(cb)
	// }

	// // unsub(id: string, cb: (value: any, id: string) => number) {
	// //     if (this.subs[id]) {
	// //         let idx = this.subs[id].indexOf(cb)
	// //         if (idx) this.subs[id].splice(idx, 1)
	// //         if(this.subs[id].length == 0) {
	// //             delete this.subs[id]
	// //             console.log("UNSUB->:", id)
	// //             this.protocolHandler.notify("unsub", { id })
	// //         }
	// //     }
	// // }
	// unsub(id: string, cb: (value: any) => void) {
	//     if (this.subs[id]) {
	//         let idx = this.subs[id].indexOf(cb)
	//         if (idx) this.subs[id].splice(idx, 1)
	//         if (this.subs[id].length == 0) {
	//             delete this.subs[id]
	//             console.log("UNSUB->:", id)
	//             this.protocolHandler.notify("unsub", { id })
	//         }
	//     }
	// }

	// advsub(path: any, cb: (obj: any) => void) {
	//     this.protocolHandler.notify("advsub", path)
	// }
	// advunsub(path: any, cb: (obj: any) => void) {
	//     this.protocolHandler.notify("advunsub", path)
	// }

	// async call(id: string, args: any) {
	//     console.log("CallRemote:", id, args)
	//     return this.protocolHandler.call("call", { id, args })
	// }

	//-------------------------------------------------------------------------
	// Helpers
	offlineMsgs: string[] = []
	_connect() {
		this.ws = new WebSocket("ws://" + window.location.hostname + ":3002") //"ws://localhost:3001")
		var self = this

		this.protocolHandler.out_send = (msg: string) => {
			if (this.ws!.readyState == this.ws!.OPEN) this.ws!.send(msg)
			else {
				console.log("Storing message to be sent when connected.")
				this.offlineMsgs.push(msg)
			}
		}

		this.ws.onopen = async () => {
			this.connected = true
			// $events.emit("connection.connected", true)

			let result = await this.protocolHandler.call("reqAuth", {
				role: "child",
				user: "devChild",
				pw: 42
			})
			console.log("Authentication request:", result)
			if (result.token) {
				// this.set(".connection.authenticated", true)
				// this.set(".connection.ready", true)
				this._handlePing()
			}
			// Send offlineMsg's if any!
			this.offlineMsgs.forEach((msg) => {
				this.protocolHandler.out_send(msg)
			})
			this.offlineMsgs = []
		}
		// this.ws.onmessage = async (msg: MessageEvent) => {
		//     let reply = await this.protocolHandler.receive(msg.data)
		//     if (reply) self.ws!.send(reply)
		// }
		this.ws.onmessage = (msg: MessageEvent) => {
			this.protocolHandler.receive(msg.data)
		}
		this.ws.onerror = () => {
			if (this.pingTimer) clearTimeout(this.pingTimer)
			self.ws!.close()
		}
		this.ws.onclose = () => {
			if (this.pingTimer) clearTimeout(this.pingTimer)
			// if (this.connected) this.set(".connection.connected", false)
			this.connected = false
			setTimeout(() => {
				self._connect()
			}, self.reconnectInterval)
		}
	}

	private async _handlePing() {
		let pingTs = Date.now()
		await this.protocolHandler.call("ping", {})
		// this.ariNode.outs!.ping._set(Date.now() - pingTs)
		// $events.emit("connection.ping", Date.now() - pingTs)
		// this.set(".connection.ping", Date.now() - pingTs)
		this.ping = Date.now() - pingTs

		let self = this
		this.pingTimer = setTimeout(() => {
			self._handlePing()
		}, this.pingInterval)
	}
}

let instance = new AriWsClient()
export default instance

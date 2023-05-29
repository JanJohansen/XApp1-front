import { AriProtocolHandler } from "./AriProtocolHandler"
import { ref } from "vue"

class WsBBClient {
	private protocolHandler = new AriProtocolHandler()
	private authenticated: boolean = false

	private ws?: WebSocket
	private pingTimer: number = 0
	public pingInterval: number = 10000
	public reconnectInterval!: number
	public connected: boolean = false
	public ping: number = -1

	modules = ref({
		TestModule: { active: true },
		TestModule2: { active: false }
	})

	// Emit API
	events: { [name: string]: [(value: any, name: string) => void] | [] | undefined } = {}
	emit(name: string, ...args: any) {
		let listeners = this.events[name]
		if (listeners)
			listeners.forEach((cb) => {
				cb(args, name)
			})
	}
	on(name: string, cb: (value: string, name: string) => void) {
		if (!(name in this.events)) {
			this.events[name] = []
			this.protocolHandler.notify("on", { n: name })
		}
		this.events[name]!.push(cb)
	}

	// PubSub Object API ------------
	oSubs: { [name: string]: { lastVal: any; cbs: [cb: (value: any, name: string) => void] | [] } } = {}
	oPub(name: string, value: any) {
		this.protocolHandler.notify("oPub", { n: name, v: value })
	}
	oSub(name: string, cb: (value: any, name: string) => void) {
		if (!(name in this.oSubs)) {
			this.oSubs[name] = { lastVal: undefined, cbs: [] }
			this.protocolHandler.notify("oSub", { n: name })
		} else {
			// Already subscribed from server
			// Get local cached value - _if it was retrived by a "val" update_
			if(this.oSubs[name].lastVal != undefined) cb(this.oSubs[name].lastVal, name)
		}
		this.oSubs[name].cbs.push(cb)
	}
	async oExists(name: string) {
		return this.protocolHandler.call("oExists", { n: name })
	}

	// PubSub Value API ------------
	vSubs: { [valueId: string]: { lastVal: any; cbs: [cb: (value: any, name: string) => void] | [] } } = {}
	vPub(valueId: string, value: any) {
		this.protocolHandler.notify("vPub", { n: valueId, v: value })
	}
	vSub(valueId: string, cb: (value: any, name: string) => void) {
		if (!(valueId in this.vSubs)) {
			this.vSubs[valueId] = { lastVal: undefined, cbs: [] }
			this.protocolHandler.notify("vSub", { n: valueId })
		} else {
			// Already subscribed from server
			// Get local cached value - _if it was retrived by a "val" update_
			if(this.vSubs[valueId].lastVal != undefined) cb(this.vSubs[valueId].lastVal, valueId)
		}
		this.vSubs[valueId].cbs.push(cb)
	}
	async vExists(valueId: string) {
		return this.protocolHandler.call("vExists", { n: valueId })
	}

	// call = this.protocolHandler.call.bind(this.protocolHandler)
	// notify = this.protocolHandler.notify.bind(this.protocolHandler)
	// on = this.protocolHandler.on.bind(this.protocolHandler)

	constructor(config: any = undefined) {
		this._connect()
		this.protocolHandler.on("oUpd", (args) => {
			console.log("WsBBC.rx.oUpd", args)
			let subs = this.oSubs[args.n]
			if (subs) {
				subs.cbs.forEach((cb) => {
					this.oSubs[args.n].lastVal = args.v
					cb(args.v, args.n)
				})
			}
			// Cache value for subsequext subscriptionms to already subscribed BB items.
		})
		this.protocolHandler.on("vUpd", (args) => {
			console.log("WsBBC.rx.vUpd", args)
			let subs = this.vSubs[args.n]
			if (subs) {
				subs.cbs.forEach((cb) => {
					this.vSubs[args.n].lastVal = args.v
					cb(args.v, args.n)
				})
			}
			// Cache value for subsequext subscriptionms to already subscribed BB items.
		})
		this.protocolHandler.on("evt", (args) => {
			// console.log("WsBBC.rx.EVT", args)
			let subs = this.events[args.n]
			if (subs) {
				subs.forEach((cb) => {
					cb(args.v, args.n)
				})
			}
		})
	}

	//-------------------------------------------------------------------------
	// Helpers
	offlineMsgs: string[] = []
	_connect() {
		this.ws = new WebSocket("ws://" + window.location.hostname + ":3022") //"ws://localhost:3001")
		var self = this

		// Connect protocol handler -------------------------------------------
		this.protocolHandler.out_send = (msg: string) => {
			if (this.ws!.readyState == this.ws!.OPEN) this.ws!.send(msg)
			else {
				console.log("Storing message to be sent when connected.")
				this.offlineMsgs.push(msg)
			}
		}
		this.ws.onopen = async () => {
			this.connected = true

			// Send offlineMsg's if any!
			this.offlineMsgs.forEach((msg) => {
				this.protocolHandler.out_send(msg)
			})
			this.offlineMsgs = []
		}
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

		// Set up log features ------------------------------------------------
		this.protocolHandler.on("log", (args) => {
			console.log("LOG:", args)
			this.emit("log", args)
		})
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

let instance = new WsBBClient()
export default instance

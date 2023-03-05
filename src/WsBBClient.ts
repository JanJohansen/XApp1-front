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

	// PubSub API
	subs: { [name: string]: { lastVal: any; cbs: [cb: (value: any, name: string) => void] | [] } } = {}
	pub(name: string, value: any) {
		this.protocolHandler.notify("pub", { n: name, v: value })
	}
	sub(name: string, cb: (value: any, name: string) => void) {
		if (!(name in this.subs)) {
			this.subs[name] = { lastVal: undefined, cbs: [] }
			this.protocolHandler.notify("sub", { n: name })
		} else {
			// Already subscribed from server
			// Get local cached value - _if it was retrived by a "val" update_
			if(this.subs[name].lastVal != undefined) cb(this.subs[name].lastVal, name)
		}
		this.subs[name].cbs.push(cb)
	}

	async exists(name: string) {
		return this.protocolHandler.call("exists", { n: name })
	}

	// call = this.protocolHandler.call.bind(this.protocolHandler)
	// notify = this.protocolHandler.notify.bind(this.protocolHandler)
	// on = this.protocolHandler.on.bind(this.protocolHandler)

	constructor(config: any = undefined) {
		this._connect()
		this.protocolHandler.on("val", (args) => {
			// console.log("WsBBC.rx.VAL", args)
			let subs = this.subs[args.n]
			if (subs) {
				subs.cbs.forEach((cb) => {
					this.subs[args.n].lastVal = args.v
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

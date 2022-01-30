import ariWsClientInstance from "./AriWsClient"

class ObjDbClient {
	objects: { [path: string]: any } = {}
	values: { [path: string]: any } = {}
	subs: { [name: string]: [(value: any, name: string) => void] | undefined | [] } = {}
	rSubs: { [name: string]: [(value: any, name: string) => void] | undefined | [] } = {}
	serverVSubs: { [name: string]: boolean } = {}

	server = ariWsClientInstance
	constructor() {
		this.server.on("upd", (args) => {
			console.log("upd", args)
			this.serverUpd(args.p, args.v)
		})
		this.server.on("sub", (args) => {
			this.serverSub(args)
		})
		this.server.on("unsub", (args) => {
			this.serverUnsub(args)
		})
	}

	/**
	 *
	 * @param path
	 * @param value
	 * @returns
	 */
	set(path: string, value: any) {
		console.log("ObjDB.set:", path, value)
		// Insert into object model
		let pathArray = path.split(".")
		if (pathArray.length < 1) {
			console.log("Error: Missing path in call to objDB.set command.")
			return
		} else if (pathArray.length > 2) {
			// Insert value
			this.values[path] = value
		}
		let prop = pathArray.shift()
		// Patch object w. update
		// Create if not exists
		if (!(prop! in this.objects)) this.objects[prop!] = {}
		let obj = this.objects[prop!]
		while (obj && pathArray.length > 1) {
			prop = pathArray.shift()
			if (!(prop! in obj)) {
				obj[prop!] = {}
			} // else nop
			obj = obj[prop!]
		}
		prop = pathArray.shift()
		obj[prop!] = value

		// Notify path subscribers
		if (path in this.subs) {
			console.log("NotifySub:", path, value)
			let cbs = this.subs[path]
			if (cbs) cbs.forEach((sub) => sub(value, path))
		}

		// Check server subscription
		if (path in this.serverVSubs) {
			// TODO: Send to server!
			this.server.notify(path, value)
		}
	}

	sub(path: string, cb: (value: any, name: string) => void) {
		// Subscribe internally
		console.log("sub", path)
		if (!(path in this.subs)) this.subs[path] = []
		this.subs[path]!.push(cb)
		// Send initial state
		if (path in this.objects) cb(path, this.objects[path])
		else if (path in this.values) cb(path, this.values[path])
	}

	unsub(id: string, cb: (value: any, name: string) => void) {
		console.log("sub", id)
		let cbs = this.subs[id]
		if (!cbs) return
		let cbIdx = cbs.indexOf(cb)
		if (cbIdx > 0) return
		cbs.splice(cbIdx, 1)
	}

	rSet(path: string, value: any) {
		console.log("ObjDB.rSet:", path, value)
		// Send set cmd to server
		this.server.notify("set", { p: path, v: value })
	}

	rSub(path: string, cb: (value: any, name: string) => void) {
		console.log("rSub", path)
		// TODO
		// Register local subscriber CB's
		if (!(path in this.rSubs)) {
			// Not subscribed @ server yet
			this.rSubs[path] = []
			// Subscribe @ server
			this.server.notify("sub", path)
		}
		this.rSubs[path]?.push(cb)
	}

	rUnsub(path: string, cb: (value: any, name: string) => void) {
		console.log("rUnsub", path)
		// TODO
		// Unsub local CB's
		if (!(path in this.rSubs)) return

		this.rSubs[path]?.slice(this.rSubs[path]?.indexOf(cb), 1)
		if (this.rSubs[path]?.length == 0) {
			delete this.rSubs[path]
			// Unsub @ server __ if no more local subs
			this.server.notify("unsub", path)
		}
	}

	//-------------------------------------------------------------------------
	// Server commands (from server)
	serverUpd(path: string, value: any) {
		console.log("serverUpd:", path, value, this.rSubs)
		let rSubs = this.rSubs[path]
		if (rSubs && rSubs.length > 0) {
			rSubs.forEach((cb) => {
				cb(value, path)
			})
		}
	}
	serverSub(path: string) {
		// Store server sub-status
		// Send initial value if exists
	}
	serverUnsub(path: string) {
		// Remove server sub-status
	}

	//*************************************************************************

	// setObject(obj: any, value: any) {
	// 	console.log("objDB.oSet(", obj, ")")
	// 	// Create id if not exists
	// 	if (!("_$id" in obj)) {
	// 		obj._$id = Date.now()
	// 	}

	// 	if (!(obj._$id in this.objects)) this.objects[obj._$id] = {} // Create if not exists
	// 	this.patch(obj, this.objects[obj._$id]) // Updtae object

	// 	// Notify object subscribers
	// 	if (obj._$id in this.oSubs) {
	// 		let cbs = this.oSubs[obj._$id]
	// 		cbs.forEach((cb) => {
	// 			cb(obj, obj._$id)
	// 		})
	// 	}

	// 	// TODO: Notify server
	// }

	// helper functions -------------------------------------------------------
	// patch(src, dest) {
	// 	for (let prop in src) {
	// 		if (src[prop] == null) delete dest[prop]
	// 		else {
	// 			if (typeof src[prop] == "object") {
	// 				if (!(prop in dest)) dest[prop] = {}
	// 				this.patch(src[prop], dest[prop])
	// 			} else {
	// 				dest[prop] = src[prop]
	// 			}
	// 		}
	// 	}
	// 	return dest
	// }
}
let objDbClient = new ObjDbClient()
export default objDbClient

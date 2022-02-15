<template>
	<div class="home">
		<q-table
			title="BB-View"
			virtual-scroll
			hide-bottom
			:rows="objArray"
			:columns="columns"
			row-key="name"
			:rows-per-page-options="[0]"
			dense
			type="table"
			style="max-height: 70vh"
			:virtual-scroll-item-size="48"
			:virtual-scroll-sticky-size-start="48"
			:virtual-scroll-sticky-size-end="32"
			:pagination="{ sortBy: 'path', descending: false }"
		>
		</q-table>
	</div>
</template>

<script setup lang="ts">
	import { useRouter, useRoute } from "vue-router"
	import { ref, reactive } from "vue"
	import db from "../ObjDbClient"
	import appBB from "../WsBBClient"
	import YAML from "yaml"

	const router = useRouter()
	const route = useRoute()

	console.log("ID:", route.params.id)

	const values = ref([])

	const formatMsgArgs = (msg: string[]) => {
		let str = ""
		msg.forEach((part) => {
			if (typeof part == "object") str += JSON.stringify(part) + " "
			else str += part + " "
		})
		return str
	}

	// Store val/obj. Use it to determine if a subObj is new. If so add sub obj reference to array!
	let oObj = {}
	appBB.sub("oIndex", (args) => {
		console.log("vIndex", args)
		// TODO: patch(vObj, args)
		// ...
		for (let obj in args) {
			if (!(obj in oObj)) {
				oObj[obj] = {}
				let item = { path: obj, lvl: obj.split(".").length - 1 }
				values.value.push(item)
				// sub values
				appBB.on(obj, (value: any, name: string) => {
					console.log("BBValue!!!! - ", name, value)
					treeSet(name, value)
					item.type = typeof value
					item.value = value
				})
			}
		}
	})
	const columns = [
		{ name: "id", label: "BB Item", align: "left", field: "prop", sortable: true, format: (prop) => prop || "??" },
		// { align: "left", name: "type", label: "Type", field: "type", sortable: true },
		 { align: "left", name: "lvl", label: "Level", field: "lvl", sortable: true },
		{ align: "left", name: "value", label: "Value", field: "value", sortable: true, format: (value) => YAML.stringify(value) }
	]


	//-------------------------------------------------------------------------
	// String name+val --> object tree
	let objTree: any = {}
	let objArray = reactive([])
	const treeSet = (name: string, value: any): void => {
		let lvl = 0
		let pathArray = name.split(".")
		// Patch object w. update
		let prop = pathArray.shift()
		if (!(prop! in objTree)) {// Create if not exists
			objTree[prop!] = {}
			objArray.push({prop, lvl, value })
		}
		let obj = objTree[prop!]
		lvl += 1
		while (obj && pathArray.length > 1) {
			prop = pathArray.shift()
			if (!(prop! in obj)) {
				obj[prop!] = {}
				objArray.push({prop, lvl, value })
			} // else nop
			if (typeof obj[prop!] != "object") obj[prop!] = {} // Overwrite previous non-object value of property!
			obj = obj[prop!]
		}
		prop = pathArray.shift()
		obj[prop!] = value
		
		console.log("objTree:", objTree, objArray)
	}
</script>

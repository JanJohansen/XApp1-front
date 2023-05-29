<template>
	<div class="home">
		<h1>Obj-View</h1>
		<hr />
		<obj-tree :object="objects"></obj-tree>
	</div>
</template>

<script setup lang="ts">
	import { useRouter, useRoute } from "vue-router"
	import { reactive, ref } from "vue"
	import db from "../ObjDbClient"
	import appBB from "../WsBBClient"
	import ObjTree from "../components/ObjTree/ObjTree.vue"
	import ObjRow from "../components/ObjTree/ObjectRow.vue"

	const router = useRouter()
	const route = useRoute()
	console.log("ID:", route.params.id)

	const objects = reactive<any>({})


	const patch = (rootObj: any, name: string, value: any): void => {
		let lvl = 0
		let pathArray = name.split(".")
		// Patch object w. update
		let prop = pathArray.shift()
		if (!(prop! in rootObj)) {
			// Create if not exists
			rootObj[prop!] = {}
		}
		let obj = rootObj[prop!]
		while (obj && pathArray.length > 1) {
			prop = pathArray.shift()
			if (!(prop! in obj)) {
				obj[prop!] = {}
			} // else nop
			if (typeof obj[prop!] != "object") obj[prop!] = {} // Overwrite previous non-object value of property!
			obj = obj[prop!]
		}
		// prop = pathArray.shift()
		obj[prop!] = value

		console.log("objects", objects)
	}

	appBB.oSub("oIndex", (args) => {
		console.log("oIndex", args)
		for (let item in args) {
			appBB.oSub(item, (v, n) => {
				console.log("Subbed:", { obj: n, value: v, type: typeof v })
				patch(objects, n, v)
			})
		}
	})

	// Get Values!
	appBB.oSub("vIndex", (args) => {
		console.log("vIndex", args)
		for (let item in args) {
			appBB.oSub(item, (v, n) => {
				// console.log("vUpdtae:", n, "=", v, objects)
				objects[n] = v
			})
		}
	})
</script>

<style scoped>
	table {
		border-collapse: collapse;
	}
</style>

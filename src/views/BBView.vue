<template>
	<editor-page-layout>
		<template #bottom>
			ARI
			<q-btn dense flat>
				<q-badge transparent color="green"> v1.0.0 </q-badge>
			</q-btn>

			&NonBreakingSpace;
			<q-btn dense flat icon="email">
				<q-badge transparent color="yellow">10</q-badge>
			</q-btn>

			&NonBreakingSpace;
			<q-btn dense flat icon="notifications">
				<q-badge transparent color="red">3</q-badge>
			</q-btn>
		</template>
		<q-splitter 
			v-model="splitterModel" 
			separator-class="bg-orange" 
			separator-style="width: 3px" 
			style="height: 100%; width: 100%; flex: 1"
		>
			<template v-slot:before>
				<q-table
					style="height: 100%; width: 100%; flex: 1"
					title="BB-Objects"
					hide-bottom
					:rows="objArray"
					:columns="oColumns"
					row-key="name"
					:rows-per-page-options="[0]"
					dense
					type="table"
					virtual-scroll
					:virtual-scroll-item-size="48"
					:virtual-scroll-sticky-size-start="48"
					:virtual-scroll-sticky-size-end="32"
					:pagination="{ sortBy: 'id', descending: false }"
					class="my-sticky-header-column-table"
				>
				</q-table>
			</template>
			<template v-slot:after>
				<q-table
					style="height: 100%; width: 100%; flex: 1"
					title="BB-Values"
					hide-bottom
					:rows="valArray"
					:columns="oColumns"
					row-key="name"
					:rows-per-page-options="[0]"
					dense
					type="table"
					virtual-scroll
					:virtual-scroll-item-size="48"
					:virtual-scroll-sticky-size-start="48"
					:virtual-scroll-sticky-size-end="32"
					:pagination="{ sortBy: 'id', descending: false }"
					class="my-sticky-header-column-table"
				>
				</q-table>
			</template>
		</q-splitter>
	</editor-page-layout>
</template>

<script setup lang="ts">
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import { useRouter, useRoute } from "vue-router"
	import { ref, reactive, computed } from "vue"
	import db from "../ObjDbClient"
	import appBB from "../WsBBClient"
	import YAML from "yaml"
	import { patch } from "../common/util"

	const router = useRouter()
	const route = useRoute()
	const splitterModel = ref(50)

	console.log("ID:", route.params.id)

	const formatMsgArgs = (msg: string[]) => {
		let str = ""
		msg.forEach((part) => {
			if (typeof part == "object") str += JSON.stringify(part) + " "
			else str += part + " "
		})
		return str
	}

	// Get all objects
	// Store val/obj. Use it to determine if a subObj is new. If so add sub obj reference to array!
	let oObj = reactive<{ [id: string]: { id: string; value: any } }>({})
	appBB.oSub("oIndex", (upd) => {
		console.log("oIndex", upd)
		for (let bbObjectId in upd) {
			if (!(bbObjectId in oObj)) {
				let item = { id: bbObjectId, value: undefined }
				oObj[bbObjectId] = item
				// sub values
				appBB.oSub(bbObjectId, (value: any, name: string) => {
					console.log("BBValue!!!! - ", name, value)
					if (typeof value == "object" && typeof oObj[name].value == "object") patch(value, oObj[name].value)
					else oObj[name].value = value
				})
			}
		}
	})
	const oColumns = [
		{
			align: "left",
			name: "id",
			label: "ObjectId",
			field: "id",
			sortable: true,
			sortOrder: "ad",
			format: (id) => id || "??"
		},
		{
			align: "left",
			name: "value",
			label: "Value",
			field: "value",
			sortable: true,
			format: (value) => YAML.stringify(value)
		}
	]

	// Get all values
	// Store val/obj. Use it to determine if a subObj is new. If so add sub obj reference to array!
	let vObj = reactive<{ [id: string]: { id: string; value: any } }>({})
	appBB.oSub("vIndex", (upd) => {
		console.log("vIndex", upd)
		for (let bbValueId in upd) {
			if (!(bbValueId in vObj)) {
				let item = { id: bbValueId, value: undefined }
				vObj[bbValueId] = item
				// sub values
				appBB.vSub(bbValueId, (value: any, name: string) => {
					console.log("BBValue!!!! - ", name, value)
					// if (typeof value == "object" && typeof vObj[name].value == "object") patch(value, vObj[name].value)
					vObj[name].value = value
				})
			}
		}
	})
	const vColumns = [
		{
			align: "left",
			name: "id",
			label: "ValueId",
			field: "id",
			sortable: true,
			sortOrder: "ad",
			format: (id) => id || "??"
		},
		{
			align: "left",
			name: "value",
			label: "Value",
			field: "value",
			sortable: true,
			format: (value) => YAML.stringify(value)
		}
	]

	//-------------------------------------------------------------------------
	// String name+val --> object tree
	let objArray = computed(() => {
		let a = []
		for (let itemId in oObj) {
			a.push({ id: itemId, value: oObj[itemId].value })
		}
		return a
	})

	let valArray = computed(() => {
		let a = []
		for (let itemId in vObj) {
			a.push({ id: itemId, value: vObj[itemId].value })
		}
		return a
	})

</script>

<style lang="sass">
.my-sticky-header-column-table
  /* height or max-height is important */
  height: 100%

  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 100%

  td:first-child
    /* bg color is important for td; just specify one */
    background-color: #000 !important

  tr th
    position: sticky
    /* higher than z-index for td below */
    z-index: 2
    /* bg color is important; just specify one */
    background: #000

  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
    /* highest z-index */
    z-index: 3
  thead tr:first-child th
    top: 0
    z-index: 1
  tr:first-child th:first-child
    /* highest z-index */
    z-index: 3

  td:first-child
    z-index: 1

  td:first-child, th:first-child
    position: sticky
    left: 0
</style>

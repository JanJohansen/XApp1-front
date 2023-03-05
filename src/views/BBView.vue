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
			<q-table
				style="height: 100%; width: 100%; flex: 1"
				title="BB-View"
				hide-bottom
				:rows="objArray"
				:columns="columns"
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
	</editor-page-layout>
</template>

<script setup lang="ts">
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import { useRouter, useRoute } from "vue-router"
	import { ref, reactive, computed } from "vue"
	import db from "../ObjDbClient"
	import appBB from "../WsBBClient"
	import YAML from "yaml"

	const router = useRouter()
	const route = useRoute()

	console.log("ID:", route.params.id)

	const formatMsgArgs = (msg: string[]) => {
		let str = ""
		msg.forEach((part) => {
			if (typeof part == "object") str += JSON.stringify(part) + " "
			else str += part + " "
		})
		return str
	}

	// Store val/obj. Use it to determine if a subObj is new. If so add sub obj reference to array!
	let oObj = reactive<{ [id: string]: { id: string; value: any } }>({})
	appBB.sub("oIndex", (upd) => {
		console.log("oIndex", upd)
		// TODO: patch(vObj, args)
		// ...
		for (let bbItemId in upd) {
			if (!(bbItemId in oObj)) {
				let item = { id: bbItemId }
				oObj[bbItemId] = item
				// sub values
				appBB.sub(bbItemId, (value: any, name: string) => {
					console.log("BBValue!!!! - ", name, value)
					oObj[name].value = value
				})
			}
		}
	})
	const columns = [
		{
			align: "left",
			name: "id",
			label: "BB Item",
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
	let objTree: any = {}
	// let objArray = reactive<any>([])
	let objArray = computed(() => {
		let a = []
		for (let itemId in oObj) {
			a.push({ id: itemId, value: oObj[itemId].value })
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
    background-color: #000000 !important

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
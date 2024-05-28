<template>
	<editor-page-layout>
		<template #bottom>
			<title>ARI - BB_View</title>
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
		<template #default>
			<q-table
				style="height: 100%; width: 100%; flex: 1"
				title="BB-Objects"
				hide-bottom
				:rows="objArray"
				:columns="oColumns"
				row-key="id"
				:rows-per-page-options="[0]"
				dense
				type="table"
				virtual-scroll
				:virtual-scroll-item-size="48"
				:virtual-scroll-sticky-size-start="48"
				:virtual-scroll-sticky-size-end="32"
				:pagination="{ sortBy: 'id', descending: false }"
				class="my-sticky-header-column-table"
				selection="single"
				v-model:selected="selectedRows"
			>
				<template v-slot:top>
					<q-select
						filled
						v-model="selectedTypes"
						dense
						multiple
						:options="typesArray"
						label="Types"
						style="width: 250px"
					/>
					<q-space />
					sss
					<q-space />
					<!-- <q-input label="Search" dense debounce="300" color="primary" v-model="searchString">
						<template v-slot:append>
							<q-icon name="search" />
						</template>
					</q-input> -->
				</template>
			</q-table>
		</template>
		<template #right>
			<code style="line-height: 100%; white-space: pre">
				{{ selectedObjString }}
			</code>
		</template>
	</editor-page-layout>
</template>

<script setup lang="ts">
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import { useRouter, useRoute } from "vue-router"
	import { ref, reactive, computed, watch } from "vue"
	import bb from "../WsBBClient"
	import YAML from "yaml"
	import { patch } from "../common/util"

	const types = {}
	const typesArray = ref<string[]>([])
	const selectedTypes = ref([])
	
	const selectedRows = ref([])
	const selectedObjString = computed(()=>{
		if(selectedRows.value[0]) return selectedRows.value[0].id + " =\n" + JSON.stringify(selectedRows.value[0].value, null, 2)
		return "Select objectID from the left..."
	})

	// const searchString = ref("Select object row...")

	const router = useRouter()
	const route = useRoute()

	// ------------------------------------------------------------------------
	// Load list of types
	bb.oSub("idx:type", (args) => {
		console.log("idx:type =", args)
		patch(args, types)
		typesArray.value = Object.keys(types)
	})

	// ------------------------------------------------------------------------
	// TODO: Show specific Object from URL!
	console.log("ID:", route.params.id)

	let typeObjs = reactive<{ [type: string]: { [oid: string]: {} } }>({})

	// When selection changes
	watch(selectedTypes, (newVal, oldVal) => {
		console.log("Selection changed:", selectedTypes)

		// Subscribe to added types
		let added = newVal.filter((x) => !oldVal.includes(x))
		added.forEach((type) => {
			typeObjs[type] = {}
			bb.oSub("idx:type=" + type, (upd) => {
				console.log("Update to idx:" + type, " =", upd)
				for (let oid in upd) {
					if (!(oid in typeObjs[type])) {
						let item = { id: oid, value: undefined }
						typeObjs[type][oid] = item

						// Subscribe actual objects of this type
						bb.oSub(oid, (value: any, name: string) => patch(value, typeObjs[type][oid]))
					}
				}
			})
		})

		// TODO: Unsubscribe from removed types
		let removed = oldVal.filter((x) => !newVal.includes(x))
		removed.forEach((type) => {
			delete typeObjs[type]
		})
	})

	// Idea for BBContext
	class BBContext{
		subs = {}
		oSub(oid:string, cb:()=>{}){

		}
		oUnsub(){}
	}

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
			label: "Object",
			field: "value",
			sortable: true,
			format: (value: any) => JSON.stringify(value) //YAML.stringify(value)
		}
	]

	//-------------------------------------------------------------------------
	// Helper to generate table data!
	let objArray = computed(() => {
		let a = []
		for (let type in typeObjs) {
			for (let oid in typeObjs[type]) {
				a.push({ id: oid, value: typeObjs[type][oid] })
			}
		}
		return a
	})
</script>

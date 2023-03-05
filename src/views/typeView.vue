<template>
	<editor-page-layout>
		<template #top>
			Types
			<q-space />
			<q-btn label="Deploy flow" color="green" dense></q-btn>
		</template>
		<template #left>Left!</template>
		<template #right>Right!</template>
		<template #bottom>
			ARI
			<q-btn dense flat >
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
			title="Log"
			virtual-scroll
			:virtual-scroll-sticky-size-start="78"
			style="height: 100%"
			dense
			hide-bottom
			:rows="logRows"
			:columns="logColumns"
			row-key="name"
			:rows-per-page-options="[0]"
			@virtual-scroll="scrollEvent"
		>
			<template v-slot:top>
				<div class="q-pa-md" style="width: 300px">
					<div class="q-gutter-md">
						<q-badge color="secondary" multi-line> Model: "{{ model }}" </q-badge>

						<q-select filled v-model="model" :options="typeListModel" label="Multi with toggle" multiple emit-value map-options>
							<template v-slot:option="{ itemProps, opt, selected, toggleOption }">
								<q-item v-bind="itemProps">
									<q-item-section>
										<q-item-label v-html="opt.label" />
									</q-item-section>
									<q-item-section side>
										<q-toggle :model-value="selected" @update:model-value="toggleOption(opt)" />
									</q-item-section>
								</q-item>
							</template>
						</q-select>
					</div>
				</div>

				<!-- <q-select filled v-model="selectedTypes" dense multiple :options="loggers" label="Loggers" style="width: 250px" />
			<q-select filled v-model="selectedLevels" dense multiple :options="logLevels" label="Log levels" style="width: 150px; margin: 0 20px" /> -->
				<q-space />
				<q-input label="Search" dense debounce="300" color="primary" v-model="searchString">
					<template v-slot:append>
						<q-icon name="search" />
					</template>
				</q-input>
			</template>
			<!-- <template v-slot:body="props">
					<q-tr :props="props" :key="`m_${props.row.index}`">
						<q-td v-for="col in props.cols" :key="col.name" :props="props">
							{{ col.value }}
						</q-td>
					</q-tr>
					<q-tr :props="props" :key="`e_${props.row.index}`" class="q-virtual-scroll--with-prev">
						<q-td colspan="100%">
							<div class="text-left">{{ props.row.msg }} (Index: {{ props.row.index }}).</div>
						</q-td>
					</q-tr>
				</template> -->
		</q-table>
		<!-- <div v-for="(val, name) in modules" v-bind:key="name" :ref="(el) => (lastItem = el)">
		<input type="checkbox" :id="name" name="scales" :checked="val.active" />
		<label :for="name">{{ name }} - {{ val.active }}</label>
	</div>

	<div class="logarea" ref="logView">
		<div class="logItem" v-for="item in log" v-bind:key="item">
			<div class="logMeta">{{ item.src }}.{{ item.lvl }} @ {{ new Date(item.ts).toISOString() }}</div>
			<div class="logMessage">{{ item.msg.toString() }}</div>
		</div>
	</div> -->
	</editor-page-layout>
</template>

<style scoped>
	.logarea {
		width: 100%;
		height: 200px;
		overflow: auto;
	}
	.logItem {
		height: auto;
		padding: 0 0 0.5em 0;
	}
	.logMeta {
		color: grey;
		font-size: 0.7em;
		line-height: 1em;
	}
	.logMessage {
		line-height: 1em;
	}
</style>

<script setup lang="ts">
	import { nextTick, onBeforeUpdate, ref, onUpdated } from "vue"
	import wsBBClient from "../WsBBClient"
	import EditorPageLayout from "../components/EditorPageLayout.vue"

	// wslogClient.on

	const modules = wsBBClient.modules
	const log = ref<[{ src: string; lvl: string; msg: string[]; ts: number }]>([])
	const divs = ref([])
	const lastItem = ref(null)
	const logView = ref(null)
	const logRows = ref([])
	const loggers = ref([])
	const selectedLoggers = ref([])
	const selectedLevels = ref([])
	const logLevels = ["user", "developer", "debug", "tmp"]
	const searchString = ref("")

	const model = ref([])

	let typeListModel = [
		{
			label: "Google",
			value: "Google"
		},
		{
			label: "Facebook",
			value: 2
		},
		{
			label: "Twitter",
			value: 3
		},
		{
			label: "Apple",
			value: 4
		},
		{
			label: "Oracle",
			value: 5
		}
	]

	wsBBClient.sub("idx:type=?", (args) => {
		console.log("idx:type=? =>", args)
		loggers.value = args
	})

	const logColumns = [
		{
			name: "name",
			required: true,
			label: "Type",
			align: "left",
			field: "src",
			// format: (val) => `${val}`,
			sortable: true
		},
		// { align: "left", name: "ts", label: "TimeStamp", field: "ts", format: ts2Time, sortable: true }
		// { align: "left", name: "message", label: "Message", field: "msg", format: formatMsgArgs, sortable: true },
		{ align: "left", name: "values", label: "Values", field: "values", sortable: false }
	]

	let scrollEvent = (evt) => {
		console.log("Scroll:", evt)
	}

	// logRows.value = [
	// 	{ lvl: "dbg", msg: "Hey", ts: 1644090270981, src: "WsServer" },
	// 	{ lvl: "dbg", msg: "Hey", ts: 1644090271042, src: "AriClientServer" },
	// ]
</script>

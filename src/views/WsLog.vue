<template>
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
			<q-select filled v-model="selectedLoggers" dense multiple :options="loggers" label="Loggers" style="width: 250px" />
			<q-select filled v-model="selectedLevels" dense multiple :options="logLevels" label="Log levels" style="width: 150px; margin: 0 20px" />
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

	let scrolling = false
	let maxLogLines = 100

	// make sure to reset the refs before each update
	onBeforeUpdate(() => {
		// console.log("Scrolling", scrolling, logView.value.scrollTop, logView.value.clientHeight, logView.value.scrollHeight)
		divs.value = []
		if (logView.value.scrollTop + logView.value.clientHeight + 2 < logView.value.scrollHeight) scrolling = true
		else scrolling = false
	})
	onUpdated(() => {
		// console.log("Updated!")
		// Scroll to end of list!
		if (!scrolling) logView.value.scrollTop = logView.value.scrollHeight
	})

	wsBBClient.sub("common.log.logEvent", (args) => {
		console.log("LOG:", args)
		log.value.push(args)
		logRows.value.push(args)
		if (log.value.length > maxLogLines) log.value.shift()
	})
	wsBBClient.sub("common.log.loggers", (args) => {
		console.log("LOG.modules:", args)
		loggers.value = args
	})

	let ts2Time = (ts: number) => {
		let h = new Date(ts)
		let str = String(h.getHours()).padStart(2, "0")
		str += ":" + String(h.getMinutes()).padStart(2, "0")
		str += ":" + String(h.getSeconds()).padStart(2, "0")
		str += "." + String(h.getMilliseconds()).padStart(3, "0")
		return str
	}
	const formatMsgArgs = (msg: string[]) => {
		let str = ""
		msg.forEach((part) => {
			if (typeof part == "object") str += JSON.stringify(part) + " "
			else str += part + " "
		})
		return str
	}

	const logColumns = [
		{
			name: "name",
			required: true,
			label: "Module",
			align: "left",
			field: "src",
			// format: (val) => `${val}`,
			sortable: true
		},
		{ align: "left", name: "ts", label: "TimeStamp", field: "ts", format: ts2Time, sortable: true },
		{ align: "left", name: "message", label: "Message", field: "msg", format: formatMsgArgs, sortable: true },
		{ align: "left", name: "level", label: "Level", field: "lvl", sortable: true }
	]

	let scrollEvent = (evt)=>{
		console.log("Scroll:", evt)
	}

	// logRows.value = [
	// 	{ lvl: "dbg", msg: "Hey", ts: 1644090270981, src: "WsServer" },
	// 	{ lvl: "dbg", msg: "Hey", ts: 1644090271042, src: "AriClientServer" },
	// ]
</script>

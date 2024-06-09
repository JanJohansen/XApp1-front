<template>
	<floatingWindow v-if="flowStore.editorModel.editNodeId != ''">
		<template #header>
			<div>
				<button @click="updateConfig()">Update</button>
				<span style="float: right">
					editNodeId: {{ flowStore.editorModel.editNodeId }}
					<span style="display: inline-block; width: 1rem"></span>
					<button @click="flowStore.editorModel.editNodeId = ''">X</button>
				</span>
			</div>
		</template>
		<div style="height: 500px; padding: 1px; border: 1px solid #303030">
			<monaco-editor :sources="sources" />
		</div>
		<br />
	</floatingWindow>
</template>

<script setup lang="ts">
	import { onMounted, reactive, ref, watch } from "vue"
	import { useStore } from "../../stores/flowStore"
	import FloatingWindow from "../FloatingWindow.vue"
	import MonacoEditor from "../MonacoEditor.vue"

	const flowStore = useStore()

	const nodeId = ref("")
	const sources = reactive({ originalCode: "", lib: "", editedCode: "" })

	onMounted(async () => {
		let response = await fetch("/NodeBaseClass.ts")
		sources.lib = await response.text()
		console.log("LIB:", sources.lib)
	})

	// Trick: Create getter function to watch specific property😀
	watch(
		() => flowStore.editorModel.editNodeId,
		() => {
			nodeId.value = flowStore.editorModel.editNodeId
			let node = flowStore.flowModel.nodes[nodeId.value]
			if (node) {
				let code = node.config.ins.code // Break reactivity and control update manually!
				sources.originalCode = code || "No code specified!"
			}
		}
	)

	function updateConfig() {
		let node = flowStore.flowModel.nodes[nodeId.value]
		if (node) {
			node.config.ins.code = sources.editedCode
		}
		flowStore.editorModel.editNodeId = "" // Close editor.
	}
</script>

<style scoped></style>

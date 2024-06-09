<template>
	<editor-page-layout>
		<title>ARI - Dev</title>
		<template #top>
			<h1>DevPage</h1>
		</template>
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
		<div>
			<button @click="showFloater = !showFloater">Try me...</button>
			<floatingWindow v-if="showFloater" class="window">
				<template #header>
					<div class="my-header">My Header!</div>
				</template>
				<MonacoEditor
					value="console.log('Hello, vuemonaco2 !')"
					lansguage="typescript"
					class="monaco-editor"
					:code="code"
					libCode=""
				/>
			</floatingWindow>
		</div>
	</editor-page-layout>
</template>

<script setup lang="ts">
	import { ref } from "vue"
	import EditorPageLayout from "../components/EditorPageLayout.vue"
	import floatingWindow from "../components/FloatingWindow.vue"
	import MonacoEditor from "../components/MonacoEditor.vue"

	let showFloater = ref(true)
	const code = ref('console.log("")')

	setTimeout(() => {
		code.value = 'console.logs("")'
	}, 5000)
</script>

// Style for the floating windows needs to have globs scope as it's "attached to body" via a vue teleport element.
<style scoped>
	.my-header {
		font-family: consolas;
	}
	.monaco-editor {
		height: 20vh;
	}
    .window {
		right: 2%;
		top: 2%;
		width: 48%;
	}
</style>

<template>
	<editor-page-layout>
		<template #top>
			Home 😀
			<q-space />
		</template>
		<!-- <template #left>
			<q-toolbar-title>Home menu:</q-toolbar-title>
		</template> -->
		<!-- <template #right>
		</template> -->
		<template #bottom>
			DAF
			<q-btn dense flat>
				<q-badge transparent color="green"> v0.0.1 </q-badge>
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

		<div style="flex: 1">
            <h1>
                DAF
            </h1>
                <p>
                Distributed
                Application
                Framework
                </p>
                
		</div>
	</editor-page-layout>
</template>

<script setup lang="ts">
    import EditorPageLayout from "../components/EditorPageLayout.vue"
</script>

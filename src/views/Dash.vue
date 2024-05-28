<template>
	<div>
		<button @click="loadComponent">Load Component</button>
		<component :is="dynamicComponent" v-if="dynamicComponent"></component>
	</div>
</template>
<script setup lang="ts">
	import { shallowRef } from 'vue'

	const dynamicComponent = shallowRef(null)
    const loadComponent = async ()=> {
        const componentName = "TestType" // Replace with the actual component name
        const componentPath = `../components/Flow/typeComponents/${componentName}.vue` // Replace with the actual path 
		dynamicComponent.value = (await import(componentPath)).default;
    }
</script>

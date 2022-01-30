<template>
	<div class="home">
		<h1>OBJ Viewer</h1>
		<div>Object ID: {{ $route.params.id }}</div>
        <div>TestDataGenerator.outs.out1: {{ num }}</div>
	</div>
</template>

<script setup lang="ts">
	import { useRouter, useRoute } from "vue-router"
    import { ref } from "vue";
	import db from "../ObjDbClient"

	const router = useRouter()
	const route = useRoute()

    const num = ref(0)

	console.log("ID:", route.params.id)

	// db.rSub("TestDataGenerator.outs.out1", (v, p) => {
	db.rSub("XAServer.clientCount", (v, p) => {
		console.log("XAServer.clientCount:", p, v)
        num.value = v
	})
</script>

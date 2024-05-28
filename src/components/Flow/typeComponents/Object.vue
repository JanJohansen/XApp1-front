<template>
	<div>Object type: {{ obj._$name }}</div>
	<!-- <div>{{obj}}</div> -->
</template>

<script lang="ts">
	console.log("-- object-ui CODE loaded...")
	export default {
		name: "CObject",
		props: {
			obj: Object
		},
		methods: {},
		data() {
			console.log("object-ui: Defining data! - obj = ", this.obj)
			return {
				count: 142
			}
		},
		created() {
			console.log("CREATED!")
		},
		mounted() {
			console.log("obj:", this.obj)
		}
	}
</script>

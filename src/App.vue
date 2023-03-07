<template>
	<router-view 
		class="pos-abs width-100 height-100" 
	/>
</template>

<script setup lang="ts">
	import { useQuasar } from "quasar"
	import { ref } from "vue"
	import router from "./routes"
	const $q = useQuasar()

	$q.dark.set(true) // or false or "auto"
	// console.log("Dark active:", $q.dark.isActive) // true, false
	// console.log("Dark mode:", $q.dark.mode) // "auto", true, false

	$q.notify({ icon: "done", message: "XApp started!" })

	let fsIcon = ref("fullscreen")
	let goFullScreen = () => {
		if (!document.fullscreenElement) {
			fsIcon.value = "close_fullscreen"
			document.documentElement.requestFullscreen().catch((err) => {
				alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
				fsIcon.value = "fullscreen"
			})
		} else {
			document.exitFullscreen()
			fsIcon.value = "fullscreen"
		}
	}
</script>

<style scoped>
	.router-link-active {
		font-weight: bolder;
		font-size: larger;
		color: aliceblue;
	}
	.pos-abs {
		position: absolute;
	}
	.pos-rel {
		position: relative;
	}
	.width-100 {
		width: 100%;
	}
	.height-100 {
		height: 100%;
	}
</style>

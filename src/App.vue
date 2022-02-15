<template>
	<q-fab
		label=""
		class="fixed-top-right"
		vertical-actions-align="left"
		color="primary"
		icon="menu"
		direction="left"
	>
		<q-fab-action color="primary" :icon="fsIcon" @click="goFullScreen" />
		<q-fab-action to="/" label="Home" color="primary" icon="home" />
		<q-fab-action to="/bbview" label="BBView" color="primary" icon="tag" />
		<q-fab-action to="/wsLog" label="WS Log" color="primary" icon="manage_search" />
		<q-fab-action to="/flow" label="Flow" color="primary" icon="account_tree" />
		<q-fab-action to="/dev" label="DEV" color="primary" icon="airplay" />
		<q-fab-action to="/obj" label="ObjView" color="primary" icon="data_object" />
		<q-fab-action to="/about" label="About" color="primary" icon="help_outline" />
	</q-fab>
	<router-view class="pos-abs width-100 height-100" />
</template>

<script setup lang="ts">
	import { useQuasar } from "quasar"
	import { ref } from "vue"
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

<template>
	<!-- <q-fab
		label=""
		class="fixed-top-right"
		vertical-actions-align="left"
		color="primary"
		icon="menu"
		direction="down"
	>
		<q-fab-action color="primary" :icon="fsIcon" @click="goFullScreen" />
		<q-fab-action to="/" label="Home" color="primary" icon="home" />
		<q-fab-action to="/bbview" label="BBView" color="primary" icon="tag" />
		<q-fab-action to="/typeview" label="TypeView" color="primary" icon="tag" />
		<q-fab-action to="/wsLog" label="WS Log" color="primary" icon="manage_search" />
		<q-fab-action to="/flow" label="Flow" color="primary" icon="account_tree" />
		<q-fab-action to="/dev" label="DEV" color="primary" icon="airplay" />
		<q-fab-action to="/obj" label="ObjView" color="primary" icon="data_object" />
		<q-fab-action to="/about" label="About" color="primary" icon="help_outline" />
	</q-fab> -->
	<q-btn color="primary" icon="navigation">
		<q-menu auto-close>
			<q-list dense>
				<!-- <q-item clickable to="/" style="line-height: 1; padding: 8px 16px">
					<q-icon name="home" />
					Home
				</q-item> -->
				<q-item v-for="item in navMenuModel" clickable :to="item.path || ''" :onclick="item.click">
					<q-icon :name="item.icon" style="padding: 0.1rem 0.4rem 0rem 0rem" />
					{{ item.label }}
				</q-item>
				<!-- <q-separator /> -->
				<!-- <q-item clickable to="/" label="Home" color="primary" icon="home"> New incognito tab </q-item> -->
			</q-list>
		</q-menu>
	</q-btn>
</template>

<script setup lang="ts">
	import { useQuasar } from "quasar"
	import { ref } from "vue"
	const $q = useQuasar()

	$q.dark.set(true) // or false or "auto"
	// console.log("Dark active:", $q.dark.isActive) // true, false
	// console.log("Dark mode:", $q.dark.mode) // "auto", true, false

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

  type navMenuModelType = {
    label?: string 
    icon?: string
    path?: string
    click?: (evt: Event) => void 
    subMenu?: navMenuModelType
  }

  // TODO: Autofill these links?
  let navMenuModel: navMenuModelType[] = [
		{label: "FullScreen 😀", icon: "fullscreen", click: goFullScreen },
    {label: "-----------"},
		{label: "Home ", icon: "home", path: "/" },
		{label: "Flow", icon: "account_tree", path: "/flow" },
		{label: "bbView", icon: "tag", path: "/bbView" },
    {label: "TypeView", icon: "tag", path: "/typeview" },
    {label: "WS Log", icon: "manage_search", path: "/wsLog" },
    {label: "DEV", icon: "airplay", path: "/dev" },
    {label: "ObjView", icon: "data_object", path: "/obj" },
    {label: "About", icon: "help_outline", path: "/about" },
  ]

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

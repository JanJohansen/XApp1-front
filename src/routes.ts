import { createRouter, createWebHistory } from "vue-router"

import Home from "./views/Home.vue"
import About from "./views/About.vue"
import Dev from "./views/Dev.vue"
import ObjView from "./views/ObjView.vue"
import BBView from "./views/BBView.vue"
import WsLog from "./views/WsLog.vue"
import Flow from "./views/Flow.vue"
import TypeView from "./views/typeView.vue"
import Dash from "./views/Dash.vue"

const routes = [
	{ path: "/", name: "Home", component: Home },
	{ path: "/about", name: "About", component: About },
	{ path: "/dev", name: "Dev", component: Dev },
    { path: "/wslog", name: "WsLog", component: WsLog },
	{ path: "/typeview", name: "TypeView", component: TypeView },
    { path: "/obj", component: ObjView },	// Without specifying ObjId!
	{ path: "/obj/:id", component: ObjView },
	{ path: "/bbview", component: BBView },
	{ path: "/bbview/:id", component: BBView },
	{ path: "/flow/:id", component: Flow },
	{ path: "/flow", component: Flow },
	{ path: "/dash", component: Dash },

	{ path: "/:pathMatch(.*)", component: Home }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router

import { createRouter, createWebHistory } from "vue-router"

import Home from "./views/Home.vue"
import About from "./views/About.vue"
import Dev from "./views/Dev.vue"
import ObjView from "./views/ObjView.vue"

const routes = [
	{ path: "/", name: "Home", component: Home },
	{ path: "/about", name: "About", component: About },
	{ path: "/dev", name: "Dev", component: Dev },
    { path: "/obj/:id", component: ObjView },
	{ path: "/:pathMatch(.*)", component: Home }
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router

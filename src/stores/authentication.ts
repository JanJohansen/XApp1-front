import { defineStore } from "pinia"
import appBB from "../WsBBClient"

export const useStore = defineStore("auth", {
	// arrow function recommended for full type inference
	state: () => {
		return {
			userId: "guest",
			role: "guest",
		}
	},
	actions: {
		async logIn() {},
        async logOut() {}
	},
	getters: {
		// computed
		isAdmin: (store) => {
			return store.role == "admin"
		}
	}
})

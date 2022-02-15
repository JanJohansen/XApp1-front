import { createApp } from "vue"
import App from "./App.vue"
import router from "./routes"

import { Quasar, Notify } from "quasar"
import "@quasar/extras/material-icons/material-icons.css" // Import icon libraries
import "quasar/src/css/index.sass" // Import Quasar css
import '@quasar/extras/roboto-font/roboto-font.css'
import "../theme.css"

// createApp(App).use(router).mount("#app")

const myApp = createApp(App)
myApp.use(router)
myApp.use(Quasar, {
	plugins: { Notify }, // import Quasar plugins and add here
	config: {
		notify: {}, // default set of options for Notify Quasar plugin
		brand: {
			primary: "#101010",
			dark: "#000000",
			// "dark-page": "#000000"
			// ...
		}
		// loading: {...}, // default set of options for Loading Quasar plugin
		// loadingBar: { ... }, // settings for LoadingBar Quasar plugin
		// ..and many more (check Installation card on each Quasar component/directive/plugin)
	}
})

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount("#app")

//-----------------------------------------------------------------------------
import TestDataGenerator from "./TestDataGenrator"
// let sc = new TestDataGenerator()

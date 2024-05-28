import { createApp } from "vue"
import { createPinia } from 'pinia'
import App from "./App.vue"
import router from "./routes"

import { Quasar, Notify } from "quasar"
import "@quasar/extras/material-icons/material-icons.css" // Import icon libraries
import "quasar/src/css/index.sass" // Import Quasar css
import '@quasar/extras/roboto-font/roboto-font.css'
import "../theme.css"

// createApp(App).use(router).mount("#app")

const app = createApp(App)
console.log("Using Pinia!")
const pinia = createPinia()
app.use(pinia)

app.use(router)

app.use(Quasar, {
	plugins: { Notify }, // import Quasar plugins and add here
	config: {
		notify: {}, // default set of options for Notify Quasar plugin
		brand: {
			primary: '#181a21',
			secondary: '#0000ff',
			accent: '#9C27B0',
	  
			dark: '#101010',
			'dark-page': '#050505',
	  
			positive: '#21BA45',
			negative: '#7f0000',
			info: '#ffff00',
			warning: '#f20000'
		}
		// loading: {...}, // default set of options for Loading Quasar plugin
		// loadingBar: { ... }, // settings for LoadingBar Quasar plugin
		// ..and many more (check Installation card on each Quasar component/directive/plugin)
	}
})

// Assumes you have a <div id="app"></div> in your index.html
app.mount("#app")

//-----------------------------------------------------------------------------
import TestDataGenerator from "./TestDataGenrator"
// let sc = new TestDataGenerator()

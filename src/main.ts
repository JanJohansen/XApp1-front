import { createApp } from "vue"
import App from "./App.vue"
import router from "./routes"

createApp(App).use(router).mount("#app")


import TestDataGenerator from "./TestDataGenrator"
let sc = new TestDataGenerator()
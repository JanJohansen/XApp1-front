<template>
  <div id="UIComponent">
    <!-- <code>{{prettyPrint}}</code> -->
    <c-object v-if="data._$type=='Object'" :obj="data" />
    <c-unknown v-else :obj="data" />
    <!-- <component v-if="component" :is="component" :obj="data" /> -->
    <!-- <span v-if="!component">No type info</span> -->
  </div>
</template>
<style>
#UIComponent {
  border: 1px dashed red;
  border-radius: 15px;
  width: min-content;
  min-width: 150px;
  white-space: pre;
}
</style>

<script lang="ts">
// FIXME: Not so dynamic for now! - See https://medium.com/scrumpy/dynamic-component-templates-with-vue-js-d9236ab183bb
import CUnknown from "./typeComponents/Unknown.vue";
import CObject from "./typeComponents/Object.vue";
import CTestType from "./typeComponents/TestType.vue";

export default {
  name: "DynamicComponent",
  props: { data: Object },
  components: {
    "c-unknown": CUnknown,
    "c-object": CObject,
    "c-test-type": CTestType
  },
  data() {
    return {
      // component: null
    };
  },
  computed: {
    prettyPrint() {
      return JSON.stringify(this.data, null, 2);
    }
    // loadComponent() {
    //   console.log("Loader:", this.data);
    //   if (!this.data._$type) {
    //     return ()=>Promise.resolve({default:{render: ()=>"null"}})
    //   }
    //   return () => import("./typeComponents/" + this.data._$type + "-ui.vue");
    // }
  },
  mounted() {
    // console.log("Mounted: Data:", this.data)
    // switch(this.data._$type) {
    //   case "Object": console.log("EY"); this.component = ()=>CObject; break
    //   case "TestType": this.component = CTestType; break
    // }
    // console.log("DynamicComponent mounted: this.loadComponent", this.loadComponent());
    // this.loadComponent()
    //   .then(x => {
    //     console.log("Loading component for type", this.data._$type, ":", x);
    //     // this.component = () => x;
    //     // this.component = () => this.loadComponent()
    //     this.component = function() {
    //       return {
    //         render: () => "OY",
    //         created() {
    //           console.log("!!CREATED")
    //         }
    //       };
    //     };
    //   })
    //   .catch(x => {
    //     console.log("CATCH!", x);
    //     this.component = Promise.resolve(() => {
    //       render: () => "No UI template.";
    //     });
    //   });
  }
};
</script>
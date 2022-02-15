<template>
  <div>
    <flow-tree-menu-item
          v-for="item in items" :key="item.text"
          :parent="items"
          :item="item"
    />
  </div>
</template>

<script lang="ts">
import FlowTreeMenuItem from "./FlowTreeMenuItem.vue";

export default {
  name: "flow-tree-menu",
  props: ["items"],
  mounted: function(){
  },
  data() {
    return {
      expanded: false
    };
  },
  computed: { },
  methods: { },
  components: {
    FlowTreeMenuItem
  }

};

</script>

<style>
</style>

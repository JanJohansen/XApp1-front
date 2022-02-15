<template>
  <div>Unknown object type:</div>
  <code>{{prettyPrint}}</code>
</template>

<script lang="ts">
export default {
  name: "CUnknown",
  props: {
    obj: Object
  },
  computed: {
    prettyPrint() {
      return JSON.stringify(this.obj, null, 2);
    }
  }
}
</script>

<template>
  <div
    v-show="isVisible"
    class="context-menu"
    :style="style"
    tabindex="-1"
    @blur="close"
    @click="close"
    @contextmenu.capture.prevent>
    <slot :user-data="userData"></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: "context-menu",
  data() {
    return {
      x: null,
      y: null,
      userData: null
    };
  },
  computed: {
    style() {
      return this.isVisible
        ? {
            top: this.y - document.body.scrollTop + "px",
            left: this.x + "px"
          }
        : {};
    },
    isVisible() {
      return this.x !== null && this.y !== null;
    }
  },
  methods: {
    open(evt, userData) {
      this.x = evt.pageX || evt.clientX;
      this.y = evt.pageY || evt.clientY;
      this.userData = userData;
      /*Vue.nextTick(() =>*/ this.$el.focus();
    },
    close(evt) {
      this.x = null;
      this.y = null;
      this.userData = null;
    }
  }
};
</script>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 999;
}
.context-menu:focus {
  outline: none;
}
</style>

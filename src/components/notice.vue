<template>
  <p class="notice" :class="color">
    <slot />
  </p>
</template>

<script>
export default {
  name: "v-notice",
  props: {
    color: {
      type: String,
      default: "gray",
      validator(val) {
        return ["gray", "accent", "warning", "danger", "success"].includes(val);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.notice {
  position: relative;
  padding: 16px;
  border-radius: var(--border-radius);
  max-width: 632px;
  &.gray {
    background-color: var(--lightest-gray);
  }
  &.warning {
    color: var(--warning);
    background-color: var(--warning-light);
  }
}
</style>

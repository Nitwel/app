<docs>
  # Notice Component

  ## Usage

  ```vue
  <v-notice color="warning">Some text here...</v-notice>
  ```

  ## Properties

  | name  | description                            | default |
  |-------|----------------------------------------|---------|
  | color | A color name out of the global pallete | gray    |
  | icon  | The name of the icon to render         | --      |
</docs>

<template>
  <p class="notice" :class="color">
    <v-icon v-if="icon" class="icon" :name="icon" />
    <slot />
  </p>
</template>

<script>
export default {
  name: "VNotice",
  props: {
    color: {
      type: String,
      default: "gray",
      validator(val) {
        return ["gray", "accent", "warning", "danger", "success"].includes(val);
      }
    },
    icon: {
      type: String,
      default: undefined
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
  vertical-align: middle;
  .icon {
    margin-right: 12px;
    line-height: 0;
    margin-top: -2px;
  }
  &.gray {
    background-color: var(--lightest-gray);
  }
  &.warning {
    color: var(--warning);
    background-color: var(--warning-light);
  }
}
</style>

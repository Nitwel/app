<template>
  <v-spinner
    class="v-ext-display-loading"
    size="20"
    line-fg-color="var(--lighter-gray)"
    line-bg-color="var(--lightest-gray)"
  />
</template>

<script>
export default {
  name: "VExtDisplayLoading"
};
</script>

<style lang="scss" scoped>
.v-ext-display-loading {
  width: max-content;
}
</style>

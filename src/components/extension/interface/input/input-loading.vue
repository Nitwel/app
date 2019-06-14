<template>
  <v-spinner
    class="v-ext-input-loading"
    size="20"
    line-fg-color="var(--lighter-gray)"
    line-bg-color="var(--lightest-gray)"
  />
</template>

<script>
export default {
  name: "VExtInputLoading"
};
</script>

<style lang="scss" scoped>
.v-ext-input-loading {
  width: max-content;
}
</style>

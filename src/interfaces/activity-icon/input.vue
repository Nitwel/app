<template>
  <v-input
    class="small"
    :readonly="true"
    :value="value"
    :icon-left="options.iconLeft"
    :icon-right="options.iconRight"
  ></v-input>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceActivityIcon",
  mixins: [mixin]
};
</script>

<style lang="scss" scoped>
.small {
  width: 100%;
  max-width: var(--width-medium);
}
</style>

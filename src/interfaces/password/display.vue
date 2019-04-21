<template>
  <v-icon
    class="material-icons readonly-password"
    :style="{ color: `var(--${colorChange})` }"
    :name="icon"
  />
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "readonly-password",
  mixins: [mixin],
  computed: {
    icon() {
      return this.value ? "lock_outline" : "lock_open";
    },
    colorChange() {
      return this.value ? "dark-gray" : "warning";
    }
  }
};
</script>

<style lang="scss" scoped></style>

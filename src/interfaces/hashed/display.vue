<template>
  <v-icon :name="icon" class="readonly-hashed" :style="{ color: `var(--${colorChange})` }" />
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "readonly-hashed",
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

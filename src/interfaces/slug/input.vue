<template>
  <v-input
    type="text"
    class="slug"
    :value="value"
    :readonly="readonly"
    :placeholder="options.placeholder"
    :maxlength="length"
    :id="name"
    @input="updateValue"
  ></v-input>
</template>

<script>
import slug from "slug";

import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  mixins: [mixin],
  computed: {
    mirror() {
      const { mirroredField } = this.options;

      return this.values[mirroredField];
    }
  },
  watch: {
    mirror() {
      this.updateValue(this.mirror);
    }
  },
  methods: {
    updateValue(value) {
      this.$emit(
        "input",
        slug(value, {
          lower: this.options.forceLowercase
        })
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.slug {
  max-width: var(--width-medium);
}
</style>

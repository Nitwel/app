<template>
  <div class="interface-radio-buttons">
    <v-radio
      v-for="(display, val) in choices"
      :id="`${name}-${val}`"
      :key="val"
      :name="name"
      :value="val"
      :disabled="readonly"
      :model-value="value"
      :label="display"
      @change="$emit('input', $event)"
    ></v-radio>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceRadioButtons",
  mixins: [mixin],
  computed: {
    choices() {
      let choices = this.options.choices;

      if (!choices) return {};

      if (typeof this.options.choices === "string") {
        choices = JSON.parse(this.options.choices);
      }

      return choices;
    }
  }
};
</script>

<style lang="scss" scoped>
.interface-radio-buttons {
  max-width: var(--width-x-large);
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(4, 1fr);
}
</style>

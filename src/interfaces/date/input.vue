<template>
  <v-input
    type="date"
    class="interface-date"
    :id="name"
    :name="name"
    :min="options.min"
    :max="options.max"
    :readonly="readonly"
    :value="value"
    @input="$emit('input', $event)"
  ></v-input>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "interface-date",
  mixins: [mixin]
};
</script>

<style lang="scss" scoped>
.interface-date {
  width: 100%;
}
</style>

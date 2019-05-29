<template>
  <v-textarea
    :id="name"
    class="textarea"
    :readonly="readonly"
    :value="value"
    :placeholder="options.placeholder"
    :rows="+options.rows"
    @input="$emit('input', $event)"
  ></v-textarea>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  mixins: [mixin]
};
</script>

<style lang="scss" scoped>
.textarea {
  width: 100%;
  max-width: var(--width-x-large);
}
</style>

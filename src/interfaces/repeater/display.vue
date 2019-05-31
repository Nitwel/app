<template>
  <v-contextual-menu
    trigger="hover"
    :text="itemCount"
    :options="menuOptions"
    :icon="null"
    placement="right-end"
  />
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  mixins: [mixin],
  computed: {
    valueFields() {
      return _.chain(this.options.fields)
        .pickBy(value => {
          return value.hasOwnProperty("preview") && value.preview;
        })
        .keys()
        .value();
    },
    itemCount() {
      return this.$tc("item_count", (this.value || []).length, {
        count: (this.value || []).length
      });
    },
    menuOptions() {
      var options = [];
      _.forEach(this.value, value => {
        options.push({
          text: value[this.valueFields[0]]
        });
      });
      return options;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-ext-display {
  display: flex;
}
</style>

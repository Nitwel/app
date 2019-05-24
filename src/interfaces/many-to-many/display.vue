<template>
  <v-contextual-menu trigger="hover" :text="itemCount" :options="menuOptions" :icon="null" />
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "ReadonlyManyToMany",
  mixins: [mixin],
  computed: {
    itemCount() {
      return this.$tc("item_count", (this.value || []).length, {
        count: (this.value || []).length
      });
    },
    menuOptions() {
      var options = [];
      _.forEach(this.value, value => {
        options.push({
          text: this.$helpers.micromustache.render(this.options.template, value)
        });
      });
      return options;
    }
  }
};
</script>

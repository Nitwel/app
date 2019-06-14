<template>
  <div class="interface-status">
    <v-radio
      v-for="(options, key) in optionValues"
      :id="`${name}-${key}`"
      :key="key"
      :name="name"
      :value="key"
      :disabled="readonly"
      :model-value="String(value)"
      :label="options.label"
      :checked="key == value"
      @change="$emit('input', $event)"
    ></v-radio>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceStatus",
  mixins: [mixin],
  data() {
    return {
      startStatus: null
    };
  },
  computed: {
    statusMapping() {
      if (typeof this.options.status_mapping === "string") {
        return this.options.status_mapping ? JSON.parse(this.status_mapping) : {};
      }
      if (!this.options.status_mapping) return {};
      return _.mapValues(this.options.status_mapping, mapping => ({
        ...mapping,
        label: this.$helpers.formatTitle(this.$t(mapping.name))
      }));
    },
    optionValues() {
      const allStatuses = Object.keys(this.statusMapping);

      const allowedStatuses = _.differenceWith(allStatuses, this.blacklist, _.isEqual);

      return _.pick(this.statusMapping, allowedStatuses);
    },
    blacklist() {
      if (typeof this.permissions.status_blacklist === "string")
        return this.permissions.status_blacklist.split(",");

      return this.permissions.status_blacklist;
    },
    permissions() {
      if (this.newItem) {
        return this.$store.state.permissions[this.collection].$create;
      }

      return this.$store.state.permissions[this.collection].statuses[this.startStatus];
    }
  },
  created() {
    if (!this.value || this.value === "") {
      // Set first value selected if no default exists
      if (this.$store.state.permissions[this.collection].statuses !== null) {
        let obj = Object.keys(this.$store.state.permissions[this.collection].statuses);
        if (obj.length > 1) {
          this.$emit("input", obj[0]);
        }
      }
    }
    this.startStatus = this.value;
  }
};
</script>

<style lang="scss" scoped>
.interface-status {
  max-width: var(--width-x-large);
  .v-radio {
    display: inline-block;
    margin-right: 40px;
    margin-bottom: 16px;
  }
}
</style>

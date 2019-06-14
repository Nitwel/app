<template>
  <v-notice v-if="Object.keys(interfaceOptions).length === 0">
    {{ $t("interface_has_no_options") }}
  </v-notice>
  <form v-else-if="interfaceOptions" @submit.prevent>
    <div v-for="(option, optionID) in interfaceOptions" :key="optionID" class="options">
      <label :for="optionID">{{ option.name }}</label>
      <v-ext-input
        :id="option.interface"
        :name="optionID"
        :type="option.type"
        :length="option.length"
        :readonly="option.readonly"
        :required="option.required"
        :loading="option.loading"
        :options="option.options"
        :value="(value || {})[optionID]"
        :fields="interfaceOptions"
        :values="value || {}"
        @input="stageValue(optionID, $event)"
      />
      <p class="note" v-html="$helpers.snarkdown(option.comment || '')" />
    </div>
  </form>
  <v-notice v-else>
    {{ $t("select_interface") }}
  </v-notice>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceOptions",
  mixins: [mixin],
  computed: {
    interfaceName() {
      const interfaceNameField = this.options.interfaceField;
      if (!interfaceNameField) return;
      return this.values[interfaceNameField];
    },
    interfaceOptions() {
      if (!this.interfaceName) return;
      return this.$store.state.extensions.interfaces[this.interfaceName].options;
    }
  },
  methods: {
    stageValue(field, value) {
      const oldValue = _.clone(this.value || {});
      const newValue = _.merge(oldValue, { [field]: value });
      this.$emit("input", newValue);
    }
  }
};
</script>

<style scoped>
label {
  margin-bottom: 8px;
  font-size: var(--size-2);
  margin-bottom: 12px;
}

div.options {
  margin-top: 30px;
}

.note {
  display: block;
  margin-top: 4px;
  margin-bottom: 10px;
  font-style: italic;
  font-size: var(--size-3);
  line-height: 1.5em;
  color: var(--light-gray);
  font-weight: var(--weight-bold);
}
</style>

<template>
  <component
    :is="componentName"
    :name="name"
    :id="name"
    :input-name="id"
    :value="value"
    :type="typeOrDefault"
    :length="length"
    :readonly="readonly"
    :required="required"
    :loading="loading"
    :options="optionsWithDefaults"
    :new-item="newItem"
    :relation="relation"
    :fields="fields"
    :values="values"
    class="v-ext-input"
    @input="$emit('input', $event)"
    @setfield="$emit('setfield', $event)"
  >
    <slot />
  </component>
</template>

<script>
import Vue from "vue";
import loadExtension from "../../../../helpers/load-extension";
import componentExists from "../../../../helpers/component-exists";
import InputFallback from "./input-fallback.vue";
import InputLoading from "./input-loading.vue";
import { datatypes } from "../../../../type-map";

export default {
  name: "v-ext-input",
  props: {
    id: {
      type: String,
      default: null
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: null,
      default: null
    },
    type: {
      type: String,
      default: null
    },
    datatype: {
      type: String,
      default: null
    },
    length: {
      type: [String, Number],
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },
    newItem: {
      type: Boolean,
      default: false
    },
    relation: {
      type: Object,
      default: null
    },
    fields: {
      type: Object,
      default: null
    },
    values: {
      type: Object,
      default: null
    }
  },
  computed: {
    interfaces() {
      return this.$store.state.extensions.interfaces;
    },
    interface() {
      if (this.id === null) return this.interfaceFallback;
      return this.interfaces && this.interfaces[this.id];
    },
    databaseVendor() {
      return this.$store.state.serverInfo.databaseVendor;
    },
    componentName() {
      if (this.id === null) return this.componentNameFallback;
      return `input-${this.id}`;
    },
    typeOrDefault() {
      if (!this.interface) return null;
      return this.type ? this.type : this.interface && this.interface.types[0];
    },
    optionsWithDefaults() {
      if (!this.interface) return {};

      const defaults = this.$lodash.mapValues(
        this.interface.options,
        settings => settings.default || null
      );

      return {
        ...defaults,
        ...this.options
      };
    },
    componentNameFallback() {
      return `input-${this.interfaceFallback.id}`;
    },
    interfaceFallback() {
      // Default to text-input if all else fails
      if (this.datatype == null) return this.interfaces["text-input"];

      // Lookup the raw db datatype based on the current vendor in the type-map
      // to extract the fallback interface to use.
      const fallback = datatypes[this.databaseVendor][this.datatype].fallbackInterface;

      return this.interfaces[fallback];
    }
  },
  watch: {
    id() {
      this.registerInterface();
    }
  },
  created() {
    this.registerInterface();
  },
  methods: {
    /**
     * Register the extension as component (if it hasn't been registered before yet)
     */
    registerInterface() {
      // If component already exists, do nothing
      if (componentExists(this.componentName)) return;

      let component;

      if (this.interface.core) {
        component = import("@/interfaces/" + this.interface.id + "/input.vue");
      } else {
        const filePath = `${this.$api.url}/${this.interface.path.replace("meta.json", "input.js")}`;

        component = loadExtension(filePath);
      }

      Vue.component(this.componentName, () => ({
        component: component,
        error: InputFallback,
        loading: InputLoading
      }));
    }
  }
};
</script>

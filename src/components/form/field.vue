<template>
  <div>
    <div class="name" v-if="showLabel">
      {{ field.name || $helpers.formatTitle(field.field) }}
      <span class="optional" v-if="field.required === false">— {{ $t("optional") }}</span>
      <v-toggle
        v-if="batchMode"
        class="batch-toggle"
        :value="!blocked"
        @input="$emit(blocked ? 'activate' : 'deactivate', field.field)"
      />
    </div>

    <div class="field">
      <v-ext-input
        :id="field.interface || 'text-input'"
        :name="name"
        :required="field.required"
        :readonly="field.readonly || blocked"
        :options="field.options"
        :type="field.type"
        :datatype="field.datatype"
        :value="values[field.field]"
        :relation="relation"
        :fields="fields"
        :values="values"
        :length="field.length"
        :new-item="newItem"
        @input="
          $emit('stage-value', {
            field: field.field,
            value: $event
          })
        "
        @setfield="
          $emit('stage-value', {
            field: $event.field,
            value: $event.value
          })
        "
      />
    </div>

    <div class="note" v-if="field.note" v-html="$helpers.snarkdown(field.note)" />
  </div>
</template>

<script>
export default {
  name: "v-field",
  props: {
    name: {
      type: String,
      required: true
    },
    field: {
      type: Object,
      required: true
    },
    fields: {
      type: Object,
      required: true
    },
    values: {
      type: Object,
      required: true
    },
    blocked: {
      type: Boolean,
      default: false
    },
    batchMode: {
      type: Boolean,
      default: false
    },
    newItem: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    showLabel() {
      const interfaceName = this.field.interface;
      const interfaceMeta = this.getInterfaceMeta(interfaceName);

      // In case the current field doesn't have an interface setup
      if (!interfaceMeta) return;

      const hideLabel = interfaceMeta.hideLabel;

      if (hideLabel === true) return false;

      return true;
    },

    relation() {
      const { collection, field, type } = this.field;

      if (type.toLowerCase() === "m2o") return this.$store.getters.m2o(collection, field);
      if (type.toLowerCase() === "o2m") return this.$store.getters.o2m(collection, field);
      if (type.toLowerCase() === "translation") return this.$store.getters.o2m(collection, field);
      return null;
    }
  },

  methods: {
    getInterfaceMeta(interfaceName) {
      const interfaceMeta = this.$store.state.extensions.interfaces[interfaceName];

      return interfaceMeta || undefined;
    }
  }
};
</script>

<style lang="scss" scoped>
.name {
  font-size: var(--size-2);
  margin-bottom: 10px;
  color: var(--darkest-gray);

  .optional {
    color: var(--gray);
  }
}

.note {
  margin-top: 8px;
  font-style: italic;
  font-size: var(--size-3);
  font-weight: var(--weight-bold);
  color: var(--light-gray);
}

.batch-toggle {
  display: inline-block;
  vertical-align: -4px;
  margin-left: 4px;
}
</style>

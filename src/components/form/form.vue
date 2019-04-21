<template>
  <div class="form">
    <v-field
      v-for="field in filteredFields"
      :class="field.width"
      :key="uniqueID + '-' + field.field"
      :name="uniqueID + '-' + field.field"
      :field="field"
      :fields="fields"
      :values="values"
      :blocked="batchMode && !activeFields.includes(field.field)"
      :batchMode="batchMode"
      :newItem="newItem"
      @activate="activateField"
      @deactivate="deactivateField"
      @stage-value="$emit('stage-value', $event)"
    />
  </div>
</template>

<script>
import VField from "./field.vue";
import { defaultFull } from "../../store/modules/permissions/defaults";

export default {
  name: "v-form",
  components: {
    VField
  },
  props: {
    fields: {
      type: Object,
      required: true
    },
    values: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    batchMode: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: Object,
      default: () => defaultFull
    },
    newItem: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // Field names should be prefixed by a unique ID per form. There's a possibility that multiple
    // forms are being rendered on the same page, each containing fields with the same name. If we
    // wouldn't prefix these names with a unique ID per form, we'll run into conflicts.
    uniqueID() {
      return this.$helpers.shortid.generate();
    },

    // Not all fields in a collection are allowed to be used. This will contain an array of all the
    // fields that the user can interact with, in the correct order
    filteredFields() {
      const readFieldBlacklist = this.permissions.read_field_blacklist || [];
      const writeFieldBlacklist = this.permissions.write_field_blacklist || [];
      let fields = Object.values(this.fields);

      // Filter out all the fields that are listed in the field read blacklist
      fields = fields.filter(fieldInfo => {
        const fieldName = fieldInfo.field;
        return readFieldBlacklist.includes(fieldName) === false;
      });

      // Filter out the fields that are marked hidden on detail
      fields = fields.filter(fieldInfo => {
        const hiddenDetail = fieldInfo.hidden_detail;

        // NOTE: non strict equal on the 0 cause it might be a number or a string
        return hiddenDetail == "0" || hiddenDetail === false;
      });

      // Sort the fields on the sort column value
      fields = fields.sort((a, b) => {
        if (a.sort == b.sort) return 0;
        if (a.sort === null) return 1;
        if (b.sort === null) return -1;
        return a.sort > b.sort ? 1 : -1;
      });

      // Cleanup the readonly type and force readonly to true if the field is listed in the write
      // field blacklist
      fields = fields.map(fieldInfo => {
        const fieldName = fieldInfo.field;

        if (
          fieldInfo.readonly === true ||
          fieldInfo.readonly === "1" ||
          fieldInfo.readonly === 1 ||
          writeFieldBlacklist.includes(fieldName)
        ) {
          fieldInfo.readonly = true;
        } else {
          fieldInfo.readonly = false;
        }

        return fieldInfo;
      });

      // Change the class to half-right if the current element is preceded by another half width field
      // this makes them align side by side
      fields = fields.map((fieldInfo, index) => {
        if (index === 0) return fieldInfo;

        if (fieldInfo.width === "half") {
          const prevField = fields[index - 1];

          if (prevField.width === "half") {
            fieldInfo.width = "half-right";
          }
        }
        return fieldInfo;
      });

      return fields;
    }
  },
  data() {
    return {
      // The fields that are actively being edited in batch mode
      activeFields: []
    };
  },
  methods: {
    activateField(fieldName) {
      if (!this.batchMode) return;
      this.activeFields = [...this.activeFields, fieldName];
    },
    deactivateField(fieldName) {
      if (!this.batchMode) return;
      this.activeFields = this.activeFields.filter(activeField => activeField !== fieldName);
      // If a field is being un-selected during batch mode, we shouldn't save the edits that made in
      // this field
      this.$emit("unstage-value", fieldName);
    }
  }
};
</script>

<style lang="scss" scoped>
.form {
  --column-width: 300px;
  --gap-width: 48px 32px;

  @media (min-width: 1000px) {
    display: grid;
    grid-gap: var(--gap-width);
    grid-template-columns:
      [start] minmax(0, var(--column-width)) [half] minmax(0, var(--column-width))
      [full] 1fr [fill];
  }
}

.form > * {
  @media (max-width: 1000px) {
    margin-bottom: 32px;
  }
}

.form > .half,
.form > .half-space {
  grid-column: start / half;
}

.form > .half-right {
  grid-column: half / full;
}

.form > .full {
  grid-column: start / full;
}

.form > .fill {
  grid-column: start / fill;
}
</style>

<template>
  <form @submit.prevent>
    <fieldset>
      <legend class="style-3">{{ $t("layouts-tabular-fields") }}</legend>
      <draggable v-model="sortList" @end="sort" handle=".handle">
        <div
          class="draggable"
          v-for="field in sortList"
          :key="'tabular-layout-options-field-' + field.field"
        >
          <v-checkbox
            class="checkbox"
            :key="field.field"
            :id="'tabular-layout-options-field-' + field.field"
            :label="field.name"
            :value="field.field"
            :checked="fieldsInUse.includes(field.field)"
            @change="toggleField(field.field)"
          ></v-checkbox>
          <v-icon class="handle" name="drag_handle" />
        </div>
      </draggable>
    </fieldset>
    <label for="spacing" class="style-3">{{ $t("spacing") }}</label>
    <v-select
      id="spacing"
      :value="viewOptions.spacing || 'comfortable'"
      :options="{
        compact: $t('compact'),
        cozy: $t('cozy'),
        comfortable: $t('comfortable')
      }"
      class="select"
      icon="reorder"
      @input="setSpacing"
    ></v-select>
  </form>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";

export default {
  mixins: [mixin],
  data() {
    return {
      sortList: null
    };
  },
  computed: {
    fieldsInUse() {
      if (!this.viewQuery || !this.viewQuery.fields)
        return Object.values(this.fields)
          .filter(field => field.primary_key === false)
          .slice(0, 5)
          .map(field => field.field);

      if (this.viewQuery.fields === "") return [];

      return this.viewQuery.fields.split(",").filter(field => this.fields[field]);
    }
  },
  created() {
    this.initSortList();
  },
  methods: {
    setSpacing(value) {
      this.$emit("options", {
        spacing: value
      });
    },
    toggleField(fieldID) {
      const fieldsInUse = [...this.fieldsInUse];

      if (fieldsInUse.includes(fieldID)) {
        fieldsInUse.splice(fieldsInUse.indexOf(fieldID), 1);
      } else {
        fieldsInUse.push(fieldID);
      }

      const fields = this.sortList
        .map(fieldInfo => fieldInfo.field)
        .filter(fieldID => fieldsInUse.includes(fieldID))
        .join();

      this.$emit("query", {
        fields
      });
    },
    sort() {
      this.$emit("query", {
        ...this.viewQuery,
        fields: this.sortList
          .map(obj => obj.field)
          .filter(fieldID => this.fieldsInUse.includes(fieldID))
          .join()
      });
    },
    initSortList() {
      this.sortList = [
        ...this.fieldsInUse.map(fieldID => this.fields[fieldID]),
        ...Object.values(this.fields).filter(
          fieldInfo => !this.fieldsInUse.includes(fieldInfo.field)
        )
      ];
    }
  },
  watch: {
    fields() {
      this.initSortList();
    }
  }
};
</script>

<style lang="scss" scoped>
fieldset {
  padding: 8px 0 0 0;
}

label {
  margin-bottom: 10px;
  margin-top: 30px;
}

.draggable {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: ns-resize;
  padding: 2px 0;

  .checkbox {
    max-width: 125px;
    label {
      font-size: 14px;
    }
  }

  i {
    color: var(--lighter-gray);
  }
}
</style>

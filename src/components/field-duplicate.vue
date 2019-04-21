<template>
  <v-modal
    :title="$t('duplicating_field') + ': ' + $helpers.formatTitle(fieldInfo.field)"
    :buttons="buttons"
    @save="saveField()"
    @close="$emit('close')"
  >
    <form @submit.prevent class="options">
      <div class="options">
        <label>
          {{ $t("collection") }}
          <v-simple-select required v-model="selectedCollection">
            <option
              v-for="collection in Object.keys(this.collections)"
              :key="collection"
              :value="collection"
              :selected="collection === selectedCollection"
            >
              {{ $helpers.formatTitle(collection) }}
            </option>
          </v-simple-select>
        </label>
      </div>
      <div class="options">
        <label>
          {{ $t("field") + " " + $t("name") }}
          <v-input
            required
            v-model="field"
            :value="field"
            :placeholder="fieldInfo.field"
            :icon-right="iconToShow.icon"
            :icon-right-color="iconToShow.color"
            :icon-right-tooltip="iconToShow.tooltip"
          />
        </label>
        <p class="small-text">
          {{ $t("display_name") }}:
          <b>{{ $helpers.formatTitle(field || "...") }}</b>
        </p>
      </div>
    </form>
  </v-modal>
</template>

<script>
export default {
  name: "v-field-duplicate",
  props: {
    collectionInformation: {
      type: Object,
      required: true
    },
    fieldInformation: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fieldInfo: Object.assign({}, this.fieldInformation),
      selectedCollection: this.collectionInformation.collection,
      field: null,
      saving: false
    };
  },
  computed: {
    canDuplicate() {
      if (this.field && this.isFieldValid && this.selectedCollection) {
        return true;
      }
      return false;
    },
    iconToShow() {
      if (!this.field) {
        return { icon: null, color: null };
      }
      if (this.isFieldValid) {
        return { icon: "done", color: "success" };
      }
      return {
        icon: "error",
        color: "danger",
        tooltip: this.$t("field_already_exists", { field: "'" + this.field + "'" })
      };
    },
    isFieldValid() {
      let isValid = true;
      Object.keys(this.collections[this.selectedCollection].fields).forEach(field => {
        if (field === this.field) {
          isValid = false;
        }
      });
      if (isValid) {
        return true;
      }
      return false;
    },
    collectionFieldCount() {
      return Object.keys(this.collections[this.selectedCollection].fields).length;
    },
    collections() {
      const collections = Object.assign({}, this.$store.state.collections);
      return Object.keys(collections)
        .filter(collection => collection.startsWith("directus_") === false)
        .reduce((obj, collection) => {
          obj[collection] = collections[collection];
          return obj;
        }, {});
    },
    buttons() {
      return {
        save: {
          disabled: !this.canDuplicate,
          text: this.$t("create"),
          loading: this.saving
        }
      };
    }
  },
  watch: {
    field(val) {
      // Based on https://gist.github.com/mathewbyrne/1280286
      this.field = val
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/[^\w_]+/g, "") // Remove all non-word chars
        .replace(/__+/g, "_"); // Replace multiple _ with single _
    }
  },
  methods: {
    saveField() {
      this.saving = true;

      let fieldInfo = this.fieldInfo;
      fieldInfo.field = this.field;
      fieldInfo.sort = this.collectionFieldCount + 1;
      delete fieldInfo.id;
      delete fieldInfo.name;

      const result = {
        fieldInfo,
        collection: this.selectedCollection
      };

      this.$emit("save", result);
    }
  }
};
</script>

<style lang="scss" scoped>
form.options {
  padding: 5% 10%;

  div.options {
    margin-bottom: 30px;

    &:last-of-type {
      margin-bottom: 0px;
    }
  }

  & label > .v-simple-select,
  & label > .v-input {
    margin-top: 10px;
  }

  .required {
    color: var(--darkest-gray);
    vertical-align: super;
    font-size: 7px;
  }

  .small-text {
    margin-top: 4px;
    font-style: italic;
    font-size: 12px;
    line-height: 1.5em;
    color: var(--light-gray);
    & b {
      font-weight: 600;
    }
  }
}
</style>

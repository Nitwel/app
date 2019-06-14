<template>
  <div class="interface-one-to-many">
    <v-notice v-if="relationSetup === false" color="warning" icon="warning">
      {{ $t("interfaces-one-to-many-relation_not_setup") }}
    </v-notice>

    <template v-else>
      <div v-if="itemsRaw.length" class="table">
        <div class="header">
          <div class="row">
            <button v-if="sortable" class="sort-column" @click="toggleManualSort">
              <v-icon name="sort" size="18" :color="manualSortActive ? 'action' : 'light-gray'" />
            </button>

            <button
              v-for="column in columns"
              :key="column.field"
              type="button"
              @click="changeSort(column.field)"
            >
              {{ column.name }}
              <v-icon
                v-if="sort.field === column.field"
                :name="sort.asc ? 'arrow_downward' : 'arrow_upward'"
                size="16"
              />
            </button>
          </div>
        </div>

        <draggable
          v-model="itemsSorted"
          class="body"
          handle=".drag-handle"
          ghost-class="o2m-drag-ghost"
          :disabled="!sortable || !manualSortActive"
          :class="{ dragging }"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="item in itemsSorted"
            :key="item[relatedKey]"
            class="row"
            @click="startEdit(item[relatedKey], item.$tempKey)"
          >
            <div v-if="sortable" class="sort-column" :class="{ disabled: !manualSortActive }">
              <v-icon name="drag_handle" class="drag-handle" />
            </div>
            <div v-for="column in columns" :key="column.field">
              <v-ext-display
                :interface-type="(column.fieldInfo || {}).interface || null"
                :name="column.field"
                :type="column.fieldInfo.type"
                :collection="collection"
                :datatype="column.fieldInfo.datatype"
                :options="column.fieldInfo.options"
                :value="item[column.field]"
              />
            </div>
            <button
              v-tooltip="$t('remove_related')"
              type="button"
              class="remove-item"
              @click.stop="removeRelated(item[relatedKey])"
            >
              <v-icon name="close" />
            </button>
          </div>
        </draggable>
      </div>

      <v-notice v-else>{{ $t("no_items_selected") }}</v-notice>

      <div class="buttons">
        <v-button
          v-if="options.allow_create"
          type="button"
          :disabled="readonly"
          icon="add"
          @click="addNew = true"
        >
          {{ $t("add_new") }}
        </v-button>

        <v-button
          v-if="options.allow_select"
          type="button"
          :disabled="readonly"
          icon="playlist_add"
          @click="selectExisting = true"
        >
          {{ $t("select_existing") }}
        </v-button>
      </div>
    </template>

    <v-item-select
      v-if="selectExisting"
      :collection="relation.collection_many.collection"
      :fields="visibleFields"
      :filters="[]"
      :value="stagedSelection || selectionPrimaryKeys"
      @input="stageSelection"
      @done="closeSelection"
      @cancel="cancelSelection"
    />

    <portal v-if="editExisting" to="modal">
      <v-modal
        :title="$t('editing_item')"
        :buttons="{
          save: {
            text: 'Save',
            color: 'accent'
          }
        }"
        @close="editExisting = false"
        @save="saveEdits"
      >
        <div class="edit-modal-body">
          <v-form
            :fields="relatedCollectionFields"
            :collection="relatedCollection"
            :values="editExisting"
            @stage-value="stageValue"
          ></v-form>
        </div>
      </v-modal>
    </portal>

    <portal v-if="addNew" to="modal">
      <v-modal
        :title="$t('creating_item')"
        :buttons="{
          save: {
            text: 'Save',
            color: 'accent'
          }
        }"
        @close="addNew = null"
        @save="addNewItem"
      >
        <div class="edit-modal-body">
          <v-form
            new-item
            :fields="relatedCollectionFields"
            :collection="collection"
            :values="relatedDefaultsWithEdits"
            @stage-value="stageValue"
          ></v-form>
        </div>
      </v-modal>
    </portal>
  </div>
</template>

<script>
import shortid from "shortid";
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceOneToMany",
  mixins: [mixin],
  data() {
    return {
      sort: {
        field: null,
        asc: true
      },

      selectExisting: false,

      editExisting: null,
      addNew: null,
      edits: {},

      dragging: false,

      // Items to be rendered in the table preview
      itemsRaw: [],
      loading: false,
      error: null,

      stagedSelection: null
    };
  },
  computed: {
    items() {
      const primaryKey = this.relatedKey;
      return this.itemsRaw.map(item => {
        if (item.hasOwnProperty(primaryKey)) return item;
        return {
          ...item,
          $tempKey: shortid.generate()
        };
      });
    },

    // The items in this.itemsRaw sorted by the information in this.sort
    itemsSorted: {
      get() {
        return _.orderBy(
          this.items,
          item => item[this.sort.field],
          this.sort.asc ? "asc" : "desc"
        ).filter(item => item.$delete !== true);
      },
      set(newValue) {
        let value = _.clone(newValue);

        value = value.map((item, index) => {
          return {
            ...item,
            [this.relatedSortField.field]: index + 1
          };
        });

        this.emitValue(value);
        this.itemsRaw = value;
      }
    },

    // The field on the related collection that has the type of sort
    relatedSortField() {
      return _.find(this.relatedCollectionFields, { type: "sort" });
    },

    // Check if the items are sortable by checking for the prescense of a sort field
    sortable() {
      return !!this.relatedSortField;
    },

    // If the user currently sorted by the manual sort option
    manualSortActive() {
      if (!this.sortable) return false;
      return this.sort.field === this.relatedSortField.field;
    },

    // If the relationship has been configured
    relationSetup() {
      if (!this.relation) return false;
      return true;
    },

    relatedCollection() {
      return this.relation.collection_many.collection;
    },

    // Fields in the related collection
    relatedCollectionFields() {
      return this.relation.collection_many.fields;
    },

    // Primary key fieldname of the related collection
    relatedKey() {
      return _.find(this.relation.collection_many.fields, {
        primary_key: true
      }).field;
    },

    // Name of the field that holds the primary key of the current collection
    relatedField() {
      return this.relation.field_many.field;
    },

    // The fields that should be rendered in the modal / table
    visibleFields() {
      if (this.relationSetup === false) return [];
      if (!this.options.fields) return [];

      if (Array.isArray(this.options.fields)) {
        return this.options.fields.map(val => val.trim());
      }

      return this.options.fields.split(",").map(val => val.trim());
    },

    // Column headers for the inline table preview
    columns() {
      if (this.relationSetup === false) return null;
      return this.visibleFields.map(field => ({
        field,
        name: this.$helpers.formatTitle(field),
        fieldInfo: this.relatedCollectionFields[field]
      }));
    },

    // Default values of the related collection, used when creating an new item
    relatedDefaultValues() {
      if (this.relationSetup === false) return null;
      if (!this.relatedCollectionFields) return null;

      return _.mapValues(this.relatedCollectionFields, field => field.default_value);
    },

    // The current state of the new item. Combines default values with the edits made
    relatedDefaultsWithEdits() {
      if (this.relationSetup === false) return null;
      if (!this.relatedDefaultValues) return null;

      return {
        ...this.relatedDefaultValues,
        ...this.edits
      };
    },

    // The current value in just primary keys. Can be passed to the item select modal
    selectionPrimaryKeys() {
      return (this.value || [])
        .filter(item => item.$delete !== true)
        .map(item => item[this.relatedKey])
        .filter(key => key); // Filter out empty items
    }
  },
  watch: {
    relation() {
      if (this.relationSetup) {
        this.sort.field = this.visibleFields && this.visibleFields[0];
      }
    },
    value() {
      this.fetchItems();
    }
  },
  created() {
    if (this.relationSetup) {
      if (this.sortable) {
        this.sort.field = this.relatedSortField.field;
      } else {
        this.sort.field = this.visibleFields && this.visibleFields[0];
      }
    }

    this.onSearchInput = _.debounce(this.onSearchInput, 200);
    this.itemsRaw = this.value;
  },
  methods: {
    changeSort(field) {
      if (this.sort.field === field) {
        this.sort.asc = !this.sort.asc;
        return;
      }

      this.sort.asc = true;
      this.sort.field = field;
      return;
    },

    stageSelection(primaryKeys) {
      this.stagedSelection = primaryKeys;
    },

    closeSelection() {
      const currentSelection = _.clone(this.value || []);

      let newSelection = currentSelection.map(item => {
        const primaryKey = item[this.relatedKey];

        if (this.stagedSelection.includes(primaryKey)) {
          return {
            [this.relatedKey]: primaryKey
          };
        }

        return {
          [this.relatedKey]: primaryKey,
          $delete: true
        };
      });

      const newlySelectedPrimaryKeys = _.difference(
        this.stagedSelection,
        currentSelection.map(i => i[this.relatedKey])
      );

      const newlySelected = newlySelectedPrimaryKeys.map(key => ({ [this.relatedKey]: key }));

      newSelection = [...newSelection, ...newlySelected];

      this.emitValue(newSelection);
      this.stagedSelection = null;
      this.selectExisting = false;
    },

    cancelSelection() {
      this.stagedSelection = null;
      this.selectExisting = false;
    },

    startEdit(primaryKey, tempKey) {
      if (!primaryKey) {
        const values = _.find(this.items, { $tempKey: tempKey });
        this.editExisting = values;
        return;
      }

      const collection = this.relation.collection_many.collection;

      this.$api
        .getItem(collection, primaryKey)
        .then(res => res.data)
        .then(item => (this.editExisting = item))
        .catch(console.error);
    },

    stageValue({ field, value }) {
      this.$set(this.edits, field, value);
    },

    // Emit the value to the parent component. Will filter out all nested copies of the current item
    emitValue(value) {
      // Filter out copies of the current relational parent item
      value = value.map(item => {
        if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
          delete item[this.relatedField];
        }

        return item;
      });

      // Filter out the temporary IDs
      value = value.map(item => {
        if (item.hasOwnProperty("$tempKey")) {
          delete item.$tempKey;
        }

        return item;
      });

      this.$emit("input", value);
    },

    saveEdits() {
      this.emitValue([
        ...(this.value || []).map(val => {
          if (val.id === this.editExisting[this.relatedKey]) {
            return {
              ...val,
              ...this.edits
            };
          }

          return val;
        })
      ]);

      this.edits = {};
      this.editExisting = false;
    },
    addNewItem() {
      this.emitValue([...(this.value || []), this.edits]);

      this.edits = {};
      this.addNew = false;
    },
    removeRelated(relatedKey) {
      const currentSelection = _.clone(this.value || []);

      let value;

      if (relatedKey) {
        value = currentSelection.map(val => {
          if (val[this.relatedKey] === relatedKey) {
            return {
              [this.relatedKey]: val[this.relatedKey],
              $delete: true
            };
          }

          return val;
        });
      } else {
        value = currentSelection.filter(val => {
          return val[this.relatedKey] !== relatedKey;
        });
      }

      this.emitValue(value);
    },
    onSearchInput(value) {
      this.setViewQuery({
        q: value
      });
    },
    toggleManualSort() {
      this.sort.field = this.relatedSortField.field;
      this.sort.asc = true;
    },

    // Fetches the items for the current selection. This should be fired whenever the value is changed
    // so we can render the previews for the right fields in the table
    fetchItems() {
      const value = _.clone(this.value || []).filter(item => item.$delete !== true);
      const collection = this.relation.collection_many.collection;
      const fields = [...this.visibleFields, this.relatedKey];
      const primaryKeys = value.map(item => item[this.relatedKey]);
      const newItems = value.filter(item => item[this.relatedKey] === undefined);

      if (primaryKeys.length === 0) {
        this.itemsRaw = [];
        return;
      }

      this.loading = true;

      this.$api
        .getItem(collection, primaryKeys, {
          fields: fields
        })
        .then(res => res.data)
        .then(data => {
          if (Array.isArray(data)) return data;
          return [data];
        })
        .then(items => {
          // Augment the values in this.value with the extra data from the API
          items = items.map(item => {
            const primaryKey = item[this.relatedKey];
            const currentValue = _.find(this.value || [], { [this.relatedKey]: primaryKey });
            return _.merge(item, currentValue);
          });

          items = [...items, ...newItems];
          this.itemsRaw = items;
        })
        .catch(error => (this.error = error))
        .finally(() => (this.loading = false));
    }
  }
};
</script>

<style lang="scss" scoped>
.table {
  background-color: var(--white);
  border: var(--input-border-width) solid var(--lighter-gray);
  border-radius: var(--border-radius);
  border-spacing: 0;
  width: 100%;
  margin: 16px 0 24px;

  .header {
    height: var(--input-height);
    border-bottom: 2px solid var(--lightest-gray);

    button {
      text-align: left;
      font-weight: 500;
      transition: color var(--fast) var(--transition);

      &:hover {
        transition: none;
        color: var(--darker-gray);
      }
    }

    i {
      vertical-align: top;
      color: var(--light-gray);
    }
  }

  .row {
    display: flex;
    align-items: center;
    padding: 0 5px;

    > div {
      padding: 3px 5px;
      flex-basis: 200px;
    }
  }

  .header .row {
    align-items: center;
    height: 40px;

    & > button {
      padding: 3px 5px 2px;
      flex-basis: 200px;
    }
  }

  .body {
    max-height: 275px;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

    .row {
      cursor: pointer;
      position: relative;
      height: 50px;
      border-bottom: 2px solid var(--off-white);

      &:hover {
        background-color: var(--highlight);
      }

      & div:last-of-type {
        flex-grow: 1;
      }

      button {
        color: var(--lighter-gray);
        transition: color var(--fast) var(--transition);

        &:hover {
          transition: none;
          color: var(--danger);
        }
      }
    }
  }
}

.buttons {
  margin-top: 24px;
}

.buttons > * {
  display: inline-block;
}

.buttons > *:first-child {
  margin-right: 24px;
}

.edit-modal-body {
  padding: 30px 30px 60px 30px;
  background-color: var(--body-background);
  .form {
    grid-template-columns:
      [start] minmax(0, var(--column-width)) [half] minmax(0, var(--column-width))
      [full];
  }
}

.search {
  position: sticky;
  left: 0;
  top: 0;
  &-input {
    border-bottom: 2px solid var(--lightest-gray);
    padding: 12px;

    & >>> input {
      border-radius: 0;
      border: none;
      padding-left: var(--page-padding);
      height: var(--header-height);

      &::placeholder {
        color: var(--light-gray);
      }
    }
  }
}

.items {
  height: calc(100% - var(--header-height) - 1px);
}

.table .sort-column {
  flex-basis: 36px !important;
}

.sort-column.disabled i {
  color: var(--lightest-gray);
  cursor: not-allowed;
}

.drag-handle {
  cursor: grab;
}

.dragging {
  cursor: grabbing !important;
}

// The alignment of the header sort toggle button is slightly off compared to the drag handles due
// to the smaller overal icon size
</style>

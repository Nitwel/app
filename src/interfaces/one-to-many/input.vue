<template>
  <div class="interface-one-to-many">
    <v-notice v-if="relationSetup === false" color="warning" icon="warning">
      {{ $t("interfaces-one-to-many-relation_not_setup") }}
    </v-notice>

    <template v-else>
      <div v-if="items.length" class="table">
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
          v-model="items"
          class="body"
          handle=".drag-handle"
          ghost-class="o2m-drag-ghost"
          :disabled="!sortable || !manualSortActive"
          :class="{ dragging }"
          @start="dragging = true"
          @end="dragging = false"
        >
          <div
            v-for="item in itemsWithoutDeleted"
            :key="item[relatedKey]"
            class="row"
            @click="editExisting = item"
          >
            <div v-if="sortable" class="sort-column" :class="{ disabled: !manualSortActive }">
              <v-icon name="drag_handle" class="drag-handle" />
            </div>
            <div v-for="column in columns" :key="column.field">
              <v-ext-display
                :interface-type="(column.fieldInfo || {}).interface || null"
                :name="column.field"
                :type="column.fieldInfo.type"
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

      <div class="buttons">
        <v-button type="button" :disabled="readonly" icon="add" @click="addNew = true">
          {{ $t("add_new") }}
        </v-button>

        <v-button
          type="button"
          :disabled="readonly"
          icon="playlist_add"
          @click="selectExisting = true"
        >
          {{ $t("select_existing") }}
        </v-button>
      </div>
    </template>

    <portal v-if="selectExisting" to="modal">
      <v-modal
        :title="$t('select_existing')"
        :buttons="{
          save: {
            text: 'Save',
            color: 'accent',
            loading: selectionSaving
          }
        }"
        action-required
        @close="dismissSelection"
        @save="saveSelection"
      >
        <div class="search">
          <v-input
            type="search"
            :placeholder="$t('search')"
            class="search-input"
            @input="onSearchInput"
          />
        </div>
        <v-items
          class="items"
          :collection="relatedCollection"
          :filters="filters"
          :view-query="viewQuery"
          :view-type="viewType"
          :view-options="viewOptions"
          :selection="selection"
          @options="setViewOptions"
          @query="setViewQuery"
          @select="selection = $event"
        ></v-items>
      </v-modal>
    </portal>

    <portal v-if="editExisting" to="modal">
      <v-modal
        :title="$t('editing_item')"
        :buttons="{
          save: {
            text: 'Save',
            color: 'accent',
            loading: selectionSaving
          }
        }"
        @close="editExisting = false"
        @save="saveEdits"
      >
        <div class="edit-modal-body">
          <v-form
            :fields="relatedCollectionFields"
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
            color: 'accent',
            loading: selectionSaving
          }
        }"
        @close="addNew = null"
        @save="addNewItem"
      >
        <div class="edit-modal-body">
          <v-form
            new-item
            :fields="relatedCollectionFields"
            :values="relatedDefaultsWithEdits"
            @stage-value="stageValue"
          ></v-form>
        </div>
      </v-modal>
    </portal>
  </div>
</template>

<script>
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
      selectionSaving: false,
      selection: [],

      editExisting: null,
      addNew: null,
      edits: {},

      viewOptionsOverride: {},
      viewTypeOverride: null,
      viewQueryOverride: {},
      filtersOverride: [],

      dragging: false
    };
  },
  computed: {
    relatedSortField() {
      return _.find(this.relatedCollectionFields, { type: "sort" });
    },
    sortable() {
      return !!this.relatedSortField;
    },
    manualSortActive() {
      return this.sort.field === this.relatedSortField.field;
    },
    relationSetup() {
      if (!this.relation) return false;
      return true;
    },
    currentCollection() {
      return this.relation.collection_one.collection;
    },
    relatedCollection() {
      return this.relation.collection_many.collection;
    },
    relatedCollectionFields() {
      return this.relation.collection_many.fields;
    },
    relatedKey() {
      return _.find(this.relation.collection_many.fields, {
        primary_key: true
      }).field;
    },
    relatedField() {
      return this.relation.field_many.field;
    },

    visibleFields() {
      if (this.relationSetup === false) return [];
      if (!this.options.fields) return [];

      if (Array.isArray(this.options.fields)) {
        return this.options.fields.map(val => val.trim());
      }

      return this.options.fields.split(",").map(val => val.trim());
    },
    columns() {
      if (this.relationSetup === false) return null;
      return this.visibleFields.map(field => ({
        field,
        name: this.$helpers.formatTitle(field),
        fieldInfo: this.relatedCollectionFields[field]
      }));
    },
    relatedDefaultValues() {
      if (this.relationSetup === false) return null;
      if (!this.relatedCollectionFields) return null;

      return _.mapValues(this.relatedCollectionFields, field => field.default_value);
    },
    relatedDefaultsWithEdits() {
      if (this.relationSetup === false) return null;
      if (!this.relatedDefaultValues) return null;

      return {
        ...this.relatedDefaultValues,
        ...this.edits
      };
    },

    filters() {
      if (this.relationSetup === false) return null;
      return [
        ...((this.options.preferences && this.options.preferences.filters) || []),
        ...this.filtersOverride
      ];
    },
    viewOptions() {
      if (this.relationSetup === false) return null;
      const viewOptions = (this.options.preferences && this.options.preferences.viewOptions) || {};
      return {
        ...viewOptions,
        ...this.viewOptionsOverride
      };
    },
    viewType() {
      if (this.relationSetup === false) return null;
      if (this.viewTypeOverride) return this.viewTypeOverride;
      return (this.options.preferences && this.options.preferences.viewType) || "tabular";
    },
    viewQuery() {
      if (this.relationSetup === false) return null;
      const viewQuery = (this.options.preferences && this.options.preferences.viewQuery) || {};
      return {
        ...viewQuery,
        ...this.viewQueryOverride
      };
    },

    items: {
      get() {
        if (this.relationSetup === false) return [];

        return _.orderBy(
          this.value || [],
          item => item[this.sort.field],
          this.sort.asc ? "asc" : "desc"
        );
      },
      // The setter is used when <draggable> updates the sort order during manual sorting
      set(newValue) {
        let value = _.clone(newValue);

        value = value.map((item, index) => {
          const clone = _.clone(item);

          if (typeof clone === "object" && clone.hasOwnProperty(this.relatedField)) {
            delete clone[this.relatedField];
          }

          clone[this.relatedSortField.field] = index + 1;

          return clone;
        });

        this.$emit("input", value);
      }
    },

    itemsWithoutDeleted() {
      return this.items.filter(item => item.$delete !== true);
    }
  },
  watch: {
    value() {
      this.setSelection();
    },
    relation() {
      if (this.relationSetup) {
        this.sort.field = this.visibleFields && this.visibleFields[0];
        this.setSelection();
      }
    }
  },
  created() {
    if (this.relationSetup) {
      if (this.sortable) {
        this.sort.field = this.relatedSortField.field;
      } else {
        this.sort.field = this.visibleFields && this.visibleFields[0];
      }
      this.setSelection();
    }

    this.onSearchInput = _.debounce(this.onSearchInput, 200);
  },
  methods: {
    setViewOptions(updates) {
      this.viewOptionsOverride = {
        ...this.viewOptionsOverride,
        ...updates
      };
    },
    setViewQuery(updates) {
      this.viewQueryOverride = {
        ...this.viewQueryOverride,
        ...updates
      };
    },
    setSelection() {
      if (!this.value) return;
      this.selection = this.value.filter(val => !val.$delete);
    },
    changeSort(field) {
      if (this.sort.field === field) {
        this.sort.asc = !this.sort.asc;
        return;
      }

      this.sort.asc = true;
      this.sort.field = field;
      return;
    },
    saveSelection() {
      this.selectionSaving = true;

      const savedRelatedPKs = (this.value || [])
        .filter(val => !val.$delete)
        .map(val => val[this.relatedKey]);

      const selectedPKs = this.selection.map(item => item[this.relatedKey]);

      // Set $delete: true to all items that aren't selected anymore
      let newValue = (this.value || []).map(item => {
        const relatedPK = item[this.relatedKey];

        if (!relatedPK) return item;

        // If item was saved before, add $delete flag
        if (selectedPKs.includes(relatedPK) === false) {
          return {
            [this.relatedKey]: item[this.relatedKey],
            $delete: true
          };
        }

        // If $delete flag is set and the item is re-selected, remove $delete flag
        if (item.$delete && selectedPKs.includes(relatedPK)) {
          const clone = { ...item };
          delete clone.$delete;
          return clone;
        }

        return item;
      });

      selectedPKs.forEach((selectedPK, i) => {
        if (savedRelatedPKs.includes(selectedPK) === false) {
          const item = { ...this.selection[i] };
          delete item[this.relation.field_many.field];
          newValue.push(item);
        }
      });

      // Filter out copies of the current relational parent item
      newValue = newValue.map(item => {
        if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
          delete item[this.relatedField];
        }

        return item;
      });

      this.$emit("input", newValue);

      this.selectExisting = false;
      this.selectionSaving = false;
    },
    dismissSelection() {
      this.setSelection();
      this.selectExisting = false;
    },
    stageValue({ field, value }) {
      this.$set(this.edits, field, value);
    },
    saveEdits() {
      this.$emit("input", [
        ...(this.value || [])
          .map(val => {
            if (val.id === this.editExisting[this.relatedKey]) {
              return {
                ...val,
                ...this.edits
              };
            }

            return val;
          })
          // Filter out copies of the current relational parent item
          .map(item => {
            if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
              delete item[this.relatedField];
            }

            return item;
          })
      ]);

      this.edits = {};
      this.editExisting = false;
    },
    addNewItem() {
      this.$emit("input", [
        ...(this.value || []).map(item => {
          if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
            delete item[this.relatedField];
          }

          return item;
        }),
        this.edits
      ]);

      this.edits = {};
      this.addNew = false;
    },
    removeRelated(relatedKey) {
      if (relatedKey) {
        this.$emit(
          "input",
          (this.value || [])
            .map(val => {
              if (val[this.relatedKey] === relatedKey) {
                return {
                  [this.relatedKey]: val[this.relatedKey],
                  $delete: true
                };
              }

              return val;
            })
            .map(item => {
              if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
                delete item[this.relatedField];
              }

              return item;
            })
        );
      } else {
        this.$emit(
          "input",
          (this.value || [])
            .filter(val => {
              return val[this.relatedKey] !== relatedKey;
            })
            .map(item => {
              if (typeof item === "object" && item.hasOwnProperty(this.relatedField)) {
                delete item[this.relatedField];
              }

              return item;
            })
        );
      }
    },
    onSearchInput(value) {
      this.setViewQuery({
        q: value
      });
    },
    toggleManualSort() {
      this.sort.field = this.relatedSortField.field;
      this.sort.asc = true;
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
    border-bottom: 1px solid var(--lighter-gray);

    button {
      text-align: left;
      color: var(--gray);
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      transition: color var(--fast) var(--transition);

      &:hover {
        transition: none;
        color: var(--darker-gray);
      }
    }

    i {
      vertical-align: top;
      color: var(--light-gray);
      margin-top: -2px;
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
      border-bottom: 1px solid var(--lightest-gray);

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

.buttons > * {
  display: inline-block;
}

.buttons > *:first-child {
  margin-right: 24px;
}

.edit-modal-body {
  padding: 20px;
  background-color: var(--body-background);
}

.search {
  position: sticky;
  left: 0;
  top: 0;
  &-input {
    border-bottom: 1px solid var(--lightest-gray);
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

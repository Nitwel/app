<template>
  <not-found v-if="!collectionInfo" />
  <div class="settings-fields" v-else>
    <v-header :breadcrumb="breadcrumb" :icon-link="`/settings/collections`" icon-color="warning">
      <template slot="buttons">
        <v-header-button
          icon="delete_outline"
          key="delete"
          color="gray"
          hover-color="danger"
          :label="$t('delete')"
          @click="confirmRemove = true"
        />
        <v-header-button
          icon="check"
          key="save"
          color="action"
          :loading="saving"
          :disabled="Object.keys(edits).length === 0"
          :label="$t('save')"
          @click="save"
        />
      </template>
    </v-header>

    <label class="label">{{ $t("fields") }}</label>
    <v-notice color="warning">{{ $t("fields_are_saved_instantly") }}</v-notice>
    <div class="table">
      <div class="header">
        <div class="row">
          <div class="drag"><v-icon name="swap_vert" /></div>
          <div>{{ $t("field") }}</div>
          <div>{{ $t("interface") }}</div>
        </div>
      </div>
      <div class="body" :class="{ dragging }">
        <draggable v-model="fields" @start="startSort" @end="saveSort">
          <div class="row" v-for="field in fields" :key="field.field">
            <div class="drag"><v-icon name="drag_handle" /></div>
            <div class="inner row" @click.stop="startEditingField(field)">
              <div>
                {{ $helpers.formatTitle(field.field) }}
                <span class="optional" v-if="field.required === false && !field.primary_key">
                  — {{ $t("optional") }}
                </span>
              </div>
              <div>
                {{
                  ($store.state.extensions.interfaces[field.interface] &&
                    $store.state.extensions.interfaces[field.interface].name) ||
                    "--"
                }}
              </div>
            </div>
            <v-popover
              class="more-options"
              placement="left-start"
              v-if="canDuplicate(field.interface) || fields.length > 1"
            >
              <button type="button" class="menu-toggle">
                <v-icon name="more_vert" />
              </button>
              <template slot="popover">
                <ul class="ctx-menu">
                  <li>
                    <button
                      v-close-popover
                      type="button"
                      @click.stop="duplicateField(field)"
                      :disabled="!canDuplicate(field.interface)"
                    >
                      <v-icon name="control_point_duplicate" />
                      {{ $t("duplicate") }}
                    </button>
                  </li>
                  <li>
                    <button
                      v-close-popover
                      :disabled="fields.length === 1"
                      type="button"
                      @click.stop="warnRemoveField(field.field)"
                    >
                      <v-icon name="close" />
                      {{ $t("delete") }}
                    </button>
                  </li>
                </ul>
              </template>
            </v-popover>
          </div>
        </draggable>
      </div>
    </div>

    <v-button @click="startEditingField({})" class="new-field">
      {{ $t("new_field") }}
    </v-button>

    <v-form
      v-if="fields"
      :fields="directusFields"
      :values="values"
      collection="directus_collections"
      @stage-value="stageValue"
    />

    <portal to="modal" v-if="confirmRemove">
      <v-confirm
        color="danger"
        :message="$t('delete_collection_are_you_sure')"
        :confirm-text="$t('delete')"
        @cancel="confirmRemove = false"
        @confirm="remove"
      />
    </portal>

    <portal to="modal" v-if="confirmFieldRemove">
      <v-confirm
        color="danger"
        :message="$t('delete_field_are_you_sure', { field: fieldToBeRemoved })"
        :confirm-text="$t('delete')"
        @cancel="confirmFieldRemove = false"
        @confirm="removeField(fieldToBeRemoved)"
      />
    </portal>

    <v-field-setup
      v-if="editingField"
      :field-info="fieldBeingEdited"
      :collection-info="collectionInfo"
      :saving="fieldSaving"
      @close="editingField = false"
      @save="setFieldSettings"
    />

    <v-field-duplicate
      v-if="duplicatingField"
      :field-information="fieldBeingDuplicated"
      :collection-information="collectionInfo"
      @close="duplicatingField = false"
      @save="duplicateFieldSettings"
    />
  </div>
</template>

<script>
import { keyBy } from "lodash";
import formatTitle from "@directus/format-title";
import shortid from "shortid";
import store from "../../store/";
import api from "../../api.js";
import NotFound from "../not-found.vue";
import VFieldSetup from "../../components/field-setup.vue";
import VFieldDuplicate from "../../components/field-duplicate.vue";

export default {
  name: "settings-fields",
  metaInfo() {
    return {
      title: `${this.$t("settings")} | ${this.$t("editing", {
        collection: this.$helpers.formatTitle(this.collection)
      })}`
    };
  },
  components: {
    NotFound,
    VFieldSetup,
    VFieldDuplicate
  },
  props: {
    collection: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      duplicateInterfaceBlacklist: [
        "primary-key",
        "many-to-many",
        "one-to-many",
        "many-to-one",
        "sort"
      ],
      fieldSaving: false,
      saving: false,
      dragging: false,

      fields: null,
      directusFields: null,

      notFound: false,
      error: false,

      confirmRemove: false,
      confirmRemoveLoading: false,

      confirmNavigation: false,
      leavingTo: "",

      edits: {},

      fieldBeingEdited: null,
      fieldToBeRemoved: null,
      confirmFieldRemove: false,

      fieldBeingDuplicated: null,
      duplicatingField: false,

      editingField: false
    };
  },
  computed: {
    breadcrumb() {
      return [
        {
          name: this.$t("settings"),
          path: "/settings"
        },
        {
          name: this.$t("collections_and_fields"),
          path: "/settings/collections"
        },
        {
          name: this.$t(`collections-${this.collection}`),
          path: `/settings/collections/${this.collection}`
        }
      ];
    },
    collectionInfo() {
      return this.$store.state.collections[this.collection];
    },
    fieldsWithSort() {
      return this.fields.map((field, index) => ({
        ...field,
        sort: index + 1
      }));
    },
    values() {
      return {
        ...this.collectionInfo,
        ...this.edits
      };
    }
  },
  methods: {
    remove() {
      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      this.$api
        .deleteCollection(this.collection)
        .then(() => {
          this.$store.dispatch("loadingFinished", id);
          this.$store.dispatch("removeCollection", this.collection);
          this.$notify({
            title: this.$t("collection_removed", {
              collection: this.$helpers.formatTitle(this.collection)
            }),
            color: "green",
            iconMain: "check"
          });
          this.$router.push("/settings/collections");
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    save() {
      this.saving = true;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      this.$api
        .updateCollection(this.collection, this.edits)
        .then(() => {
          this.$notify({
            title: this.$t("collection_updated", {
              collection: this.$helpers.formatTitle(this.collection)
            }),
            color: "green",
            iconMain: "check"
          });
          this.$store.dispatch("loadingFinished", id);
          this.saving = false;
          this.$store.dispatch("updateCollection", {
            collection: this.collection,
            edits: this.edits
          });
          this.$router.push("/settings/collections");
        })
        .catch(error => {
          this.saving = false;
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    stageValue({ field, value }) {
      if (value === this.collectionInfo[field]) {
        this.$delete(this.edits, field);
        return;
      }

      this.$set(this.edits, field, value);
    },
    canDuplicate(fieldInterface) {
      return this.duplicateInterfaceBlacklist.includes(fieldInterface) === false;
    },
    duplicateFieldSettings({ fieldInfo, collection }) {
      const requests = [];

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      fieldInfo.collection = collection;
      requests.push(this.$api.createField(collection, fieldInfo));

      return Promise.all(requests)
        .then(([fieldRes]) => ({
          savedFieldInfo: fieldRes.data
        }))
        .then(({ savedFieldInfo }) => {
          this.$store.dispatch("loadingFinished", id);

          if (this.collection === collection) {
            this.fields = [...this.fields, savedFieldInfo];
          }
          this.$store.dispatch("addField", {
            collection: collection,
            field: savedFieldInfo
          });
          this.$notify({
            title: this.$t("field_created", {
              field: this.$helpers.formatTitle(fieldInfo.field)
            }),
            color: "green",
            iconMain: "check"
          });
        })
        .then(() => {
          this.duplicatingField = false;
          this.fieldBeingDuplicated = null;
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    setFieldSettings({ fieldInfo, relation }) {
      this.fieldSaving = true;

      const existingField = this.$store.state.collections[this.collection].fields.hasOwnProperty(
        fieldInfo.field
      );

      const requests = [];

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      if (existingField) {
        requests.push(this.$api.updateField(this.collection, fieldInfo.field, fieldInfo));
      } else {
        delete fieldInfo.id;
        fieldInfo.collection = this.collection;
        requests.push(this.$api.createField(this.collection, fieldInfo));
      }

      if (relation) {
        const saveRelation = relation => {
          const existingRelation = relation && relation.id != null;
          if (existingRelation) {
            requests.push(this.$api.updateRelation(relation.id, relation));
          } else {
            delete relation.id;
            requests.push(this.$api.createRelation(relation));
          }
        };

        if (Array.isArray(relation)) {
          relation.forEach(saveRelation);
        } else {
          saveRelation(relation);
        }
      }

      return Promise.all(requests)
        .then(([fieldRes, relationRes]) => ({
          savedFieldInfo: fieldRes.data,
          savedRelationInfo: relationRes && relationRes.data
        }))
        .then(({ savedFieldInfo, savedRelationInfo }) => {
          this.$store.dispatch("loadingFinished", id);

          if (existingField) {
            this.fields = this.fields.map(field => {
              if (field.id === savedFieldInfo.id) return savedFieldInfo;
              return field;
            });

            this.$notify({
              title: this.$t("field_updated", {
                field: this.$helpers.formatTitle(fieldInfo.field)
              }),
              color: "green",
              iconMain: "check"
            });

            this.$store.dispatch("getCollections");
          } else {
            this.fields = [...this.fields, savedFieldInfo];

            this.$notify({
              title: this.$t("field_created", {
                field: this.$helpers.formatTitle(fieldInfo.field)
              }),
              color: "green",
              iconMain: "check"
            });

            this.$store.dispatch("getCollections");
          }

          if (relation) {
            const saveRelation = relation => {
              const existingRelation = relation && relation.id != null;
              if (existingRelation) {
                this.$store.dispatch("updateRelation", savedRelationInfo);
              } else {
                this.$store.dispatch("addRelation", savedRelationInfo);
              }
            };

            if (Array.isArray(relation)) {
              relation.forEach(saveRelation);
            } else {
              saveRelation(relation);
            }
          }
        })
        .then(() => {
          this.editingField = false;
          this.fieldBeingEdited = null;
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        })
        .finally(() => {
          this.fieldSaving = false;
        });
    },
    duplicateField(field) {
      this.fieldBeingDuplicated = field;
      this.duplicatingField = true;
    },
    startEditingField(field) {
      this.fieldBeingEdited = field;
      this.editingField = true;
    },
    warnRemoveField(fieldName) {
      this.fieldToBeRemoved = fieldName;
      this.confirmFieldRemove = true;
    },
    removeField(fieldName) {
      this.removingField = true;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      this.$api
        .deleteField(this.collection, fieldName)
        .then(() => {
          this.$store.dispatch("loadingFinished", id);
          this.fields = this.fields.filter(({ field }) => field !== fieldName);
          this.removingField = false;
          this.fieldToBeRemoved = null;
          this.confirmFieldRemove = false;
          this.$notify({
            title: this.$t("field_removed", {
              field: this.$helpers.formatTitle(fieldName)
            }),
            color: "green",
            iconMain: "check"
          });
          this.$store.dispatch("removeField", {
            collection: this.collection,
            field: fieldName
          });
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    startSort() {
      this.dragging = true;
    },
    saveSort() {
      this.dragging = false;
      const fieldUpdates = this.fieldsWithSort.map(field => ({
        field: field.field,
        sort: field.sort
      }));

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      this.$api
        .patch(`/fields/${this.collection}`, fieldUpdates, {
          activity_skip: 1
        })
        .then(res => res.data)
        .then(fields => {
          this.$store.dispatch("loadingFinished", id);
          this.$store.dispatch("updateFields", {
            collection: this.collection,
            updates: fieldUpdates
          });
          this.fields = fields;
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    }
  },
  beforeRouteEnter(to, from, next) {
    const { collection } = to.params;

    const id = shortid.generate();
    store.dispatch("loadingStart", { id });

    return Promise.all([
      api.getFields("directus_collections"),
      api.getFields(collection, {
        sort: "sort"
      })
    ])
      .then(([directusRes, fieldsRes]) => ({
        directusFields: directusRes.data,
        fields: fieldsRes.data
      }))
      .then(({ directusFields, fields }) => {
        store.dispatch("loadingFinished", id);
        next(vm => {
          vm.$data.directusFields = keyBy(
            directusFields.map(field => ({
              ...field,
              name: formatTitle(field.field),
              note: field.note
            })),
            "field"
          );
          delete vm.$data.directusFields.note.note;
          vm.$data.directusFields.note.options = {
            placeholder: vm.$t("note_note")
          };

          vm.$data.fields = fields
            .map(field => ({
              ...field,
              name: formatTitle(field.field)
            }))
            .sort((a, b) => {
              if (a.sort == b.sort) return 0;
              if (a.sort === null) return 1;
              if (b.sort === null) return -1;
              return a.sort > b.sort ? 1 : -1;
            });
        });
      })
      .catch(error => {
        store.dispatch("loadingFinished", id);
        next(vm => {
          vm.$data.error = error;
        });
      });
  }
};
</script>

<style lang="scss" scoped>
.settings-fields {
  padding: var(--page-padding);
}

h2 {
  margin-bottom: 20px;

  &:not(:first-of-type) {
    margin-top: 60px;
  }
}

.table {
  background-color: var(--white);
  border: var(--input-border-width) solid var(--lighter-gray);
  border-radius: var(--border-radius);
  border-spacing: 0;
  width: 100%;
  max-width: 632px;
  margin: 10px 0 20px;

  .header {
    border-bottom: 2px solid var(--lightest-gray);
    height: 60px;
    .row {
      height: 60px;
    }
  }

  .row {
    display: flex;
    align-items: center;

    > div {
      padding: 5px 5px;

      &:not(.drag):not(.more-options) {
        flex-basis: 200px;
      }
    }
  }

  .inner.row {
    flex-grow: 1;

    > div {
      padding: 0;
    }
  }

  .sortable-drag {
    opacity: 0;
  }

  .dragging .sortable-chosen,
  .sortable-chosen:active {
    background-color: var(--highlight) !important;
    color: var(--darkest-gray);

    .manual-sort {
      color: var(--darkest-gray);
    }
  }

  .body {
    &.dragging .row:hover {
      background-color: var(--white);
    }

    .row {
      cursor: pointer;
      position: relative;
      height: 48px;
      border-bottom: 2px solid var(--off-white);

      &:last-of-type {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--highlight);
      }
    }

    .drag {
      user-select: none;
      cursor: -webkit-grab;
      color: var(--lighter-gray);

      &:hover {
        color: var(--dark-gray);
      }
    }
  }
}

.new-field {
  margin-bottom: 40px;
}

.more-options {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);

  i {
    color: var(--lighter-gray);
    transition: color var(--fast) var(--transition);
  }

  &:hover {
    i {
      transition: none;
      color: var(--gray);
    }
  }
}

em.note {
  color: var(--lighter-gray);
  margin-top: 4px;
  margin-bottom: 40px;
  display: block;
}

label.label {
  margin-bottom: 10px;
  text-transform: none;
  color: var(--darker-gray);
  font-size: 1.2rem;
  line-height: 1.1;
  font-weight: 400;
}

.ctx-menu {
  list-style: none;
  padding: 0;
  width: 136px;

  li {
    display: block;
  }

  i {
    color: var(--light-gray);
    margin-right: 5px;
    transition: color var(--fast) var(--transition);
  }

  button {
    display: flex;
    align-items: center;
    padding: 5px;
    color: var(--gray);
    width: 100%;
    height: 100%;
    transition: color var(--fast) var(--transition);
    &:disabled,
    &[disabled] {
      color: var(--lighter-gray);
      i {
        color: var(--lighter-gray);
      }
    }
    &:not(:disabled):not(&[disabled]):hover {
      color: var(--darkest-gray);
      transition: none;
      i {
        color: var(--darkest-gray);
        transition: none;
      }
    }
  }
}

.optional {
  color: var(--lighter-gray);
}
</style>

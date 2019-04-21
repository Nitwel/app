<template>
  <div class="collections">
    <v-header :breadcrumb="breadcrumb" icon-color="warning" icon-link="/settings">
      <template slot="buttons">
        <v-header-button
          icon="add"
          key="add"
          color="action"
          :label="$t('new')"
          @click="addNew = true"
        />
      </template>
    </v-header>
    <v-error
      v-if="items.length === 0"
      :title="$t('no_collections')"
      :body="$t('no_collections_body')"
      icon="error_outline"
    />

    <div class="table" v-else>
      <div class="header">
        <div class="row">
          <div class="cell style-4">{{ $t("collection") }}</div>
          <div class="cell note style-4">{{ $t("note") }}</div>
        </div>
      </div>
      <div class="body">
        <router-link
          v-for="collection in items"
          :key="collection.collection"
          class="row"
          :to="collection.__link__"
        >
          <div class="cell">{{ collection.name }}</div>
          <div class="cell note">{{ collection.note }}</div>
          <button
            v-if="collection.managed"
            class="managed"
            @click.prevent.stop="toggleManage(collection)"
          >
            {{ $t("dont_manage") }}
          </button>
          <button v-else class="not-managed" @click.prevent.stop="toggleManage(collection)">
            {{ $t("manage") }}
          </button>
        </router-link>
      </div>
    </div>

    <portal to="modal" v-if="addNew">
      <v-prompt
        v-model="newName"
        safe
        :confirm-text="$t('create')"
        :message="$t('create_collection')"
        :placeholder="$t('enter_collection_name')"
        :loading="adding"
        @cancel="addNew = false"
        @confirm="add"
      >
        <v-details title="Default fields" :open="true">
          <div class="advanced-form">
            <label class="toggle">
              <v-toggle v-model="status" />
              {{ $t("status") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="sort" />
              {{ $t("sort") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="createdBy" :value="true" />
              {{ $t("created_by") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="createdOn" :value="true" />
              {{ $t("created_on") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="modifiedBy" />
              {{ $t("modified_by") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="modifiedOn" />
              {{ $t("modified_on") }}
            </label>
          </div>
        </v-details>
      </v-prompt>
    </portal>

    <portal to="modal" v-if="dontManage">
      <v-confirm
        :message="$t('dont_manage_copy', { collection: dontManage.name })"
        color="danger"
        :confirm-text="$t('dont_manage')"
        @cancel="dontManage = null"
        @confirm="stopManaging"
      />
    </portal>
  </div>
</template>

<script>
export default {
  name: "settings-collections",
  metaInfo() {
    return {
      title: `${this.$t("settings")} | ${this.$t("settings_collections_fields")}`
    };
  },
  data() {
    return {
      addNew: false,
      newName: "",
      adding: false,
      status: true,
      sort: false,
      createdBy: true,
      createdOn: true,
      modifiedBy: false,
      modifiedOn: false,

      dontManage: null
    };
  },
  computed: {
    items() {
      const collections = this.$store.state.collections || {};

      return Object.values(collections)
        .filter(collection => collection.collection.startsWith("directus_") === false)
        .map(collection => ({
          ...collection,
          name: this.$t(`collections-${collection.collection}`),
          __link__: `/settings/collections/${collection.collection}`
        }));
    },
    breadcrumb() {
      return [
        {
          name: this.$t("settings"),
          path: "/settings"
        },
        {
          name: this.$t("collections_and_fields"),
          path: "/settings/collections"
        }
      ];
    }
  },
  methods: {
    add() {
      this.adding = true;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      let fieldsToAdd = [
        {
          type: "integer",
          datatype: "INT",
          length: 15,
          field: "id",
          interface: "primary-key",
          auto_increment: true,
          primary_key: true,
          hidden_detail: true,
          hidden_browse: true
        }
      ];
      let fieldsToDispatch = {
        id: {
          auto_increment: true,
          collection: this.newName,
          datatype: "INT",
          default_value: null,
          field: "id",
          group: null,
          hidden_detail: true,
          hidden_browse: true,
          interface: "primary-key",
          length: "10",
          locked: 0,
          note: "",
          options: null,
          primary_key: true,
          readonly: 0,
          required: true,
          signed: false,
          sort: 1,
          translation: null,
          type: "integer",
          unique: false,
          validation: null,
          width: 4
        }
      };

      if (this.status) {
        fieldsToAdd.push({
          type: "status",
          datatype: "VARCHAR",
          length: 20,
          field: "status",
          interface: "status",
          options: {
            status_mapping: {
              published: {
                name: "Published",
                text_color: "white",
                background_color: "accent",
                browse_subdued: false,
                browse_badge: true,
                soft_delete: false,
                published: true
              },
              draft: {
                name: "Draft",
                text_color: "white",
                background_color: "blue-grey-200",
                browse_subdued: true,
                browse_badge: true,
                soft_delete: false,
                published: false
              },
              deleted: {
                name: "Deleted",
                text_color: "white",
                background_color: "red",
                browse_subdued: true,
                browse_badge: true,
                soft_delete: true,
                published: false
              }
            }
          }
        });
        fieldsToDispatch.status = {
          collection: this.newName,
          field: "status",
          datatype: "VARCHAR",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: true,
          type: "status",
          sort: 0,
          interface: "status",
          hidden_detail: false,
          hidden_browse: false,
          required: false,
          options: {
            status_mapping: {
              published: {
                name: "Published",
                text_color: "white",
                background_color: "accent",
                browse_subdued: false,
                browse_badge: true,
                soft_delete: false,
                published: true
              },
              draft: {
                name: "Draft",
                text_color: "white",
                background_color: "blue-grey-200",
                browse_subdued: true,
                browse_badge: true,
                soft_delete: false,
                published: false
              },
              deleted: {
                name: "Deleted",
                text_color: "white",
                background_color: "red",
                browse_subdued: true,
                browse_badge: true,
                soft_delete: true,
                published: false
              }
            }
          },
          locked: false,
          translation: null,
          readonly: false,
          width: 4,
          validation: null,
          group: null,
          length: "20"
        };
      }
      if (this.sort) {
        fieldsToAdd.push({
          type: "sort",
          datatype: "INT",
          field: "sort",
          interface: "sort"
        });
        fieldsToDispatch.sort = {
          collection: this.newName,
          field: "sort",
          datatype: "INT",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: false,
          type: "sort",
          sort: 0,
          interface: "sort",
          hidden_detail: false,
          hidden_browse: false,
          required: false,
          options: null,
          locked: false,
          translation: null,
          readonly: false,
          width: 4,
          validation: null,
          group: null,
          length: "10"
        };
      }
      if (this.createdBy) {
        fieldsToAdd.push({
          type: "user_created",
          datatype: "INT",
          field: "created_by",
          interface: "user-created",
          options: {
            template: "{{first_name}} {{last_name}}",
            display: "both"
          },
          readonly: true,
          hidden_detail: true,
          hidden_browse: true
        });
        fieldsToDispatch.created_by = {
          collection: this.newName,
          field: "created_by",
          datatype: "INT",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: false,
          type: "user_created",
          sort: 0,
          interface: "user-created",
          hidden_detail: true,
          hidden_browse: true,
          required: false,
          options: {
            template: "{{first_name}} {{last_name}}",
            display: "both"
          },
          locked: false,
          translation: null,
          readonly: true,
          width: 4,
          validation: null,
          group: null,
          length: "10"
        };
      }
      if (this.createdOn) {
        fieldsToAdd.push({
          type: "datetime_created",
          datatype: "DATETIME",
          field: "created_on",
          interface: "datetime-created",
          readonly: true,
          hidden_detail: true,
          hidden_browse: true
        });
        fieldsToDispatch.created_on = {
          collection: this.newName,
          field: "created_on",
          datatype: "DATETIME",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: true,
          type: "datetime_created",
          sort: 0,
          interface: "datetime-created",
          hidden_detail: true,
          hidden_browse: true,
          required: false,
          options: null,
          locked: false,
          translation: null,
          readonly: true,
          width: 4,
          validation: null,
          group: null,
          length: null
        };
      }
      if (this.modifiedBy) {
        fieldsToAdd.push({
          type: "user_updated",
          datatype: "INT",
          field: "modified_by",
          interface: "user-updated",
          options: {
            template: "{{first_name}} {{last_name}}",
            display: "both"
          },
          readonly: true,
          hidden_detail: true,
          hidden_browse: true
        });
        fieldsToDispatch.modified_by = {
          collection: this.newName,
          field: "modified_by",
          datatype: "INT",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: false,
          type: "user_updated",
          sort: 0,
          interface: "user-updated",
          hidden_detail: true,
          hidden_browse: true,
          required: false,
          options: {
            template: "{{first_name}} {{last_name}}",
            display: "both"
          },
          locked: false,
          translation: null,
          readonly: true,
          width: 4,
          validation: null,
          group: null,
          length: "10"
        };
      }
      if (this.modifiedOn) {
        fieldsToAdd.push({
          type: "datetime_updated",
          datatype: "DATETIME",
          field: "modified_on",
          interface: "datetime-updated",
          readonly: true,
          hidden_detail: true,
          hidden_browse: true
        });
        fieldsToDispatch.modified_on = {
          collection: this.newName,
          field: "modified_on",
          datatype: "DATETIME",
          unique: false,
          primary_key: false,
          auto_increment: false,
          default_value: null,
          note: null,
          signed: true,
          type: "datetime_updated",
          sort: 0,
          interface: "datetime-updated",
          hidden_detail: true,
          hidden_browse: true,
          required: false,
          options: null,
          locked: false,
          translation: null,
          readonly: true,
          width: 4,
          validation: null,
          group: null,
          length: null
        };
      }

      this.$api
        .createCollection(
          {
            collection: this.newName,
            hidden: 0,
            fields: fieldsToAdd
          },
          {
            fields: "*.*"
          }
        )
        .then(res => res.data)
        .then(collection => {
          this.$store.dispatch("loadingFinished", id);
          this.$store.dispatch("addCollection", {
            ...collection,

            // This should ideally be returned from the API
            // https://github.com/directus/api/issues/207
            fields: fieldsToDispatch
          });
          this.$store.dispatch("getPermissions");
          this.$router.push(`/settings/collections/${this.newName}`);
        })
        .catch(error => {
          this.adding = false;
          this.$store.dispatch("loadingFinished", id);
          if (error) {
            // Use bit more descriptive error if possible
            const errors = {
              4: this.$t("collection_invalid_name")
            };
            this.$events.emit("error", {
              notify:
                error.code in errors ? errors[error.code] : this.$t("something_went_wrong_body"),
              error
            });
          }
        });
    },
    toggleManage(collection) {
      if (collection.managed) {
        this.dontManage = collection;
      } else {
        return this.$api
          .updateItem("directus_collections", collection.collection, {
            managed: true
          })
          .then(() => {
            return this.$store.dispatch("getCollections");
          })
          .then(() => {
            this.$notify({
              title: this.$t("manage_started", {
                collection: collection.collection
              }),
              color: "green",
              iconMain: "check"
            });
          })
          .catch(error => {
            this.$events.emit("error", {
              notify: this.$t("something_went_wrong_body"),
              error
            });
          });
      }
    },
    stopManaging() {
      return this.$api
        .updateItem("directus_collections", this.dontManage.collection, {
          managed: false
        })
        .then(() => {
          return this.$store.dispatch("getCollections");
        })
        .then(() => {
          this.$notify({
            title: this.$t("manage_stopped", {
              collection: this.dontManage.collection
            }),
            color: "green",
            iconMain: "check"
          });

          this.dontManage = null;
        })
        .catch(error => {
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.collections {
  padding: 0 32px var(--page-padding-bottom);
}

.table {
  background-color: var(--white);
  position: relative;

  .row {
    display: flex;
    align-items: center;
    border-bottom: 2px solid var(--off-white);
    box-sizing: content-box;
    height: 48px;
  }

  .cell {
    flex-shrink: 0;
    flex-basis: 200px;
    padding-right: 20px;
    position: relative;
    overflow: hidden;
    max-height: 100%;
    &.note {
      flex-grow: 1;
      padding-right: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .header {
    position: relative;
    top: 0;
    height: var(--header-height);

    .row {
      height: 100%;
      border-bottom: 2px solid var(--lightest-gray);
    }
  }

  a {
    text-decoration: none;

    &:hover {
      background-color: var(--highlight);
    }
  }

  button {
    border-radius: var(--border-radius);
    padding: 5px 10px;
    position: absolute;
    right: 0;

    &.managed {
      background-color: var(--lightest-gray);
      color: var(--light-gray);

      &:hover {
        background-color: var(--danger);
        color: var(--white);
      }
    }

    &.not-managed {
      background-color: var(--darker-gray);
      color: var(--white);

      &:hover {
        background-color: var(--darkest-gray);
        color: var(--white);
      }
    }
  }
}

.v-details {
  margin-top: 30px;
  margin-bottom: 0;

  .advanced-form {
    display: grid;
    grid-gap: 30px 20px;
    grid-template-columns: 1fr 1fr;

    .toggle {
      display: flex;
      align-items: center;
      text-transform: capitalize;
      font-size: 1rem;
      cursor: pointer;
      width: max-content;

      &:not(.disabled):hover {
        color: var(--darkest-gray);
      }

      > *:first-child {
        margin-right: 10px;
      }

      &.disabled {
        color: var(--light-gray);
      }
    }
  }
}
</style>

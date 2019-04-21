<template>
  <v-not-found v-if="notFound" />

  <div v-else-if="error">
    <v-header />
    <v-error
      v-if="error"
      icon="error_outline"
      color="warning"
      :title="$t('server_trouble')"
      :body="$t('server_trouble_copy')"
    />
  </div>

  <div v-else-if="fields === null">
    <v-header :icon-link="`/collections`" />
    <v-loader area="content" />
  </div>

  <div v-else class="edit" :key="`${collection}-${primaryKey}`">
    <v-header
      :breadcrumb="breadcrumb"
      :info-toggle="!newItem && !batch && !activityDetail"
      :icon-link="singleItem ? null : `/collections/${collection}`"
      :icon="singleItem ? collectionInfo.icon : 'arrow_back'"
      item-detail
    >
      <template v-if="status" slot="title">
        <span
          class="status-indicator"
          v-tooltip="statusName"
          :style="{ backgroundColor: `var(--${statusColor})` }"
        />
      </template>
      <template slot="buttons">
        <v-header-button
          v-if="!newItem && !singleItem && permission.delete !== 'none'"
          icon="delete_outline"
          color="gray"
          hover-color="danger"
          :label="$t('delete')"
          @click="confirmRemove = true"
        />

        <v-header-button
          v-if="batch && permission.update !== 'none'"
          :disabled="!editing"
          :loading="saving"
          :label="$t('save')"
          icon="check"
          color="action"
          hover-color="success"
          @click="confirmBatchSave = true"
        />

        <v-header-button
          v-else-if="isNew ? permission.create !== 'none' : permission.update !== 'none'"
          :disabled="!editing"
          :loading="saving"
          :label="$t('save')"
          :options="
            !editing
              ? {
                  copy: $t('save_as_copy')
                }
              : {
                  stay: $t('save_and_stay'),
                  add: $t('save_and_add'),
                  copy: $t('save_as_copy')
                }
          "
          icon="check"
          color="action"
          hover-color="success"
          @click="singleItem ? save('stay') : save('leave')"
          @input="save"
        />
      </template>
    </v-header>

    <v-info-sidebar v-if="!newItem && !batch" wide item-detail>
      <v-activity
        :activity="activity"
        :revisions="revisions"
        :loading="activityLoading"
        :comment-permission="permission.comment"
        @input="postComment"
        @revert="revertActivity = $event"
      />
    </v-info-sidebar>

    <v-form
      :readonly="readonly"
      :fields="fields"
      :values="values"
      :collection="collection"
      :batch-mode="batch"
      :permissions="permission"
      :new-item="newItem"
      ref="form"
      @unstage-value="unstageValue"
      @stage-value="stageValue"
    />

    <portal to="modal" v-if="confirmRemove">
      <v-confirm
        :message="
          batch
            ? $tc('batch_delete_confirm', primaryKey.split(',').length, {
                count: primaryKey.split(',').length
              })
            : $t('delete_are_you_sure')
        "
        :busy="confirmRemoveLoading"
        @cancel="confirmRemove = false"
        @confirm="remove"
      />
    </portal>

    <portal to="modal" v-if="confirmNavigation">
      <v-confirm
        :message="$t('unsaved_changes_copy')"
        :confirm-text="$t('keep_editing')"
        :cancel-text="$t('discard_changes')"
        @confirm="confirmNavigation = false"
        @cancel="
          $router.push(leavingTo);
          confirmNavigation = false;
        "
      />
    </portal>

    <portal to="modal" v-if="confirmBatchSave">
      <v-confirm
        :message="$t('update_confirm', { count: primaryKey.split(',').length })"
        :confirm-text="$t('update')"
        @confirm="save('leave')"
        @cancel="confirmBatchSave = false"
      />
    </portal>

    <portal to="modal" v-if="revertActivity">
      <v-modal
        :title="$t('preview_and_revert')"
        :buttons="{
          revert: {
            text: $t('revert'),
            loading: reverting
          }
        }"
        @revert="revertItem(revertActivity.revision.id)"
        @close="revertActivity = false"
      >
        <div class="revert">
          <p class="notice">
            {{ $t("revert_copy", { date: $d(revertActivity.date, "long") }) }}
          </p>
          <v-form readonly :values="revertActivity.revision.data" :fields="fields" />
        </div>
      </v-modal>
    </portal>
  </div>
</template>

<script>
import { mapValues } from "lodash";
import shortid from "shortid";
import EventBus from "../events/";
import { i18n } from "../lang/";
import VLoader from "../components/loader.vue";
import VError from "../components/error.vue";
import VActivity from "../components/activity/activity.vue";
import formatTitle from "@directus/format-title";
import VNotFound from "./not-found.vue";
import store from "../store/";
import api from "../api";

function getFieldsQuery(collection) {
  const fields = store.state.collections[collection].fields;

  return Object.values(fields)
    .map(field => field.field)
    .map(field => {
      const fieldInfo = fields[field];

      if (
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "o2m" &&
        store.getters.o2m(collection, field).junction != null
      ) {
        return field.endsWith(".*.*.*") ? field : field + ".*.*.*";
      }

      if (
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "m2o" ||
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "o2m" ||
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "m2m" ||
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "translation" ||
        (fieldInfo.type && fieldInfo.type.toLowerCase()) === "file"
      ) {
        return field.endsWith(".*.*.*") ? field : field + ".*.*.*";
      }

      return field;
    })
    .join(",");
}

export default {
  name: "edit",
  metaInfo() {
    const collection = this.collection.startsWith("directus_")
      ? this.$helpers.formatTitle(this.collection.substr(9))
      : this.$helpers.formatTitle(this.collection);

    if (this.isNew) {
      return {
        title: this.$t("creating_item_page_title", {
          collection
        })
      };
    } else if (this.batch) {
      return {
        title: this.$t("batch_edit", {
          collection
        })
      };
    } else {
      return {
        title: this.$t("editing", {
          collection
        })
      };
    }
  },
  components: {
    VLoader,
    VNotFound,
    VError,
    VActivity
  },
  props: {
    collection: {
      type: String,
      required: true
    },
    primaryKey: {
      type: null,
      required: true
    }
  },
  data() {
    return {
      saving: false,

      notFound: false,
      error: false,

      confirmRemove: false,
      confirmRemoveLoading: false,
      confirmBatchSave: false,

      confirmNavigation: false,
      leavingTo: "",

      activityLoading: false,
      activity: [],
      revisions: {},

      revertActivity: null,
      reverting: false
    };
  },
  computed: {
    breadcrumb() {
      if (this.collection === "directus_users") {
        let crumbName = this.$t("editing_item");
        if (this.primaryKey == this.$store.state.currentUser.id) {
          crumbName = this.$t("editing_my_profile");
        } else if (this.newItem) {
          crumbName = this.$t("creating_item");
        }

        return [
          {
            name: this.$t("user_directory"),
            path: "/users"
          },
          {
            name: crumbName,
            path: this.$route.path
          }
        ];
      }

      if (this.collection === "directus_files") {
        return [
          {
            name: this.$t("file_library"),
            path: "/files"
          },
          {
            name: this.newItem ? this.$t("creating_item") : this.$t("editing_item"),
            path: this.$route.path
          }
        ];
      }

      if (this.singleItem) {
        return [
          {
            name: this.$t("collections"),
            path: "/collections"
          },
          {
            name: this.$t("editing_single", {
              collection: this.$helpers.formatTitle(this.collection)
            }),
            path: this.$route.path
          }
        ];
      }

      const breadcrumb = [];

      if (this.collection.startsWith("directus_")) {
        breadcrumb.push({
          name: this.$helpers.formatTitle(this.collection.substr(9)),
          path: `/${this.collection.substring(9)}`
        });
      } else {
        breadcrumb.push(
          {
            name: this.$t("collections"),
            path: "/collections"
          },
          {
            name: this.$t(`collections-${this.collection}`),
            path: `/collections/${this.collection}`
          }
        );
      }

      if (this.batch) {
        const count = this.primaryKey.split(",").length;
        breadcrumb.push({
          name: this.$t("editing_items", { count }),
          path: this.$route.path
        });
      } else {
        breadcrumb.push({
          name: this.newItem ? this.$t("creating_item") : this.$t("editing_item"),
          path: this.$route.path
        });
      }

      return breadcrumb;
    },
    collectionInfo() {
      return this.$store.state.collections[this.collection];
    },
    defaultValues() {
      return this.$lodash.mapValues(this.fields, field => {
        if (field.type === "array") {
          return [field.default_value];
        }

        if (field.type === "boolean") {
          if (field.default_value === "1" || field.default_value === "true") {
            return true;
          }
          return false;
        }

        return field.default_value;
      });
    },
    values() {
      const edits = this.$store.state.edits.values;

      return {
        ...this.defaultValues,
        ...(this.savedValues || {}),
        ...edits
      };
    },
    activityDetail() {
      return this.collection === "directus_activity";
    },
    editing() {
      return this.$store.getters.editing;
    },
    savedValues() {
      return this.$store.state.edits.savedValues;
    },
    newItem() {
      return this.primaryKey === "+";
    },

    // Get the status name of the value that's marked as soft delete
    // This will make the delete button update the item to the hidden status
    // instead of deleting it completely from the database
    softDeleteStatus() {
      if (!this.collectionInfo.status_mapping || !this.statusField) return null;

      const statusKeys = Object.keys(this.collectionInfo.status_mapping);
      const index = this.$lodash.findIndex(Object.values(this.collectionInfo.status_mapping), {
        soft_delete: true
      });
      return statusKeys[index];
    },

    singleItem() {
      return this.collectionInfo && this.collectionInfo.single === true;
    },
    primaryKeyField() {
      return this.$lodash.find(this.fields, { primary_key: true }).field;
    },
    batch() {
      return this.primaryKey.includes(",");
    },
    statusField() {
      if (!this.fields) return null;
      return (
        this.$lodash.find(
          Object.values(this.fields),
          field => field.type && field.type.toLowerCase() === "status"
        ) || {}
      ).field;
    },
    status() {
      if (!this.statusField) return null;
      return this.savedValues[this.statusField];
    },
    permission() {
      const permission = this.$store.state.permissions[this.collection];

      if (this.batch) {
        if (this.statusField) {
          const statuses = this.savedValues.map(item => item[this.statusField]);
          return this.$lodash.merge({}, ...statuses.map(status => permission.statuses[status]));
        }

        return permission;
      }

      if (this.isNew) {
        if (this.status) {
          return {
            ...permission.statuses[this.status],
            read_field_blacklist: permission.$create.read_field_blacklist,
            write_field_blacklist: permission.$create.write_field_blacklist,
            status_blacklist: permission.$create.status_blacklist
          };
        }

        return {
          ...permission,
          read_field_blacklist: permission.$create.read_field_blacklist,
          write_field_blacklist: permission.$create.write_field_blacklist,
          status_blacklist: permission.$create.status_blacklist
        };
      }

      if (this.status) {
        return permission.statuses[this.status];
      }

      return permission;
    },
    readonly() {
      return this.permission.update === "none";
    },
    isNew() {
      return this.primaryKey === "+";
    },
    fields() {
      const fields = this.$store.state.collections[this.collection].fields;

      return mapValues(fields, field => ({
        ...field,
        name: formatTitle(field.field)
      }));
    },

    // Gets the configured color for the current status (this.status) of the item. This will be
    // fetched out of this.fields
    statusColor() {
      if (this.statusField && this.status) {
        const statusMapping = this.fields[this.statusField].options.status_mapping;

        if (!statusMapping) return null;

        return statusMapping[this.status].background_color || null;
      }

      return null;
    },

    // The configured name of the current status.
    statusName() {
      if (this.statusField && this.status) {
        const statusMapping = this.fields[this.statusField].options.status_mapping;

        if (!statusMapping) return null;

        return statusMapping[this.status].name || null;
      }

      return null;
    }
  },
  created() {
    if (this.isNew) {
      this.stageDefaultValues();
    } else {
      this.fetchActivity();
      this.checkOtherUsers();
    }
  },
  mounted() {
    const handler = () => {
      if (this.editing) {
        this.save("stay");
      }

      return false;
    };

    this.$helpers.mousetrap.bind("mod+s", handler);
    this.formtrap = this.$helpers.mousetrap(this.$refs.form.$el).bind("mod+s", handler);
  },
  beforeDestroy() {
    this.$helpers.mousetrap.unbind("mod+s");
    this.formtrap.unbind("mod+s");
  },
  watch: {
    $route() {
      this.fetchActivity();
    },
    notFound(notFound) {
      if (this.singleItem && notFound === true) {
        this.$router.push(`/collections/${this.collection}/+`);
      }
    }
  },
  methods: {
    stageDefaultValues() {
      this.$lodash.forEach(this.defaultValues, (value, field) => this.stageValue({ field, value }));
    },
    stageValue({ field, value }) {
      this.$store.dispatch("stageValue", { field, value });
    },
    unstageValue(field) {
      this.$store.dispatch("unstageValue", field);
    },
    remove() {
      this.confirmRemoveLoading = true;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      let request;

      if (this.softDeleteStatus) {
        request = this.$api.updateItem(this.collection, this.primaryKey, {
          [this.statusField]: this.softDeleteStatus
        });
      } else {
        request = this.$api.deleteItem(this.collection, this.primaryKey);
      }

      request
        .then(() => {
          this.$store.dispatch("loadingFinished", id);
          this.$store.dispatch("discardChanges", id);
          this.$notify({
            title: this.$t("item_deleted"),
            color: "green",
            iconMain: "check"
          });
          this.confirmRemoveLoading = false;
          this.confirmRemove = false;
          this.$router.push(`/collections/${this.collection}`);
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    save(method) {
      this.saving = true;

      if (method === "copy") {
        const values = Object.assign({}, this.values);

        // Delete fields that shouldn't / can't be duplicated
        this.$lodash.forEach(this.fields, (info, fieldName) => {
          if (info.primary_key === true) delete values[fieldName];

          switch (info.type.toLowerCase()) {
            case "alias":
            case "datetime_created":
            case "datetime_updated":
            case "user_created":
            case "user_updated":
            case "o2m":
            case "m2o":
              delete values[fieldName];
              break;
          }
        });

        const id = this.$helpers.shortid.generate();
        this.$store.dispatch("loadingStart", { id });

        return this.$store
          .dispatch("save", {
            primaryKey: "+",
            values
          })
          .then(res => {
            this.$store.dispatch("loadingFinished", id);
            this.saving = false;
            return res.data[this.primaryKeyField];
          })
          .then(pk => {
            this.$notify({
              title: this.$tc("item_saved"),
              color: "green",
              iconMain: "check"
            });
            if (this.collection.startsWith("directus_")) {
              return this.$router.push(`/${this.collection.substring(9)}/${pk}`);
            }

            return this.$router.push(`/collections/${this.collection}/${pk}`);
          })
          .catch(error => {
            this.$store.dispatch("loadingFinished", id);
            this.$events.emit("error", {
              notify: error.message || this.$t("something_went_wrong_body"),
              error
            });
          });
      }

      if (this.$store.getters.editing === false) return;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      return this.$store
        .dispatch("save")
        .then(res => res.data)
        .then(savedValues => {
          this.$store.dispatch("loadingFinished", id);
          this.saving = false;
          return savedValues;
        })
        .then(savedValues => {
          const savedValuesLength = this.savedValues.length;
          this.$notify({
            title: this.$tc("item_saved", savedValuesLength, {
              count: savedValuesLength
            }),
            color: "green",
            iconMain: "check"
          });

          if (method === "leave") {
            if (this.collection.startsWith("directus_")) {
              return this.$router.push(`/${this.collection.substring(9)}`);
            }

            return this.$router.push(`/collections/${this.collection}`);
          }

          if (method === "stay") {
            this.fetchActivity();

            if (this.newItem) {
              const primaryKey = savedValues[this.primaryKeyField];
              return this.$router.push(`/collections/${this.collection}/${primaryKey}`);
            }
            this.$store.dispatch("startEditing", {
              collection: this.collection,
              primaryKey: this.primaryKey,
              savedValues: savedValues
            });
          }

          if (method === "add") {
            if (this.$route.fullPath.endsWith("+")) {
              this.$store.dispatch("startEditing", {
                collection: this.collection,
                primaryKey: "+",
                savedValues: {}
              });
            } else {
              this.$router.push(`/collections/${this.collection}/+`);
            }
          }
        })
        .catch(error => {
          this.saving = false;
          this.$store.dispatch("loadingFinished", id);

          this.$events.emit("error", {
            notify: error.message || this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    fetchActivity() {
      this.activity = [];
      this.revisions = {};
      this.activityLoading = true;

      const id = shortid.generate();
      store.dispatch("loadingStart", { id });

      return Promise.all([
        this.$api.getActivity({
          "filter[collection][eq]": this.collection,
          "filter[item][eq]": this.primaryKey,
          fields: "id,action,action_on,comment,action_by.first_name,action_by.last_name",
          sort: "-action_on"
        }),
        this.activityDetail
          ? Promise.resolve({ data: [] })
          : this.$api.getItemRevisions(this.collection, this.primaryKey)
      ])
        .then(([activity, revisions]) => {
          store.dispatch("loadingFinished", id);
          return {
            activity: activity.data,
            revisions: revisions.data
          };
        })
        .then(({ activity, revisions }) => {
          return {
            activity: activity.map(act => {
              const date = new Date(act.action_on);
              let name;

              if (act.action_by) {
                name = act.action_by.first_name + " " + act.action_by.last_name;
              } else {
                name = "Public";
              }

              return {
                id: act.id,
                date,
                name,
                action: act.action.toLowerCase(),
                comment: act.comment
              };
            }),
            revisions: this.$lodash.keyBy(revisions, "activity")
          };
        })
        .then(({ activity, revisions }) => {
          this.activity = activity;
          this.revisions = revisions;
          this.activityLoading = false;
        })
        .catch(error => {
          store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    checkOtherUsers() {
      const path = this.$router.currentRoute.path;
      const date = this.$helpers.date.dateToSql(new Date(new Date() - 5 * 60000));

      this.$api
        .getUsers({
          "filter[last_access_on][gte]": date,
          "filter[last_page][eq]": path,
          "filter[id][neq]": this.$store.state.currentUser.id
        })
        .then(res => res.data)
        .then(users => {
          if (users.length > 0) {
            users.forEach(user => {
              const { first_name, last_name } = user;
              this.$notify({
                title: this.$t("user_edit_warning", { first_name, last_name }),
                color: "red",
                iconMain: "error"
              });
            });
          }
        })
        .catch(error => {
          console.error(error); // eslint-disable-line no-console
        });
    },
    postComment(comment) {
      const id = shortid.generate();
      store.dispatch("loadingStart", { id });
      const currentUser = this.$store.state.currentUser;

      this.$api
        .post("/activity/comment", {
          collection: this.collection,
          item: this.primaryKey,
          comment
        })
        .then(res => res.data)
        .then(comment => {
          store.dispatch("loadingFinished", id);
          this.activity = [
            {
              ...comment,
              name: `${currentUser.first_name} ${currentUser.last_name}`
            },
            ...this.activity
          ];
        })
        .catch(error => {
          store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    revertItem(revisionID) {
      this.reverting = true;
      this.$api
        .revert(this.collection, this.primaryKey, revisionID)
        .then(() => {
          this.reverting = false;
          this.revertActivity = null;

          return Promise.all([
            this.$api.getItem(this.collection, this.primaryKey, {
              fields: getFieldsQuery(this.collection)
            }),
            this.fetchActivity()
          ]);
        })
        .then(([{ data }]) => {
          this.$store.dispatch("startEditing", {
            collection: this.collection,
            primaryKey: this.primaryKey,
            savedValues: data
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
  beforeRouteEnter(to, from, next) {
    const { collection, primaryKey } = to.params;
    const exists =
      Object.keys(store.state.collections).includes(collection) ||
      collection.startsWith("directus_");
    const isNew = primaryKey === "+";

    if (exists === false) {
      return next(vm => (vm.$data.notFound = true));
    }

    if (isNew) {
      store.dispatch("startEditing", {
        collection: collection,
        primaryKey: primaryKey,
        savedValues: {}
      });
      next();
      return;
    }

    const id = shortid.generate();
    store.dispatch("loadingStart", { id });

    return api
      .getItem(collection, primaryKey, { fields: getFieldsQuery(collection) })
      .then(res => res.data)
      .then(item => {
        store.dispatch("loadingFinished", id);
        store.dispatch("startEditing", {
          collection: collection,
          primaryKey: primaryKey,
          savedValues: item
        });
        next();
      })
      .catch(error => {
        store.dispatch("loadingFinished", id);
        if (error && error.code === 203) {
          return next(vm => (vm.$data.notFound = true));
        }

        EventBus.emit("error", {
          notify: i18n.t("something_went_wrong_body"),
          error
        });
        return next(vm => (vm.$data.error = true));
      });
  },
  beforeRouteUpdate(to, from, next) {
    const { collection, primaryKey } = to.params;
    const exists =
      Object.keys(this.$store.state.collections).includes(collection) ||
      collection.startsWith("directus_");
    const isNew = primaryKey === "+";

    this.saving = false;

    this.notFound = false;
    this.error = false;

    this.confirmRemove = false;
    this.confirmRemoveLoading = false;
    this.confirmBatchSave = false;

    this.confirmNavigation = false;
    this.leavingTo = "";

    this.activityLoading = false;
    this.activity = [];
    this.revisions = {};

    this.revertActivity = null;
    this.reverting = false;

    if (exists === false) {
      this.notFound = true;
      return next();
    }

    if (isNew) {
      this.$store.dispatch("startEditing", {
        collection: collection,
        primaryKey: primaryKey,
        savedValues: {}
      });
      next();
      return;
    }

    const id = this.$helpers.shortid.generate();
    this.$store.dispatch("loadingStart", { id });

    return this.$api
      .getItem(collection, primaryKey, {
        fields: getFieldsQuery(collection)
      })
      .then(res => res.data)
      .then(item => {
        this.$store.dispatch("loadingFinished", id);
        this.$store.dispatch("startEditing", {
          collection: collection,
          primaryKey: primaryKey,
          savedValues: item
        });
        next();
      })
      .catch(error => {
        this.$store.dispatch("loadingFinished", id);
        if (error && error.code === 203) {
          this.notFound = true;
          return next();
        }

        this.$events.emit("error", {
          notify: i18n.t("something_went_wrong_body"),
          error
        });
        this.error = error;
        next();
      });
  },
  beforeRouteLeave(to, from, next) {
    // If there aren't any edits, there is no reason to stop the user from navigating
    if (this.$store.getters.editing === false) return next();

    // If the modal is already open, the second navigation attempt has to be the discard changes button
    if (this.confirmNavigation === true) {
      this.$store.dispatch("discardChanges");
      return next();
    }

    this.confirmNavigation = true;
    this.leavingTo = to.fullPath;

    return next(false);
  }
};
</script>

<style lang="scss" scoped>
.edit {
  padding: var(--page-padding);
  padding-bottom: var(--page-padding-bottom);
}

.revert {
  padding: 20px;

  p.notice {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px dotted var(--lighter-gray);
    color: var(--warning);
  }
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  margin-left: 8px;
  margin-top: 1px;
}
</style>

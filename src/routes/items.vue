<template>
  <v-not-found v-if="notFound" />
  <div v-else class="route-item-listing">
    <v-header
      info-toggle
      :item-detail="false"
      :breadcrumb="breadcrumb"
      :icon="collectionInfo.icon || 'box'"
      :title="currentBookmark && currentBookmark.title"
    >
      <template slot="title">
        <button
          :class="currentBookmark ? 'active' : null"
          :disabled="currentBookmark"
          class="bookmark"
          @click="bookmarkModal = true"
        >
          <v-icon :name="currentBookmark ? 'bookmark' : 'bookmark_border'" />
        </button>
      </template>
      <v-search-filter
        v-show="selection && selection.length === 0 && !emptyCollection"
        :filters="filters"
        :search-query="searchQuery"
        :field-names="filterableFieldNames"
        :placeholder="resultCopy"
        @filter="updatePreferences('filters', $event)"
        @search="updatePreferences('search_query', $event)"
        @clear-filters="clearFilters"
      />
      <template slot="buttons">
        <v-header-button
          v-if="editButton && !activity"
          key="edit"
          icon="mode_edit"
          color="gray"
          hover-color="warning"
          :disabled="!editButtonEnabled"
          :label="$t('batch')"
          :to="batchURL"
        />
        <v-header-button
          v-if="deleteButton && !activity"
          key="delete"
          icon="delete_outline"
          color="gray"
          hover-color="danger"
          :disabled="!deleteButtonEnabled"
          :label="$t('delete')"
          @click="confirmRemove = true"
        />
        <v-header-button
          v-if="addButton && !activity"
          key="add"
          icon="add"
          color="action"
          :label="$t('new')"
          :to="`/collections/${collection}/+`"
        />
      </template>
    </v-header>

    <v-items
      v-if="preferences"
      ref="listing"
      :collection="collection"
      :filters="filters"
      :search-query="searchQuery"
      :view-query="viewQuery"
      :view-type="viewType"
      :view-options="viewOptions"
      :selection="!activity ? selection : null"
      links
      @fetch="meta = $event"
      @options="setViewOptions"
      @select="selection = $event"
      @query="setViewQuery"
    />

    <v-info-sidebar v-if="preferences">
      <template slot="system">
        <div class="layout-picker">
          <select :value="viewType" @input="updatePreferences('view_type', $event.target.value)">
            <option v-for="(name, val) in layoutNames" :key="val" :value="val">
              {{ name }}
            </option>
          </select>
          <div class="preview">
            <v-icon :name="layoutIcons[viewType]" color="darker-gray" />
            <span>{{ layoutNames[viewType] }}</span>
            <v-icon name="expand_more" color="light-gray" />
          </div>
        </div>
      </template>
      <v-ext-layout-options
        :key="`${collection}-${viewType}`"
        class="layout-options"
        :type="viewType"
        :collection="collection"
        :fields="keyBy(fields, 'field')"
        :view-options="viewOptions"
        :view-query="viewQuery"
        :selection="selection"
        link="__link__"
        @query="setViewQuery"
        @options="setViewOptions"
      />

      <router-link v-if="canReadActivity" to="/activity" class="notifications">
        <div class="preview">
          <v-icon name="notifications" color="light-gray" />
          <span>{{ $t("notifications") }}</span>
        </div>
      </router-link>
    </v-info-sidebar>

    <portal v-if="confirmRemove" to="modal">
      <v-confirm
        :message="
          $tc('batch_delete_confirm', selection.length, {
            count: selection.length
          })
        "
        color="danger"
        :confirm-text="$t('delete')"
        @cancel="confirmRemove = false"
        @confirm="remove"
      />
    </portal>

    <portal v-if="bookmarkModal" to="modal">
      <v-create-bookmark :preferences="preferences" @close="closeBookmark"></v-create-bookmark>
    </portal>
  </div>
</template>

<script>
import shortid from "shortid";
import store from "../store/";
import VSearchFilter from "../components/search-filter/search-filter.vue";
import VCreateBookmark from "../components/bookmarks/create-bookmark.vue";
import VNotFound from "./not-found.vue";

import api from "../api";

export default {
  name: "Items",
  metaInfo() {
    return {
      title: this.$helpers.formatTitle(this.collection)
    };
  },
  components: {
    VSearchFilter,
    VNotFound,
    VCreateBookmark
  },
  data() {
    return {
      selection: [],
      meta: null,
      preferences: null,
      confirmRemove: false,
      bookmarkModal: false,
      notFound: false
    };
  },
  computed: {
    activity() {
      return this.collection === "directus_activity";
    },
    breadcrumb() {
      if (this.collection === "directus_users") {
        return [
          {
            name: this.$t("user_directory"),
            path: "/users"
          }
        ];
      }

      if (this.collection === "directus_files") {
        return [
          {
            name: this.$t("file_library"),
            path: "/files"
          }
        ];
      }

      if (this.collection.startsWith("directus_")) {
        return [
          {
            name: this.$helpers.formatTitle(this.collection.substr(9)),
            path: `/${this.collection.substring(9)}`
          }
        ];
      } else {
        return [
          {
            name: this.$t("collections"),
            path: "/collections"
          },
          {
            name: this.$t(`collections-${this.collection}`),
            path: `/collections/${this.collection}`
          }
        ];
      }
    },
    fields() {
      const fields = this.$store.state.collections[this.collection].fields;
      return Object.values(fields).map(field => ({
        ...field,
        name: this.$helpers.formatTitle(field.field)
      }));
    },
    batchURL() {
      return `/collections/${this.collection}/${this.selection
        .map(item => item[this.primaryKeyField])
        .join(",")}`;
    },
    currentBookmark() {
      if (!this.preferences) return;

      const bookmarks = this.$store.state.bookmarks;
      const preferences = {
        collection: this.preferences.collection,
        search_query: this.preferences.search_query,
        filters: this.preferences.filters,
        view_options: this.preferences.view_options,
        view_type: this.preferences.view_type,
        view_query: this.preferences.view_query
      };
      const currentBookmark = bookmarks.filter(bookmark => {
        const bookmarkPreferences = {
          collection: bookmark.collection,
          search_query: bookmark.search_query,
          filters: bookmark.filters,
          view_options: bookmark.view_options,
          view_type: bookmark.view_type,
          view_query: bookmark.view_query
        };
        return _.isEqual(bookmarkPreferences, preferences);
      })[0];
      return currentBookmark || null;
    },
    collection() {
      return this.$route.params.collection;
    },
    collectionInfo() {
      return this.$store.state.collections[this.collection];
    },
    emptyCollection() {
      return (this.meta && this.meta.total_count === 0) || false;
    },
    filters() {
      if (!this.preferences) return [];
      return this.preferences.filters || [];
    },
    searchQuery() {
      if (!this.preferences) return "";
      return this.preferences.search_query || "";
    },
    viewType() {
      if (!this.preferences) return "tabular";
      return this.preferences.view_type || "tabular";
    },
    viewQuery() {
      if (!this.preferences) return {};

      const viewQuery =
        (this.preferences.view_query && this.preferences.view_query[this.viewType]) || {};

      // Filter out the fieldnames of fields that don't exist anymore
      // Sorting / querying fields that don't exist anymore will return
      // a 422 in the API and brick the app

      const collectionFieldNames = this.fields.map(f => f.field);

      if (viewQuery.fields) {
        viewQuery.fields = viewQuery.fields
          .split(",")
          .filter(fieldName => collectionFieldNames.includes(fieldName))
          .join(",");
      }

      if (viewQuery.sort) {
        // If the sort is descending, the fieldname starts with -
        // The fieldnames in the array of collection field names don't have this
        // which is why we have to take it out.
        const sortFieldName = viewQuery.sort.startsWith("-")
          ? viewQuery.sort.substring(1)
          : viewQuery.sort;

        if (collectionFieldNames.includes(sortFieldName) === false) {
          viewQuery.sort = this.primaryKeyField;
        }
      }

      return viewQuery;
    },
    viewOptions() {
      if (!this.preferences) return {};
      return (this.preferences.view_options && this.preferences.view_options[this.viewType]) || {};
    },
    resultCopy() {
      if (!this.meta || !this.preferences) return this.$t("loading");

      const isFiltering =
        !_.isEmpty(this.preferences.filters) ||
        (!_.isNil(this.preferences.search_query) && this.preferences.search_query.length > 0);

      return isFiltering
        ? this.$tc("item_count_filter", this.meta.result_count, {
            count: this.$n(this.meta.result_count)
          })
        : this.$tc("item_count", this.meta.total_count, {
            count: this.$n(this.meta.total_count)
          });
    },
    filterableFieldNames() {
      return this.fields.filter(field => field.datatype).map(field => field.field);
    },
    layoutNames() {
      if (!this.$store.state.extensions.layouts) return {};
      const translatedNames = {};
      Object.keys(this.$store.state.extensions.layouts).forEach(id => {
        translatedNames[id] = this.$store.state.extensions.layouts[id].name;
      });
      return translatedNames;
    },
    layoutIcons() {
      if (!this.$store.state.extensions.layouts) return {};
      const icons = {};
      Object.keys(this.$store.state.extensions.layouts).forEach(id => {
        icons[id] = this.$store.state.extensions.layouts[id].icon;
      });
      return icons;
    },
    statusField() {
      if (!this.fields) return null;
      return (
        _.find(Object.values(this.fields), field => field.type.toLowerCase() === "status") || {}
      ).field;
    },

    // Get the status name of the value that's marked as soft delete
    // This will make the delete button update the item to the hidden status
    // instead of deleting it completely from the database
    softDeleteStatus() {
      if (!this.collectionInfo.status_mapping || !this.statusField) return null;

      const statusKeys = Object.keys(this.collectionInfo.status_mapping);
      const index = _.findIndex(Object.values(this.collectionInfo.status_mapping), {
        soft_delete: true
      });
      return statusKeys[index];
    },

    userCreatedField() {
      if (!this.fields) return null;

      return (
        _.find(Object.values(this.fields), field => field.type.toLowerCase() === "user_created") ||
        {}
      ).field;
    },
    primaryKeyField() {
      if (!this.fields) return null;
      return _.find(this.fields, { primary_key: true }).field;
    },
    permissions() {
      return this.$store.state.permissions;
    },
    permission() {
      return this.permissions[this.collection];
    },
    canReadActivity() {
      return this.permissions.directus_activity.read !== "none";
    },
    addButton() {
      if (this.$store.state.currentUser.admin) return true;

      if (this.statusField) {
        return (
          Object.values(this.permission.statuses).some(
            permission => permission.create === "full"
          ) || this.permission.$create.create === "full"
        );
      }

      return this.permission.create === "full";
    },
    deleteButton() {
      if (!this.selection) return false;
      if (this.selection.length === 0) return false;
      return true;
    },
    deleteButtonEnabled() {
      if (this.$store.state.currentUser.admin) return true;
      const currentUserID = this.$store.state.currentUser.id;
      let enabled = true;

      this.selection.forEach(item => {
        const status = this.statusField ? item[this.statusField] : null;
        const permission = this.statusField ? this.permission.statuses[status] : this.permission;
        const userID = item[this.userCreatedField];

        if (permission.delete === "none") {
          return (enabled = false);
        }

        if (permission.delete === "mine" && userID !== currentUserID) {
          return (enabled = false);
        }

        if (permission.delete === "role") {
          const userRoles = this.$store.state.users[userID].roles;
          const currentUserRoles = this.$store.state.currentUser.roles;
          let contains = false;

          userRoles.forEach(role => {
            if (currentUserRoles.includes(role)) contains = true;
          });

          if (contains === false) return (enabled = false);
        }
      });

      return enabled;
    },
    editButton() {
      if (this.selection && this.selection.length > 1) return true;
      return false;
    },
    editButtonEnabled() {
      const currentUserID = this.$store.state.currentUser.id;
      let enabled = true;

      if (this.$store.state.currentUser.admin) return true;

      this.selection.forEach(item => {
        const status = this.statusField ? item[this.statusField] : null;
        const permission = this.statusField ? this.permission.statuses[status] : this.permission;
        const userID = item[this.userCreatedField];

        if (permission.update === "none") {
          return (enabled = false);
        }

        if (permission.update === "mine" && userID !== currentUserID) {
          return (enabled = false);
        }

        if (permission.update === "role") {
          const userRoles = this.$store.state.users[userID].roles;
          const currentUserRoles = this.$store.state.currentUser.roles;
          let contains = false;

          userRoles.forEach(role => {
            if (currentUserRoles.includes(role)) contains = true;
          });

          if (contains === false) return (enabled = false);
        }
      });

      return enabled;
    }
  },
  watch: {
    $route() {
      if (this.$route.query.b) {
        this.$router.replace({
          path: this.$route.path
        });
      }
    }
  },
  methods: {
    keyBy: _.keyBy,
    closeBookmark() {
      this.bookmarkModal = false;
    },
    setViewQuery(query) {
      const newViewQuery = {
        ...this.preferences.view_query,
        [this.viewType]: {
          ...this.viewQuery,
          ...query
        }
      };
      this.updatePreferences("view_query", newViewQuery);
    },
    setViewOptions(options) {
      const newViewOptions = {
        ...this.preferences.view_options,
        [this.viewType]: {
          ...this.viewOptions,
          ...options
        }
      };
      this.updatePreferences("view_options", newViewOptions);
    },
    updatePreferences(key, value, combine = false) {
      if (combine) {
        value = {
          ...this.preferences[key],
          ...value
        };
      }
      this.$set(this.preferences, key, value);

      // user vs role vs collection level preferences, == checks both null and undefined
      const isPreferenceFallback = this.preferences.user == null;
      if (isPreferenceFallback) {
        return this.createCollectionPreset();
      }

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      return this.$api
        .updateCollectionPreset(this.preferences.id, {
          [key]: value
        })
        .then(() => {
          this.$store.dispatch("loadingFinished", id);
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    createCollectionPreset() {
      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      const preferences = { ...this.preferences };
      delete preferences.id;

      return this.$api
        .createCollectionPreset({
          ...preferences,
          collection: this.collection,
          user: this.$store.state.currentUser.id
        })
        .then(({ data }) => {
          this.$store.dispatch("loadingFinished", id);
          this.$set(this.preferences, "id", data.id);
          this.$set(this.preferences, "user", data.user);
        })
        .catch(error => {
          this.$store.dispatch("loadingFinished", id);
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    },
    clearFilters() {
      this.updatePreferences("filters", null);
      this.updatePreferences("search_query", null);
    },
    remove() {
      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      let request;

      const itemKeys = this.selection.map(item => item[this.primaryKeyField]);

      if (this.softDeleteStatus) {
        request = this.$api.updateItem(this.collection, itemKeys.join(","), {
          [this.statusField]: this.softDeleteStatus
        });
      } else {
        request = this.$api.deleteItems(
          this.collection,
          this.selection.map(item => item[this.primaryKeyField])
        );
      }

      request
        .then(() => {
          this.$store.dispatch("loadingFinished", id);
          this.$refs.listing.getItems();
          this.selection = [];
          this.confirmRemove = false;
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

    const collectionInfo = store.state.collections[collection] || null;

    if (collection.startsWith("directus_") === false && collectionInfo === null) {
      return next(vm => (vm.notFound = true));
    }

    if (collection === "directus_files") return next("/files");

    if (collectionInfo && collectionInfo.single) {
      return next(`/collections/${collection}/1`);
    }

    const id = shortid.generate();
    store.dispatch("loadingStart", { id });

    return api
      .getMyListingPreferences(collection)
      .then(preferences => {
        store.dispatch("loadingFinished", id);
        next(vm => {
          vm.$data.preferences = preferences;
        });
      })
      .catch(error => {
        store.dispatch("loadingFinished", id);
        this.$events.emit("error", {
          notify: this.$t("something_went_wrong_body"),
          error
        });
      });
  },
  beforeRouteUpdate(to, from, next) {
    const { collection } = to.params;

    this.preferences = null;
    this.selection = [];
    this.meta = {};
    this.notFound = false;

    const collectionInfo = this.$store.state.collections[collection] || null;

    if (collection.startsWith("directus_") === false && collectionInfo === null) {
      this.notFound = true;
      return next();
    }

    if (collectionInfo && collectionInfo.single) {
      return next(`/collections/${collection}/1`);
    }

    const id = this.$helpers.shortid.generate();
    this.$store.dispatch("loadingStart", { id });

    return api
      .getMyListingPreferences(collection)
      .then(preferences => {
        this.$store.dispatch("loadingFinished", id);
        this.preferences = preferences;
        next();
      })
      .catch(error => {
        this.$store.dispatch("loadingFinished", id);
        this.$events.emit("error", {
          notify: this.$t("something_went_wrong_body"),
          error
        });
      });
  }
};
</script>

<style lang="scss" scoped>
label.style-4 {
  padding-bottom: 5px;
}

.bookmark {
  margin-left: 5px;
  position: relative;

  i {
    transition: color var(--fast) var(--transition);
    color: var(--light-gray);
    font-size: 24px;
    height: 20px;
    transform: translateY(-1px); // Vertical alignment of icon
  }

  &:hover {
    i {
      color: var(--darker-gray);
    }
  }
}

.bookmark.active {
  opacity: 1;
  i {
    color: var(--accent);
  }
}

.layout-picker,
.notifications {
  margin: -20px;
  padding: 20px;
  background-color: #dde3e6;
  color: var(--darker-gray);
  position: relative;
  display: block;

  .preview {
    display: flex;
    align-items: center;

    span {
      flex-grow: 1;
      margin-left: 10px;
    }
  }

  select {
    opacity: 0;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    cursor: pointer;
  }
}

.layout-options {
  margin-bottom: 64px;
}

.notifications {
  position: fixed;
  width: var(--info-sidebar-width);
  bottom: 0;
  right: 0;
  margin: 0;
  text-decoration: none;
}
</style>

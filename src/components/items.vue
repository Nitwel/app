<template>
  <v-error
    v-if="items.error"
    icon="warning"
    color="danger"
    :title="$t('server_error')"
    :body="$t('server_error_copy')"
  />

  <v-error
    v-else-if="items.fields && Object.keys(items.fields).length === 0"
    icon="build"
    :title="$t('no_fields')"
    :body="$t('no_fields_body')"
  />

  <v-error
    v-else-if="collection === 'directus_files' && items.meta && items.meta.total_count === 0"
    icon="image"
    :title="$t('no_files')"
    :body="$t('no_files_body')"
  />

  <v-error
    v-else-if="items.meta && items.meta.total_count === 0"
    icon="web_asset"
    :title="$t('empty_collection')"
    :body="$t('empty_collection_body')"
  />

  <v-error
    v-else-if="
      items.data && items.data.length === 0 && (items.meta && items.meta.total_count !== 0)
    "
    :title="$t('no_results')"
    :body="$t('no_results_body')"
    icon="search"
  />

  <v-ext-layout
    v-else
    :fields="fields"
    :items="items.data || []"
    :view-type="viewType"
    :view-query="viewQuery"
    :view-options="viewOptions"
    :selection="selectionKeys"
    :loading="items.loading"
    :lazy-loading="items.lazyLoading"
    :link="links ? '__link__' : null"
    :sort-field="sortField"
    @input="saveItems"
    @select="select"
    @query="$emit('query', $event)"
    @options="$emit('options', $event)"
    @next-page="lazyLoad"
  />
</template>

<script>
import formatFilters from "../helpers/format-filters";

export default {
  name: "v-items",
  props: {
    collection: {
      type: String,
      required: true
    },
    filters: {
      type: Array,
      default: () => []
    },
    searchQuery: {
      type: String,
      default: ""
    },
    viewType: {
      type: String,
      default: "tabular"
    },
    viewOptions: {
      type: Object,
      default: () => ({})
    },
    viewQuery: {
      type: Object,
      default: () => ({})
    },
    selection: {
      type: Array,
      default: null
    },
    links: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      items: {
        meta: null,
        data: null,
        loading: false,
        error: null,

        page: 0,
        lazyLoading: false
      }
    };
  },
  computed: {
    allSelected() {
      const primaryKeys = this.items.data.map(item => item[this.primaryKeyField]).sort();
      const selection = [...this.selection];
      selection.sort();
      return this.selection.length > 0 && this.$lodash.isEqual(primaryKeys, selection);
    },
    primaryKeyField() {
      if (!this.fields) return;
      return this.$lodash.find(Object.values(this.fields), {
        primary_key: true
      }).field;
    },
    sortField() {
      const field = this.$lodash.find(this.fields, { type: "sort" });
      return (field && field.field) || null;
    },
    statusField() {
      const field = this.$lodash.find(this.fields, { type: "status" });
      return (field && field.field) || null;
    },
    userCreatedField() {
      if (!this.fields) return null;

      return (
        this.$lodash.find(
          Object.values(this.fields),
          field => field.type && field.type.toLowerCase() === "user_created"
        ) || {}
      ).field;
    },
    fields() {
      const fields = this.$store.state.collections[this.collection].fields;
      return (
        this.$lodash.mapValues(fields, field => ({
          ...field,
          name: this.$helpers.formatTitle(field.field)
        })) || {}
      );
    },
    selectionKeys() {
      if (!this.selection) return null;
      return this.$lodash.uniq(this.selection.map(item => item[this.primaryKeyField]));
    }
  },
  created() {
    this.hydrate();
  },
  watch: {
    collection(newVal, oldVal) {
      if (this.$lodash.isEqual(newVal, oldVal)) return;
      this.hydrate();
    },
    viewQuery: {
      deep: true,
      handler(newVal, oldVal) {
        if (this.$lodash.isEqual(newVal, oldVal)) return;
        this.getItems();
      }
    },
    filters: {
      deep: true,
      handler(newVal, oldVal) {
        if (this.$lodash.isEqual(newVal, oldVal)) return;
        this.getItems();
      }
    },
    searchQuery(newVal, oldVal) {
      if (this.$lodash.isEqual(newVal, oldVal)) return;
      this.getItems();
    }
  },
  mounted() {
    this.$helpers.mousetrap.bind("mod+a", () => {
      this.selectAll();
      return false;
    });
  },
  beforeDestroy() {
    this.$helpers.mousetrap.unbind("mod+a");
  },
  methods: {
    hydrate() {
      if (this.items.loading) return;

      this.items.data = null;
      this.items.loading = false;
      this.items.error = null;

      this.getItems();
    },
    selectAll() {
      if (this.allSelected) {
        return this.$emit("select", []);
      }

      return this.$emit("select", this.items.data);
    },
    getItems() {
      if (this.items.loading) return;

      this.items.loading = true;
      this.items.error = null;
      this.items.page = 0;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      return this.$api
        .getItems(this.collection, this.formatParams())
        .then(res => {
          this.items.loading = false;
          this.items.meta = res.meta;

          this.$store.dispatch("loadingFinished", id);

          if (this.links) {
            this.items.data = res.data.map(item => ({
              ...item,
              __link__: this.collection.startsWith("directus_")
                ? `/${this.collection.substr(9)}/${item[this.primaryKeyField]}`
                : `/collections/${this.collection}/${item[this.primaryKeyField]}`
            }));
          } else {
            this.items.data = res.data;
          }

          this.$emit("fetch", res.meta);
        })
        .catch(error => {
          console.error(error); // eslint-disable-line no-console
          this.$store.dispatch("loadingFinished", id);
          this.items.loading = false;
          this.items.error = error;
        });
    },
    select(primaryKeys) {
      this.$emit(
        "select",
        primaryKeys.map(key => {
          return (
            this.$lodash.find(this.items.data, {
              [this.primaryKeyField]: key
            }) || this.$lodash.find(this.selection, { [this.primaryKeyField]: key })
          );
        })
      );
    },
    saveItems(data) {
      if (!data) return;

      const pk = this.primaryKeyField;

      const id = this.$helpers.shortid.generate();
      this.$store.dispatch("loadingStart", { id });

      /**
       * TODO: Document this somewhere nice
       *
       * Layouts have the ability to update records from the layout view.
       *
       * Layouts can $emit the "input" event (just like interfaces).
       *
       * If the record contains a value for the primaryKeyField, I'll update the
       * existing record. If it doesn't; we create a new one.
       *
       * Layouts can send arrays of objects too. In that case, the same logic as
       * above applies.
       *
       * ~ Rijk (8/1/18)
       */

      if (Array.isArray(data)) {
        const update = [];
        const create = [];

        data.forEach(row => {
          if (row[pk] && row[pk] != null) {
            update.push(row);
          } else {
            create.push(row);
          }
        });

        return Promise.all([
          update.length > 0 ? this.$api.updateItems(this.collection, update) : null,
          create.length > 0 ? this.$api.createItems(this.collection, create) : null
        ])
          .then(() => {
            this.$store.dispatch("loadingFinished", id);

            return this.getItems();
          })
          .catch(error => {
            this.$store.dispatch("loadingFinished", id);
            this.$events.emit("error", {
              notify: this.$t("something_went_wrong_body"),
              error
            });
          });
      } else {
        if (data[pk] && data[pk] != null) {
          return this.$api
            .updateItem(this.collection, data[pk], data)
            .then(() => {
              this.$store.dispatch("loadingFinished", id);
              return this.getItems();
            })
            .catch(error => {
              this.$store.dispatch("loadingFinished", id);
              this.$events.emit("error", {
                notify: this.$t("something_went_wrong_body"),
                error
              });
            });
        } else {
          return this.$api
            .createItem(this.collection, data)
            .then(() => {
              this.$store.dispatch("loadingFinished", id);
              return this.getItems();
            })
            .catch(error => {
              this.$store.dispatch("loadingFinished", id);
              this.$events.emit("error", {
                notify: this.$t("something_went_wrong_body"),
                error
              });
            });
        }
      }
    },
    lazyLoad() {
      if (this.items.lazyLoading) return;
      if (
        this.items.meta.total_count === this.items.data.length ||
        this.items.page * 50 > this.items.data.length
      )
        return;

      this.items.lazyLoading = true;
      this.items.error = null;

      this.items.page = this.items.page + 1;

      return this.$api
        .getItems(this.collection, this.formatParams())
        .then(res => {
          if (res.data.length < 50) this.items.page = this.items.page + 1;
          this.items.lazyLoading = false;

          if (this.links) {
            this.items.data = [
              ...this.items.data,
              ...res.data.map(item => ({
                ...item,
                __link__: this.collection.startsWith("directus_")
                  ? `/${this.collection.substr(9)}/${item[this.primaryKeyField]}`
                  : `/collections/${this.collection}/${item[this.primaryKeyField]}`
              }))
            ];
          } else {
            this.items.data = [...this.items.data, ...res.data];
          }

          this.$emit("fetch", res.meta);
        })
        .catch(error => {
          console.error(error); // eslint-disable-line no-console
          this.items.lazyLoading = false;
          this.items.error = error;
        });
    },
    formatParams() {
      let params = {
        meta: "total_count,result_count",
        limit: 50,
        offset: 50 * this.items.page
      };

      Object.assign(params, this.viewQuery);

      // The above viewquery can override the fields. We want to force load all the fields so we don't end up with missing crucial data
      params.fields = "*.*.*";

      if (this.searchQuery) {
        params.q = this.searchQuery;
      }

      if (this.filters && this.filters.length > 0) {
        params = {
          ...params,
          ...formatFilters(this.filters)
        };
      }

      return params;
    }
  }
};
</script>

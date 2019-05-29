<template>
  <div class="collections">
    <v-header
      :breadcrumb="[
        {
          name: $t('collections'),
          path: '/collections'
        }
      ]"
      icon="box"
    />
    <v-error
      v-if="items.length === 0"
      :title="$t('no_collections')"
      :body="$t('no_collections_body')"
      icon="error_outline"
    />
    <div v-else class="padding">
      <v-table
        :items="items"
        :columns="fields"
        primary-key-field="collection"
        link="__link__"
        @select="select"
      />
    </div>
  </div>
</template>

<script>
import VError from "../components/error.vue";

export default {
  name: "Collections",
  metaInfo() {
    return {
      title: this.$t("collections")
    };
  },
  components: {
    VError
  },
  computed: {
    items() {
      if (this.collections == null) return [];

      return Object.values(this.collections)
        .filter(
          collection =>
            collection.hidden == false &&
            collection.managed == true &&
            collection.collection.startsWith("directus_") === false
        )
        .filter(collection => {
          if (collection.status_mapping) {
            return _.some(
              this.permissions[collection.collection].statuses,
              permission => permission.read !== "none"
            );
          }

          return this.permissions[collection.collection].read !== "none";
        })
        .map(collection => ({
          ...collection,
          collection: this.$t(`collections-${collection.collection}`),
          __link__: `/collections/${collection.collection}`
        }));
    },
    fields() {
      return [
        {
          field: "collection",
          name: this.$t("collection")
        },
        {
          field: "note",
          name: this.$t("note")
        }
      ];
    },
    collections() {
      return this.$store.state.collections;
    },
    permissions() {
      return this.$store.state.permissions;
    }
  },
  methods: {
    select(selection) {
      this.selection = selection;
    }
  }
};
</script>

<style lang="scss" scoped>
.collections {
  padding-bottom: var(--page-padding-bottom);
}

.padding {
  padding: 0 32px;
}
</style>

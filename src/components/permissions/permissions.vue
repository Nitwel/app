<template>
  <div class="v-permissions interface loading" v-if="loading">
    <v-spinner line-fg-color="var(--light-gray)" line-bg-color="var(--lighter-gray)" />
  </div>
  <div v-else class="interface">
    <div class="v-permissions">
      <v-permissions-header @toggle-all="toggleAll" />

      <div class="body">
        <v-notice v-if="Object.keys(rows).length === 0" color="gray" class="no-collections-message">
          {{ $t("permissions_no_collections") }}
        </v-notice>

        <v-permissions-row
          v-for="(permission, name) in rows"
          :permission="permission"
          :permission-name="name"
          :statuses="(statuses[name] || {}).mapping"
          :key="name"
          :fields="fields[name]"
          @input="$emit('input', $event)"
        />

        <template v-if="showDirectus">
          <v-permissions-row
            v-for="(permission, name, i) in directusRows"
            :class="{ border: i === 0 }"
            :permission="permission"
            :permission-name="name"
            :statuses="(statuses[name] || {}).mapping"
            :key="name"
            :fields="fields[name]"
            system
            @input="$emit('input', $event)"
          />
        </template>
      </div>
    </div>
    <label>
      <v-toggle class="toggle" id="toggle-directus" v-model="showDirectus" />
      {{ $t("show_directus_collections") }}
    </label>
  </div>
</template>

<script>
import VPermissionsHeader from "./permissions-header.vue";
import VPermissionsRow from "./permissions-row.vue";

export default {
  name: "v-permissions",
  data() {
    return {
      showDirectus: false
    };
  },
  components: {
    VPermissionsHeader,
    VPermissionsRow
  },
  props: {
    permissions: {
      type: Object,
      default: () => ({})
    },
    statuses: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    directusRows() {
      const permissions = this.$lodash.pickBy(this.permissions, (permission, collection) =>
        collection.startsWith("directus_")
      );

      return this.$lodash(permissions)
        .toPairs()
        .sortBy(0)
        .fromPairs()
        .value();
    },
    rows() {
      const permissions = this.$lodash.pickBy(
        this.permissions,
        (permission, collection) => collection.startsWith("directus_") === false
      );

      return this.$lodash(permissions)
        .toPairs()
        .sortBy(0)
        .fromPairs()
        .value();
    }
  },
  methods: {
    toggleAll(permission) {
      const changes = [];
      let full = true;

      this.$lodash.forEach(this.permissions, (column, collection) => {
        if (collection.startsWith("directus_")) return;
        if (this.statuses[collection]) {
          this.$lodash.forEach(column, statusColumn => {
            if (statusColumn[permission] === "full") {
              full = false;
            }
          });
          return;
        }

        if (column[permission] === "full") {
          full = false;
        }
      });

      Object.keys(this.permissions).forEach(collection => {
        if (collection.startsWith("directus_")) return;

        if (this.statuses[collection]) {
          return Object.keys(this.statuses[collection].mapping).forEach(status => {
            changes.push({
              collection,
              status,
              permission,
              value: full ? "full" : "none"
            });
          });
        }

        changes.push({
          collection,
          permission,
          value: full ? "full" : "none"
        });
      });

      this.$emit("input", changes);
    }
  }
};
</script>
<style lang="scss" scoped>
.interface {
  margin-bottom: 40px;
}
.v-permissions {
  background-color: var(--white);
  border-radius: var(--border-radius);
  border: var(--input-border-width) solid var(--lighter-gray);
  max-width: 632px;
  .no-collections-message {
    margin-top: 20px;
    margin-bottom: 40px;
  }

  ::v-deep .body .row {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 40px;
    &.sub {
      &::before {
        content: "call_missed_outgoing";
        font-family: "Material Icons";
        position: absolute;
        transform: rotate(45deg);
        font-size: 18px;
        color: var(--lighter-gray);
      }
      & .cell:first-child {
        padding-left: 2rem;
      }
    }
    &:not(.sub) {
      border-top: 1px solid var(--lightest-gray);
    }
  }
  ::v-deep .cell {
    flex-basis: 44px;
    &:first-child {
      flex-grow: 2;
    }
    &:nth-last-child(3) {
      flex-basis: 50px;
    }
    &:nth-last-child(2) {
      flex-basis: 90px;
    }
    &:last-child {
      flex-basis: 100px;
    }
  }
  .border {
    border-top: 1px solid var(--lightest-gray);
  }
  &.loading {
    padding: 300px 0;
  }
}
label {
  display: flex;
  cursor: pointer;
  align-items: center;
  margin-top: 10px;
  .toggle {
    margin-right: 5px;
  }
}
</style>

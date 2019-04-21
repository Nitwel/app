<template>
  <div class="settings">
    <v-header :breadcrumb="links" icon="settings" icon-color="warning" />

    <v-details :title="$t('settings_project')" type="break" open>
      <nav>
        <ul>
          <v-card
            :title="$t('settings_global')"
            :subtitle="$tc('item_count', globalNum, { count: globalNum })"
            element="li"
            to="/settings/global"
            icon="public"
          />

          <v-card
            :title="$t('settings_collections_fields')"
            :subtitle="$tc('collection_count', collectionsNum, { count: collectionsNum })"
            element="li"
            to="/settings/collections"
            icon="box"
          />

          <v-card
            :title="$t('settings_permissions')"
            :subtitle="roleCount"
            element="li"
            to="/settings/roles"
            icon="group"
          />

          <v-card
            :title="$t('settings_update_database')"
            :subtitle="$t('settings_update_database_subtext')"
            element="li"
            icon="update"
            @click="updateDBActive = true"
          />
        </ul>
      </nav>
    </v-details>

    <v-details :title="$t('additional_info')" type="break" open>
      <nav>
        <ul>
          <v-card
            :title="$t('interfaces')"
            :subtitle="$tc('interface_count', interfaceCount, { count: interfaceCount })"
            element="li"
            to="/settings/interfaces"
            icon="extension"
          />

          <v-card
            :title="$t('activity_log')"
            :subtitle="activityCount"
            element="li"
            to="/activity"
            icon="warning"
          />

          <v-card
            :title="$t('about_directus')"
            :subtitle="$t('learn_more')"
            element="li"
            href="https://directus.io"
            icon="info_outline"
          />

          <v-card
            :title="$t('report_issue')"
            :subtitle="$t('open_on_gh')"
            element="li"
            href="https://github.com/directus/app/issues/new?template=Bug_report.md"
            icon="bug_report"
          />

          <v-card
            :title="$t('request_feature')"
            :subtitle="$t('open_on_gh')"
            element="li"
            href="https://github.com/directus/app/issues/new?template=Feature_request.md"
            icon="how_to_vote"
          />
        </ul>
      </nav>
    </v-details>
    <v-details :title="$t('coming_soon')" type="break" open>
      <nav>
        <ul>
          <v-card
            :title="$t('connection')"
            :subtitle="
              `${$t('latency')}: ${$n(
                Math.round($store.state.latency[$store.state.latency.length - 1].latency)
              )}ms`
            "
            disabled
            element="li"
          >
            <v-signal slot="icon" class="signal" />
          </v-card>

          <v-card
            :title="$t('server_details')"
            disabled
            :subtitle="projectName"
            element="li"
            icon="storage"
          />

          <v-card
            :title="$t('version_and_updates')"
            disabled
            :subtitle="version"
            element="li"
            icon="update"
          />
        </ul>
      </nav>
    </v-details>

    <portal to="modal" v-if="updateDBActive">
      <v-confirm
        :message="$t('settings_update_database_confirm')"
        :confirm-text="$t('update')"
        :loading="updateDBInProgress"
        @confirm="updateDB"
        @cancel="updateDBActive = false"
      />
    </portal>
  </div>
</template>

<script>
import { version } from "../../../package.json";
import VSignal from "../../components/signal.vue";

export default {
  name: "settings",
  metaInfo() {
    return {
      title: `${this.$t("settings")}`
    };
  },
  components: {
    VSignal
  },
  data() {
    return {
      roleCount: "Loading...",
      activityCount: "Loading...",
      updateDBActive: false,
      updateDBInProgress: false
    };
  },
  computed: {
    globalNum() {
      return Object.keys(this.$store.state.collections.directus_settings.fields).length;
    },
    collectionsNum() {
      return Object.keys(this.$store.state.collections).filter(
        name => name.startsWith("directus_") === false
      ).length;
    },
    projectName() {
      return this.$store.state.auth.projectName;
    },
    interfaceCount() {
      return Object.keys(this.$store.state.extensions.interfaces).length;
    },
    version() {
      return version;
    },
    links() {
      return [
        {
          name: this.$t("settings"),
          path: "/settings"
        }
      ];
    }
  },
  created() {
    this.getRoleCount();
    this.getActivityCount();
  },
  methods: {
    getRoleCount() {
      this.$api
        .getItems("directus_roles", {
          fields: "-",
          limit: 0,
          meta: "total_count"
        })
        .then(res => res.meta)
        .then(({ total_count }) => {
          this.roleCount = this.$tc("role_count", total_count, {
            count: this.$n(total_count)
          });
        })
        .catch(() => {
          this.roleCount = "--";
        });
    },
    getActivityCount() {
      this.$api
        .getItems("directus_activity", {
          fields: "-",
          limit: 0,
          meta: "total_count"
        })
        .then(res => res.meta)
        .then(({ total_count }) => {
          this.activityCount = this.$tc("event_count", total_count, {
            count: this.$n(total_count)
          });
        })
        .catch(() => {
          this.activityCount = "--";
        });
    },
    updateDB() {
      this.updateDBInProgress = true;

      this.$api
        .updateDatabase()
        .then(() => {
          this.updateDBInProgress = false;
          this.updateDBActive = false;
          this.$notify({
            title: this.$t("db_updated"),
            color: "green",
            iconMain: "check"
          });
        })
        .catch(error => {
          this.updateDBInProgress = false;
          this.$events.emit("error", {
            notify: this.$t("db_update_failed"),
            error
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.settings {
  padding: var(--page-padding);
}

nav ul {
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, 140px);
  grid-gap: 20px;

  li {
    display: block;
  }
}

.signal {
  fill: var(--white);
}
</style>

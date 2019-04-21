<template>
  <div class="user-menu">
    <header>
      <v-avatar :src="avatarURL" :alt="fullName" :indicator="true" class="avatar" />
      <span class="no-wrap">{{ fullName }}</span>
      <v-icon name="expand_more" />
    </header>
    <div class="links">
      <nav-menu :links="userLinks" class="menu" />
      <hr />
      <button class="sign-out" @click="confirmSignOut = true">
        <v-icon name="exit_to_app" />
        {{ $t("sign_out") }}
      </button>
    </div>

    <portal to="modal" v-if="confirmSignOut">
      <v-confirm
        :busy="confirmSignOutLoading"
        :message="editing ? $t('sign_out_confirm_edits') : $t('sign_out_confirm')"
        :confirm-text="$t('sign_out')"
        @cancel="confirmSignOut = false"
        @confirm="signOut"
      />
    </portal>
  </div>
</template>

<script>
import NavMenu from "./nav-menu.vue";

export default {
  name: "user-menu",
  components: {
    NavMenu
  },
  data() {
    return {
      confirmSignOut: false,
      confirmSignOutLoading: false
    };
  },
  computed: {
    avatarURL() {
      if (this.$store.state.currentUser.avatar) {
        return this.$store.state.currentUser.avatar.data.full_url;
      }

      return null;
    },
    currentUserID() {
      return this.$store.state.currentUser && this.$store.state.currentUser.id;
    },
    editing() {
      return this.$store.getters.editing;
    },
    email() {
      return this.$store.state.currentUser && this.$store.state.currentUser.email;
    },
    fullName() {
      const firstName = this.$store.state.currentUser && this.$store.state.currentUser.first_name;

      const lastName = this.$store.state.currentUser && this.$store.state.currentUser.last_name;

      return `${firstName} ${lastName}`;
    },
    permissions() {
      return this.$store.state.permissions;
    },
    userLinks() {
      const links = [];

      if (this.$store.state.currentUser.admin === true) {
        links.push({
          path: "/settings",
          name: this.$t("admin_settings"),
          target: "_self",
          icon: "settings",
          color: "warning"
        });
      }

      links.push({
        path: "https://docs.directus.io",
        name: this.$t("help_and_docs"),
        target: "_blank",
        icon: "help"
      });

      if (this.permissions.directus_files.read !== "none") {
        links.push({
          path: "/files",
          name: this.$t("file_library"),
          target: "_self",
          icon: "collections"
        });
      }

      if (
        this.permissions.directus_users.read !== "none" ||
        this.permissions.directus_users.read !== "mine"
      ) {
        links.push({
          path: "/users",
          name: this.$t("user_directory"),
          target: "_self",
          icon: "people"
        });
      }

      links.push({
        path: `/users/${this.currentUserID}`,
        name: this.$t("my_profile"),
        target: "_self",
        icon: "account_circle"
      });

      return links;
    }
  },
  methods: {
    signOut() {
      this.confirmSignOutLoading = true;
      this.$store.dispatch("logout");
    }
  }
};
</script>

<style lang="scss" scoped>
.user-menu {
  padding: 0 20px 10px;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  transform: translateY(calc(100% - var(--header-height)));
  transition: transform var(--medium) var(--transition-out);
  will-change: transform;
  background-color: var(--lightest-gray);

  &:hover,
  .user-is-tabbing &:focus,
  .user-is-tabbing &:focus-within {
    transform: translateY(0);
    transition: transform var(--slow) var(--transition-in);

    &:before {
      opacity: 1;
    }
  }

  header {
    position: sticky;
    top: 0;
    padding: 10px 20px;
    margin-bottom: 10px;
    z-index: +1;
    display: flex;
    align-items: center;
    background-color: #dde3e6;
    margin-left: -20px;
    margin-right: -20px;

    .avatar {
      margin-right: 10px;
      flex-shrink: 0;
    }

    > i {
      position: absolute;
      right: 10px;
      color: var(--light-gray);
    }
  }
  .warning {
    a,
    i {
      color: var(--warning);
    }
  }

  .warning:hover {
    a,
    i {
      color: var(--warning-dark);
    }
  }

  .icon {
    width: 20px;
    height: 22px;
    margin-right: 15px;
    color: var(--darker-gray);
    fill: var(--darker-gray);

    /* Forces left-alignment of material-icons */
    display: inline-flex;
    justify-content: flex-end;
    align-items: center;
    vertical-align: -7px;
  }

  button.sign-out {
    width: 100%;
    text-align: left;
    padding: 8px 0 8px 10px;
  }

  .sign-out:hover,
  .user-is-tabbing .sign-out:focus {
    background-color: #dde3e6; // rgba(var(--lighter-gray), 0.5);
    border-radius: var(--border-radius);

    .icon {
      color: currentColor;
      fill: currentColor;
    }
  }
}

.menu >>> nav {
  margin-bottom: 0;
}

hr {
  border: 0;
  border-top: 2px solid var(--lighter-gray);
  margin-bottom: 10px;
}
</style>

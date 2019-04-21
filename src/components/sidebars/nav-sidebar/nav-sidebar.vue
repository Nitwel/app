<template>
  <div class="nav-sidebar">
    <v-blocker v-show="active" class="blocker" @click="disableNav" :z-index="2" />
    <transition name="nav">
      <aside :class="{ active }">
        <button class="a11y-close" @click="disableNav">Close nav</button>

        <v-logo class="logo" />

        <section class="content">
          <project-switcher />

          <template v-for="section in navStructure">
            <nav-bookmarks
              class="menu-section"
              v-if="section.include && section.include === 'bookmarks' && bookmarks.length > 0"
              :bookmarks="bookmarks"
              :key="section.id"
            />
            <nav-menu
              class="menu-section"
              v-else-if="section.include && section.include === 'collections'"
              :title="$t('collections')"
              :links="linksCollections"
              :key="section.id"
            />
            <nav-menu
              class="menu-section"
              v-else-if="section.include && section.include === 'extensions'"
              :title="$t('extensions')"
              :links="linksExtensions"
              :key="section.id"
            />
            <nav-menu
              class="menu-section"
              v-else
              :title="section.title"
              :links="section.links ? section.links : []"
              :key="section.id"
            />
          </template>
        </section>
        <user-menu />
      </aside>
    </transition>
  </div>
</template>
<script>
import VLogo from "./logo.vue";
import ProjectSwitcher from "./project-switcher.vue";
import NavMenu from "./nav-menu.vue";
import UserMenu from "./user-menu.vue";
import NavBookmarks from "./nav-bookmarks.vue";
import VBlocker from "../../blocker.vue";
import { TOGGLE_NAV } from "../../../store/mutation-types";

export default {
  name: "nav-sidebar",
  components: {
    VLogo,
    ProjectSwitcher,
    NavMenu,
    UserMenu,
    NavBookmarks,
    VBlocker
  },
  computed: {
    permissions() {
      return this.$store.state.permissions;
    },
    collections() {
      const collections = this.$store.state.collections;

      if (collections == null) return [];

      return Object.values(collections)
        .filter(
          collection =>
            collection.hidden == false &&
            collection.managed == true &&
            collection.collection.startsWith("directus_") === false
        )
        .filter(collection => {
          if (collection.status_mapping && this.permissions[collection.collection].statuses) {
            return this.$lodash.some(
              this.permissions[collection.collection].statuses,
              permission => permission.read !== "none"
            );
          }

          return this.permissions[collection.collection].read !== "none";
        });
    },
    projectName() {
      return this.$store.state.auth.projectName;
    },
    active() {
      return this.$store.state.sidebars.nav;
    },
    bookmarks() {
      return this.$store.state.bookmarks;
    },

    // This is the default structure of the navigation pane
    // By default it will list collections, bookmarks, and extensions
    // This is the thing that will be overridden by the nav_override field
    // in directus_roles
    defaultNavStructure() {
      return [
        {
          title: "$t:collections",
          include: "collections"
        },
        {
          title: "$t:bookmarks",
          include: "bookmarks"
        },
        {
          title: "$t:extensions",
          include: "extensions"
        }
      ];
    },

    // The structure of the navigation. Will return the stored value for the role
    // nav override or the default structure above if it isn't set
    // It will also replace the `includes` with links for the actual sections
    navStructure() {
      const userRole = this.$store.state.currentUser.roles[0];
      const navOverride = userRole.nav_override;

      return navOverride || this.defaultNavStructure;
    },

    linksCollections() {
      return this.collections.map(({ collection, icon }) => ({
        path: `/collections/${collection}`,
        name: this.$t(`collections-${collection}`),
        icon
      }));
    },

    linksExtensions() {
      const links = [];
      const pages = this.$store.state.extensions.pages;

      this.$lodash.forEach(pages, (info, key) => {
        links.push({
          path: `/ext/${key}`,
          name: info.name,
          icon: info.icon
        });
      });

      return links;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
    },
    deleteBookmark(id) {
      this.$store.dispatch("deleteBookmark", id);
    },
    toBookmark(bookmark) {
      /* eslint-disable camelcase */
      const { collection, search_query, filters, view_options, view_type, view_query } = bookmark;

      this.$store
        .dispatch("setListingPreferences", {
          collection,
          updates: {
            search_query,
            filters,
            view_options,
            view_type,
            view_query
          }
        })
        .then(() => {
          this.$router.push(`/collections/${collection}`);
        });
    },
    disableNav() {
      this.$store.commit(TOGGLE_NAV, false);
    }
  }
};
</script>

<style lang="scss" scoped>
aside {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 30;
  width: 100%;
  max-width: 80%;
  background-color: var(--lightest-gray);
  color: var(--darker-gray);

  transform: translateX(-100%);
  visibility: hidden;
  transition: transform var(--slow) var(--transition-out),
    visibility 0ms var(--transition-out) var(--slow);

  &.active {
    transform: translateX(0);
    transition: transform var(--slow) var(--transition-in);
    visibility: visible;
  }

  @media (min-width: 800px) {
    transform: translateX(0);
    transition: none;
    visibility: visible;
    max-width: var(--nav-sidebar-width);
  }

  > div {
    height: 100%;
  }

  & .a11y-close {
    position: absolute;
    z-index: 15;
    left: -999px;
    background-color: yellow;
    padding: 5px;

    .user-is-tabbing &:focus {
      top: 13px;
      left: 13px;
    }

    @media (min-width: 800px) {
      display: none;
    }
  }
}

.content {
  position: relative;
  padding: 20px;
  padding-top: 0;
  height: calc(100% - var(--header-height) - var(--header-height));
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.menu-section + .menu-section {
  border-top: 2px solid var(--lighter-gray);
  padding-top: 20px;
}
</style>

<style>
@media (min-width: 800px) {
  body {
    padding-left: var(--nav-sidebar-width);
  }
}
</style>

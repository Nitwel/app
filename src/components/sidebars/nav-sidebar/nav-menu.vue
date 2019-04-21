<template>
  <div class="nav-menu" v-if="links.length > 0">
    <nav>
      <ul>
        <li v-for="{ path, name, target, icon, color } in links" :key="path">
          <template v-if="path.startsWith('http')">
            <a :href="path" :class="color || null" :target="target">
              <v-icon class="icon" :name="icon || 'box'" color="darker-gray" />
              {{ name }}
            </a>
          </template>
          <router-link v-else-if="path" :to="path" :class="color || null">
            <v-icon class="icon" :name="icon || 'box'" color="darker-gray" />
            {{ name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "nav-menu",
  props: {
    title: {
      type: String,
      default: null
    },
    links: {
      type: Array,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
h3 {
  margin-bottom: 5px;
  margin-top: 15px;
}

.icon {
  margin-right: 15px;
}

a {
  text-decoration: none;
  display: block;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

a:hover,
.content .router-link-active,
.user-menu .router-link-exact-active {
  background-color: #dde3e6; // rgba(var(--lighter-gray), 0.5);
  border-radius: var(--border-radius);

  .icon {
    color: currentColor;
    fill: currentColor;
  }
}

.content .router-link-active,
.user-menu .router-link-exact-active {
  &::before {
    transform: scaleX(1);
    transition: var(--medium) var(--transition-in);
  }
}

ul {
  list-style: none;
  padding: 0;
}

nav > ul > li > * {
  padding: 8px 0 8px 10px;
  margin: 2px 0;
}

nav {
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.success {
  color: var(--success);

  a:hover,
  .content .router-link-active,
  .user-menu .router-link-exact-active {
    color: var(--success-dark);

    &::before {
      background-color: var(--success);
    }
  }
}

.warning {
  color: var(--warning);

  &:hover,
  .content &.router-link-active,
  .user-menu &.router-link-exact-active {
    color: var(--warning-dark);

    &::before {
      background-color: var(--warning);
    }
  }
}

.danger {
  color: var(--danger);
}

.accent,
.success,
.warning,
.danger {
  .icon {
    color: currentColor;
    fill: currentColor;
  }
}
</style>

<template>
  <div
    class="project-switcher"
    :class="{
      'is-active': $store.state.auth.projectName !== selectionName || !$store.state.auth.project,
      'has-error': !$store.state.auth.project
    }"
  >
    <div
      class="content"
      :class="{
        slow: $store.getters.signalStrength === 1,
        disconnected: $store.getters.signalStrength === 0
      }"
      v-tooltip.left="{
        content:
          (!!$store.state.auth.url ? $store.state.auth.url : 'No connection') +
          `<br>${$t('latency')}: ${
            !!$store.state.auth.url
              ? $n(Math.round($store.state.latency[$store.state.latency.length - 1].latency))
              : ' - '
          }ms`,
        boundariesElement: 'body'
      }"
    >
      <v-signal class="icon" />
      <span class="no-wrap project-name">
        {{ selectionName ? selectionName : $store.state.auth.projectName }}
      </span>
      <v-icon v-if="Object.keys(urls).length > 1" class="chevron" name="expand_more" />
      <select v-if="Object.keys(urls).length > 1" :value="currentUrl" @change.prevent="changeUrl">
        <option
          v-for="(name, url) in urls"
          :key="name + url"
          :name="name"
          :value="url"
          @click="changeUrl"
          :selected="url === currentUrl || url + '/' === currentUrl"
        >
          {{ name }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import VSignal from "../../signal.vue";

export default {
  name: "project-switcher",
  components: {
    VSignal
  },
  data() {
    return {
      active: false,
      selectionUrl: null,
      selectionName: ""
    };
  },
  computed: {
    urls() {
      return this.$lodash.mapKeys(window.__DirectusConfig__.api, (val, key) =>
        key.endsWith("/") === false ? key + "/" : key
      );
    },
    currentUrl() {
      return this.$store.state.auth.url + "/" + this.$store.state.auth.project + "/";
    }
  },
  methods: {
    changeUrl(event) {
      const newUrl = event.target.value;
      const newName = window.__DirectusConfig__.api[newUrl]
        ? window.__DirectusConfig__.api[newUrl]
        : this.$store.state.auth.projectName;

      this.selectionUrl = newUrl;
      this.selectionName = newName;

      this.$store
        .dispatch("switchProject", {
          projectName: newName,
          url: newUrl
        })
        .then(() => this.$store.dispatch("changeAPI", newUrl));
    }
  }
};
</script>

<style lang="scss" scoped>
.project-switcher > div {
  height: var(--header-height);
  width: calc(100% + 40px);
  display: flex;
  align-items: center;
  margin: 0 -20px 20px;
  padding: 0 30px;
  position: relative;
  background-color: #dde3e6; // rgba(var(--lighter-gray), 0.5);

  .content {
    padding: 8px 0 8px 10px;
  }

  &.slow {
    svg {
      transition: color 0.25s ease-in-out, fill 0.25s ease-in-out;
    }

    &.slow {
      svg {
        fill: var(--warning);
      }
    }

    &.disconnected {
      svg {
        fill: var(--danger);
      }
    }

    svg {
      fill: var(--darkest-gray);
    }

    i {
      color: var(--darkest-gray);
    }

    svg {
      fill: var(--darker-gray);
    }

    i {
      color: var(--light-gray);
    }

    &.has-error {
      > div {
        svg {
          fill: var(--red);
        }
      }
      span {
        color: var(--red);
        + i {
          color: var(--red);
        }
      }
    }
  }

  .icon {
    flex-shrink: 0;
    width: 21px;
    height: 24px;
    margin-right: 21px;
    color: var(--light-gray);
    fill: var(--light-gray);
  }

  .project-name {
    padding-right: 12px;
  }

  .chevron {
    position: absolute;
    right: 10px;
    color: var(--light-gray);
  }

  select {
    position: absolute;
    opacity: 0;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
}
</style>

<template>
  <div
    v-tooltip="{
      delay: { show: 750, hide: 100 },
      content: label
    }"
    class="v-header-button"
  >
    <v-contextual-menu
      v-if="Object.keys(options).length > 0"
      class="options"
      placement="bottom-start"
      :options="options"
      @click="emitChange"
    ></v-contextual-menu>
    <component
      :is="disabled ? 'button' : to ? 'router-link' : 'button'"
      :style="{
        backgroundColor: noBackground || disabled ? null : `var(--${color})`,
        color: `var(--${color})`,
        '--hover-color': hoverColor ? `var(--${hoverColor})` : null
      }"
      :class="{ attention: alert, 'no-bg': noBackground, 'has-bg': hoverColor }"
      class="button"
      :disabled="disabled"
      :to="to || null"
      @click="!to ? $emit('click', $event) : null"
    >
      <v-spinner v-if="loading" :size="24" line-fg-color="white" line-bg-color="transparent" />
      <v-icon v-else :style="{ color: `var(--${iconColor})` }" :name="icon" />
    </component>
  </div>
</template>

<script>
export default {
  name: "VHeaderButton",
  props: {
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: "gray"
    },
    hoverColor: {
      type: String,
      default: null
    },
    iconColor: {
      type: String,
      default: "white"
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },
    alert: {
      type: Boolean,
      default: false
    },
    noBackground: {
      type: Boolean,
      default: false
    },
    to: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      choice: null
    };
  },
  methods: {
    emitChange(event) {
      this.$emit("input", event);
      this.choice = null;
    }
  }
};
</script>

<style scoped lang="scss">
.v-header-button {
  position: relative;
  height: calc(var(--header-height) - 20px);
  width: calc(var(--header-height) - 20px);
  min-width: calc(var(--header-height) - 20px);
  display: inline-block;
  margin-left: 16px;
}

.button {
  transition: background-color var(--fast) var(--transition);
}

.button.has-bg:hover:not([disabled]) {
  background-color: var(--hover-color) !important;
}

button,
a {
  position: relative;
  background-color: transparent;
  border: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  border-radius: 100%;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;

  i {
    transition: 100ms var(--transition);
    color: var(--white);
  }

  span {
    position: absolute;
    bottom: 2px;
    opacity: 0;
    transform: translateY(5px);
    transition: 100ms var(--transition-out);
    font-size: 10px;
  }

  &:hover:not([disabled]) span,
  .user-is-tabbing &:focus span {
    opacity: 0.6;
    transform: translateY(0);
    transition: 100ms var(--transition-in);
  }

  &:not([disabled]):active i {
    transform: scale(0.9);
    opacity: 0.8;
  }

  &::after {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    background-color: var(--warning);
    border-radius: 50%;
    position: absolute;
    top: 27%;
    right: 27%;
    border: 2px solid currentColor;
    transform: scale(0);
    transition: transform var(--fast) var(--transition-out);
  }

  &.attention::after {
    transform: scale(1);
    transition: transform var(--fast) var(--transition-in);
  }
}

button.no-bg {
  border: 2px solid var(--lighter-gray);
  background-color: transparent;
  i {
    color: var(--lighter-gray);
  }
}

button[disabled] {
  background-color: var(--lighter-gray) !important;
  cursor: not-allowed;
  i {
    color: var(--lightest-gray) !important;
  }
}

.options {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: absolute;
  overflow: hidden;
  right: -20px;
  z-index: +1;
}
</style>

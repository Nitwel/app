<template>
  <div v-if="options !== null">
    <v-popover placement="right-start" offset="2">
      <button type="button" class="menu-toggle" :disabled="disabled">
        <v-icon name="more_vert" />
      </button>

      <template slot="popover">
        <ul class="ctx-menu">
          <li v-for="({ text, icon }, id) in options" :key="id">
            <button v-close-popover type="button" @click="emitOptionClick(id)">
              <v-icon v-if="icon" :name="icon"></v-icon>
              {{ text }}
            </button>
          </li>
        </ul>
      </template>
    </v-popover>
  </div>
</template>

<script>
export default {
  name: "VContextualMenu",
  props: {
    options: {
      type: Object,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    parentEmit: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    emitOptionClick(id) {
      this.$emit(id);
      if (this.parentEmit) {
        this.$parent.$emit(id);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.menu-toggle {
  width: 16px;
  color: var(--lighter-gray);
  transition: color var(--fast) var(--transition);
  &:hover {
    color: var(--darker-gray);
    transition: none;
  }
}
.ctx-menu {
  list-style: none;
  padding: 0;
  width: var(--width-small);
  li {
    display: block;
  }
  i {
    color: var(--light-gray);
    margin-right: 5px;
    transition: color var(--fast) var(--transition);
  }
  button {
    display: flex;
    align-items: center;
    padding: 5px;
    color: var(--darker-gray);
    width: 100%;
    height: 100%;
    transition: color var(--fast) var(--transition);
    &:hover {
      color: var(--accent);
      transition: none;
      i {
        color: var(--accent);
        transition: none;
      }
    }
  }
}
</style>

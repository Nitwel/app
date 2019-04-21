<template>
  <div class="v-toggle" :class="{ disabled }" @click="emitValue">
    <input
      type="checkbox"
      :id="id"
      :disabled="disabled"
      :checked="value"
      @change="$emit('input', !value)"
    />
    <div class="switch-track" :class="{ active: value }" />
    <div class="switch-thumb" :class="{ active: value }" />
  </div>
</template>

<script>
export default {
  name: "v-toggle",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: null
    }
  },
  methods: {
    emitValue() {
      if (this.disabled) return;
      this.$emit("input", !this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
.v-toggle {
  padding: 3px;
  position: relative;
  cursor: pointer;
  width: max-content;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input {
  position: absolute;
  opacity: 0;
  left: -99999px;
}

.switch-track {
  &::after {
    content: "";
    display: block;
    height: 20px;
    width: 36px;
    background-color: transparent;
    border-radius: 12px;
    cursor: pointer;
    border: 2px solid var(--darker-gray);
  }

  &.active::after {
    background-color: var(--darker-gray);
  }
}

.switch-thumb {
  position: absolute;
  top: 8px;
  left: 8px;
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 7px;
  background-color: var(--darker-gray);
  transition: transform var(--fast) var(--transition);

  &.active {
    background-color: var(--white);
    transform: translateX(16px);
  }
}

input:disabled ~ .switch {
  background-color: var(--lightest-gray);

  &::after {
    background-color: var(--lighter-gray);
  }
}
</style>

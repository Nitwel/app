<template>
  <div v-if="checkbox" class="checkbox">
    <input
      type="checkbox"
      :disabled="readonly"
      :id="name"
      @change="updateValue($event.target.checked)"
    />
    <label :for="name">
      <v-icon :name="icon" class="icon" />
      {{ label }}
    </label>
  </div>

  <div v-else class="toggle" :class="{ on: value }">
    <v-toggle :value="value" @input="updateValue" :disabled="readonly" />
    <span>{{ label }}</span>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  mixins: [mixin],
  computed: {
    icon() {
      return this.value ? "check_box" : "check_box_outline_blank";
    },
    checkbox() {
      return this.options.checkbox || false;
    },
    label() {
      return this.value ? this.options.labelOn : this.options.labelOff;
    }
  },
  methods: {
    updateValue(value) {
      this.$emit("input", value);
    }
  }
};
</script>

<style lang="scss" scoped>
input {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0;
  z-index: 2;
  cursor: pointer;
}
.checkbox {
  position: relative;
  display: inline-block;
  .material-icons {
    margin-top: -2px;
  }
  label {
    transition: all var(--fast) var(--transition);
    color: var(--gray);
    padding: 0.5rem 0 0.5rem 0;
  }
  &:hover label {
    color: var(--darker-gray);
  }
  input:checked + label {
    color: var(--darkest-gray);
  }
  input:disabled + label {
    color: var(--light-gray);
  }
  input:disabled {
    cursor: not-allowed;
  }
}

.toggle {
  display: flex;
  align-items: center;

  span {
    text-transform: uppercase;
    margin-left: 4px;
    font-size: var(--size-3);
    font-weight: var(--weight-bold);
    color: var(--gray);
  }

  &.on span {
    color: var(--darker-gray);
  }
}
</style>

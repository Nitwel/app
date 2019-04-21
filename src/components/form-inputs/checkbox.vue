<template>
  <span class="form-checkbox">
    <input
      :id="id"
      :checked="shouldBeChecked"
      :value="value"
      type="checkbox"
      @change="updateInput"
    />
    <label :for="id" class="no-wrap">
      <v-icon :name="shouldBeChecked ? 'check_box' : 'check_box_outline_blank'" />
      {{ label }}
    </label>
  </span>
</template>

<script>
export default {
  name: "form-checkbox",
  model: {
    prop: "modelValue",
    event: "change"
  },
  props: {
    id: {
      type: String,
      default: ""
    },
    value: {
      type: [String, Number],
      required: true
    },
    modelValue: {
      type: null,
      default: false
    },
    label: {
      type: String,
      default: ""
    },
    trueValue: {
      type: null,
      default: true
    },
    falseValue: {
      type: null,
      default: false
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    shouldBeChecked() {
      if (Array.isArray(this.modelValue)) {
        return this.modelValue.includes(this.value);
      }

      return this.modelValue === this.trueValue || this.checked === true;
    }
  },
  methods: {
    updateInput(event) {
      const isChecked = event.target.checked;

      if (Array.isArray(this.modelValue)) {
        const newValue = [...this.modelValue];

        if (isChecked) {
          newValue.push(this.value);
        } else {
          newValue.splice(newValue.indexOf(this.value), 1);
        }

        this.$emit("change", newValue);
      } else {
        this.$emit("change", isChecked ? this.trueValue : this.falseValue);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

label {
  font-size: inherit;
  cursor: pointer;
  color: var(--dark-gray);

  &:hover:not(:disabled),
  .user-is-tabbing &:focus {
    color: var(--darker-gray);
  }
}

input:checked + label {
  color: var(--darker-gray);
}
</style>

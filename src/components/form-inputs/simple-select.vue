<template>
  <div class="v-simple-select">
    <select ref="selectElement" :value="value" :disabled="disabled" @change="stageValue">
      <option disabled :selected="value == null" value="">
        {{ placeholder || "--" }}
      </option>
      <slot />
    </select>
    <div class="preview">
      <template v-if="value">
        {{ valueText }}
      </template>
      <span v-else class="placeholder">{{ placeholder || "--" }}</span>
      <v-icon class="icon" name="arrow_drop_down" />
    </div>
  </div>
</template>

<script>
export default {
  name: "VSimpleSelect",
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      valueNames: {}
    };
  },
  computed: {
    valueText() {
      return this.valueNames[this.value];
    }
  },
  watch: {
    value() {
      this.getValueNames();
    }
  },
  mounted() {
    this.getValueNames();
  },
  methods: {
    stageValue(event) {
      this.$emit("input", event.target.value);
    },
    getValueNames() {
      const selectElement = this.$refs.selectElement;
      const valueNames = {};
      const children = Array.from(selectElement.querySelectorAll("option"));

      children.forEach(element => {
        valueNames[element.value] = element.innerText;
      });

      this.valueNames = valueNames;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-simple-select {
  position: relative;

  .preview {
    height: var(--input-height);
    border: var(--input-border-width) solid var(--lighter-gray);
    border-radius: var(--border-radius);
    background-color: var(--white);
    display: flex;
    align-items: center;
    padding-left: 10px;
    color: var(--gray);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    text-transform: none;

    .icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      user-select: none;
      pointer-events: none;
    }
  }

  select {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    appearance: none;
  }

  select:hover + .preview {
    border-color: var(--light-gray);
  }

  select:focus + .preview {
    border-color: var(--dark-gray);
    color: var(--dark-gray);
  }

  select[disabled] {
    cursor: not-allowed;

    & + .preview {
      background-color: var(--lightest-gray);
      border-color: var(--lighter-gray);
      color: var(--light-gray);
    }
  }
}
</style>

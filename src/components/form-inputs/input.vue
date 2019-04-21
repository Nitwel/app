<template>
  <div :class="{ 'icon-left': iconLeft, 'icon-right': iconRight }" class="v-input">
    <!-- Far from ideal, but it does the trick -->

    <input
      v-if="mask"
      v-mask="mask"
      ref="input"
      :class="{ charactercount }"
      :type="type"
      :autocomplete="autocomplete"
      :max="max"
      :maxlength="maxlength"
      :min="min"
      :minlength="minlength"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly || disabled"
      :spellcheck="spellcheck"
      :value="value"
      :id="id"
      :step="step"
      @keyup="$emit('keyup', $event)"
      @keydown="$emit('keydown', $event)"
      @input="$emit('input', $event.target.value)"
    />

    <input
      v-else
      ref="input"
      :class="{ charactercount }"
      :type="type"
      :autocomplete="autocomplete"
      :max="max"
      :maxlength="maxlength"
      :min="min"
      :minlength="minlength"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :readonly="readonly || disabled"
      :spellcheck="spellcheck"
      :value="value"
      :id="id"
      :step="step"
      @keyup="$emit('keyup', $event)"
      @keydown="$emit('keydown', $event)"
      @input="$emit('input', $event.target.value)"
    />

    <v-icon v-if="iconLeft" :name="iconLeft" :color="iconLeftColor" v-tooltip="iconLeftTooltip" />
    <v-icon
      v-if="iconRight"
      :name="iconRight"
      :color="iconRightColor"
      v-tooltip="iconRightTooltip"
    />

    <span v-if="charactercount">{{ charsRemaining }}</span>
  </div>
</template>

<script>
export default {
  name: "v-input",
  props: {
    type: {
      type: String,
      default: "text"
    },
    autocomplete: {
      type: String,
      default: "on"
    },
    autofocus: {
      type: Boolean,
      default: false
    },
    max: {
      type: [Number, Boolean, String],
      default: null
    },
    maxlength: {
      type: [Number, Boolean, String],
      default: null
    },
    min: {
      type: [Number, Boolean, String],
      default: null
    },
    minlength: {
      type: [Number, Boolean, String],
      default: null
    },
    name: {
      type: String,
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    spellcheck: {
      type: Boolean,
      default: true
    },
    id: {
      type: String,
      default: ""
    },
    value: {
      type: null,
      default: ""
    },
    step: {
      type: [String, Number],
      default: 1
    },
    iconLeft: {
      type: String,
      default: ""
    },
    iconLeftColor: {
      type: String,
      default: null
    },
    iconLeftTooltip: {
      type: String,
      default: ""
    },
    iconRight: {
      type: String,
      default: ""
    },
    iconRightColor: {
      type: String,
      default: null
    },
    iconRightTooltip: {
      type: String,
      default: ""
    },
    valid: {
      type: Boolean,
      default: true
    },
    charactercount: {
      type: Boolean,
      default: false
    },
    mask: {
      type: [String, Array, Boolean],
      default: null
    }
  },
  computed: {
    charsRemaining() {
      if (!this.maxlength) return null;
      return this.maxlength - this.value.length;
    }
  },
  mounted() {
    if (this.autofocus) {
      this.$refs.input.focus();
    }
  }
};
</script>

<style lang="scss" scoped>
.v-input {
  position: relative;

  input {
    width: 100%;
    border: var(--input-border-width) solid var(--lighter-gray);
    border-radius: var(--border-radius);
    color: var(--gray);
    padding: 10px;
    font-size: 1rem;
    line-height: 1.5;
    text-transform: none;
    transition: var(--fast) var(--transition);
    transition-property: color, border-color, padding;
    height: var(--input-height);

    &[type="date"] {
      -webkit-appearance: none;
    }
    &[type="date"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      display: none;
    }
    &::-webkit-clear-button {
      display: none; /* Hide the button */
      -webkit-appearance: none; /* turn off default browser styling */
    }

    &::placeholder {
      color: var(--lighter-gray);
    }

    &:hover:not(:read-only) {
      transition: none;
      border-color: var(--light-gray);
    }

    &:focus:not(:read-only) {
      color: var(--dark-gray);
      border-color: var(--dark-gray);
      outline: 0;
    }

    &:-webkit-autofill {
      box-shadow: inset 0 0 0 1000px var(--white) !important;
      color: var(--dark-gray) !important;
      -webkit-text-fill-color: var(--dark-gray) !important;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      border: var(--input-border-width) solid var(--lighter-gray);
      background-color: var(--white);
      box-shadow: inset 0 0 0 2000px var(--white);
    }

    &:read-only {
      background-color: var(--lightest-gray);
      border-color: var(--lighter-gray);
      cursor: not-allowed;
      &:focus {
        color: var(--gray);
        border-color: var(--lighter-gray);
      }
    }
  }

  span {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: var(--fast) var(--transition);
    color: var(--light-gray);
  }

  input.charactercount:focus {
    padding-right: 30px;
  }

  input:focus + span {
    opacity: 1;
  }

  &.icon-left input {
    padding-left: 38px;
  }

  &.icon-right input {
    padding-right: 38px;
  }

  &.icon-left i,
  &.icon-right i {
    position: absolute;
    top: 50%;
    color: var(--lighter-gray);
    transform: translateY(-50%);
    font-size: 24px;

    &.accent {
      color: var(--darkest-gray);
    }

    &.secondary {
      color: var(--secondary);
    }

    &.success {
      color: var(--success);
    }

    &.warning {
      color: var(--warning);
    }

    &.danger {
      color: var(--danger);
    }
  }

  &.icon-left i:first-of-type {
    left: 10px;
  }

  &.icon-right i:last-of-type {
    right: 10px;
  }
}
</style>

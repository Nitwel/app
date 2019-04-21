<template>
  <textarea
    :cols="cols"
    :disabled="disabled"
    :maxlength="maxlength"
    :minlength="minlength"
    :name="name"
    :id="id"
    :placeholder="placeholder"
    :readonly="readonly"
    :required="required"
    :rows="rows"
    :spellcheck="spellcheck"
    :wrap="wrap"
    :value="value"
    :autofocus="autofocus"
    class="v-textarea"
    @keydown="$emit('keydown', $event.target.value)"
    @input="$emit('input', $event.target.value)"
  />
</template>

<script>
export default {
  name: "v-textarea",
  props: {
    cols: {
      type: Number,
      default: 20
    },
    disabled: {
      type: Boolean,
      default: false
    },
    maxlength: {
      type: Number,
      default: null
    },
    minlength: {
      type: Number,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    id: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    rows: {
      type: Number,
      default: null
    },
    spellcheck: {
      type: Boolean,
      default: null
    },
    wrap: {
      type: String,
      default: null
    },
    value: {
      type: String,
      default: null
    },
    autofocus: {
      type: String,
      default: null
    }
  }
};
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  border: var(--input-border-width) solid var(--lighter-gray);
  border-radius: var(--border-radius);
  color: var(--gray);
  padding: 10px;
  line-height: 1.5;
  transition: var(--fast) var(--transition);
  transition-property: color, border-color;

  &::placeholder {
    color: var(--lighter-gray);
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

  &:hover:not(:read-only) {
    transition: none;
    border-color: var(--light-gray);
    outline: 0;
  }

  &:focus:not(:read-only) {
    color: var(--dark-gray);
    border-color: var(--dark-gray);
    outline: 0;
  }

  &:focus:not(:read-only) + i {
    color: var(--dark-gray);
  }

  &:-webkit-autofill {
    box-shadow: inset 0 0 0 1000px var(--white) !important;
    color: var(--dark-gray) !important;
    -webkit-text-fill-color: var(--dark-gray) !important;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus input:-webkit-autofill,
  textarea:-webkit-autofill,
  textarea:-webkit-autofill:hover textarea:-webkit-autofill:focus {
    border: var(--input-border-width) solid var(--lighter-gray);
    background-color: var(--white);
    box-shadow: inset 0 0 0 2000px var(--white);
  }
}
</style>

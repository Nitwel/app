<template>
  <draggable
    v-model="sortableList"
    element="div"
    class="interface-checkboxes"
    :class="{ draggable: options.draggable, single: options.single }"
    animation="200"
    ghost-class="ghost"
    :draggable="options.draggable ? '.sortable-box.sortable' : false"
    @end="saveSort"
  >
    <template v-for="item in sortableList">
      <div
        v-if="item.custom"
        :key="item.id"
        class="sortable-box custom-value"
        :class="{ sortable: options.draggable, checked: customChecked }"
      >
        <button @click="toggleCustom">
          <v-icon :name="customChecked ? 'check_box' : 'check_box_outline_blank'" />
        </button>
        <input :value="customValue" :placeholder="$t('other') + '...'" @input="updateCustom" />
      </div>

      <v-checkbox
        v-else
        :id="item.id + '-' + item.val"
        :key="item.id"
        name="list-sorting"
        class="sortable-box"
        :class="{ sortable: options.draggable }"
        :value="item.val"
        :disabled="readonly"
        :label="item.label"
        :checked="selection.includes(item.val)"
        @change="updateValue(item.val, $event)"
      />
    </template>
  </draggable>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";
import shortid from "shortid";

export default {
  name: "InterfaceCheckboxes",
  mixins: [mixin],

  data() {
    return {
      sortableList: [],
      customValue: "",
      customChecked: false
    };
  },

  computed: {
    // The currently saved selection. It's this.value converted to an array, and
    // adjusted for the wrapped `,` characters if applicable
    selection() {
      if (!this.value) return [];

      const value = _.clone(this.value);
      let selection;

      // Convert the value to an array
      if (typeof this.value === "string") {
        selection = value.split(",");
      } else {
        selection = value;
      }

      if (this.options.wrap) {
        selection.pop();
        selection.shift();
      }

      return selection;
    }
  },

  created() {
    const options = Object.keys(this.options.choices).map(key => ({
      val: key,
      label: this.options.choices[key]
    }));

    let sortableOptions;

    if (this.options.allow_other) {
      // The user's customly added value is the one value in the selection that doesn't have a preconfigured
      // label associated with it.
      const customValue = this.selection.filter(
        val => Object.keys(this.options.choices).includes(val) === false
      )[0];

      if (customValue) {
        this.customValue = customValue;
        this.customChecked = true;
      }
    }

    if (this.options.draggable) {
      // Convert the selected items and the choices into an array sorted by the
      // manual sort of the user.
      const selected = this.selection
        // Filter out the custom option so we don't add it double down below
        .filter(val => val !== this.customValue)
        .map(val => ({
          val: val,
          label: this.options.choices[val]
        }));

      const optionsWithoutSelection = options.filter(
        option => this.selection.includes(option.val) === false
      );

      sortableOptions = [...selected, ...optionsWithoutSelection];
    } else {
      sortableOptions = options;
    }

    // Add a unique ID to each sortable option so we can use that to key the items in the template
    sortableOptions = sortableOptions.map(item => ({
      ...item,
      id: shortid.generate(),
      custom: this.customValue === item.val
    }));

    if (this.options.allow_other) {
      sortableOptions.push({
        id: shortid.generate(),
        custom: true
      });
    }

    this.sortableList = sortableOptions;
  },

  methods: {
    updateValue(val) {
      let selection = _.clone(this.selection);

      if (selection.includes(val)) {
        selection.splice(selection.indexOf(val), 1);
      } else {
        selection.push(val);
      }

      if (this.options.wrap) {
        selection = ["", ...selection, ""];
      }

      this.$emit("input", selection);
    },

    saveSort() {
      const selection = _.clone(this.selection);

      let staged = this.sortableList
        // Get all the values of the sorted available checkboxes
        .map(s => {
          if (s.custom) return this.customValue;
          return s.val;
        })
        // Only leave the ones that are selected
        .filter(s => selection.includes(s));

      if (this.options.wrap) {
        staged = ["", ...staged, ""];
      }

      return this.$emit("input", staged);
    },

    updateCustom(event) {
      const currentValue = _.clone(this.customValue);
      const newValue = event.target.value;

      if (newValue.length === 0) {
        this.customValue = null;
        this.customChecked = false;
      } else {
        this.customValue = newValue;
        this.customChecked = true;
      }

      let selection = _.clone(this.selection);

      if (selection.includes(currentValue)) {
        const index = selection.indexOf(currentValue);
        selection[index] = newValue;
      } else {
        selection = [...selection, newValue];
      }

      if (this.options.wrap) {
        selection = ["", ...selection, ""];
      }

      this.$emit("input", selection);
    },

    toggleCustom() {
      this.customChecked = !this.customChecked;

      let selection = _.clone(this.selection);
      const customValue = _.clone(this.customValue);

      if (this.customChecked && customValue.length > 0) {
        selection = [...selection, customValue];
      } else {
        selection = selection.filter(val => val !== customValue);
      }

      if (this.options.wrap) {
        selection = ["", ...selection, ""];
      }

      this.$emit("input", selection);
    }
  }
};
</script>

<style lang="scss" scoped>
.interface-checkboxes {
  width: var(--width-x-large);
  max-width: 100%;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(1, 1fr);

  @media only screen and (min-width: 330px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media only screen and (min-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.single {
  grid-template-columns: repeat(1, 1fr);
}

.sortable-box {
  position: relative;
  transition: opacity var(--medium) var(--transition),
    background-color var(--slow) var(--transition);
}

.sortable {
  margin-left: 12px; // To make space to show the drag handle

  &:after {
    position: absolute;
    font-family: "Material Icons", sans-serif;
    display: inline-block;
    line-height: 1;
    letter-spacing: normal;
    vertical-align: middle;
    content: "drag_indicator";
    height: 100%;
    width: 24px;
    font-size: 24px;
    left: -20px;
    color: var(--lighter-gray);
    cursor: grab;
    top: 0;
  }
}

.custom-value {
  display: flex;

  input {
    border: 0;
    border-bottom: 1px solid var(--gray);
    width: 100%;
    margin-left: 4px; // align optically
    height: 22px; // align optically with icon height
  }

  input:hover {
    border-color: var(--darker-gray);
  }

  input:focus {
    border-color: var(--darkest-gray);
  }

  input::placeholder {
    color: var(--light-gray);
  }

  i {
    color: var(--dark-gray);
  }

  i:hover {
    color: var(--darkest-gray);
  }

  &.checked {
    i {
      color: var(--darkest-gray);
    }
  }
}
</style>

<style lang="scss">
// The styles for the 'drop-preview' eg the ghost item that shifts around in the list to show
// the user where the item is going to be dropped
// NOTE: this class is added dynamically and can't be scoped in the style block above
.ghost {
  opacity: 0.4;
}
</style>

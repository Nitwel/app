<template>
  <div
    :class="options.theme ? `button-group-${options.theme}` : 'button-group-outline'"
    class="interface-button-group"
  >
    <div
      v-for="(item, index) in choices"
      :key="`button-group-subgroup-${index}`"
      class="button-group-subgroup"
    >
      <label
        v-for="(subitem, index) in item"
        :key="`button-group-item-${index}`"
        class="button-group-item"
      >
        <input
          type="radio"
          :name="name"
          :disabled="readonly"
          :value="subitem.value"
          :checked="value === subitem.value"
          @change="$emit('input', subitem.value)"
        />
        <span class="button-group-button">
          <v-icon v-if="subitem.icon" :name="subitem.icon" />
          <span v-if="subitem.label">{{ subitem.label }}</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  name: "InterfaceButtonGroup",
  mixins: [mixin],
  computed: {
    choices() {
      /**
       * We'll create an array of choices here.
       * If the button-group has subgroups of choices & individual choice both,
       * We'll need to create a new subgroup with all individual items.
       */
      const choices = [];
      const individualChoices = [];

      this.options.choices.forEach(item => {
        if (Array.isArray(item)) {
          choices.push(item);
        } else {
          individualChoices.push(item);
        }
      });

      choices.push(individualChoices);
      return choices;
    }
  }
};
</script>

<style lang="scss" scoped>
/*
Theme: Outline
*/
.button-group-subgroup {
  display: inline-flex;
  flex-wrap: wrap;
  margin-right: 12px;
}

.button-group-button {
  border: var(--input-border-width) solid var(--gray);
  cursor: pointer;
  transition: var(--fast) var(--transition);
  transition-property: border-color, background-color, color;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 16px;
  height: 44px;
  line-height: 44px;
  white-space: nowrap;
  color: var(--gray);
  margin-bottom: 8px;

  &:hover {
    background-color: var(--lightest-gray);
  }

  i {
    font-size: 18px;

    + span {
      margin-left: 4px;
    }
  }
}

.button-group-item {
  input[type="radio"] {
    height: 0;
    position: absolute;
    opacity: 0;
    /**
			Focused State
		*/
    &:focus {
      + .button-group-button {
        background-color: var(--light-gray);
      }
    }
    /**
			Checked State
		*/
    &:checked {
      + .button-group-button {
        background-color: var(--gray);
        color: var(--white);
      }
    }
    /**
			Disabled State
		*/
    &:disabled {
      + .button-group-button {
        border-color: var(--lighter-gray);
        background-color: var(--lightest-gray);
        color: var(--light-gray);
        cursor: not-allowed;
      }
      &:checked {
        + .button-group-button {
          background-color: var(--lighter-gray);
          color: var(--gray);
        }
      }
    }
  }

  + .button-group-item {
    .button-group-button {
      margin-left: calc(-1 * var(--input-border-width));
    }
  }

  &:first-child {
    .button-group-button {
      border-radius: var(--border-radius) 0 0 var(--border-radius);
    }
  }

  &:last-child {
    .button-group-button {
      border-radius: 0 var(--border-radius) var(--border-radius) 0;
    }
  }
}

@media only screen and (max-width: 800px) {
  .interface-button-group {
    display: inline-flex;
    flex-direction: column;
  }

  .button-group-subgroup {
    flex-direction: column;
    display: inline-flex;
    margin: 0;

    + .button-group-subgroup {
      margin: 10px 0 0 0;
    }
  }

  .button-group-item {
    + .button-group-item {
      .button-group-button {
        margin-left: 0;
        margin-top: calc(-1 * var(--input-border-width));
      }
    }

    &:first-child {
      .button-group-button {
        border-radius: var(--border-radius) var(--border-radius) 0 0;
      }
    }

    &:last-child {
      .button-group-button {
        border-radius: 0 0 var(--border-radius) var(--border-radius);
      }
    }
  }
}

/*
Theme: Solid | Default
*/
.button-group-solid {
  .button-group-button {
    border-top: none;
    // border-right-color: var(--gray);
    border-right: none;
    border-bottom: none;
    border-left: none;
    margin-right: 2px;
    background-color: var(--lightest-gray);
    color: var(--dark-gray);
    &:hover {
      background-color: var(--light-gray);
      color: var(--white);
    }
  }

  .button-group-item {
    input[type="radio"] {
      /**
				Focused State
			*/
      &:focus {
        + .button-group-button {
          background-color: var(--dark-gray);
          color: var(--white);
        }
      }
      &:checked {
        + .button-group-button {
          background-color: var(--dark-gray);
          color: var(--white);
        }
      }
      /**
				Disabled State
			*/
      &:disabled {
        + .button-group-button {
          color: var(--light-gray);
        }
        &:checked {
          + .button-group-button {
            background-color: var(--gray);
            color: var(--lightest-gray);
          }
        }
      }
    }

    + .button-group-item {
      .button-group-button {
        margin-left: 0;
      }
    }

    &:last-child {
      .button-group-button {
        border-right: none;
        margin-right: 0;
      }
    }
  }

  @media only screen and (max-width: 800px) {
    .button-group-item {
      + .button-group-item {
        .button-group-button {
          margin-top: 0;
        }
      }
    }
  }
}
</style>

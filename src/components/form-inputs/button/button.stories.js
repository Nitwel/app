import { storiesOf } from "@storybook/vue";
import { text, boolean, radios, select } from "@storybook/addon-knobs";
import { action } from "@storybook/addon-actions";
import readme from "./button.readme.md";

storiesOf("Button", module)
  .addParameters({
    readme: { sidebar: readme }
  })
  .add("Dynamic", () => ({
    methods: { action },
    props: {
      disabled: {
        default: boolean("Disabled", false)
      },
      text: {
        default: text("Text", "Text")
      },
      loading: {
        default: boolean("Loading", false)
      },
      fullwidth: {
        default: boolean("Full Width", false)
      },
      icon: {
        default: text("Icon", null)
      },
      type: {
        default: radios("Type", ["button", "submit"], "button")
      },
      color: {
        default: radios("Text Color", ["white", "black"], "white")
      },
      bg: {
        default: select("Background Color", ["action", "warning", "danger"], "action")
      }
    },
    template: `
        <v-button
          @click="action('click')($event)"
          :fullwidth="fullwidth"
          :icon="icon"
          :type="type"
          :disabled="disabled"
          :loading="loading"
          :type="type"
          :color="color"
          :bg="bg"
        >
          {{ text }}
        </v-button>
      `
  }))

  .add("Default", () => `<v-button>Default</v-button>`)
  .add("Disabled", () => `<v-button disabled>Disabled</v-button>`)
  .add("Loading", () => `<v-button loading>Saving</v-button>`)
  .add("Danger", () => `<v-button bg="danger">Delete</v-button>`)
  .add("Full Width", () => `<v-button fullwidth>Log in</v-button>`);

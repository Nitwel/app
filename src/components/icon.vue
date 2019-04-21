<docs>
  # Icon Component

  ## Usage

  ```vue
  <v-icon name="person" />
  ```

  ## Properties

  | name  | description                            | default |
  |-------|----------------------------------------|---------|
  | name* | The name of the icon to render         | -       |
  | size  | The size of the icon in px             | 24      |
  | color | A color name out of the global pallete | -       |
</docs>

<template>
  <svg v-if="isCustom" viewBox="0 0 96 100" :width="size" :height="size" :style="svgStyle">
    <path
      d="M3.153 79.825l42.917 19.73c1.287.593 2.573.593 3.86 0l42.906-19.73c1.787-.821 2.683-2.216 2.685-4.183V24.358a4.632 4.632 0 0 0-.081-.83v-.242c-.048-.2-.11-.396-.184-.587l-.069-.196a4.73 4.73 0 0 0-.369-.692l-.104-.149a4.668 4.668 0 0 0-.403-.485l-.219-.149a4.476 4.476 0 0 0-.507-.415l-.127-.092a4.558 4.558 0 0 0-.622-.346L49.919.445c-1.287-.593-2.574-.593-3.861 0L3.153 20.175a4.51 4.51 0 0 0-.623.346l-.126.092a4.476 4.476 0 0 0-.507.415l-.15.161c-.146.152-.28.313-.404.484l-.103.15c-.143.22-.266.45-.369.691l-.127.185a4.592 4.592 0 0 0-.184.587v.242a4.632 4.632 0 0 0-.081.83v51.284c0 1.964.891 3.358 2.674 4.183zm6.534-48.264l33.697 15.523v41.142L9.687 72.692V31.561zm42.917 56.654V47.084l33.697-15.523v41.142L52.604 88.215zm-4.61-78.55l31.9 14.693-31.9 14.694-31.899-14.694L47.994 9.665z"
    />
  </svg>

  <i v-else :style="iconStyle">{{ name }}</i>
</template>

<script>
export default {
  name: "v-icon",
  props: {
    // Name of the material design icon. See https://material.io/tools/icons
    name: {
      type: String,
      required: true
    },

    // Size in PX
    size: {
      type: [Number, String],
      default: 24,
      validator(value) {
        const numberValue = Number(value);

        // These values are the recommended MD icon sizes. Any alternate size will render the icons
        // fuzzy. See https://google.github.io/material-design-icons/#sizing
        // .... except for 16, but we need that size for inside of checkboxes (permissions)
        const valid = [16, 18, 24, 36, 48].includes(numberValue);

        if (!valid) {
          console.warn("[v-icon]: Icon size has to be 18, 24, 36, or 48.");
        }

        return valid;
      }
    },

    // A color name from our global variables, eg `red-500`, `accent`, or `darkest-gray`
    color: {
      type: String,
      default: undefined
    }
  },
  computed: {
    // Allows us to add additional icons that aren't in the material design set. Currently, the only
    // extra icon we have is a box icon (used for collections).
    isCustom() {
      const customIcons = ["box"];
      return customIcons.includes(this.name);
    },

    // The inline styles of the material design icon
    iconStyle() {
      const styles = {
        fontSize: this.size + "px"
      };

      if (this.color) {
        styles.color = `var(--${this.color})`;
      }

      return styles;
    },

    // The inline styles of the alternate-icon svg
    svgStyle() {
      return {
        fill: `var(--${this.color})`
      };
    }
  }
};
</script>

<style lang="scss" scoped>
i {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  font-feature-settings: "liga";
  vertical-align: middle;
}

svg {
  display: inline-block;
  vertical-align: middle;
}
</style>

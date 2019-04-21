<template>
  <div class="interface-color">
    <div class="input" v-if="!options.paletteOnly && options.input === 'hex' && readonly === false">
      <v-input
        v-if="options.allowAlpha"
        type="text"
        placeholder="#3498dbee"
        pattern="[#0-9a-fA-F]"
        iconLeft="palette"
        :maxlength="9"
        v-model="rawValue"
      ></v-input>
      <v-input
        v-else
        type="text"
        placeholder="#3498db"
        pattern="[#0-9a-fA-F]"
        iconLeft="palette"
        :maxlength="7"
        v-model="rawValue"
      ></v-input>
    </div>
    <div
      class="sliders"
      v-else-if="!options.paletteOnly && options.input === 'rgb' && readonly === false"
    >
      <template v-for="(label, idx) in rgbLabels">
        <label
          class="slider-label"
          :key="'label' + idx"
          v-if="
            rawValue[idx] ||
              rawValue[idx] === 0 ||
              (options.allowAlpha && rawValue[idx] === undefined)
          "
        >
          {{ label }}
        </label>
        <v-slider
          v-if="(rawValue[idx] && label !== 'A') || (rawValue[idx] === 0 && label !== 'A')"
          :key="idx"
          :min="0"
          :max="256"
          :alwaysShowOutput="true"
          class="slider"
          v-model.lazy="rawValue[idx]"
        ></v-slider>
        <span
          :key="'hidden-model-fix' + idx"
          v-if="options.allowAlpha && label === 'A'"
          style="display: none; visibility: hidden; opacity: 0"
        >
          {{ rawValue[idx] === undefined ? (rawValue[idx] = 1) : rawValue[idx] }}
        </span>
        <v-slider
          v-if="
            options.allowAlpha && label === 'A' && rawValue[idx] === undefined
              ? (rawValue[idx] = 1)
              : rawValue[idx]
          "
          :key="idx"
          :min="0"
          :max="1"
          :step="0.01"
          :alwaysShowOutput="true"
          class="slider"
          v-model.lazy="rawValue[idx]"
        ></v-slider>
        <br :key="'break-' + idx" />
      </template>
    </div>
    <div
      class="sliders"
      v-else-if="!options.paletteOnly && options.input === 'hsl' && readonly === false"
    >
      <template v-for="(label, idx) in hslLabels">
        <label
          class="slider-label"
          :key="'label' + idx"
          v-if="
            rawValue[idx] ||
              rawValue[idx] === 0 ||
              (options.allowAlpha && rawValue[idx] === undefined)
          "
        >
          {{ label }}
        </label>
        <v-slider
          v-if="(rawValue[idx] && label !== 'A') || (rawValue[idx] === 0 && label !== 'A')"
          :key="idx"
          :min="0"
          :max="idx < 1 ? 100 : 360"
          :alwaysShowOutput="true"
          class="slider"
          v-model.lazy="rawValue[idx]"
        ></v-slider>
        <span
          :key="'hidden-model-fix' + idx"
          v-if="options.allowAlpha && label === 'A'"
          style="display: none; visibility: hidden; opacity: 0"
        >
          {{ rawValue[idx] === undefined ? (rawValue[idx] = 1) : rawValue[idx] }}
        </span>
        <v-slider
          v-if="options.allowAlpha && label === 'A'"
          :key="idx"
          :min="0"
          :max="1"
          :step="0.01"
          :alwaysShowOutput="true"
          class="slider"
          v-model.lazy="rawValue[idx]"
        ></v-slider>
        <br :key="'break-' + idx" />
      </template>
    </div>
    <div
      class="sliders"
      v-else-if="!options.paletteOnly && options.input === 'cmyk' && readonly === false"
    >
      <template v-for="(label, idx) in cmykLabels">
        <label
          class="slider-label"
          :key="'label' + idx"
          v-if="
            rawValue[idx] ||
              rawValue[idx] === 0 ||
              (options.allowAlpha && rawValue[idx] === undefined)
          "
        >
          {{ label }}
        </label>
        <v-slider
          v-if="(rawValue[idx] && label !== 'A') || (rawValue[idx] === 0 && label !== 'A')"
          :key="idx"
          :min="0"
          :max="100"
          :alwaysShowOutput="true"
          class="slider"
          v-model="rawValue[idx]"
        ></v-slider>
        <span
          :key="'hidden-model-fix' + idx"
          v-if="options.allowAlpha && label === 'A'"
          style="display: none; visibility: hidden; opacity: 0"
        >
          {{ rawValue[idx] === undefined ? (rawValue[idx] = 1) : rawValue[idx] }}
        </span>
        <v-slider
          v-if="options.allowAlpha && label === 'A'"
          :key="idx"
          :min="0"
          :max="1"
          :step="0.01"
          :alwaysShowOutput="true"
          class="slider"
          v-model.lazy="rawValue[idx]"
        ></v-slider>
        <br :key="'break-' + idx" />
      </template>
    </div>
    <div class="swatch" :style="`background-color: ${color ? color.hex() : 'transparent'}`">
      <v-icon name="check" />
    </div>
    <template v-if="readonly === false">
      <button
        v-for="(color, idx) in palette"
        :key="idx"
        :style="{ borderColor: color, color: color, backgroundColor: color }"
        @click="setRawValue(color)"
      >
        <v-icon name="colorize" />
      </button>
    </template>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";
import Color from "color";

export default {
  name: "interface-color",
  mixins: [mixin],
  data() {
    return {
      rgbLabels: ["R", "G", "B", "A"],
      hslLabels: ["H", "S", "L", "A"],
      cmykLabels: ["C", "M", "Y", "K", "A"],
      rawValue: null
    };
  },
  computed: {
    color() {
      try {
        if (this.options.input === "hex") {
          return Color(this.rawValue);
        }
        return Color[this.options.input](this.rawValue);
      } catch (err) {
        return null;
      }
    },
    palette() {
      if (this.options.palette) {
        const rawPalette = Array.isArray(this.options.palette)
          ? this.options.palette
          : this.options.palette.split(",");
        return rawPalette.map(val => Color(val));
      }

      return null;
    }
  },
  created() {
    this.setDefault();
  },
  watch: {
    rawValue() {
      if (this.color === null) {
        return this.$emit("input", null);
      }

      let value;

      if (this.options.output === "hex") {
        value = this.color.hex();
      } else {
        value = this.color[this.options.output]().array();
        value = value.map((num, index) => {
          if (index === value.length - 1) {
            return Math.round(num * 100) / 100;
          }

          return Math.round(num);
        });
      }
      if (value) {
        this.$emit("input", value);
      }
    },
    options: {
      deep: true,
      handler() {
        this.setDefault();
      }
    }
  },
  methods: {
    setDefault() {
      let savedColor = Color(this.value || "#263238");
      this.setRawValue(savedColor);
    },
    setRawValue(color) {
      if (this.options.input === "hex") {
        return (this.rawValue = color.hex());
      }

      return (this.rawValue = color[this.options.input]()
        .array()
        .map(val => {
          return Math.round(val);
        }));
    }
  }
};
</script>

<style scoped lang="scss">
.input {
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}

.sliders {
  max-width: 200px;
  display: inline-block;
  margin-right: 36px;
  vertical-align: middle;
  .slider-label {
    display: inline-block;
    color: var(--light-gray);
    width: 14px;
    vertical-align: text-bottom;
  }
  .slider {
    display: inline-block;
    margin-bottom: 8px;
  }
}

.swatch {
  transition: var(--fast) var(--transition);
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  vertical-align: middle;
  margin-right: 8px;
  color: var(--white);
  text-align: center;
  i {
    line-height: 40px;
  }
}

button {
  transition: var(--fast) var(--transition);
  position: relative;
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  border: 2px solid var(--gray);
  // background-color: var(--white);
  margin-right: 8px;
  margin-bottom: 8px;
  &:first-of-type {
    margin-left: 16px;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: -16px;
      border-left: 1px solid var(--lighter-gray);
    }
  }
  &:not(:hover) {
    background-color: var(--white) !important;
  }
  &:hover {
    transition: none;
    color: var(--white) !important;
  }
}
</style>

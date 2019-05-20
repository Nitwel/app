<template>
  <form @submit.prevent>
    <label for="spacing" class="style-3 required">
      {{ $t("layouts-timeline-date") }}
    </label>
    <v-select
      id="spacing"
      :value="viewOptions.date || '__none__'"
      :options="dateOptions"
      class="select"
      icon="today"
      @input="setOption('date', $event)"
    ></v-select>
    <label for="spacing" class="style-3 required">
      {{ $t("layouts-timeline-title") }}
    </label>
    <v-input
      id="spacing"
      :pattern="titleValidator"
      :value="viewOptions.title"
      :options="textOptions"
      @input="setOption('title', $event)"
    ></v-input>
    <label for="spacing" class="style-3 required">
      {{ $t("layouts-timeline-content") }}
    </label>
    <v-select
      id="spacing"
      :value="viewOptions.content || '__none__'"
      :options="contentOptions"
      class="select"
      icon="title"
      @input="setOption('content', $event)"
    ></v-select>
    <label for="spacing" class="style-3">
      {{ $t("layouts-timeline-color") }}
    </label>
    <v-select
      id="spacing"
      :value="viewOptions.color || '__none__'"
      :options="textOptions"
      class="select"
      icon="color_lens"
      @input="setOption('color', $event)"
    ></v-select>
  </form>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";

export default {
  mixins: [mixin],
  data() {
    return {
      sortList: null,
      titleValid: true
    };
  },
  computed: {
    contentOptions() {
      var options = {
        __none__: `(${this.$t("dont_show")})`,
        ...this.$lodash.mapValues(this.fields, info =>
          ["integer", "string", "user"].includes(info.type) ? info.name : null
        )
      };
      return this.$lodash.pickBy(options, this.$lodash.identity);
    },
    titleValidator() {
      var fields = this.$lodash.keys(this.fields); //this.getKeys(this.fields)
      fields = fields
        .toString()
        .replace('"', "")
        .replace(/,/g, "|");
      var regex = new RegExp("^([^\\{\\}]*?\\{\\{\\s*?(" + fields + ")\\s*?\\}\\})*?[^\\{\\}]*?$");
      return regex.toString().replace(/\//g, "");
    },
    textOptions() {
      var options = {
        __none__: `(${this.$t("dont_show")})`,
        ...this.$lodash.mapValues(this.fields, info =>
          info.type == "string" || info.type == "integer" ? info.name : null
        )
      };
      return this.$lodash.pickBy(options, this.$lodash.identity);
    },
    dateOptions() {
      var options = this.$lodash.mapValues(this.fields, info =>
        ["date", "datetime"].includes(info.type) ? info.name : null
      );
      return this.$lodash.pickBy(options, this.$lodash.identity);
    }
  },
  methods: {
    getKeys(obj) {
      var keys = this.$lodash.keys(obj);
      var subKeys = [];
      for (var i = 0; i < keys.length; i++) {
        if (typeof obj[keys[i]] === "object") {
          var subKeyList = this.getKeys(obj[keys[i]]);
          for (var k = 0; k < subKeyList.length; k++) {
            subKeys.push(keys[i] + "." + subKeyList[k]);
          }
        }
      }
      return [...keys, ...subKeys];
    },
    setOption(option, value) {
      this.$emit("options", {
        ...this.viewOptions,
        [option]: value
      });
    }
  }
};
</script>

<style lang="scss" scoped>
label {
  margin-bottom: 10px;
  margin-top: 30px;
}

.required::after {
  content: "required";
  margin: 0 5px;
  padding: 0px 4px 1px;
  font-size: 10px;
  font-weight: 600;
  color: var(--white);
  background-color: var(--warning);
  border-radius: var(--border-radius);
  text-transform: uppercase;
}
</style>

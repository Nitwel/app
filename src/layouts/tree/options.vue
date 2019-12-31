<template>
  <form @submit.prevent>
    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.parent") }}
      <v-icon class="required" name="star" color="input-required-color" sup />
    </label>
    <v-select
      id="spacing"
      :value="viewOptions.parent || '__none__'"
      :options="parentOptions"
      class="select"
      icon="today"
      @input="setOption('parent', $event)"
    ></v-select>
    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.title") }}
      <v-icon class="required" name="star" color="input-required-color" sup />
    </label>
    <v-select
      id="spacing"
      :value="viewOptions.title || '__none__'"
      :options="textOptions"
      @input="setOption('title', $event)"
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
        ..._.mapValues(this.fields, info =>
          ["integer", "string", "user"].includes(info.type) ? info.name : null
        )
      };
      return _.pickBy(options, _.identity);
    },
    textOptions() {
      var options = {
        __none__: `(${this.$t("dont_show")})`,
        ..._.mapValues(this.fields, info =>
          info.type == "string" || info.type == "integer" ? info.name : null
        )
      };
      return _.pickBy(options, _.identity);
    },
    parentOptions() {
      var options = _.mapValues(this.fields, info =>
        ["m2o"].includes(info.type) ? info.name : null
      );
      return _.pickBy(options, _.identity);
    }
  },
  methods: {
    getKeys(obj) {
      var keys = _.keys(obj);
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
.type-label {
  margin-top: var(--form-vertical-gap);
  margin-bottom: var(--input-label-margin);
  &:first-of-type {
    margin-top: 0;
  }
}
</style>

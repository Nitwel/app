<template>
  <div class="interface-json">
    <codemirror :value="stringValue" :options="cmOptions" @input="updateValue"></codemirror>
    <button v-if="options.template" @click="fillTemplate">
      <v-icon name="playlist_add" />
    </button>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

import jsonlint from "jsonlint-mod";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/display/autorefresh.js";
import "codemirror/addon/lint/lint.js";

import { codemirror } from "vue-codemirror";

CodeMirror.registerHelper("lint", "json", text => {
  const found = [];

  const parser = jsonlint.parser;

  parser.parseError = (str, hash) => {
    const loc = hash.loc;
    found.push({
      from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
      to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
      message: str
    });
  };

  if (text.length > 0) {
    try {
      jsonlint.parse(text);
    } catch (e) {}
  }

  return found;
});

export default {
  components: {
    codemirror
  },
  mixins: [mixin],
  data() {
    return {
      initialValue: ""
    };
  },
  computed: {
    cmOptions() {
      return {
        tabSize: 4,
        autoRefresh: true,
        indentUnit: 4,
        readOnly: this.readonly ? "nocursor" : false,
        line: true,
        lineNumbers: true,
        mode: "application/json",
        showCursorWhenSelecting: true,
        theme: "default",
        lint: true,
        gutters: ["CodeMirror-lint-markers"]
      };
    },

    stringValue() {
      if (this.value) {
        if (typeof this.value === "object") return JSON.stringify(this.value, null, 4);
        return this.value;
      }

      return "";
    }
  },
  methods: {
    updateValue(value) {
      if (value.length === 0) return this.$emit("input", null);

      try {
        this.$emit("input", JSON.parse(value));
      } catch (e) {}
    },

    fillTemplate() {
      const template = this.options.template;
      this.$emit("input", template);
    }
  }
};
</script>

<style lang="scss" scoped>
.interface-json {
  position: relative;
}

button {
  position: absolute;
  top: 10px;
  right: 10px;
  user-select: none;
  color: var(--light-gray);
  cursor: pointer;
  transition: color var(--fast) var(--transition-out);
  z-index: 10;

  &:hover {
    transition: none;
    color: var(--dark-gray);
  }
}
</style>

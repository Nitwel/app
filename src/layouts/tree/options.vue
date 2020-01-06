<template>
  <form @submit.prevent>
    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.parent") }}
      <v-icon class="required" name="star" color="input-required-color" sup />
    </label>
    <v-select
      id="parent"
      :value="viewOptions.parent || '__none__'"
      :options="parentOptions"
      class="select"
      icon="call_merge"
      @input="setOption('parent', $event)"
    ></v-select>
    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.title") }}
      <v-icon class="required" name="star" color="input-required-color" sup />
    </label>
    <v-select
      id="title"
      :value="viewOptions.title || '__none__'"
      :options="titleOptions"
      icon="title"
      @input="setOption('title', $event)"
    ></v-select>
    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.friends.friends") }}
    </label>
    <v-select
      id="friends"
      :value="viewOptions.friends || '__none__'"
      :options="friendsOptions"
      icon="subdirectory_arrow_right"
      @input="changeFriendsCollection($event)"
    ></v-select>
    <v-checkbox
      id="allCollections"
      :label="buttonLabel"
      :checked="showAllCollections"
      value="null"
      @change="toggleAllCollections()"
    ></v-checkbox>
    <div v-if="viewOptions.friends && viewOptions.friends != '__none__'" class="friends-options">
      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.friends.field") }}
      </label>
      <v-select
        id="friendsField"
        :value="viewOptions.friendsField || '__none__'"
        :options="friendsFieldOptions"
        icon="call_merge"
        @input="setOption('friendsField', $event)"
      ></v-select>
      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.friends.title") }}
      </label>
      <v-select
        id="friendsTitle"
        :value="viewOptions.friendsTitle || '__none__'"
        :options="friendsTitleOptions"
        icon="title"
        @input="setOption('friendsTitle', $event)"
      ></v-select>
    </div>
    <v-details :title="$t('layouts.tree.icon.title')" background="var(--sidebar-background-color)">
      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.icon.folder") }}
      </label>
      <v-ext-input
        id="icon"
        name="icon"
        type="string"
        :value="viewOptions.folder || 'folder'"
        @input="setOption('folder', $event)"
      ></v-ext-input>

      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.icon.folder_open") }}
      </label>
      <v-ext-input
        id="icon"
        name="icon"
        type="string"
        :value="viewOptions.folderOpen || 'folder_open'"
        @input="setOption('folderOpen', $event)"
      ></v-ext-input>

      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.icon.item") }}
      </label>
      <v-ext-input
        id="icon"
        name="icon"
        type="string"
        :value="viewOptions.item || 'file'"
        @input="setOption('item', $event)"
      ></v-ext-input>

      <label for="spacing" class="type-label">
        {{ $t("layouts.tree.icon.friend") }}
      </label>
      <v-ext-input
        id="icon"
        name="icon"
        type="string"
        :value="viewOptions.friendIcon"
        @input="setOption('friendIcon', $event)"
      ></v-ext-input>
    </v-details>
  </form>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";

export default {
  mixins: [mixin],
  data() {
    return {
      sortList: null,
      titleValid: true,
      showAllCollections: false
    };
  },
  computed: {
    buttonLabel() {
      return this.$t("layouts.tree.showAllCollections");
    },
    titleOptions() {
      var options = _.mapValues(this.fields, info =>
        ["string", "integer"].includes(info.type) ? info.name : null
      );
      return _.pickBy(options, _.identity);
    },
    friendsOptions() {
      var collections = Object.keys(this.$store.state.collections);
      var options = {
        __none__: `(${this.$t("dont_show")})`
      };
      collections.forEach(collection => {
        if (this.showAllCollections || !collection.startsWith("directus"))
          options[collection] = collection;
      });
      return options;
    },
    friendsFieldOptions() {
      var collection = this.$store.state.collections[this.viewOptions.friends].fields;
      var options = _.mapValues(collection, info =>
        ["m2o"].includes(info.type) ? info.field : null
      );
      return _.pickBy(options, _.identity);
    },
    friendsTitleOptions() {
      var collection = this.$store.state.collections[this.viewOptions.friends].fields;
      var options = _.mapValues(collection, info =>
        ["string", "integer"].includes(info.type) ? info.field : null
      );
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
    changeFriendsCollection(event) {
      //needed to reset the "friends-field" select
      this.viewOptions.friends = null;
      this.viewOptions.friendsField = null;
      this.viewOptions.friendsTitle = null;
      setTimeout(() => {
        this.setOption("friends", event);
      }, 1);
    },
    toggleAllCollections() {
      this.showAllCollections = !this.showAllCollections;
    },
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

.friends-options {
  padding: 10px 0px 10px 20px;

  label {
    margin-top: 10px;
  }
}
</style>

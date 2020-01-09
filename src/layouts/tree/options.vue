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
    <v-checkbox
      id="allCollections"
      :label="buttonLabel"
      :checked="showAllCollections"
      value="null"
      @change="toggleAllCollections()"
    ></v-checkbox>

    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.connections") }}
    </label>

    <v-ext-input
      id="repeater"
      name="repeater"
      type="object"
      :options="repeaterOptions"
      :value="viewOptions.connections || []"
      @input="updateConnections"
    ></v-ext-input>

    <label for="spacing" class="type-label">
      {{ $t("layouts.tree.icon") }}
    </label>
    <v-ext-input
      id="icon"
      name="icon"
      type="string"
      :value="viewOptions.icon || 'file'"
      @input="setOption('icon', $event)"
    ></v-ext-input>
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
    repeaterOptions() {
      var options = {
        dataType: "object",
        fields: {
          collection: {
            name: "Collection",
            interface: "dropdown",
            required: true,
            type: "String",
            preview: true,
            options: {
              choices: this.collectionOptions
            }
          },
          title: {
            name: "Title",
            interface: "text-input",
            type: "String",
            options: {
              placeholder: "{{my_field}} {{my_second_field}}"
            }
          },
          icon: {
            name: "Icon",
            interface: "icon",
            type: "String"
          }
        }
      };
      return options;
    },
    buttonLabel() {
      return this.$t("layouts.tree.showAllCollections");
    },
    titleOptions() {
      var options = _.mapValues(this.fields, info =>
        ["string", "integer"].includes(info.type) ? info.name : null
      );
      return _.pickBy(options, _.identity);
    },
    collectionOptions() {
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
    parentOptions() {
      var options = _.mapValues(this.fields, info =>
        ["m2o"].includes(info.type) ? info.name : null
      );
      return _.pickBy(options, _.identity);
    }
  },
  methods: {
    updateConnections($event) {
      var event = $event || [];
      event.forEach(connection => {
        if (connection && connection.collection) {
          var collection = connection.collection;
          var relations = this.$store.state.relations;
          // var fields = this.$store.state.collections[collection].fields;
          // fields = _.filter(fields, field => field.type == "m2o");
          let relation = _.find(relations, relation => {
            return (
              relation.collection_many == collection && relation.collection_one == this.collection
            );
          });
          connection.field = relation.field_many;
        }
      });
      this.setOption("connections", event);
    },
    toggleAllCollections() {
      this.showAllCollections = !this.showAllCollections;
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

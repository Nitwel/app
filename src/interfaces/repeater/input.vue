<template>
  <div class="status-mapping">
    <div class="boxes">
      <draggable v-model="boxes" handle=".handle">
        <Box
          v-for="(value, index) in boxes"
          :id="index"
          :key="index"
          :headers="headers"
          :fields="formFields"
          :data="value"
          :open="index == open"
          @stage-value="stageValue"
          @open="openBox(index)"
          @delete="deleteBox(index)"
        ></Box>
      </draggable>
    </div>
    <v-button v-if="!(limit > 0 && boxCount >= limit)" icon="add" @click="addBox">
      {{ buttonText }}
    </v-button>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";
import Box from "./box.vue";

export default {
  components: {
    Box
  },
  mixins: [mixin],
  data() {
    return {
      open: null
    };
  },
  computed: {
    headers() {
      return _.pickBy(this.options.fields, value => {
        return value.hasOwnProperty("preview") && value.preview;
      });
    },
    formFields() {
      var fields = this.options.fields;
      _.forOwn(fields, (value, key) => {
        fields[key].hidden_detail = false;
        if (!fields[key].hasOwnProperty("field")) fields[key].field = key;
      });
      return fields;
    },
    buttonText() {
      return this.options.buttonText || "Add Field";
    },
    limit() {
      return this.options.limit || 0;
    },
    boxCount() {
      return this.boxes.length;
    },
    indexType() {
      var field = _.find(this.options.fields, { index: true });
      if (field && field.field) {
        return field.field;
      } else {
        return null;
      }
    },
    dataType() {
      return this.options.dataType || "object";
    },
    boxes: {
      get() {
        if (this.dataType == "value") {
          var boxes = [];
          var fields = _.keys(this.options.fields);
          _.forOwn(this.value, (value, key) => {
            boxes.push({ [fields[0]]: value, [fields[1]]: key });
          });
          return boxes;
        } else {
          return _.values(_.cloneDeep(this.value)) || [];
        }
      },
      set(values) {
        let obj = {};
        for (var i = 0; i < values.length; i++) {
          var value = null;
          if (this.dataType == "value") {
            var fields = _.chain(this.options.fields)
              .pickBy(b => {
                return !b.hasOwnProperty("index") || !b.index;
              })
              .keys()
              .value();
            value = values[i][fields[0]];
          } else {
            value = values[i];
          }

          if (this.indexType) {
            obj[values[i][this.indexType]] = value;
          } else {
            obj[i] = value;
          }
        }
        this.$emit("input", obj);
      }
    }
  },
  methods: {
    addBox() {
      var box = {};
      _.forOwn(this.options.fields, (value, key) => {
        box[key] = null;
      });

      this.open = this.boxes.length;
      this.boxes.push(box);
      this.boxes = this.boxes;
    },
    deleteBox(key) {
      _.remove(this.boxes, (value, index) => {
        return index == key;
      });
      this.boxes = this.boxes;
    },
    stageValue({ id, data }) {
      this.$set(this.boxes[id], data.field, data.value);
      this.boxes = this.boxes;
    },
    openBox(id) {
      if (this.open == id) {
        this.open = null;
      } else {
        this.open = id;
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>

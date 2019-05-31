<template>
  <div class="box" :class="{ closed: !open }">
    <div class="header" @click="$emit('open')">
      <div class="start">
        <v-icon color="gray" name="drag_handle" />
        <v-ext-display
          v-for="(value, key) in headers"
          :key="key"
          :interface-type="value.interface"
          :options="fields[key].options"
          type="null"
          :name="value.field"
          :value="data[key]"
        ></v-ext-display>
      </div>
      <div class="end">
        <v-icon color="gray" :name="open ? 'unfold_less' : 'unfold_more'" />
        <button @click.stop="$emit('delete')"><v-icon color="gray" name="delete" /></button>
      </div>
    </div>
    <div class="container">
      <v-form
        :fields="fields"
        :values="data"
        @stage-value="$emit('stage-value', { id, data: $event })"
      ></v-form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    id: {
      type: Number,
      required: true
    },
    headers: {
      type: Object,
      required: true
    },
    fields: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    open: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  border-radius: var(--border-radius);
  border: 2px solid var(--lighter-gray);
  overflow: hidden;
  margin: 16px 0;

  &.closed {
    height: calc(var(--input-height) + 4px);

    .header :after {
      display: none;
    }
  }

  .header {
    position: relative;
    height: var(--input-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;

    :after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 10px;
      width: calc(100% - 20px);
      height: 2px;
      background-color: var(--lighter-gray);
      opacity: 0.1;
    }

    .start {
      display: flex;
      align-items: center;

      .v-ext-display {
        color: var(--darker-gray);
        font-size: 14px;
        margin: 10px;
      }
    }
  }

  .container {
    padding: 16px;

    .form {
      grid-template-columns:
        [start] minmax(0, var(--column-width)) [half] minmax(0, var(--column-width))
        [full];
    }
  }
}
</style>

<template>
  <div class="event">
    <div class="line" :class="{ connect: connect }">
      <div
        class="point"
        :style="{ backgroundColor: 'var(--' + (data.color || 'gray') + ')' }"
      ></div>
    </div>
    <div class="container" @click="$router.push(data.to)">
      <div class="title">
        {{ data.title }}
      </div>
      <div class="content">
        <v-ext-display
          @click.native.stop=""
          class="display"
          :id="data.contentType.name"
          :name="data.contentType.name"
          :type="data.contentType.type"
          :value="data.content"
          :interfaceType="data.contentType.interface"
          :options="data.contentType.options"
        />
        <v-timeago class="time" :datetime="data.time" :auto-update="86400" :locate="$i18n.locale" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["data", "connect"],
  components: {},
  data() {
    return {};
  },
  computed: {},
  methods: {},
  created() {},
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss" scoped>
.event {
  position: relative;
  margin-bottom: 25px;

  .line {
    position: absolute;
    top: 10px;
    left: 25px;
    height: 150%;
    width: 2px;
    transform: translate(-50%, 0);

    &.connect {
      background-color: var(--lightest-gray);
    }

    .point {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-left: 50%;
      transform: translate(-50%, -50%);
      border: 3px solid white;
      z-index: 10;
    }
  }

  .container {
    cursor: pointer;
    margin-left: 50px;
    padding-left: 5px;
    border-radius: var(--border-radius);

    &:hover {
      background-color: var(--lightest-gray);
    }

    .title {
      margin-bottom: 5px;
      font-weight: 500;
      font-size: 15px;
    }

    .content {
      padding: 4px 0px;
      display: flex;
      align-items: center;

      .display {
        margin-right: 5px;
        font-weight: 500;
        color: var(--gray);
      }

      .time {
        margin-top: 3px;
        color: var(--light-gray);
      }
    }
  }
}
</style>

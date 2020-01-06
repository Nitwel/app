<template>
  <div class="leaf">
    <div v-show="!last" class="line"></div>
    <div class="dot"></div>
    <v-icon v-if="icon" class="icon" :name="icon"></v-icon>
    <div class="title" @click.stop="parent.openItem(item.id, true)">{{ title }}</div>
  </div>
</template>

<script>
export default {
  name: "Leaf",
  props: {
    item: {
      type: Object,
      default: null
    },
    parent: {
      type: Object,
      default: null
    },
    last: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {
    title() {
      return this.item[this.parent.viewOptions.friendsTitle];
    },
    icon() {
      return this.parent.viewOptions.friendIcon;
    }
  },
  created() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.leaf {
  position: relative;
  display: flex;
  align-items: center;

  .dot {
    z-index: 1;
    position: absolute;
    width: 10px;
    height: 10px;
    border: 2px solid var(--darkest-gray);
    background-color: var(--white);
    border-radius: 50%;
    float: left;
    top: 15px;
    left: -10px;
    transform: translate(-50%, -50%);
  }

  .line {
    position: absolute;
    width: 2px;
    height: 100%;
    background-color: var(--dark-gray);
    float: left;
    top: 15px;
    left: -11px;
  }

  .icon {
    margin-right: 5px;
  }

  .title {
    cursor: pointer;
    height: 30px;
    font-size: 16px;

    display: flex;
    align-items: center;
  }
}
</style>

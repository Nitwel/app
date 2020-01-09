<template>
  <div class="leaf">
    <div v-show="!last" class="line"></div>
    <div class="dot"></div>
    <v-icon v-if="icon" class="icon" :name="icon"></v-icon>
    <router-link class="title" :to="root.createLink(item.id, item.__collection__)">
      {{ title }}
    </router-link>
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
    root: {
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
      var connections = this.root.viewOptions.connections;
      var collection = _.find(connections, con => con.collection == this.item.__collection__);
      if (!collection) return;
      var title = this.$helpers.micromustache.render(collection.title, this.item);
      return title;
    },
    icon() {
      var connections = this.root.viewOptions.connections;
      var collection = _.find(connections, con => con.collection == this.item.__collection__);
      if (!collection.icon) return this.$store.state.collections[this.item.__collection__].icon;
      return collection.icon;
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
    display: none;
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
    display: none;
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
    text-decoration: none;

    display: flex;
    align-items: center;
  }
}
</style>

<template>
  <div class="subTree" @click="loadItems">
    {{ title }}, {{ hasChildren ? "YO" : "NO" }}
    <Tree v-for="item in items" :key="item.id" :tree="item" :parent="parent"></Tree>
    <div v-for="item in items" :key="item.id">{{ item.title }}</div>
  </div>
</template>

<script>
import Tree from "./Tree.vue";

export default {
  components: {
    Tree
  },
  props: {
    tree: {
      type: Object,
      default: null
    },
    parent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      items: [],
      hasChildren: false
    };
  },
  computed: {
    title() {
      return this.tree[this.$parent.viewOptions.title];
    }
  },
  created() {
    var self = this;
    this.$api
      .getItems(this.parent.collection, {
        filter: {
          [this.parent.viewOptions.parent]: this.tree.id
        },
        limit: 1
      })
      .then(result => {
        self.hasChildren = result.data.length > 0;
      });
  },
  methods: {
    loadItems() {
      var self = this;
      this.$api
        .getItems(this.parent.collection, {
          filter: {
            [this.parent.viewOptions.parent]: this.tree.id
          },
          sort: "-" + this.parent.viewOptions.title
        })
        .then(result => {
          self.items = result.data;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.subTree {
}
</style>

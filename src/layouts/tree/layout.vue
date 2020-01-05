<template>
  <div ref="tree" class="tree">
    <Tree
      v-for="(item, index) in items"
      :key="item.id"
      :tree="item"
      :parent="self"
      :depth="folderDepth[item.id]"
      :last="index == items.length - 1"
    ></Tree>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";
import Tree from "./Tree.vue";

export default {
  components: {
    Tree
  },
  mixins: [mixin],
  data() {
    return {
      self: this,
      folderDepth: {}
    };
  },
  computed: {},
  watch: {
    items(items) {
      if (items.length > 0) {
        var self = this;
        this.loadDepthIds(items).then(result => {
          self.folderDepth = result;
        });
      }
    }
  },
  created() {
    //document.addEventListener("scroll", this.scroll);
    if (this.viewOptions.parent && this.viewOptions.title) {
      var query = {
        filter: {
          [this.viewOptions.parent]: {
            null: ""
          }
        },
        sort: "" + this.viewOptions.title
      };
      this.$emit("query", query);
    }
  },
  destroyed() {
    //document.removeEventListener("scroll", this.scroll);
  },
  methods: {
    scroll(event) {
      var timeline = this.$refs.tree;
      var toBottom = timeline.offsetTop + timeline.clientHeight - window.innerHeight - event.pageY;

      if (toBottom < 100 && !this.lazyLoading) {
        this.$emit("next-page");
      }
    },
    async loadItems(id) {
      var parent = this.viewOptions.parent;
      var items = await this.$api.getItems(this.collection, {
        filter: { [parent]: id },
        sort: "-" + this.viewOptions.title
      });
      return items.data;
    },
    async loadDepthIds(items) {
      var itemIds = _.map(items, item => item.id);

      var parent = this.viewOptions.parent;
      var filter = {
        filter: { [parent]: { in: itemIds.join(",") } },
        fields: parent
      };
      var ids = await this.$api.getItems(this.collection, filter);

      ids = _.map(ids.data, id => id[parent]);

      var folderDepth = {};
      _.forEach(itemIds, id => {
        folderDepth[id] = ids.includes(id);
      });

      return folderDepth;
    }
  }
};
</script>

<style lang="scss" scoped>
.tree {
  padding: var(--page-padding);
}
</style>

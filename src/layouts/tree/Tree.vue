<template>
  <div class="sub-tree">
    <div v-if="tree.id" class="tree-title">
      <v-icon v-if="icon" class="icon" :name="icon"></v-icon>
      <span>
        <router-link class="title" :to="root.createLink(tree.id, tree.__collection__)">
          {{ title }}
        </router-link>
        <v-icon
          v-if="openIcon"
          class="open"
          :name="openIcon"
          @click.native.stop="loadItems"
        ></v-icon>
        <v-icon class="edit" name="edit"></v-icon>
      </span>
      <v-spinner v-if="loading" class="spinner" size="15" line-fg-color="#263238"></v-spinner>
    </div>
    <draggable
      class="sub-trees"
      :class="{ root: tree.id == null }"
      tag="div"
      group="tree"
      :list="items"
      @change="change"
      @start="root.dragging = true"
      @end="root.dragging = false"
    >
      <div
        v-for="(item, index) in items"
        v-show="!loading && allLoaded && open"
        :key="item.__collection__ + item.id"
      >
        <Tree
          v-if="item.__collection__ == root.collection"
          :tree="item"
          :root="root"
          :depth="folderDepth[item.id]"
          @itemChange="$set(items[index], 'tree', $event)"
          @updateDepth="updateDepth(item, $event)"
        ></Tree>
        <Leaf v-else :key="item.id" :item="item" :root="root"></Leaf>
      </div>
    </draggable>
  </div>
</template>

<script>
import Leaf from "./Leaf.vue";

export default {
  name: "Tree",
  components: {
    Leaf
  },
  props: {
    tree: {
      type: Object,
      default: null
    },
    root: {
      type: Object,
      default: null
    },
    depth: {
      type: Boolean,
      default: null
    },
    last: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      items: [],
      folderDepth: {},
      open: false,
      loading: false,
      allLoaded: false
    };
  },
  computed: {
    title() {
      return this.tree[this.root.viewOptions.title];
    },
    icon() {
      if (!this.root.viewOptions.icon)
        return this.$store.state.collections[this.root.collection].icon;
      return this.root.viewOptions.icon;
    },
    openIcon() {
      if (this.depth) {
        return this.open ? "arrow_drop_up" : "arrow_drop_down";
      } else {
        return null;
      }
    }
  },
  watch: {
    items(newVal) {
      this.$emit("itemChange", newVal);
    }
  },
  created() {
    if (this.tree.id == null) {
      this.loadItems();
    }
  },
  methods: {
    change($event) {
      if ($event.added) {
        var item = $event.added.element;

        this.root.updateItem(item.id, item.__collection__, this.tree.id);
        this.$set(this.folderDepth, item.id, item.depth);

        if (this.items.length == 1) {
          if (!this.depth) {
            this.allLoaded = true;
          }
          this.$emit("updateDepth", true);
          this.loadItems();
        }
        this.open = true;
      } else if ($event.removed) {
        if (this.items.length == 0) {
          this.$emit("updateDepth", false);
        }
      }
    },
    updateDepth(item, event) {
      this.$set(this.folderDepth, item.id, event);

      //otherwhise Vue doesnt update property on child
      var folderDepth = this.folderDepth;
      this.folderDepth = {};
      setTimeout(() => {
        this.folderDepth = folderDepth;
      }, 0);
    },
    loadItems() {
      if (!this.depth) return;

      if (!this.open) {
        this.loading = true;
      }
      this.open = !this.open;

      if (this.allLoaded) {
        this.loading = false;
        return;
      }
      this.root
        .loadItems(this.tree.id)
        .then(result => {
          this.items.push(...result);
          return this.root.loadDepthIds(result);
        })
        .then(result => {
          _.forEach(result, (value, key) => {
            this.folderDepth[key] = value;
            var index = _.findIndex(this.items, item => item.id == key);
            this.$set(this.items[index], "depth", value);
          });
          this.loading = false;
          this.allLoaded = true;
        });

      this.root.loadConnectionItems(this.tree.id).then(result => {
        this.items.push(...result);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.sub-tree {
  position: relative;

  .tree-title {
    height: 30px;
    font-size: 16px;

    display: flex;
    align-items: center;

    .icon {
      margin-right: 5px;
      cursor: pointer;
      z-index: 1;
    }

    span {
      display: flex;
      align-items: center;
      cursor: pointer;
      .title {
        text-decoration: none;
      }

      .edit {
        display: none;
      }
      &:hover .edit {
        display: block;
      }
    }

    .spinner {
      margin-left: 5px;
    }
  }
  .sub-trees {
    align-self: left;
    margin-left: 20px;

    &.root {
      margin-left: 0px;
    }
  }
}
</style>

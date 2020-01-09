<template>
  <div class="sub-tree">
    <div v-show="!last" class="line"></div>
    <div class="dot"></div>
    <svg v-show="openable && open && !loading" class="child-link" view-box="20 30">
      <path d="M 0,0 C 0,25 25,0 20,30 " />
    </svg>
    <div class="tree-title">
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
      v-show="(!loading && allLoaded && open) || root.dragging"
      class="sub-trees"
      tag="div"
      group="tree"
      :list="items"
      @change="change"
      @start="root.dragging = true"
      @end="root.dragging = false"
    >
      <div v-for="(item, index) in items" :key="item.__collection__ + item.id">
        <Tree
          v-if="item.__collection__ == root.collection"
          :tree="item"
          :root="root"
          :depth="folderDepth[item.id]"
          :last="index == items.length - 1"
          @itemChange="$set(items[index], 'tree', $event)"
        ></Tree>
        <Leaf
          v-else
          :key="item.id"
          :item="item"
          :root="root"
          :last="index == items.length - 1"
        ></Leaf>
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
      default: false
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
      openable: false,
      loading: false,
      allLoaded: false
    };
  },
  computed: {
    title() {
      return this.tree[this.root.viewOptions.title];
    },
    icon() {
      return this.root.viewOptions.icon;
    },
    openIcon() {
      if (this.openable) {
        return this.open ? "arrow_drop_up" : "arrow_drop_down";
      } else {
        return null;
      }
    }
  },
  watch: {
    depth(value) {
      if (value != null) this.openable = this.depth;
    },
    items(newVal) {
      this.$emit("itemChange", newVal);
    }
  },
  methods: {
    change($event) {
      if ($event.added) {
        var item = $event.added.element;
        this.root.updateItem(item.id, item.__collection__, this.tree.id);
        if (this.items.length == 1) {
          this.allLoaded = true;
        }
        this.open = true;
      }
      this.openable = this.items.length > 0;
    },
    loadItems() {
      if (!this.openable) return;

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
          this.folderDepth = result;
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
    border: 1px dotted var(--gray);
    //min-height: 30px;
  }

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

  .child-link {
    display: none;
    position: absolute;
    width: 30px;
    height: 30px;
    float: left;
    top: 15px;
    left: -11px;
    stroke: var(--dark-gray);
    stroke-width: 2px;
    fill: none;
  }
}
</style>

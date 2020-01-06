<template>
  <div class="sub-tree">
    <div v-show="!last" class="line"></div>
    <div class="dot"></div>
    <svg v-show="depth && open && !loading" class="child-link" view-box="20 30">
      <path d="M 0,0 C 0,25 25,0 20,30 " />
    </svg>
    <div class="tree-title">
      <v-icon v-if="icon" class="icon" :name="icon" @click.native.stop="loadItems"></v-icon>
      <span @click.stop="parent.openItem(tree.id, false)">
        {{ title }}
        <v-icon class="edit" name="edit"></v-icon>
      </span>
      <v-spinner v-if="loading" class="spinner" size="15" line-fg-color="#263238"></v-spinner>
    </div>
    <div v-show="depth && open && !loading && allLoaded" class="sub-trees">
      <Tree
        v-for="(item, index) in items"
        :key="item.id"
        :tree="item"
        :parent="parent"
        :depth="folderDepth[item.id]"
        :last="index == items.length - 1"
      ></Tree>
    </div>
    <div v-show="depth && open && !loading && allLoaded" class="sub-friends">
      <Leaf
        v-for="(item, index) in friends"
        :key="item.id"
        :item="item"
        :parent="parent"
        :last="index == friends.length - 1"
      ></Leaf>
    </div>
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
    parent: {
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
      friends: [],
      folderDepth: {},
      open: false,
      loading: false,
      allLoaded: false
    };
  },
  computed: {
    title() {
      return this.tree[this.parent.viewOptions.title];
    },
    icon() {
      if (this.depth) {
        var folder = this.parent.viewOptions.folder || "folder";
        var folderOpen = this.parent.viewOptions.folderOpen || "folder_open";
        return this.open ? folderOpen : folder;
      } else {
        return this.parent.viewOptions.item;
      }
    }
  },
  created() {},
  methods: {
    loadItems() {
      if (!this.depth) return;

      if (!this.open) {
        this.loading = true;
      }
      this.open = !this.open;

      var self = this;
      if (this.allLoaded) {
        this.loading = false;
        return;
      }
      this.parent
        .loadItems(this.tree.id)
        .then(result => {
          self.items = result;

          return self.parent.loadDepthIds(result);
        })
        .then(result => {
          self.folderDepth = result;
          self.loading = false;
          self.allLoaded = true;
        });

      this.parent.loadFriendItems(this.tree.id).then(result => {
        self.friends = result;
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
  }
  .sub-friends {
    align-self: left;
    margin-left: 20px;
  }

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

  .child-link {
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

<template>
  <div class="sub-tree" @click.stop="loadItems">
    <div v-show="!last" class="line"></div>
    <div class="dot"></div>
    <svg v-show="depth && open" class="child-link" view-box="20 30">
      <path d="M 0,0 C 0,25 25,0 20,30 " />
    </svg>
    <div class="tree-title">
      <v-icon v-if="depth" :name="open ? 'folder_open' : 'folder'"></v-icon>
      {{ title }}
    </div>
    <div v-if="open" class="sub-trees">
      <Tree
        v-for="(item, index) in items"
        :key="item.id"
        :tree="item"
        :parent="parent"
        :depth="folderDepth[item.id]"
        :last="index == items.length - 1"
      ></Tree>
    </div>
  </div>
</template>

<script>
export default {
  name: "Tree",
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
      folderDepth: {},
      open: false
    };
  },
  computed: {
    title() {
      return this.tree[this.parent.viewOptions.title];
    }
  },
  created() {},
  methods: {
    loadItems() {
      this.open = !this.open;
      var self = this;
      if (this.items.length > 0) return;
      this.parent
        .loadItems(this.tree.id)
        .then(result => {
          self.items = result;

          return self.parent.loadDepthIds(result);
        })
        .then(result => {
          self.folderDepth = result;
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

    i {
      margin-right: 5px;
    }
  }
  .sub-trees {
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

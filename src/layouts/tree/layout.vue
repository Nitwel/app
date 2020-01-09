<template>
  <div ref="tree" class="tree">
    <draggable
      v-if="(viewOptions.parent && viewOptions.title) || reload"
      tag="div"
      class="items"
      group="tree"
      :list="rootItems"
      @change="change"
      @start="dragging = true"
      @end="dragging = false"
    >
      <Tree
        v-for="(item, index) in rootItems"
        :key="item.id"
        :tree="item"
        :root="root"
        :depth="folderDepth[item.id]"
        :last="index == items.length - 1"
        @itemChange="$set(rootItems[index], 'tree', $event)"
      ></Tree>
    </draggable>
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
      root: this,
      folderDepth: {},
      reload: false,
      dragging: false,
      rootItems: []
    };
  },
  computed: {},
  watch: {
    items(items) {
      if (items.length > 0) {
        this.rootItems = items;
        for (let i = 0; i < items.length; i++) {
          this.$set(this.rootItems[i], "__collection__", this.collection);
        }
        this.loadDepthIds(items).then(result => {
          this.folderDepth = result;
        });
      }
    },
    viewOptions(newValue, oldValue) {
      // resetting the layout to apply updates
      if (newValue.connections != oldValue.connections && this.items.length > 0) {
        this.loadDepthIds(this.items).then(result => {
          this.folderDepth = result;
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
    change($event) {
      if ($event.added) {
        var item = $event.added.element;
        this.updateItem(item.id, item.__collection__, null);
      }
    },
    scroll(event) {
      var timeline = this.$refs.tree;
      var toBottom = timeline.offsetTop + timeline.clientHeight - window.innerHeight - event.pageY;

      if (toBottom < 100 && !this.lazyLoading) {
        this.$emit("next-page");
      }
    },
    updateItem(id, collection, parentId) {
      if (collection == this.collection) {
        var parent = this.viewOptions.parent;

        this.$api.updateItem(collection, id, {
          [parent]: parentId
        });
      } else {
        var connections = this.viewOptions.connections;
        var collectionInfo = _.find(connections, con => con.collection == collection);

        this.$api.updateItem(collection, id, {
          [collectionInfo.parent]: parentId
        });
      }
    },
    async loadItems(id) {
      var parent = this.viewOptions.parent;
      var items = await this.$api.getItems(this.collection, {
        filter: { [parent]: id },
        sort: "-" + this.viewOptions.title
      });
      items = items.data;
      _.forEach(items, item => (item.__collection__ = this.collection));
      return items;
    },
    async loadConnectionItems(id) {
      var parent = this.viewOptions.parent;
      var connections = this.viewOptions.connections;

      if (!parent || !connections) return;

      var promises = [];
      connections.forEach(connection => {
        promises.push(
          this.$api.getItems(connection.collection, {
            filter: { [connection.field]: id }
          })
        );
      });

      var items = [];
      var results = await Promise.all(promises);
      _.forEach(results, (itemCollection, index) => {
        itemCollection = itemCollection.data;
        _.forEach(itemCollection, item => {
          item.__collection__ = connections[index].collection;
        });
        items.push(...itemCollection);
      });

      return items;
    },
    async loadDepthIds(items) {
      var itemIds = _.map(items, item => item.id);

      var parent = this.viewOptions.parent;
      var connections = this.viewOptions.connections;

      var ids = await this.$api.getItems(this.collection, {
        filter: { [parent]: { in: itemIds.join(",") } },
        fields: parent
      });
      ids = _.uniq(_.map(ids.data, id => id[parent]));

      var promises = [];
      connections.forEach(connection => {
        promises.push(
          this.$api.getItems(connection.collection, {
            filter: { [connection.field]: { in: itemIds.join(",") } },
            fields: connection.field
          })
        );
      });

      var connectionResults = await Promise.all(promises);
      var connectionIds = [];

      _.forEach(connectionResults, (ids, index) => {
        connectionIds.push(..._.map(ids.data, id => id[connections[index].field]));
      });

      var folderDepth = {};
      _.forEach(itemIds, id => {
        folderDepth[id] = ids.includes(id) || connectionIds.includes(id);
      });

      return folderDepth;
    },
    createLink(id, collection) {
      var projectKey = this.$store.state.currentProjectKey;
      return `/${projectKey}/collections/${collection}/${id}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.tree {
  padding: var(--page-padding);
}
</style>

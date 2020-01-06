<template>
  <div ref="tree" class="tree">
    <div v-if="viewOptions.parent && viewOptions.title">
      <Tree
        v-for="(item, index) in items"
        :key="item.id"
        :tree="item"
        :parent="self"
        :depth="folderDepth[item.id]"
        :last="index == items.length - 1"
      ></Tree>
    </div>
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
    },
    viewOptions(newValue, oldValue) {
      if (
        (newValue.friends != oldValue.friends || newValue.friendsField != oldValue.friendsField) &&
        this.items.length > 0
      ) {
        var self = this;
        var items = this.items;
        this.items = [];
        setTimeout(() => {
          self.items = items;
        }, 1);
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
    async loadFriendItems(id) {
      var parent = this.viewOptions.parent;
      var friends = this.viewOptions.friends;
      var friendsField = this.viewOptions.friendsField;
      if (!parent || !friends || !friendsField) return;

      var items = await this.$api.getItems(friends, {
        filter: { [friendsField]: id }
      });
      return items.data;
    },
    async loadDepthIds(items) {
      var itemIds = _.map(items, item => item.id);

      var parent = this.viewOptions.parent;
      var friends = this.viewOptions.friends;
      var friendsField = this.viewOptions.friendsField;

      var ids = await this.$api.getItems(this.collection, {
        filter: { [parent]: { in: itemIds.join(",") } },
        fields: parent
      });

      var friendIds;

      if (friends && friendsField) {
        friendIds = await this.$api.getItems(friends, {
          filter: { [friendsField]: { in: itemIds.join(",") } },
          fields: friendsField
        });
        friendIds = _.map(friendIds.data, id => id[friendsField]);
      }

      ids = _.map(ids.data, id => id[parent]);

      var folderDepth = {};
      _.forEach(itemIds, id => {
        folderDepth[id] = ids.includes(id) || (friendIds && friendIds.includes(id));
      });

      return folderDepth;
    },
    openItem(id, friend) {
      var collection = friend ? this.viewOptions.friends : this.collection;
      var projectKey = this.$store.state.currentProjectKey;
      this.$router.push(`/${projectKey}/collections/${collection}/${id}`);
    }
  }
};
</script>

<style lang="scss" scoped>
.tree {
  padding: var(--page-padding);
}
</style>

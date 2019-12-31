<template>
  <div class="tree">
    <Tree v-for="item in items" :key="item" :parent="item"></Tree>
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
      a: ""
    };
  },
  computed: {},
  created() {
    document.addEventListener("scroll", this.scroll);

    var query = {
      filter: {
        [this.viewOptions.parent]: {
          null: ""
        }
      },
      sort: "-" + this.viewOptions.title
    };
    this.$emit("query", query);
  },
  destroyed() {
    document.removeEventListener("scroll", this.scroll);
  },
  methods: {
    scroll(event) {
      var timeline = this.$refs.timeline;
      var toBottom = timeline.offsetTop + timeline.clientHeight - window.innerHeight - event.pageY;

      if (toBottom < 100 && !this.lazyLoading) {
        this.$emit("next-page");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.tree {
  margin-top: 32px;
}
</style>

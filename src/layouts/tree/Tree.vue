<template>
  <div class="subTree" @click="loadChildren">
    {{ title }}
    <Tree></Tree>
  </div>
</template>

<script>
import Tree from "./Tree.vue";

export default {
  components: {
    Tree
  },
  props: {
    parent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {};
  },
  computed: {
    title() {
      return this.parent[this.$parent.viewOptions.title];
    }
  },
  methods: {
    loadChildren() {}
  }
};
</script>

<style lang="scss" scoped>
.subTree {
}
</style>

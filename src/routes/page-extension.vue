<template>
  <v-not-found v-if="exists === false" />
  <v-ext-page v-else :id="id" />
</template>

<script>
import store from "../store/";
import VNotFound from "./not-found.vue";

export default {
  name: "PageExtension",
  metaInfo() {
    const page = this.$store.state.extensions.pages[this.id];

    if (!page) return null;

    return {
      title: page.name
    };
  },
  components: {
    VNotFound
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      exists: false
    };
  },
  beforeRouteEnter(to, from, next) {
    const pages = store.state.extensions.pages;
    const id = to.params.id;

    let exists = false;

    if (pages.hasOwnProperty(id)) {
      exists = true;
    }

    return next(vm => {
      vm.exists = exists;
    });
  },
  beforeRouteUpdate(to, from, next) {
    const pages = this.$store.state.extensions.pages;
    const id = this.id;

    this.exists = false;

    if (pages.hasOwnProperty(id)) {
      this.exists = true;
    }

    return next();
  }
};
</script>

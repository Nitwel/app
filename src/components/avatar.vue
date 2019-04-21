<template>
  <div class="v-avatar">
    <div
      :style="{
        // borderColor: `var(--${color})`,
        width: `${size}px`,
        height: `${size}px`
      }"
      class="wrapper"
    >
      <img
        v-if="src != null && !error"
        v-show="!error && loading === false"
        :src="src"
        :alt="alt"
        @load="loading = false"
        @error="onImageLoadingError"
      />
      <v-icon v-else :style="{ fontSize: size / 2 + 2 + 'px' }" name="person" />
    </div>
    <div v-if="indicator" :style="{ backgroundColor: `var(--${color})` }" class="indicator" />
  </div>
</template>

<script>
export default {
  name: "v-avatar",
  props: {
    src: {
      type: String,
      default: null
    },
    alt: {
      type: String,
      required: true
    },
    indicator: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "accent"
    },
    size: {
      type: Number,
      default: 40
    }
  },
  data() {
    return {
      loading: false,
      error: false
    };
  },
  methods: {
    onImageLoadingError(error) {
      this.error = error;
      this.loading = false;
    }
  },
  watch: {
    src() {
      this.error = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-avatar {
  position: relative;
}

.wrapper {
  border-radius: 50%;
  border: 2px solid var(--lighter-gray);
  background-color: var(--white);
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}

img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

i {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-55%);
  color: var(--lighter-gray);
  text-align: center;
}

.indicator {
  position: absolute;
  bottom: 3%;
  right: 3%;
  border-radius: 50%;
  border: 2px solid white;
  width: 12px;
  height: 12px;
}
</style>

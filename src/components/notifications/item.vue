<template>
  <div class="notification" :class="item.type">
    <div class="icon-main" :style="{ backgroundColor: ringColor }">
      <v-icon :color="iconColor" :name="item.iconMain" />
    </div>
    <div class="content">
      <div class="title">{{ item.title }}</div>
      <div class="details" v-html="detailHtml"></div>
    </div>
    <div class="icon-right" @click="actionClick">
      <v-icon :name="item.iconRight" />
    </div>
  </div>
</template>
<script>
import { mapMutations } from "vuex";
import { REMOVE_NOTIFICATION } from "@/store/mutation-types";
export default {
  name: "v-item",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    detailHtml() {
      return this.item.details !== undefined ? this.$helpers.snarkdown(this.item.details) : "";
    },
    iconColor() {
      return this.item.color !== undefined
        ? `var(--${this.item.color}-500)`
        : "var(--blue-gray-500)";
    },
    ringColor() {
      return this.item.color !== undefined
        ? `var(--${this.item.color}-100)`
        : "var(--blue-gray-100)";
    }
  },
  methods: {
    ...mapMutations("notifications", [REMOVE_NOTIFICATION]),
    startItemTimeout() {
      if (this.item.delay !== undefined && this.item.delay > 0) {
        setTimeout(() => this.removeItemFromStore(), this.item.delay);
      }
    },
    removeItemFromStore() {
      this.$store.commit(REMOVE_NOTIFICATION, this.item.id);
    },
    actionClick() {
      if (!(this.item.onClick instanceof Function)) {
        throw new Error("Notification callback is not a function");
      }
      this.item.onClick();
      this.removeItemFromStore();
    }
  },
  mounted() {
    this.startItemTimeout();
  }
};
</script>
<style lang="scss" scoped>
.notification {
  display: flex;
  align-items: center;
  min-height: 64px;
  width: 100%;
  border: var(--input-border-width) solid var(--lighter-gray);
  border-radius: 5px;
  margin-bottom: 12px;
  padding: 10px;
  background-color: var(--white);
}

.icon-main {
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--lighter-gray);
}

.icon-right {
  width: 20px;
  height: 20px;
  margin-left: auto;
  color: var(--lighter-gray);
  transition: color var(--fast) var(--transition);
  cursor: pointer;

  &:hover {
    color: var(--light-gray);
  }
}

.content {
  padding-left: 10px;
  padding-right: 10px;
}

.title {
  font-weight: 700;
}

.details {
  color: var(--light-gray);
}

.error {
  .icon-main {
    background-color: var(--red-100);
    i {
      color: var(--red-500);
    }
  }
}

.success {
  .icon-main {
    background-color: var(--green-100);
    i {
      color: var(--green-500);
    }
  }
}

.warning {
  .icon-main {
    background-color: var(--amber-100);
    i {
      color: var(--amber-500);
    }
  }
}

.info {
  .icon-main {
    background-color: var(--blue-100);
    i {
      color: var(--blue-500);
    }
  }
}
</style>

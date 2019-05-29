<template>
  <v-popover placement="right-start" offset="5">
    <button class="box" :class="[{ none: value === null }, value]">
      <v-icon v-if="value === 'none'" class="icon" name="close" size="16" />
      <v-icon v-else-if="value === 'mine'" class="icon" name="person" size="16" />
      <v-icon v-else-if="value === 'role'" class="icon" name="group" size="16" />
      <v-icon v-else-if="value === 'full'" class="icon" name="check" size="16" />
      <v-icon v-else-if="value === 'read'" class="icon" name="remove_red_eye" size="16" />
      <v-icon v-else-if="value === 'create'" class="icon" name="add" size="16" />
      <v-icon v-else-if="value === 'update'" class="icon" name="edit" size="16" />
      <v-icon v-else-if="value === 'always'" class="icon" name="announcement" size="16" />
      <v-icon v-else-if="value === 'indeterminate'" class="icon" name="remove" size="16" />
    </button>
    <template slot="popover">
      <div class="popover-content">
        <button
          v-for="option in options"
          :key="option"
          v-close-popover
          @click="$emit('input', option)"
        >
          <div class="box" :class="option">
            <v-icon v-if="option === 'none'" class="icon" name="close" size="16" />
            <v-icon v-else-if="option === 'mine'" class="icon" name="person" size="16" />
            <v-icon v-else-if="option === 'role'" class="icon" name="group" size="16" />
            <v-icon v-else-if="option === 'full'" class="icon" name="check" size="16" />
            <v-icon v-else-if="option === 'read'" class="icon" name="remove_red_eye" size="16" />
            <v-icon v-else-if="option === 'create'" class="icon" name="add" size="16" />
            <v-icon v-else-if="option === 'update'" class="icon" name="edit" size="16" />
            <v-icon v-else-if="option === 'always'" class="icon" name="announcement" size="16" />
          </div>

          <template v-if="option === 'none'">
            {{ $t("permission_states.none") }}
          </template>
          <template v-if="option === 'mine'">
            {{ $t("permission_states.mine") }}
          </template>
          <template v-if="option === 'role'">
            {{ $t("permission_states.role") }}
          </template>
          <template v-if="option === 'full'">
            {{ $t("permission_states.full") }}
          </template>
          <template v-if="option === 'read'">
            {{ $t("permission_states.read") }}
          </template>
          <template v-if="option === 'create'">
            {{ $t("permission_states.create") }}
          </template>
          <template v-if="option === 'update'">
            {{ $t("permission_states.update") }}
          </template>
          <template v-if="option === 'always'">
            {{ $t("permission_states.always") }}
          </template>
        </button>
      </div>
    </template>
  </v-popover>
</template>

<script>
export default {
  name: "PermissionToggle",
  props: {
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: String,
      default: "none"
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  width: 18px;
  height: 18px;
  border: 2px solid;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: var(--fast) var(--transition);
  position: relative;
}

.icon {
  position: relative;
  top: -1px;
  left: 0px;
  font-size: 16px;
  color: var(--white);
}

.none {
  border-color: var(--lighter-gray);
}

.mine {
  background-color: var(--orange);
  border-color: var(--orange);
}

.role {
  background-color: var(--yellow-700);
  border-color: var(--yellow-700);
}

.full {
  background-color: var(--success);
  border-color: var(--success);
}

.read {
  background-color: var(--orange);
  border-color: var(--orange);
}

.create {
  background-color: var(--orange);
  border-color: var(--orange);
}

.update {
  background-color: var(--orange);
  border-color: var(--orange);
}

.always {
  background-color: var(--warning);
  border-color: var(--warning);
}

.indeterminate {
  background-color: var(--light-gray);
  border-color: var(--light-gray);
}

.popover-content {
  button {
    display: flex;
    align-items: center;
    text-transform: uppercase;
    font-weight: 700;
    font-size: 12px;
    color: var(--light-gray);

    // Hack to fix misaligned icons
    i {
      top: 0;
      left: 0;
    }

    &:hover {
      color: var(--dark-gray);
    }
  }

  .box {
    margin: 5px 10px 5px 0;
  }
}
</style>

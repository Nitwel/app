<template>
  <div class="header">
    <div class="row">
      <div class="cell style-4">{{ $t("collection") }}</div>
      <div class="cell style-4">
        <button
          type="button"
          v-tooltip="$t('create')"
          class="cell"
          @click="$emit('toggle-all', 'create')"
        >
          <v-icon name="add_circle" />
        </button>
      </div>
      <div class="cell style-4">
        <button
          type="button"
          v-tooltip="$t('read')"
          class="cell"
          @click="$emit('toggle-all', 'read')"
        >
          <v-icon name="visibility" />
        </button>
      </div>
      <div class="cell style-4">
        <button
          type="button"
          v-tooltip="$t('update')"
          class="cell"
          @click="$emit('toggle-all', 'update')"
        >
          <v-icon name="edit" />
        </button>
      </div>
      <div class="cell style-4">
        <button
          type="button"
          v-tooltip="$t('delete')"
          class="cell"
          @click="$emit('toggle-all', 'delete')"
        >
          <v-icon name="delete" />
        </button>
      </div>
      <div class="cell style-4">
        <button
          type="button"
          v-tooltip="$t('comment')"
          class="cell"
          @click="$emit('toggle-all', 'comment')"
        >
          <v-icon name="comment" />
        </button>
      </div>
      <!-- <div class="cell">{{ $t("explain") }}</div> -->
      <div class="cell style-4">{{ $t("fields") }}</div>
      <div class="cell style-4">{{ $t("statuses") }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header {
  height: 60px;
  .row {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 60px;
    .material-icons {
      margin-left: -2px;
    }
  }

  button {
    transition: color var(--fast) var(--transition);
  }

  button:hover {
    transition: none;
    color: var(--dark-gray);
  }
}
</style>

<template>
  <div class="v-diff">
    <div v-for="{ field, before, after } in changes" class="change" :key="field">
      <p>{{ $helpers.formatTitle(field) }}</p>
      <div class="diff">
        <div :class="{ empty: !before }" class="before">
          {{ before || "--" }}
        </div>
        <div :class="{ empty: !after }" class="after">{{ after || "--" }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "v-diff",
  props: {
    changes: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.change {
  width: 100%;
  margin-top: 14px;

  p {
    margin-bottom: 4px;
    color: var(--light-gray);
  }

  .diff {
    width: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;

    > div {
      width: 100%;
      padding: 4px 20px 4px 4px;
      font-size: 13px;
    }
  }

  .before {
    position: relative;
    color: var(--danger);
    background-color: #fdefed;
    &:after {
      content: "close";
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%);
      font-family: "Material Icons";
      color: var(--danger);
      display: inline-block;
      vertical-align: middle;
      margin: 0 5px;
    }
  }

  .after {
    position: relative;
    color: var(--success);
    background-color: #f6faf0;
    &:after {
      content: "check";
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%);
      font-family: "Material Icons";
      color: var(--success);
      display: inline-block;
      vertical-align: middle;
      margin: 0 5px;
    }
  }

  .empty {
    color: var(--gray);
    background-color: var(--lightest-gray);
    &:after {
      content: "block";
      position: absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-50%);
      font-family: "Material Icons";
      color: var(--gray);
      display: inline-block;
      vertical-align: middle;
      margin: 0 5px;
    }
  }
}
</style>

<template>
  <div class="display-translation">
    {{ $tc("item_count", (value || []).length, { count: (value || []).length }) }}
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/interface";

export default {
  mixins: [mixin]
};
</script>

<template>
  <div class="day">
    <div class="date">
      Activity on {{ $t("months." + $parent.monthNames[date.getMonth()]) }} {{ date.getDate() }},
      {{ date.getFullYear() }}
    </div>
    <div class="events">
      <Event
        v-for="(event, index) in events"
        :key="index"
        :data="event"
        :connect="index < events.length - 1"
      />
    </div>
  </div>
</template>

<script>
import Event from "./Event.vue";

export default {
  components: {
    Event
  },
  props: {
    date: {
      type: Date,
      default: new Date()
    },
    events: {
      type: Object,
      default: null
    }
  },
  data() {
    return {};
  },
  computed: {},
  created() {},
  mounted() {},
  destroyed() {},
  methods: {}
};
</script>

<style lang="scss" scoped>
.day {
  margin-bottom: 10px;

  .date {
    padding: 19px 32px; // 19 visually aligns it with the project switcher
    font-size: var(--size-2);
    border-bottom: 2px solid var(--lightest-gray);
    position: sticky;
    top: var(--header-height);
    background-color: var(--white);
    z-index: 2;
  }

  .events {
    padding: 15px 0px;
  }
}
</style>

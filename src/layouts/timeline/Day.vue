<template>
  <div class="day">
    <div class="date">
      Activity on {{ $t("layouts-timeline-months." + $parent.monthNames[date.getMonth()]) }}
      {{ date.getDate() }}, {{ date.getFullYear() }}
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
  props: ["date", "events"],
  components: {
    Event
  },
  data() {
    return {};
  },
  computed: {},
  methods: {},
  created() {},
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss" scoped>
.day {
  margin-bottom: 10px;

  .date {
    margin: 0px 50px;
    padding: 15px 0px;
    font-size: 18px;
    border-bottom: 2px solid var(--lightest-gray);
  }

  .events {
    padding: 15px 0px;
  }
}
</style>

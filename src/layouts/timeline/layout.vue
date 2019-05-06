<template>
  <div id="timeline" ref="timeline">
    <Day v-for="day in days" :key="day.id" :date="day.date" :events="day.events" />
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";
import Day from "./Day.vue";

export default {
  props: ["items"],
  components: {
    Day
  },
  data() {
    return {
      monthNames: [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december"
      ],
      weekNames: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    };
  },
  mixins: [mixin],
  computed: {
    events() {
      return this.$lodash.orderBy(this.items, ["date"], ["desc"]);
    },

    days() {
      var days = [];

      for (var i = 0; i < this.events.length; i++) {
        var item = this.events[i];

        var date = new Date(item.date.substr(0, 10) + "T00:00:00");
        var existingDay = this.$lodash.find(days, { date: date });

        var event = {
          time: new Date(item[this.viewOptions.date]),
          title: item[this.viewOptions.title],
          content: item[this.viewOptions.content],
          color: item[this.viewOptions.color],
          to: item.__link__
        };

        if (existingDay) {
          existingDay.events.push(event);
        } else {
          days.push({
            date: date,
            events: [event]
          });
        }
      }
      return days;
    }
  },
  methods: {
    scroll(event) {
      var timeline = this.$refs.timeline;
      var toBottom = timeline.offsetTop + timeline.clientHeight - window.innerHeight - event.pageY;

      if (toBottom < 100) {
        this.$emit("next-page");
      }
    }
  },
  created() {
    document.addEventListener("scroll", this.scroll);
  },
  destroyed() {
    document.removeEventListener("scroll", this.scroll);
  }
};
</script>

<style type="scss" scoped>
#timeline {
  margin-top: 30px;
}
</style>

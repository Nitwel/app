<template>
  <div id="timeline" ref="timeline">
    <Day v-for="day in days" :key="day.id" :date="day.date" :events="day.events" />
    <div v-if="lazyLoading" class="lazy-loader">
      <v-spinner line-fg-color="var(--light-gray)" line-bg-color="var(--lighter-gray)" />
    </div>
  </div>
</template>

<script>
import mixin from "@directus/extension-toolkit/mixins/layout";
import Day from "./Day.vue";

export default {
  components: {
    Day
  },
  mixins: [mixin],
  props: ["items"],
  data() {
    return {
      actionColor: {
        create: "success",
        update: "success",
        authenticate: "dark-gray",
        delete: "warning",
        upload: "accent"
      },
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
  computed: {
    days() {
      var days = [];

      for (var i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        
        if(!this.viewOptions.date)return

        var date = new Date(item[this.viewOptions.date].substr(0, 10) + "T00:00:00");
        var existingDay = this.$lodash.find(days, { date: date });

        var color = item[this.viewOptions.color];
        if (this.fields[this.viewOptions.color].field == "action") {
          color = this.actionColor[color];
        }

        var event = {
          time: new Date(item[this.viewOptions.date]),
          title: this.$helpers.micromustache.render(this.viewOptions.title, item),
          content: item[this.viewOptions.content],
          contentType: this.fields[this.viewOptions.content],
          color: color,
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
  created() {
    document.addEventListener("scroll", this.scroll);

    this.$emit("query", {
      sort: "-" + this.viewOptions.date
    });
  },
  destroyed() {
    document.removeEventListener("scroll", this.scroll);
  },
  methods: {
    scroll(event) {
      var timeline = this.$refs.timeline;
      var toBottom = timeline.offsetTop + timeline.clientHeight - window.innerHeight - event.pageY;

      if (toBottom < 100 && !this.lazyLoading) {
        this.$emit("next-page");
      }
    }
  }
};
</script>

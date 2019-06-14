<template>
  <portal to="modal">
    <v-modal
      :title="$t('select_existing')"
      :buttons="{
        done: {
          text: $t('done'),
          color: 'accent'
        }
      }"
      @done="$emit('done')"
      @close="$emit('cancel')"
    >
      <div class="search-sort">
        <input
          :placeholder="$t('search')"
          :value="searchQuery"
          type="search"
          @input="setSearchQuery"
        />

        <div class="select">
          <select v-model="sortField">
            <option v-for="field in fields" :key="field" :value="field">
              {{ $helpers.formatTitle(field) }}
            </option>
          </select>
          <v-icon name="arrow_drop_down" color="light-gray" />
        </div>

        <div class="select">
          <select v-model="sortDirection">
            <option value="asc">↑</option>
            <option value="desc">↓</option>
          </select>
          <v-icon name="arrow_drop_down" color="light-gray" />
        </div>
      </div>

      <div v-if="hydrating" class="spinner">
        <v-spinner />
      </div>

      <div v-if="items.length === 0 && !hydrating && !loading" class="not-found">
        {{ $t("no_results") }}
      </div>

      <div v-if="!hydrating && items.length > 0" class="items">
        <div class="head">
          <!-- Checkboxes -->
          <span />
          <span v-for="field in fields" :key="field">{{ $helpers.formatTitle(field) }}</span>
        </div>

        <label v-for="item in items" :key="uid + '_' + item[primaryKeyField]">
          <div class="input">
            <input
              :type="single ? 'radio' : 'checkbox'"
              :name="uid"
              :value="item[primaryKeyField]"
              :checked="isChecked(item[primaryKeyField])"
              @change="updateValue(item[primaryKeyField])"
            />
            <v-icon
              v-if="single"
              :name="
                isChecked(item[primaryKeyField]) ? 'radio_button_checked' : 'radio_button_unchecked'
              "
            />
            <v-icon
              v-else
              :name="isChecked(item[primaryKeyField]) ? 'check_box' : 'check_box_outline_blank'"
            />
          </div>

          <span v-for="fieldInfo in fieldsWithInfo" :key="uid + '_' + fieldInfo.field">
            <v-ext-display
              :id="uid + '_' + fieldInfo.field"
              :interface-type="fieldInfo.interface"
              :name="uid + '_' + fieldInfo.field"
              :type="fieldInfo.type"
              :datatype="fieldInfo.datatype"
              :options="fieldInfo.options"
              :value="item[fieldInfo.field]"
            />
          </span>
        </label>
      </div>

      <v-button
        v-if="moreItemsAvailable && !hydrating"
        class="more"
        bg="gray"
        color="black"
        :loading="loading"
        @click="loadMore"
      >
        {{ $t("load_more") }}
      </v-button>
    </v-modal>
  </portal>
</template>

<script>
import formatFilters from "@/helpers/format-filters";
import shortid from "shortid";

export default {
  name: "ItemSelect",
  props: {
    // The collection to fetch the items from. Has to be a string, eg `movies`
    collection: {
      type: String,
      required: true
    },

    // Array of fields to display in the table
    fields: {
      type: Array,
      required: true
    },

    // Array of filter objects in the app filter syntax. Allows the admin to setup what items to
    // show, eg
    //
    // [
    //   {
    //     "field": "title",
    //     "operator": "contains",
    //     "value": "directus"
    //   }
    // ]
    filters: {
      type: Array,
      default: () => []
    },

    // The current selection. In case of the single-selection mode this is a primary key, otherwise
    // it's an array of primary keys
    value: {
      type: [Array, String, Number],
      default: null
    },

    // Use single mode. This will use radio buttons instead of checkboxes so the user can only select
    // a single item
    single: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // The raw items fetched from the collection based on the filtes and fields that are requested
      items: [],

      // Total number of items in this collection
      totalCount: 0,

      // If the items are currently being loaded (fresh)
      loading: false,

      // Populated if something went wrong during the fetching of the items
      error: false,

      searchQuery: "",
      sortField: null,
      sortDirection: "asc",

      // First load in progress
      hydrating: true,

      // If the length of the last result is less than the limit, we know that there aren't any more
      // items to load.
      moreItemsAvailable: false
    };
  },
  computed: {
    // The primary key field of the collection of which we're fetching items
    primaryKeyField() {
      const collection = this.$store.state.collections[this.collection];
      if (!collection) return null;
      return _.find(collection.fields, { primary_key: true }).field;
    },

    // Unique ID for this interface. Will be used in the name field of the inputs
    uid() {
      return shortid.generate();
    },

    // The fields array from props augmented with the fields information from directus_collections
    // Allows us to render the value in the display component of the interface that's setup for this
    // field
    fieldsWithInfo() {
      return this.fields.map(fieldName => {
        return this.$store.state.collections[this.collection].fields[fieldName];
      });
    }
  },

  // Re-fetch the items whenever the collection / filters prop changes
  watch: {
    collection() {
      this.fetchItems();
    },
    filters: {
      deep: true,
      handler(before, after) {
        if (!_.isEqual(before, after)) this.fetchItems();
      }
    },
    sortField() {
      this.fetchItems();
    },
    sortDirection() {
      this.fetchItems();
    }
  },

  // Fetch the items on first load of the interface
  created() {
    this.sortField = this.fields[0];

    this.fetchItems();

    this.setSearchQuery = _.debounce(this.setSearchQuery, 200);

    // Fetch the total number of items in this collection, so we can accurately render the load more
    // button
    this.$api
      .getItems(this.collection, {
        meta: "total_count",
        limit: 1
      })
      .then(res => res.meta)
      .then(meta => (this.totalCount = meta.total_count))
      .catch(error => (this.error = error));
  },

  methods: {
    // Fetch the items based on the passed collection, filters, and fields prop
    fetchItems(options = {}) {
      const defaultOptions = {
        replace: true,
        offset: 0
      };

      options = _.merge(defaultOptions, options);

      this.loading = true;
      this.error = null;

      const params = {
        limit: 200,
        offset: options.offset,
        meta: "*"
      };

      if (this.searchQuery.length > 0) {
        params.q = this.searchQuery;
      }

      if (this.filters.length > 0) {
        params.filters = formatFilters(this.filters);
      }

      if (this.fields.length > 0) {
        params.fields = _.clone(this.fields);
      }

      let sortString = "";
      if (this.sortDirection === "desc") sortString += "-";
      sortString += this.sortField;

      params.sort = sortString;

      // No matter what, always fetch the primary key as that's used for the selection
      params.fields.push(this.primaryKeyField);

      this.$api
        .getItems(this.collection, params)
        .then(res => res.data)
        .then(items => {
          this.moreItemsAvailable = items.length === 200;

          if (options.replace) return (this.items = items);
          return (this.items = [...this.items, ...items]);
        })
        .catch(error => (this.error = error))
        .finally(() => {
          this.loading = false;
          this.hydrating = false;
        });
    },

    // Stage the value to the parent component
    updateValue(primaryKey) {
      if (this.single) {
        return this.$emit("input", primaryKey);
      }

      if (this.value.includes(primaryKey)) {
        this.$emit("input", this.value.filter(pk => pk !== primaryKey));
      } else {
        this.$emit("input", [...this.value, primaryKey]);
      }
    },

    // Check if the provided primaryKey is included in the selection
    isChecked(primaryKey) {
      if (this.single) {
        // non-strict comparison. It might happen that the numeric id 1 is returned as '1' by the api
        return this.value == primaryKey;
      }

      return this.value.includes(primaryKey);
    },

    // Set the search query
    setSearchQuery(event) {
      this.searchQuery = event.target.value;
      this.fetchItems();
    },

    // Request more items from the server and append to the end of the list
    loadMore() {
      const offset = this.items.length;
      this.fetchItems({
        offset: offset,
        replace: false
      });
    }
  }
};
</script>

<style scoped>
.items {
  display: table;
  min-width: 100%;
  padding: 0 32px;
  margin-bottom: 32px;
}
.items label:hover {
  background-color: var(--highlight);
  cursor: pointer;
}
.items label,
.items .head {
  display: table-row;
}
.head {
  position: sticky;
  display: block;
  top: 0px;
  font-weight: 500;
}
.items .head > * {
  display: table-cell;
  border-bottom: 2px solid var(--lightest-gray);
  padding: 12px 32px 12px 0;
}
.items label > * {
  display: table-cell;
  border-bottom: 2px solid var(--off-white);
  padding: 8px 32px 8px 0;
}
.items label > *:first-child,
.items .head > *:first-child {
  max-width: 20px;
  padding: 8px 20px 8px 0;
}
.input input,
.search-sort input[type="checkbox"] {
  position: absolute;
  left: -9999px;
  opacity: 0;
  visibility: hidden;
}
.spinner {
  width: 100%;
  padding: 80px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.search-sort {
  display: flex;
  border-bottom: 2px solid var(--lightest-gray);
  padding: 8px 0;
  padding-right: 32px;
  align-items: center;
}
.search-sort input[type="search"] {
  flex-grow: 1;
  font-size: 1rem;
  border: none;
  border-radius: 0;
  padding: 8px 0 8px 32px;
}
.search-sort input[type="search"]::placeholder {
  color: var(--lighter-gray);
}
.search-sort .select {
  position: relative;
}
.search-sort select {
  transition: all var(--fast) var(--transition);
  appearance: none;
  background-color: transparent;
  margin-left: 16px;
  border: 2px solid var(--lightest-gray);
  padding: 4px 8px;
  padding-right: 20px;
  cursor: pointer;
}
.search-sort select:hover {
  border-color: var(--dark-gray);
}
.search-sort .select i {
  position: absolute;
  right: 0px;
  top: 2px;
  pointer-events: none;
}
.more {
  margin: 32px auto;
}
.not-found {
  padding: 32px;
}
</style>

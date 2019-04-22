<template>
  <v-modal
    :title="existing ? $t('update_field') + ': ' + displayName : $t('create_field')"
    :tabs="tabs"
    :active-tab="activeTab"
    :buttons="buttons"
    @tab="activeTab = $event"
    @next="nextTab"
    @close="$emit('close')"
  >
    <template slot="interface">
      <template v-if="!existing">
        <h1 class="style-0">{{ $t("choose_interface") }}</h1>
      </template>
      <v-notice v-if="interfaceName" color="gray" class="currently-selected">
        {{ $t("currently_selected", { thing: interfaces[interfaceName].name }) }}
      </v-notice>
      <p v-else class="subtext">{{ $t("select_interface_below") }}</p>
      <div>
        <v-details
          v-for="group in interfacesGrouped"
          :title="group.title"
          :key="group.title"
          :open="true"
        >
          <div class="interfaces">
            <article
              v-for="ext in group.interfaces"
              :key="group.title + '-' + ext.id"
              :class="{ active: interfaceName === ext.id }"
              class="interface"
              @click="setInterface(ext.id)"
            >
              <div class="header">
                <v-icon :name="ext.icon || 'category'" size="48" color="white" />
              </div>
              <div class="body">
                <h2>{{ ext.name }}</h2>
                <p>Core Interface</p>
              </div>
            </article>
          </div>
        </v-details>
      </div>
    </template>

    <template slot="schema" v-if="interfaceName">
      <template v-if="!existing">
        <h1 class="style-0">
          {{ $t("name_field", { field: $helpers.formatTitle(interfaces[interfaceName].name) }) }}
        </h1>
        <p class="subtext">{{ $t("intelligent_defaults") }}</p>
      </template>
      <form @submit.prevent class="schema">
        <div class="name">
          <label>
            {{ $t("name") }}*
            <v-input
              type="text"
              v-model="field"
              :placeholder="$t('db_column_name')"
              class="name-input"
              :disabled="existing"
              :icon-right="iconToShow.icon"
              :icon-right-color="iconToShow.color"
              :icon-right-tooltip="iconToShow.tooltip"
            />
            <p class="small-text">
              {{ $t("display_name") }}:
              <b>{{ $helpers.formatTitle(field || "...") }}</b>
            </p>
          </label>
          <label>
            {{ $t("default_value") }}
            <v-input
              type="text"
              v-model="default_value"
              placeholder="NULL"
              :disabled="type === 'o2m' || type === 'translation'"
            />
          </label>
        </div>
        <label>
          {{ $t("note") }}
          <v-input type="text" v-model="note" :placeholder="$t('add_note')" />
        </label>

        <div class="toggles">
          <label class="toggle" v-if="type !== 'alias'">
            <v-toggle v-model="required" :disabled="fieldInfo.primary_key" />
            {{ $t("required") }}
          </label>
          <label class="toggle">
            <v-toggle v-model="readonly" />
            {{ $t("readonly") }}
          </label>
        </div>

        <details class="advanced" :open="existing">
          <summary>{{ $t("advanced_options") }}</summary>
          <div class="advanced-form">
            <label>
              {{ $t("field_type") }}
              <v-simple-select v-model="type">
                <option
                  v-for="typeOption in availableFieldTypes"
                  :key="typeOption"
                  :value="typeOption"
                  :selected="type === typeOption"
                >
                  {{ $helpers.formatTitle(typeOption) }}
                </option>
              </v-simple-select>
              <small class="description">{{ fieldTypeDescription }}</small>
            </label>
            <label>
              {{
                $t("db_datatype", {
                  db: $helpers.formatTitle(databaseVendor)
                })
              }}
              <v-simple-select v-model="datatype">
                <option
                  v-for="typeOption in availableDatatypes"
                  :key="typeOption"
                  :value="typeOption"
                  :selected="datatype === typeOption"
                >
                  {{ typeOption }}
                </option>
              </v-simple-select>
              <small class="description">
                {{ selectedDatatypeInfo && $t(selectedDatatypeInfo.description) }}
              </small>
            </label>
            <label>
              {{ $t("length") }}
              <v-input
                :type="selectedDatatypeInfo && selectedDatatypeInfo.decimal ? 'string' : 'number'"
                @input="length = $event"
                :value="lengthDisabled ? null : length"
                :disabled="lengthDisabled"
                :placeholder="lengthDisabled ? $t('length_disabled_placeholder') : ''"
              />
            </label>
            <label>
              {{ $t("validation") }}
              <v-input type="text" v-model="validation" :placeholder="$t('regex')" />
            </label>
            <label
              class="toggle"
              :class="{ disabled: primaryKeyDisabled }"
              v-tooltip="primaryKeyTooltip"
            >
              <v-toggle v-model="primary_key" :disabled="primaryKeyDisabled" />
              {{ $t("primary_key") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="unique" />
              {{ $t("unique") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="hidden_detail" />
              {{ $t("hidden_detail") }}
            </label>
            <label class="toggle">
              <v-toggle v-model="hidden_browse" />
              {{ $t("hidden_browse") }}
            </label>
            <label class="toggle" v-if="isNumeric">
              <v-toggle v-model="signed" />
              {{ $t("signed") }}
            </label>
          </div>
        </details>
      </form>
    </template>

    <template slot="relation" v-if="selectedInterfaceInfo && relation">
      <template v-if="!existing">
        <h1 class="style-0">{{ $t("relation_setup") }}</h1>
        <p class="subtext">
          {{ $t("relation_setup_copy", { relation: $t(relation) }) }}
        </p>
      </template>

      <form v-if="relation === 'm2o'" class="single">
        <p>{{ $t("this_collection") }}</p>

        <v-simple-select class="select" :value="relationInfo.collection_many" disabled>
          <option selected :value="collectionInfo.collection">
            {{ collectionInfo.collection }}
          </option>
        </v-simple-select>

        <v-simple-select class="select" :value="relationInfo.field_many" disabled>
          <option selected :value="field">{{ field }}</option>
        </v-simple-select>

        <v-icon name="arrow_backward" />

        <p>{{ $t("related_collection") }}</p>

        <v-simple-select class="select" v-model="relationInfo.collection_one">
          <optgroup :label="$t('collections')">
            <option
              v-for="collection in collectionsGrouped.user"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
          <optgroup label="Directus">
            <option
              v-for="collection in collectionsGrouped.system"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
        </v-simple-select>

        <v-simple-select
          class="select"
          :value="primaryKeyFieldByCollection(relationInfo.collection_one).field"
          disabled
        >
          <option selected :value="primaryKeyFieldByCollection(relationInfo.collection_one).field">
            {{ primaryKeyFieldByCollection(relationInfo.collection_one).field }}
          </option>
        </v-simple-select>
      </form>

      <form v-if="relation === 'o2m'" class="single">
        <p>{{ $t("this_collection") }}</p>

        <v-simple-select class="select" :value="collectionInfo.collection" disabled>
          <option selected :value="collectionInfo.collection">
            {{ collectionInfo.collection }}
          </option>
        </v-simple-select>

        <v-simple-select class="select" :value="primaryKeyField.field" disabled>
          <option selected :value="primaryKeyField.field">
            {{ primaryKeyField.field }}
          </option>
        </v-simple-select>

        <v-icon name="arrow_forward" />

        <p>{{ $t("related_collection") }}</p>

        <v-simple-select class="select" v-model="relationInfo.collection_many">
          <optgroup :label="$t('collections')">
            <option
              v-for="collection in collectionsGrouped.user"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
          <optgroup label="Directus">
            <option
              v-for="collection in collectionsGrouped.system"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
        </v-simple-select>

        <v-simple-select class="select" v-model="relationInfo.field_many">
          <option
            v-for="{ field } in fields(relationInfo.collection_many)"
            :key="field"
            :value="field"
          >
            {{ field }}
          </option>
        </v-simple-select>
      </form>

      <form v-if="relation === 'm2m'" class="full">
        <p>{{ $t("this_collection") }}</p>

        <v-simple-select class="select" :value="collectionInfo.collection" disabled>
          <option selected :value="collectionInfo.collection">
            {{ collectionInfo.collection }}
          </option>
        </v-simple-select>

        <v-simple-select class="select" :value="primaryKeyField.field" disabled>
          <option selected :value="primaryKeyField.field">
            {{ primaryKeyField.field }}
          </option>
        </v-simple-select>

        <v-icon name="arrow_forward" />

        <p>{{ $t("junction_collection") }}</p>

        <v-simple-select
          v-if="!createM2Mjunction"
          class="select"
          :value="relationInfoM2M[0].collection_many"
          @input="
            val => {
              relationInfoM2M[0].collection_many = val;
              relationInfoM2M[1].collection_many = val;
            }
          "
        >
          <optgroup :label="$t('collections')">
            <option
              v-for="collection in collectionsGrouped.user"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
          <optgroup label="Directus">
            <option
              v-for="collection in collectionsGrouped.system"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
        </v-simple-select>

        <v-input
          class="select"
          v-if="createM2Mjunction"
          type="text"
          v-model="createM2MjunctionName"
          :placeholder="
            autoM2Msuggestion(
              collectionInfo.collection,
              relationInfoM2M[currentM2MIndex == 0 ? 1 : 0].collection_one
            )
          "
        />

        <v-simple-select
          v-if="!createM2Mjunction"
          class="select"
          v-model="relationInfoM2M[currentM2MIndex].field_many"
        >
          <option
            v-for="{ field } in fields(relationInfoM2M[0].collection_many)"
            :key="field"
            :value="field"
          >
            {{ field }}
          </option>
        </v-simple-select>

        <v-input
          class="select"
          v-if="createM2Mjunction"
          type="text"
          v-model="relationInfoM2M[currentM2MIndex].field_many"
          :placeholder="autoM2Msuggestion(collectionInfo.collection, 'id')"
        />

        <v-simple-select
          v-if="!createM2Mjunction"
          class="select"
          v-model="relationInfoM2M[currentM2MIndex === 0 ? 1 : 0].field_many"
        >
          <option
            v-for="{ field } in fields(relationInfoM2M[0].collection_many)"
            :key="field"
            :value="field"
          >
            {{ field }}
          </option>
        </v-simple-select>

        <v-input
          class="select"
          v-if="createM2Mjunction"
          type="text"
          v-model="relationInfoM2M[currentM2MIndex === 0 ? 1 : 0].field_many"
          :placeholder="
            autoM2Msuggestion(relationInfoM2M[currentM2MIndex == 0 ? 1 : 0].collection_one, 'id')
          "
        />

        <v-checkbox
          value="m2mjunction"
          :label="$t('auto_generate')"
          id="createM2Mjunction"
          :checked="createM2Mjunction"
          @change="createM2Mjunction = !createM2Mjunction"
        />

        <v-icon name="arrow_backward" />

        <p>{{ $t("related_collection") }}</p>

        <v-simple-select
          class="select"
          v-model="relationInfoM2M[currentM2MIndex == 0 ? 1 : 0].collection_one"
        >
          <optgroup :label="$t('collections')">
            <option
              v-for="collection in collectionsGrouped.user"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
          <optgroup label="Directus">
            <option
              v-for="collection in collectionsGrouped.system"
              :key="collection"
              :value="collection"
            >
              {{ collection }}
            </option>
          </optgroup>
        </v-simple-select>

        <v-simple-select
          class="select"
          :value="
            primaryKeyFieldByCollection(
              relationInfoM2M[currentM2MIndex === 0 ? 1 : 0].collection_one
            ).field
          "
          disabled
        >
          <option
            selected
            :value="
              primaryKeyFieldByCollection(
                relationInfoM2M[currentM2MIndex === 0 ? 1 : 0].collection_one
              ).field
            "
          >
            {{
              primaryKeyFieldByCollection(
                relationInfoM2M[currentM2MIndex === 0 ? 1 : 0].collection_one
              ).field
            }}
          </option>
        </v-simple-select>
      </form>
    </template>

    <template slot="options">
      <template v-if="!existing">
        <h1 class="style-0">{{ $t("almost_done_options") }}</h1>
        <p class="subtext">{{ $t("almost_done_copy") }}</p>
      </template>

      <label for="__width">{{ $t("field_width") }}</label>
      <v-simple-select v-model="width" name="__width">
        <option value="half">Half</option>
        <option value="full">Full</option>
        <option value="fill">Fill the page</option>
      </v-simple-select>

      <hr />

      <form @submit.prevent v-if="selectedInterfaceInfo" class="options">
        <div v-for="(option, optionID) in interfaceOptions.regular" class="options" :key="optionID">
          <label :for="optionID">{{ option.name }}</label>
          <v-ext-input
            :id="option.interface"
            :name="optionID"
            :type="option.type"
            :length="option.length"
            :readonly="option.readonly"
            :required="option.required"
            :loading="option.loading"
            :options="option.options"
            :value="options[optionID]"
            :fields="selectedInterfaceInfo.options"
            :values="options"
            @input="$set(options, optionID, $event)"
          />
          <p class="note" v-html="$helpers.snarkdown(option.comment || '')" />
        </div>

        <details
          v-if="Object.keys(interfaceOptions.advanced).length > 0"
          class="advanced"
          :open="existing"
        >
          <summary>{{ $t("advanced_options") }}</summary>
          <div
            v-for="(option, optionID) in interfaceOptions.advanced"
            class="options"
            :key="optionID"
          >
            <label :for="optionID">{{ option.name }}</label>
            <v-ext-input
              :id="option.interface"
              :name="optionID"
              :type="option.type"
              :length="option.length"
              :readonly="option.readonly"
              :required="option.required"
              :loading="option.loading"
              :options="option.options"
              :value="options[optionID] || option.default"
              :fields="selectedInterfaceInfo.options"
              :values="options"
              @input="$set(options, optionID, $event)"
            />
            <p v-html="$helpers.snarkdown(option.comment || '')" class="note" />
          </div>
        </details>
      </form>
    </template>
  </v-modal>
</template>

<script>
import mapping, { datatypes } from "../type-map";
import { defaultFull } from "../store/modules/permissions/defaults";

export default {
  name: "v-field-setup",
  props: {
    collectionInfo: {
      type: Object,
      required: true
    },
    fieldInfo: {
      type: Object,
      required: true
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTab: "interface",
      id: null,
      sort: null,

      field: null,
      isFieldValid: null,
      datatype: null,
      type: null,
      interfaceName: null,
      options: {},
      translation: {},
      readonly: false,
      required: true,
      unique: false,
      note: null,
      hidden_detail: false,
      hidden_browse: false,
      primary_key: false,
      signed: true,
      width: "full",

      length: null,
      default_value: null,
      validation: null,

      relationInfo: {
        id: null,
        collection_many: null,
        field_many: null,

        collection_one: null,
        field_one: null
      },

      relationInfoM2M: [
        {
          id: null,
          collection_many: null,
          field_many: null,

          collection_one: null,
          field_one: null,

          junction_field: null
        },
        {
          id: null,
          collection_many: null,
          field_many: null,

          collection_one: null,
          field_one: null,

          junction_field: null
        }
      ],

      createM2Mjunction: false,
      createM2MjunctionName: null
    };
  },
  computed: {
    iconToShow() {
      if (!this.field || this.existing) {
        return { icon: null, color: null };
      }
      if (this.isFieldValid) {
        return { icon: "done", color: "success" };
      }
      return {
        icon: "error",
        color: "danger",
        tooltip: this.$t("field_already_exists", { field: "'" + this.field + "'" })
      };
    },
    collections() {
      return Object.assign({}, this.$store.state.collections);
    },
    collectionsGrouped() {
      const collectionNames = Object.keys(this.collections);
      const system = collectionNames.filter(name => name.startsWith("directus_"));
      const user = collectionNames.filter(name => !name.startsWith("directus_"));
      return { system, user };
    },
    interfaces() {
      return Object.assign({}, this.$store.state.extensions.interfaces);
    },
    interfacesGrouped() {
      const groups = [
        {
          title: this.$t("popular"),
          interfaces: [
            "text-input",
            "textarea",
            "wysiwyg",
            "datetime",
            "calendar",
            "toggle",
            "file",
            "many-to-one",
            "one-to-many",
            "primary-key",
            "status",
            "sort"
          ]
        },
        {
          title: this.$t("text"),
          interfaces: [
            "code",
            "hashed",
            "json",
            "markdown",
            "password",
            "primary-key",
            "slug",
            "tags",
            "text-input",
            "textarea",
            "wysiwyg",
            "wysiwyg-full"
          ]
        },
        {
          title: this.$t("numeric"),
          interfaces: ["numeric", "primary-key", "rating", "slider", "sort"]
        },
        {
          title: this.$t("date_and_time"),
          interfaces: [
            "calendar",
            "date",
            "time",
            "datetime",
            "datetime-created",
            "datetime-updated"
          ]
        },
        {
          title: this.$t("relational"),
          interfaces: [
            "one-to-many",
            "many-to-one",
            "many-to-many",
            "file",
            "translation",
            "checkboxes-relational"
          ]
        }
      ];

      groups.push({
        title: this.$t("other"),
        interfaces: Object.keys(this.interfaces).filter(name => {
          let inUse = false;

          groups.forEach(group => {
            if (group.interfaces.includes(name)) inUse = true;
          });

          return inUse === false;
        })
      });

      return groups.map(group => ({
        ...group,
        interfaces: group.interfaces.map(name => this.interfaces[name])
      }));
    },
    databaseVendor() {
      return this.$store.state.serverInfo.databaseVendor;
    },
    primaryKeyDisabled() {
      if (!this.primaryKeyField) return false;

      return true;
    },
    primaryKeyTooltip() {
      if (!this.primaryKeyField) return null;

      if (this.field === this.primaryKeyField.field) {
        return this.$t("cant_disable_primary");
      }

      return this.$t("max_one_primary_key");
    },
    selectedInterfaceInfo() {
      if (!this.interfaceName) return null;

      return Object.assign({}, this.interfaces[this.interfaceName]);
    },
    interfaceOptions() {
      if (!this.selectedInterfaceInfo) return null;
      const options = Object.assign({}, this.selectedInterfaceInfo.options);
      const regular = this.$lodash.pickBy(options, opt => !opt.advanced);
      const advanced = this.$lodash.pickBy(options, opt => opt.advanced === true);

      return { regular, advanced };
    },
    existing() {
      return this.id !== null;
    },
    schemaDisabled() {
      return !(this.interfaceName && this.interfaceName.length > 0);
    },
    optionsDisabled() {
      return this.schemaDisabled === true || !this.field;
    },
    displayName() {
      if (!this.field) return "";
      return this.$helpers.formatTitle(this.field);
    },
    availableFieldTypes() {
      if (!this.interfaceName) return [];
      return (
        (this.interfaces[this.interfaceName] && this.interfaces[this.interfaceName].types) || []
      );
    },
    availableDatatypes() {
      if (!this.type) return [];
      if (this.availableFieldTypes.length === 0) return [];
      return mapping[this.type][this.databaseVendor].datatypes;
    },
    selectedDatatypeInfo() {
      return datatypes[this.databaseVendor][this.datatype];
    },
    fieldTypeDescription() {
      if (!this.type) return null;

      return mapping[this.type] && this.$t(mapping[this.type].description);
    },
    lengthDisabled() {
      if (this.selectedDatatypeInfo && this.selectedDatatypeInfo.length === true) {
        return false;
      }

      if (this.selectedDatatypeInfo && this.selectedDatatypeInfo.decimal === true) {
        return false;
      }

      return true;
    },
    relation() {
      if (!this.selectedInterfaceInfo) return null;
      if (!this.selectedInterfaceInfo.relation) return null;

      if (typeof this.selectedInterfaceInfo.relation === "string") {
        return this.selectedInterfaceInfo.relation;
      }

      return this.selectedInterfaceInfo.relation.type;
    },
    buttons() {
      let disabled = false;
      if (this.activeTab === "interface" && !this.interfaceName) {
        disabled = true;
      }
      if (this.activeTab === "schema" && !this.field) {
        disabled = true;
      }
      if (!this.isFieldValid && !this.existing) {
        disabled = true;
      }

      let text = this.$t("next");

      if (
        this.activeTab === "options" ||
        (this.activeTab === "schema" && this.hasOptions === false) ||
        this.existing
      ) {
        text = this.$t("save");
      }

      return {
        next: {
          disabled,
          text,
          loading: this.saving
        }
      };
    },
    tabs() {
      const tabs = {
        interface: {
          text: this.$t("interface")
        },
        schema: {
          text: this.$t("schema"),
          disabled: !(this.interfaceName && this.interfaceName.length > 0)
        }
      };

      if (this.relation) {
        tabs.relation = {
          text: this.$t("relation"),
          disabled: this.schemaDisabled === true || !this.field
        };
      }

      const interfaceOptions =
        (this.selectedInterfaceInfo && this.selectedInterfaceInfo.options) || {};

      if (this.interfaceName && Object.keys(interfaceOptions).length > 0) {
        let disabled = this.schemaDisabled === true || !this.field;
        tabs.options = {
          text: this.$t("options"),
          disabled
        };
      }

      return tabs;
    },
    hasOptions() {
      const interfaceOptions =
        (this.selectedInterfaceInfo && this.selectedInterfaceInfo.options) || {};

      if (this.interfaceName && Object.keys(interfaceOptions).length > 0) return true;

      return false;
    },
    primaryKeyField() {
      return this.$lodash.find(this.collectionInfo.fields, {
        primary_key: true
      });
    },
    currentM2MIndex() {
      const index = this.$lodash.findIndex(this.relationInfoM2M, info => {
        return info.collection_one === this.collectionInfo.collection;
      });

      if (index === -1) return 0;
      return index;
    },
    isNumeric() {
      return this.type === "integer";
    }
  },
  created() {
    this.useFieldInfo();
    this.initRelation();

    this.activeTab = this.existing ? "schema" : "interface";
  },
  watch: {
    fieldInfo() {
      this.useFieldInfo();
    },
    interfaceName(name, oldName) {
      if (!name) return;

      if (name !== this.fieldInfo.interface) {
        const options = {
          ...this.interfaceOptions.advanced,
          ...this.interfaceOptions.regular
        };

        this.$lodash.forEach(options, (info, key) => {
          this.$set(this.options, key, info.default);
        });
      }

      if (this.existing && oldName == null) return;

      this.type = this.availableFieldTypes[0];

      this.datatype = this.type ? mapping[this.type][this.databaseVendor].default : null;

      if (this.existing) return;

      if (this.selectedInterfaceInfo && this.selectedInterfaceInfo.recommended) {
        const { defaultValue, length, validation } = this.selectedInterfaceInfo.recommended;

        if (defaultValue) {
          this.default_value = defaultValue;
        }

        if (length) {
          this.length = length;
        }

        if (validation) {
          this.validation = validation;
        }
      }

      this.initRelation();
    },
    type(type) {
      if (this.existing) return;

      if (type) {
        this.datatype = mapping[type][this.databaseVendor].default;
        // NOTE: this is to force string types that are longer than 255 characters into a TEXT mysql
        // type. This should be refactored and cleaned up when this field-setup component is getting
        // refactored.
        // Also, this is hardcoded for MySQL TEXT.
        // Fix for https://github.com/directus/app/issues/1149
        if (this.length > 255 && this.type.toLowerCase() === "string") {
          this.datatype = "TEXT";
        }
      }
    },
    datatype() {
      if (this.existing && this.length !== null) return;

      if (
        this.selectedInterfaceInfo &&
        this.selectedInterfaceInfo.recommended &&
        this.selectedInterfaceInfo.recommended.length
      ) {
        this.length = this.selectedInterfaceInfo.recommended.length;
        return;
      }

      if (this.selectedDatatypeInfo && this.selectedDatatypeInfo.length) {
        this.length = this.selectedDatatypeInfo.defaultLength;

        if (mapping[this.type][this.databaseVendor].length) {
          this.length = mapping[this.type][this.databaseVendor].length;
        }
      }

      if (this.selectedDatatypeInfo && this.selectedDatatypeInfo.decimal) {
        this.length =
          this.selectedDatatypeInfo.defaultDigits + "," + this.selectedDatatypeInfo.defaultDecimals;
      }
    },
    lengthDisabled(disabled) {
      if (disabled) {
        this.length = null;
      }
    },
    field(val) {
      this.field = this.validateFieldName(val);

      this.isFieldValid = !Object.keys(this.collectionInfo.fields).includes(val);

      if (this.relation) {
        if (this.relation === "m2o") {
          this.relationInfo.field_many = this.field;
        }

        if (this.relation === "o2m") {
          this.relationInfo.field_one = this.field;
        }
      }
    },
    relationInfoM2M: {
      deep: true,
      handler() {
        if (this.createM2Mjunction) {
          var val0 = (this.relationInfoM2M[0].field_many = this.validateFieldName(
            this.relationInfoM2M[0].field_many
          ));
          var val1 = (this.relationInfoM2M[1].field_many = this.validateFieldName(
            this.relationInfoM2M[1].field_many
          ));
          this.relationInfoM2M[0].junction_field = val1;
          this.relationInfoM2M[1].junction_field = val0;
        } else {
          this.relationInfoM2M[0].junction_field = this.relationInfoM2M[1].field_many;
          this.relationInfoM2M[1].junction_field = this.relationInfoM2M[0].field_many;
        }
        this.relationInfoM2M[this.currentM2MIndex].field_one = this.field;
      }
    },
    relationInfo: {
      deep: true,
      handler() {
        if (this.relation === "o2m") {
          this.getM2OID();
        }
      }
    },

    createM2Mjunction(enabled) {
      if (enabled) {
        var ix = this.currentM2MIndex;
        var currentCollection = this.collectionInfo.collection;
        this.relationInfoM2M[ix].field_one = currentCollection;
        this.relationInfoM2M[ix === 0 ? 1 : 0].field_one = currentCollection;
        this.createM2MjunctionName = this.autoM2Msuggestion(
          currentCollection,
          this.relationInfoM2M[ix == 0 ? 1 : 0].collection_one
        );
        this.relationInfoM2M[ix].field_many = this.autoM2Msuggestion(currentCollection, "id");
        this.relationInfoM2M[ix === 0 ? 1 : 0].field_many = this.autoM2Msuggestion(
          this.relationInfoM2M[ix == 0 ? 1 : 0].collection_one,
          "id"
        );
      } else {
        this.initRelation();
      }
    },
    createM2MjunctionName(val) {
      var formatval = this.validateFieldName(val);
      this.createM2MjunctionName = formatval;
      this.relationInfoM2M[0].collection_many = formatval;
      this.relationInfoM2M[1].collection_many = formatval;
    }
  },
  methods: {
    nextTab() {
      if (this.existing) {
        return this.saveField();
      }

      switch (this.activeTab) {
        case "interface":
          this.activeTab = "schema";
          break;
        case "schema":
          if (this.relation) {
            return (this.activeTab = "relation");
          }

          if (this.hasOptions === false) {
            return this.saveField();
          }

          this.activeTab = "options";

          break;
        case "relation":
          if (this.hasOptions === false) {
            return this.saveField();
          }

          this.activeTab = "options";
          break;
        case "options":
        default:
          this.saveField();
          break;
      }
    },
    setInterface(id) {
      this.interfaceName = id;
      this.nextTab();
    },
    saveField() {
      const fieldInfo = {
        id: this.id,
        sort: this.sort,
        field: this.field,
        type: this.type,
        datatype: this.datatype,
        interface: this.interfaceName,
        default_value: this.default_value,
        options: this.options,
        readonly: this.readonly,
        required: this.required,
        unique: this.unique,
        note: this.note,
        hidden_detail: this.hidden_detail,
        hidden_browse: this.hidden_browse,
        primary_key: this.primary_key,
        validation: this.validation,
        width: this.width
        // translation: this.translation, < Haven't implemented that yet
      };

      if (this.lengthDisabled === false) {
        fieldInfo.length = this.length;
      }

      if (this.isNumeric === true) {
        fieldInfo.signed = this.signed;
      }

      const result = {
        fieldInfo,
        relation: null
      };

      if (this.relation) {
        if (this.relation === "m2o") {
          result.relation = { ...this.relationInfo };
          delete result.relation.field_one;
        }

        if (this.relation === "o2m") {
          result.relation = { ...this.relationInfo };
        }

        if (this.relation === "m2m") {
          result.relation = [...this.relationInfoM2M];
          if (this.createM2Mjunction === true) {
            this.createM2MjunctionCollection();
          }
        }
      }

      this.$emit("save", result);
    },
    useFieldInfo() {
      if (!this.fieldInfo || Object.keys(this.fieldInfo).length === 0) return;

      // This is somewhat disgusting. The parent fields route shouldn't pass in the
      // stale copy of the field based on the API load, but should instead pass
      // just the name of the field, so we can directly pull it from the store.
      //
      // The parent should also use the store directly, seeing that we are loading
      // the fields nested in the collections anyway (this didn't use to be
      // that way). +1 for future optimizations!
      const fieldName = this.fieldInfo.field;
      const collectionName = this.collectionInfo.collection;
      const storeFieldCopy = this.$lodash.clone(
        this.$store.state.collections[collectionName].fields[fieldName]
      );

      Object.keys(storeFieldCopy).forEach(key => {
        if (storeFieldCopy[key] != null) this[key] = storeFieldCopy[key];
      });

      // 'interface' is a reserved word in JS, so we need to work around that
      this.interfaceName = storeFieldCopy.interface;

      // The API saves the type case insensitive, but the mapping requires case changing
      this.type = this.type && this.type.toLowerCase();
      this.datatype = this.datatype && this.datatype.toUpperCase();
    },
    initRelation() {
      if (!this.relation) return;

      const collection = this.collectionInfo.collection;
      const field = this.field;

      if (this.relation === "m2o") {
        const existingRelation = this.$store.getters.m2o(collection, field);

        if (existingRelation) {
          this.$lodash.forEach(existingRelation, (val, key) => {
            if (key && val && key.startsWith("collection")) {
              return this.$set(this.relationInfo, key, val.collection);
            }

            if (key && val && key.startsWith("field")) {
              return this.$set(this.relationInfo, key, val.field);
            }

            if (val) {
              this.$set(this.relationInfo, key, val);
            }
          });
        } else {
          this.relationInfo.collection_many = this.collectionInfo.collection;
          this.relationInfo.field_many = this.field;
          this.relationInfo.collection_one = Object.values(
            this.$store.state.collections
          )[0].collection;
          this.relationInfo.field_one = this.$lodash.find(
            Object.values(this.$store.state.collections)[0].fields,
            { primary_key: true }
          ).field;
        }
      } else if (this.relation === "o2m") {
        const existingRelation = this.$store.getters.o2m(collection, field);

        if (existingRelation) {
          this.$lodash.forEach(existingRelation, (val, key) => {
            if (key && val && key.startsWith("collection")) {
              return this.$set(this.relationInfo, key, val.collection);
            }

            if (key && val && key.startsWith("field")) {
              return this.$set(this.relationInfo, key, val.field);
            }

            if (val) {
              this.$set(this.relationInfo, key, val);
            }
          });
        } else {
          this.relationInfo.collection_one = this.collectionInfo.collection;
          this.relationInfo.field_one = this.field;

          this.relationInfo.collection_many = Object.values(
            this.$store.state.collections
          )[0].collection;

          this.relationInfo.field_many = this.$lodash.find(
            Object.values(this.$store.state.collections)[0].fields,
            { primary_key: true }
          ).field;

          this.getM2OID();
        }
      } else if (this.relation === "m2m") {
        const existingRelation = this.$store.getters.o2m(collection, field);

        if (field && existingRelation) {
          this.relationInfoM2M[0].id = existingRelation.id;

          this.relationInfoM2M[0].collection_many = existingRelation.collection_many.collection;

          this.relationInfoM2M[0].field_many = existingRelation.field_many.field;

          this.relationInfoM2M[0].collection_one = existingRelation.collection_one.collection;

          this.relationInfoM2M[0].field_one = existingRelation.field_one.field;
          this.relationInfoM2M[0].junction_field = existingRelation.junction.field_many.field;

          this.relationInfoM2M[1].id = existingRelation.junction.id;

          this.relationInfoM2M[1].collection_many = existingRelation.collection_many.collection;

          this.relationInfoM2M[1].field_many = existingRelation.junction.field_many.field;

          this.relationInfoM2M[1].collection_one =
            existingRelation.junction.collection_one.collection;

          this.relationInfoM2M[1].field_one =
            existingRelation.junction.field_one && existingRelation.junction.field_one.field;

          this.relationInfoM2M[1].junction_field = existingRelation.field_many.field;
        } else {
          this.relationInfoM2M[0].collection_many = Object.keys(this.collections)[0];

          this.relationInfoM2M[0].field_many = Object.values(
            Object.values(this.collections)[0].fields
          )[0].field;

          this.relationInfoM2M[0].collection_one = this.collectionInfo.collection;

          this.relationInfoM2M[0].junction_field = Object.values(
            Object.values(this.collections)[0].fields
          )[0].field;

          this.relationInfoM2M[1].collection_many = Object.keys(this.collections)[0];

          this.relationInfoM2M[1].field_many = Object.values(
            Object.values(this.collections)[0].fields
          )[0].field;

          this.relationInfoM2M[1].collection_one = Object.keys(this.collections)[1];

          this.relationInfoM2M[1].junction_field = Object.values(
            Object.values(this.collections)[0].fields
          )[0].field;

          // Recommended relationships
          // Interfaces can recommend a related collection. For example, the files
          // interface will recommend the collection_many to be directus_files
          // in order to make it easier for the user to setup the interface
          if (
            this.selectedInterfaceInfo.relation &&
            typeof this.selectedInterfaceInfo.relation === "object"
          ) {
            if (this.selectedInterfaceInfo.relation.relatedCollection) {
              this.relationInfoM2M[1].collection_one = this.selectedInterfaceInfo.relation.relatedCollection;
            }
          }
        }
      }
    },
    getM2OID() {
      const collection = this.relationInfo.collection_many;
      const field = this.relationInfo.field_many;

      const m2o = this.$store.getters.m2o(collection, field);

      if (m2o) {
        this.relationInfo.id = m2o.id;
      } else {
        this.relationInfo.id = null;
      }
    },
    fields(collection) {
      if (!collection) return {};
      return this.collections[collection].fields;
    },
    primaryKeyFieldByCollection(collection) {
      const fields = this.fields(collection);
      return this.$lodash.find(fields, { primary_key: true });
    },
    validateFieldName(string) {
      // Based on https://gist.github.com/mathewbyrne/1280286
      return string
        .toString()
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/[^\w_]+/g, "") // Remove all non-word chars
        .replace(/__+/g, "_") // Replace multiple _ with single _
        .toLowerCase();
    },
    autoM2Msuggestion(collectionName, suffix) {
      return collectionName + "_" + suffix;
    },

    // issue here getting the new field to add M2M relationships without refreshing
    createM2MjunctionCollection() {
      var collectionData = {
        collection: this.createM2MjunctionName,
        hidden: true,
        note: this.$t("junction_collection"),
        fields: [
          {
            field: "id",
            type: "integer",
            datatype: "int",
            interface: "primary-key",
            primary_key: true,
            auto_increment: true,
            signed: false,
            length: 10
          },
          {
            field: this.relationInfoM2M[0].field_many,
            type: "integer",
            length: 10,
            datatype: "int",
            interface: null,
            readonly: false,
            required: true
          },
          {
            field: this.relationInfoM2M[1].field_many,
            type: "integer",
            length: 10,
            datatype: "int",
            interface: null,
            readonly: false,
            required: true
          }
        ]
      };
      var fieldDispatch = {
        id: {
          auto_increment: true,
          collection: this.createM2MjunctionName,
          datatype: "int",
          default_value: null,
          field: "id",
          group: null,
          hidden_detail: true,
          hidden_browse: true,
          interface: "primary-key",
          length: "10",
          locked: 0,
          note: null,
          options: null,
          primary_key: true,
          readonly: 0,
          required: true,
          signed: false,
          sort: 1,
          translation: null,
          type: "integer",
          unique: false,
          validation: null,
          width: 4
        }
      };
      fieldDispatch[this.relationInfoM2M[0].field_many] = {
        collection: this.createM2MjunctionName,
        field: this.relationInfoM2M[0].field_many,
        datatype: "int",
        unique: false,
        primary_key: false,
        auto_increment: false,
        default_value: null,
        note: null,
        signed: true,
        type: "integer",
        sort: 0,
        interface: null,
        hidden_detail: true,
        hidden_browse: true,
        required: true,
        options: null,
        locked: false,
        translation: null,
        readonly: false,
        width: 4,
        validation: null,
        group: null,
        length: 10
      };
      fieldDispatch[this.relationInfoM2M[1].field_many] = {
        collection: this.createM2MjunctionName,
        field: this.relationInfoM2M[1].field_many,
        datatype: "int",
        unique: false,
        primary_key: false,
        auto_increment: false,
        default_value: null,
        note: null,
        signed: true,
        type: "integer",
        sort: 0,
        interface: null,
        hidden_detail: true,
        hidden_browse: true,
        required: true,
        options: null,
        locked: false,
        translation: null,
        readonly: false,
        width: 4,
        validation: null,
        group: null,
        length: 10
      };
      this.$api
        .createCollection(collectionData, {
          fields: "*.*"
        })
        .then(res => res.data)
        .then(collection => {
          this.$store.dispatch("addCollection", {
            ...collection,
            fields: fieldDispatch
          });
          this.$store.dispatch("addPermission", {
            collection: this.createM2MjunctionName,
            permission: {
              $create: defaultFull,
              ...defaultFull
            }
          });
        })
        .catch(error => {
          this.$events.emit("error", {
            notify: this.$t("something_went_wrong_body"),
            error
          });
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.style-0 {
  max-width: 80%;
  margin-bottom: 30px;
}

p {
  line-height: 1.3;
  max-width: 70%;
  &.subtext {
    max-width: 460px;
    font-size: 16px;
    color: var(--light-gray);
    line-height: 26px;
    font-weight: 400;
    margin-bottom: 40px;
  }
}

.currently-selected {
  margin-bottom: 40px;
}

.small-text {
  margin-top: 4px;
  font-style: italic;
  font-size: 12px;
  line-height: 1.5em;
  color: var(--light-gray);
  & b {
    font-weight: 600;
  }
}

.note {
  display: block;
  margin-top: 4px;
  margin-bottom: 10px;
  font-style: italic;
  font-size: var(--size-3);
  line-height: 1.5em;
  color: var(--light-gray);
  font-weight: var(--weight-bold);
}

.interfaces {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;

  article {
    display: block;
    background-color: var(--white);
    box-shadow: var(--box-shadow);
    flex-basis: 160px;
    flex-shrink: 0;
    overflow: hidden;
    transition: box-shadow var(--fast) var(--transition-out);
    cursor: pointer;

    .header {
      background-color: var(--lighter-gray);
      border-radius: var(--border-radius);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px 0;
      transition: background-color var(--fast) var(--transition-out);
    }

    &.active {
      .header {
        background-color: var(--darkest-gray);
        transition: background-color var(--fast) var(--transition-in);
      }
    }

    &:hover {
      .header {
        background-color: var(--gray);
      }
    }

    .body {
      padding-top: 8px;
    }

    h2 {
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    p {
      color: var(--lighter-gray);
      font-size: 13px;
    }
  }
}

form.schema {
  label:not(.toggle) {
    > .v-simple-select,
    > .v-input {
      margin-top: 10px;
    }
  }

  .name {
    margin-bottom: 30px;
  }

  .name-input {
    font-family: "Roboto Mono", monospace;
  }

  .advanced-form,
  .toggles,
  .name {
    display: grid;
    grid-gap: 32px 32px;
    grid-template-columns: 1fr 1fr;

    .description {
      display: inline-block;
      margin-top: 4px;
      font-style: italic;
      font-size: 12px;
      line-height: 1.5em;
      font-weight: 500;
      color: var(--light-gray);
    }

    .toggle {
      display: flex;
      align-items: center;
      text-transform: capitalize;
      font-size: 1rem;
      cursor: pointer;
      width: max-content;

      &:not(.disabled):hover {
        color: var(--darkest-gray);
      }

      > *:first-child {
        margin-right: 10px;
      }

      &.disabled {
        color: var(--light-gray);
      }
    }
  }
}

form.options {
  label {
    margin-bottom: 8px;
  }
  div.options {
    margin-bottom: 30px;
    &:last-of-type {
      margin-bottom: 20px;
    }
  }
}

details {
  position: relative;
  margin-top: 60px;
  border-top: 2px solid var(--lightest-gray);
  padding-top: 40px;
  padding-bottom: 32px;
  summary {
    position: absolute;
    left: 50%;
    top: -22px;
    transform: translateX(-50%);
    background-color: var(--body-background);
    color: var(--light-gray);
    font-size: 1.2rem;
    line-height: 1.1;
    font-weight: 400;
    padding: 10px 20px;
    text-align: center;
    cursor: pointer;
    text-align: center;
    text-transform: capitalize;

    &:hover {
      color: var(--darker-gray);
    }

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      content: "unfold_more";
      font-family: "Material Icons";
      font-size: 18px;
      margin-left: 2px;
      vertical-align: -19%;
      font-weight: normal;
      font-style: normal;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      font-feature-settings: "liga";
    }
  }

  &[open] summary::after {
    content: "unfold_less";
  }
}

.no-results {
  margin: 20px auto;
  min-height: 0;
}

.required {
  color: var(--darkest-gray);
  vertical-align: super;
  font-size: 7px !important;
}

.single {
  display: grid;
  grid-template-areas:
    "a _ b"
    "c _ d"
    "e f g";
  grid-template-columns: 1fr 20px 1fr;
  grid-gap: 10px 0;
  justify-content: center;
  align-items: center;

  p:first-of-type {
    grid-area: a;
  }

  p:last-of-type {
    grid-area: b;
  }

  .select {
    &:first-of-type {
      grid-area: c;
    }

    &:nth-of-type(2) {
      grid-area: e;
    }

    &:nth-of-type(3) {
      grid-area: d;
    }

    &:nth-of-type(4) {
      grid-area: g;
    }
  }

  i {
    grid-area: f;
    font-size: 20px;
    color: var(--light-gray);
  }
}

.full {
  margin-top: 40px;
  display: grid;
  grid-template-areas:
    "a b c d e"
    "f g h i j"
    "k l m n o"
    "p q r s t"
    "u u v w w";
  grid-template-columns: 1fr 20px 1fr 20px 1fr;
  grid-gap: 10px 0;
  justify-content: center;
  align-items: center;

  p:first-of-type {
    grid-area: a;
  }

  p:nth-of-type(2) {
    grid-area: c;
  }

  p:last-of-type {
    grid-area: e;
  }

  .select {
    &:first-of-type {
      grid-area: f;
    }

    &:nth-of-type(2) {
      grid-area: k;
    }

    &:nth-of-type(3) {
      grid-area: h;
    }

    &:nth-of-type(4) {
      grid-area: m;
    }

    &:nth-of-type(5) {
      grid-area: r;
    }

    &:nth-of-type(6) {
      grid-area: j;
    }

    &:nth-of-type(7) {
      grid-area: t;
    }
  }

  i {
    grid-area: l;
    font-size: 20px;
    color: var(--light-gray);

    &:last-of-type {
      grid-area: s;
    }
  }

  .form-checkbox {
    &:first-of-type {
      grid-area: v;
    }
  }
}

.toggles {
  margin-top: 32px;
}

label {
  font-size: var(--size-2);
  margin-bottom: 12px;
}

hr {
  margin: 32px 0;
  border: 0;
  border-top: 2px solid var(--lightest-gray);
}
</style>

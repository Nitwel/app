import Vue from "vue";
import VSpinner from "vue-simple-spinner";

import InvisibleLabel from "./components/invisible-label.vue";
import Loader from "./components/loader.vue";
import VAvatar from "./components/avatar.vue";
import VCard from "./components/card.vue";
import VDetails from "./components/details.vue";
import VNotice from "./components/notice.vue";
import VTable from "./components/table/table.vue";

// Extensions
import VExtInput from "./components/extension/interface/input/input.vue";
import VExtDisplay from "./components/extension/interface/display/display.vue";
import VExtLayout from "./components/extension/layout/layout/layout.vue";
import VExtLayoutOptions from "./components/extension/layout/layout-options/layout-options.vue";
import VExtPage from "./components/extension/page/page.vue";

// Item listing
import VItems from "./components/items.vue";

// Edit form
import VForm from "./components/form/form.vue";

// Form inputs
import VButton from "./components/form-inputs/button.vue";
import VCheckbox from "./components/form-inputs/checkbox.vue";
import VInput from "./components/form-inputs/input.vue";
import VRadio from "./components/form-inputs/radio.vue";
import VSelect from "./components/form-inputs/select.vue";
import VSimpleSelect from "./components/form-inputs/simple-select.vue";
import VSlider from "./components/form-inputs/slider.vue";
import VTextarea from "./components/form-inputs/textarea.vue";
import VToggle from "./components/form-inputs/toggle.vue";

// Modals
import VAlert from "./components/modals/alert.vue";
import VConfirm from "./components/modals/confirm.vue";
import VModal from "./components/modals/modal.vue";
import VPrompt from "./components/modals/prompt.vue";

// Page Chrome
import VHeader from "./components/header/header.vue";
import VHeaderButton from "./components/header/header-button.vue";
import VInfoSidebar from "./components/sidebars/info-sidebar.vue";

import VError from "./components/error.vue";
import VUpload from "./components/upload.vue";
import VProgressRing from "./components/progress-ring.vue";

import VIcon from "./components/icon.vue";

// Extensions
Vue.component("v-ext-page", VExtPage);
Vue.component("v-ext-input", VExtInput);
Vue.component("v-ext-display", VExtDisplay);
Vue.component("v-ext-layout", VExtLayout);
Vue.component("v-ext-layout-options", VExtLayoutOptions);

// Item Listing
Vue.component("v-items", VItems);

// Edit form
Vue.component("v-form", VForm);

// Form inputs
Vue.component("v-button", VButton);
Vue.component("v-checkbox", VCheckbox);
Vue.component("v-input", VInput);
Vue.component("v-radio", VRadio);
Vue.component("v-select", VSelect);
Vue.component("v-simple-select", VSimpleSelect);
Vue.component("v-slider", VSlider);
Vue.component("v-textarea", VTextarea);
Vue.component("v-toggle", VToggle);

// Modals
Vue.component("v-alert", VAlert);
Vue.component("v-confirm", VConfirm);
Vue.component("v-modal", VModal);
Vue.component("v-prompt", VPrompt);

// Page Chrome
Vue.component("v-header", VHeader);
Vue.component("v-header-button", VHeaderButton);
Vue.component("v-info-sidebar", VInfoSidebar);

Vue.component("v-error", VError);

Vue.component("invisible-label", InvisibleLabel);
Vue.component("loader", Loader);
Vue.component("v-spinner", VSpinner);
Vue.component("v-avatar", VAvatar);
Vue.component("v-card", VCard);
Vue.component("v-details", VDetails);
Vue.component("v-notice", VNotice);
Vue.component("v-table", VTable);

Vue.component("v-upload", VUpload);
Vue.component("v-progress-ring", VProgressRing);
Vue.component("v-icon", VIcon);

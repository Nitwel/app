import Vue from "vue";
import lodash from "lodash";
import VueDraggable from "vuedraggable";
import VTooltip from "v-tooltip";
import VueTimeago from "vue-timeago";
import PortalVue from "portal-vue";
import axios from "axios";
import meta from "vue-meta";
import en from "vue-timeago/node_modules/date-fns/locale/en/";
import fr from "vue-timeago/node_modules/date-fns/locale/fr/";
import VueTheMask from "vue-the-mask";

import "./design/main.scss";
import "./globals";
import "./helpers/handle-focus";
import "./helpers/handle-drag";

// import "./registerServiceWorker";
import App from "./app.vue";
import router from "./router";
import { i18n, loadLanguageAsync } from "./lang/";
import store from "./store/";
import api from "./api";
import helpers from "./helpers";
import notify from "./notifications";
import events from "./events/";

// Create a default config when the config file is missing.
// This allows the app to work even when no configuration was set
const defaultConfig = {
  api: {},
  allowOtherAPI: true,
  routerMode: "hash",
  routerBaseUrl: "/"
};

window.__DirectusConfig__ = window.__DirectusConfig__ || defaultConfig;

Vue.config.productionTip = false;

Object.defineProperties(Vue.prototype, {
  $lodash: { value: lodash },
  $api: { value: api },
  $notify: { value: notify },
  $axios: { value: axios }
});

Vue.use(events);
Vue.use(VTooltip, {
  defaultDelay: 500,
  defaultOffset: 2
});
Vue.use(PortalVue);
Vue.use(VueTimeago, {
  name: "v-timeago",
  locale: "en-US",
  locales: {
    "en-US": en,
    "fr-FR": fr
  }
});
Vue.use(VueTheMask);
Vue.use(meta);
Vue.component("draggable", VueDraggable);

/* eslint-disable no-new */
new Vue({
  render: h => h(App),
  router,
  i18n,
  store,
  api,
  helpers
}).$mount("#app");

store.watch(state => state.currentUser.locale, locale => loadLanguageAsync(locale));

import axios from "axios";
import store from "./store/";
import { loadLanguageAsync, availableLanguages } from "./lang/";
import { STORE_HYDRATED, HYDRATING_FAILED } from "./store/mutation-types";
import { startPolling } from "./polling";
import startIdleTracking from "./idle";
import { version } from "../package.json";

export default function hydrateStore() {
  return (
    Promise.all([
      store.dispatch("latency"),
      store.dispatch("getCurrentUser"),
      store.dispatch("getCollections"),
      store.dispatch("getSettings"),
      store.dispatch("getAllExtensions"),
      store.dispatch("getBookmarks"),
      store.dispatch("getUsers"),
      store.dispatch("getRelations"),
      store.dispatch("getServerInfo")
    ])
      // Getting permissions relies on the current user and collection info
      // that's why it's being called after the others are done
      .then(() => store.dispatch("getPermissions"))
      .then(() => {
        if (Object.keys(availableLanguages).includes(store.state.currentUser.locale)) {
          loadLanguageAsync(store.state.currentUser.locale);
        }
      })
      .then(() => {
        startPolling();
        startIdleTracking(store);
      })
      .then(() => {
        const isAdmin = store.state.currentUser.admin;

        if (isAdmin && navigator.onLine) {
          axios
            .post("https://telemetry.directus.io/count", {
              type: "app",
              url: window.location.origin,
              version
            })
            .catch(() => {});
        }
      })
      .then(() => {
        store.commit(STORE_HYDRATED, new Date());
      })
      .catch(error => {
        store.commit(HYDRATING_FAILED, error);
        console.error(error); // eslint-disable-line no-console
      })
  );
}

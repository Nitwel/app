import _ from "lodash";
import api from "../../../api";
import * as types from "./types";

export async function getSettings({ commit }) {
  const { data: settings } = await api.getSettings();
  commit(types.SET_SETTINGS, settings);
}

export function setSettings({ dispatch }, settings) {
  return Promise.all(
    Object.keys(settings).map(key => dispatch("setSetting", { key, value: settings[key] }))
  );
}

export async function setSetting({ commit, state }, { key, value }) {
  const settingPrimaryKey = state.primaryKeys[key];

  if (_.isNil(settingPrimaryKey)) {
    const { data: setting } = await api.createItem("directus_settings", {
      key,
      value
    });
    commit(types.SET_SETTING, setting);
  } else {
    const { data: setting } = await api.updateItem("directus_settings", settingPrimaryKey, {
      value
    });
    commit(types.SET_SETTING, setting);
  }
}

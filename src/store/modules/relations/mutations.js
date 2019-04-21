import Vue from "vue";
import { forEach } from "lodash";
import { SET_RELATIONS, ADD_RELATION, UPDATE_RELATION } from "../../mutation-types";

export default {
  [SET_RELATIONS](state, relations) {
    forEach(relations, (relation, i) => {
      Vue.set(state, i, relation);
    });
  },
  [ADD_RELATION](state, relation) {
    Vue.set(state, state.length, relation);
  },
  [UPDATE_RELATION](state, updatedRelation) {
    const newState = state.map(relation => {
      if (relation.id === updatedRelation.id) return updatedRelation;
      return relation;
    });

    forEach(newState, (relation, i) => {
      Vue.set(state, i, relation);
    });
  }
};

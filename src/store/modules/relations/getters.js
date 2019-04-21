export function m2o(state, getters, { collections }) {
  return function(collection, field) {
    const results = state.filter(
      relation => relation.collection_many === collection && relation.field_many === field
    );

    const result = results ? results[results.length - 1] : null;

    if (result) {
      return {
        id: result.id,
        collection_many: collections[result.collection_many],
        collection_one: collections[result.collection_one],
        field_many: collections[result.collection_many].fields[result.field_many],
        field_one: collections[result.collection_one].fields[result.field_one]
      };
    }

    return null;
  };
}

export function o2m(state, getters, { collections }) {
  return function(collection, field) {
    const results = state.filter(
      relation => relation.collection_one === collection && relation.field_one === field
    );

    const result = results ? results[results.length - 1] : null;

    if (result && result.junction_field != null) {
      const junction = getters.m2o(result.collection_many, result.junction_field);

      return {
        id: result.id,
        collection_many: collections[result.collection_many],
        collection_one: collections[result.collection_one],
        field_many: collections[result.collection_many].fields[result.field_many],
        field_one: collections[result.collection_one].fields[result.field_one],
        junction
      };
    }

    if (result) {
      return {
        id: result.id,
        collection_many: collections[result.collection_many],
        collection_one: collections[result.collection_one],
        field_many: collections[result.collection_many].fields[result.field_many],
        field_one: collections[result.collection_one].fields[result.field_one]
      };
    }

    return null;
  };
}

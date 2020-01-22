<template>
	<div ref="tree" class="tree">
		<Tree v-if="!reload" :tree="rootTree" :root="root" :depth="true"></Tree>
	</div>
</template>

<script>
import mixin from '@directus/extension-toolkit/mixins/layout';
import Tree from './Tree.vue';

export default {
	components: {
		Tree
	},
	mixins: [mixin],
	data() {
		return {
			root: this,
			reload: false,
			dragging: false
		};
	},
	computed: {
		rootTree() {
			return {
				id: null,
				[this.viewOptions.title]: 'root'
			};
		}
	},
	watch: {
		items(items) {
			if (items.length > 0) {
				this.loadDepthIds(items).then(result => {
					this.folderDepth = result;
				});
			}
		},
		viewOptions(newValue, oldValue) {
			// resetting the layout to apply updates
			if (newValue.connections != oldValue.connections && this.items.length > 0) {
				if (newValue.connections.length == oldValue.connections.length) {
					var iconOrTitleChanged = false;
					var index = 0;
					while (index < newValue.connections.length && !iconOrTitleChanged) {
						var conn = newValue.connections[index];
						var oldConn = oldValue.connections[index];
						iconOrTitleChanged =
							conn.title != oldConn.title || conn.icon != oldConn.icon;
						index++;
					}
					if (iconOrTitleChanged) return;
				}
				this.reload = true;
				setTimeout(() => {
					this.reload = false;
				}, 1);
			}
		}
	},
	created() {
		if (this.viewOptions.parent && this.viewOptions.title) {
			var query = {
				filter: {
					[this.viewOptions.parent]: {
						null: ''
					}
				},
				sort: '' + this.viewOptions.title
			};
			this.$emit('query', query);
		}
	},
	methods: {
		change($event) {
			if ($event.added) {
				var item = $event.added.element;
				this.updateItem(item.id, item.__collection__, null);
			}
		},
		updateItem(id, collection, parentId) {
			if (collection == this.collection) {
				var parent = this.viewOptions.parent;

				this.$api.updateItem(collection, id, {
					[parent]: parentId
				});
			} else {
				var connections = this.viewOptions.connections;
				var collectionInfo = _.find(connections, con => con.collection == collection);

				this.$api.updateItem(collection, id, {
					[collectionInfo.field]: parentId
				});
			}
		},
		async loadItems(id) {
			var parent = this.viewOptions.parent;
			var filter;
			if (id) {
				filter = { filter: { [parent]: id }, sort: '-' + this.viewOptions.title };
			} else {
				filter = { filter: { [parent]: { null: '' } }, sort: '-' + this.viewOptions.title };
			}

			var items = await this.$api.getItems(this.collection, filter);
			items = items.data;
			_.forEach(items, item => (item.__collection__ = this.collection));
			return items;
		},
		async loadConnectionItems(id) {
			var parent = this.viewOptions.parent;
			var connections = this.viewOptions.connections;

			if (!parent || !connections) return;

			var promises = [];
			connections.forEach(connection => {
				if (connection.collection) {
					var filter;
					if (id) {
						filter = { filter: { [connection.field]: id } };
					} else {
						filter = { filter: { [connection.field]: { null: '' } } };
					}

					promises.push(this.$api.getItems(connection.collection, filter));
				}
			});

			var items = [];
			var results = await Promise.all(promises);
			_.forEach(results, (itemCollection, index) => {
				itemCollection = itemCollection.data;
				_.forEach(itemCollection, item => {
					item.__collection__ = connections[index].collection;
				});
				items.push(...itemCollection);
			});

			return items;
		},
		async loadDepthIds(items) {
			var itemIds = _.map(items, item => item.id);

			var parent = this.viewOptions.parent;
			var connections = this.viewOptions.connections;

			var ids = await this.$api.getItems(this.collection, {
				filter: { [parent]: { in: itemIds.join(',') } },
				fields: parent
			});
			ids = _.uniq(_.map(ids.data, id => id[parent]));

			var promises = [];
			connections.forEach(connection => {
				if (connection.collection) {
					promises.push(
						this.$api.getItems(connection.collection, {
							filter: { [connection.field]: { in: itemIds.join(',') } },
							fields: connection.field
						})
					);
				}
			});

			var connectionResults = await Promise.all(promises);
			var connectionIds = [];

			_.forEach(connectionResults, (ids, index) => {
				connectionIds.push(..._.map(ids.data, id => id[connections[index].field]));
			});

			var folderDepth = {};
			_.forEach(itemIds, id => {
				folderDepth[id] = ids.includes(id) || connectionIds.includes(id);
			});

			return folderDepth;
		},
		createLink(id, collection) {
			var projectKey = this.$store.state.currentProjectKey;
			return `/${projectKey}/collections/${collection}/${id}`;
		}
	}
};
</script>

<style lang="scss" scoped>
.tree {
	padding: var(--page-padding);
}
</style>

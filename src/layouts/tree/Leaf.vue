<template>
	<div class="leaf">
		<v-icon v-if="icon" class="icon" :name="icon"></v-icon>
		<router-link class="title" :to="root.createLink(item.id, item.__collection__)">
			{{ title }}
		</router-link>
	</div>
</template>

<script>
export default {
	name: 'Leaf',
	props: {
		item: {
			type: Object,
			default: null
		},
		root: {
			type: Object,
			default: null
		},
		last: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		title() {
			var connections = this.root.viewOptions.connections;
			var collection = _.find(connections, con => con.collection == this.item.__collection__);
			if (!collection) return;
			var title = this.$helpers.micromustache.render(collection.title, this.item);
			return title;
		},
		icon() {
			var connections = this.root.viewOptions.connections;
			var collection = _.find(connections, con => con.collection == this.item.__collection__);
			if (!collection.icon)
				return this.$store.state.collections[this.item.__collection__].icon;
			return collection.icon;
		}
	}
};
</script>

<style lang="scss" scoped>
.leaf {
	position: relative;
	display: flex;
	align-items: center;

	.icon {
		margin-right: 5px;
	}

	.title {
		cursor: pointer;
		height: 30px;
		font-size: 16px;
		text-decoration: none;

		display: flex;
		align-items: center;
	}
}
</style>

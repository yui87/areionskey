<template>
<mk-emoji :emoji="str.startsWith(':') ? null : str" :name="str.startsWith(':') ? str.substring(1, str.length - 1) : null" :isReaction="true" :customEmojis="customEmojis" :normal="true" :noStyle="noStyle"/>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
export default Vue.extend({
	i18n: i18n(),
	props: {
		reaction: {
			type: String,
			required: true
		},
		customEmojis: {
			required: false,
			default: () => undefined as any[]
		},
		noStyle: {
			type: Boolean,
			required: false,
			default: false
		},
	},
	data() {
		return {
			customEmojis: []
		};
	},
	created() {
		this.$root.getMeta().then(meta => {
			if (meta && meta.emojis) this.customEmojis = meta.emojis;
		});
	},
	computed: {
		str(): any {
			switch (this.reaction) {
				case 'like': return '👍';
				case 'love': return '❤';
				case 'laugh': return '😆';
				case 'hmm': return '🤔';
				case 'surprise': return '😮';
				case 'congrats': return '🎉';
				case 'angry': return '💢';
				case 'confused': return '😥';
				case 'rip': return '😇';
				case 'pudding': return (this.$store.getters.isSignedIn && this.$store.state.settings.iLikeSushi) ? '🍣' : '🍮';
				case 'star': return '⭐';
				default: return this.reaction;
			}
		},
	},
});
</script>

<style lang="stylus" scoped>
.mk-reaction-icon
	img
		vertical-align middle
		width 1em
		height 1em
</style>

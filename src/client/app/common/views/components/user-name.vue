<template>
<mfm :text="user.name || user.username" :class="{ premium: user.isPremium }" :plain="true" :nowrap="nowrap" :customEmojis="user.emojis"/>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
	props: {
		user: {
			type: Object,
			required: true
		},
		nowrap: {
			type: Boolean,
			default: true
		},
	}
});
</script>

<template>
<header class="bvonvjxbwzaiskogyhbwgyxvcgserpmu">
	<mk-avatar class="avatar" :user="note.user" v-if="$store.state.device.postStyle == 'smart'"/>
	<router-link class="name" :to="note.user | userPage" v-user-preview="note.user.id">
		<mk-user-name :user="note.user"/>
	</router-link>
	<span class="is-premium" v-if="note.user.isPremium" :title="$t('@.premium-user')"><fa icon="crown"/></span>
	<span class="is-verified" v-if="note.user.isVerified" :title="$t('@.verified-user')"><img svg-inline src="../../../../assets/horseshoe.svg" class="horseshoe"/></span>
	<span class="is-bot" v-if="note.user.isBot" :title="$t('@.bot-user')"><fa icon="robot"/></span>
	<span class="username"><mk-acct :user="note.user"/></span>
	<div class="info">
		<span class="app" v-if="note.app && !mini && $store.state.settings.showVia">via <b>{{ note.app.name }}</b></span>
		<span class="mobile" v-if="note.viaMobile"><fa icon="mobile-alt"/></span>
		<router-link class="created-at" :to="note | notePage">
			<mk-time :time="note.createdAt"/>
			{{ }}
			<span :title="$t('@.edited')" v-if="note.updatedAt != null"><fa :icon="faEdit"/></span>
		</router-link>
		<span class="visibility" v-if="note.visibility != 'public'">
			<fa v-if="note.visibility == 'home'" icon="home"/>
			<fa v-if="note.visibility == 'followers'" icon="lock"/>
			<fa v-if="note.visibility == 'specified'" icon="envelope"/>
		</span>
		<span class="localOnly" v-if="note.localOnly == true"><fa icon="heart"/></span>
	</div>
</header>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
	i18n: i18n(),
	props: {
		note: {
			type: Object,
			required: true
		},
		mini: {
			type: Boolean,
			required: false,
			default: false
		}
	},

	data() {
		return {
			faEdit,
		}
	},
});
</script>

<style lang="stylus" scoped>
.bvonvjxbwzaiskogyhbwgyxvcgserpmu
	display flex
	align-items baseline
	white-space nowrap

	> .avatar
		flex-shrink 0
		margin-right 8px
		width 20px
		height 20px
		border-radius 100%

	> .name
		display block
		margin 0 .5em 0 0
		padding 0
		overflow hidden
		color var(--noteHeaderName)
		font-size 1em
		font-weight bold
		text-decoration none
		text-overflow ellipsis

		&:hover
			text-decoration underline

	> .username
		margin 0 .5em 0 0
		overflow hidden
		text-overflow ellipsis
		color var(--noteHeaderAcct)
		flex-shrink 2147483647

	> .is-verified
		margin 0 .5em 0 0
		color #4dabf7

		> .horseshoe
			width 1em
			height 1em
			vertical-align: -.125em

	> .is-premium
		margin 0 .5em 0 0
		color #FFC107

	> .is-bot
		margin 0 .5em 0 0
		color var(--noteHeaderBadgeFg)

	> .info
		margin-left auto
		font-size 0.9em

		> *
			color var(--noteHeaderInfo)

		> .mobile
			margin-right 8px

		> .app
			margin-right 8px
			padding-right 8px
			border-right solid 1px var(--faceDivider)

		> .visibility
			margin-left 8px

		> .localOnly
			margin-left 4px

</style>

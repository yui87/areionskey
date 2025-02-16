<template>
<div class="mk-settings">
	<div class="nav" :class="{ inWindow }">
		<router-link to="/i/settings/profile" activeClass="active"><fa icon="user" fixedWidth/>{{ $t('@._settings.profile') }}</router-link>
		<router-link to="/i/settings/appearance" activeClass="active"><fa icon="palette" fixedWidth/>{{ $t('@._settings.appearance') }}</router-link>
		<router-link to="/i/settings/behavior" activeClass="active"><fa icon="desktop" fixedWidth/>{{ $t('@._settings.behavior') }}</router-link>
		<router-link to="/i/settings/notification" activeClass="active"><fa :icon="['far', 'bell']" fixedWidth/>{{ $t('@._settings.notification') }}</router-link>
		<router-link to="/i/settings/drive" activeClass="active"><fa icon="cloud" fixedWidth/>{{ $t('@.drive') }}</router-link>
		<router-link to="/i/settings/hashtags" activeClass="active"><fa icon="hashtag" fixedWidth/>{{ $t('@._settings.tags') }}</router-link>
		<router-link to="/i/settings/muteAndBlock" activeClass="active"><fa icon="ban" fixedWidth/>{{ $t('@._settings.mute-and-block') }}</router-link>
		<!-- <router-link to="/i/settings/apps" active-class="active"><fa icon="puzzle-piece" fixed-width/>{{ $t('@._settings.apps') }}</router-link> -->
		<router-link to="/i/settings/security" activeClass="active"><fa icon="lock" fixedWidth/>{{ $t('@._settings.security') }}</router-link>
		<router-link to="/i/settings/api" activeClass="active"><fa icon="key" fixedWidth/>API</router-link>
		<router-link to="/i/settings/other" activeClass="active"><fa icon="cogs" fixedWidth/>{{ $t('@._settings.other') }}</router-link>
	</div>
	<div class="pages">
		<x-settings :page="page"/>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';
import XSettings from '../../../common/views/components/settings/settings.vue';

export default Vue.extend({
	i18n: i18n(),
	components: {
		XSettings,
	},
	props: {
		page: {
			type: String,
			required: true,
		},
		inWindow: {
			type: Boolean,
			required: false,
			default: true
		}
	},
});
</script>

<style lang="stylus" scoped>
.mk-settings
	display flex
	width 100%
	height 100%

	> .nav
		flex 0 0 200px
		width 100%
		height 100%
		padding 16px 0 0 0
		overflow auto
		z-index 1
		font-size 15px

		> a
			display block
			padding 10px 16px
			margin 0
			color var(--desktopSettingsNavItem)
			cursor pointer
			user-select none
			transition margin-left 0.2s ease

			> [data-icon]
				margin-right 4px

			&:hover
				color var(--desktopSettingsNavItemHover)

			&.active
				margin-left 8px
				color var(--primary) !important

	> .pages
		width 100%
		height 100%
		flex auto
		overflow auto

</style>

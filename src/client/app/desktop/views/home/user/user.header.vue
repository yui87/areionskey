<template>
<div class="header" :class="{ shadow: $store.state.device.useShadow, round: $store.state.device.roundedCorners }">
	<div class="banner-container" :style="style">
		<div class="banner" ref="banner" :style="style"></div>
		<div class="fade"></div>
		<div class="title">
			<p class="name">
				<mk-user-name :user="user" :nowrap="false"/>
			</p>
			<div>
				<span class="username"><mk-acct :user="user" :detail="true" /></span>
				<span v-if="user.movedToUser != null">moved to <router-link :to="user.movedToUser | userPage()"><mk-acct :user="user.movedToUser" :detail="true"/></router-link></span>
				<span class="is-admin" v-if="user.isAdmin" :title="$t('@.admin-user')"><fa icon="wrench"/></span>
				<span class="is-moderator" v-if="user.isModerator" :title="$t('@.moderator')"><fa :icon="faUserShield"/></span>
				<span class="is-premium" v-if="user.isPremium" :title="$t('@.premium-user')"><fa icon="crown"/></span>
				<span class="is-verified" v-if="user.isVerified" :title="$t('@.verified-user')"><img svg-inline src="../../../../../assets/horseshoe.svg" class="horseshoe"/></span>
				<span class="is-bot" v-if="user.isBot" :title="$t('@.bot-user')"><fa icon="robot"/></span>
			</div>
		</div>
		<span class="followed" v-if="$store.getters.isSignedIn && $store.state.i.id != user.id && user.isFollowed">{{ $t('follows-you') }}</span>
		<div class="actions" v-if="$store.getters.isSignedIn">
			<button @click="menu" class="menu" ref="menu"><fa icon="ellipsis-h"/></button>
			<mk-follow-button v-if="$store.state.i.id != user.id && !user.isBlocking" :user="user" :inline="true" :transparent="false" class="follow"/>
		</div>
		<div class="actions" v-else>
			<mk-follow-button :user="user" :inline="true" :transparent="false" class="follow"/>
		</div>
	</div>
	<mk-avatar class="avatar" :user="user" :disable-preview="true"/>
	<div class="body">
		<div class="description">
			<mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$store.state.i" :custom-emojis="user.emojis"/>
			<p v-else class="empty">{{ $t('no-description') }}</p>
			<x-integrations :user="user" style="margin-top:16px;"/>
		</div>
		<div class="fields" v-if="user.fields" :key="user.id">
			<dl class="field" v-for="(field, i) in user.fields" :key="i">
				<dt class="name">
					<mfm :text="field.name" :plain="true" :custom-emojis="user.emojis"/>
				</dt>
				<dd class="value">
					<mfm :text="field.value" :author="user" :i="$store.state.i" :custom-emojis="user.emojis"/>
				</dd>
			</dl>
		</div>
		<div class="info">
			<span class="location" v-if="user.location"><fa icon="map-marker"/> {{ user.location }}</span>
			<span class="birthday" v-if="user.birthday"><fa icon="birthday-cake"/> {{ user.birthday.replace('-', $t('year')).replace('-', $t('month')) + $t('day') }} ({{ $t('years-old', { age }) }})</span>
		</div>
		<div class="status">
			<router-link :to="user | userPage()" class="notes-count"><b>{{ user.notesCount | number }}</b>{{ $t('posts') }}</router-link>
			<router-link :to="user | userPage('following')" class="following clickable"><b>{{ user.followingCount | number }}</b>{{ $t('following') }}</router-link>
			<router-link :to="user | userPage('followers')" class="followers clickable"><b>{{ user.followersCount | number }}</b>{{ $t('followers') }}</router-link>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../../i18n';
import * as age from 's-age';
import XUserMenu from '../../../../common/views/components/user-menu.vue';
import XIntegrations from '../../../../common/views/components/integrations.vue';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';

export default Vue.extend({
	i18n: i18n('desktop/views/pages/user/user.header.vue'),
	components: {
		XIntegrations
	},
	props: ['user'],
	data() {
		return {
			faUserShield
		}
	},
	computed: {
		style(): any {
			if (this.user.bannerUrl == null) return {};
			return {
				backgroundColor: this.user.bannerColor,
				backgroundImage: `url(${ this.user.bannerUrl })`
			};
		},

		age(): number {
			return age(this.user.birthday);
		}
	},
	mounted() {
		if (this.user.bannerUrl) {
			//window.addEventListener('load', this.onScroll);
			//window.addEventListener('scroll', this.onScroll, { passive: true });
			//window.addEventListener('resize', this.onScroll);
		}
	},
	beforeDestroy() {
		if (this.user.bannerUrl) {
			//window.removeEventListener('load', this.onScroll);
			//window.removeEventListener('scroll', this.onScroll);
			//window.removeEventListener('resize', this.onScroll);
		}
	},
	methods: {
		mention() {
			this.$post({ mention: this.user });
		},
		onScroll() {
			const banner = this.$refs.banner as any;

			const top = window.scrollY;

			const z = 1.25; // 奥行き(小さいほど奥)
			const pos = -(top / z);
			banner.style.backgroundPosition = `center calc(50% - ${pos}px)`;

			const blur = top / 32
			if (blur <= 10) banner.style.filter = `blur(${blur}px)`;
		},

		menu() {
			const w = this.$root.new(XUserMenu, {
				source: this.$refs.menu,
				user: this.user
			});
			this.$once('hook:beforeDestroy', () => {
				w.destroyDom();
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.header
	background var(--face)
	overflow hidden

	&.round
		border-radius 6px

	&.shadow
		box-shadow 0 3px 8px rgba(0, 0, 0, 0.2)

	> .banner-container
		height 250px
		overflow hidden
		background-size cover
		background-position center

		> .banner
			height 100%
			background-color #383838
			background-size cover
			background-position center
			box-shadow 0 0 128px rgba(0, 0, 0, 0.5) inset

		> .fade
			position absolute
			bottom 0
			left 0
			width 100%
			height 78px
			background linear-gradient(transparent, rgba(#000, 0.7))

		> .followed
			position absolute
			top 12px
			left 12px
			padding 4px 6px
			color #fff
			background rgba(0, 0, 0, 0.7)
			font-size 12px

		> .actions
			position absolute
			top 12px
			right 12px

			> .menu
				height 100%
				padding 0 14px
				color #fff
				text-shadow 0 0 8px #000
				font-size 16px

		> .title
			position absolute
			bottom 0
			left 0
			width 100%
			padding 0 0 8px 154px
			color #fff

			> .name
				display block
				margin 0
				line-height 32px
				font-weight bold
				font-size 1.8em
				text-shadow 0 0 8px #000

			> div
				> *
					display inline-block
					margin-right .5em
					line-height 20px
					opacity 0.8

					&.username
						font-weight bold

				> .is-admin
					color var(--noteHeaderAdminFg)

				> .is-moderator
					color #ff9e3d

				> .is-premium
					color #FFC107

				> .is-verified
					color #4dabf7

					> .horseshoe
						width 1em
						height 1em
						vertical-align: -.125em

				> .is-bot
					color var(--noteHeaderBadgeFg)

	> .avatar
		display block
		position absolute
		top 170px
		left 16px
		z-index 2
		width 120px
		height 120px
		box-shadow 1px 1px 3px rgba(#000, 0.2)

		> &.cat::before,
		> &.cat::after
			border-width 8px

	> .body
		padding 16px 16px 16px 154px
		color var(--text)

		> .description
			font-size 15px

			> .empty
				margin 0
				opacity 0.5

		> .fields
			margin-top 16px

			> .field
				display flex
				padding 0
				margin 0
				align-items center

				> .name
					border-right solid 1px var(--faceDivider)
					padding 4px
					margin 4px
					width 30%
					overflow hidden
					white-space nowrap
					text-overflow ellipsis
					font-weight bold
					text-align center

				> .value
					padding 4px
					margin 4px
					width 70%
					overflow hidden
					white-space nowrap
					text-overflow ellipsis

		> .info
			margin-top 16px
			padding-top 16px
			border-top solid 1px var(--faceDivider)
			font-size 15px

			&:empty
				display none

			> *
				margin-right 16px

		> .status
			margin-top 16px
			padding-top 16px
			border-top solid 1px var(--faceDivider)
			font-size 80%

			> *
				display inline-block
				padding-right 16px
				margin-right 16px
				color inherit

				&:not(:last-child)
					border-right solid 1px var(--faceDivider)

				&.clickable
					cursor pointer

					&:hover
						color var(--faceTextButtonHover)

				> b
					margin-right 4px
					font-size 1rem
					font-weight bold
					color var(--primary)

</style>

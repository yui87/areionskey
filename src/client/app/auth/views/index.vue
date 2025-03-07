<template>
<div class="index">
	<main v-if="$store.getters.isSignedIn">
		<p class="fetching" v-if="fetching">{{ $t('loading') }}<mk-ellipsis/></p>
		<x-form
			class="form"
			ref="form"
			v-if="state == 'waiting'"
			:session="session"
			@denied="state = 'denied'"
			@accepted="accepted"
		/>
		<div class="denied" v-if="state == 'denied'">
			<h1>{{ $t('denied') }}</h1>
			<p>{{ $t('denied-paragraph') }}</p>
		</div>
		<div class="accepted" v-if="state == 'accepted'">
			<h1>{{ session.app.isAuthorized ? this.$t('already-authorized') : this.$t('allowed') }}</h1>
			<p v-if="session.app.callbackUrl">{{ $t('callback-url') }}<mk-ellipsis/></p>
			<p v-if="!session.app.callbackUrl">{{ $t('please-go-back') }}</p>
		</div>
		<div class="error" v-if="state == 'fetch-session-error'">
			<p>{{ $t('error') }}</p>
		</div>
	</main>
	<main class="signin" v-if="!$store.getters.isSignedIn">
		<h1>{{ $t('sign-in') }}</h1>
		<mk-signin/>
	</main>
	<footer><img src="/assets/auth/icon.svg" alt="Areionskey"/></footer>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../i18n';
import XForm from './form.vue';

export default Vue.extend({
	i18n: i18n('auth/views/index.vue'),
	components: {
		XForm
	},
	data() {
		return {
			state: null,
			session: null,
			fetching: true
		};
	},
	computed: {
		token(): string {
			return this.$route.params.token;
		}
	},
	mounted() {
		if (!this.$store.getters.isSignedIn) return;

		// Fetch session
		this.$root.api('auth/session/show', {
			token: this.token
		}).then(session => {
			this.session = session;
			this.fetching = false;

			// 既に連携していた場合
			if (this.session.app.isAuthorized) {
				this.$root.api('auth/accept', {
					token: this.session.token
				}).then(() => {
					this.accepted();
				});
			} else {
				this.state = 'waiting';
			}
		}).catch(error => {
			this.state = 'fetch-session-error';
			this.fetching = false;
		});
	},
	methods: {
		accepted() {
			this.state = 'accepted';
			if (this.session.app.callbackUrl) {
				const url = new URL(this.session.app.callbackUrl);
				if (['javascript:', 'file:', 'data:', 'mailto:', 'tel:'].includes(url.protocol)) throw new Error('invalid url');
				location.href = `${this.session.app.callbackUrl}?token=${this.session.token}`;
			}
		}
	}
});
</script>

<style lang="stylus" scoped>
.index

	> main
		width 100%
		max-width 500px
		margin 0 auto
		text-align center
		background #fff
		box-shadow 0 4px 16px rgba(#000, 0.2)

		> .fetching
			margin 0
			padding 32px
			color #555

		> div:not(.form)
			padding 64px

			> h1
				margin 0 0 8px 0
				padding 0
				font-size 20px
				font-weight normal

			> p
				margin 0
				color #555

			&.denied > h1
				color #e65050

			&.accepted > h1
				color #54af7c

		&.signin
			padding 32px 32px 16px 32px

			> h1
				margin 0 0 22px 0
				padding 0
				font-size 20px
				font-weight normal
				color #555

		@media (max-width 600px)
			max-width none
			box-shadow none

		@media (max-width 500px)
			> div
				> h1
					font-size 16px

	> footer
		> img
			display block
			width 32px
			height 32px
			margin 16px auto

</style>

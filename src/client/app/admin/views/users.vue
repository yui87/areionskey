<template>
<div>
	<ui-card>
		<template #title><fa :icon="faTerminal"/> {{ $t('operation') }}</template>
		<section class="fit-top">
			<ui-input class="target" v-model="target" type="text" @enter="showUser">
				<span>{{ $t('username-or-userid') }}</span>
			</ui-input>
			<ui-button @click="showUser"><fa :icon="faSearch"/> {{ $t('lookup') }}</ui-button>

			<div ref="user" class="user" v-if="user" :key="user.id">
				<x-user :user="user"/>
				<div class="actions">
					<ui-button v-if="user.host != null" @click="updateRemoteUser"><fa :icon="faSync"/> {{ $t('update-remote-user') }}</ui-button>
					<ui-button @click="resetPassword" :disabled="user.isAdmin"><fa :icon="faKey"/> {{ $t('reset-password') }}</ui-button>
					<ui-horizon-group>
						<ui-button @click="setPremium" :disabled="changing"><fa :icon="faCrown"/> {{ $t('premium') }}</ui-button>
						<ui-button @click="unsetPremium" :disabled="changing">{{ $t('unpremium') }}</ui-button>
					</ui-horizon-group>
					<ui-horizon-group>
						<ui-button @click="verifyUser" :disabled="verifying"><fa :icon="faCertificate"/> {{ $t('verify') }}</ui-button>
						<ui-button @click="unverifyUser" :disabled="unverifying">{{ $t('unverify') }}</ui-button>
					</ui-horizon-group>
					<ui-horizon-group>
						<ui-button @click="silenceUser"><fa :icon="faMicrophoneSlash"/> {{ $t('make-silence') }}</ui-button>
						<ui-button @click="unsilenceUser">{{ $t('unmake-silence') }}</ui-button>
					</ui-horizon-group>
					<ui-horizon-group>
						<ui-button @click="suspendUser" :disabled="suspending || user.isModerator || user.isAdmin"><fa :icon="faSnowflake"/> {{ $t('suspend') }}</ui-button>
						<ui-button @click="unsuspendUser" :disabled="unsuspending">{{ $t('unsuspend') }}</ui-button>
					</ui-horizon-group>
					<ui-button @click="deleteAllFiles" :disabled="(user.isModerator && !$store.getters.isAdmin) || user.isAdmin"><fa :icon="faTrashAlt"/> {{ $t('delete-all-files') }}</ui-button>
					<ui-button @click="deleteAccount" :disabled="deleting || user.isModerator || user.isAdmin"><fa :icon="faTrashAlt"/> {{ $t('delete-account') }}</ui-button>
					<ui-textarea v-if="user" :value="user | json5" readonly tall style="margin-top:16px;"></ui-textarea>
				</div>
			</div>
		</section>
	</ui-card>

	<ui-card>
		<template #title><fa :icon="faUsers"/> {{ $t('users.title') }}</template>
		<section class="fit-top">
			<ui-horizon-group inputs>
				<ui-select v-model="sort">
					<template #label>{{ $t('users.sort.title') }}</template>
					<option value="-createdAt">{{ $t('users.sort.createdAtAsc') }}</option>
					<option value="+createdAt">{{ $t('users.sort.createdAtDesc') }}</option>
					<option value="-updatedAt">{{ $t('users.sort.updatedAtAsc') }}</option>
					<option value="+updatedAt">{{ $t('users.sort.updatedAtDesc') }}</option>
				</ui-select>
				<ui-select v-model="state">
					<template #label>{{ $t('users.state.title') }}</template>
					<option value="all">{{ $t('users.state.all') }}</option>
					<option value="available">{{ $t('users.state.available') }}</option>
					<option value="admin">{{ $t('users.state.admin') }}</option>
					<option value="moderator">{{ $t('users.state.moderator') }}</option>
					<option value="verified">{{ $t('users.state.verified') }}</option>
					<option value="premiumed">{{ $t('users.state.premiumed') }}</option>
					<option value="silenced">{{ $t('users.state.silenced') }}</option>
					<option value="suspended">{{ $t('users.state.suspended') }}</option>
					<option value="cat">{{ $t('users.state.cat') }}</option>
					<option value="bot">{{ $t('users.state.bot') }}</option>
				</ui-select>
				<ui-select v-model="origin">
					<template #label>{{ $t('users.origin.title') }}</template>
					<option value="combined">{{ $t('users.origin.combined') }}</option>
					<option value="local">{{ $t('users.origin.local') }}</option>
					<option value="remote">{{ $t('users.origin.remote') }}</option>
				</ui-select>
			</ui-horizon-group>
			<ui-horizon-group searchboxes>
				<ui-input v-model="searchUsername" type="text" spellcheck="false" @input="fetchUsers(true)">
					<span>{{ $t('username') }}</span>
				</ui-input>
				<ui-input v-model="searchHost" type="text" spellcheck="false" @input="fetchUsers(true)" :disabled="origin === 'local'">
					<span>{{ $t('host') }}</span>
				</ui-input>
			</ui-horizon-group>
			<sequential-entrance animation="entranceFromTop" delay="25">
				<x-user v-for="user in users" :key="user.id" :user='user' :click="showUserOnClick"/>
			</sequential-entrance>
			<ui-button v-if="existMore" @click="fetchUsers">{{ $t('@.load-more') }}</ui-button>
		</section>
	</ui-card>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../i18n';
import parseAcct from "../../../../misc/acct/parse";
import { faCrown, faCertificate, faUsers, faTerminal, faSearch, faKey, faSync, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';
import { faSnowflake, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import XUser from './users.user.vue';

export default Vue.extend({
	i18n: i18n('admin/views/users.vue'),
	components: {
		XUser
	},
	data() {
		return {
			user: null,
			target: null,
			verifying: false,
			unverifying: false,
			suspending: false,
			unsuspending: false,
			deleting: false,
			sort: '+createdAt',
			state: 'all',
			origin: 'local',
			searchUsername: '',
			searchHost: '',
			limit: 10,
			offset: 0,
			users: [],
			existMore: false,
			changing: false,
			faTerminal, faCrown, faCertificate, faUsers, faSnowflake, faSearch, faKey, faSync, faMicrophoneSlash, faTrashAlt
		};
	},

	watch: {
		sort() {
			this.users = [];
			this.offset = 0;
			this.fetchUsers();
		},

		state() {
			this.users = [];
			this.offset = 0;
			this.fetchUsers();
		},

		origin() {
			if (this.origin === 'local') this.searchHost = '';
			this.users = [];
			this.offset = 0;
			this.fetchUsers();
		}
	},

	mounted() {
		this.fetchUsers();
	},

	methods: {
		/** テキストエリアのユーザーを解決する */
		fetchUser() {
			return new Promise((res) => {
				const usernamePromise = this.$root.api('users/show', parseAcct(this.target));
				const idPromise = this.$root.api('users/show', { userId: this.target });

				let _notFound = false;
				const notFound = () => {
					if (_notFound) {
						this.$root.dialog({
							type: 'error',
							text: this.$t('user-not-found')
						});
					} else {
						_notFound = true;
					}
				};

				usernamePromise.then(res).catch(e => {
					if (e == 'user not found') {
						notFound();
					}
				});
				idPromise.then(res).catch(e => {
					notFound();
				});
			});
		},

		/** テキストエリアから処理対象ユーザーを設定する */
		async showUser() {
			this.user = null;
			const user = await this.fetchUser();
			this.$root.api('users/show', { userId: user.id }).then(info => {
				this.user = info;
			});
			this.target = '';
		},

		async showUserOnClick(userId: string) {
			this.$root.api('users/show', { userId: userId }).then(info => {
				this.user = info;
				this.$nextTick(() => {
					this.$refs.user.scrollIntoView();
				});
			});
		},

		/** 処理対象ユーザーの情報を更新する */
		async refreshUser() {
			this.$root.api('users/show', { userId: this.user.id }).then(info => {
				this.user = info;
			});
		},

		async resetPassword() {
			if (!await this.getConfirmed(this.$t('reset-password-confirm'))) return;

			this.$root.api('admin/reset-password', { userId: this.user.id }).then(res => {
				this.$root.dialog({
					type: 'success',
					text: this.$t('password-updated', { password: res.password })
				});
			});
		},

		async verifyUser() {
			if (!await this.getConfirmed(this.$t('verify-confirm'))) return;
			this.verifying = true;
			const process = async () => {
				await this.$root.api('admin/verify-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('verified')
				});
			};
			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});
			this.verifying = false;
			this.refreshUser();
		},

		async unverifyUser() {
			if (!await this.getConfirmed(this.$t('unverify-confirm'))) return;
			this.unverifying = true;
			const process = async () => {
				await this.$root.api('admin/unverify-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('unverified')
				});
			};
			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});
			this.unverifying = false;
			this.refreshUser();
		},

		async setPremium() {
			if (!await this.getConfirmed(this.$t('premium-confirm'))) return;
			this.changing = true;
			const process = async () => {
				await this.$root.api('admin/set-premium', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('premiumed')
				});
			};
			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});
			this.changing = false;
			this.refreshUser();
		},

		async unsetPremium() {
			if (!await this.getConfirmed(this.$t('unpremium-confirm'))) return;
			this.changing = true;
			const process = async () => {
				await this.$root.api('admin/unset-premium', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('unpremiumed')
				});
			};
			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.toString()
				});
			});
			this.changing = false;
			this.refreshUser();
		},

		async silenceUser() {
			if (!await this.getConfirmed(this.$t('silence-confirm'))) return;
			const process = async () => {
				await this.$root.api('admin/silence-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});

			this.refreshUser();
		},

		async unsilenceUser() {
			if (!await this.getConfirmed(this.$t('unsilence-confirm'))) return;

			const process = async () => {
				await this.$root.api('admin/unsilence-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});

			this.refreshUser();
		},

		async suspendUser() {
			if (!await this.getConfirmed(this.$t('suspend-confirm'))) return;

			this.suspending = true;

			const process = async () => {
				await this.$root.api('admin/suspend-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('suspended')
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});

			this.suspending = false;

			this.refreshUser();
		},

		async unsuspendUser() {
			if (!await this.getConfirmed(this.$t('unsuspend-confirm'))) return;

			this.unsuspending = true;

			const process = async () => {
				await this.$root.api('admin/unsuspend-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					text: this.$t('unsuspended')
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});

			this.unsuspending = false;

			this.refreshUser();
		},

		async updateRemoteUser() {
			this.$root.api('admin/update-remote-user', { userId: this.user.id }).then(res => {
				this.$root.dialog({
					type: 'success',
					text: this.$t('remote-user-updated')
				});
			});

			this.refreshUser();
		},

		async deleteAllFiles() {
			if (!await this.getConfirmed(this.$t('delete-all-files-confirm'))) return;

			const process = async () => {
				await this.$root.api('admin/delete-all-files-of-a-user', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});
		},

		async deleteAccount() {
			if (!await this.getConfirmed(this.$t('delete-account-confirm'))) return;

			this.deleting = true;

			const process = async () => {
				await this.$root.api('admin/delete-account', { userId: this.user.id });
				this.$root.dialog({
					type: 'success',
					splash: true
				});
			};

			await process().catch(e => {
				this.$root.dialog({
					type: 'error',
					text: e.message
				});
			});

			this.deleting = false;
		},

		async getConfirmed(text: string): Promise<Boolean> {
			const confirm = await this.$root.dialog({
				type: 'warning',
				showCancelButton: true,
				title: this.$t('confirm'),
				text,
			});

			return !confirm.canceled;
		},

		fetchUsers(truncate?: boolean) {
			if (truncate) this.offset = 0;
			this.$root.api('admin/show-users', {
				state: this.state,
				origin: this.origin,
				sort: this.sort,
				offset: this.offset,
				limit: this.limit + 1,
				username: this.searchUsername,
				hostname: this.searchHost
			}).then(users => {
				if (users.length == this.limit + 1) {
					users.pop();
					this.existMore = true;
				} else {
					this.existMore = false;
				}
				this.users = truncate ? users : this.users.concat(users);
				this.offset += this.limit;
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.target
	margin-bottom 16px !important

.user
	margin-top 32px

	> .actions
		margin-left 80px
</style>

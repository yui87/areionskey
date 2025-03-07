<template>
<div
	class="note"
	:class="{ mini: narrow }"
	v-show="(this.$store.state.settings.remainDeletedNote || appearNote.deletedAt == null) && !hideThisNote"
	:tabindex="appearNote.deletedAt == null ? '-1' : null"
	v-hotkey="keymap"
	:title="title"
>
	<x-sub v-for="note in conversation" :key="note.id" :note="note"/>
	<div class="reply-to" v-if="appearNote.reply && (!$store.getters.isSignedIn || $store.state.settings.showReplyTarget)">
		<x-sub :note="appearNote.reply"/>
	</div>
	<mk-renote class="renote" v-if="isRenote" :note="note"/>
	<article class="article">
		<mk-avatar class="avatar" :user="appearNote.user"/>
		<div class="main">
			<mk-note-header class="header" :note="appearNote" :mini="narrow"/>
			<div class="body" v-if="appearNote.deletedAt == null">
				<p v-if="appearNote.cw != null" class="cw">
					<mfm v-if="appearNote.cw != ''" class="text" :text="appearNote.cw" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis" :no-sticker="true"/>
					<mk-cw-button v-model="showContent" :note="appearNote"/>
				</p>
				<div class="content" v-show="appearNote.cw == null || showContent">
					<div class="text">
						<span v-if="appearNote.isHidden" style="opacity: 0.5">{{ $t('private') }}</span>
						<a class="reply" v-if="appearNote.reply"><fa icon="reply"/></a>
						<mfm v-if="appearNote.text" :text="appearNote.text" :author="appearNote.user" :i="$store.state.i" :custom-emojis="appearNote.emojis"/>
					</div>
					<div class="files" v-if="appearNote.files.length > 0">
						<mk-media-list :media-list="appearNote.files"/>
					</div>
					<mk-poll v-if="appearNote.poll" :note="appearNote" ref="pollViewer"/>
					<div class="renote" v-if="appearNote.renote"><mk-note-preview :note="appearNote.renote"/></div>
					<mk-url-preview v-for="url in urls" :url="url" :key="url" :compact="compact"/>
				</div>
			</div>
			<footer v-if="appearNote.deletedAt == null && !preview" class="footer">
				<span class="app" v-if="appearNote.app && narrow && $store.state.settings.showVia">via <b>{{ appearNote.app.name }}</b></span>
				<mk-reactions-viewer :note="appearNote" ref="reactionsViewer"/>
				<button class="replyButton button" @click="reply()" :title="$t('reply')">
					<template v-if="appearNote.reply"><fa icon="reply-all"/></template>
					<template v-else><fa icon="reply"/></template>
					<p class="count" v-if="appearNote.repliesCount > 0">{{ appearNote.repliesCount }}</p>
				</button>
				<button v-if="['public', 'home'].includes(appearNote.visibility)" class="renoteButton button" @click="renote()" :title="$t('renote')">
					<fa icon="retweet"/>
					<p class="count" v-if="appearNote.renoteCount > 0">{{ appearNote.renoteCount }}</p>
				</button>
				<button v-else class="inhibitedButton button">
					<fa icon="ban"/>
				</button>
				<button v-if="appearNote.myReaction == null" class="reactionButton button" @click="react()" ref="reactButton" :title="$t('add-reaction')">
					<fa icon="plus"/>
				</button>
				<button v-if="appearNote.myReaction != null" class="reactionButton reacted button" @click="undoReact(appearNote)" ref="reactButton" :title="$t('undo-reaction')">
					<fa icon="minus"/>
				</button>
				<button @click="menu()" ref="menuButton" class="button">
					<fa icon="ellipsis-h"/>
				</button>
			</footer>
			<div class="deleted" v-if="appearNote.deletedAt != null">{{ $t('deleted') }}</div>
		</div>
	</article>
	<x-sub v-for="note in replies" :key="note.id" :note="note"/>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import i18n from '../../../i18n';

import XSub from './note.sub.vue';
import noteMixin from '../../../common/scripts/note-mixin';
import noteSubscriber from '../../../common/scripts/note-subscriber';

export default Vue.extend({
	i18n: i18n('desktop/views/components/note.vue'),

	components: {
		XSub
	},

	mixins: [
		noteMixin(),
		noteSubscriber('note')
	],

	props: {
		note: {
			type: Object,
			required: true
		},
		detail: {
			type: Boolean,
			required: false,
			default: false
		},
		compact: {
			type: Boolean,
			required: false,
			default: false
		},
		preview: {
			type: Boolean,
			required: false,
			default: false
		},
	},

	inject: {
		narrow: {
			default: false
		}
	},

	data() {
		return {
			conversation: [],
			replies: []
		};
	},

	created() {
		if (this.detail) {
			this.$root.api('notes/children', {
				noteId: this.appearNote.id,
				limit: 30
			}).then(replies => {
				this.replies = replies;
			});

			this.$root.api('notes/conversation', {
				noteId: this.appearNote.replyId
			}).then(conversation => {
				this.conversation = conversation.reverse();
			});
		}
	}
});
</script>

<style lang="stylus" scoped>
.note
	margin 0
	padding 0
	overflow hidden
	background var(--face)
	border-bottom solid var(--lineWidth) var(--faceDivider)

	&.mini
		font-size 13px

		> .renote
			padding 8px 16px 0 16px

			.avatar
				width 20px
				height 20px

		> .article
			padding 16px 16px 4px

			> .avatar
				margin 0 10px 8px 0
				width 42px
				height 42px

	&:last-of-type
		border-bottom none

	&:focus
		z-index 1

		&:after
			content ""
			pointer-events none
			position absolute
			top 2px
			right 2px
			bottom 2px
			left 2px
			border 2px solid var(--primaryAlpha03)
			border-radius 4px

	> .renote + article
		padding-top 8px

	> .article
		display flex
		padding 28px 32px 18px 32px

		&:hover
			> .main > footer > button
				color var(--noteActionsHighlighted)

		> .avatar
			flex-shrink 0
			display block
			margin 0 16px 10px 0
			width 58px
			height 58px
			border-radius 8px
			//top 74px

		> .main
			flex 1
			min-width 0

			> .header
				margin-bottom 4px

			> .body

				> .cw
					cursor default
					display block
					margin 0
					padding 0
					overflow-wrap break-word
					color var(--noteText)

					> .text
						margin-right 8px

				> .content

					> .text
						cursor default
						display block
						margin 0
						padding 0
						overflow-wrap break-word
						color var(--noteText)
						font-size calc(1em + var(--fontSize))

						> .reply
							margin-right 8px
							color var(--text)

						> .rp
							margin-left 4px
							font-style oblique
							color var(--renoteText)

					.mk-url-preview
						margin-top 8px

					> .mk-poll
						font-size 80%

					> .renote
						margin 8px 0

						> *
							padding 16px
							border dashed var(--lineWidth) var(--quoteBorder)
							border-radius 8px

			> .footer
				> .app
					display block
					margin-top 0.5em
					margin-left 0.5em
					color var(--noteHeaderInfo)
					font-size 0.8em

				> .button
					margin 0 28px 0 0
					padding 0 8px
					line-height 32px
					font-size 1em
					color var(--noteActions)
					background transparent
					border none
					cursor pointer

					&:last-child
						margin-right 0

					&:hover
						color var(--noteActionsHover)

					&.replyButton:hover
						color var(--noteActionsReplyHover)

					&.renoteButton:hover
						color var(--noteActionsRenoteHover)

					&.reactionButton:hover
						color var(--noteActionsReactionHover)

					&.inhibitedButton
						cursor not-allowed

					> .count
						display inline
						margin 0 0 0 8px
						color var(--text)
						opacity 0.7

					&.reacted, &.reacted:hover
						color var(--noteActionsReactionHover)

			> .deleted
				color var(--noteText)
				opacity 0.7

</style>

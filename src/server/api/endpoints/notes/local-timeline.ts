import $ from 'cafy';
import { ID } from '../../../../misc/cafy-id';
import define from '../../define';
import { fetchMeta } from '../../../../misc/fetch-meta';
import { ApiError } from '../../error';
import { Notes } from '../../../../models';
import { generateMuteQuery } from '../../common/generate-mute-query';
import { makePaginationQuery } from '../../common/make-pagination-query';
import { generateVisibilityQuery } from '../../common/generate-visibility-query';
import { activeUsersChart } from '../../../../services/chart';
import { Brackets } from 'typeorm';

export const meta = {
	desc: {
		'ja-JP': 'ローカルタイムラインを取得します。'
	},

	tags: ['notes'],

	params: {
		withFiles: {
			validator: $.optional.bool,
			desc: {
				'ja-JP': 'ファイルが添付された投稿に限定するか否か'
			}
		},

		fileType: {
			validator: $.optional.arr($.str),
			desc: {
				'ja-JP': '指定された種類のファイルが添付された投稿のみを取得します'
			}
		},

		excludeNsfw: {
			validator: $.optional.bool,
			default: false,
			desc: {
				'ja-JP': 'true にすると、NSFW指定されたファイルを除外します(fileTypeが指定されている場合のみ有効)'
			}
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		sinceId: {
			validator: $.optional.type(ID),
		},

		untilId: {
			validator: $.optional.type(ID),
		},

		sinceDate: {
			validator: $.optional.num,
		},

		untilDate: {
			validator: $.optional.num,
		},
	},

	res: {
		type: 'array' as const,
		optional: false as const, nullable: false as const,
		items: {
			type: 'object' as const,
			optional: false as const, nullable: false as const,
			ref: 'Note',
		}
	},

	errors: {
		ltlDisabled: {
			message: 'Local timeline has been disabled.',
			code: 'LTL_DISABLED',
			id: '45a6eb02-7695-4393-b023-dd3be9aaaefd'
		},
	}
};

export default define(meta, async (ps, user) => {
	const m = await fetchMeta();
	if (m.disableLocalTimeline) {
		if (user == null || (!user.isAdmin && !user.isModerator)) {
			throw new ApiError(meta.errors.ltlDisabled);
		}
	}

	//#region Construct query
	const query = makePaginationQuery(Notes.createQueryBuilder('note'),
			ps.sinceId, ps.untilId, ps.sinceDate, ps.untilDate)
		.andWhere('(note.visibility = \'public\') AND (note.userHost IS NULL)')
		.innerJoinAndSelect('note.user', 'user')
		.leftJoinAndSelect('user.avatar', 'avatar')
		.leftJoinAndSelect('user.banner', 'banner')
		.leftJoinAndSelect('note.reply', 'reply')
		.leftJoinAndSelect('note.renote', 'renote')
		.leftJoinAndSelect('reply.user', 'replyUser')
		.leftJoinAndSelect('replyUser.avatar', 'replyUserAvatar')
		.leftJoinAndSelect('replyUser.banner', 'replyUserBanner')
		.leftJoinAndSelect('renote.user', 'renoteUser')
		.leftJoinAndSelect('renoteUser.avatar', 'renoteUserAvatar')
		.leftJoinAndSelect('renoteUser.banner', 'renoteUserBanner');

	generateVisibilityQuery(query, user);
	if (user) generateMuteQuery(query, user);

	if (ps.withFiles) {
		query.andWhere('note.fileIds != \'{}\'');
	}

	if (ps.fileType != null) {
		query.andWhere('note.fileIds != \'{}\'');
		query.andWhere(new Brackets(qb => {
			for (const type of ps.fileType!) {
				const i = ps.fileType!.indexOf(type);
				qb.orWhere(`:type${i} = ANY(note.attachedFileTypes)`, { [`type${i}`]: type });
			}
		}));

		if (ps.excludeNsfw) {
			query.andWhere('note.cw IS NULL');
			query.andWhere('0 = (SELECT COUNT(*) FROM drive_file df WHERE df.id = ANY(note."fileIds") AND df."isSensitive" = TRUE)');
		}
	}
	//#endregion

	const timeline = await query.take(ps.limit!).getMany();

	process.nextTick(() => {
		if (user) {
			activeUsersChart.update(user);
		}
	});

	return await Notes.packMany(timeline, user);
});

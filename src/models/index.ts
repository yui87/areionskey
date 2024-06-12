import { getRepository, getCustomRepository } from 'typeorm';
import { Instance } from './entities/instance';
import { Emoji } from './entities/emoji';
import { Poll } from './entities/poll';
import { PollVote } from './entities/poll-vote';
import { Meta } from './entities/meta';
import { SwSubscription } from './entities/sw-subscription';
import { NoteWatching } from './entities/note-watching';
import { NoteUnread } from './entities/note-unread';
import { RegistrationTicket } from './entities/registration-tickets';
import { UserRepository } from './repositories/user';
import { NoteRepository } from './repositories/note';
import { DriveFileRepository } from './repositories/drive-file';
import { DriveFolderRepository } from './repositories/drive-folder';
import { AccessToken } from './entities/access-token';
import { UserNotePining } from './entities/user-note-pinings';
import { SigninRepository } from './repositories/signin';
import { MessagingMessageRepository } from './repositories/messaging-message';
import { ReversiGameRepository } from './repositories/games/reversi/game';
import { UserListRepository } from './repositories/user-list';
import { UserListJoining } from './entities/user-list-joining';
import { UserGroupRepository } from './repositories/user-group';
import { UserGroupJoining } from './entities/user-group-joining';
import { UserGroupInviteRepository } from './repositories/user-group-invite';
import { FollowRequestRepository } from './repositories/follow-request';
import { MutingRepository } from './repositories/muting';
import { BlockingRepository } from './repositories/blocking';
import { NoteReactionRepository } from './repositories/note-reaction';
import { NotificationRepository } from './repositories/notification';
import { NoteFavoriteRepository } from './repositories/note-favorite';
import { ReversiMatchingRepository } from './repositories/games/reversi/matching';
import { UserPublickey } from './entities/user-publickey';
import { UserKeypair } from './entities/user-keypair';
import { AppRepository } from './repositories/app';
import { FollowingRepository } from './repositories/following';
import { AbuseUserReportRepository } from './repositories/abuse-user-report';
import { AuthSessionRepository } from './repositories/auth-session';
import { UserProfile } from './entities/user-profile';
import { AttestationChallenge } from './entities/attestation-challenge';
import { UserSecurityKey } from './entities/user-security-key';
import { HashtagRepository } from './repositories/hashtag';
import { PageRepository } from './repositories/page';
import { PageLikeRepository } from './repositories/page-like';
import { ModerationLogRepository } from './repositories/moderation-logs';
import { UsedUsername } from './entities/used-username';
import { RelayRepository } from './repositories/relay';
import { PasswordResetRequest } from './entities/password-reset-request';

export const Apps = getCustomRepository(AppRepository);
export const Notes = getCustomRepository(NoteRepository);
export const NoteFavorites = getCustomRepository(NoteFavoriteRepository);
export const NoteWatchings = getRepository(NoteWatching);
export const NoteReactions = getCustomRepository(NoteReactionRepository);
export const NoteUnreads = getRepository(NoteUnread);
export const Polls = getRepository(Poll);
export const PollVotes = getRepository(PollVote);
export const Users = getCustomRepository(UserRepository);
export const UserProfiles = getRepository(UserProfile);
export const UserKeypairs = getRepository(UserKeypair);
export const AttestationChallenges = getRepository(AttestationChallenge);
export const UserSecurityKeys = getRepository(UserSecurityKey);
export const UserPublickeys = getRepository(UserPublickey);
export const UserLists = getCustomRepository(UserListRepository);
export const UserListJoinings = getRepository(UserListJoining);
export const UserGroups = getCustomRepository(UserGroupRepository);
export const UserGroupJoinings = getRepository(UserGroupJoining);
export const UserGroupInvites = getCustomRepository(UserGroupInviteRepository);
export const UserNotePinings = getRepository(UserNotePining);
export const UsedUsernames = getRepository(UsedUsername);
export const Followings = getCustomRepository(FollowingRepository);
export const FollowRequests = getCustomRepository(FollowRequestRepository);
export const Instances = getRepository(Instance);
export const Emojis = getRepository(Emoji);
export const DriveFiles = getCustomRepository(DriveFileRepository);
export const DriveFolders = getCustomRepository(DriveFolderRepository);
export const Notifications = getCustomRepository(NotificationRepository);
export const Metas = getRepository(Meta);
export const Mutings = getCustomRepository(MutingRepository);
export const Blockings = getCustomRepository(BlockingRepository);
export const SwSubscriptions = getRepository(SwSubscription);
export const Hashtags = getCustomRepository(HashtagRepository);
export const AbuseUserReports = getCustomRepository(AbuseUserReportRepository);
export const RegistrationTickets = getRepository(RegistrationTicket);
export const AuthSessions = getCustomRepository(AuthSessionRepository);
export const AccessTokens = getRepository(AccessToken);
export const Signins = getCustomRepository(SigninRepository);
export const MessagingMessages = getCustomRepository(MessagingMessageRepository);
export const ReversiGames = getCustomRepository(ReversiGameRepository);
export const ReversiMatchings = getCustomRepository(ReversiMatchingRepository);
export const Pages = getCustomRepository(PageRepository);
export const PageLikes = getCustomRepository(PageLikeRepository);
export const ModerationLogs = getCustomRepository(ModerationLogRepository);
export const Relays = getCustomRepository(RelayRepository);
export const PasswordResetRequests = getRepository(PasswordResetRequest);

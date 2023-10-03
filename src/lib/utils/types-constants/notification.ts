export enum NotificationType {
    LIKE = "Like",
    REPOST = "Repost",
    FOLLOW = "Follow",
    MENTION = "Mention",
    QUOTE = "Quote",
    REPLY = "Reply"
}
export const ALL_NOTIFICATION_TYPES = [
    NotificationType.LIKE,
    NotificationType.REPOST,
    NotificationType.FOLLOW,
    NotificationType.MENTION,
    NotificationType.QUOTE,
    NotificationType.REPLY
];
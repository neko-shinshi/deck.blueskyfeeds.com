export const processStatus = (json) => {
    const {
        id, uri, account,
        in_reply_to_id, in_reply_to_account_id,
        content, content_type,
        created_at,
        replies_count, reblogs_count, favourites_count,
        reblogged, favourited, // my state
        sensitive, spoiler_text, //hide image, hide text
        mentions, tags, language, bookmarked,
        emoji_reactions, reactions
    } = json;


}

export const processAccount = (json) => {
    const {
        id, uri, username, acct, avatar, emojis, bot,
        followers_count, following_count, statuses_count,
        note, fields,
        created_at,
    } = json;
}
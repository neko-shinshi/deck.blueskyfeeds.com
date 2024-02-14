export const stripPostUri = (postUri) => {
    return postUri.slice(5).replaceAll("/app.bsky.feed.post/", "/post/");
}

export const stripFeedUri = (feedUri) => {
    return feedUri.slice(5).replaceAll("/app.bsky.feed.generator/", "/feed/");
}

export const getDidAndHash = (atUri:string) => {
    const parts = atUri.split("/");
    return {did: parts[2], hash:parts[4]};
}
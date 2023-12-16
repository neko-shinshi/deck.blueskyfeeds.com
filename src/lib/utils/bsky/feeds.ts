import {Feed} from "@/lib/utils/types-constants/feed";
import {stripFeedUri} from "@/lib/utils/at_uri";
import {getAgent} from "@/lib/utils/bsky/agent";
import {BlueskyUserData} from "@/lib/utils/types-constants/user-data";

export const getFeed = async (feedUri, memory, user) => {
    const localUri = stripFeedUri(feedUri);
    const localFeed = memory.feeds[localUri];
    if (localFeed) {
        return {update:false, feed:localFeed};
    }

    const agent = await getAgent(user, memory.basicKey);
    if (!agent) {
        return {update:false, feed:null};
    }

    const {data:{feeds}} = await agent.api.app.bsky.feed.getFeedGenerators({feeds: [feedUri]});
    if (feeds.length === 0) {
        return {update:false, feed:null};
    }
    const {displayName, description, likeCount, avatar, creator, indexedAt} = feeds[0];
    const author:BlueskyUserData = (() => {
        const {did, handle, avatar, displayName} = creator;
        const lastTs = new Date().getTime();
        return {avatar, handle, displayName: displayName || handle, id: did, lastTs, type: "b"};
    })();
    const feed:Feed = {uri: feedUri, displayName, description, likeCount, avatar, creator:author.id, indexedAt};
    return {update:true, feed, author};
}

export const getMyFeeds = async (users, basicKey, additionalFeeds=[]):Promise<{feeds:Feed[], authors:BlueskyUserData[]}> => {
    let bigFeedMap = new Map<string, any>();
    const destructureAndAdd = (x, flags, uri, feedMap) => {
        let {displayName, description, likeCount, avatar, creator, indexedAt} = x;
        feedMap.set(uri, {
            uri,
            displayName:displayName||"",
            description:description||"",
            likeCount,
            avatar:avatar||"",
            creator,
            indexedAt,
            ...flags
        });
    }

    const feedMaps = await Promise.all(users.map(async (user, i) => {
        const agent = await getAgent(user, basicKey);
        if (!agent) {
            return {feeds:[], authorsTbd:[]};
        }
        let feedMap = new Map<string, any>();
        let [custom, saved] = await Promise.all([
            getCustomFeeds(agent),
            getSavedFeeds(agent, i === 0? additionalFeeds : [])
        ]);

        saved.forEach(x => {
            const {uri} = x;
            const existing = feedMap.get(uri);
            if (existing) {
                // copy flags
                if (x.pinned) {
                    existing.pinned = true;
                }
                existing.saved = true;
            } else {
                destructureAndAdd(x, {saved:true, pinned: x.pinned}, uri, feedMap);
            }
        });

        custom.forEach(x => {
            const {uri} = x;
            const existing = feedMap.get(uri);
            if (existing) {
                // copy flags
                existing.custom = true;
            } else {
                destructureAndAdd(x, {custom:true}, uri, feedMap);
            }
        });

        return feedMap;
    }));

    feedMaps.forEach(feedMap => {
        [...feedMap.values()].forEach(x => {
            const {uri:_uri, custom, saved, pinned} = x;
            const uri = stripFeedUri(_uri);
            const existing = bigFeedMap.get(uri);
            if (existing) {
                if (custom) {
                    existing.custom = true;
                }
                if (saved) {
                    existing.saved = true;
                }
                if (pinned) {
                    existing.pinned = true;
                }
            } else {
                destructureAndAdd(x, {pinned: !!x.pinned, saved: !!x.saved, custom: !!x.custom}, uri, bigFeedMap);
            }
        });
    });

    const _feeds = [...bigFeedMap.values()];
    const lastTs = new Date().getTime();
    const authors:BlueskyUserData[] = [..._feeds.reduce((acc, feed) => {
        const {did, handle, avatar, displayName} = feed.creator;
        const author:BlueskyUserData = {avatar, handle, displayName: displayName || handle, id: did, lastTs, type: "b"};
        acc.set(did, author);
        return acc;
    }, new Map<string, BlueskyUserData>()).values()];
    const feeds:Feed[] = _feeds.map(feed => {
        feed.creator = feed.creator.did;
        return feed as Feed;
    });

    return {feeds, authors};
}

const getSavedFeeds = async (agent, additionalFeeds=[]):Promise<any[]> => {
    const getSavedFeedIds = async () => {
        let {data} = await agent.api.app.bsky.actor.getPreferences();
        const feeds = data.preferences.find(x =>  x["$type"] === "app.bsky.actor.defs#savedFeedsPref");
        if (feeds) {
            const {$type, ...rest} = feeds;
            return rest;
        }

        return [];
    }

    const result = [];
    let {saved, pinned} = await getSavedFeedIds();

    if (saved || additionalFeeds.length > 0) {
        saved = saved || [];
        saved = [...new Set([...saved, additionalFeeds])];
        const {data:{feeds}} = await agent.api.app.bsky.feed.getFeedGenerators({feeds: saved});
        return feeds.map(x => {
            return {...x, pinned:pinned.indexOf(x.uri) >= 0};
        });
    }
    return result;
}

const getCustomFeeds = async (agent) => {
    let cursor = {};
    let results = [];
    do {
        const params = {actor: agent.session.did, ...cursor};
        const {data} = await agent.api.app.bsky.feed.getActorFeeds(params);
        const {cursor:newCursor, feeds} = data;
        feeds.forEach(x => results.push(x));
        if (!newCursor) {
            cursor = null;
        } else {
            cursor = {cursor: newCursor};
        }
    } while (cursor);
    return results;
}

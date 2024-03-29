import {BlueskyUserData, UserData} from "@/lib/utils/types-constants/user-data";
import {makeCustomException} from "@/lib/utils/custom-exception";
import {
    Post,
    PostEmbedExternal,
    PostEmbedImages, PostEmbedRecord, PostEmbedRecordWithMedia,
    PostFacetLink,
    PostFacetMention,
    PostFacetTag,
    TextPart
} from "@/lib/utils/types-constants/post";
import {updateMemory} from "@/lib/utils/redux/slices/memory";
import {getAgent} from "@/lib/utils/bsky/agent";
import {store} from "@/lib/utils/redux/store";
import {randomUuid} from "@/lib/utils/random";
import {stripFeedUri, stripPostUri} from "@/lib/utils/at_uri";
import {getTbdAuthors} from "@/lib/utils/bsky/users";

// Use the public search API to 'create' a feed
export const searchPosts = async (agent, searchTerm, cursor="") => {
    let urlParams:any = {
        q: searchTerm,
    };
    /*
    // Limit isn't working
    if (limit) {
        urlParams.count = limit;
    }*/
    if (cursor) {
        const offset = parseInt(cursor)
        if (!isNaN(offset)) {
            urlParams.offset = offset;
        }
    }

    const {cursor:newCursor, hits_total, posts} = await agent.api.app.bsky.feed.searchPosts(urlParams);


    return {data:{feed:posts, cursor}};
}



const processAuthorGetDid = (author, lastTs, authors) => {
    const {avatar, handle, displayName, did} = author;
    authors.set(did, {avatar, handle, displayName:displayName||handle, did, lastTs});
    return did;
}

const processTextToParts = (fullText, facets) => {
    if (!facets) {return [{text: fullText}];}
    facets.sort((a,b) => a.index.byteStart - b.index.byteStart); // not sure if it's needed if already sorted
    let byteFrom = 0;
    const byteFinish = fullText.length;
    const textParts:TextPart[] = [];

    const stringBuffer = Buffer.from(fullText, "utf-8")

    facets.forEach(facet => {
        const {index:{byteStart, byteEnd}, features} = facet;
        const {uri, tag, did, $type} = features[0]; // can't combine multiple features, so why is this an array

        if (byteFrom < byteStart) {
            const text = stringBuffer.subarray(byteFrom, byteStart).toString();
            textParts.push({text});
            byteFrom = byteEnd;
        }

        const text = stringBuffer.subarray(byteStart, byteEnd).toString();
        switch ($type) {
            case "app.bsky.richtext.facet#tag": {
                textParts.push({text, facet: {type:"Tag", tag:tag as string} as PostFacetTag});
                break;
            }
            case "app.bsky.richtext.facet#link": {
                textParts.push({text, facet: {type:"Link", uri:uri as string} as PostFacetLink});
                break;
            }

            case "app.bsky.richtext.facet#mention": {
                textParts.push({text, facet: {type:"Mention", did:did as string} as PostFacetMention});
                break;
            }
        }

        byteFrom = byteEnd;
    });

    if (byteFrom < byteFinish) {
        textParts.push({text: fullText.slice(byteFrom, byteFinish)});
    }

    return textParts;
}




const processPost = async (post, now, authors, authorsTbd) => {
    const processRecord = async (record) => {
        const {$type} = record;
        switch ($type) {
            case "app.bsky.embed.record#viewRecord": {
                // if external just get text, url, thumb, user and handle (avatar need to fetch!!)
                const {uri:_uri, author:{did:authorDid}, value:{text}, labels, indexedAt:_indexedAt, embeds} = record;
                const indexedAt = new Date(_indexedAt).getTime();
                authorsTbd.add(authorDid);
                const uri = stripPostUri(_uri);
                if (Array.isArray(embeds) && embeds.length > 0 && embeds[0]["$type"] !== "app.bsky.embed.record#view") {
                    return {record:{type:"Post", uri, authorDid, text, labels, indexedAt, embed: await processEmbed(embeds[0])}};
                } else {
                    return {record:{type:"Post", uri, authorDid, text, labels, indexedAt}};
                }
            }
            case "app.bsky.embed.record#viewNotFound": {
                return {record:{type:"Deleted"}};
            }
            case "app.bsky.embed.record#viewBlocked": {
                return {record:{type:"Blocked"}};
            }
            case "app.bsky.feed.defs#generatorView": {
                const {uri, avatar, description, displayName, likeCount} = record;
                return {record:{type:"Feed", uri, avatar:avatar??"", description:description??"", displayName:displayName??"", likeCount}};
            }
            case "app.bsky.graph.defs#listViewBasic": {
                const {uri,creator:{did:authorDid},name,purpose,description, descriptionFacets,avatar} = record;
                authorsTbd.add(authorDid);

                const textParts = processTextToParts(description, descriptionFacets);

                return {record:{type:"List", uri, authorDid, name:name??"", avatar:avatar??"",purpose:purpose??"", textParts}};
            }
            default: {
                throw new Error(`Unknown Post Type - ${$type}`);
            }
        }
    }

    const processMedia = async (media) => {
        const {$type, images, external} = media;
        switch ($type) {
            case "app.bsky.embed.images#view": {
                return {type:"Images", images:images.map(image => {
                        const {thumb, fullsize, alt} = image;
                        return {thumb, fullsize, alt};
                    })} as PostEmbedImages;
            }
            case "app.bsky.embed.external#view": {
                const {uri:_uri, title:_title, description:_description, thumb:_thumb} = external;
                const {url, title, description, image:thumb} = {url:_uri, title:_title, description:_description, image:_thumb};//await fetchMeta(_uri);
                return {type:"External", url, title:title??_title??"",
                    description:description??_description??"", thumb:thumb??_thumb??""} as PostEmbedExternal;
            }
        }
    }

    const processEmbed = async (embed) => {
        const {$type, images, external, record, media} = embed;
        switch ($type) {
            case "app.bsky.embed.images#view": {
                return {type:"Images", images:images.map(image => {
                        const {thumb, fullsize, alt} = image;
                        return {thumb, fullsize, alt};
                    })} as PostEmbedImages;
            }
            case "app.bsky.embed.external#view": {
                const {uri:_uri, title:_title, description:_description, thumb:_thumb} = external;
                const {url, title, description, image:thumb} = {url:_uri, title:_title, description:_description, image:_thumb};//await fetchMeta(_uri);
                return {type:"External", url, title:title??_title??"",
                    description:description??_description??"", thumb:thumb??_thumb??""} as PostEmbedExternal;
            }

            case "app.bsky.embed.record#view": {
                return {type:"Record",
                        ...await processRecord(record)} as PostEmbedRecord;
            }

            case "app.bsky.embed.recordWithMedia#view": {
                return {type:"RecordWithMedia",
                    ...await processRecord(record.record), media:await processMedia(media)};
            }

            default: {
                return processMedia(embed);
            }
        }
    }

    const {uri:_uri, cid, author, record, embed, replyCount, repostCount, likeCount, labels, indexedAt:_indexedAt} = post;
    const indexedAt = new Date(_indexedAt).getTime();
    const authorDid = processAuthorGetDid(author, now, authors);
    const {text, langs, tags, facets} = record;
    const textParts = processTextToParts(text, facets);
    const uri = stripPostUri(_uri);

    let postObj:Post = {
        uri, cid, textParts, authorDid, text,
        labels: labels? labels.map(x => x.val) : [],
        tags: tags?? [], langs: langs ?? [],
        indexedAt,
        lastTs: now, replyCount, repostCount, likeCount
    };

    if (embed) {
        postObj.embed = await processEmbed(embed);
    }

    return postObj;
}

export const processFeed = async (authors, authorsTbd, feed) => {
    let uris = [];
    let posts = new Map<string, Post>();

    const now = new Date().getTime();
    for (const x of feed) {
        let postObj = await processPost(x.post, now, authors, authorsTbd);
        const uri = postObj.uri;
        if (uris.indexOf(uri) >= 0) {
            console.log("DUPLICATE!", uri);
            continue;
        }
        uris.push(uri);
        const {reply, reason} = x;
        if (reply) {
            const {root, parent} = reply; // ignore root
            postObj.replyTo = processAuthorGetDid(parent.author, now, authors);
            postObj.parentUri = stripPostUri(parent.uri);
        }

        if (reason && reason.by && reason["$type"] === "app.bsky.feed.defs#reasonRepost") {
            const {by} = reason;
            postObj.reposterDid = processAuthorGetDid(by, now, authors);
        }
        posts.set(uri, postObj);
    }

    // console.log(JSON.stringify(values, null, 2));
    console.log(uris);
    return {uris, posts}
}




// User clicks on a thread, display it
export const processThread = async (authorsTbd, authors, thread) => {
    const now = new Date().getTime();
    const inner = async (thread, replyTo = "", parentUri="") => {
        const {post, parent, replies} = thread;
        const currentPost = await processPost(post, now, authors, authorsTbd);

        let result = [];
        if (parent) {
            (await inner(parent)).forEach((x, i,arr) => {
                if (i === arr.length - 1) {
                    parentUri = x.uri;
                    replyTo = x.authorDid;
                }
                result.push(x);
            });
        }

        currentPost.replyTo = replyTo;
        currentPost.parentUri = parentUri;
        result.push(currentPost);
        if (replies) {
           // replies.sort((x, y) => {return y.post.indexedAt - x.post.indexedAt}); // sort by reply time
            for (const reply of replies) {
                (await inner(reply, currentPost.authorDid, currentPost.uri)).forEach(x => {
                    result.push(x);
                });
            }
        }

        return result;
    }
    const posts = await inner(thread);

    console.log("POSTS", posts);

    const mainUri = stripPostUri(thread.post.uri);
    return {posts, mainUri};
}


export const getPostThread = async (did, columnId, uri) => {
    let state = store.getState();
    const parent = state.memory.columns[columnId].mode;
    const userObj = state.profiles.accountDict[did];
    if (!userObj) {return false;}
    const userData = state.memory.userData;

    const loadingId = randomUuid();
    let memoryCommand:any = {};
    memoryCommand[`columns.${columnId}.mode`] = {
        id: loadingId,
        mode: "loading",
        header: "Thread",
        parent,
    };
    store.dispatch(updateMemory(memoryCommand));

    let agent = await getAgent(userObj, state.config.basicKey);
    if (!agent) {
        memoryCommand[`columns.${columnId}.mode`] = parent;
        store.dispatch(updateMemory(memoryCommand));
        return;
    }

    let authors = new Map<string, BlueskyUserData>();
    let authorsTbd = new Set<string>();
    let posts, mainUri;
    try {
        const {data: {thread}} = await agent.getPostThread({uri: `at://${uri.replace("/post/", "/app.bsky.feed.post/")}`});
        console.log(JSON.stringify(thread, null, 2));

        const {posts:_posts, mainUri:_mainUri} = await processThread(authorsTbd, authors, thread);
        posts = _posts;
        mainUri = _mainUri;
    } catch (e) {
        if (e.status === 400 && e.error === "NotFound") {
            memoryCommand[`columns.${columnId}.mode`] = parent;
            store.dispatch(updateMemory(memoryCommand));
            return;
        }

        console.log("status", e.status);
        console.log("error", e.error);
        console.log(e);

        return;
    }

    // Check if parent is still the same
    state = store.getState(); // Get latest state
    if (!state.memory.columns[columnId]) {
        memoryCommand[`columns.${columnId}.mode`] = parent;
        store.dispatch(updateMemory(memoryCommand));
        console.log("column deleted");
        return;
    }
    const newMode = state.memory.columns[columnId].mode;
    if (!newMode || newMode.id !== loadingId) {
        console.log("load messages cancelled");
        memoryCommand[`columns.${columnId}.mode`] = parent;
        store.dispatch(updateMemory(memoryCommand));
        return; // Action was cancelled
    }

    memoryCommand = {};
    for (let [key, value] of authors.entries()) {
        memoryCommand[`userData.${key}`] = value;
    }

    memoryCommand[`columns.${columnId}.mode`] = {
        id: randomUuid(),
        mode:"thread",
        parent,
        posts,
        mainUri,
        viewer: did
    };

    /*
    // Cache thread pulled posts? Probably not necessary
    posts.forEach(x => {
        memoryCommand[`posts.${x.uri}`] = x;
    });
     */

    store.dispatch(updateMemory(memoryCommand));

    // Refresh author info
    const lastTs = new Date().getTime();
    await getTbdAuthors(agent, authorsTbd, authors, lastTs, userData);
    memoryCommand = {};
    for (let [key, value] of authors.entries()) {
        memoryCommand[`userData.${key}`] = value;
    }
    store.dispatch(updateMemory(memoryCommand));
}
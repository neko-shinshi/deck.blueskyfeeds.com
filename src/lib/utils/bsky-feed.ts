import {UserData} from "@/lib/utils/types-constants/user-data";
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
import {logOut} from "@/lib/utils/redux/slices/accounts";
import {showAlert, updateMemory} from "@/lib/utils/redux/slices/memory";
import {getAgent} from "@/lib/utils/bsky";
import {store} from "@/lib/utils/redux/store";

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
    let url = `https://search.bsky.social/search/posts?${new URLSearchParams(urlParams)}`;
    const res = await fetch(url);
    if (res.status === 200) {
        const json = await res.json();
        const uris = json.map(x => `at://${x.user.did}/${x.tid}`);
        const MAX_QUERY = 25;
        let didsToSearch:any = new Set();
        let postObjects = [];
        for (let i = 0; i < uris.length; i += MAX_QUERY) {
            const chunk = uris.slice(i, i + MAX_QUERY);
            try {
                const {data: {posts}} = await agent.getPosts({uris:chunk});
                posts.forEach(x => {
                    const parentUser = x.record.reply?.parent?.uri;
                    if (parentUser) {
                        didsToSearch.add(parentUser.split("/")[2]);
                    }
                    postObjects.push(x);
                });
            } catch (e) {
                if (e.status === 429) {
                    throw makeCustomException("Rate Limited", 429);
                }
                console.log(e);
            }
        }

        didsToSearch = [...didsToSearch];
        let authorMap = new Map();
        for (let i = 0; i < didsToSearch.length; i += MAX_QUERY) {
            const chunk = didsToSearch.slice(i, i + MAX_QUERY);
            try {
                const {data:{profiles}} = await agent.getProfiles({actors:chunk});
                profiles.forEach(x => {
                    const {did, handle, avatar, displayName} = x;
                    authorMap.set(did, {did, handle, avatar, displayName});
                });
            } catch (e) {
                if (e.status === 429) {
                    throw makeCustomException("Rate Limited", 429);
                }
                console.log(e);
            }
        }

        const feed = postObjects.reduce((acc, x) => {
            const authorId = x.author.did;
            if (authorId && authorMap.get(authorId)) {
                const author = authorMap.get(authorId);
                acc.push({post: x, reply:{parent: {author}}});
            } else {
                acc.push({post: x});
            }
            return acc;
        }, []);
        return {data:{feed, cursor:`${feed.length + urlParams.offset??0}`}};
    }
    return {data:{feed:[], cursor:""}};
}

const USER_REFRESH_BUFFER = 20 * 1000;
// Fetch authors not updated by the latest query
export const getTbdAuthors = async (agent, authorsTbd, authors, lastTs, userData) => {
    if (authorsTbd.size === 0) {return;}
    Object.keys(authors).forEach(did => authorsTbd.delete(did));
    if (authorsTbd.size === 0) {return;}
    [...authorsTbd].forEach(did => {
        // Already refreshed recently, then skip
        if (userData[did] && userData[did].lastTs + USER_REFRESH_BUFFER > lastTs) {
            authorsTbd.delete(did);
        }
    });
    if (authorsTbd.size === 0) {return;}

    const MAX_QUERY = 25;
    let searchAuthorsArray = [...authorsTbd];
    for (let i = 0; i < searchAuthorsArray.length; i += MAX_QUERY) {
        const chunk = searchAuthorsArray.slice(i, i + MAX_QUERY);
        try {
            const {data:{profiles}} = await agent.getProfiles({actors:chunk});
            profiles.forEach(x => {
                const {did, handle, avatar, displayName} = x;
                authors.set(did, {avatar, handle, displayName, did, lastTs});
            });
        } catch (e) {
            if (e.status === 429) {
                throw makeCustomException("Rate Limited", 429);
            }
            console.log(e);
        }
    }
}

const processAuthorGetDid = (author, lastTs, authors) => {
    const {avatar, handle, displayName, did} = author;
    authors.set(did, {avatar, handle, displayName, did, lastTs});
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
    //"app.bsky.embed.record#viewRecord"
    const processViewRecord = async (record) => {
        // if external just get text, url, thumb, user and handle (avatar need to fetch!!)
        const {uri:_uri, author:{did:authorDid}, value:{text}, labels, indexedAt:_indexedAt, embeds} = record;
        const indexedAt = new Date(_indexedAt).getTime();
        authorsTbd.add(authorDid);
        const uri = _uri.slice(5).replaceAll("/app.bsky.feed.post/", "/post/");
        if (Array.isArray(embeds) && embeds.length > 0 && embeds[0]["$type"] !== "app.bsky.embed.record#view") {
            return {record:{uri, authorDid, text, labels, indexedAt, embed: await processEmbed(embeds[0])}};
        } else {
            return {record:{uri, authorDid, text, labels, indexedAt}};
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
        const {$type, images, external, record, media}  = embed;
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
                    ...await processViewRecord(record)} as PostEmbedRecord;
            }

            case "app.bsky.embed.recordWithMedia#view": {
                return {type:"RecordWithMedia",
                    ...await processViewRecord(record.record), media:await processMedia(media)};
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
    const uri = _uri.slice(5).replaceAll("/app.bsky.feed.post/", "/post/");

    let postObj:any = {
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

export const processFeed = async (agent, authors, authorsTbd, feed) => {
    let uris = [];
    let posts = new Map<string, Post>();

    const now = new Date().getTime();
    for (const x of feed) {
        let postObj = await processPost(x.post, now, authors, authorsTbd);
        const uri = postObj.uri;
        uris.push(uri);
        const {reply, reason} = x;
        if (reply) {
            const {root, parent} = reply; // ignore root
            postObj.replyTo = processAuthorGetDid(parent.author, now, authors);
        }

        if (reason && reason.by && reason["$type"] === "app.bsky.feed.defs#reasonRepost") {
            const {by} = reason;
            postObj.reposterDid =  processAuthorGetDid(by, now, authors);
        }
        posts.set(uri, postObj);
    }

    // console.log(JSON.stringify(values, null, 2));
    console.log(uris);
    return {uris, posts}
}




// User clicks on a thread, display it
export const processThread = async (agent, authorsTbd, authors, thread) => {
    const now = new Date().getTime();


    const inner = async (thread) => {
        const {post, parent, replies} = thread;
        let result = [];
        if (parent) {
            (await inner(parent)).forEach(x => {
                result.push(x);
            });
        }
        result.push(await processPost(post, now, authors, authorsTbd));
        if (replies) {
            replies.sort((x, y) => {return y.post.indexedAt - x.post.indexedAt}); // sort by reply time
            for (const reply of replies) {
                result.push(...await inner(reply));
            }
        }


        return result;
    }
    const posts = await inner(thread);

    console.log("POSTS", posts);

    const mainUri = thread.post.uri.slice(5).replaceAll("/app.bsky.feed.post/", "/post/");
    return {posts, mainUri};
}


export const getPostThread = async (did, columnId, uri) => {
    const state = await store.getState();
    const parent = state.memory.columns[columnId].mode;
    const userObj = state.accounts.dict[did];
    if (!userObj) {return false;}
    let agent = await getAgent(userObj, state.config.basicKey, store.dispatch);
    if (!agent) {return false;}

    const {data:{thread}} = await agent.getPostThread({uri:`at://${uri.replace("/post/", "/app.bsky.feed.post/")}`});

    let authors = new Map<string, UserData>();
    let authorsTbd = new Set<string>();


    const {posts, mainUri} = await processThread(agent, authorsTbd, authors, thread);
    const lastTs = new Date().getTime();
    await getTbdAuthors(agent, authorsTbd, authors, lastTs, state.accounts.userData);

    let memoryCommand:any = {};
    for (let [key, value] of authors.entries()) {
        memoryCommand[`userData.${key}`] = value;
    }


    memoryCommand[`columns.${columnId}.mode`] = {
        mode:"thread",
        parent,
        posts,
        mainUri
    };

    store.dispatch(updateMemory(memoryCommand));
}
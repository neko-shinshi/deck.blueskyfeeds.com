import {createSlice} from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {
    AccountData,
    AccountStateType,
    AccountType,
    BlueskyAccount, MastodonAccount,
    UserData
} from "@/lib/utils/types-constants/user-data";
import {ColumnMode, ColumnPosts} from "@/lib/utils/types-constants/column";
import {Feed} from "@/lib/utils/types-constants/feed";
import {setPathOfObject} from "@/lib/utils/object";


export type MemoryState = {
    columnMode:{[id:string]: ColumnMode}
    columnPosts:{[id:string]: ColumnPosts}
    columnPostsNext:{[id:string]: ColumnPosts}
    posts: {[uri:string]: Post}
    feeds:{[uri:string]: Feed}
    accountData:{[id:string]: AccountData}
}

// Memory Slice is synced, but not persisted
const initialState:MemoryState = {posts:{}, feeds:{}, columnMode:{}, columnPosts:{}, columnPostsNext:{}, accountData:{}};

const slice = createSlice({
    name:"memory",
    initialState,
    reducers:{
        // columnMode
        updateColumnMode:(memory, action) => {
            const {colId, mode} = action.payload;
            memory.columnMode[colId] = mode;
        },
        // columnPosts
        updateColumnPosts:(memory, action) => {

        },

        // columnPostsNext
        // posts
        updatePosts:(memory, action) => {
            const {posts} = action.payload;
            (posts as Post[]).forEach(post => {
                const existing = memory.posts[post.uri];
                if (existing) {
                    if (existing.lastTs > post.lastTs) {
                        // Don't override
                        return;
                    }
                    // copy these to new post
                    memory.posts[post.uri] = post;
                    existing.myLikes.forEach(x => memory.posts[post.uri].myLikes.push(x));
                    existing.myReposts.forEach(x => memory.posts[post.uri].myReposts.push(x));
                } else {
                    memory.posts[post.uri] = post;
                }
            });
        },
        // feeds
        updateFeeds:(memory, action) => {
            const {feeds} = action.payload;
            (feeds as Feed[]).forEach(feed => {
                const {uri, indexedAt} = feed;
                if (!memory.feeds[uri] || memory.feeds[uri].indexedAt < indexedAt)  {
                    memory.feeds[uri] = feed;
                }
            });
        },
        // accountData
        setAccount:(memory, action) => {
            const {type, id, state, lastTs} = action.payload;
            switch (type) {
                case AccountType.BLUESKY: {
                    const {service, usernameOrEmail, password, refreshJwt, accessJwt} = action.payload;
                    let user:BlueskyAccount;
                    user = {service, usernameOrEmail, password, id, refreshJwt, accessJwt, type, state, lastTs};
                    memory.accountData[id] = user;
                    break;
                }
                case AccountType.MASTODON: {
                    const {token} = action.payload;
                    let user:MastodonAccount;
                    user = {id, state, token, type, lastTs};
                    memory.accountData[id] = user;
                    break;
                }
            }
        },


        // memory
        setMemory: (memory, action) => {
            const keys = ["columnMode", "columnPosts", "columnPostsNext", "posts", "feeds", "accountData"];
            for (const [key, value] of Object.entries(action.payload)) {
                if (keys.includes(key)) {
                    for (const [k, v] of Object.entries(value)) {
                        if (memory[key][k].lastTs < v.lastTs) {
                            memory[key][k] = v;
                        }
                    }
                }
            }
        },

        updateMemory: (memory, action) => {
            for (const [path, value] of Object.entries(action.payload)) {
                if (path !== "__terminate") {
                    setPathOfObject(memory, path, value);
                }
            }
        },

        resetMemory: (memory, action) => {
            for (const [key, value] of Object.entries(initialState)) {
                memory[key] = value;
            }
        },


    }
});

export const {
    setAccount,
    setMemory,
    resetMemory,
    updateMemory,
    updateFeeds,
    updatePosts,
    updateColumnMode
} = slice.actions;
export default slice.reducer;
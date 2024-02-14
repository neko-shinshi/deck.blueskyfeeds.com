import {createSlice} from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {
    AccountData,
    AccountStateType,
    AccountType,
    BlueskyAccount,
    UserData
} from "@/lib/utils/types-constants/user-data";
import {ColumnMode} from "@/lib/utils/types-constants/column";
import {Feed} from "@/lib/utils/types-constants/feed";


export type MemoryState = {
    columnMode:{[id:string]: ColumnMode}
    columnPosts:{[id:string]:{uris:string[], cursor:string, lastTs:number}}
    columnPostsNext:{[id:string]:{uris:string[], cursor:string, lastTs:number}}
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
        // columnPosts
        // columnPostsNext
        // posts

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
            const {service, usernameOrEmail, password, id, refreshJwt, accessJwt, type, state} = action.payload;
            switch (type) {
                case AccountType.BLUESKY: {
                    const user:BlueskyAccount = {service, usernameOrEmail, password, id, refreshJwt, accessJwt, type, state};
                    memory.accountData[id] = user;
                    break;
                }
                case AccountType.MASTODON: {
                    break;
                }
            }
        },




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
        updateColumnPosts:(memory, action) => {

        },

        updateColumnMode:(memory, action) => {
            const {colId, mode} = action.payload;
            memory.columnMode[colId] = mode;
        },

        resetMemory: state => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        },

        logOut: (state, action) => {
            const {id} = action.payload;
            const user = state.accountData[id];
            if (user) {
               // user.active = false;
                switch (user.type) {
                    case AccountType.BLUESKY: {
                        user.password = "";
                        user.refreshJwt = "";
                        user.accessJwt = "";
                        break;
                    }
                    case AccountType.MASTODON: {
                        user.token = "";
                        break;
                    }
                }
            }
        },
    }
});

export const {
    setAccount,
    resetMemory,
    updateFeeds,
    updatePosts,
    updateColumnMode
} = slice.actions;
export default slice.reducer;
import { createSlice } from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {setPathOfObject} from "@/lib/utils/object";
import {BlueskyUserData, UserData} from "@/lib/utils/types-constants/user-data";
import {ColumnMode} from "@/lib/utils/types-constants/column";
import {Feed} from "@/lib/utils/types-constants/feed";



export interface MemoryState {
    columns: {
        [id:string]: {
            postUris: {
                current: {
                    uris:string[]
                    cursor:string
                }
                pending: {
                    uris:string[]
                    cursor:string
                }
            }
            lastTs:number
            mode?:ColumnMode
        }
    } // load more resets to the top
    posts: {[uri:string]: Post} // Saved post info
    feeds:{[uri:string]: Feed} // feed uris are volatile... :(
    userData:{[id:string]: UserData} // Saved other users info
    currentPage:string
}

// Don't persist, start from scratch when first connected if main, otherwise recover from last point
// lastTs is to make sure old fetch or collision does not spoil data
const initialState:MemoryState = {posts:{}, columns:{}, userData:{}, feeds:{}, currentPage:""};

const slice = createSlice({
    name:"memory",
    initialState,
    reducers:{
        startApp: (state, action) => {
            const {pageId} = action.payload;
            state.currentPage = pageId;
        },
        initializeColumn: (memory, action) => {
            const {ids} = action.payload;
            if (Array.isArray(ids)) {
                ids.forEach(id => {
                    memory.columns[id] = {
                        postUris:{
                            current:{
                                uris:[],
                                cursor:""
                            },
                            pending:{
                                uris:[],
                                cursor:""
                            }
                        },
                        lastTs: 0
                    }
                })
            }
        },

        updateFeeds:(memory, action) => {
            const {feeds} = action.payload;
            (feeds as Feed[]).forEach(feed => {
                const {uri, indexedAt} = feed;
                if (!memory.feeds[uri] || memory.feeds[uri].indexedAt < indexedAt)  {
                    memory.feeds[uri] = feed;
                }
            });
        },


        updateMemory: (memory, action) => {
            for (const [path, value] of Object.entries(action.payload)) {
                if (path !== "__terminate") {
                    setPathOfObject(memory, path, value);
                }
            }
        },
        resetMemory: state => {
            for (const [key, value] of Object.entries(initialState)) {
                state[key] = value;
            }
        }
    }
});

export const {startApp, initializeColumn, updateMemory, resetMemory, updateFeeds} = slice.actions
export default slice.reducer
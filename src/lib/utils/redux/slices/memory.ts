import { createSlice } from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {setPathOfObject} from "@/lib/utils/object";
import {Account} from "@/lib/utils/types-constants/account";
import {ColumnMode} from "@/lib/utils/types-constants/column";


export interface MemoryState {
    mode:"start"|"main"
    columns: {[id:string]: {postUris:string[], lastTs:number, mode?:ColumnMode, cursor:string}} // load more resets to the top

    firehose:{cursor: string, lastTs: number} // firehose reference

    posts: {[uri:string]: Post} // Saved post info
    accounts:{[did:string]: Account} // SAVED ACCOUNT INFO
}

// don't persist this, start from scratch when first connected if main, recover from last point
// lastTs is to make sure old fetch or collision does not spoil data
const initialState:MemoryState = {posts:{}, columns:{}, firehose:{cursor:"", lastTs: 0}, mode:"start", accounts:{}};

const slice = createSlice({
    name:"memory",
    initialState,
    reducers:{
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

export const {updateMemory, resetMemory} = slice.actions
export default slice.reducer
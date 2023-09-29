import { createSlice } from '@reduxjs/toolkit'
import {Post} from "@/lib/utils/types-constants/post";
import {setPathOfObject} from "@/lib/utils/object";

interface ColumnStatus {
    type:"root"|"config"|"thread"
}
interface ColumnThread extends ColumnStatus {
    type: "thread"
    uri: string
}

export interface MemoryState {
    columns: {[id:string]: {postUris:string[], lastTs:number, status:ColumnStatus}}
    posts: {[uri:string]: Post}
    firehose:{cursor: string, lastTs: number}
}

// don't persist this, start from scratch when first connected if main, recover from last point
// lastTs is to make sure old fetch or collision does not spoil data
const initialState:MemoryState = {posts:{}, columns:{}, firehose:{cursor:"", lastTs: 0}};

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
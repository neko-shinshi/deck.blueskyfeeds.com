import { createSlice } from '@reduxjs/toolkit'

const initialState = {val:0};

const slice = createSlice({
    name:"tests",
    initialState,
    reducers:{
        increment: (count, action) => {
            const {inc} = action.payload;
            count.val += inc;
        },
    }
});

export const {increment} = slice.actions
export default slice.reducer
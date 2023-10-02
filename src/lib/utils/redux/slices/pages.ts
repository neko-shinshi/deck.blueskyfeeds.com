import { createSlice } from '@reduxjs/toolkit'
import {randomUuid} from "@/lib/utils/random";
import {ColumnConfig, ColumnFeed, ColumnType, PageOfColumns} from "@/lib/utils/types-constants/column";


export const makeInitialState = () => {
    const id = randomUuid();
    const defaultPage:PageOfColumns = {
        name: "My First Page",
        columns: [],
        maskCw: true,
        hideCw: false,
        cwLabels: [] // Default show everything
    }
    let dict = {};
    dict[id] = defaultPage;

    return {order: [id], dict}
}

const initialState:{order:string[], dict:{[id:string]: PageOfColumns}} = makeInitialState();

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        addColumn: (pages, action) => {
            const {pageId, column} = action.payload;
            const {id, type} = column as ColumnConfig;
            switch (ColumnType[type as keyof typeof ColumnType]) {
                case ColumnType.HOME: {

                    break;
                }
                case ColumnType.FEED: {
                    const data = column as ColumnFeed;
                    break;
                }
                case ColumnType.NOTIFS: {
                    break;
                }
                case ColumnType.USERS: {
                    break;
                }
                case ColumnType.FIREHOSE: {
                    break;
                }
            }
        },
        removeColumn: (pages, action) => {
            const { columnId} = action.payload;
        },
        resetPages: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },
    }
});

export const {addColumn, resetPages} = slice.actions
export default slice.reducer
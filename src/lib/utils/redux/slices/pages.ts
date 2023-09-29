import { createSlice } from '@reduxjs/toolkit'
import {randomUuid} from "@/lib/utils/random";
import {ColumnFeed, ColumnType, PageColumn} from "@/lib/utils/types-constants/column";


const makeInitialState = () => {
    const id = randomUuid();
    const defaultPage:PageColumn = {
        name: "My First Page",
        columns: [],
        maskCw: true,
        hideCw: false,
        cwLabels: [] // Default show everything
    }

    return {
        order: [id],
        dict: {id: defaultPage}
    }
}

const initialState:{order:string[], dict:{[id:string]: PageColumn}} = makeInitialState();

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        addColumn: (pages, action) => {
            const {pageId, columnId, ...data} = action.payload;
            switch (ColumnType[data.type as keyof typeof ColumnType]) {
                case ColumnType.HOME: {

                    break;
                }
                case ColumnType.FEED: {
                    const columnData = data as ColumnFeed;
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
        resetPages: state => {
            for (const [key, value] of Object.entries(makeInitialState())) {
                state[key] = value;
            }
        }
    }
});

export const {addColumn, resetPages} = slice.actions
export default slice.reducer
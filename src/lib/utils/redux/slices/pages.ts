import { createSlice } from '@reduxjs/toolkit'
import {randomUuid} from "@/lib/utils/random";
import {
    ColumnConfig,
    ColumnFeed,
    ColumnFirehose, ColumnHome, ColumnNotifications,
    ColumnType,
    InColumn, InHome,
    PageOfColumns
} from "@/lib/utils/types-constants/column";
import {ALL_NOTIFICATION_TYPES} from "@/lib/utils/types-constants/notification";
import {setPathOfObject} from "@/lib/utils/object";


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

    return {
        pages:{order: [id], dict},
        columnDict:{}
    }
}

const initialState:{
    pages: {order:string[], dict:{[id:string]: PageOfColumns}},
    columnDict: {[id:string]: ColumnConfig},
} = makeInitialState();

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        addColumn: (state, action) => {
            const {pageId, config, defaults} = action.payload;
            const {id, type} = config as InColumn;

            let newColumn: ColumnConfig;
            switch (type) {
                case ColumnType.HOME: {
                    const {observer} = config as InHome;
                    const column:ColumnHome = {
                        name: "Home",
                        id, type,
                        observer,
                        active: true,
                        columns: 1,
                        refreshMs: defaults.refreshMs,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth,
                        icon:""
                    }
                    newColumn = column;
                    break;
                }
                case ColumnType.NOTIFS: {
                    const column:ColumnNotifications = {
                        name: "Notifications",
                        id, type,
                        allowedTypes: ALL_NOTIFICATION_TYPES,
                        hideUsers: [],
                        active: true,
                        columns: 1,
                        refreshMs: defaults.refreshMs,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth,
                        icon:""
                    }
                    newColumn = column;
                    break;
                }
                case ColumnType.FEED: {
                    break;
                }
                case ColumnType.USERS: {
                    break;
                }
                case ColumnType.FIREHOSE: {
                    const column: ColumnFirehose = {
                        name: "Firehose",
                        id, type,
                        active: true,
                        icon: "",
                        keywords: [],
                        showReplies: false,
                        users: [],
                        columns: 1,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth
                    }
                    newColumn = column;
                    break;
                }
            }
            state.pages.dict[pageId].columns.push(id);
            state.columnDict[id] = newColumn;
        },
        setPageOrder: (state, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(state.pages.dict);
            order = order.filter(did => existingIds.indexOf(did) >= 0); // only keep dids that are currently saved
            state.pages.order = order;

            // remove pages that are not in input order list
            existingIds.filter(did => order.indexOf(did) < 0).forEach(did => {
                delete state.pages.dict[did];
            });
        },
        setColumnOrder: (state, action) => {
            let {order, pageId} = action.payload;

            const existingIds = Object.keys(state.columnDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.pages.dict[pageId].columns = order;
        },
        updateColumn: (state, action) => {
            let {columnId, columnUpdate} = action.payload;
            //state.columnDict[columnId];

        },
        removeColumn: (state, action) => {
            const { columnId} = action.payload;
        },
        resetPages: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },
    }
});

export const {addColumn, setColumnOrder, resetPages} = slice.actions
export default slice.reducer
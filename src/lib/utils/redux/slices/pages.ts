import {createSlice} from '@reduxjs/toolkit'
import {randomUuid} from "@/lib/utils/random";
import {
    ColumnConfig,
    ColumnFeed,
    ColumnHome,
    ColumnNotifications,
    ColumnType,
    InColumn, InColumnFeed,
    InHome,
    PageOfColumns
} from "@/lib/utils/types-constants/column";
import {ALL_NOTIFICATION_TYPES} from "@/lib/utils/types-constants/notification";


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
            const {pageId, config, defaults, name} = action.payload;
            const {id, type} = config as InColumn;

            let newColumn: ColumnConfig;
            switch (type) {
                case ColumnType.HOME: {
                    const {observer} = config as InHome;
                    newColumn = {
                        name,
                        id, type,
                        observer,
                        active: true,
                        refreshMs: defaults.refreshMs,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth,
                        icon:""
                    } as ColumnHome;
                    break;
                }
                case ColumnType.NOTIFS: {
                    newColumn = {
                        name,
                        id, type,
                        allowedTypes: ALL_NOTIFICATION_TYPES,
                        hideUsers: [],
                        active: true,
                        refreshMs: defaults.refreshMs,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth,
                        icon:""
                    } as ColumnNotifications;
                    break;
                }
                case ColumnType.FEED: {
                    const {observer, uri, icon} = config as InColumnFeed;
                    newColumn = {
                        name,
                        id, type,
                        observer,
                        uri,
                        active: true,
                        refreshMs: defaults.refreshMs,
                        thumbnailSize: defaults.thumbnailSize,
                        width: defaults.columnWidth,
                        icon
                    } as ColumnFeed;
                    break;
                }
                case ColumnType.USERS: {
                    break;
                }
            }
            state.pages.dict[pageId].columns.push(id);
            state.columnDict[id] = newColumn;
        },
        setPageOrder: (state, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(state.pages.dict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.pages.order = order;

            // remove pages that are not in input order list
            existingIds.filter(id => order.indexOf(id) < 0).forEach(id => {
                delete state.pages.dict[id];
            });
        },
        setColumnOrder: (state, action) => {
            let {order, pageId} = action.payload;

            const existingIds = Object.keys(state.columnDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.pages.dict[pageId].columns = order;
        },
        updateColumn: (state, action) => {
            let {columnId, key, val} = action.payload;
            state.columnDict[columnId][key] = val;
        },
        removeColumn: (state, action) => {
            const {columnId} = action.payload;
            state.pages.order = state.pages.order.filter(x => x !== columnId);
            delete state.columnDict[columnId];
        },
        resetPages: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },
    }
});

export const {addColumn, setColumnOrder, updateColumn, removeColumn, resetPages} = slice.actions
export default slice.reducer
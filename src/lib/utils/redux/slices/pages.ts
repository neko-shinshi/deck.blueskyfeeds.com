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

export interface PagesState {
    pageOrder:string[],
    pageDict:{[id:string]: PageOfColumns}
    columnDict: {[id:string]: ColumnConfig},
}

export const makeInitialState = ():PagesState => {
    const id = randomUuid();
    const defaultPage:PageOfColumns = {
        name: "My Main Profile",
        columns: [],
        maskCw: true,
        hideCw: false,
        cwLabels: [], // Default show everything
        icon: ""
    }
    let dict = {};
    dict[id] = defaultPage;

    return {
        pageOrder: [id],
        pageDict: dict,
        columnDict:{}
    }
}

const initialState:PagesState = makeInitialState();

const slice = createSlice({
    name:"pages",
    initialState,
    reducers:{
        updatePageConfig: (state, action) => {
            const {update, pageId} = action.payload;
            const page = state.pageDict[pageId];
            if (page) {
                for (const [key, value] of Object.entries(update)) {
                    page[key] = value;
                }
            }
        },
        addColumn: (state, action) => {
            const {pageId, config, defaults:{refreshMs, thumbnailSize, columnWidth}} = action.payload;
            const {id, type, observers, icon, name} = config as InColumn;

            let newColumn: ColumnConfig;
            switch (type) {
                case ColumnType.HOME: {
                    newColumn = {
                        name, id, type, observers, icon,
                        active: true,
                        refreshMs, thumbnailSize, width:columnWidth
                    } as ColumnHome;
                    break;
                }
                case ColumnType.NOTIFS: {
                    newColumn = {
                        name, id, type, observers, icon,
                        active: true,
                        allowedTypes: ALL_NOTIFICATION_TYPES,
                        hideUsers: [],
                        refreshMs, thumbnailSize, width:columnWidth

                    } as ColumnNotifications;
                    break;
                }
                case ColumnType.FEED: {
                    const {uri} = config as InColumnFeed;
                    newColumn = {
                        name, id, type, observers, icon,
                        active: true,
                        uri,
                        refreshMs, thumbnailSize, width:columnWidth
                    } as ColumnFeed;
                    break;
                }
                case ColumnType.USERS: {
                    break;
                }
            }
            state.pageDict[pageId].columns.push(id);
            state.columnDict[id] = newColumn;
        },
        setPageOrder: (state, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(state.pageDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.pageOrder = order;

            // remove pages that are not in input order list
            existingIds.filter(id => order.indexOf(id) < 0).forEach(id => {
                delete state.pageDict[id];
            });
        },
        setColumnOrder: (state, action) => {
            let {order, pageId} = action.payload;

            const existingIds = Object.keys(state.columnDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.pageDict[pageId].columns = order;
        },
        updateColumn: (state, action) => {
            let {columnId, key, val} = action.payload;
            state.columnDict[columnId][key] = val;
        },
        removeColumn: (state, action) => {
            const {columnId} = action.payload;
            state.pageOrder = state.pageOrder.filter(x => x !== columnId);
            delete state.columnDict[columnId];
        },
        resetPages: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },
    }
});

export const {updatePageConfig, addColumn, setColumnOrder, updateColumn, removeColumn, resetPages} = slice.actions
export default slice.reducer
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
    ProfileColumns
} from "@/lib/utils/types-constants/column";
import {ALL_NOTIFICATION_TYPES} from "@/lib/utils/types-constants/notification";
import {BlueskyAccount, MastodonAccount} from "@/lib/utils/types-constants/user-data";

export interface ProfileState {
    profileOrder:string[],
    profileDict:{[id:string]: ProfileColumns}
    columnDict: {[id:string]: ColumnConfig},
    accountDict: { [id: string]: BlueskyAccount | MastodonAccount }
}

export const makeInitialState = ():ProfileState => {
    const id = randomUuid();
    const defaultProfile:ProfileColumns = {
        name: "My Main Profile",
        accountIds: [],
        columnIds: [],
        maskCw: true,
        hideCw: false,
        cwLabels: [], // Default show everything
        icon: ""
    }
    let dict = {};
    dict[id] = defaultProfile;

    return {
        profileOrder: [id],
        profileDict: dict,
        columnDict:{},
        accountDict:{}
    }
}

const initialState:ProfileState = makeInitialState();

const slice = createSlice({
    name:"profiles",
    initialState,
    reducers:{
        addOrUpdateAccount: (users, action) => {
            const {service, usernameOrEmail, encryptedPassword, id, displayName, avatar, handle, refreshJwt, accessJwt,
                lastTs} = action.payload;

            const user:BlueskyAccount = {
                type:"b",
                service, usernameOrEmail, encryptedPassword,
                refreshJwt, accessJwt, avatar,
                handle, id, displayName, active:true, lastTs
            };

            users.accountDict[id] = user;
        },
        removeAccount: (users, action) => {
            const {id} = action.payload;
            delete users.accountDict[id];
        },
        logOut: (users, action) => {
            const {id} = action.payload;
            const user = users.accountDict[id];
            if (user) {
                user.active = false;
                switch (user.type) {
                    case "b": {
                        user.encryptedPassword = "";
                        user.refreshJwt = "";
                        user.accessJwt = "";
                        break;
                    }
                    case "m": {
                        user.token = "";
                        break;
                    }
                }
            }
        },

        resetAccounts: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },

        updateProfileConfig: (state, action) => {
            const {update, profileId} = action.payload;
            const page = state.profileDict[profileId];
            if (page) {
                for (const [key, value] of Object.entries(update)) {
                    page[key] = value;
                }
            }
        },
        addColumn: (state, action) => {
            const {profileId, config, defaults:{refreshMs, thumbnailSize, columnWidth}} = action.payload;
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
            state.profileDict[profileId].columnIds.push(id);
            state.columnDict[id] = newColumn;
        },
        setProfileOrder: (state, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(state.profileDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.profileOrder = order;

            // remove pages that are not in input order list
            existingIds.filter(id => order.indexOf(id) < 0).forEach(id => {
                delete state.profileDict[id];
            });
        },
        setColumnOrder: (state, action) => {
            let {order, profileId} = action.payload;

            const existingIds = Object.keys(state.columnDict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.profileDict[profileId].columnIds = order;
        },
        updateColumn: (state, action) => {
            let {columnId, key, val} = action.payload;
            state.columnDict[columnId][key] = val;
        },
        removeColumn: (state, action) => {
            const {columnId} = action.payload;
            state.profileOrder = state.profileOrder.filter(x => x !== columnId);
            delete state.columnDict[columnId];
        },
        resetProfiles: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },

        setAccountOrder: (state, action) => {
            let {profileId, order} = action.payload;
            state.profileDict[profileId] = order;
        },
    }
});

export const {
    updateProfileConfig,
    addColumn,
    setColumnOrder,
    updateColumn,
    removeColumn,
    resetProfiles,
    setProfileOrder,
    setAccountOrder,
    addOrUpdateAccount, removeAccount, logOut, resetAccounts
} = slice.actions
export default slice.reducer
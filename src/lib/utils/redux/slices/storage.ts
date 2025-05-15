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
import {
    AccountType,
    BlueskyAccount, BlueskyUserData,
    EncryptedAccount,
    MastodonAccount, MastodonUserData,
    UserData
} from "@/lib/utils/types-constants/user-data";
import {CwType} from "@/lib/utils/types-constants/content-warning";

export type StorageState = {
    profileOrder:string[],
    profiles:{[id:string]: ProfileColumns}
    columns: {[id:string]: ColumnConfig},
    userData:{[id:string]: UserData}
    encryptedAccounts: { [id: string]: EncryptedAccount }
}

export const makeInitialState = ():StorageState => {
    const profileId = randomUuid();

    let profiles = {};
    profiles[profileId] = {
        name: "Default Profile",
        columnIds: [],
        accountIds: [],
        maskCw: true,
        hideCw: false,
        cwLabels: [],
        icon: ""
    }

    return {
        profileOrder: [profileId],
        profiles,
        columns:{},
        userData: {},
        encryptedAccounts:{}
    }
}

// Storage data is synced, and is persisted
const initialState:StorageState = makeInitialState();

const slice = createSlice({
    name:"storage",
    initialState,
    reducers:{
        // profileOrder
        setProfileOrder: (state, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(state.profiles);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.profileOrder = order;

            // remove profiles that are not in input order list
            existingIds.filter(id => order.indexOf(id) < 0).forEach(id => {
                delete state.profiles[id];
            });
        },


        // profiles
        setProfileConfig: (state, action) => {
            const {update, profileId} = action.payload;
            const page = state.profiles[profileId];
            if (page) {
                for (const [key, value] of Object.entries(update)) {
                    page[key] = value;
                }
            }
        },

        setColumnOrder: (state, action) => {
            let {order, profileId} = action.payload;

            const existingIds = Object.keys(state.columns);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            state.profiles[profileId].columnIds = order;
        },

        setAccountOrder: (state, action) => {
            let {profileId, order} = action.payload;
            state.profiles[profileId] = order;
        },


        // columns
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
            state.profiles[profileId].columnIds.push(id);
            state.columns[id] = newColumn;
        },

        setColumn: (state, action) => {
            let {columnId, key, val} = action.payload;
            state.columns[columnId][key] = val;
        },
        removeColumn: (state, action) => {
            const {columnId} = action.payload;
            state.profileOrder = state.profileOrder.filter(x => x !== columnId);
            delete state.columns[columnId];
        },


        // userData
        setUserData: (storage, action) => {
            const {users} = action.payload;
            (users as UserData[]).forEach(user => {
                const {id, displayName, avatar, lastTs, type} = user;
                switch (type) {
                    case AccountType.BLUESKY: {
                        const {handle} = action.payload;
                        let user: BlueskyUserData;
                        user = {id, type, handle, displayName, avatar, lastTs};
                        storage.userData[id] = user;
                        break;
                    }
                    case AccountType.MASTODON: {
                        let user: MastodonUserData;
                        user = {id, type, displayName, avatar, lastTs};
                        storage.userData[id] = user;
                        break;
                    }
                }
            });
        },


        // encryptedAccounts
        setEncryptedAccount: (state, action) => {
            const {encryptedAccount, id} = action.payload;

            state.encryptedAccounts[id] = encryptedAccount;
        },
        removeEncryptedAccount: (state, action) => {
            const {id} = action.payload;
            delete state.encryptedAccounts[id];
        },

        resetAccounts: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },


        resetProfiles: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        },

    }
});

export const {
    setProfileConfig,
    addColumn,
    setColumnOrder,
    setColumn,
    removeColumn,
    resetProfiles,
    setProfileOrder,
    setAccountOrder,
    setEncryptedAccount,
    removeEncryptedAccount,
    resetAccounts,
    setUserData,
} = slice.actions
export default slice.reducer
import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import config, {ConfigState} from "@/lib/utils/redux/slices/config";
import pages, {PagesState} from "@/lib/utils/redux/slices/pages";
import {BlueskyAccount, MastodonAccount} from "@/lib/utils/types-constants/user-data";
import memory, {MemoryState} from "@/lib/utils/redux/slices/memory";
import {combineReducers} from "redux";
import thunk from 'redux-thunk';
import accounts, {AccountState} from "@/lib/utils/redux/slices/accounts";
import local, {LocalState} from "@/lib/utils/redux/slices/local";

// https://stackoverflow.com/questions/69480786/how-to-auto-refresh-component-when-redux-state-get-updated
export interface StoreState {
    accounts: AccountState
    config: ConfigState
    local: LocalState
    memory: MemoryState,
    pages: PagesState
}

const persistedReducer = persistReducer(
    {key: 'root', storage, blacklist:['memory', 'local']},
    combineReducers({config, pages, accounts, memory, local})
);

let sc:any;
const getSyncChannel = () => {
    if (!sc && typeof window !== 'undefined') {
        sc = new BroadcastChannel("DECK_SYNC");
        sc.onmessage = async (message) => {
            const {data} = message;
            const action = JSON.parse(data);
            const {type, payload} = action;
            store.dispatch({type, payload:{...payload, __terminate: true}});
        };
    }
    return sc;
}

const storageSyncMiddleware = (store) => (next) => (action) => {
    try {
        if (!action.type.startsWith("persist/") && // Don't sync persist actions
            !action.type.startsWith("local/") && // Don't sync local actions
            action.payload?.__terminate !== true) {
            const {type, payload} = action;
            const syncChannel = getSyncChannel();
            if (syncChannel) {
                syncChannel.postMessage(JSON.stringify({type, payload}));
            }
        }
    } catch (e) {
       // console.error("sync", e);
    }
    return next(action);
}


// config the store
export const store = configureStore({
    reducer: persistedReducer,
    devTools: true,
    middleware: [storageSyncMiddleware, thunk] // thunk is required to get rid of an error
});

// export default the store
export const persistor = persistStore(store);

export const exportJSON = async () => {
    let state = JSON.parse(JSON.stringify(store.getState()));
    delete state.memory;
    delete state._persist;

    let userDict = state.accounts.dict as {[id:string]: BlueskyAccount | MastodonAccount};
    Object.values(userDict).forEach(user => {
        switch (user.type) {
            case "b": {
                userDict[user.id] = {
                    ...user,
                    active:false,
                    encryptedPassword: "",
                    refreshJwt:"", accessJwt:""
                };
                break;
            }
            case "m": {
                userDict[user.id] = {
                    ...user,
                    active:false,
                    token:""
                };
                break;
            }
        }

    });
    state.config.basicKey = "";

    return state;
}


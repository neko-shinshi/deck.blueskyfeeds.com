import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import config from "@/lib/utils/redux/slices/config";
import pages from "@/lib/utils/redux/slices/pages";
import {UserData, UserStatusType} from "@/lib/utils/types-constants/account";
import memory from "@/lib/utils/redux/slices/memory";
import {combineReducers} from "redux";
import thunk from 'redux-thunk';
import users from "@/lib/utils/redux/slices/users";

const persistedReducer = persistReducer(
    {key: 'root', storage, blacklist:['memory']},
    combineReducers({config, pages, users, memory})
);

const SyncChannel = new BroadcastChannel("DECK_SYNC");
SyncChannel.onmessage = async (message) => {
    const {data} = message;
    const action = JSON.parse(data);
    const {type, payload} = action;
    store.dispatch({type, payload:{...payload, __terminate: true}});
};

const storageSyncMiddleware = (store) => (next) => (action) => {
    try {
        if (!action.type.startsWith("persist/") && action.payload?.__terminate !== true) {
            const {type, payload} = action;
            SyncChannel.postMessage(JSON.stringify({type, payload}));
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
    let state = JSON.parse(JSON.stringify(await store.getState()));
    delete state.memory;
    delete state._persist;

    let userDict = state.users.dict as {[did:string]: UserData};
    Object.values(userDict).forEach(user => {
        userDict[user.did] = {
            ...user,
            status: UserStatusType.LOGGED_OUT,
            encryptedPassword: "",
            refreshJwt:"", accessJwt:""
        };
    });
    state.config.basicKey = "";
    state.config.primaryDid = "";

    return state;
}


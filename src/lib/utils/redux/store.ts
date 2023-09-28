import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import config from "@/lib/utils/redux/slices/config";
import pages from "@/lib/utils/redux/slices/pages";
import users from "@/lib/utils/redux/slices/users";
import tests from "@/lib/utils/redux/slices/test";
import {combineReducers} from "redux";
import thunk from 'redux-thunk';
import {randomUuid} from "@/lib/utils/random";
import {decrypt, encrypt, parseKey} from "@/lib/utils/crypto";


const persistedReducer = persistReducer(
    {key: 'root', storage},
    combineReducers({config, pages, users, tests})
);

export const SYNC_SESSION_ID = randomUuid();

const storageSyncMiddleware = (store) => (next) => (action) => {
    try {
        if (action.type !== "REHYDRATE" && action.type !== "PERSIST" && action.payload?.__terminate !== true) {
            const {type, payload} = action;
            const state = store.getState();
            const keyString = state.config.basicKey;
            if (keyString) {
                parseKey(keyString).then(key => {
                    encrypt(key, JSON.stringify({type, payload})).then(cipherText => {
                        localStorage?.setItem('SYNC-KEY', JSON.stringify({
                            session: SYNC_SESSION_ID,
                            action: cipherText,
                            time: Date.now()
                        }));
                    });
                });
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

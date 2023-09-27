import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist';
import storage from "redux-persist/lib/storage";
import config from "@/lib/utils/redux/slices/config";
import page from "@/lib/utils/redux/slices/pages";
import user from "@/lib/utils/redux/slices/users";
import {combineReducers} from "redux";
import thunk from 'redux-thunk';

const persistedReducer = persistReducer(
    {key: 'root', storage},
    combineReducers({config, page, user})
);

// config the store
export const store = configureStore({
    reducer: persistedReducer,
    devTools: true,
    middleware: [thunk] // this is required to get rid of an error
});

// export default the store
export const persistor = persistStore(store);
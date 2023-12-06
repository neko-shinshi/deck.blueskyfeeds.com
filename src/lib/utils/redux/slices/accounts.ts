import { createSlice } from '@reduxjs/toolkit'
import {BlueskyAccount, MastodonAccount} from "@/lib/utils/types-constants/user-data";


export const initialState:{order:string[], dict:{[id:string]: BlueskyAccount | MastodonAccount}} = {dict: {}, order:[]};

const slice = createSlice({
    name:"accounts",
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

            users.dict[id] = user;

            const index = users.order.findIndex(x => x === id);
            if (index < 0) {
                users.order.push(id);
            }
        },
        removeAccount: (users, action) => {
            const {id} = action.payload;
            delete users.dict[id];
            users.order = users.order.filter(x => x !== id);
        },
        logOut: (users, action) => {
            const {id} = action.payload;
            const user = users.dict[id];
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
        setAccountOrder: (users, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(users.dict);
            order = order.filter(id => existingIds.indexOf(id) >= 0); // only keep dids that are currently saved
            users.order = order;

            // remove users that are not in input order list
            existingIds.filter(id => order.indexOf(id) < 0).forEach(id => {
                delete users.dict[id];
            });
        },
        resetAccounts: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        }

    }
});

export const {addOrUpdateAccount, removeAccount, logOut, setAccountOrder, resetAccounts} = slice.actions
export default slice.reducer
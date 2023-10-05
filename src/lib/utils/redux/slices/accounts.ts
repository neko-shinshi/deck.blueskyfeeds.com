import { createSlice } from '@reduxjs/toolkit'
import {Account} from "@/lib/utils/types-constants/user-data";


export const initialState:{order:string[], dict:{[did:string]: Account}} = {dict: {}, order:[]};

const slice = createSlice({
    name:"accounts",
    initialState,
    reducers:{
        addOrUpdateAccount: (users, action) => {
            const {service, usernameOrEmail, encryptedPassword, did, displayName, avatar, handle, refreshJwt, accessJwt,
                followsCount, followersCount, postsCount, lastTs} = action.payload;

            const user = {
                service, usernameOrEmail, encryptedPassword,
                refreshJwt, accessJwt, avatar,
                handle, did, displayName, active:true, followsCount, followersCount, postsCount, lastTs
            };

            users.dict[did] = user;

            const index = users.order.findIndex(x => x === did);
            if (index < 0) {
                users.order.push(did);
            }
        },
        removeAccount: (users, action) => {
            const {did} = action.payload;
            delete users.dict[did];
            users.order = users.order.filter(x => x !== did);
        },
        logOut: (users, action) => {
            const {did} = action.payload;
            const user = users.dict[did];
            if (user) {
                user.active = false;
                user.encryptedPassword = "";
                user.refreshJwt = "";
                user.accessJwt = "";
            }
        },
        setAccountOrder: (users, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(users.dict);
            order = order.filter(did => existingIds.indexOf(did) >= 0); // only keep dids that are currently saved
            users.order = order;

            // remove users that are not in input order list
            existingIds.filter(did => order.indexOf(did) < 0).forEach(did => {
                delete users.dict[did];
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
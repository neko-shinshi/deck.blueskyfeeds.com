import { createSlice } from '@reduxjs/toolkit'

export enum UserStatusType {
    ACTIVE="ACTIVE", LOGGED_OUT="LOGGED_OUT", RATE_LIMITED="RATE_LIMITED"
}


export interface UserData {
    did: string
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    handle: string
    displayName: string
    status: UserStatusType
    avatar: string
}

export const initialState:{order:string[], dict:{[did:string]: UserData}} = {dict: {}, order:[]};

const slice = createSlice({
    name:"users",
    initialState,
    reducers:{
        addOrUpdateUser: (users, action) => {
            const {service, usernameOrEmail, encryptedPassword, did, displayName, avatar, handle, refreshJwt, accessJwt} = action.payload;

            const user = {
                service, usernameOrEmail, encryptedPassword,
                refreshJwt, accessJwt, avatar,
                handle, did, displayName, status: UserStatusType.ACTIVE
            };

            users.dict[did] = user;

            const index = users.order.findIndex(x => x === did);
            if (index < 0) {
                users.order.push(did);
            }
        },
        removeUser: (users, action) => {
            const {did} = action.payload;
            delete users.dict[did];
            users.order = users.order.filter(x => x !== did);
        },
        logOut: (users, action) => {
            const {did} = action.payload;
            const user = users.dict[did];
            if (user) {
                user.status = UserStatusType.LOGGED_OUT;
                user.encryptedPassword = "";
                user.refreshJwt = "";
                user.accessJwt = "";
            }
        },
        setUserOrder: (users, action) => {
            let {order} = action.payload;

            const existingIds = Object.keys(users.dict);
            order = order.filter(did => existingIds.indexOf(did) >= 0); // only keep dids that are currently saved
            users.order = order;

            // remove users that are not in input order list
            existingIds.filter(did => order.indexOf(did) < 0).forEach(did => {
                delete users.dict[did];
            });
        },
        resetUsers: (state, action) => {
            for (const [key, value] of Object.entries(action.payload)) {
                state[key] = value;
            }
        }

    }
});

export const {addOrUpdateUser, removeUser, logOut, setUserOrder, resetUsers} = slice.actions
export default slice.reducer
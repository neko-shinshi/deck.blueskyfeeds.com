import { createSlice } from '@reduxjs/toolkit'

export interface UserData {
    service: string
    usernameOrEmail: string
    encryptedPassword: string
    refreshJwt: string,
    accessJwt: string
    did: string
    handle: string
    displayName: string
    active: boolean
    avatar: string
}
const initialState:{val:UserData[]} = {val: []};

const slice = createSlice({
    name:"users",
    initialState,
    reducers:{
        addOrUpdateUser: (users, action) => {
            const {service, usernameOrEmail, encryptedPassword, did, displayName, avatar, handle, refreshJwt, accessJwt} = action.payload;

            const user = {
                service, usernameOrEmail, encryptedPassword,
                refreshJwt, accessJwt, avatar,
                did, handle, displayName, active: true
            };

            const index = users.val.findIndex(x => x.did === did);
            if (index >= 0) {
                users.val[index] = user;
            } else {
                users.val.push(user);
            }
        },
        removeUser: (users, action) => {
            const {did} = action.payload;
            users.val = users.val.filter(x => x.did !== did);
        },
        logOut: (users, action) => {
            const {did} = action.payload;
            const user = users.val.find(x => x.did === did);
            if (user) {
                user.active = false;
                user.encryptedPassword = "";
                user.refreshJwt = "";
                user.accessJwt = "";
            }
        },
        setUserOrder: (users, action) => {
            const {order} = action.payload;
            users.val = order.reduce((acc, x) => {
                const user = users.val.find(y => y.did === x);
                if (user) {
                    acc.push(user);
                }
                return acc;
            }, []);
        }
    }
});

export const {addOrUpdateUser, removeUser, logOut, setUserOrder} = slice.actions
export default slice.reducer
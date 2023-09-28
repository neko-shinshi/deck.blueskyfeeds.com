import { createSlice } from '@reduxjs/toolkit'

interface UserData {
    service: string
    usernameOrEmail: string
    password: string
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
            const {service, usernameOrEmail, password, did, displayName, avatar, handle, refreshJwt, accessJwt} = action.payload;

            const user = {
                service, usernameOrEmail, password,
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
            const index = users.val.findIndex(x => x.did === action.payload);
            if (index >= 0) {
                users.val.splice(index, 1);
            }
        },
        setUserInactive: (users, action) => {
            const index = users.val.findIndex(x => x.did === action.payload);
            if (index >= 0) {
                users.val[index].active = false;
            }
        },
        setUserOrder: (users, action) => {
            const newUsers = action.payload.reduce((acc, x) => {
                const user = users.val.find(y => y.did === x);
                if (user) {
                    acc.push(user);
                }
                return acc;
            }, []);

            users.val = newUsers;
        }
    }
});

export const {addOrUpdateUser, removeUser, setUserInactive, setUserOrder} = slice.actions
export default slice.reducer
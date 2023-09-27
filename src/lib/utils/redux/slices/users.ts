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
const initialState:UserData[] = [];

const slice = createSlice({
    name:"users",
    initialState,
    reducers:{
        addOrUpdateUser: (users, action) => {
            const {service, usernameOrEmail, password, agent, data} = action.payload;
            const {did, handle, refreshJwt, accessJwt} = agent.session;
            const {displayName, avatar} = data;

            const user = {
                service, usernameOrEmail, password,
                refreshJwt, accessJwt, avatar,
                did, handle, displayName, active: true
            };

            const index = users.findIndex(x => x.did === did);
            if (index >= 0) {
                users[index] = user;
            } else {
                users.push(user);
            }
        },
        removeUser: (users, action) => {
            const index = users.findIndex(x => x.did === action.payload);
            if (index >= 0) {
                users.splice(index, 1);
            }
        },
        setUserInactive: (users, action) => {
            const index = users.findIndex(x => x.did === action.payload);
            if (index >= 0) {
                users[index].active = false;
            }
        },
        setUserOrder: (users, action) => {
            const newUsers = action.payload.reduce((acc, x) => {
                const user = users.find(y => y.did === x);
                if (user) {
                    acc.push(user);
                }
                return acc;
            }, []);

            users.length = 0;
            newUsers.forEach(x => {
                users.push(x);
            });


        }
    }
});

export const {addOrUpdateUser, removeUser, setUserInactive, setUserOrder} = slice.actions
export default slice.reducer
import {createContext, useContext, useEffect, useState} from "react";
import {SYNC_SESSION_ID} from "@/lib/utils/redux/store";
import {decrypt, makeKey, parseKey} from "@/lib/utils/crypto";
import {setConfigValue} from "@/lib/utils/redux/slices/config";
// Based on https://franz.hamburg/writing/syncing-redux-stores-across-browser-tabs.html
import {useDispatch, useSelector} from "react-redux";
const ReduxSyncContext = createContext<any>(null)

function ReduxSyncProvider ({children}) {
    const [ready, setReady] = useState(false); // dummy, not used
    //@ts-ignore
    const config = useSelector((state) => state.config);

    const dispatch = useDispatch();
    function createStorageListener() {
        return async (event) => {
            const {newValue, key} = event;
            if ('SYNC-KEY' === key) {
                const keyString = config.basicKey;
                if (keyString) {
                    let {action, session} = JSON.parse(newValue);
                    if (SYNC_SESSION_ID !== session) { // Don't dispatch own sessions to self
                        const key = await parseKey(keyString);
                        action = JSON.parse(await decrypt(key, action));

                        const {type, payload} = action;

                        dispatch({type, payload:{...payload, __terminate: true}});
                    }
                }
            }
        }
    }

    const listenStorage = createStorageListener();

    useEffect(() => {
        window.addEventListener('storage', listenStorage);
        return () => window.removeEventListener("storage", listenStorage);
    }, []);

    useEffect(() => {
        if (config && !config.basicKey) {
            makeKey().then(key => {
                dispatch(setConfigValue({basicKey: key}));
            });
        }
    }, [config]);

    return <ReduxSyncContext.Provider value={ready}>
        {children}
    </ReduxSyncContext.Provider>
}

function useReduxSync() {
    const context = useContext(ReduxSyncContext);
    if (context === undefined) {
        throw new Error('useRecaptcha must be used within a RecaptchaProvider')
    }
    return context;
}


export {ReduxSyncProvider, useReduxSync}
import {createContext, useContext, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {SYNC_SESSION_ID} from "@/lib/utils/redux/store";
// Based on https://franz.hamburg/writing/syncing-redux-stores-across-browser-tabs.html

const ReduxSyncContext = createContext<any>(null)

function ReduxSyncProvider ({children}) {
    const [ready, setReady] = useState(false); // dummy, not used
    const dispatch = useDispatch();
    function createStorageListener() {
        return event => {
            const {newValue, key} = event;
            if ('SYNC-KEY' === key) {
                const {action, session} = JSON.parse(newValue);
                const {type, payload} = action;
                if (SYNC_SESSION_ID !== session) {
                    // Don't dispatch own sessions to self
                    dispatch({type, payload:{...payload, __terminate: true}});
                }
            }
        }
    }

    const listenStorage = createStorageListener();

    useEffect(() => {
        window.addEventListener('storage', listenStorage);
        return () => window.removeEventListener("storage", listenStorage);
    }, []);

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
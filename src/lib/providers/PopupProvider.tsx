import {createContext, useContext, useState} from "react";
import {PopupConfig} from "@/lib/utils/types-constants/popup";


export type PopupConfigType = {
    popupConfig: PopupConfig|false;
    setPopupConfig: (config: PopupConfig|false) => void;
};


const PopupContext = createContext<PopupConfigType>({
    popupConfig: false,
    setPopupConfig: (config: PopupConfig|false) => {}
});

export function PopupProvider ({children}) {
    const [popupConfig, setPopupConfig] = useState<PopupConfig|false>(false);
    return <PopupContext.Provider value={{popupConfig , setPopupConfig}}>
        {children}
    </PopupContext.Provider>
}

export function usePopupContext() {
    const context = useContext(PopupContext);
    if (context === undefined) {
        throw new Error('usePopupContext must be used within a PopupProvider')
    }
    return context;
}

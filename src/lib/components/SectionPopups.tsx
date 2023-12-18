import PopupFormSignInBluesky from "@/lib/components/popups/PopupFormSignInBluesky";
import {PopupState} from "@/lib/utils/types-constants/popup";
import PopupUserList from "@/lib/components/popups/PopupUserList";
import PopupGlobalSettings from "@/lib/components/popups/PopupGlobalSettings";
import PopupColumnPickType from "@/lib/components/popups/PopupColumnPickType";
import PopupPostAction from "@/lib/components/popups/PopupPostAction";
import {useEffect} from "react";
import {useSelector} from "react-redux";
import {setPopupConfig} from "@/lib/utils/redux/slices/local";
import {StoreState} from "@/lib/utils/redux/store";

export default function SectionPopups ({}) {
    const popupConfig = useSelector((state:StoreState) => state.local.popupConfig);
    useEffect(() => {
        console.log("popupConfig", popupConfig);
    }, [popupConfig]);

    return <div>
        <PopupFormSignInBluesky
            isOpen={popupConfig && popupConfig.state === PopupState.LOGIN}
            setOpen={setPopupConfig}/>
        <PopupUserList
            isOpen={popupConfig && popupConfig.state === PopupState.USERS}
            setOpen={setPopupConfig}/>
        <PopupGlobalSettings isOpen={popupConfig && popupConfig.state === PopupState.SETTINGS} setOpen={setPopupConfig}/>
        <PopupColumnPickType isOpen={popupConfig && popupConfig.state === PopupState.ADD_COLUMN} setOpen={setPopupConfig}/>
        <PopupPostAction isOpen={popupConfig && popupConfig.state === PopupState.POST_ACTION} setOpen={setPopupConfig}/>
    </div>
}
import Popup from "@/lib/components/popups/Popup";
import clsx from "clsx";
import FormSignInBluesky from "@/lib/components/FormSignInBluesky";
import {BlueskyAccount} from "@/lib/utils/types-constants/user-data";

export default function PopupFormSignInBluesky({isOpen, setOpen, initialUser=null}:
        {isOpen:boolean, setOpen:any, initialUser?: BlueskyAccount}) {
    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className={clsx("bg-theme_dark-L0 rounded-lg p-2 border border-theme_dark-I0",
            "text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full ")}
    >
        <FormSignInBluesky
            initialUser={initialUser}
            completeCallback={() => setOpen(false)}
        />
    </Popup>
}
import Popup from "@/lib/components/popups/Popup";
import clsx from "clsx";
import FormSignIn from "@/lib/components/FormSignIn";
import {Account} from "@/lib/utils/types-constants/user-data";

export default function PopupFormSignIn({isOpen, setOpen, initialUser=null, completeCallback}:
        {isOpen:boolean, setOpen:any, initialUser?: Account, completeCallback?:any}) {
    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className={clsx("bg-theme_dark-L0 rounded-lg p-2",
            "text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full ")}
    >
        <FormSignIn
            openState={isOpen}
            initialUser={initialUser}
            completeCallback={() => {
                setOpen(false);
                if (completeCallback) {
                    completeCallback();
                }
            }}/>
    </Popup>
}
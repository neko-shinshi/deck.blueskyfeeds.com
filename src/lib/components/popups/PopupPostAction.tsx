import Popup from "@/lib/components/popups/Popup";
import {HiOutlineClipboardCopy} from "react-icons/hi";
import {BsFillSendExclamationFill} from "react-icons/bs";
import {MdGTranslate} from "react-icons/md";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {PopupConfigPostAction, PopupState} from "@/lib/utils/types-constants/popup";
import {StoreState} from "@/lib/utils/redux/store";

export default function PopupPostAction({isOpen, setOpen}) {
    const memory = useSelector((state:StoreState) => state.memory);
    const popupConfig = useSelector((state:StoreState) => state.local.popupConfig);

    const [postUrl, setPostUrl] = useState("");
    const [translateUrl, setTranslateUrl] = useState("");

    useEffect(() => {
        if (popupConfig && popupConfig.state === PopupState.POST_ACTION) {
            const actionConfig = popupConfig as PopupConfigPostAction;
            const post = memory.posts[actionConfig.uri];
            if (post) {
                setPostUrl(`https://bsky.app/profile/${post.uri}`);
                if (post.text.trim()) {
                    setTranslateUrl( `https://translate.google.com/?sl=auto&tl=en&text=${post.text}`);
                } else {
                    setTranslateUrl("");
                }

            }
        }
    }, [popupConfig]);

    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}
        className="bg-theme_dark-L1 rounded-2xl py-2 ">
        <div className="text-lg text-center">Post Actions</div>

        <div className="flex place-items-center gap-1 p-2 hover:bg-theme_dark-I1"
             onClick={() => {
                 navigator.clipboard.writeText(postUrl).then(r => {
                     setOpen(false);
                     alert(`Url copied to clipboard\n${postUrl}`);
                 });
        }}>
            <HiOutlineClipboardCopy className="h-8 w-8" />
            <div>Copy Post URL</div>
        </div>
        {
            translateUrl &&
            <div className="flex place-items-center gap-1 p-2 hover:bg-theme_dark-I1"
                 onClick={() => {
                     window.open(translateUrl,'_blank');
                 }}>
                <MdGTranslate className="h-8 w-8" />
                <div>Translate</div>
            </div>
        }


        <div className="flex place-items-center gap-1 p-2 hover:bg-theme_dark-I1"
             onClick={() => {

             }}>
            <BsFillSendExclamationFill className="h-8 w-8" />
            <div>Send Moderation Report</div>
        </div>
    </Popup>
}
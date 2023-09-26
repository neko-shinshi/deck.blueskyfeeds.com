import {useState} from "react";
import clsx from "clsx";
import {FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton} from "react-share";
import {HiOutlineClipboardCopy} from "react-icons/hi";
import {FaShare} from "react-icons/fa";
import Popup from "@/lib/components/layout/Popup";

export default function ButtonSocialShare({url}) {
    const [isOpen, setOpen] = useState(false);
    const [isCopyOpen, setCopyOpen] = useState(false);
    const [timer, setTimer] = useState<any>(null);

    const showCopy = () => {
        setCopyOpen(true);
        setTimer(setTimeout(() => {setCopyOpen(false)}, 5000));
    }

    return <>
        <Popup isOpen={isCopyOpen} setOpen={setCopyOpen} onCloseCallback={() => {
            if (timer) { clearTimeout(timer as string); setTimer(null);}
        }}>
            <div className={
                clsx("bg-white rounded-lg space-y-4",
                    "px-4 pt-5 pb-4 sm:p-6",
                    "text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full")}>
                <div className="text-center font-bold text-xl">Copied to clipboard</div>
                <div className="text-md">{url}</div>
            </div>
        </Popup>
        <Popup isOpen={isOpen} setOpen={setOpen}>
            <div className={
                clsx("bg-white rounded-lg space-y-4",
                    "px-4 pt-5 pb-4 sm:p-6",
                    "text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-md sm:w-full")}>

                <div className="text-center font-bold text-xl">Share or Copy to Clipboard</div>
                <div className="flex items-center gap-4">
                    <FacebookShareButton url={url} onClick={() => {setOpen(false)}}>
                        <FacebookIcon size={96} round={true} />
                    </FacebookShareButton>

                    <TwitterShareButton url={url} onClick={() => {setOpen(false)}}>
                        <TwitterIcon size={96} round={true} />
                    </TwitterShareButton>

                    <div className="bg-gray-700 h-24 w-24 grid place-items-center rounded-full cursor-pointer"
                         onClick={() => {
                             navigator.clipboard.writeText(url).then(r => {
                                 setOpen(false);
                                 showCopy();
                             });
                         }}>
                        <HiOutlineClipboardCopy className="-mt-1 ml-1 h-16 w-16 text-white"/>
                    </div>
                </div>
            </div>
        </Popup>

        <div className="bg-orange-400 rounded-full h-8 w-8 grid place-items-center"
             onClick={() => {
                 if (typeof navigator.share !== 'undefined') {
                     navigator.share({ url }).then(r => {
                         console.log("share modal");
                     })
                 } else {
                     setOpen(true);
                 }
             }}>
            <FaShare className="h-5 w-5 hover:text-white"/>
        </div>
    </>
}
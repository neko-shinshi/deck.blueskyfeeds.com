import Popup from "@/lib/components/popups/Popup";
import clsx from "clsx";
import {useEffect, useState} from "react";

export default function PopupConfirmation(
    {
        isOpen,
        setOpen,
        title:_title,
        message:_message,
        yesText:_yesText="",
        noText:_noText="",
        yesCallback,
        buttonClass:_buttonClass=""
    }: {
        isOpen:boolean
        setOpen:(boolean) => void,
        title:string,
        message:string,
        yesText?:string,
        noText?:string,
        yesCallback: () => void,
        buttonClass?:string
    }) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [yesText, setYesText] = useState("");
    const [noText, setNoText] = useState("");
    const [buttonClass, setButtonClass] = useState("");

    useEffect(() => {
        if (isOpen) {
            setTitle(_title);
            setMessage(_message);
            setYesText(_yesText);
            setNoText(_noText);
            setButtonClass(_buttonClass);
        }

    }, [_title, _message, _yesText, _noText , _buttonClass, isOpen]);


    return <Popup
        isOpen={isOpen}
        setOpen={setOpen}>
        <div className="bg-white rounded-xl p-4">
            <div className="mt-3 text-center sm:mt-5">
                <div className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                </div>
                <div className="mt-2">
                    <p className="text-sm text-gray-500">
                        {message}
                    </p>
                </div>
            </div>
            <div className="mt-5 flex justify-between space-x-4">
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-2 border-black shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setOpen(false)}
                >
                    {noText? noText:"Cancel"}
                </button>
                <button
                    type="button"
                    className={clsx(buttonClass || "bg-white text-black",
                        "mt-3 w-full inline-flex justify-center rounded-md border border-2 shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:col-start-1 sm:text-sm")}
                    onClick={() => {
                        setOpen(false);
                        if (yesCallback) {
                            yesCallback();
                        }
                    }}
                >
                    {yesText? yesText:"Ok"}
                </button>
            </div>
        </div>
    </Popup>
}

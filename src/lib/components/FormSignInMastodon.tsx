import {useEffect, useState} from "react";
import { getAgentLogin} from "@/lib/utils/bsky/bsky";
import {BsFillInfoCircleFill} from "react-icons/bs";
import Link from "next/link";
import {HiAtSymbol} from "react-icons/hi";
import clsx from "clsx";
import {useDispatch, useSelector} from "react-redux";
import {addOrUpdateAccount, resetAccounts} from "@/lib/utils/redux/slices/accounts"
import {setConfigValue, startApp} from "@/lib/utils/redux/slices/config";
import {useForm} from "react-hook-form";
import {encrypt, makeKey, parseKey} from "@/lib/utils/crypto";
import {addColumn} from "@/lib/utils/redux/slices/pages";
import {initializeColumn} from "@/lib/utils/redux/slices/memory";
import recoverDataFromJson from "@/lib/utils/client/recoverDataFromJson";
import {BlueskyAccount, MastodonAccount} from "@/lib/utils/types-constants/user-data";
import {randomUuid} from "@/lib/utils/random";
import {ColumnType} from "@/lib/utils/types-constants/column";

export default function FormSignInMastodon ({initialUser=null, completeCallback}:
{initialUser?:MastodonAccount, completeCallback?:any}) {
    //@ts-ignore
    const accounts = useSelector((state) => state.accounts);
    //@ts-ignore
    const config = useSelector((state) => state.config);
    //@ts-ignore
    const pages = useSelector((state) => state.pages);

    const [warning, setWarning] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const dispatch = useDispatch();
    const useFormReturn = useForm();
    const {
        register,
        reset,
        clearErrors,
        setError,
        trigger,
        formState: { errors },
        handleSubmit,
    } = useFormReturn;


    useEffect( () => {
        if (!initialUser) {
            reset({service:"mstdn.social", username:""});
        } else {
            const {service, email} = initialUser;
            reset({service, email});
        }
        setSubmitting(false);
    }, [initialUser]);



    const formHandleSubmit = (e) => {
        clearErrors();
        trigger();
        console.log("submit");
        handleSubmit(async (data:any) => {
            if (submitting) {
                console.log("duplicate submit")
                return;
            }
            console.log("actual submit", data);
            const {service, email, password} = data;

            setSubmitting(false);
        })(e).catch(err => {
            setSubmitting(false);
            switch (err.status) {
                case 401: {
                    setError("fail", {type: err.status, message:`Authentication Failed, check your username, password or domain again`});
                    break;
                }
                case 429: {
                    setError("fail", {type: err.status, message:`Rate Limited or too many attempts to Login, please try again later`});
                    break;
                }
                default: {
                    setError("fail", {type: err.status, message:`Unknown Caught Error ${err.status}, try again later or contact @blueskyfeeds.com`});
                    break;
                }
            }
            console.log(err);
        });
    }

    return <>
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
            <h1 className="mt-3 text-center text-lg font-bold text-dark_theme-T0 ">
                <span>Login with an existing Mastodon Account</span>
            </h1>
        </div>

        <form className="space-y-4" onSubmit={formHandleSubmit}>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme_dark-T1">
                    Email
                </label>
                <div className="mt-1 relative">
                    <input
                        type="text"
                        disabled={!!initialUser}
                        className={clsx("pl-8 appearance-none block w-full px-3 py-2",
                            errors.email && "border-red-600",
                            !!initialUser && "bg-gray-400",
                            "border border-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400",
                            "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm")}
                        {...register("username", {required: `Email is required`})}
                    />
                    <div
                        className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
                        <HiAtSymbol className="w-4 h-4"/>
                    </div>
                </div>
                {
                    errors.username && <div className="text-red-600 text-sm">{errors.username.message as string}</div>
                }
            </div>

            <div>
                <label htmlFor="password" className="flex justify-items-start place-items-center gap-2 text-sm font-medium text-theme_dark-T1">
                    Password
                </label>
                <div className="mt-1 relative">
                    <input
                        placeholder="xxxx-xxxx-xxxx-xxxx"
                        className={clsx("pl-8 appearance-none block w-full px-3 py-2",
                            errors.password && "border-red-600",
                            "border border-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400",
                            "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm")}
                        {...register("password", {
                            required: `Password is required`
                        })}
                    />
                    <div
                        className="absolute inset-y-0 left-0 flex items-center px-2 pointer-events-none">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                                  clipRule="evenodd"/>
                        </svg>
                    </div>
                </div>
                {
                    errors.password && <div className="text-red-600 text-sm">{errors.password.message as string}</div>
                }
            </div>
            <div>
                <label htmlFor="domain" className="block text-sm font-medium text-theme_dark-T1">
                    Server (e.g. mstdn.social or mastodon.social)
                </label>
                <div className="mt-1 flex place-items-center">
                    <input
                        onClick={() => {
                            if (!warning) {
                                alert("Only change this if you are on a FEDERATED server");
                                setWarning(true);
                            }
                        }}
                        type="text"
                        className={clsx("appearance-none block w-full px-3 py-2",
                            errors.service && "border-red-600",
                            "border border-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400",
                            "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm")}
                        {...register("service", {
                            required: `Domain is required`,
                            validate: v => {
                                let regex = /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/;
                                return regex.test(v) || "Not a valid domain. Check it again";
                            }
                        })}
                    />
                </div>
                {
                    errors.service && <div className="text-red-600 text-sm">{errors.service.message as string}</div>
                }
            </div>

            {
                errors.fail && <div className="text-red-600 text-sm">
                    {errors.fail.message as string}
                </div>
            }

            <div>
                <button
                    type="submit"
                    className={
                        clsx("w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500")
                    }>
                    Login
                </button>


            </div>

            {
                false &&
                <div className="text-blue-500 font-semibold text-center hover:underline hover:text-blue-800"
                     onClick={() => {
                         if (pages.pages.order.length >= 1) {
                             const pageId = pages.pages.order[0];
                             dispatch(addColumn({pageId, config:{id:randomUuid(), type:ColumnType.FIREHOSE}, defaults: config}));
                             //dispatch(startApp());
                         }
                     }}
                >
                    <div className="text-sm">Or see Firehose posts directly</div>
                    <div className="text-xs">(Some features only work when signed in)</div>
                </div>
            }

        </form>
    </>
}

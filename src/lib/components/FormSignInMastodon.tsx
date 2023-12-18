import {useEffect, useState} from "react";
import clsx from "clsx";
import {useDispatch, useSelector} from "react-redux";
import {useForm} from "react-hook-form";
import {useRouter} from "next/router";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function FormSignInMastodon () {
    const router = useRouter();

    const [busy, setBusy] = useState(false);

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


    return <>
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
            <h1 className="mt-3 text-center text-lg font-bold text-dark_theme-T0 ">
                <span>Login with an existing Mastodon Account</span>
            </h1>
        </div>

        <form className="space-y-4"
              onSubmit={(e) => {
                  clearErrors();
                  trigger();
                  console.log("submit");
                  handleSubmit(async (data:any) => {
                      if (busy) {
                          console.log("duplicate submit")
                          return;
                      }
                      console.log("actual submit", data);
                      const {service} = data;
                      const response = await fetch(`/api/mastodon-server?server=${service}`);
                      if (response.ok) {
                          const {client_id} = await response.json();
                          const url = new URL(`https://${service}/oauth/authorize`);
                          url.searchParams.append('response_type', "code");
                          url.searchParams.append('client_id', client_id);
                          url.searchParams.append('redirect_uri', `${BASE_URL}/api/oauth-callback/${service}`);
                          url.searchParams.append('scope', "read write push");
                          url.searchParams.append('force_login', String(true));
                          await router.push(url);
                      } else {
                          console.log(response);
                      }
                      setBusy(false);
                  })(e).catch(err => {
                      setBusy(false);
                  });
              }}>
            <div>
                <label htmlFor="domain" className="block text-sm font-medium text-theme_dark-T1">
                    Server (e.g. mstdn.social or mastodon.social)
                </label>
                <div className="mt-1 flex place-items-center">
                    <input
                        type="text"
                        className={clsx("appearance-none block w-full px-3 py-2",
                            errors.service && "border-red-600",
                            "border-2 border-gray-300 rounded-md shadow-sm placeholder-gray-400",
                            "focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm")}
                        placeholder="mastodon.social"
                        {...register("service", {
                            required: `Server is required`,
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
            <div>
                <button
                    type="submit"
                    className={
                        clsx("w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
                            "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500")
                    }>
                    Login at Server
                </button>
            </div>
        </form>
    </>
}

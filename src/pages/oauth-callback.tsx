import {errorResponse} from "@/lib/utils/next-response";
import {getProfile, parseProfile} from "@/lib/utils/mastodon/mastodon";
import {useEffect} from "react";
import {useRouter} from "next/router";
export const runtime = 'experimental-edge';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DB_URL = "https://us-west-2.aws.data.mongodb-api.com/app/data-xvyjs/endpoint/";
const DB_HEADERS ={
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.DB_API_KEY,
};
export async function getServerSideProps({query}) {
    const {code, server} = query;
    if (code && server) {
        let response = await fetch(`${DB_URL}get_fedi_oauth?server=${server}`, {headers: DB_HEADERS});
        if (!response.ok) {
            console.log(response);
            console.log("error1");
            return errorResponse(400, "An unexpected error occurred.");
        }

        const {client_id, client_secret} = await response.json();

        const form = new FormData();
        form.append("grant_type", "authorization_code");
        form.append("code", code);
        form.append("client_id", client_id);
        form.append("client_secret", client_secret);
        form.append("redirect_uri", `${BASE_URL}/api/oauth-callback/${server}`);
        form.append("scope", "read write push");

        response = await fetch(`https://${server}/oauth/token`, {
            method:"POST",
            body: form
        });

        if (!response.ok) {
            console.log(response);
            console.log("error2");
            return errorResponse(400, "An unexpected error occurred.");
        }

        const result = await response.json();
        console.log(result);
        const {access_token} = result;

        let profile = await getProfile(server, access_token);
        if (!profile) {
            console.log(profile);
            console.log("error3");
            return errorResponse(400, "An unexpected error occurred.");
        }
        console.log(profile);
        profile = parseProfile(profile, server);

        return {props: {server, access_token, profile}};
    }

    return {props: {}};
}

export default function Main ({server, access_token, profile}) {
    const router = useRouter();
    useEffect(() => {
        console.log("got", server, access_token, profile);
        if (server && access_token && profile) {

        }

        router.replace("/");
    }, [server, access_token, profile]);
    return <div>
        <div>Redirecting...</div>
        <div></div>
    </div>
}
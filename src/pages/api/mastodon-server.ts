import {NextRequest, NextResponse} from "next/server"
import {errorResponse} from "@/lib/utils/next-response";

export const runtime = 'edge';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const DB_URL = "https://us-west-2.aws.data.mongodb-api.com/app/data-xvyjs/endpoint/";
const DB_HEADERS ={
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.DB_API_KEY,
};

export default async function handler(req: NextRequest) {
    const {method, nextUrl:{search}} = req;
    const urlSearchParams = new URLSearchParams(search.slice(1));
    const {server} = Object.fromEntries(urlSearchParams.entries());
    console.log("trigger", server);
    // Check if server credentials already exists, if not then createApp
    if (method === "GET") {
        let response = await fetch(`${DB_URL}get_fedi_oauth?server=${server}`, {headers: DB_HEADERS});
        if (!response.ok) {
            console.log(response);
            console.log("error1");
            return errorResponse(400, "An unexpected error occurred.");
        }

        let credentials = await response.json();
        if (!credentials) {
            const form = new FormData();
            form.append("client_name", "Test");
            form.append("redirect_uris", `${BASE_URL}/api/oauth-callback/${server}`);
            form.append("scopes", "read write push");

            response = await fetch(`https://${server}/api/v1/apps`, {
                method: "POST",
                body: form
            });
            if (!response.ok) {
                console.log(response);
                console.log("error1");
                return errorResponse(400, "An unexpected error occurred.");
            }
            const createdData = await response.json();
            const {client_id, client_secret} = createdData;
            console.log({client_id, client_secret});
            response = await fetch(`${DB_URL}set_fedi_oauth?server=${server}&client_id=${client_id}&client_secret=${client_secret}`, {
                method:"POST",
                headers: DB_HEADERS
            });

            if (!response.ok) {
                console.log(response);
                console.log("error2");
                return errorResponse(400, "An unexpected error occurred.");
            }
            credentials = await response.json();
        }

        if (!credentials) {
            console.log("error3");
            return errorResponse(400, "An unexpected error occurred.");
        }
        const {client_id} = credentials;
        console.log("return", credentials);

        return new NextResponse(JSON.stringify({client_id}), {
            status: 200,
            headers: {
                'Content-Type': "application/json",
                "Cache-Control": "public, s-maxage=10, stale-while-revalidate"
            }
        });
    }
    return errorResponse(404, "Unknown path");
}

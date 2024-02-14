import {NextRequest, NextResponse} from "next/server";
import {errorResponse} from "@/lib/utils/next-response";
export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const DB_URL = "https://us-west-2.aws.data.mongodb-api.com/app/data-xvyjs/endpoint/";
const DB_HEADERS ={
    'Access-Control-Request-Headers': '*',
    'api-key': process.env.DB_API_KEY,
};
export default async function handler(req: NextRequest) {
    const {method, nextUrl:{search}, url} = req;
    const urlSearchParams = new URLSearchParams(search.slice(1));
    const obj = Object.fromEntries(urlSearchParams.entries());
    console.log(obj);
    const {slug:server, code, error, error_description} = obj;
    console.log("trigger", server);
    console.log("code", code);
    // Check if server credentials already exists, if not then createApp
    if (method === "GET") {
         console.log("GET!");
        if (error) {
            console.log(error, error_description);
            return errorResponse(400, error_description);
        } else if (code && server) {
            console.log("server");
            const toUrl = new URL(`${BASE_URL}/oauth-callback`, url);
            toUrl.searchParams.append("server", server);
            toUrl.searchParams.append("code", code);
            console.log(toUrl.toString());
            return NextResponse.redirect(toUrl);
        }
    }

    return errorResponse(400, "An unexpected error occurred.");
}

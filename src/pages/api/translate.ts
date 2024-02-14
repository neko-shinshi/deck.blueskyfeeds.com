import {NextRequest, NextResponse} from "next/server";
import {errorResponse} from "@/lib/utils/next-response";

export const runtime = 'edge';
export default async function handler(req: NextRequest) {
    // Check if server credentials already exists, if not then createApp
    if (req.method !== "POST") {
        return errorResponse(404, "Unknown path");
    }
    try {
        const {text, toLang} = await req.json();
        const formObj = {text, target_lang:toLang};

        let formBody:string[] = [];
        for (const [key, value] of Object.entries(formObj)) {
            const encodedKey = encodeURIComponent(key);
            const encodedValue = encodeURIComponent(value);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        const body = formBody.join("&");
        const config = {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`
            },
            body
        };

        const response = await fetch("https://api-free.deepl.com/v2/translate", config);
        if (response.ok) {
            const {translations} = await response.json();
            return new NextResponse(JSON.stringify({translations}), {
                status: 200,
                headers: {
                    'Content-Type': "application/json",
                    "Cache-Control": "public, s-maxage=10, stale-while-revalidate"
                }
            });
        } else {
            console.log("bad response", response);
        }

    } catch (e) {
        console.log("err", e);
    }
    return errorResponse(400, "Bad Request");
}
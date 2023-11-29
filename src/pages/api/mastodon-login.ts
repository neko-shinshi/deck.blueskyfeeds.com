import {NextRequest, NextResponse} from "next/server"
export const runtime = 'edge';

const createApp = async (serverUrl:string) => {
    const form = new FormData();
    form.append("client_name", "Deck BlueskyFeeds");
    form.append("redirect_uris", "https://deck.blueskyfeeds.com ");
    form.append("scopes", "read write push");
    try {
        const response = await fetch(`https://${serverUrl}/api/v1/apps`, {
            method: "POST",
            body: form
        });
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.log(e);
    }
}
export default async function handler(req: NextRequest) {
    const {method, nextUrl:{search}} = req;
    if (method === "POST") {
        const json = await req.json();
        return new NextResponse(JSON.stringify({ok:1, ...json}), {
            status: 200,
            headers: {
                'Content-Type': "application/json",
                "Cache-Control": "public, s-maxage=10, stale-while-revalidate"
            }
        });
    }
    return new NextResponse(
        JSON.stringify(
            {
                statusCode: 400,
                message: "An unexpected error occurred."
            }
        ),
        {
            status: 400,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate"
            }
        }
    );
}

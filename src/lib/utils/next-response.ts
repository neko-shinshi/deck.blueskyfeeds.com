import {NextResponse} from "next/server";

export const errorResponse = (status:number, message:string) => {
    return new NextResponse(JSON.stringify({status, message}),
        {
            status,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate"
            }
        });
}
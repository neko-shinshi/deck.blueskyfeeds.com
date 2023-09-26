import "next-auth";

declare module "next-auth" {
    interface User {
        name: string
        role: string
        id: string
        v: number
        p: string
        sk: { key:string, expiry:number }
        pId?:string | null
    }

    interface Session {
        user: User;
        error?: string
    }
}
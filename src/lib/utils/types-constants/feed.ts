import {UserInteraction} from "@/lib/utils/types-constants/user-interaction";

export interface Feed {
    uri: string
    displayName: string
    description: string
    likeCount: number
    avatar: string
    creator: string
    indexedAt: string
    // Custom flags
    saved?: boolean
    pinned?: boolean
    custom?: boolean
    likes: UserInteraction[]
}

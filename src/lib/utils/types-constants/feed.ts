import {UserInteraction} from "@/lib/utils/types-constants/user-interaction";
import {TimestampedType} from "@/lib/utils/types-constants/timestamped-type";

export interface Feed extends TimestampedType {
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
    lastTs: number
}

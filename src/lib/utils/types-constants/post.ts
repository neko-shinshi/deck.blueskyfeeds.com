import {UserInteraction} from "@/lib/utils/types-constants/user-interaction";
import {TimestampedType} from "@/lib/utils/types-constants/timestamped-type";

export interface TextPart {
    text: string,
    facet?: PostFacet
}



export interface Post extends TimestampedType {
    uri: string
    cid: string // needed to like, repost etc
    textParts?: TextPart[]
    text: string
    authorDid: string
    labels: string[]
    tags: string[] // Max 8
    langs: string[] // Max 3
    indexedAt: number // post's timestamp
    replyCount: number
    repostCount: number
    likeCount: number
    embed?: PostEmbed
    reposterDid?: string
    replyTo?: string
    parentUri?:string
    myLikes: UserInteraction[]
    myReposts: UserInteraction[]
    lastTs: number
}


// FACETS
export interface PostFacet {
    type: "Tag" | "Link" | "Mention",
}

export interface PostFacetTag extends PostFacet {
    type: "Tag",
    tag: string
}

export interface PostFacetLink extends PostFacet {
    type: "Link"
    uri: string // fetch data from here instead of trusting bluesky
}

export interface PostFacetMention extends PostFacet {
    type: "Mention"
    did: string // fetch data instead of trusting bluesky
}

// EMBEDS
export interface PostEmbed {
    type: "Images" | "External" | "RecordWithMedia" | "Record"
}

export interface PostEmbedImages extends PostEmbed {
    type: "Images"
    images: { thumb:string, fullsize:string, alt:string }[] // Max 4
}

export interface PostEmbedExternal extends PostEmbed {
    type: "External"
    url: string // fetch data from here instead of trusting bluesky
    title: string
    description: string
    thumb: string
}

export interface Record {
    type: "Post" | "Feed" | "List" | "Deleted" | "Blocked"
    uri: string
}

export interface RecordPost extends Record {
    type: "Post"
    authorDid: string
    text: string
    labels: string[]
    indexedAt: number
    embed?: PostEmbed
}

export interface RecordFeed extends Record {
    type: "Feed"
    avatar: string
    displayName: string
    description: string
    likeCount: number
}

export interface RecordList extends Record {
    type: "List"
    avatar: string
    authorDid:string
    name:string
    purpose:string
    textParts: TextPart[]
}


export interface PostEmbedRecord extends PostEmbed {
    type: "Record"
    record: Record
}

export interface PostEmbedRecordWithMedia extends PostEmbed {
    type: "RecordWithMedia"
    record: Record
    media: PostEmbedExternal | PostEmbedImages
}
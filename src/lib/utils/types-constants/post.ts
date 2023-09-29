// POST
export interface Post {
    authorUri: string
    replyUris: string[]
    repostUris: string[]
    likeUris: string[]
    text: string
    lang: string[]
    labels: string[]
    parentUri: string
    rootUri: string
    facets: PostFacet[]
    embeds: PostEmbed[]
    postTs: number // post's timestamp
    lastTs: number
}

// FACETS
interface PostFacet {
    type: "Tag" | "Link",
    start: number
    end: number
}

interface PostFacetTag extends PostFacet {
    type: "Tag",
    tag: string
}

interface PostFacetLink extends PostFacet {
    type: "Link"
    url: string // fetch data from here instead of trusting bluesky
}


// EMBEDS
interface PostEmbed {
    type: "Media" | "Quote" | "Link"
}

interface PostEmbedMedia extends PostEmbed {
    type: "Media"
    url: string
    alt: string
}

interface PostEmbedRecord extends PostEmbed {
    type: "Quote"
    uri: string // download and refer to this post manually
}

interface PostEmbedLink extends PostEmbed {
    type: "Link"
    url: string // fetch data from here instead of trusting bluesky
    title: string
    description: string
    thumb: string
}

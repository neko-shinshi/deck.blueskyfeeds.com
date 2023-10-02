// POST
export interface Post {
    uri: string
    cid: string
    authorUri: string
    replyUris: string[]
    repostUris: string[]
    likeUris: string[]
    textParts: TextPart[]
    langs: string[] // Max 3
    labels: string[]
    parentUri: string
    rootUri: string
    embed: PostEmbed
    quoteUri: string
    tags: string[] // Max 8
    postTs: number // post's timestamp
    lastTs: number // last update timestamp
}

interface TextPart {
    text: string,
    facet?: PostFacet
}


// FACETS
interface PostFacet {
    type: "Tag" | "Link"| "Mention",
}

interface PostFacetTag extends PostFacet {
    type: "Tag",
    tag: string
}

interface PostFacetLink extends PostFacet {
    type: "Link"
    url: string // fetch data from here instead of trusting bluesky
}

interface PostFacetMention extends PostFacet {
    type: "Mention"
    did: string // fetch data instead of trusting bluesky
}


// EMBEDS
interface PostEmbed {
    type: "Media" | "Link"
}

interface PostEmbedMedia extends PostEmbed {
    type: "Media"
    url: string
    alt: string
}

interface PostEmbedLink extends PostEmbed {
    type: "Link"
    url: string // fetch data from here instead of trusting bluesky, put alert if different?
    title: string
    description: string
    thumb: string
}

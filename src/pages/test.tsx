import {
    getMKPEmojis, getMKPFeaturedChannels,
    getMKPLocalTimeline,
    getMKPUser, getMKPPostReactions, getMKPThread, getMKPPost, getMKPChannelPosts
} from "@/lib/utils/fediverse/misskey-public";
import {getInstancePublicTimeline, getMPPost, getMPThread} from "@/lib/utils/fediverse/mastodon-public";
import {search} from "@/lib/utils/fediverse/mastodon";
import {getAgentLogin} from "@/lib/utils/bsky/agent";

export const runtime = 'experimental-edge';
export async function getServerSideProps() {
    //getMKPFeaturedChannels("nijimiss.moe").then(r => console.log("ok"));

    //getMKPPost("nijimiss.moe",  "01HJGMXGFESAJEJ2T9T1YQ28XP").then(r => console.log("ok"));
   // search({})

    await getInstancePublicTimeline("sakurajima.social", {local:true});
    /*
    const agent = await getAgentLogin("bsky.social", "anianimals.moe@gmail.com", "vzqt-nxcd-iohi-g7io");
    const posts = await agent.getPosts({uris:[{"post":"at://did:plc:gnw4uv35o5ipdncyho277y6c/app.bsky.feed.post/3kiaeovp7fj2o"},{"post":"at://did:plc:tazrmeme4dzahimsykusrwrk/app.bsky.feed.post/3k3fiuh7zwc2g"}].map(x => x.post)});
    console.log(JSON.stringify(posts, null, 2));*/

    return {props: {}};
}

export default function Main ({}) {
    return <div>Test</div>
}
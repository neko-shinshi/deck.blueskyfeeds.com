

export const getProfile = async (server, accessToken) => {
    try {
        const response = await fetch(`https://${server}/api/v1/accounts/verify_credentials`,
            {headers: {Authorization: `Bearer ${accessToken}`}});
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const parseProfile = async(profile, localServer) => {
    const {
        acct, display_name, bot, created_at, note, avatar, avatar_static,
        header, header_static, followers_count, following_count, statuses_count,
        fields, locked, emojis
    } = profile;

    const [username, _server] = acct.split("@");

    return {
        username, display_name, bot, created_at, note, avatar, avatar_static,
        header, header_static, followers_count, following_count, statuses_count,
        fields, emojis, locked, server: _server || localServer
    }
}


const verify = async (serverUrl, accessToken) => {
    try {
        const response = await fetch(`${serverUrl}/api/v1/apps/verify_credentials`,
            {headers: {Authorization: `Bearer ${accessToken}`}});
        const result = await response.json();
        console.log(JSON.stringify(result, null, 2));

    } catch (e) {
        console.log(e);
    }
}
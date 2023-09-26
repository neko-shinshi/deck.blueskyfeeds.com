const TIMEOUT_CONNECTION_MS = 120000;

const wrapFetch = async (url, options, method, headers) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_CONNECTION_MS);
    try {
        const response = await fetch(url, {
            ...options,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            signal: controller.signal
        });
        const data = await response.json();
        return {status:response.status, data};
    } catch (e) {
        if (e.name === 'AbortError') {
            return {status: 408}
        }
        return {status:400};
    } finally {
        clearTimeout(id);
    }
}

const globalHelper = async (url, options, method) => {
    return await wrapFetch(url, options, method, {...(options.headers || {})});
}

const localHelper = async (url, options, method) => {
    return await wrapFetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, options, method, {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(options.headers || {})
    });
}


export const globalPost = async (url, options) => {
    const body = options.body? {body: JSON.stringify(options.body)} : {};
    return await globalHelper(url, {...options, body}, "POST");
}

export const globalGet = async (url, options) => {
    return await globalHelper(url, options, "GET");
}

export const localPost = async (url, options) => {
    const body = options.body? {body: JSON.stringify(options.body)} : {};
    return await localHelper(url, {...options, body}, "POST");
}


export const paramsToEncodedString = (params) => {
    const entries = Object.entries(params);
    const res = entries.length === 0? "" : `?${entries.map(([key, val]) => `${key}=${encodeURIComponent(val as string)}`).join('&')}`;
    return res;
}
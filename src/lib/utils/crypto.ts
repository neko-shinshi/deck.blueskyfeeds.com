export const makeKey = async () => {
    const keyObj = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"],
    );

    const exported = await crypto.subtle.exportKey("raw", keyObj);
    const exportedKeyBuffer = new Uint8Array(exported);
    const decoder = new TextDecoder('utf8');
    const b64encoded = btoa(decoder.decode(exportedKeyBuffer));
    return b64encoded;
}

export const parseKey = async (keyString) => {
    const keyBuffer = new Uint8Array(atob(keyString).split("").map(function(c) {
        return c.charCodeAt(0); }));
    return window.crypto.subtle.importKey("raw", keyBuffer, "AES-GCM", true, [
        "encrypt",
        "decrypt",
    ]);
}
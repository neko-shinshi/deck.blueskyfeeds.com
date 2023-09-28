const uint8ArrayToBase64String = (arr) => {
   return btoa(String.fromCharCode(...arr));
}

const base64StringToUint8Array = (str) => {
    return new Uint8Array(atob(str).split("").map(function(c) {
        return c.charCodeAt(0); }));
}

export const makeKey = async () => {
    const keyObj = await crypto.subtle.generateKey({name: "AES-GCM", length: 256,},
        true, ["encrypt", "decrypt"]);
    const exported = await crypto.subtle.exportKey("raw", keyObj);
    return uint8ArrayToBase64String(new Uint8Array(exported));
}

export const parseKey = async (keyString) => {
    const keyBuffer = base64StringToUint8Array(keyString);
    return crypto.subtle.importKey("raw", keyBuffer, "AES-GCM",
        true, ["encrypt", "decrypt"]);
}

export const encrypt = async (key, messageString) => {
    const enc = new TextEncoder();
    const encoded = enc.encode(messageString);
    // iv will be needed for decryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ivString = uint8ArrayToBase64String(iv);
    const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);
    const cipherString = uint8ArrayToBase64String(new Uint8Array(cipherBuffer));
    return `${cipherString}|${ivString}`;
}

export const decrypt = async (key, cipherText) => {
    const [cipherString, ivString] = cipherText.split("|");
    const iv = base64StringToUint8Array(ivString);
    const cipherBuffer = base64StringToUint8Array(cipherString);
    const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBuffer);
    return String.fromCharCode(...new Uint8Array(plainBuffer));
}
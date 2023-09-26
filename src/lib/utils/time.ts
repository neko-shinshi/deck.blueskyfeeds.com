export const timeAfter = ms => {
    const expireAt = new Date();
    expireAt.setTime(expireAt.getTime() + ms);
    return expireAt;
}

export const tsToHHMMSS = ts => {
    const p2 = ts.toString();
    return {
        hh: (parseInt(p2.slice(-6, -4)) | 0).toString().padStart(2,"0"),
        mm: (parseInt(p2.slice(-4, -2)) | 0).toString().padStart(2,"0"),
        ss: (parseInt(p2.slice(-2)) | 0).toString().padStart(2,"0"),
    }
}
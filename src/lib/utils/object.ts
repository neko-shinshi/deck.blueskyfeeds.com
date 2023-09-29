export const getPathOfObject = (o, path) => {
    let oo = o;
    path.split(".").forEach(x => {
        if (!oo) {
            return null;
        }
        oo = oo[x];
    });
    return oo;
}

export const setPathOfObject = (o, path, v) => {
    const pathO = path.split(".");
    while(pathO.length > 1){
        o = o[pathO.shift()];
    }
    o[pathO.shift()] = v;
}

export const objectToDotNotation = (o, header=null) => {
    const headerString = !header? "": `${header}.`;
    let l = [];

    for (const [key, value] of Object.entries(o)) {
        if (typeof value === 'object' && value !== null) {
            l.push(...objectToDotNotation(value, `${headerString}${key}`));
        } else {
            const newKey = `${headerString}${key}`;
            let newO = {};
            newO[newKey] = value;
            l.push(newO);
        }
    }
    return l;
}
import {basicAnimalTypes, basicAnimalTypesJp} from "@/lib/utils/constants";

const localizeAnimalType = (animal, locale) => {
    switch (locale) {
        case "en":  return animal;
        case "jp":  return basicAnimalTypesJp[basicAnimalTypes.indexOf(animal)];
    }
}

export const getLocalAnimeTitle = (animeObj, locale="en") => {
    if (!animeObj) {
        return "";
    }

    if (animeObj.names && animeObj.names[locale] && animeObj.names[locale].length > 0) {
        return animeObj.names[locale][0];
    }

    const titleObj = animeObj.title;

    switch (locale) {
        case "en":  return titleObj.english || titleObj.romaji || titleObj.native;
        case "jp":  return titleObj.native || titleObj.romaji || titleObj.english;
    }
}


export const getAnimalNamesAndTitle = (animalData, titleObj, locale) => {
    const animals = getAnimalNamesFromAnime(animalData, locale);
    const title = getLocalAnimeTitle(titleObj, locale);
    switch (locale) {
        case "en":  return `${animals} from ${title}`;
        case "jp":  return `『${title}』の${animals}`;
    }
}

export const getAnimalNames = (animal) => {
    return [...new Set([...(animal.names.en || []), ...(animal.names.jp || [])])];
}
export const getAnimalTags = (animal) => {
    return [...new Set([...(animal.tags.en || []), ...(animal.tags.jp || [])])];
}

export const getSceneTags = (scene) => {
    return [...new Set([...(scene.tags.en || []), ...(scene.tags.jp || [])])];
}

export const getAnimalNamesFromAnime = (animalsArray, locale="en") => {
    const countNames = new Map();
    let names = animalsArray.map(x => x.names && x.names.en && x.names.en[0] || localizeAnimalType(x.type, locale));
    names.forEach(x => {
        countNames.set(x, 1 + (countNames.get(x) || 0));
    });
    names = [...new Set(names)].map(x => {
        if (countNames.get(x) > 1) {
            switch (locale) {
                case "en":  return `${x}s`;
                case "jp": return `${x}たち`;
            }
        }
        return x;
    });

    switch (locale) {
        case "en":  return names.join(", ");
        case "jp": return names.join("と");
    }
}

export const getTimestampFromScene = (sceneData) => {
    return `${sceneData.ts.hh === "00"? "" : `${sceneData.ts.hh}:`}${sceneData.ts.mm}:${sceneData.ts.ss}`;
}

export function removeUndefined(obj, nullInstead=false) {
    if (typeof obj === "object") {
        Object.keys(obj).forEach(function (key) {
            // Get this value and its type
            var value = obj[key];
            var type = typeof value;
            if (type === "object" && value !== null) {
                // Recurse...
                removeUndefined(value, nullInstead);
                // ...and remove if now "empty" (NOTE: insert your definition of "empty" here)
                if (!nullInstead) {
                    if (!Object.keys(value).length) {
                        delete obj[key]
                    }
                }
            } else if (type === "undefined") {
                // Undefined, remove it
                if (nullInstead) {
                    obj[key] = null;
                } else {
                    delete obj[key]
                }
            }
        });
    }
    return obj;
}
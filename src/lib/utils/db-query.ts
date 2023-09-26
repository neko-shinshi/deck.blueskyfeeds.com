import {globalGet} from "@/lib/utils/network";

// Note: Update these in database func also
export const SCENES_PER_PAGE = 12;
export const ANIMES_PER_PAGE = 12;
export const ANIMALS_PER_PAGE = 12;

const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === "1";
const dbQuery = async (endpoint:string) => {
    const url = `https://us-west-2.aws.data.mongodb-api.com/app/data-xvyjs/endpoint/${endpoint}`;
    console.log(url);
    return await globalGet(url, {
        headers: {
            'Access-Control-Request-Headers': '*',
            'api-key': process.env.DB_API_KEY,
        },
    });
}

export const scenesGetPage = async (query) => {
    const {page:_page} = query;
    const page = parseInt(_page) || 1;
    if (isNaN(page) || `${page}` !== _page) {{ return { status: 404} }}
    const {status, data} = await dbQuery(`get_scene_page?p=${page}`);
    return {status, data:{...data, page}};
}

export const sceneGet = async (idScene:string) => {
    const debugQuery = DEBUG_MODE? "&debug=1" : "";
    return await dbQuery(`get_scene?id=${idScene}${debugQuery}`);
}


export const animeGetPage = async (query) => {
    const {page:_page, sort} = query;
    const page = parseInt(_page);
    if (isNaN(page) || `${page}` !== _page) {{ return { status: 404} }}

    const {status, data} = await dbQuery(`get_anime_page?p=${page}`);
    return {status, data:{...data, page}};
}

export const animeGet = async (idAnime:string) => {
    const debugQuery = DEBUG_MODE? "&debug=1" : "";
    return await dbQuery(`get_anime?id=${idAnime}${debugQuery}`);
}


export const animalGetPage = async (query) => {
    const {page:_page, type} = query;
    const page = parseInt(_page);
    if (isNaN(page) || `${page}` !== _page) {{ return { status: 404} }}
    const typeQuery = type? `&type=${type}` : "";
    const {status, data} = await dbQuery(`get_animal_page?p=${page}${typeQuery}`);
    return {status, data:{...data, page}};
}

export const animalGet = async (idAnimal:string) => {
    const debugQuery = DEBUG_MODE? "&debug=1" : "";
    return await dbQuery(`get_animal?id=${idAnimal}${debugQuery}`);
}


export const rssGet = async (animal?:string) => {
    const typeString = animal? `?animal=${animal}` : "";
    return await dbQuery(`get_rss${typeString}`);
}
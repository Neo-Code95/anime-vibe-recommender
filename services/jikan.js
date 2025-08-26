//build a function to call jikan API
import axios from "axios";
import express from "express";
import { fileURLToPath, pathToFileURL } from 'url';

const API_URL = "https://api.jikan.moe/v4/anime";
const app = express();

app.post("/", async (req, res) => {
    try {
        const result = await axios.get(API_URL + "?q=")
    } catch (error) {
        
    }
});

export async function searchAnimeByTitle(title) {
    if(!title) return null;
    try {
        const { data } = await axios.get(API_URL, {
            params: {
                q: title,
                limit: 1
            }
        });
        const item = data?.data?.[0];
        if (!item) return null;

        return {
            title: item.title_english,
            score: item.score,
            episodes: item.episodes,
            image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url
        };


    } catch (error) {
        console.error("Jikan search error:", error?.response?.status);
        return null;
    };

};

// if (import.meta.url === pathToFileURL(process.argv[1]).href) {
//   const testTitle = process.argv[2] || 'Fullmetal Alchemist';
//   searchAnimeByTitle(testTitle)
//     .then(data => console.log(JSON.stringify(data, null, 2)))
//     .catch(err => {
//       console.error('[ERROR]', err.message);
//       process.exit(1);
//     });
// }
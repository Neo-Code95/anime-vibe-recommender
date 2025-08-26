import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import 'dotenv/config';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import expressLayouts from 'express-ejs-layouts';
import { analyzeVibe } from "./services/llm.js";
import { searchAnimeByTitle } from "./services/jikan.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout.ejs');

app.use(bodyParser.urlencoded( {extended: true} ));
app.use(express.static("public"));
app.use(rateLimit({ windowMs: 60_000, nax: 60 }));
app.use(morgan("dev"));

// homepage

app.get("/", (req, res) => {
    res.render("index.ejs", {
        error: null,
        favourite: null,
        vibe_profile: null,
        recs: [],
        notes: ""
    });
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

app.post("/recommend", async (req, res, next) => {
    try {
        const favTitle = (req.body.title || "").trim();
        if(!favTitle) {
            return res.render("index.ejs", {
                error: "Please enter an anime name.",
                favourite: null,
                vibe_profile: null,
                recs: [],
                notes: ""
            });
        }

         //1. Ask for LLM recs
        const vibe = await analyzeVibe(favTitle);
        const rawRecs = (vibe?.recommendations || []).slice(0,3);


        //2. Enrich with Jikan API
        const favourite = await searchAnimeByTitle(favTitle);
        await delay(1000)
        const recs = await Promise.all(
            rawRecs.map(async r => {
                const jikanData = await searchAnimeByTitle(r.title);
                return {
                    ...r,
                    jikan: jikanData
                };
            })
        );
        console.log(recs)

        //3. Render
        res.render("index.ejs", {
            error: null,
            favourite,
            vibe_profile: vibe?.input_anime?.vibe_profile || null,
            recs,
            notes: vibe?.notes || ""
        });


    } catch (error) {
        next(error);
    }
})


// Error handling
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send("Something went wrong.");
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

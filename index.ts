import express, { Express, Request, Response } from "express";
import * as bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";

import LineApi from "./utils/line_api";

dotenv.config();

import fs from 'fs';
let profile_json = JSON.parse(fs.readFileSync('profile.json', 'utf8'));
console.log("profile.json : " + JSON.stringify(profile_json));
console.log('count : ' + profile_json.data.length);

const app: Express = express();
const port = process.env.PORT || 3900;
console.log("ENV -> PORT : " + port);
const browser_path = process.env.BROWSER_PATH || '';
console.log("ENV -> BROWSER_PATH : " + browser_path);

const bodyparser = bodyParser;

const line_bot = new LineApi();

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());
app.use(cors());

async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server + BotLine API");
});

app.get("/api/select_profile", async (req, res) => {
    res.json({
        "code": 200,
        profile_json
    })
});

app.post("/api/start_line", async (req, res) => {
    try {
        console.log('id : ' + req.body.id);
        let profile_name = '';
        let profile_path = '';

        if (req.body.id > 0) {
            for (let i=0; i<profile_json.data.length; i++) {
                if (parseInt(profile_json.data[i].id) === parseInt(req.body.id)) {
                    profile_name = profile_json.data[i].profile_name;
                    profile_path = profile_json.data[i].profile_path;
                    break;
                }
            }
        } else {
            profile_name = req.body.profile_name;
            profile_path = req.body.profile_path;
        }

        console.log('profile name : ' + req.body.profile_name);
        console.log('profile path : ' + req.body.profile_path);

        // @ts-ignore
        await line_bot.InitialLine(profile_name, profile_path, browser_path);

        res.json({
            "code": 200,
            message: "start line finished"
        })
    } catch (e: any) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "start line fail!"
        })
    }
});

app.post("/api/login", async (req, res) => {
    try {
        console.log('user name : ' + req.body.user_name);
        console.log('password : ' + req.body.password);

        if (req.body.user_name === 'admin' && req.body.password === "ab1234cd") {
            res.json({
                "code": 200,
                token : "AD78CE39LJ24YT02QM41VX68"
            })
        } else {
            res.json({
                message: "not authen"
            })
        }
    } catch (e: any) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "login fail!"
        })
    }
});

app.post("/api/reply_message", async (req, res) => {
    try {
        let response_message: string = "";
        if (req.body.data.length === 1) {
            response_message = await line_bot.reply_message(req.body.data[0].user_line, req.body.message);
        } else {
            response_message = "Please call : /api/reply_message_batch for batch command.";
        }
        res.json({
            "code": 200,
            message : response_message
        })
    } catch (e: any) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "reply_message fail"
        })
    }
});

app.post("/api/reply_message_batch", async (req, res) => {
    let response_message: string = "work in process.";
    try {
        if (req.body.data.length >= 1) {
            let limit_batch = 10;
            for (let i=0; i<req.body.data.length; i++) {
                limit_batch--;
                console.log("batch process : " + (i+1) + "/" + req.body.data.length);
                console.log("item -> ("+(i+1)+") : " + req.body.data[i].user_line);
                await line_bot.reply_message(req.body.data[i].user_line, req.body.message);
                if (limit_batch <= 1) {
                    console.log("     *** Wait for (1 minute) in next batch process : " + (i+1) + "/" + req.body.data.length);
                    limit_batch = 10;
                    await delay(1000 * 60);
                }
            }
        } else {
            response_message = "Please call : /api/reply_message for single command.";
        }
    } catch (e: any) {
        console.log(e.message);
        response_message = "reply message fail!";
    }
    res.json({
        "code": 200,
        message : response_message
    })
});

app.post("/api/user_list", async (req, res) => {
    let data = await line_bot.get_user_list();
    res.json({
        "code": 200,
        data : data
    })
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

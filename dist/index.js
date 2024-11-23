"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bodyParser = __importStar(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const line_api_1 = __importDefault(require("./utils/line_api"));
dotenv_1.default.config();
const fs_1 = __importDefault(require("fs"));
let profile_json = JSON.parse(fs_1.default.readFileSync('profile.json', 'utf8'));
console.log("profile.json : " + JSON.stringify(profile_json));
console.log('count : ' + profile_json.data.length);
const app = (0, express_1.default)();
const port = process.env.PORT || 3900;
console.log("ENV -> PORT : " + port);
const browser_path = process.env.BROWSER_PATH || '';
console.log("ENV -> BROWSER_PATH : " + browser_path);
const bodyparser = bodyParser;
const line_bot = new line_api_1.default();
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use((0, cors_1.default)());
function delay(time) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, time));
    });
}
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server + BotLine API");
});
app.get("/api/select_profile", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        "code": 200,
        profile_json
    });
}));
app.post("/api/start_line", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('id : ' + req.body.id);
        let profile_name = '';
        let profile_path = '';
        if (req.body.id > 0) {
            for (let i = 0; i < profile_json.data.length; i++) {
                if (parseInt(profile_json.data[i].id) === parseInt(req.body.id)) {
                    profile_name = profile_json.data[i].profile_name;
                    profile_path = profile_json.data[i].profile_path;
                    break;
                }
            }
        }
        else {
            profile_name = req.body.profile_name;
            profile_path = req.body.profile_path;
        }
        console.log('profile name : ' + req.body.profile_name);
        console.log('profile path : ' + req.body.profile_path);
        // @ts-ignore
        yield line_bot.InitialLine(profile_name, profile_path, browser_path);
        res.json({
            "code": 200,
            message: "start line finished"
        });
    }
    catch (e) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "start line fail!"
        });
    }
}));
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('user name : ' + req.body.user_name);
        console.log('password : ' + req.body.password);
        if (req.body.user_name === 'admin' && req.body.password === "ab1234cd") {
            res.json({
                "code": 200,
                token: "AD78CE39LJ24YT02QM41VX68"
            });
        }
        else {
            res.json({
                message: "not authen"
            });
        }
    }
    catch (e) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "login fail!"
        });
    }
}));
app.post("/api/reply_message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response_message = "";
        if (req.body.data.length === 1) {
            response_message = yield line_bot.reply_message(req.body.data[0].user_line, req.body.message);
        }
        else {
            response_message = "Please call : /api/reply_message_batch for batch command.";
        }
        res.json({
            "code": 200,
            message: response_message
        });
    }
    catch (e) {
        console.log(e.message);
        res.json({
            "code": 200,
            message: "reply_message fail"
        });
    }
}));
app.post("/api/reply_message_batch", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let response_message = "work in process.";
    try {
        if (req.body.data.length >= 1) {
            let limit_batch = 10;
            for (let i = 0; i < req.body.data.length; i++) {
                limit_batch--;
                console.log("batch process : " + (i + 1) + "/" + req.body.data.length);
                console.log("item -> (" + (i + 1) + ") : " + req.body.data[i].user_line);
                yield line_bot.reply_message(req.body.data[i].user_line, req.body.message);
                if (limit_batch <= 1) {
                    console.log("     *** Wait for (1 minute) in next batch process : " + i + 1 + "/" + req.body.data.length);
                    limit_batch = 10;
                    yield delay(1000 * 60);
                }
            }
        }
        else {
            response_message = "Please call : /api/reply_message for single command.";
        }
    }
    catch (e) {
        console.log(e.message);
        response_message = "reply message fail!";
    }
    res.json({
        "code": 200,
        message: response_message
    });
}));
app.post("/api/user_list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = yield line_bot.get_user_list();
    res.json({
        "code": 200,
        data: data
    });
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

"use strict";
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
const puppeteer_1 = __importDefault(require("puppeteer"));
function delay(time) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => setTimeout(resolve, time));
    });
}
class LineApi {
    constructor() {
    }
    InitialLine(profile_name, profile_path, browser_path) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('***** Start InitialLine *****');
            console.log('***** profile name : ' + profile_name);
            console.log('***** profile path : ' + profile_path);
            console.log('***** browser path : ' + browser_path);
            try {
                (_a = this.browser) === null || _a === void 0 ? void 0 : _a.close();
                this.browser = yield puppeteer_1.default.launch({
                    headless: false,
                    userDataDir: profile_path,
                    ignoreHTTPSErrors: true,
                    executablePath: browser_path,
                    defaultViewport: null,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox'
                    ]
                });
                // Default Tab
                this.page = (yield this.browser.pages())[0];
                yield this.page.goto('https://manager.line.biz');
                // Wait for manual login scan barcode
                console.log("Wait for manual login scan barcode 5 minute.");
                yield delay(1000 * 60);
                yield this.ClickLogin();
                yield this.ClickLoginUser();
                yield this.SelectUserLine();
                yield this.ClickTabChat();
                yield (yield this.browser.pages())[0].close();
                this.page = (yield this.browser.pages())[0];
                this.html_list = yield this.getHtmlList();
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    ClickLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const tmpClick = yield this.page.$x('/html/body/div[2]/div/div[3]/div/form/div/input');
                // @ts-ignore
                yield this.page.evaluate(a => a.click(), tmpClick[0]);
                yield delay(5000);
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    ClickLoginUser() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const tmpClick = yield this.page.$x('//*[@id="app"]/div/div/div/div/div/div[2]/div/div[3]/button');
                // @ts-ignore
                yield this.page.evaluate(a => a.click(), tmpClick[0]);
                yield delay(5000);
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    SelectUserLine() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const tmpClick = yield this.page.$x('//*[@id="contents"]/div/main/div/section/div/div[2]/table/tbody/tr/td[1]/a/div/div[2]');
                // @ts-ignore
                yield this.page.evaluate(a => a.click(), tmpClick[0]);
                yield delay(5000);
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    ClickTabChat() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const tmpClick = yield this.page.$x('//*[@id="nav"]/div/ul[1]/li[7]/a');
                // @ts-ignore
                yield this.page.evaluate(a => a.click(), tmpClick[0]);
                yield delay(5000);
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    getHtmlList() {
        return __awaiter(this, void 0, void 0, function* () {
            let line_list;
            try {
                // @ts-ignore
                line_list = yield this.page.$x('//div[@class="list-group list-group-flush"]/div/a');
            }
            catch (e) {
                console.log(e.message);
            }
            return line_list;
        });
    }
    getDataChatID(html) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                return yield this.page.evaluate(el => el.innerHTML, yield html.$('.mb-0'));
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    reply_message(user_line, reply_msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.html_list = yield this.getHtmlList();
                let found_line = false;
                for (let i = 0; i < this.html_list.length; i++) {
                    let user = yield this.getDataChatID(this.html_list[i]);
                    console.log(user);
                    if (user_line === user) {
                        yield this.gotoCurrentChat(this.html_list[i]);
                        found_line = true;
                        break;
                    }
                }
                if (found_line) {
                    yield delay(1000 * 2);
                    console.log("REPLY USER LINE:", user_line);
                    console.log("REPLY BOT MESSAGE:", reply_msg);
                    // @ts-ignore
                    const tmpClick = yield this.page.$x('//*[@id="editable-unit"]/div[2]/div[3]/div[2]/input');
                    // @ts-ignore
                    yield this.page.evaluate(a => a.click(), tmpClick[0]);
                    yield delay(1000);
                    // @ts-ignore
                    yield this.page.keyboard.type(reply_msg, { delay: 10 });
                    yield delay(1000);
                    // @ts-ignore
                    yield this.page.keyboard.press("Enter");
                    //await delay(1000);
                    //await this.closeChat();
                    return "sent message success";
                }
                else {
                    return "user not found!";
                }
            }
            catch (e) {
                console.log(e.message);
                return "user not found!";
            }
        });
    }
    get_user_list() {
        return __awaiter(this, void 0, void 0, function* () {
            let data_list = [];
            try {
                this.html_list = yield this.getHtmlList();
                for (let i = 0; i < this.html_list.length; i++) {
                    let user = yield this.getDataChatID(this.html_list[i]);
                    data_list.push({ user_line: user });
                }
            }
            catch (e) {
                console.log(e.message);
                return {};
            }
            return data_list;
        });
    }
    gotoCurrentChat(html) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('***** goto Current Chat *****');
            try {
                // @ts-ignore
                yield this.page.evaluate(a => {
                    // @ts-ignore
                    a.click();
                }, html);
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
    closeChat() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                this.page.click('.nav-btn.active');
            }
            catch (e) {
                console.log(e.message);
            }
        });
    }
}
exports.default = LineApi;
;

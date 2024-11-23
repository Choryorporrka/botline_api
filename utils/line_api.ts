import puppeteer from 'puppeteer';

async function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export default class LineApi {

    page: puppeteer.Page | undefined;
    browser: puppeteer.Browser | undefined;
    html_list: any;

    constructor() {
    }

    async InitialLine(profile_name: string, profile_path: string, browser_path: string) {

        console.log('***** Start InitialLine *****');
        console.log('***** profile name : ' + profile_name);
        console.log('***** profile path : ' + profile_path);
        console.log('***** browser path : ' + browser_path);

        try {
            this.browser?.close();

            this.browser = await puppeteer.launch({
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
            this.page = (await this.browser.pages())[0];

            await this.page.goto('https://manager.line.biz');

            // Wait for manual login scan barcode
            console.log("Wait for manual login scan barcode 5 minute.");
            await delay(1000 * 60);

            await this.ClickLogin();
            await this.ClickLoginUser();
            await this.SelectUserLine();
            await this.ClickTabChat();

            await (await this.browser.pages())[0].close();
            this.page = (await this.browser.pages())[0];

            this.html_list = await this.getHtmlList();

        } catch (e: any) {
            console.log(e.message);
        }
    }

    async ClickLogin() {
        try {
            // @ts-ignore
            const tmpClick = await this.page.$x('/html/body/div[2]/div/div[3]/div/form/div/input');
            // @ts-ignore
            await this.page.evaluate(a => a.click(), tmpClick[0]);
            await delay(5000);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async ClickLoginUser() {
        try {
            // @ts-ignore
            const tmpClick = await this.page.$x('//*[@id="app"]/div/div/div/div/div/div[2]/div/div[3]/button');
            // @ts-ignore
            await this.page.evaluate(a => a.click(), tmpClick[0]);
            await delay(5000);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async SelectUserLine() {
        try {
            // @ts-ignore
            const tmpClick = await this.page.$x('//*[@id="contents"]/div/main/div/section/div/div[2]/table/tbody/tr/td[1]/a/div/div[2]');
            // @ts-ignore
            await this.page.evaluate(a => a.click(), tmpClick[0]);
            await delay(5000);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async ClickTabChat() {
        try {
            // @ts-ignore
            const tmpClick = await this.page.$x('//*[@id="nav"]/div/ul[1]/li[7]/a');
            // @ts-ignore
            await this.page.evaluate(a => a.click(), tmpClick[0]);
            await delay(5000);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async getHtmlList() {
        let line_list: any;
        try {
            // @ts-ignore
            line_list = await this.page.$x('//div[@class="list-group list-group-flush"]/div/a');
        } catch (e: any) {
            console.log(e.message);
        }
        return line_list;
    }

    async getDataChatID(html: string) {
        try {
            // @ts-ignore
            return await this.page.evaluate(el => el.innerHTML, await html.$('.mb-0'));
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async reply_message(user_line: string, reply_msg: string) {
        try {

            this.html_list = await this.getHtmlList();

            let found_line: boolean = false;
            for (let i = 0; i < this.html_list.length; i++) {
                let user: string = await this.getDataChatID(this.html_list[i]);
                console.log(user)

                if (user_line === user) {
                    await this.gotoCurrentChat(this.html_list[i]);
                    found_line = true;
                    break;
                }
            }

            if (found_line) {

                await delay(1000 * 2);

                console.log("REPLY USER LINE:", user_line);
                console.log("REPLY BOT MESSAGE:", reply_msg);

                // @ts-ignore
                const tmpClick = await this.page.$x('//*[@id="editable-unit"]/div[2]/div[3]/div[2]/input');
                // @ts-ignore
                await this.page.evaluate(a => a.click(), tmpClick[0]);
                await delay(1000);
                // @ts-ignore
                await this.page.keyboard.type(reply_msg, {delay: 10});
                await delay(1000);
                // @ts-ignore
                await this.page.keyboard.press("Enter");

                //await delay(1000);
                //await this.closeChat();

                return "sent message success";
            } else {
                return "user not found!";
            }
        } catch (e: any) {
            console.log(e.message);
            return "user not found!";
        }
    }

    async get_user_list() {
        let data_list: any = [];
        try {
            this.html_list = await this.getHtmlList();

            for (let i = 0; i < this.html_list.length; i++) {
                let user: string = await this.getDataChatID(this.html_list[i]);
                data_list.push({user_line : user});
            }
        } catch (e: any) {
            console.log(e.message);
            return {}
        }

        return data_list;
    }

    async gotoCurrentChat(html: any) {
        console.log('***** goto Current Chat *****');

        try {
            // @ts-ignore
            await this.page.evaluate(a => {
                // @ts-ignore
                a.click();
            }, html);
        } catch (e: any) {
            console.log(e.message);
        }
    }

    async closeChat() {
        try {
            // @ts-ignore
            this.page.click('.nav-btn.active');
        } catch (e: any) {
            console.log(e.message);
        }
    }

};

const axios = require('axios').default;
require('dotenv').config();
const moment = require('moment')
const shopeeApi = require('./src/shopeeApi.js')
var ip_address = require("ip");
const randomUseragent = require('random-useragent');
const exec = require('child_process').exec;
mode = process.env.MODE
os_slave = process.env.OS_SLAVE
var shell = require('shelljs');
var profileDir = process.env.PROFILE_DIR
slavenumber = process.env.SLAVE
var fs = require('fs');
headless_mode = false
const {
    webkit,
    firefox,
    chromium
} = require('playwright');


login_google = async (page, accounts) => {

    username = "thienlon1923@gmail.com"
    password = "Muaha2017"
    await page.goto("https://mail.google.com")
    await page.click('[autocomplete="username"]')
    await page.waitForTimeout(1000)
    await page.type('[autocomplete="username"]', username, { delay: 100 })    // Nhập user 

    await page.click('[id="identifierNext"]')
    await page.waitForTimeout(3000)
    await page.type('[autocomplete="current-password"]', password, { delay: 100 })    // Nhập comment 
    await page.waitForTimeout(2000)
    click_next = await page.$$('[data-is-touch-wrapper="true"]')[1]

}


action_add_cart = async (page, product) => {

    let product_info = product.product_info
    product_info = JSON.parse(product_info)

    console.log(product_info)
    try {
        // Chọn màu
        if (product_info.color) {
            let check_variation = await page.evaluate(() => {
                //let check_variation = await page.$$(".product-variation--disabled")
                let check = document.querySelectorAll(".product-variation--disabled")
                let variation = []
                if (check.length) {
                    check.forEach(e => {
                        variation.push(e.textContent)
                    })
                }

                return variation
            });

            // let check_variation = await page.$$eval('.product-variation--disabled', (e) =>{

            // } divs.length >= min, 10);
            console.log("Có màu hết mẫu: " + check_variation.length)
            let check_has_variation = 0
            if (check_variation.length) {
                check_variation.forEach(async e => {
                    console.log(e)
                    if (e == product_info.size) {
                        check_has_variation = 1
                    }
                })
            }
            if (check_has_variation == 0) {
                await page.locator('[aria-label=' + product_info.color + ']').click();
                await page.waitForTimeout(5000)
                console.log(moment().format("hh:mm:ss") + " Chọn Màu OK ");
            } else {
                console.log(moment().format("hh:mm:ss") + " Hết màu :" + product_info.length);
            }
        }

        // chọn size
        if (product_info.size) {
            //let check_variation = await page.$$(".product-variation--disabled")

            let check_variation = await page.evaluate(() => {
                //let check_variation = await page.$$(".product-variation--disabled")
                let check = document.querySelectorAll(".product-variation--disabled")
                let variation = []
                if (check.length) {
                    check.forEach(e => {
                        variation.push(e.textContent)
                    })
                }

                return variation
            });

            // let check_variation = await page.$$eval('.product-variation--disabled', (e) =>{

            // } divs.length >= min, 10);
            console.log("Có size hết mẫu: " + check_variation.length)
            let check_has_variation = 0
            if (check_variation.length) {
                check_variation.forEach(async e => {
                  
                    console.log(e)
                    if (e == product_info.size) {
                        check_has_variation = 1
                    }
                })
            }
            if (check_has_variation == 0) {
                await page.locator('[aria-label=' + product_info.size + ']').click();
                await page.waitForTimeout(5000)
                console.log(moment().format("hh:mm:ss") + " Chọn Size OK ");
            } else {
                console.log(moment().format("hh:mm:ss") + " Hết size ");
            }

        }

        // Chọn phân loại hàng
        if (product_info.other) {
            console.log(moment().format("hh:mm:ss") + " Chọn phân loại ");
            await page.locator('[aria-label=' + product_info.other + ']').click();
            await page.waitForTimeout(5000)
        }

        // chọn số lượng
        await page.locator('input[role="spinbutton"]').click();
        await page.locator('input[role="spinbutton"]').fill('2');

        let check_btn_add_dard = await page.$$('button:has-text("add to cart")')

        if (check_btn_add_dard.length > 1) {
            await page.locator('button:has-text("add to cart")').first().click();
        } else {
            await page.locator('button:has-text("add to cart")').click();
        }

    } catch (error) {
        console.log(moment().format("hh:mm:ss") + " LỖI ADD CARD ");
        console.log(error)
        return 0
    }

    return 1


}



login_shopee = async (page, context, accounts) => {
    await page.waitForTimeout(3000)

    check = await page.$$('button:has-text("English")')
    if (check.length) {
        await page.locator('button:has-text("English")').click();
    }

    await page.waitForTimeout(3000)

    check = await page.$$('.shopee-popup__close-btn')
    if (check.length) {
        await page.locator('.shopee-popup__close-btn').click();
    }

    await page.waitForTimeout(3000)
    let check_login = await page.$$('text=Login')

    if (check_login.length > 0) {
        console.log(" ---- Chưa login tài khoản ----")

        // Click text=Login
        await page.locator('text=Login').click();

        await page.waitForTimeout(3000)
        // Click button:has-text("Google")
        await page.locator('button:has-text("Google")').click()
        // Fill [aria-label="Email hoặc số điện thoại"]

        await page.waitForTimeout(3000)
        page1 = (await context.pages())[1]

        await page1.locator('[aria-label="Email hoặc số điện thoại"]').fill(accounts[0]);
        // Click button:has-text("Tiếp theo")
        await page1.waitForTimeout(1000)

        await page1.locator('button:has-text("Tiếp theo")').click()

        await page1.waitForTimeout(1000)
        // Fill [aria-label="Nhập mật khẩu của bạn"]
        await page1.locator('[aria-label="Nhập mật khẩu của bạn"]').fill(accounts[1]);
        // Click button:has-text("Tiếp theo")
        await page1.waitForTimeout(1000)
        await page1.locator('button:has-text("Tiếp theo")').click()
        // Close page

        await page1.waitForTimeout(5000)
        // await page.goto('https://shopee.com.my/');

    }

    check_login = await page.$$('text=Login')
    if (check_login.length == 0) {
        console.log(" ---- check login thành công ----" + check_login.length)
        return 1
    } else {
        return 4 // Lỗi đăng nhập
    }
}

updateHistory = async (product) => {
    dataupdate = product

    update = 0

    await axios.get(save_history_url, {
        data: dataupdate,
        timeout: 5000
    },
        {
            headers: {
                Connection: 'keep-alive',
            }
        })
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });

}

updateAction = async (product9, limit) => {
    // const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

    await axios.post(update_actions_url, {
        data: product9,
        timeout: 50000
    },
        {
            // httpsAgent: httpsAgent
        })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update action: " + product9.action + " = " + response.data);
            console.log(response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update action lỗi");
            //      await updateErrorLogs(error, product9.slave)
            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                await updateAction(product9, limit)
            } else {
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật dữ liệu");
                return false
            }
        });
}

updateCookie = async (product9, limit) => {

    await axios.post(update_cookie_url, {
        data: product9,
        timeout: 50000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update cookie: " + product9.username + " = " + response.data);
            console.log(response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update cookie lỗi");

            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                //  await updateCookie(product9, limit)
            } else {
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật dữ liệu");
                return false
            }
        });
}

updatePoint = async (product9, limit) => {

    product9.cookie = "";

    await axios.get(update_point_url, {
        params: {
            data: {
                dataToServer: product9,
            }
        },
        timeout: 60000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - " + response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update point lỗi");
            await updateErrorLogs(error, product9.slave)
            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                await updatePoint(product9, limit)
            } else {
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật dữ liệu điểm số");

                return false
            }
        })
}

updateActions = async (product9, limit) => {
    await updateAction(product9, limit)
    await updatePoint(product9, limit)

}

action_heart_product = async (page) => {
    try {
        console.log("--- thả tim sản phẩm ---")
        await page.keyboard.press('Home');

        // click tha tim
        timeout = Math.floor(Math.random() * (timemax - timemin)) + timemin;
        await page.waitForTimeout(timeout)

        // await page.evaluate(() => {
        //     check = document.querySelector('.justify-center>.flex.items-center>svg>path')
        //     if (check) {
        //         document.querySelector('.justify-center>.flex.items-center>svg>path').click()
        //     }
        // })
        check = await page.$('.justify-center>.flex.items-center>button>svg>path')
        if (check) {
            await check.click()
        }
        timeout = Math.floor(Math.random() * (5000 - 4000)) + 4000;
        await page.waitForTimeout(timeout)

    } catch (error) {
        console.log(error)
        await updateErrorLogs(error, slavenumber)
    }
}

check_point_hour = async (uid) => {
    result = 0

    check_point_hour_url = apiUrl + "/api_user/check_point_hour?uid=" + uid

    await axios.get(check_point_hour_url, {

        timeout: 5000
    },
        {
            headers: {
                Connection: 'keep-alive',
            }
        })
        .then(function (response) {

            result = response.data
        })
        .catch(function (error) {
            console.log(moment().format("hh:mm:ss") + " - Lỗi check điểm số")
            result = 1
        });
    if (mode == "DEV") {
        result = 1
    }
    console.log(moment().format("hh:mm:ss") + " - Có đủ điểm số để thao tác không: " + result);
    return result
}

action_follow_shop = async (page) => {
    try {
        console.log("--- Follow shop ---")
        await page.keyboard.press('Home');

        // click follow
        timeout = Math.floor(Math.random() * (timemax - timemin)) + timemin;
        await page.waitForTimeout(timeout)

        check = await page.$('.section-seller-overview-horizontal__buttons>a')
        if (check) {
            await check.click()
        }
        timeout = Math.floor(Math.random() * (5000 - 4000)) + 4000;
        await page.waitForTimeout(timeout)

    } catch (error) {
        console.log(error)
        await updateErrorLogs(error, slavenumber)
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

gen_browser = async (engine, option) => {

    let proxy1 = option.proxy
    let headless_mode = option.headless_mode
    let network = option.network
    let user_lang = option.user_lang

    let user_agent = option.user_agent

    // console.log("Profile chrome link: " + profile_dir)

    let param = [
        // `--user-data-dir=${profile_dir}`,      // load profile chromium
        '--disable-gpu',
        '--no-sandbox',
        '--lang=en-US',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--lang=' + user_lang,
        '--disable-reading-from-canvas'
    ]

    let proxy_pass

    try {
        proxy_pass = proxy1.proxy_password.split("\r")[0]
    } catch (error) {
        proxy_pass = proxy1.proxy_password
    }

    console.log(" proxxy ip: " + proxy1.proxy_ip + ":" + proxy1.proxy_port + ":" + proxy1.proxy_username + ":" + proxy_pass)


    const browser = await engine.launch({
        //executablePath: chromiumDir,
        headless: headless_mode,
        devtools: false,
        // userDataDir: `${profile_dir}`,
        userAgent: user_agent,
        // proxy: proxy = {
        //     server: proxy1.proxy_ip + ":" + proxy1.proxy_port,
        //     user: proxy1.proxy_username,
        //     password: proxy_pass
        // },
        args: param
    });


    return browser
}

const simulate = async (engine) => {

    const browser = await engine.launch({
        headless: false
    });
    //const page = await browser.newPage();

    const context = await browser.newContext();
    const page = await context.newPage();
    cookie_google = [{
        name: 'SID',
        value: 'LAglXhc1JD4ud20PJUCT7mCF-G_Z3nS0B_CuXVNH_ZifjNHsLSS2DoFlAzFsy2BWjmFxEw.',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: false,
        secure: false,
        sameSite: 'None'
    },
    {
        name: '__Secure-1PSID',
        value: 'LAglXhc1JD4ud20PJUCT7mCF-G_Z3nS0B_CuXVNH_ZifjNHsQ9FqaMG3wFjpf95KkW4tRw.',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Secure-3PSID',
        value: 'LAglXhc1JD4ud20PJUCT7mCF-G_Z3nS0B_CuXVNH_ZifjNHsPsAafFCvznoEPx9JJBvXNA.',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: 'HSID',
        value: 'AcW76ZSGDRxOfFLe2',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: false,
        sameSite: 'None'
    },
    {
        name: 'SSID',
        value: 'AFaAnGLhsr89PSpUJ',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: 'APISID',
        value: 'acEE1Ag5BBcxMBVl/AfW--xMEcGuX3Rmlk',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: false,
        secure: false,
        sameSite: 'None'
    },
    {
        name: 'SAPISID',
        value: 'XDzFao-YKYI3xdw2/AotP5ztl8jndb-gf0',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: false,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Secure-1PAPISID',
        value: 'XDzFao-YKYI3xdw2/AotP5ztl8jndb-gf0',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: false,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Secure-3PAPISID',
        value: 'XDzFao-YKYI3xdw2/AotP5ztl8jndb-gf0',
        domain: '.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: false,
        secure: true,
        sameSite: 'None'
    },
    {
        name: 'OSID',
        value: 'LAglXhwC1SxZ5ecvOiXn0qILp8qLtCBkzTuA769SK-NJM3BOKg-tKCWU6lTxCUKH3eBzaA.',
        domain: 'mail.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Secure-OSID',
        value: 'LAglXhwC1SxZ5ecvOiXn0qILp8qLtCBkzTuA769SK-NJM3BOLxrcAD7qLP4xl8FUNMezNA.',
        domain: 'mail.google.com',
        path: '/',
        expires: 1718167478,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Host-GMAIL_SCH_GMN',
        value: '1',
        domain: 'mail.google.com',
        path: '/',
        expires: 1657687480,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: '__Host-GMAIL_SCH_GMS',
        value: '1',
        domain: 'mail.google.com',
        path: '/',
        expires: 1657687480,
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    },
    {
        name: '__Host-GMAIL_SCH_GML',
        value: '1',
        domain: 'mail.google.com',
        path: '/',
        expires: 1657687480,
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    },
    {
        name: '1P_JAR',
        value: '2022-06-13-04',
        domain: '.google.com',
        path: '/',
        expires: 1657687482,
        httpOnly: false,
        secure: true,
        sameSite: 'None'
    },
    {
        name: 'SEARCH_SAMESITE',
        value: 'CgQI1JUB',
        domain: '.google.com',
        path: '/',
        expires: 1670647482,
        httpOnly: false,
        secure: false,
        sameSite: 'Strict'
    },
    {
        name: 'PREF',
        value: 'ID=475c984d5429a083:FF=0:TM=1655095482:LM=1655095482:V=1:S=DCofhYjVDHW82nCb',
        domain: '.google.com',
        path: '/',
        expires: 1718167482,
        httpOnly: false,
        secure: false,
        sameSite: 'None'
    },
    {
        name: 'NID',
        value: '511=ZwTgjVQ7BKBM0qZBWXMNOdCfB5PS1cbK737XJsruwLYdEP0BDpe85F37hxHrfjVQ7h1eFKRXxfVQPPNC5vrnXnPxYK_SarIXy59HnPQEJOT_C_HoOtdKDPO5x0gvAYu_Va572GK4QCl565_ZUbVDjffZ1_oCdtYdP-EsKSNTSQd_nfcFJvCi9nli9pg9HYXF_jXRxLmnPS4',
        domain: '.google.com',
        path: '/',
        expires: 1670906682,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    },
    {
        name: 'SIDCC',
        value: 'AJi4QfFdWg5kVCEGJkOk51rSkNe4YrQS_WIsxbF5tVm4oykpmJzWdNcfcy58t31fTi7z85rC',
        domain: '.google.com',
        path: '/',
        expires: 1686631483,
        httpOnly: false,
        secure: false,
        sameSite: 'None'
    },
    {
        name: '__Secure-3PSIDCC',
        value: 'AJi4QfEQB-I60DvXUTcWTPuWwba8D16gtyDCxkhlpGktxgy2jKThcmk_sKL-rymem5eJq005',
        domain: '.google.com',
        path: '/',
        expires: 1686631483,
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }]

    await context.addCookies(cookie_google)
    // await login_google()
    //await page.goto('https://gmail.com/');


    /* await page.locator('[autocomplete="username"]').click();
    // Fill [aria-label="Email hoặc số điện thoại"]
    await page.locator('[autocomplete="username"]').fill('atrau1235@gmail.com');
    // Click button:has-text("Tiếp theo")
    await Promise.all([
        page.locator('button:has-text("Tiếp theo")').click()
    ]);
    // Fill [aria-label="Nhập mật khẩu của bạn"]
    await page.locator('[autocomplete="current-password"]').click();
    await page.locator('[autocomplete="current-password"]').fill('Muaha2016@');
    // Click button:has-text("Tiếp theo")
    await Promise.all([
   
        page.locator('button:has-text("Tiếp theo")').click()
    ]); */


    //await page.screenshot({ path: `example-${engine._initializer.name}.png` });
    //await page.waitForTimeout(5000)
    //google_cookie = await context.cookies("https://mail.google.com")
    // console.log(google_cookie)
    // try {
    await page.goto('https://shopee.com.my/');
    await page.waitForTimeout(3000)




    // } catch (error) {
    //     console.log(error)
    // }

    //await browser.close();
};


runAllTime = async () => {
    slaveInfo = []
    getDataShopee = []
    dataShopee = []

    update_point = apiUrl = "https://api.aos.asia"
    updateActionsUrl = "https://api.aos.asia"
    console.log("HOST NAME : " + apiUrl)

    if (mode === "DEV") {
        apiUrl = "https://beta.aos.asia"
        apiServer = "https://history.aos.asia:3000"
        updateActionsUrl = "https://beta.aos.asia"
        update_point = "https://beta.aos.asia"

    }

    shopee_account_update_url = apiUrl + "/api_user/shopeeAccountUpdate" // Link update account shopee status
    data_shopee_url = apiUrl + "/api_user/dataShopee"     // Link shopee update thứ hạng sản phẩm
    shopee_update_seo_san_pham_url = apiUrl + "/api_user/shopeeUpdateSeoSanPham"     // Link shopee update seo sản phẩm

    update_actions_url = updateActionsUrl + "/api_user/update_action"     // Update actions
    update_cookie_url = updateActionsUrl + "/api_user/update_cookie"     // Update actions
    update_point_url = update_point + "/api_user/update_point"     // Update actions

    getSlaveAccountDir = apiUrl + "/api_user/getSlaveAccount"     // Lay tai khoan shopee cho slave
    getSlaveInfo = apiUrl + "/api_user/getSlaveInfo"     // Lay thong tin cau hinh slave

    let get_data_shopee_url = ""


    get_data_shopee_url = data_shopee_url + "?slave=" + slavenumber + "&token=kjdaklA190238190Adaduih2ajksdhakAhqiouOEJAK092489ahfjkwqAc92alA&&mode=" + mode
    console.log(get_data_shopee_url)

    // Lấy dữ liệu từ từ khoá từ sv
    console.log(moment().format("hh:mm:ss") + " - Lấy dữ liệu ban đầu từ server")
    await axios.get(get_data_shopee_url, {
        timeout: 60000,
    })
        .then(function (response) {

            dataShopee = response.data
        })
        .catch(async function (error) {
            // handle error
            //console.log(error);
            // await updateErrorLogs(error, slavenumber)
            return false
        })
        .then(function () {
            // always executed
        });

    if (dataShopee.version) {

        // get version hien tai trong file version.txt
        var checkVersion = fs.readFileSync("version.txt", { flag: "as+" });
        if (checkVersion) {
            checkVersion = checkVersion.toString();
        } else {
            checkVersion = ""
        }
        console.log("Version hiện tai: " + checkVersion);
        newVersion = dataShopee.version;
        console.log("Version server: " + dataShopee.version);

        if (newVersion !== checkVersion && dataShopee.version !== undefined) {
            console.log(moment().format("hh:mm:ss") + " - Cập nhật code")
            // Update version mới vào file version.txt
            //fs.writeFileSync('version.txt', newVersion)
            if (mode !== "DEV") {
                if (os_slave != "LINUX") {

                } else {
                    shell.exec('git stash;');
                    shell.exec('git pull https://magiclovexxx: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@github.com/magiclovexxx/slave_order.git origin master;');
                    shell.exec('npm install;pm2 flush; pm2 start shopee.js; pm2 start restartall.js; pm2 startup; pm2 save; pm2 restart all');
                }
                return false
            }
        }
    }

    if (dataShopee == 1111) {
        console.log(moment().format("hh:mm:ss") + " - Không có dữ liệu khách hàng")
        await sleep(300000)
        return
    }
    if (dataShopee == 2222) {
        console.log(moment().format("hh:mm:ss") + " - Không có tài khoản clone")
        await sleep(300000)
        return
    }
    if (dataShopee == 3333) {
        console.log(moment().format("hh:mm:ss") + " - Không có proxy")
        await sleep(300000)
        return
    }
    if (!dataShopee.data) {
        console.log(moment().format("hh:mm:ss") + " - Không có dữ liệu datashopee")
        await sleep(300000)
        return
    }
    data = dataShopee.data

    shopee_point = dataShopee.shopee_point
    if (dataShopee.slave_info) {
        slaveInfo = dataShopee.slave_info
        if (slaveInfo.status == 0) {
            console.log(" SLAVE " + slaveInfo.slave_id + ": OFF")
            await sleep(300000)
            return;
        }
    }

    console.log(moment().format("hh:mm:ss") + " - START SHOPEE ORDER")

    var proxy = dataShopee.proxy

    if (proxy.length == 0) {
        console.log(moment().format("hh:mm:ss") + " - Không có proxy")
        await sleep(100000)
        return;
    }

    data.forEach(async (data_for_tab, index) => {   // Foreach object Chạy song song các tab chromium

        let subAccount = []
        let acc = data_for_tab.sub_account

        let orders = data_for_tab.product_for_sub_account

        if (orders.length == 0) {
            console.log(moment().format("hh:mm:ss") + " - Không có dữ liệu đơn hàng")
            await sleep(150000)
            return
        }

        let user_agent, user_lang
        console.log(moment().format("hh:mm:ss") + " - Số lượng đơn hàng mỗi lượt: " + index + " ---- " + orders.length)

        subAccount[0] = acc.username
        subAccount[2] = acc.id
        try {
            subAccount[1] = acc.password.split("\r")[0]
        } catch (error) {
            subAccount[1] = acc.password
        }

        if (!acc.user_agent) {
            user_agent = randomUseragent.getRandom(function (ua) {
                return (ua.osName === 'Windows' && ua.osVersion === "10");
            });
        } else {
            user_agent = acc.user_agent
        }

        if (!acc.lang) {
            langs = ["en-GB", "en-US"]

            let rand = Math.floor(Math.random() * langs.length);
            // user_lang = langs[rand]
            user_lang = "en-US"
            console.log("Ngôn ngữ trình duyệt: " + user_lang)

        } else {
            user_lang = acc.user_lang
        }

        let profileChrome = profileDir + subAccount[0]

        let option1 = {
            user_agent: user_agent,
            proxy: proxy,
            profile_dir: profileChrome,
            cookie: acc.cookie,
            network: slaveInfo.network,
            headless_mode: headless_mode,
            user_lang: user_lang
        }

        const browser = await gen_browser(firefox, option1)

        const context = await browser.newContext()

        const page = await context.newPage()

        try {
            let cookie1 = acc.cookie
            cookie1 = JSON.parse(cookie1)

            if (cookie1.length) {

                console.log(cookie1.length)
                await context.addCookies([...cookie1])
                console.log(moment().format("hh:mm:ss") + " - Setcookie thành công")
            }
        } catch (e) {
            console.log(" ---- Lỗi set coookie ----")
            console.log(e)
        }

        //  await page.waitForTimeout(999999)


        try {

            console.log(moment().format("hh:mm:ss") + " - Load shopee.vn")

            await page.goto('https://shopee.com.my')

            timeout = Math.floor(Math.random() * (3000 - 2000)) + 2000;

            // login account shopee                    
            let checklogin = await login_shopee(page, context, subAccount)

            console.log(moment().format("hh:mm:ss") + " - index = " + index + " - check login account: " + subAccount[0] + " - " + checklogin)

            if (checklogin == 2 || checklogin == 3) {
                console.log(moment().format("hh:mm:ss") + " - Cập nhật tài khoản lỗi")
                accountInfo = {
                    user: subAccount[0],
                    pass: subAccount[1],
                }

                if (checklogin == 2) {
                    accountInfo.message = "Account bị khoá"
                    accountInfo.status = 2
                }

                if (checklogin == 3) {
                    accountInfo.message = "Sai thông tin đăng nhập"
                    accountInfo.status = 3
                }

                await axios.get(shopee_account_update_url, {
                    params: {
                        data: {
                            dataToServer: accountInfo,
                        }
                    },
                    timeout: 5000
                })
                    .then(function (response) {
                        console.log(response.data);
                    })
                    .catch(function (error) {
                        console.log("Không cập nhật được trạng thái tài khoản")
                        console.log(error);
                    })
                    .then(function () {
                        // always executed
                    });
                await browser.close();
                console.log(" ----- KhởI đÔng lại ---- ")
                shell.exec('pm2 flush, pm2 restart all');
            }
            if (checklogin == 1) {


                if (slaveInfo.type == "order_system") {
                    console.log(moment().format("hh:mm:ss") + " --- Đặt đơn tự động ---")

                    if (mode == "DEV") {
                        //   max_turn = 1
                        max_turn = orders.length
                    } else {
                        max_turn = orders.length
                    }

                    for (let o = 0; o < max_turn; o++) {

                        let order_1 = orders[0]
                        let product_link = order_1.product_link
                        let get_link = product_link.split("/")
                        let shopee_country_url = "https://" + get_link[2]

                        if (o == 0) {
                            console.log("country shopee link: " + shopee_country_url)
                            let shopee_cookie = await context.cookies(shopee_country_url)
                            let data_clone = {}
                            data_clone.clone_id = acc.id
                            data_clone.cookie = shopee_cookie
                            await updateCookie(data_clone, 1)
                        }

                        let productForUser                     // Mảng chứa thông tin sản phẩm, từ khoá cần tương tác
                        let check_like = 0
                        let check_follow = 0

                        let check_product_exit = "Có tồn tại"
                        let actions = []                            // Luư lịch sử thao tác
                        productForUser = orders[o]

                        //        options = JSON.parse(productForUser.options)                        

                        productForUser.username = subAccount[0]
                        productForUser.password = subAccount[1]
                        productForUser.clone_id = subAccount[2]
                        productForUser.shopee_point = shopee_point

                        let shopInfo3 = {
                            cover: false,
                            name: false,
                            followed: 0
                        }

                        let check_add_cart
                        //    page.removeAllListeners('response');
                        //await page.setRequestInterception(true);
                        await page.on('response', async (response) => {
                            let url = response.url()
                            let productInfo1, productInfo2

                            let check_add_to_cart = url.split("api/v4/cart/add_to")
                            let checkUrlShop = url.split("shop/get_shop_detail")

                            try {
                                if (checkUrlShop.length > 1) {
                                    console.log("-- Sự kiện lấy thông tin shop --")
                                    productInfo1 = await response.json()
                                    productInfo2 = productInfo1.data
                                    if (productForUser.shop_id == productInfo2.shopid) {
                                        shopInfo3.avatar = productInfo2.account.portrait
                                        shopInfo3.username = productInfo2.account.username
                                        shopInfo3.name = productInfo2.name
                                        shopInfo3.shop_id = productInfo2.shopid
                                        shopInfo3.followed = productInfo2.followed
                                        console.log(moment().format("hh:mm:ss") + " - Thông tin Shop ")
                                        console.log(shopInfo3)
                                    }
                                }
                            } catch (error) {
                                //     await updateErrorLogs(error, slavenumber)
                            }

                            if (check_add_to_cart.length > 1) {

                                let check = await response.json()
                                if (check.error == 0) {
                                    check_add_cart = true
                                } else {
                                    check_add_cart = false
                                }

                                console.log(moment().format("hh:mm:ss") + " - Kiểm tra bỏ giỏ: " + check_add_cart)
                            }

                            check_link_san_pham = url.split("item/get?itemid=" + productForUser.product_id)
                            if (check_link_san_pham.length > 1) {

                                try {
                                    let productInfo1 = await response.json()
                                    productInfo2 = productInfo1.data
                                    productForUser.product_image = ""
                                    productForUser.product_image = productInfo2.image
                                    productForUser.liked = productInfo2.liked

                                } catch (error) {
                                    check_product_exit = "Không tồn tại"
                                    console.log(moment().format("hh:mm:ss") + " - Sản phẩm không tồn tại")
                                }
                            }
                        });

                        productForUser.slave = slavenumber

                        productForUser.ip = proxy.proxy_ip;
                        productForUser.local_ip = ip_address.address()
                        console.log("Local IP: " + productForUser.local_ip);
                        console.log("Ip mới: " + proxy.proxy_ip)
                        console.log("Shop id: " + productForUser.shop_id)
                        console.log("product link: " + productForUser.product_link)
                        console.log("product name: " + productForUser.product_name)
                        console.log("product id: " + productForUser.product_id)

                        check_point = await check_point_hour(productForUser.uid)

                        cookies22 = await context.cookies(shopee_country_url)

                        productForUser.cookie = cookies22
                        productForUser.user_agent = user_agent
                        productForUser.user_lang = user_lang
                        cookie1 = ""

                        cookies22.forEach((row, index) => {
                            cookie1 = cookie1 + row.name + "=" + row.value
                            if (index != (cookies22.length - 1)) {
                                cookie1 = cookie1 + "; "
                            }
                        })

                        await page.goto(productForUser.product_link, {
                            waitUntil: "networkidle0",
                            timeout: 50000
                        });

                        if (check_product_exit === "Có tồn tại") {
                            try {
                                let check_action

                                let check_confirm = await page.$(".shopee-alert-popup__btn")
                                if (check_confirm) {
                                    await page.locator.click(".shopee-alert-popup__btn")
                                }

                                timeout = Math.floor(Math.random() * (3000 - 2000)) + 2000;
                                await page.waitForTimeout(timeout)

                                // cookies22 = await page.cookies()
                                // productForUser.cookie = await page.cookies()

                                // console.log(moment().format("hh:mm:ss") + " -  Xem ảnh sản phẩm")
                                // check_point = await check_point_hour(productForUser.uid)                                

                                // if (check_point) {
                                //     await action_view_product(page)
                                // } else {
                                //     break
                                // }

                                // if (options.view_review) {
                                //     console.log(moment().format("hh:mm:ss") + " -  Xem review")

                                //     check_point = await check_point_hour(productForUser.uid)
                                //     if (check_point) {
                                //         await action_view_review(page)
                                //     } else {
                                //         break
                                //     }

                                //     action1 = {
                                //         time: new Date(),
                                //         action: "view_review"
                                //     }
                                //     actions.push(action1)
                                //     productForUser.action = "view_review"
                                //     await updateActions(productForUser, 10)
                                // }

                                //    console.log(moment().format("hh:mm:ss") + " -  Check thả tim sản phẩm: " + productForUser.liked)

                                // if (options.heart_product) {
                                //     if (productForUser.liked == false) {

                                //         check_point = await check_point_hour(productForUser.uid)
                                //         if (check_point) {
                                //             random_like = Math.floor(Math.random() * 4);
                                //             check_like = await action_heart_product_api(page, productForUser)
                                //             console.log(moment().format("hh:mm:ss") + " -  thả tim sản phẩm: " + check_like.error)

                                //             if (check_like.error == 0) {
                                //                 productForUser.action = "heart_product"
                                //                 await updateActions(productForUser, 10)
                                //             }
                                //         } else {
                                //             break
                                //         }
                                //     }
                                // }

                                // if (options.add_cart) {
                                check_point = await check_point_hour(productForUser.uid)
                                if (check_point) {
                                    random_add_cart = Math.floor(Math.random() * 4);

                                    await action_add_cart(page, productForUser)
                                    console.log(moment().format("hh:mm:ss") + "- Bỏ giỏ - " + productForUser.product_id + " : " + check_add_cart)

                                    //  await page.waitForTimeout(999999)
                                    // if (check_add_cart) {
                                    //     productForUser.action = "add_cart"
                                    //     await updateActions(productForUser, 10)
                                    // } else {
                                    //     console.log(productForUser.product_link)
                                    // }
                                } else {
                                    break
                                }
                                //   }

                                //     if (options.view_shop) {
                                //         console.log(moment().format("hh:mm:ss") + " -  Xem shop ")
                                //         let productLink = await page.url()

                                //         check_point = await check_point_hour(productForUser.uid)
                                //         if (check_point) {
                                //             await action_view_shop(page, productLink, productForUser)
                                //         } else {
                                //             break
                                //         }
                                //         productForUser.shopAvatar = shopInfo3.avatar
                                //         productForUser.shopName = shopInfo3.name
                                //         productForUser.shopUserName = shopInfo3.username

                                //         action1 = {
                                //             time: new Date(),
                                //             action: "view_shop"
                                //         }
                                //         actions.push(action1)
                                //         productForUser.action = "view_shop"
                                //         await updateActions(productForUser, 10)

                                //     }

                                //     if (options.follow_shop) {
                                //         refer = await page.url()
                                //         shopId = parseInt(productForUser.shop_id)
                                //         check1 = shopInfo3.followed
                                //         console.log(moment().format("hh:mm:ss") + " -  check follow shop: " + check1)

                                //         if (check1 == false) {
                                //             check_point = await check_point_hour(productForUser.uid)
                                //             if (check_point) {
                                //                 random_follow = Math.floor(Math.random() * 4);
                                //                 check_follow = await shopeeApi.followShop(cookies22, refer, shopId)
                                //                 //await action_follow_shop(page)

                                //                 if (check_follow.error == 0) {
                                //                     productForUser.action = "follow_shop"
                                //                     await updateActions(productForUser, 10)
                                //                 }
                                //                 await page.waitForTimeout(1000);
                                //             } else {
                                //                 break
                                //             }
                                //         }
                                //     }
                                // } catch (error) {
                                //     console.log(error)
                                //     await updateErrorLogs(error, slavenumber)
                                // }
                            } catch (error) {
                                console.log(error)
                                // await updateErrorLogs(error, slavenumber)
                            }

                            //    await removeCart(page)
                            await page.waitForTimeout(1000);

                        }
                        console.log(moment().format("hh:mm:ss") + " -  ----------- Kết thúc tương tác san pham: " + o)
                    }
                    console.log(moment().format("hh:mm:ss") + " -  ----------- Kết thúc tương tác Tab: " + index)
                }

                await browser.close();
                if (os_slave == "LINUX") {
                    console.log(moment().format("hh:mm:ss") + " PM2 restart ")
                    shell.exec('pm2 restart all');
                }

            }
        } catch (error) {
            console.log(error)
            // await updateErrorLogs(error, slavenumber)
        }
    })
}
if (mode === "DEV") {
    (async () => {

        if (os_slave == "LINUX") {
            shell.exec('pm2 flush');
            shell.exec('rm ~/.pm2/pm2.log');
            shell.exec('rm -rf ' + profileDir);
        } else {
            shell.exec('Rmdir /S /q ' + profileDir);
        }

        await runAllTime()

    })();
} else {

    (async () => {

        if (os_slave == "LINUX") {
            shell.exec('pm2 flush');
            shell.exec('rm ~/.pm2/pm2.log');
            shell.exec('rm -rf ' + profileDir);
        } else {
            shell.exec('Rmdir /S /q ' + profileDir);
        }

        await runAllTime()


    })();
}

//simulate(firefox)
  //simulate(webkit)
  //simulate(chromium)
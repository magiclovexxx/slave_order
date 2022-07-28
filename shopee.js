require('dotenv').config();
var fs = require('fs');
const shopeeApi = require('./src/shopeeApi.js')
const api = require('./src/update_to_server.js')
const actionShopee = require('./src/actions.js')
const axios = require('axios').default;
const moment = require('moment')
var FormData = require('form-data');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

const randomUseragent = require('random-useragent');
var shell = require('shelljs');
const { preparePageForTests } = require('./src/bypass');
var ip_address = require("ip");
const preloadFile = fs.readFileSync('./preload.js', 'utf8');

// ["chrome.runtime", "navigator.languages"].forEach(a =>
//     StealthPlugin.enabledEvasions.delete(a)
// )
puppeteer.use(StealthPlugin())

slavenumber = process.env.SLAVE
account_check = process.env.ACCOUNT
order_check = process.env.ORDER_ID
pending_check = process.env.PENDING

chromiumDir = process.env.CHROMIUM_DIR                     // Đường dẫn thư mục chromium sẽ khởi chạy
let profileDir = process.env.PROFILE_DIR

headless_mode = process.env.HEADLESS_MODE     // che do chay hien thi giao dien
//disable_image = process.env.DISABLE_IMAGE     // k load ảnh
disable_css = process.env.DISABLE_CSS     // k load css
os_slave = process.env.OS_SLAVE     // k load css
//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

if (headless_mode == "0") {
    headless_mode = true
} else {
    headless_mode = false
}

check_die = 0
console.log("headless_mode: " + headless_mode + " --- OS SLAVE:" + os_slave)

// Danh sách profile facebook trong mỗi slave
mode = process.env.MODE


if (mode === "DEV") {
    timemax = 3000;
    timemin = 2000;
} else {
    timemax = 3000;
    timemin = 2000;
}
logs = 1

var last_request_success = moment();

add_address = async (page, product, cookies) => {
    try {

        const apiRequestContext = await page.request;

        let add_address_url = product.shopee_country_url + "/api/v0/addresses/add/"
        let get_address_url = product.shopee_country_url + "/api/v4/account/address/get_user_address_list?with_warehouse_whitelist_status=true"
        let address_account_url = product.shopee_country_url + "/user/account/address"


        await page.waitForTimeout(delay(6000, 4000))
        await page.goto(address_account_url)
        await page.waitForTimeout(delay(6000, 4000))
        let check_address = await page.$x("//button[contains(text(), 'Set as default')]")

        console.log("Số địa chỉ đang có: " + check_address.length)
        if (check_address.length) {
            console.log(moment().format("hh:mm:ss") + " -- Xoá địa chỉ cũ");
            for (let i = 0; i < check_address.length; i++) {
                let check_address1 = await page.$x('//button[contains(text(), "Delete")]')

                await check_address1[0].click();
                await page.waitForTimeout(delay(4000, 3000))
                let check_address2 = await page.$x('//button[contains(text(), "Delete")]')

                if (check_address2.length == 2) {
                    await check_address2[1].click();
                    console.log(moment().format("hh:mm:ss") + " -- Xoá địa chỉ: " + i);
                }
                await page.waitForTimeout(delay(4000, 3000))
            }
        }

        console.log(moment().format("hh:mm:ss") + " -- Thêm địa chỉ ");
        let domain = product.shopee_country_url.split("/")
        let cookie1
        domain = domain[domain.length - 1]

        const csrftoken = cookies.filter(x => x.domain.includes(domain) && x.name == 'csrftoken')[0].value;

        cookies.forEach((row, index) => {
            cookie1 = cookie1 + row.name + "=" + row.value
            if (index != (cookies.length - 1)) {
                cookie1 = cookie1 + "; "
            }
        })

        let address_data = JSON.parse(product.address)

        console.log(address_data)

        var data = new FormData();
        let phone_country = ""
        let zipcode = ""

        data.append('name', product.rec_name);
        data.append('icno', '');
        data.append('country', address_data.country);
        data.append('state', address_data.city);
        data.append('city', address_data.district);
        data.append('district', address_data.ward);
        data.append('town', address_data.barangay);
        data.append('address', address_data.address);

        if (address_data.zipcode) {
            let z = address_data.zipcode
            data.append('zipcode', z);
        }

        if (address_data.country == "PH") {
            zipcode = Math.floor(Math.random() * (3900 - 3000)) + 3000;
            phone_country = "63"
        }
        let rec_phone = parseInt(product.rec_phone);

        let ph = phone_country + rec_phone

        console.log("Phone: " + ph)

        data.append('zipcode', zipcode);
        data.append('phone', ph);
        data.append('set_default', '1');

        data.append('address_instruction', '');
        data.append('place', 'DO_NOT_CHANGE__I_AM_MAGIC');
        data.append('add_only', 'false');

        var config = {
            method: 'post',
            url: add_address_url,
            headers: {
                'authority': product.shopee_country_url,
                'accept': '*/*',
                'cache-control': 'no-cache',
                'cookie': cookie1,
                'origin': product.shopee_country_url,
                'pragma': 'no-cache',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
                "referer": product.shopee_country_url + `/user/account/address`,
                "x-csrftoken": csrftoken,
                'x-shopee-language': 'en',
                ...data.getHeaders()
            },
            data: data
        };
        body = {}
        await axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                body = response.data
            })
            .catch(function (error) {
                console.log(error);
            })


        if (body.addressid) {

            let address_id = body.addressid
            console.log(moment().format("hh:mm:ss") + " -- Thêm địa chỉ thành công: " + address_id);

            // // Set địa chỉ defautl
            let result_set_defaul
            console.log(moment().format("hh:mm:ss") + " --Set địa chỉ mặc định ");
            data = new FormData();

            config = {
                method: 'post',
                url: product.shopee_country_url + '/api/v0/addresses/' + address_id + '/set_default/',
                headers: {
                    'authority': product.shopee_country_url,
                    'accept': '*/*',
                    'cache-control': 'no-cache',
                    'cookie': cookie1,
                    'origin': product.shopee_country_url,
                    'pragma': 'no-cache',
                    'referer': product.shopee_country_url + '/user/account/address',
                    'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.63 Safari/537.36',

                    'x-csrftoken': csrftoken,
                    'x-requested-with': 'XMLHttpRequest',
                    'x-shopee-language': 'en',
                    ...data.getHeaders()
                },
                data: data
            };


            await axios(config)
                .then(function (response) {
                    result_set_defaul = response.data
                    console.log(JSON.stringify(response.data));
                })
                .catch(function (error) {
                    console.log(error);
                });
            if (result_set_defaul.success) {
                return 1
            } else {
                return 0
            }

        }

        if (body.error == "invalid address") {
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.error_code = 2004
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Thông tin địa chỉ hoặc số điện thoại không đúng, vui lòng kiểm tra lại"
            console.log(moment().format("hh:mm:ss") + " -- Địa chỉ hoặc số điện thoại không đúng ");
            await api.update_error(update_error_data, 4)
            return 0
        }
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.error_code = 1001
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_log = "Có lỗi hệ thống khi thêm địa chỉ, vui lòng kiểm tra lại"
        console.log(moment().format("hh:mm:ss") + " -- Lỗi hệ thống khi thêm địa chỉ ");
        console.log(error)
        await api.update_error(update_error_data, 4)
        return 0
    }
}

update_order_status = async (url, cookie) => {
    order_list_4 = []
    order_list = []
    order_list_5 = []
    order_list_3 = []
    try {
        console.log(moment().format("hh:mm:ss") + " -- update_order_status --");
        // Lấy thông tin 20 đơn hàng đầU

        order_list_5 = await shopeeApi.get_all_order_list(url, cookie, 20, 0)
        console.log("ORder list 1: " + order_list_5.length)
        order_list.push(...order_list_5)

        for (let i = 1; i < 20; i++) {

            if (order_list_5.length == 20) {
                order_list_5 = await shopeeApi.get_all_order_list(url, cookie, 20, 20 * i)
                console.log("ORder list : " + i + " -- " + order_list_5.length)
            } else {
                continue
            }

            if (order_list_5.length) {
                order_list.push(...order_list_5)
            }
        }

        console.log(" ORder list all: " + order_list.length)
        // update và check trạng thái đơn hàng trên sv xem đã có tracking_number chưa
        let order_list_2 = await api.updateOrderStatus(order_list, 3)


        if (order_list.length) {
            order_list.forEach(async e => {
                //    console.log(e.status)         
                if (e.status == "label_order_delivered") {
                    await comfirm_order_complete(url, cookie, e.shopee_order_id)
                }
                if (e.rating == "order_tooltip_completed_buyer_not_rated_can_rate") {
                    await shopeeApi.rating_order(url, cookie, e.shopee_order_id, e.shop_id, e.item_id, "")
                }
            })
        }
        // if (order_list_2.length) {
        //     order_list_2.forEach(async e => {
        //            let x = await get_order_detail(url, e.shopee_order_id, cookie)

        //         if (x.pc_shipping) {
        //             let a = {
        //                 shopee_order_id: e.shopee_order_id,
        //                 shopee_order_id_2: e.pc_processing_info.order_sn,
        //                 shopee_tracking_number: x.pc_shipping.forder_shipping_info_list[0].tracking_number,
        //             }

        //             if (a) {
        //                 order_list_3.push(a)
        //             }
        //         }

        //     })

        //     if (order_list_2.length) {
        //         let order_list_2 = await api.updateOrderStatus(order_list_3, 3)
        //     }

        // }

    } catch (error) {
        console.log(error)
    }

}

login_google = async (page, accounts, browser, url) => {
    // Click text=Login
    try {
        login_url = url + "/buyer/login?next=https%3A%2F%2Fshopee.ph%2Flogin"
        await page.goto(login_url)

        await page.waitForTimeout(delay(6000, 5000))
        // Click button:has-text("Google")
        await page.waitForSelector('.social-white-google-png')
        await page.click('.social-white-google-png')

        await page.waitForTimeout(delay(11000, 9000))

        let page1 = (await browser.pages())[1];
        await page1.waitForTimeout(delay(4000, 3000))
        //    await page1.waitForSelector('[autocomplete="username"]')
        await page1.click('[autocomplete="username"]')
        await page1.waitForTimeout(delay(4000, 2000))
        await page1.type('[autocomplete="username"]', accounts.gmail_username, { delay: 100 })    // Nhập user 

        await page1.click('[id="identifierNext"]')
        await page1.waitForTimeout(delay(6000, 4000))
        await page1.waitForSelector('[autocomplete="current-password"]')
        await page1.type('[autocomplete="current-password"]', accounts.gmail_password, { delay: 100 })    // Nhập comment 
        await sleep(delay(3000, 2000))
        let click_next = await page1.$$('[data-is-touch-wrapper="true"]')
        if (click_next.length > 0) {
            await click_next[1].click()
            await sleep(delay(5000, 4000))
        }

        //    

        console.log("-- check email khoi phuc --")

        let check_gmail_khoi_phuc = await page1.$x("//div[contains(text(), 'Xác nhận email khôi phục của bạn')]");
        if (check_gmail_khoi_phuc.length) {
            console.log("-- Nhap email khoi phuc --")
            await check_gmail_khoi_phuc[0].click()
            await sleep(delay(5000, 4000))

            await page1.click('[name="knowledgePreregisteredEmailResponse"]')
            await sleep(delay(2000, 1000))
            await page1.type('[name="knowledgePreregisteredEmailResponse"]', accounts.mail_khoi_phuc, { delay: 100 })    // Nhập comment
            await sleep(delay(3000, 2000))


            let click_next = await page1.$x("//span[contains(text(), 'Tiếp theo')]");
            if (click_next.length > 0) {
                await click_next[0].click()
                await sleep(delay(3000, 2000))
            }
        }



        let check_gmail_block = await page1.$x("//span[contains(text(), 'Tài khoản của bạn đã bị vô hiệu hoá')]");

        if (check_gmail_block.length) {
            console.log("Email bị block : " + accounts[0])
            update_error_data = {}
            update_error_data.order_id = 0
            update_error_data.username = accounts[0]
            update_error_data.slave = slavenumber
            update_error_data.error_code = 1013
            update_error_data.product_link = ""
            update_error_data.error_log = "Email bị block"
            await update_error(update_error_data, 4)
            return 2
        }

        try {
            check_verify = await page.$$('[data-accountrecovery="false"]')
        } catch (error) {
            console.log(error)
            return 0
        }

        if (check_verify.length) {
            console.log("Email bị check point : " + accounts[0])
            update_error_data = {}
            update_error_data.order_id = 0
            update_error_data.username = accounts[0]
            update_error_data.slave = slavenumber
            update_error_data.error_code = 1010
            update_error_data.product_link = ""
            update_error_data.error_message = error.message
            update_error_data.error_log = "Email bị checkpoint"
            await update_error(update_error_data, 4)
            return 2
        }
    } catch (error) {
        console.log(error)
    }

}

login_shopee = async (page, accounts, url, browser, login_type) => {
    try {
        await sleep(delay(4000, 3000))

        let linkHandlers = await page.$x("//button[contains(text(), 'English')]");
        let check_verify = 0
        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        }

        await sleep(delay(4000, 3000))
        // let x = Math.floor(Math.random() * 200);
        // let y =Math.floor(Math.random() * 50);
        // console.log(x + "x" + y)
        // await page.mouse.click(x, y)


        await page.click('.header-with-search__logo-wrapper')
        await sleep(delay(4000, 3000))
        let check_login = await page.$$('.navbar__link.navbar__link--account.navbar__link--login')
        console.log("Check chưa login : " + check_login.length)

        if (check_login.length > 0) {

            console.log(" ---- Chưa login tài khoản ----")

            if (login_type == "google") {
                await login_google(page, accounts, browser, url)

            } else {
                // Click text=Login
                await check_login[0].click();

                await sleep(delay(6000, 5000))

                await page.type('[name="loginKey"]', accounts.username, { delay: 100 })    // Nhập user 
                await sleep(delay(2000, 1000))
                await page.type('[name="password"]', accounts.password, { delay: 100 })    // Nhập pass 
                await sleep(delay(3000, 2000))

                let button_login = await page.$x("//button[contains(text(), 'Log In')]")

                if (button_login.length > 0) {
                    await button_login[0].click()

                } else {
                    update_error_data = {}
                    update_error_data.order_id = 0
                    update_error_data.username = accounts.username
                    update_error_data.slave = slavenumber
                    update_error_data.error_code = 1007
                    update_error_data.product_link = ""
                    update_error_data.error_message = error.message
                    update_error_data.error_log = "Lỗi không tìm thấy nút login"
                    await api.update_error(update_error_data, 4)
                    console.log(error)
                    return 0
                }
            }

            await sleep(delay(10000, 8000))

            console.log(moment().format("hh:mm:ss") + " - Check Security account")

            check_verify_pass = await page.$x("//div[contains(text(), 'Verify by Password')]");

            if (check_verify_pass.length) {
                console.log(moment().format("hh:mm:ss") + " - Verify password")

                await check_verify_pass[0].click()
                await sleep(delay(5000, 4000))
                await page.type('[name="password"]', accounts.password, { delay: 100 })    // Nhập pass 
                await sleep(delay(5000, 4000))

                btn_confirm = await page.$x("//button[contains(text(), 'CONFIRM')]");

                if (btn_confirm.length) {
                    await btn_confirm[0].click()
                }
            }

            check_verify = await page.$x("//div[contains(text(), 'Security check')]");

            if (check_verify.length) {
                console.log("Tài khoản bị check point : " + accounts.username)

                update_error_data = {}
                update_error_data.order_id = 0
                update_error_data.username = accounts.username
                update_error_data.slave = slavenumber
                update_error_data.error_code = 2007
                update_error_data.product_link = ""
                update_error_data.error_message = "Tài khoản bị checkpoint"
                update_error_data.error_log = "Tài khoản bị checkpoint"
                await api.update_error(update_error_data, 4)
                return 2
            }

        }

        await sleep(delay(6000, 4000))
        check_login = await page.$$('.navbar__link.navbar__link--account.navbar__link--login')

        if (check_login.length == 0) {
            console.log(" ---- login thành công ----")
            return 1
        } else {
            return 4 // Lỗi đăng nhập
        }
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = 0
        update_error_data.username = accounts.username
        update_error_data.slave = slavenumber
        update_error_data.error_code = 1007
        update_error_data.product_link = ""
        update_error_data.error_message = error.message
        update_error_data.error_log = "Lỗi hệ thống khi login"
        await api.update_error(update_error_data, 4)
        console.log(error)
        return 0
    }

}

delay = (x, y) => {
    a = Math.floor(Math.random() * (x - y)) + y;
    return a
}

random_int = (x, y) => {
    a = Math.floor(Math.random() * (x - y)) + y;
    return a
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


gen_browser = async (option) => {
    let profile_dir = option.profile_dir
    let proxy1 = option.proxy
    let headless_mode = option.headless_mode
    let network = option.network
    let user_lang = option.user_lang

    console.log("Profile chrome link: " + profile_dir)

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
        '--window-position=0,0',
        '--lang=' + user_lang,
        '--disable-infobars',
        '--disable-reading-from-canvas',
        '--ignore-certificate-errors',
        '--ignore-certifcate-errors-spki-list',
    ]

    // if(mode==="DEV"){
    //     network = ""
    // }

    if (network == "proxy") {
        //'--proxy-server=103.90.230.170:9043'
        if (proxy1) {
            let proxy_for_slave = "--proxy-server=" + proxy1.proxy_ip + ":" + proxy1.proxy_port
            param.push(proxy_for_slave)
        }

    }

    const browser = await puppeteer.launch({
        //executablePath: chromiumDir,
        headless: headless_mode,
        devtools: false,
        userDataDir: `${profile_dir}`,
        ignoreDefaultArgs: ['--enable-automation'],
        args: param
    });

    return browser
}

gen_page = async (browser, option) => {

    const page = (await browser.pages())[0];
    //const page = await browser.newPage()
    await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver
    })
    await preparePageForTests(page);

    let user_agent1 = option.user_agent
    let proxy1 = option.proxy
    let cookie1 = option.cookie
    let network = option.network

    await page.setUserAgent(user_agent1)

    // Random kích cỡ màn hình
    width = Math.floor(Math.random() * (1280 - 1000)) + 1000;;
    height = Math.floor(Math.random() * (800 - 600)) + 600;;
    console.log("Kích thước màn hình: " + width + " x " + height)

    await page.setViewport({
        width: width,
        height: height
    });

    // if(mode==="DEV"){
    //     network = ""
    // }

    if (network == "proxy") {
        if (proxy1) {
            let proxy_pass
            try {
                proxy_pass = proxy1.proxy_password.split("\r")[0]
            } catch (error) {
                proxy_pass = proxy1.proxy_password
            }

            console.log(" proxxy ip: " + proxy1.proxy_ip + ":" + proxy1.proxy_port + ":" + proxy1.proxy_username + ":" + proxy_pass)
            await page.authenticate({ username: proxy1.proxy_username, password: proxy_pass });
        }
    }

    // try {
    //     if (cookie1.length) {
    //         let cookie111 = JSON.parse(cookie1)
    //         console.log(cookie111.length)
    //         // cookie111.forEach(async (item) => {
    //         //     await page.setCookie(item);
    //         // })
    //         await page.setCookie(...cookie111);
    //         console.log(moment().format("hh:mm:ss") + " - Setcookie thành công")
    //     }
    // } catch (e) {
    //     console.log(" ---- Lỗi set coookie ----")
    // }

    return page
}

function getCookiesMap(cookiesString, url) {
    let cookies = []
    const ck_obj = cookiesString.split(";")
        .map(function (cookieString) {
            return cookieString.trim().split(/=(.+)/);
        })
        .reduce(function (acc, curr) {
            acc[curr[0]] = curr[1];
            return acc;
        }, {})
    const keys = Object.keys(ck_obj)
    for (let i = 0; i < keys.length; i++) {
        cookies.push({
            name: keys[i],
            value: ck_obj[keys[i]],
            domain: url,
            path: '/'
        })
    }
    return cookies
}

cookie_to_string = function (cookies22) {
    let cookie1 = ""
    cookies22.forEach((row, index) => {
        cookie1 = cookie1 + row.name + "=" + row.value
        if (index != (cookies22.length - 1)) {
            cookie1 = cookie1 + "; "
        }
    })
    return cookie1
}

nuoi_tai_khoan = function (page) {


}


check_order_complete = 0

runAllTime = async () => {

    slaveInfo = []
    getDataShopee = []
    dataShopee = []
    products_name = []
    voucher = []

    let get_data_shopee_url = ""

    get_data_shopee_url = data_shopee_url + "?slave=" + slavenumber + "&token=kjdaklA190238190Adaduih2ajksdhakAhqiouOEJAK092489ahfjkwqAc92alA&&mode=" + mode + "&account_check=" + account_check + "&order_check=" + order_check
    console.log(get_data_shopee_url)

    // Lấy dữ liệu từ từ khoá từ sv
    console.log(moment().format("hh:mm:ss") + " - Lấy dữ liệu ban đầu từ server")
    last_request_success = moment();

    await axios.get(get_data_shopee_url, {
        timeout: 60000,
    })
        .then(function (response) {
            dataShopee = response.data
        })
        .catch(async function (error) {
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
                shell.exec('git stash;');
                shell.exec('git pull origin master');
                shell.exec('npm install;pm2 flush; pm2 start shopee.js; pm2 startup; pm2 save; pm2 restart all');

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
    voucher = dataShopee.voucher
    shopee_country_1 = dataShopee.shopee_country

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

    last_request_success = moment();

    data.forEach(async (data_for_tab, index) => {   // Foreach object Chạy song song các tab chromium
        last_request_success = moment();

        let product_order_info = {}
        let subAccount = data_for_tab.sub_account
        let shopee_url = dataShopee.shopee_url
        let shopee_full_url = "https://" + shopee_url

        let orders = data_for_tab.product_for_sub_account

        let user_agent, user_lang
        console.log(moment().format("hh:mm:ss") + " - Số lượng đơn hàng mỗi lượt: " + index + " ---- " + orders.length)

        let country = subAccount.country
        system_order_id = 0
        try {
            pass_check = subAccount.password.split("\r")

            subAccount.password = pass_check[0]
        } catch (error) {

        }

        if (!subAccount.user_agent) {
            user_agent = randomUseragent.getRandom(function (ua) {
                return (ua.osName === 'Windows' && ua.osVersion === "10");
            });
        } else {
            user_agent = subAccount.user_agent
        }

        if (!subAccount.lang) {
            langs = ["en-GB", "en-US"]

            let rand = Math.floor(Math.random() * langs.length);
            // user_lang = langs[rand]
            user_lang = "en-US"
            console.log("Ngôn ngữ trình duyệt: " + user_lang)

        } else {
            user_lang = subAccount.user_lang
        }

        let profileChrome = profileDir + subAccount.username
        // proxy = {}
        // console.log(proxy)
        let option1 = {
            user_agent: user_agent,
            proxy: proxy,
            profile_dir: profileChrome,
            cookie: subAccount.cookie,
            network: slaveInfo.network,
            headless_mode: headless_mode,
            user_lang: user_lang
        }

        last_request_success = moment();
        let browser = await gen_browser(option1)

        last_request_success = moment();
        let page = await gen_page(browser, option1)
        //   await page.evaluateOnNewDocument(preloadFile);

        //  await page.emulate(m);

        try {
            last_request_success = moment();
            let cookie2 = subAccount.cookie
            login_type = ""
            if (cookie2.length > 100) {
                //    cookie2 = JSON.parse(cookie2)
                cookie3 = getCookiesMap(cookie2, "." + shopee_country_1.shopee_short_url)

                console.log("cookie length: " + cookie3.length)

                await page.setCookie(...getCookiesMap(cookie2, "." + shopee_country_1.shopee_short_url))
                console.log(moment().format("hh:mm:ss") + " - Setcookie thành công")
                login_type = "shopee_account"
            } else {
                console.log(" ---- LOGIN GOOGLE ----")
                login_type = "google"
            }
        } catch (e) {
            console.log(" ---- Lỗi set coookie ----")
            console.log(e)
        }

        //  await page.waitForTimeout(999999)


        try {
            last_request_success = moment();
            console.log(moment().format("hh:mm:ss") + " - Load: " + shopee_full_url)
            console.log(moment().format("hh:mm:ss") + " - Check bắt đầu đặt đơn: " + check_order_complete)
            try {
                await page.goto(shopee_full_url)

            } catch (error) {
                return
            }

            last_request_success = moment();
            // login account shopee                    
            let checklogin = await login_shopee(page, subAccount, shopee_full_url, browser, login_type)

            console.log(moment().format("hh:mm:ss") + " - index = " + index + " - check login account: " + subAccount.username + " - " + checklogin)

            if (checklogin == 0 || checklogin == 4) {
                await browser.close();
                return
            }

            if (checklogin == 2 || checklogin == 3) {
                console.log(moment().format("hh:mm:ss") + " - Cập nhật tài khoản lỗi")
                accountInfo = {
                    user: subAccount.username,
                    pass: subAccount.password,
                }

                if (checklogin == 2) {
                    accountInfo.message = "Account bị khoá"
                    accountInfo.status = 2
                }

                if (checklogin == 3) {
                    accountInfo.message = "Sai thông tin đăng nhập"
                    accountInfo.status = 3
                }

                last_request_success = moment();
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
                return false
            }

          
            if (checklogin == 1) {

                if (slaveInfo.type == "order_system") {
                    console.log(moment().format("hh:mm:ss") + " --- Đặt đơn tự động ---")

                    if (orders.length) {
                        if (mode == "DEV") {
                            //   max_turn = 1
                            max_turn = orders.length
                        } else {
                            max_turn = orders.length
                        }
                    } else {
                        max_turn = 1
                    }


                    for (let o = 0; o < max_turn; o++) {

                        if (orders.length == 0) {
                            console.log(moment().format("hh:mm:ss") + " --- Không có đơn hàng -- nuôi tk --- ")
                            random_1 = random_int(6, 2)

                            last_request_success = moment();
                            await page.goto(shopee_full_url)
                            await page.waitForTimeout(delay(20000, 10000))

                            last_request_success = moment();
                            let category = await page.$$(".home-category-list__category-grid")
                            if (category.length) {

                                last_request_success = moment();
                                let random_2 = random_int((category.length - 1), 0)
                                await category[random_2].click()
                                console.log(moment().format("hh:mm:ss") + " --- Click danh mục --- " + random_2)
                            }

                            for (let i = 0; i < random_1; i++) {
                                last_request_success = moment();
                                await page.waitForTimeout(delay(20000, 10000))
                                await page.keyboard.press("PageDown");

                                console.log(moment().format("hh:mm:ss") + " --- xem danh mục --- " + i)
                            }

                            console.log("Shopee full url= " + shopee_full_url)
                            last_request_success = moment();
                            cookies22 = await page.cookies(shopee_full_url)

                            cookie1 = cookie_to_string(cookies22)
                            let data_clone = {}
                            data_clone.clone_id = subAccount.id
                            data_clone.cookie = cookie1
                            data_clone.action = "care_clone"

                            //   console.log("cookie clone: " + shopee_cookie.length)
                            last_request_success = moment();
                            await api.updateCookie(data_clone, 1)

                            await browser.close()
                            return
                        }

                        let order_1 = orders[0]
                        console.log("ORDER id: " + order_1.id)

                        let product_link = order_1.product_link

                        let shopee_country_url = shopee_full_url

                        let productForUser                     // Mảng chứa thông tin sản phẩm, từ khoá cần tương tác

                        let check_product_exit = "Có tồn tại"
                        // Luư lịch sử thao tác
                        productForUser = orders[o]

                        productForUser.username = subAccount.username
                        productForUser.password = subAccount.password
                        productForUser.clone_id = subAccount.id
                        productForUser.shopee_point = shopee_point
                        productForUser.shopee_country_url = shopee_country_url
                        productForUser.slave = slavenumber

                        productForUser.ip = proxy.proxy_ip;
                        last_request_success = moment();
                        productForUser.local_ip = ip_address.address()

                        let shopInfo3 = {
                            cover: false,
                            name: false,
                            followed: 0
                        }

                        let check_add_cart


                        try {
                            last_request_success = moment();
                            await page.waitForSelector(".shopee-searchbar-input")

                        } catch (error) {
                            console.log(moment().format("hh:mm:ss") + " --- Loi login: ")
                            await browser.close()
                            update_error_data = {}
                            update_error_data.order_id = productForUser.id
                            update_error_data.username = productForUser.username
                            update_error_data.slave = productForUser.slave
                            update_error_data.error_code = 1019
                            update_error_data.product_link = productForUser.product_link
                            update_error_data.error_message = error.message
                            update_error_data.error_log = "Có lỗi hệ thống khi thêm địa chỉ, vui lòng kiểm tra lại"
                            console.log(moment().format("hh:mm:ss") + " -- Lỗi hệ thống khi thêm địa chỉ ");
                            console.log(error)
                            last_request_success = moment();
                            await api.update_error(update_error_data, 4)
                            return
                        }

                       

                        last_request_success = moment();
                        let delete_cart = await actionShopee.remove_cart(page, productForUser)
                        console.log(moment().format("hh:mm:ss") + " --- Xoá giỏ hàng: " + delete_cart)
                        if (delete_cart == 0) {
                            await browser.close()
                            return
                        }

                        await page.waitForTimeout(delay(3000, 2000))
                        if (o == 0) {
                            console.log("country shopee link: " + shopee_country_url)


                            let cookie1
                            let shopee_cookie = await page.cookies(shopee_country_url)
                            cookie1 = cookie_to_string(shopee_cookie)

                            let data_clone = {}
                            data_clone.clone_id = subAccount.id
                            data_clone.cookie = cookie1
                            data_clone.action = "care_clone"

                            last_request_success = moment();
                            await api.updateCookie(data_clone, 1)

                            await page.waitForTimeout(delay(6000, 4000))

                            last_request_success = moment();
                            last_request_success = moment();
                            await update_order_status(shopee_country_url, cookie1)


                            let check_add_address = await add_address(page, productForUser, shopee_cookie)
                            // await page.waitForTimeout(999999)
                            if (check_add_address == 0) {
                                await browser.close()
                                return
                            }
                        }

                        if (pending_check == 1) {
                            console.log(" ---- pending check ----")
                            await sleep(9999999)
                        }

                        await page.on('response', async (response) => {
                            let url = response.url()
                            let productInfo1, productInfo2

                            let checkUrlShop = url.split("shop/get_shop_detail")

                            try {
                                if (checkUrlShop.length > 1) {
                                    last_request_success = moment();
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

                            }
                            // check add card
                            let check_add_to_cart = url.split("api/v4/cart/add_to")
                            if (check_add_to_cart.length > 1) {
                                last_request_success = moment();
                                let check = await response.json()
                                if (check.error == 0) {
                                    check_add_cart = true
                                }

                                console.log(moment().format("hh:mm:ss") + " - Kiểm tra bỏ giỏ: " + check_add_cart)
                            }

                            let check_order = url.split("api/v4/checkout/place_or")
                            if (check_order.length > 1) {
                                last_request_success = moment();
                                check_order_complete = true
                                console.log(moment().format("hh:mm:ss") + " - Kiểm tra đặt hàng: " + check_order_complete)
                            }

                            check_link_san_pham = url.split("item/get?itemid=" + productForUser.product_id)
                            if (check_link_san_pham.length > 1) {
                                last_request_success = moment();
                                try {
                                    console.log(moment().format("hh:mm:ss") + " - Lấy thông tin sản phẩm")
                                    let productInfo1 = await response.json()
                                    productInfo2 = productInfo1.data
                                    productForUser.product_image = ""
                                    productForUser.product_name = productInfo2.name
                                    productForUser.product_image = productInfo2.image
                                    productForUser.liked = productInfo2.liked
                                    productForUser.product_models = productInfo2.models

                                } catch (error) {
                                    check_product_exit = "Không tồn tại"
                                    console.log(moment().format("hh:mm:ss") + " - Sản phẩm không tồn tại")
                                }
                            }
                        });


                        try {
                            last_request_success = moment();
                            await page.goto(productForUser.product_link, {
                                waitUntil: "networkidle0",
                                timeout: 50000
                            });
                        } catch (error) {
                            console.log(error)
                            await browser.close()
                            return
                        }


                        if (check_product_exit === "Có tồn tại") {
                            try {
                                let check_action

                                console.log("Local IP: " + productForUser.local_ip);
                                console.log("Ip mới: " + proxy.proxy_ip)
                                console.log("Shop id: " + productForUser.shop_id)
                                console.log("product link: " + productForUser.product_link)
                                console.log("product name: " + productForUser.product_name)
                                console.log("product id: " + productForUser.product_id)
                                console.log("ORDER id: " + productForUser.id)
                                system_order_id = productForUser.id
                                products_name.push(productForUser.product_name)

                                product_order_info = productForUser

                                product_order_info.shopee_country_url = shopee_country_url

                                cookies22 = await page.cookies(shopee_country_url)

                                productForUser.cookie = cookies22
                                productForUser.user_agent = user_agent
                                productForUser.user_lang = user_lang
                                cookie1 = ""

                                cookie1 = cookie_to_string(cookies22)

                                let check_confirm = await page.$(".shopee-alert-popup__btn")
                                if (check_confirm) {
                                    await check_confirm.click(".shopee-alert-popup__btn")
                                }

                                // cập nhật thông tin đơn hàng

                                await page.waitForTimeout(delay(4000, 2000))

                                // if (options.add_cart) {
                                last_request_success = moment();
                                check_point = await api.check_point_hour(productForUser.uid)
                                if (check_point) {
                                    random_add_cart = Math.floor(Math.random() * 4);

                                    last_request_success = moment();
                                    let check_1 = await actionShopee.action_add_cart(page, productForUser)

                                    if (check_1) {

                                        //    console.log(moment().format("hh:mm:ss") + "- Bỏ giỏ ok- " + productForUser.product_id + " : " + check_add_cart)
                                    } else {
                                        console.log(moment().format("hh:mm:ss") + "- Có lỗi khi chọn sản phẩm - " + productForUser.product_id + " : " + check_add_cart)
                                        await browser.close()
                                        return
                                    }

                                } else {
                                    console.log(moment().format("hh:mm:ss") + "-Hết điểm số ")
                                    await browser.close()
                                }

                            } catch (error) {
                                console.log(error)

                            }

                            //    await removeCart(page)
                            await page.waitForTimeout(delay(3000, 2000));
                        }
                    }

                    product_order_info.products_name = products_name
                    product_order_info.voucher = voucher


                    last_request_success = moment();
                    let check_2 = await actionShopee.action_order(page, product_order_info)
                    product_order_info.action = "order_product"

                    await sleep(delay(6000, 4000));
                    console.log(moment().format("hh:mm:ss") + " - Quá trình đặt đơn: " + check_2.code)
                    //await page.waitForTimeout(999999);

                    if (check_2.code == 1) {
                        console.log("ORDER RESULT: " + check_order_complete)
                        if (check_order_complete == true) {
                            //    await sleep(delay(6000, 5000))
                            console.log(moment().format("hh:mm:ss") + " - Đặt đơn thành công")
                            product_order_info.result = "success"
                            last_request_success = moment();
                            await api.updatePoint(product_order_info, 3)
                            cookies22 = await page.cookies(shopee_full_url)

                            cookie1 = ""

                            cookie1 = cookie_to_string(cookies22)

                            try {
                                console.log(moment().format("hh:mm:ss") + " --- Lấy thông tin đơn hàng mới tạo: ")
                                last_request_success = moment();
                                order_id_list = await shopeeApi.get_all_order_list(shopee_full_url, cookie1, 5, 0)

                                if (order_id_list.length) {
                                    last_request_success = moment();
                                    order_detail = await shopeeApi.get_order_detail(shopee_full_url, order_id_list[0].shopee_order_id, cookie1)
                                    order_detail.primary_buttons = ""
                                    order_detail.secondary_buttons = ""
                                    order_detail.notification_bar = ""
                                    order_detail.guarantee = ""
                                    order_detail.ereceipt = ""
                                    order_detail.coins = ""
                                    order_detail.components = ""
                                    order_detail.shopee_order_id = order_id_list[0]
                                    order_detail.country = country
                                    order_detail.id = system_order_id
                                    last_request_success = moment();
                                    await api.updateOrder(order_detail, 3)
                                }

                            } catch (error) {
                                console.log(moment().format("hh:mm:ss") + " --- Có lỗi khi Lấy thông tin đơn hàng mới tạo: ")
                                console.log(error)
                            }

                        } else {
                            product_order_info.result = "fail"
                        }

                    } else {
                        product_order_info.result = "fail"
                    }

                    product_order_info.voucher = check_2.voucher
                    await api.updateHistory(product_order_info, 3)
                    console.log(moment().format("hh:mm:ss") + " -  ----------- Kết thúc tương tác Tab: " + index)
                }
                // if (pending_check == 1) {
                //     console.log(" ---- pending check ----")
                //     await sleep(9999999)
                // }
                //    await sleep(999999);
                await browser.close();
            }
        } catch (error) {
            console.log(error)
        } finally {
            if (os_slave == "LINUX") {
                shell.exec('pm2 flush');
                shell.exec('rm ~/.pm2/pm2.log');
                shell.exec('pm2 restart all');
            }
        }

    })
}

setInterval(async function () {
    try {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), "LAST:", last_request_success.format('MM/DD/YYYY HH:mm:ss'));
        if (moment(last_request_success).add(10, 'minutes') < moment()) {
            if (os_slave == "LINUX") {
                shell.exec('pm2 flush');
                shell.exec('rm ~/.pm2/pm2.log');
                shell.exec('pm2 restart all');
            }
        }
    }
    catch (ex) {
        console.log(moment().format('YYYY-MM-DD HH:mm:ss'), "ERROR:", ex);
    }
}, 30000);

//Cron 1 phút 1 lần 

//(async () => {

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


//})();

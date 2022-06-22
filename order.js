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
const { v4: uuidv4 } = require('uuid');
var fs = require('fs');

//$env:PWDEBUG=1

headless_mode = false
const {
    webkit,
    firefox,
    chromium
} = require('playwright');
const { address } = require('ip');


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


add_address = async (page, product, cookies) => {
    try {



        const apiRequestContext = await page.request;

        let add_address_url = product.shopee_country_url + "/api/v0/addresses/add/"
        let get_address_url = product.shopee_country_url + "/api/v4/account/address/get_user_address_list?with_warehouse_whitelist_status=true"
        let address_account_url = product.shopee_country_url + "/user/account/address"
        
        
        // // get address list
        let address_list = await apiRequestContext.get(get_address_url)

        let address_list_1 = await address_list.json();
        console.log("số địa chỉ hiện có qua api: " + address_list_1.data.addresses.length)

        // if (address_list_1.data.addresses.length) {
        //     address_list_1 = address_list_1.data.addresses

        //     console.log(moment().format("hh:mm:ss") + " -- Xoá địa chỉ cũ");
        //     for (let a = (address_list_1.length-1) ; a >=0 ; a--) {
        //         let add = address_list_1[a]

        //         let delete_address_url = product.shopee_country_url + "/api/v4/account/address/delete_user_address/"
        //         let delete_address = await apiRequestContext.post(delete_address_url, {
        //             data: {
        //                 address_id: add.id
        //             }
        //         }
        //         )
        //         if (delete_address.status() != 200) {
        //             console.log('Lỗi không thể xoá địa chỉ', delete_address.status());
        //             return;
        //         }
        //     }

        //     console.log(moment().format("hh:mm:ss") + " -- Xoá địa chỉ cũ ok");
        // }

        await page.goto(address_account_url)
        await page.waitForTimeout(3000)
        let check_address = await page.$$('text=Delete')
        console.log("Số địa chỉ đang có: " + check_address.length)
        if (check_address.length) {

            console.log(moment().format("hh:mm:ss") + " -- Xoá địa chỉ cũ");
            for (let i = 0; i < check_address.length; i++) {
                await page.locator('text=Delete').click();
                await page.waitForTimeout(1000)
                await page.locator('[aria-label="Delete Address\\?"] button:has-text("Delete")').click();
                await page.waitForTimeout(1000)
            }
        }

        console.log(moment().format("hh:mm:ss") + " -- Thêm địa chỉ ");
        let domain = product.shopee_country_url.split("/")
        domain = domain[domain.length - 1]

        const csrftoken = cookies.filter(x => x.domain.includes(domain) && x.name == 'csrftoken')[0].value;

        request = await apiRequestContext.post(add_address_url, {
            multipart: {
                'name': 'Toan Tran',
                'phone': '60168961369',
                'country': 'MY',
                'state': 'Kuala Lumpur',
                'city': 'Kuala',
                'district': 'Bandar Kuala Lumpur',
                'address': '35 Jalan Perpaduan Desa Lawan Kuda 31600 Gopeng Perak Malaysia',
                'place': 'DO_NOT_CHANGE__I_AM_MAGIC',
                'label': 'label_address_label_work',
                'label_id': '1',
                'add_only': false,
            },
            headers: {
                "referer": product.shopee_country_url + `/user/account/address`,
                "x-csrftoken": csrftoken
            }
        });
        if (request.status() != 200) {
            console.log('Lỗi không thể thêm địa chỉ', request.status());
            return;
        }
        body = await request.json();


        if (body.addressid) {
            console.log(JSON.stringify(body));
            let address_id = body.addressid
            console.log(moment().format("hh:mm:ss") + " -- Thêm địa chỉ thành công ");

            // Set địa chỉ defautl
            let default_address_url = product.shopee_country_url + "/api/v0/addresses/" +address_id  +"/set_default/"
            console.log(default_address_url)
            let set_defaut = await apiRequestContext.post(default_address_url, {
                headers: {
                    "referer": product.shopee_country_url + `/user/account/address`,
                    "x-csrftoken": csrftoken
                }
            })
            set_defaut = await set_defaut.json()
            if(set_defaut.success == true){
                console.log(moment().format("hh:mm:ss") + " -- Thêm địa chỉ mặc đỊnh thành công ");
            }

            return 1
        } else {
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Thông tin địa chỉ không đúng, vui lòng kiểm tra lại"
            console.log(moment().format("hh:mm:ss") + " -- Địa chỉ không đúng ");
            await update_error(update_error_data, 4)
            return 0
        }
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_log = "Có lỗi khi thêm địa chỉ, vui lòng kiểm tra lại"
        console.log(moment().format("hh:mm:ss") + " -- Lỗi hệ thống khi thêm địa chỉ ");
        console.log(error)
        await update_error(update_error_data, 4)
        return 0
    }
}


action_order = async (page, product) => {

    try {
        await page.goto(product.shopee_country_url + "/cart")
        await page.waitForTimeout(5000)
        // Chọn sản phẩm đặt hàng

        let products_1 = product.products_name

        products_1.forEach(async e => {
            console.log(e)
            await page.locator('text=' + e + 'Va >> label div').click();
            await page.waitForTimeout(1000)

        })

        // await page.locator('text=Abaya Fashion Stripe Muslim Dress Women Long Sleeve Pocket Casual Robe DressesVa >> label div').click();
        // await page.locator('text=Abaya Muslim Elegant Dress Plain Women Fashion Jubah Long Sleeve Belted DressesVa >> label div').click();

        await page.waitForTimeout(3000)
        page.locator('button:has-text("check out")').click()
        await page.waitForTimeout(2000)

        let check_select_item = await page.$$('text=You have not selected any items for checkout')
        if (check_select_item.length) {
            await page.locator('text=You have not selected any items for checkout').click();
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Có lỗi hệ thống khi chọn sản phẩm"
            await update_error(update_error_data, 4)
            return 0
        }


        let check_btn_cod = await page.$$('text=Cash on Delivery')
        if (check_btn_cod.length) {
            page.locator('text=Cash on Delivery').click()
            await page.waitForTimeout(2000)
            await page.locator('text=Place Order').click();
            await page.waitForTimeout(2000)
        } else {

            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Không tìm thấy chế độ thanh toán khi nhận hàng. Hệ thống sẽ thử đặt hàng lại sau"
            await update_error(update_error_data, 4)
            return 0
        }
    } catch (error) {

        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_log = "Có lỗi hệ thống khi đặt hàng"
        console.log(error)
        await update_error(update_error_data, 4)
        return 0
    }
    return 1

}

action_add_cart = async (page, product) => {

    try {
        let product_info = product.product_info
        product_info = JSON.parse(product_info)

        let product_models = product.product_models
        let check_variation = 0
        let variation_1

        if (product_info.color && product_info.size) {
            variation_1 = product_info.color + "," + product_info.size
        } else if (!product_info.color && product_info.siz) {
            variation_1 = product_info.size
        } else if (product_info.color && !product_info.siz) {
            variation_1 = product_info.color
        }


        if (product_models.length) {
            product_models.forEach(e => {

                if (e.name == variation_1 && e.normal_stock > 0) {
                    // còn hàng
                    check_variation = 1
                    console.log(moment().format("hh:mm:ss") + " -- " + variation_1 + " còn sản phẩm ");
                }
            })
        }

        if (check_variation == 1) {
            // Chọn màu
            if (product_info.color) {
                await page.locator('[aria-label=' + product_info.color + ']').click();
                await page.waitForTimeout(5000)
                console.log(moment().format("hh:mm:ss") + " Chọn Màu OK ");
            }

            if (product_info.size) {
                await page.locator('[aria-label=' + product_info.size + ']').click();
                await page.waitForTimeout(5000)
                console.log(moment().format("hh:mm:ss") + " Chọn Size OK ");
            }
        } else {
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Lỗi khi chọn phân loại hàng, hoặc sản phẩm hết hàng"
            await update_error(update_error_data, 4)
            return 0
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

        return 1
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_log = "Lỗi hệ thống khi chọn phân loại hàng, hoặc sản phẩm hết hàng"
        await update_error(update_error_data, 4)
        console.log(error)
        return 0
    }

}

remove_cart = async (page, product) => {

    try {
        await page.goto(product.shopee_country_url + "/cart")
        await page.waitForTimeout(2000)

        let check_product_cart = await page.$$('text=Delete')

        console.log("Số đơn hàng cần xoá: " + check_product_cart.length)

        for (let i = 0; i < check_product_cart.length; i++) {
            await page.locator('text=Delete').first().click();
            await page.waitForTimeout(2000)

        }

    } catch (error) {
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


update_error = async (product9, limit) => {
    // const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

    await axios.post(update_error_url, {
        data: product9,
        timeout: 50000
    },
        {
            // httpsAgent: httpsAgent
        })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update error: " + response.data);
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update error lỗi");
            //      await updateErrorLogs(error, product9.slave)
            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                await update_error(product9, limit)
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
            console.log(moment().format("hh:mm:ss") + " - Update cookie: " + response.data);
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
    console.log(moment().format("hh:mm:ss") + " - update_point");
    product9.cookie = "";

    await axios.post(update_point_url, {
        data: product9,
        timeout: 50000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update point: " + response.data);
            console.log(response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update point lỗi");

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

    const PROFILE_NAME = uuidv4();

    if (fs.existsSync(`./firefox-profile`)) {
        fs.rmSync(`./firefox-profile`, { recursive: true, force: true });
    }
    if (!fs.existsSync(`./firefox-profile`)) {
        fs.mkdirSync(`./firefox-profile`);
    }
    if (!fs.existsSync(`./firefox-profile/${PROFILE_NAME}`)) {
        fs.mkdirSync(`./firefox-profile/${PROFILE_NAME}`);
        // fs.mkdirSync(`./firefox-profile/${PROFILE_NAME}/extensions`);
        // const extensions = fs.readdirSync(`./firefox-extensions`).filter(x => x.endsWith('.xpi'));
        // for (let i = 0; i < extensions.length; i++) {
        //     fs.copyFileSync(`./firefox-extensions/${extensions[i]}`, `./firefox-profile/${PROFILE_NAME}/extensions/${extensions[i]}`)
        // }
    }
    var context = await firefox.launchPersistentContext(
        `./firefox-profile/${PROFILE_NAME}`,
        {
            proxy: {
                server: `${proxy1.proxy_ip}:${proxy1.proxy_port}`,
                username: proxy1.proxy_username,
                password: proxy_pass
            },
            headless: false
        }
    );

    return context
}



runAllTime = async () => {
    slaveInfo = []
    getDataShopee = []
    dataShopee = []
    products_name = []
    check_order_complete = false

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
    update_error_url = updateActionsUrl + "/api_user/update_error"     // Update error
    update_cookie_url = updateActionsUrl + "/api_user/update_cookie"     // Update cookie
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
        let product_order_info = {}
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

        const context = await gen_browser(firefox, option1)

        //   const context = await browser.newContext()

        const page = await context.pages()[0];

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



                        let productForUser                     // Mảng chứa thông tin sản phẩm, từ khoá cần tương tác
                        let check_like = 0
                        let check_follow = 0

                        let check_product_exit = "Có tồn tại"
                        let actions = []                            // Luư lịch sử thao tác
                        productForUser = orders[o]

                        productForUser.username = subAccount[0]
                        productForUser.password = subAccount[1]
                        productForUser.clone_id = subAccount[2]
                        productForUser.shopee_point = shopee_point
                        productForUser.shopee_country_url = shopee_country_url
                        productForUser.slave = slavenumber

                        productForUser.ip = proxy.proxy_ip;
                        productForUser.local_ip = ip_address.address()

                        let shopInfo3 = {
                            cover: false,
                            name: false,
                            followed: 0
                        }


                        let check_add_cart

                        if (o == 0) {
                            console.log("country shopee link: " + shopee_country_url)
                            let shopee_cookie = await context.cookies(shopee_country_url)
                            let data_clone = {}
                            data_clone.clone_id = acc.id
                            data_clone.cookie = shopee_cookie
                            await updateCookie(data_clone, 1)

                            let check_add_address = await add_address(page, productForUser, shopee_cookie)
                            await page.waitForTimeout(999999)
                            if (check_add_address == 0) {
                                shell.exec('pm2 restart all');
                            }
                        }

                        await page.on('response', async (response) => {
                            let url = response.url()
                            let productInfo1, productInfo2


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
                            // check add card
                            let check_add_to_cart = url.split("api/v4/cart/add_to")
                            if (check_add_to_cart.length > 1) {

                                let check = await response.json()
                                if (check.error == 0) {
                                    check_add_cart = true
                                } else {
                                    check_add_cart = false
                                }

                                console.log(moment().format("hh:mm:ss") + " - Kiểm tra bỏ giỏ: " + check_add_cart)
                            }

                            let check_order = url.split("api/v4/checkout/place_or")
                            if (check_order.length > 1) {
                                check_order_complete = true

                                console.log(moment().format("hh:mm:ss") + " - Kiểm tra đặt hàng: " + check_order_complete)
                            } else {
                                check_order_complete = false
                            }

                            check_link_san_pham = url.split("item/get?itemid=" + productForUser.product_id)
                            if (check_link_san_pham.length > 1) {

                                try {
                                    console.log(moment().format("hh:mm:ss") + " - Lấy thông tin sản phẩm")
                                    let productInfo1 = await response.json()
                                    productInfo2 = productInfo1.data
                                    productForUser.product_image = ""
                                    productForUser.product_image = productInfo2.image
                                    productForUser.liked = productInfo2.liked
                                    productForUser.product_models = productInfo2.models

                                } catch (error) {
                                    check_product_exit = "Không tồn tại"
                                    console.log(moment().format("hh:mm:ss") + " - Sản phẩm không tồn tại")
                                }
                            }
                        });


                        console.log("Local IP: " + productForUser.local_ip);
                        console.log("Ip mới: " + proxy.proxy_ip)
                        console.log("Shop id: " + productForUser.shop_id)
                        console.log("product link: " + productForUser.product_link)
                        console.log("product name: " + productForUser.product_name)
                        console.log("product id: " + productForUser.product_id)

                        products_name.push(productForUser.product_name)

                        check_point = await check_point_hour(productForUser.uid)

                        product_order_info = productForUser

                        product_order_info.shopee_country_url = shopee_country_url

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

                                // if (options.add_cart) {
                                check_point = await check_point_hour(productForUser.uid)
                                if (check_point) {
                                    random_add_cart = Math.floor(Math.random() * 4);

                                    let check_1 = await action_add_cart(page, productForUser)

                                    if (check_1) {

                                        console.log(moment().format("hh:mm:ss") + "- Bỏ giỏ ok- " + productForUser.product_id + " : " + check_add_cart)
                                    } else {
                                        console.log(moment().format("hh:mm:ss") + "- Có lỗi khi chọn sản phẩm - " + productForUser.product_id + " : " + check_add_cart)

                                    }

                                } else {
                                    break
                                }

                            } catch (error) {
                                console.log(error)
                                // await updateErrorLogs(error, slavenumber)
                            }

                            //    await removeCart(page)
                            await page.waitForTimeout(1000);

                        }

                        console.log(moment().format("hh:mm:ss") + " -  ----------- Kết thúc tương tác san pham: " + o)
                    }

                    product_order_info.products_name = products_name


                    let check_2 = await action_order(page, product_order_info)
                    await page.waitForTimeout(3000);
                    //  check_2 = 1
                    if (check_2 == 1) {
                        if (check_order_complete == true) {
                            console.log(moment().format("hh:mm:ss") + " - Đặt đơn thành công")
                            console.log(moment().format("hh:mm:ss") + " - update point")
                            product_order_info.action = "order_product"
                            await updatePoint(product_order_info, 3)
                        }

                    } else {

                    }

                    let delete_cart = await remove_cart(page, product_order_info)

                    await page.waitForTimeout(999999);
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
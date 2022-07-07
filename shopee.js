require('dotenv').config();
var fs = require('fs');
const shopeeApi = require('./src/shopeeApi.js')
const actionsShopee = require('./src/actions.js')
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
account_check = process.env.ACCOUNT_CHECK
product_check = process.env.PRODUCT_CHECK
keyword_check = process.env.KEYWORD_CHECK

chromiumDir = process.env.CHROMIUM_DIR                     // Đường dẫn thư mục chromium sẽ khởi chạy
let profileDir = process.env.PROFILE_DIR
phobien = process.env.PHO_BIEN         //Chế độ chạy phổ biến
// Danh sách profile fb trong file .env
maxTab = process.env.MAXTAB_SHOPEE  // Số lượng tab chromium cùng mở tại 1 thời điểm trên slave
max_turn = process.env.MAX_TURN  // Số lượng keyword trên slave
headless_mode = process.env.HEADLESS_MODE     // che do chay hien thi giao dien
//disable_image = process.env.DISABLE_IMAGE     // k load ảnh
disable_css = process.env.DISABLE_CSS     // k load css
os_slave = process.env.OS     // k load css
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
    apiUrl = "http://beta.aos.asia"
    updateActionsUrl = "https://beta.aos.asia"


} else {
    apiUrl = "http://api.aos.asia"
    apiServer = "http://history.aos.asia:4000"
    updateActionsUrl = "https://api.aos.asia"
}

shopee_account_update_url = apiUrl + "/api_user/shopeeAccountUpdate" // Link update account shopee status
data_shopee_url = apiUrl + "/api_user/dataShopee"     // Link shopee update thứ hạng sản phẩm
shopee_update_seo_san_pham_url = apiUrl + "/api_user/shopeeUpdateSeoSanPham"     // Link shopee update seo sản phẩm

update_actions_url = updateActionsUrl + "/api_user/update_action"     // Update actions
update_error_url = updateActionsUrl + "/api_user/update_error"     // Update error
update_cookie_url = updateActionsUrl + "/api_user/update_cookie"     // Update cookie
update_point_url = updateActionsUrl + "/api_user/update_point"     // Update actions
update_history_url = updateActionsUrl + "/api_user/update_history"     // Update history

getSlaveAccountDir = apiUrl + "/api_user/getSlaveAccount"     // Lay tai khoan shopee cho slave
getSlaveInfo = apiUrl + "/api_user/getSlaveInfo"     // Lay thong tin cau hinh slave


if (mode === "DEV") {
    timemax = 3000;
    timemin = 2000;
} else {
    timemax = 3000;
    timemin = 2000;
}
logs = 1


add_address = async (page, product, cookies) => {
    try {

        const apiRequestContext = await page.request;

        let add_address_url = product.shopee_country_url + "/api/v0/addresses/add/"
        let get_address_url = product.shopee_country_url + "/api/v4/account/address/get_user_address_list?with_warehouse_whitelist_status=true"
        let address_account_url = product.shopee_country_url + "/user/account/address"


        // // get address list
        // let address_list = await apiRequestContext.get(get_address_url)

        // let address_list_1 = await address_list.json();

        // if (address_list_1.data.addresses) {
        //     console.log("số địa chỉ hiện có qua api: " + address_list_1.data.addresses.length)
        // } else {
        //     console.log("số địa chỉ hiện có qua api: " + 0)
        // }


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
        await page.waitForTimeout(delay(6000, 4000))
        await page.goto(address_account_url)
        await page.waitForTimeout(delay(6000, 4000))
        let check_address = await page.$x("//div[contains(text(), 'Full Name')]")

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

        // data.append('name', product.rec_name);
        // data.append('phone', product.rec_phone)
        // data.append('icno', '');
        // data.append('country', address_data.country);
        // data.append('state', address_data.city);
        // data.append('city', 'Kinta');
        // data.append('district', 'Ulu Kinta');
        // data.append('town', 'Ipoh');
        // data.append('address', '116h, Jalan Kampar, 30250');
        // data.append('zipcode', '30250');
        // data.append('set_default', '1');
        // data.append('place', 'DO_NOT_CHANGE__I_AM_MAGIC');
        // data.append('add_only', 'false');

        //  console.log(data)

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
            await update_error(update_error_data, 4)
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
        await update_error(update_error_data, 4)
        return 0
    }
}


action_order = async (page, product) => {

    try {
        await page.goto(product.shopee_country_url + "/cart")
        await page.waitForTimeout(delay(6000, 4000))
        // Chọn sản phẩm đặt hàng

        let products_1 = product.products_name
        let voucher_1 = product.voucher
        voucher_2 = ""
        products_1.forEach(async e => {
            console.log(e)
            let check_1 = await page.$$('[title="' + e + '"]');
            if (check_1.length) {
                await page.evaluate((a) => {
                    document.querySelectorAll('[title="' + a + '"]')[1].parentElement.parentElement.parentElement.parentElement.childNodes[0].children[0].click()
                }, e)
                await page.waitForTimeout(delay(3000, 1000))
            }

        })

        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link

        // await page.locator('text=Abaya Fashion Stripe Muslim Dress Women Long Sleeve Pocket Casual Robe DressesVa >> label div').click();
        // await page.locator('text=Abaya Muslim Elegant Dress Plain Women Fashion Jubah Long Sleeve Belted DressesVa >> label div').click();
        await page.keyboard.press("PageDown");

        await page.waitForTimeout(delay(4000, 3000))
        check_1 = await page.$$('.shopee-button-solid--primary')
        if (check_1.length) {
            await check_1[0].click()
        }
        //await page.waitForTimeout(8600)
        await page.waitForSelector('.shopee-svg-icon.icon-voucher-line')
        await page.waitForTimeout(delay(9000, 8000))

        let check_select_item = await page.$$('.shopee-alert-popup__message')
        if (check_select_item.length) {
            //  await page.locator('text=You have not selected any items for checkout').click();

            update_error_data.error_code = 1002
            update_error_data.error_log = "Có lỗi hệ thống khi chọn sản phẩm"
            console.log(moment().format("hh:mm:ss") + " -- Lỗi hệ thống khi  chọn sản phẩm ");
            await update_error(update_error_data, 4)
            let result = {
                code: 0,
                voucher: ""
            }
            return result
        }

        // add voucher
        if (voucher_1.length) {
            console.log(moment().format("hh:mm:ss") + " -- Add voucher sản phẩm ");

            let fee_ship_1 = 0
            let fee_ships = await page.evaluate((x) => {
                let fee_ship_2
                document.querySelectorAll('div').forEach(e => {
                    if (e.textContent == 'Shipping Option:') {
                        a = e.parentElement.children[5].textContent
                        fee_ship_2 = a
                        console.log(a)
                    }
                })
                return fee_ship_2
            })

            await page.waitForTimeout(delay(4000, 3000))

            console.log(moment().format("hh:mm:ss") + " -- Fee Ship: " + fee_ships);


            // await page.waitForTimeout(999999)
            if (product.country == "PH") {
                if (fee_ships.length > 1) {
                    let check_fee = fee_ships.split("₱")
                    if (check_fee.length > 1) {
                        fee_ship_1 = parseInt(check_fee[1])
                    }
                }
            }
            // const link = await fee_ships[i].$eval('a', a => a.getAttribute('href'));
            //    console.log(moment().format("hh:mm:ss") + " -- Fee Ship: " + fee_ship_1);

            if (fee_ship_1 == 0) {
                //  await page.locator('text=You have not selected any items for checkout').click();

                update_error_data.error_code = 1009
                update_error_data.error_log = "Lỗi hệ thống không tìm thấy phí ship"
                console.log(moment().format("hh:mm:ss") + " -- Lỗi hệ thống không tìm thấy phí ship ");
                await update_error(update_error_data, 4)
                let result = {
                    code: 0,
                    voucher: ""
                }
                return result
            }
            // click select voucher
            let select_voucher = await page.$x("//span[contains(text(), 'Select Voucher')]")

            if (select_voucher.length) {
                await select_voucher[0].click()
                await page.waitForTimeout(delay(4000, 3000))

                for (let y = 0; y < voucher_1.length; y++) {
                    x = voucher_1[y]
                    let p = parseInt(x.price)

                    if (p == fee_ship_1) {
                        console.log("--- Nhập code --")
                        console.log(p + " -- " + x.code + " fee: " + fee_ship_1)
                        await page.type('[placeholder="Shop voucher code"]', x.code)
                        voucher_2 = x.code
                        break
                    }
                }

                let apply = await page.$x("//span[contains(text(), 'Apply')]")

                let check_voucher_3 = await page.$$(".input-with-validator__error-message")

                if (check_voucher_3.length) {
                    update_error_data.error_code = 2001
                    update_error_data.error_log = "Lỗi voucher " + x.code + " Không đúng"
                    console.log(moment().format("hh:mm:ss") + " -- Lỗi voucher " + x.code + " Không đúng");
                    await update_error(update_error_data, 4)
                    let result = {
                        code: 0,
                        voucher: voucher_2
                    }
                    return result
                }

                if (apply.length) {
                    await apply[0].click()
                    await page.waitForTimeout(delay(4000, 3000))
                    let check_voucher_expỉed = await page.$x("//div[contains(text(), 'Sorry, this voucher has expired.')]")
                    if (check_voucher_expỉed.length) {
                        update_error_data.error_code = 2001
                        update_error_data.error_log = "Lỗi voucher " + x.code + " hết hạn"
                        console.log(moment().format("hh:mm:ss") + " -- Lỗi voucher " + x.code + " hết hạn");
                        await update_error(update_error_data, 4)
                        let result = {
                            code: 0,
                            voucher: ""
                        }
                        return result
                    }

                    check_voucher_expỉed = await page.$x("//div[contains(text(), 'You have redeemed this voucher before.')]")
                    if (check_voucher_expỉed.length) {
                        update_error_data.error_code = 2011
                        update_error_data.error_log = "Lỗi voucher " + x.code + " hết hạn cho tài khoản đặt hàng"
                        console.log(moment().format("hh:mm:ss") + " -- Lỗi voucher " + x.code + " hết hạn cho tài khoản đặt hàng");
                        await update_error(update_error_data, 4)

                        let result = {
                            code: 0,
                            voucher: voucher_2
                        }
                        return result
                    }
                }
            }
        }

        let check_not_support_shiping = await page.$x("//span[contains(text(), 'This product does not support the selected shipping option.')]")

        if (check_not_support_shiping.length) {

            update_error_data.error_code = 2012
            update_error_data.error_log = "Lỗi địa chỉ không hỗ trợ ship"
            console.log(moment().format("hh:mm:ss") + " -- Lỗi địa chỉ không hỗ trợ ship ");
            await update_error(update_error_data, 4)
            let result = {
                code: 0,
                voucher: ""
            }
            return result
        }

        await page.waitForTimeout(delay(4000, 3000))
        await page.keyboard.press("PageDown");
        await page.waitForTimeout(delay(4000, 3000))

        let check_btn_cod = await page.$$('[aria-label="Cash on Delivery"]')

        if (check_btn_cod.length >0 ) {
            await check_btn_cod[0].click()
            await page.waitForTimeout(delay(5000, 4000))
        }else{
            check_btn_cod = await page.$x("//div[contains(text(), 'Cash on Delivery')]")
        }
       
        if (check_btn_cod.length) {
           
            let checkout = await page.$$('.stardust-button--primary')
            if (checkout.length) {
                await checkout[0].click()
            }
            await page.waitForTimeout(delay(4000, 3000))

            let check_account_suppen = await page.$x("//p[contains(text(), 'Action Failed (A02): Your account has been suspended as our system detected a suspicious behaviour of mass creation of accounts. Please make sure to comply with Shopee policies.')]")
            if (check_account_suppen.length) {

                update_error_data.error_code = 2005
                update_error_data.error_log = "Tài khoản bị khoá"
                console.log(moment().format("hh:mm:ss") + " -- Tài khoản bị khoá: " + product.username);
                await update_error(update_error_data, 4)
                let result = {
                    code: 0,
                    voucher: ""
                }
                return result
            }
        } else {

            update_error_data.error_code = 1003
            update_error_data.error_log = "Không tìm thấy nút mua hàng, Địa chỉ không đúng, vui lòng kiểm tra lại"
            console.log(moment().format("hh:mm:ss") + " -- Không tìm thấy nút mua hàng, Địa chỉ không đúng, vui lòng kiểm tra lại");
            await update_error(update_error_data, 4)
            let result = {
                code: 0,
                voucher: ""
            }
            return result
        }
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_code = 1004
        update_error_data.error_log = "Có lỗi hệ thống khi đặt hàng"
        console.log(error)
        await update_error(update_error_data, 4)
        let result = {
            code: 0,
            voucher: ""
        }
        return result
    }
    let result = {
        code: 1,
        voucher: voucher_2
    }

    return result

}

action_add_cart = async (page, product) => {

    try {
        let product_info = product.product_info
        product_info = JSON.parse(product_info)

        let product_models = product.product_models
        let check_variation = 0
        let variation_1
        console.log(product_info)
       
        if(product_info.color == "N/A"){
            product_info.color = ""
        }
        if(product_info.size == "N/A"){
            product_info.size = ""
        }

        if (product_info.color && product_info.size) {
            variation_1 = product_info.color + "," + product_info.size
            

        } else if (!product_info.color && product_info.size) {
            variation_1 = product_info.size
        } else if (product_info.color && !product_info.size) {
            variation_1 = product_info.color
        }

        console.log(variation_1)

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
                await page.click('[aria-label="' + product_info.color + '"]');
                await page.waitForTimeout(delay(4000, 3000))
                console.log(moment().format("hh:mm:ss") + " Chọn Màu OK :" + product_info.color);
            }

            if (product_info.size) {
                await page.click('[aria-label="' + product_info.size + '"]');
                await page.waitForTimeout(delay(4000, 3000))
                console.log(moment().format("hh:mm:ss") + " Chọn Size OK: " + product_info.size);
            }
        } else {
            console.log(moment().format("hh:mm:ss") + "Lỗi khi chọn phân loại hàng, hoặc sản phẩm hết hàng");
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.error_code = 2002
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Lỗi khi chọn phân loại hàng, hoặc sản phẩm hết hàng"
            await update_error(update_error_data, 4)
            return 0
        }

        // chọn số lượng
        await page.click('input[role="spinbutton"]', { clickCount: 2 });
        await page.type('input[role="spinbutton"]', product_info.quantity)
        console.log(moment().format("hh:mm:ss") + " Chọn Số lượng OK: " + product_info.quantity);

        let check_btn_add_dard = await page.$$('.btn-tinted')

        if (check_btn_add_dard.length > 1) {
            await check_btn_add_dard[0].click();
        }

        check_error_add = await page.$x("//div[contains(text(), 'Please select product variation first')]")
       
        if (check_error_add.length > 1) {
            console.log(moment().format("hh:mm:ss") + " Lỗi khi chọn phân loại hàng, sai phân loại, biến thể");
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.error_code = 1014
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Lỗi khi chọn phân loại hàng, sai phân loại, biến thể"
            await update_error(update_error_data, 4)
            return 0
        }


        return 1
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_code = 1006
        update_error_data.error_log = "Lỗi hệ thống khi chọn phân loại hàng, hoặc sản phẩm hết hàng"
        await update_error(update_error_data, 4)
        console.log(error)
        return 0
    }

}

remove_cart = async (page, product) => {

    try {
        await page.goto(product.shopee_country_url + "/cart")
        await page.waitForSelector('.cart-page-logo__page-name')
        await page.waitForTimeout(delay(6000, 4000))

        let check_product_cart = await page.$x("//button[contains(text(), 'Delete')]");
        let remove_order = check_product_cart.length - 1
        console.log("Số đơn hàng cần xoá: " + remove_order)

        if (remove_order > 0) {
            for (let i = 0; i < remove_order; i++) {
                await check_product_cart[i].click();
                await page.waitForTimeout(delay(3000, 2000))
            }
        }

    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = product.id
        update_error_data.username = product.username
        update_error_data.slave = product.slave
        update_error_data.product_link = product.product_link
        update_error_data.error_message = error.message
        update_error_data.error_code = 1008
        update_error_data.error_log = "Lỗi hệ thống khi xoá sản phẩm trong giỏ hàng"
        await update_error(update_error_data, 4)
        console.log(error)
        return 0
    }
    return 1

}

login_shopee = async (page, accounts, browser) => {
    try {
        await page.waitForTimeout(delay(4000, 3000))

        let linkHandlers = await page.$x("//button[contains(text(), 'English')]");
        let check_verify = 0
        if (linkHandlers.length > 0) {
            await linkHandlers[0].click();
        }

        await page.waitForTimeout(delay(4000, 3000))
        // let x = Math.floor(Math.random() * 200);
        // let y =Math.floor(Math.random() * 50);
        // console.log(x + "x" + y)
        // await page.mouse.click(x, y)
        await page.click('.header-with-search__logo-wrapper')
        await page.waitForTimeout(delay(4000, 3000))
        let check_login = await page.$$('.navbar__link.navbar__link--account.navbar__link--login')
        console.log("Check chưa login : " + check_login.length)

        if (check_login.length > 0) {
            console.log(" ---- Chưa login tài khoản ----")

            // Click text=Login
            await check_login[0].click();

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
            await page1.type('[autocomplete="username"]', accounts[0], { delay: 100 })    // Nhập user 

            await page1.click('[id="identifierNext"]')
            await page1.waitForTimeout(delay(6000, 4000))
            await page1.waitForSelector('[autocomplete="current-password"]')
            await page1.type('[autocomplete="current-password"]', accounts[1], { delay: 100 })    // Nhập comment 
            await page1.waitForTimeout(delay(3000, 2000))
            let click_next = await page1.$$('[data-is-touch-wrapper="true"]')
            if (click_next.length > 0) {
                await click_next[1].click()
            //    await page1.waitForTimeout(delay(3000, 2000))
            }

        //    

            let check_gmail_block = await page1.$x("//span[contains(text(), 'Your account has been disabled')]");
            
            if(check_gmail_block.length){
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

        }

        await page.waitForTimeout(delay(6000, 4000))
        check_login = await page.$$('.navbar__link.navbar__link--account.navbar__link--login')

        if (check_login.length == 0) {
            console.log(" ---- check login thành công ----" + check_login.length)
            return 1
        } else {
            return 4 // Lỗi đăng nhập
        }
    } catch (error) {
        update_error_data = {}
        update_error_data.order_id = 0
        update_error_data.username = accounts[0]
        update_error_data.slave = slavenumber
        update_error_data.error_code = 1007
        update_error_data.product_link = ""
        update_error_data.error_message = error.message
        update_error_data.error_log = "Lỗi hệ thống khi login"
        await update_error(update_error_data, 4)
        console.log(error)
        return 0
    }

}

delay = (x, y) => {
    a = Math.floor(Math.random() * (x - y)) + y;
    return a
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
                await sleep(delay(5000, 4000))
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

updateHistory = async (product9, limit) => {
    console.log(moment().format("hh:mm:ss") + " - update_history");
    product9.cookie = "";

    await axios.post(update_history_url, {
        data: product9,
        timeout: 50000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update history: " + response.data);
            console.log(response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update history lỗi");

            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                //  await updateCookie(product9, limit)
            } else {
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật history");
                return false
            }
        });
}


action_heart_product = async (page) => {
    try {
        console.log("--- thả tim sản phẩm ---")
        await page.keyboard.press('Home');

        // click tha tim

        await page.waitForTimeout(delay(4000, 3000))

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
        await page.waitForTimeout(delay(4000, 3000))

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
        await page.waitForTimeout(delay(4000, 3000))

        check = await page.$('.section-seller-overview-horizontal__buttons>a')
        if (check) {
            await check.click()
        }
        await page.waitForTimeout(delay(4000, 3000))

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


test_browser = async (option) => {
    let param = [
        // `--user-data-dir=${profile_dir}`,      // load profile chromium
        '--disable-gpu',
        '--no-sandbox',
        '--lang=en-US',
        '--disable-infobars',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--window-position=0,0',
        '--ignore-certifcate-errors-spki-list',
        //  '--lang=' + user_lang,
        '--disable-reading-from-canvas'
    ]

    const browser = await puppeteer.launch({
        //executablePath: chromiumDir,
        headless: headless_mode,
        devtools: false,
        //   userDataDir: `${profile_dir}`,
        args: param
    });

    const page = (await browser.pages())[0];
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



runAllTime = async () => {

    slaveInfo = []
    getDataShopee = []
    dataShopee = []
    products_name = []
    voucher = []
    check_order_complete = 0
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
                    shell.exec('git pull https://magiclovexxx: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@github.com/magiclovexxx/slave_order.git;');
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
    voucher = dataShopee.voucher
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
        let shopee_url = dataShopee.shopee_url
        let shopee_full_url = "https://" + shopee_url

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
        // proxy = {}
        // console.log(proxy)
        let option1 = {
            user_agent: user_agent,
            proxy: proxy,
            profile_dir: profileChrome,
            cookie: acc.cookie,
            network: slaveInfo.network,
            headless_mode: headless_mode,
            user_lang: user_lang
        }

        let browser = await gen_browser(option1)
        let page = await gen_page(browser, option1)

        //  await page.emulate(m);

        try {
            let cookie2 = acc.cookie

            if (cookie2) {
                cookie2 = JSON.parse(cookie2)

                cookie2.forEach(async e => {
                    await page.setCookie(e)
                })
                //await page.setCookie([...cookie2])
                console.log(moment().format("hh:mm:ss") + " - Setcookie thành công")
            }
        } catch (e) {
            console.log(" ---- Lỗi set coookie ----")
            console.log(e)
        }

        //  await page.waitForTimeout(999999)


        try {

            console.log(moment().format("hh:mm:ss") + " - Load: " + shopee_full_url)
            try {
                await page.goto(shopee_full_url)

            } catch (error) {
                return
            }

            // login account shopee                    
            let checklogin = await login_shopee(page, subAccount, browser)

            console.log(moment().format("hh:mm:ss") + " - index = " + index + " - check login account: " + subAccount[0] + " - " + checklogin)

            if (checklogin == 0 || checklogin == 4) {
                await browser.close();
                return
            }

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
                        // Luư lịch sử thao tác
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

                        try {
                            await page.waitForSelector(".shopee-searchbar-input")
                        } catch (error) {
                            console.log(moment().format("hh:mm:ss") + " --- Loi login: ")
                            await browser.close()
                            return
                        }

                        let delete_cart = await remove_cart(page, productForUser)
                        console.log(moment().format("hh:mm:ss") + " --- Xoá giỏ hàng: " + delete_cart)
                        if (delete_cart == 0) {
                            await browser.close()
                            return
                        }

                        await page.waitForTimeout(delay(6000, 4000))
                        if (o == 0) {
                            console.log("country shopee link: " + shopee_country_url)
                            let shopee_cookie = await page.cookies(shopee_country_url)
                            let data_clone = {}
                            let cookie1
                            data_clone.clone_id = acc.id
                            data_clone.cookie = shopee_cookie
                            //   console.log("cookie clone: " + shopee_cookie.length)
                            await updateCookie(data_clone, 1)
                            await page.waitForTimeout(delay(6000, 4000))

                            let check_add_address = await add_address(page, productForUser, shopee_cookie)
                            // await page.waitForTimeout(999999)
                            if (check_add_address == 0) {
                                await browser.close()
                                return
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


                        await page.goto(productForUser.product_link, {
                            waitUntil: "networkidle0",
                            timeout: 50000
                        });

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

                                products_name.push(productForUser.product_name)

                                product_order_info = productForUser

                                product_order_info.shopee_country_url = shopee_country_url

                                cookies22 = await page.cookies(shopee_country_url)

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

                                let check_confirm = await page.$(".shopee-alert-popup__btn")
                                if (check_confirm) {
                                    await check_confirm.click(".shopee-alert-popup__btn")
                                }

                                await page.waitForTimeout(delay(4000, 2000))

                                // if (options.add_cart) {
                                check_point = await check_point_hour(productForUser.uid)
                                if (check_point) {
                                    random_add_cart = Math.floor(Math.random() * 4);

                                    let check_1 = await action_add_cart(page, productForUser)

                                    if (check_1) {

                                        console.log(moment().format("hh:mm:ss") + "- Bỏ giỏ ok- " + productForUser.product_id + " : " + check_add_cart)
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
                                // await updateErrorLogs(error, slavenumber)
                            }

                            //    await removeCart(page)
                            await page.waitForTimeout(delay(3000, 2000));
                        }
                    }

                    product_order_info.products_name = products_name
                    product_order_info.voucher = voucher

                    let check_2 = await action_order(page, product_order_info)
                    product_order_info.action = "order_product"

                    await sleep(delay(6000, 4000));
                    console.log(moment().format("hh:mm:ss") + " - Quá trình đặt đơn: " + check_2.code)
                    //await page.waitForTimeout(999999);

                    if (check_2.code == 1) {
                        console.log("ORDER RESULT: " + check_order_complete)
                        // if (check_order_complete == true) {
                        await page.waitForTimeout(delay(6000, 5000))
                        let url_1 = await page.url()
                        let check_url = url_1.split("user/purchase/list")
                        //console.log(check_url)
                        if (check_url.length > 1) {
                            console.log(moment().format("hh:mm:ss") + " - Đặt đơn thành công")
                            product_order_info.result = "success"
                            await updatePoint(product_order_info, 3)
                        } else {
                            product_order_info.result = "fail"
                        }

                    } else {
                        product_order_info.result = "fail"

                    }

                    product_order_info.voucher = check_2.voucher
                    await updateHistory(product_order_info, 3)

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
            return
        }
    })
}



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
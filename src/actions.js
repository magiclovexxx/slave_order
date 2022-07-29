const api = require('./update_to_server.js')
const moment = require('moment')

delay = (x, y) => {
    a = Math.floor(Math.random() * (x - y)) + y;
    return a
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

remove_cart = async (page, product) => {
    console.log(moment().format("hh:mm:ss") + " -- REMOVE CART: ");
    try {

        await page.goto(product.shopee_country_url + "/cart")

        // let click_cart = await page.$$('#cart_drawer_target_id')
        // if(click_cart.length){
        //     await click_cart[0].click()
        // }

        await page.waitForSelector('.cart-page-logo__page-name')
        await sleep(delay(6000, 4000))

        let check_product_cart = await page.$x("//button[contains(text(), 'Delete')]");
        let remove_order = check_product_cart.length - 1
        console.log("Số đơn hàng cần xoá: " + remove_order)

        if (remove_order > 0) {
            for (let i = 0; i < remove_order; i++) {
                await check_product_cart[i].click();
                await page.waitForTimeout(delay(3000, 2000))
            }
        }

        check_product_cart = await page.$x("//button[contains(text(), 'Delete')]");
        if (check_product_cart > 0) {
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.product_link = product.product_link
            update_error_data.error_message = error.message
            update_error_data.error_code = 1008
            update_error_data.error_log = "Lỗi hệ thống khi xoá sản phẩm trong giỏ hàng"
            await api.update_error(update_error_data, 4)
            console.log(error)
            return 0
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
        await api.update_error(update_error_data, 4)
        console.log(error)
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
        let variation = ""
        console.log(product_info)

        if (product_info.color) {
            product_info.variation_1 = product_info.color
        }
        if (product_info.size) {
            product_info.variation_2 = product_info.size
        }
        if (product_info.variation_1 == "N/A" || product_info.color == "N/A") {
            product_info.variation_1 = ""
        }
        if (product_info.variation_2 == "N/A" || product_info.size == "N/A") {
            product_info.variation_2 = ""
        }
        if (product_info.variation_3 == "N/A") {
            product_info.variation_3 = ""
        }

        let variations = [product_info.variation_1, product_info.variation_2, product_info.variation_3]
        variations.forEach((e, index) => {
            if (e) {
                if (index == 0) {
                    variation = e
                } else {
                    variation = variation + "," + e
                }
            }
        })


        // if (product_info.color && product_info.size) {
        //     variation_1 = product_info.color + "," + product_info.size


        // } else if (!product_info.color && product_info.size) {
        //     variation_1 = product_info.size
        // } else if (product_info.color && !product_info.size) {
        //     variation_1 = product_info.color
        // }

        console.log(moment().format("hh:mm:ss") + " -- Phân loại sản phẩm: " + variation);

        if (product_models.length) {
            product_models.forEach(e => {

                if (e.name == variation && e.normal_stock > 0) {
                    // còn hàng
                    check_variation = 1
                    console.log(moment().format("hh:mm:ss") + " -- " + variation + " còn sản phẩm ");
                }
            })
        }

        if (check_variation == 1) {
            // Chọn màu
            if (product_info.variation_1) {
                await page.click('[aria-label="' + product_info.variation_1 + '"]');
                await page.waitForTimeout(delay(4000, 3000))
                console.log(moment().format("hh:mm:ss") + " Chọn phân loại 1 :" + product_info.variation_1);
            }

            if (product_info.variation_2) {
                await page.click('[aria-label="' + product_info.variation_2 + '"]');
                await page.waitForTimeout(delay(4000, 3000))
                console.log(moment().format("hh:mm:ss") + " Chọn phân loại 2: " + product_info.variation_2);
            }

            if (product_info.variation_3) {
                await page.click('[aria-label="' + product_info.variation_3 + '"]');
                await page.waitForTimeout(delay(4000, 3000))
                console.log(moment().format("hh:mm:ss") + " Chọn phân loại 3: " + product_info.variation_3);
            }
        }
        // else {
        //     console.log(moment().format("hh:mm:ss") + "Lỗi khi chọn phân loại hàng, hoặc sản phẩm hết hàng");
        //     update_error_data = {}
        //     update_error_data.order_id = product.id
        //     update_error_data.username = product.username
        //     update_error_data.slave = product.slave
        //     update_error_data.error_code = 2002
        //     update_error_data.product_link = product.product_link
        //     update_error_data.error_log = "Lỗi khi chọn phân loại hàng, hoặc sản phẩm hết hàng"
        //     await api.update_error(update_error_data, 4)
        //     return 0
        // }

        // chọn số lượng
        await page.click('input[role="spinbutton"]', { clickCount: 2 });
        await page.type('input[role="spinbutton"]', product_info.quantity)
        console.log(moment().format("hh:mm:ss") + " Chọn Số lượng OK: " + product_info.quantity);

        let check_btn_add_dard = await page.$$('.btn-tinted')

        if (check_btn_add_dard.length > 1) {
            await check_btn_add_dard[0].click();
        }

        check_error_add = await page.$x("//div[contains(text(), 'Please select product variation first')]")

        if (check_error_add.length) {
            console.log(moment().format("hh:mm:ss") + " Lỗi khi chọn phân loại hàng, sai phân loại, biến thể");
            update_error_data = {}
            update_error_data.order_id = product.id
            update_error_data.username = product.username
            update_error_data.slave = product.slave
            update_error_data.error_code = 1014
            update_error_data.product_link = product.product_link
            update_error_data.error_log = "Lỗi khi chọn phân loại hàng, sai phân loại, biến thể"
            await api.update_error(update_error_data, 4)
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
        await api.update_error(update_error_data, 4)
        console.log(error)
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
            await api.update_error(update_error_data, 4)
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
                await api.update_error(update_error_data, 4)
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
                    await api.update_error(update_error_data, 4)
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
                        await api.update_error(update_error_data, 4)
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
                        await api.update_error(update_error_data, 4)

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
            await api.update_error(update_error_data, 4)
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

        if (check_btn_cod.length > 0) {
            await check_btn_cod[0].click()
            await page.waitForTimeout(delay(5000, 4000))
        } else {
            check_btn_cod = await page.$x("//div[contains(text(), 'Cash on Delivery')]")

        }

        check_not_deliver = await page.$x("//div[contains(text(), 'Cash on Delivery is temporarily unavailable for orders from overseas sellers due to multiple failed deliveries.')]")
        if (check_not_deliver.length) {

            update_error_data.error_code = 2008
            update_error_data.error_log = "Tài khoản bị tắt thanh toán khi nhận hàng"
            console.log(moment().format("hh:mm:ss") + " -- Tài khoản bị tắt thanh toán khi nhận hàng: " + product.username);

            await api.update_error(update_error_data, 4)
            let result = {
                code: 0,
                voucher: ""
            }
            return result
        }

        if (check_btn_cod.length) {
            console.log(moment().format("hh:mm:ss") + " -- Click nút đặt đơn: ");
            let checkout = await page.$$('.stardust-button--primary')
            if (checkout.length) {
                await checkout[0].click()
            }
            await page.waitForTimeout(delay(3000, 2000))
            // await page.waitForTimeout(9999999)

            let check_account_suppen = await page.$x("//p[contains(text(), 'Action Failed (A02): Your account has been suspended as our system detected a suspicious behaviour of mass creation of accounts. Please make sure to comply with Shopee policies.')]")

            let check_account_limit = await page.$x("//div[contains(text(), 'Sorry, you have reached the Cash on Delivery order limit.')]")

            if (check_account_suppen.length || check_account_limit.length) {

                if (check_account_limit.length) {
                    update_error_data.error_code = 2006
                    update_error_data.error_log = "Tài khoản limit"
                    console.log(moment().format("hh:mm:ss") + " -- Tài khoản bị limit: " + product.username);

                }

                if (check_account_suppen.length) {
                    update_error_data.error_code = 2005
                    update_error_data.error_log = "Tài khoản bị khoá"
                    console.log(moment().format("hh:mm:ss") + " -- Tài khoản bị khoá: " + product.username);

                }

                await api.update_error(update_error_data, 4)
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
            await api.update_error(update_error_data, 4)
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
        update_error_data.error_message = error.message
        update_error_data.error_log = "Có lỗi hệ thống khi đặt hàng"
        console.log(error)

        console.log("Check đặt đơn khi gặp lỗi: " + check_order_complete)

        if (check_order_complete == true) {
            let result = {
                code: 1,
                voucher: ""
            }
            return result
        } else {
            await api.update_error(update_error_data, 4)
            let result = {
                code: 0,
                voucher: ""
            }
            return result
        }

    }
    let result = {
        code: 1,
        voucher: voucher_2
    }

    return result

}

run_time = async () => {

}
module.exports = {

    remove_cart,
    action_add_cart,
    action_order,

}
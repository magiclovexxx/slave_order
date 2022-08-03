const axios = require('axios').default;
const moment = require('moment')

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
update_order_url = updateActionsUrl + "/api_user/update_order"     // Update order
update_order_status_url = updateActionsUrl + "/api_user/update_order_status"     // Update order status
update_history_url = updateActionsUrl + "/api_user/update_history"     // Update history

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

updateOrder = async (product9, limit) => {

    await axios.post(update_order_url, {
        data: product9,
        timeout: 50000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update order: " + response.data);
           // console.log(response.data)
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update order lỗi");

            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
                //  await updateOrder(product9, limit)
            } else {
                
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật dữ liệu");
                return false
            }
        });
}

updateOrderStatus = async (order_list, limit) => {
    let data = []
    await axios.post(update_order_status_url, {
        data: order_list,
        timeout: 50000
    })
        .then(function (response) {
            console.log(moment().format("hh:mm:ss") + " - Update order status: ");
            data = response.data
            return true
        })
        .catch(async function (error) {
            console.log(error);
            console.log(moment().format("hh:mm:ss") + " - Update order status lỗi");

            limit = limit - 1
            if (limit > 0) {
                await sleep(5000)
               
            } else {
                console.log(moment().format("hh:mm:ss") + " - Lỗi mạng không thể cập nhật dữ liệu");
                return false
            }
        });
        return data
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

module.exports = {
    update_error,
    updateCookie,
    updatePoint,
    updateOrder,
    updateHistory,
    check_point_hour,
    updateOrderStatus
    

}
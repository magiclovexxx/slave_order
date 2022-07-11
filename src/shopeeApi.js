const axios = require('axios').default;
const moment = require('moment')

function csrftoken() {
    karakter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    PanjangKarakter = karakter.length;
    acakString = '';
    for (let i = 0; i < 32; i++) {
        PanjangKarakter = PanjangKarakter - 1
        acakString += karakter[Math.floor(Math.random() * (PanjangKarakter))];
    }
    return acakString;
}


get_order_detail = async (url, order_id, cookie) => {
    console.log(moment().format("hh:mm:ss") + " --- Lấy chi tiết đơn hàng: " + order_id)
    var config = {
        method: 'get',
        url: url + '/api/v4/order/get_order_detail?order_id=' + order_id,
        headers: {

            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cookie': cookie,
            // 'if-none-match-': '55b03-8fd0a76ee0982adcd4ce2ff509c658ef',
            'referer': url + '/user/purchase/order/' + order_id + '?type=8',
            'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'en'
        }
    };
    order_detail = []
    await axios(config)
        .then(function (response) {
            if (response.data.data) {
                order_detail = response.data.data
            }

        })
        .catch(function (error) {
            console.log(error);
        });

    return order_detail
}

get_all_order_list = async (url, cookie, limit, offset) => {
    url = url + '/api/v4/order/get_all_order_and_checkout_list?limit=' + limit + '&offset=' + offset
   
    var config = {
        method: 'get',
        url: url,
        headers: {
            // 'authority': 'shopee.vn',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'cookie': cookie,
            // 'if-none-match-': '55b03-429b3f5312c1f66cbdca7386aa61e9bd', 
            'pragma': 'no-cache',
            'referer': url + '/user/purchase/list/?type=9',

            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'en'
        }
    };
    data = []
    order_id_list = []
    await axios(config)
        .then(function (response) {
            data = response.data
            if (data.data.order_data.details_list) {
                let details_list = data.data.order_data.details_list
                console.log("Kết quả shopee detail_list: " + details_list.length);
                details_list.forEach(e => {
                    let x = {
                        shopee_order_id: e.info_card.order_id,
                        status: e.status.status_label.text
                    }
                    order_id_list.push(x)
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    
    return order_id_list
}

get_order_list_by_status = async (url, cookie, list_type, limit, offset) => {

    var config = {
        method: 'get',
        url: url + '/api/v4/order/get_order_list?limit=' + limit + '&list_type=' + list_type + '&offset=' + offset,
        headers: {
            // 'authority': 'shopee.vn',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'cookie': cookie,
            // 'if-none-match-': '55b03-429b3f5312c1f66cbdca7386aa61e9bd', 
            'pragma': 'no-cache',
            'referer': url + '/user/purchase/list/?type=9',

            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'en'
        }
    };
    data = []
    order_id_list = []
    await axios(config)
        .then(function (response) {
            data = response.data
            if (data.data.details_list) {
                let details_list = data.data.details_list
                details_list.forEach(e => {
                    let x = {
                        order_id: e.info_card.order_id,
                        status: e.status.status_label.text
                    }
                    order_id_list.push(x)
                })
            }
        })
        .catch(function (error) {
            console.log(error);
        });

    return order_id_list
}

module.exports = {

    get_order_detail,
    get_all_order_list,
    get_order_list_by_status,

}
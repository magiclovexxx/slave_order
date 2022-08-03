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
            console.log(response.data.data)
          //  process.exit()
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
                        status: e.status.status_label.text,
                        item_id : e.info_card.order_list_cards[0].items[0].item_id,
                        shop_id : e.info_card.order_list_cards[0].shop_info.shop_id
                    }
                    if(e.status.popup_msg){
                        x.rating= e.status.popup_msg.text
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

comfirm_order_complete = async (url, cookie, order_id) => {
    xcsrftoken = cookie.match(/csrftoken=(.*?);/)
    //    console.log(xcsrftoken)
    url = url + '/api/v4/order/action/confirm_order_delivered/'

    var config = {
        method: 'post',
        url: url,
        headers: {
            // 'authority': 'shopee.vn',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'cookie': cookie,
            // 'if-none-match-': '55b03-429b3f5312c1f66cbdca7386aa61e9bd', 
            'pragma': 'no-cache',
            'referer': url + '/user/purchase?type=6',
            'x-csrftoken': xcsrftoken[1],
            'sec-ch-ua-mobile': '?0',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'x-api-source': 'pc',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'en'
        },
        data: {
            order_id: order_id
        }
    };

    await axios(config)
        .then(function (response) {
            console.log("Kết quả shopee comfirm_order_complete OK : " + order_id);

        })
        .catch(function (error) {
            console.log(error);
        });

}

rating_order = async (url, cookie, orderid, shop_id, item_id, comment) => {
    console.log(moment().format("hh:mm:ss") + " --- rating_order : " + orderid)
    rating_tag = []
    rating_tag_2 = []
    try {
              
        xcsrftoken = cookie.match(/csrftoken=(.*?);/)

        var config = {
            method: 'get',
            url: url + '/api/v2/item/get_rating_meta',
            headers: {

                'accept': 'application/json',
                'accept-language': 'en-US;q=0.8,en;q=0.7',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'cookie': cookie,
                // 'if-none-match-': '55b03-c801796ec2e5492d870e4bdf991d6bb6',
                'origin': url,
                'pragma': 'no-cache',
                'referer': url + '/user/purchase/?type=3',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'x-api-source': 'pc',
                'x-csrftoken': xcsrftoken[1],
                'x-requested-with': 'XMLHttpRequest',
                'x-shopee-language': 'en'
            },
            data: data
        };

        await axios(config)
            .then(function (response) {
                
                x = response.data.data.tags[4].tags
                if (x.length) {
                    x.forEach(e => {
                        rating_tag.push(e.tag_id)
                    })
                }
                console.log(moment().format("hh:mm:ss") + " --- rating_meta : " + orderid + "-- " + rating_tag.length)
            })
            .catch(function (error) {
                console.log(error);
            });

        if (rating_tag.length > 0) {

            for (let i = 0; i < 4; i++) {
                random = Math.floor(Math.random() * rating_tag.length);
                rating_tag_2.push(rating_tag[random])
            }
        }

        comments = ["Good product", "Nice item. Affordable price", "Shipped on time", "Nice item, Will order again",
        "Good quality. Shipped immediately after order was placed.", " Arrived earlier than expected. Satisfied Buyer!", "Good item, will surely recommend to family and friends." ]
        if(!comment){
            commemt = ""
        }

        random = Math.floor(Math.random() * comments.length);
        comment = comments[random]

        var data = JSON.stringify({
            "shopid": shop_id,
            "orderid": orderid,
            "objectid": 0,
            "rate_items_data": [
                {
                    "itemid": item_id,
                    "rating": 5,
                    "comment": comment,
                    "photos": [

                    ],
                    "videos": [],
                    "tagids": rating_tag_2,
                    "anonymous": true,
                    "detailed_rating": null,
                    "template_tag_comments": {}
                }
            ],
            "is_media_gray_user": true,
            "apply_coin_limits_validate": true
        });

        config = {
            method: 'post',
            url: url + '/api/v2/item/add_rating',
            headers: {

                'accept': 'application/json',
                'accept-language': 'en-US;q=0.8,en;q=0.7',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                'cookie': cookie,
                // 'if-none-match-': '55b03-c801796ec2e5492d870e4bdf991d6bb6',
                'origin': url,
                'pragma': 'no-cache',
                'referer': url + '/user/purchase/?type=3',
                'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
                'x-api-source': 'pc',
                'x-csrftoken': xcsrftoken[1],
                'x-requested-with': 'XMLHttpRequest',
                'x-shopee-language': 'en'
            },
            data: data
        };

        await axios(config)
            .then(function (response) {
                console.log("Kết quả shopee ratting OK: " + response.data.error);
            })
            .catch(function (error) {
                console.log(error);
            });
    } catch (error) {
        console.log(error)
    }


}

module.exports = {

    get_order_detail,
    get_all_order_list,
    get_order_list_by_status,
    comfirm_order_complete,
    rating_order

}
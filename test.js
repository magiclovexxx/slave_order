const axios = require('axios').default;
const shopeeApi = require('./src/shopeeApi.js')

cookie = '__LOCALE__null=PH; _gcl_au=1.1.1382138316.1657137893; csrftoken=eMldQ2yxVTRAUiLD6NZomj92o8Syh1kr; SPC_F=lnf0jg6HYOW7EWrNZcoiuwr1ahRm4zkb; REC_T_ID=fa882844-fd66-11ec-87ea-2cea7fac88d8; _fbp=fb.1.1657137893399.778565415; _QPWSDCXHZQA=500c7cc3-9c3f-40ad-af9e-a817d9a8e3af; SPC_IA=-1; G_ENABLED_IDPS=google; G_AUTHUSER_H=0; SPC_CLIENTID=bG5mMGpnNkhZT1c3mlrgjdbkyxeyhrqy; SPC_U=799953217; SPC_T_ID=L/IEhcG9TAe7x9qAy+3n5YaE4qkt7XFZSdendBeNhy27rhwyLtrV7U9Hs+lSKQoPLGU1va7404/IN7jKsrnEAPLUxXO8UUql0Jg7B94FAV4=; SPC_T_IV=0Vge8ZmqeG8AN41JorMFbA==; SPC_ST=.Q2pQenZ1cVJLNmRYSjhlOKpO3u9dwV24FnLMWDNgQHGPmzXiRC/Wfxdi5XjjnXOthD8iiSYlGxwYECnE6LJEzVlqT/QhnDiED1cFx4eIfLra7qa0W0/rDEsIkEjPUYe/8Zv17Ua05zFBB2DspSM43ptaC0hyXZPvB1lyE8l97gk6DhKHIFOtxKvCjPO51Bl2PHmkgknlU54JbDmbaVPb/w==; _gid=GA1.2.996791297.1657385941; cto_bundle=jxR8gl9XcDlUWDZlUk1NaG9DRnhURDgwQ1NsWDZiWGc1dkxYWXhYUFFpVkdRWVFEVFBkczVzRFhRaGxJVjdYV2xPNUNmSmZjeUs2cEhxb2s5clolMkZOenBXd1I4YXJxb2hQUlNsNWVodnlyQmdlWHdYcXV3WllJS1U1c1lDSXIwYUNwbVFXNFEwaHNFUVVvdU1idU9wWm1rdGpDUSUzRCUzRA; AMP_TOKEN=%24NOT_FOUND; shopee_webUnique_ccd=XEZ9WHkYiWWocje4EA8wOQ%3D%3D%7CcgbpqlpOjo1yicp4enaIQ7TEEYxPnjXrmh5xmTk0014%2Boa0lpYfwzw9ajdkxNFC46vsp7LVkSav%2Bo4p0FYdaZSvr%7Cpyudf08rvvZ607Or%7C05%7C3; SPC_T_IV="6STPIx44vrUCDlKmtxDzIA=="; SPC_T_ID="MA8kpzkIys5XjcvpspwttSfsHNXXANakxXXgf7BORvb4+smB3e9hAWeQwvKsu2CAxYFliVnzfTBAS/HSrsxn2xRRYTGaM7qhFxlarrfty34="; SPC_SI=/7fBYgAAAABRekxDSmFHdzzdbAAAAAAAUURwbTUxMm0=; SPC_R_T_ID=L/IEhcG9TAe7x9qAy+3n5YaE4qkt7XFZSdendBeNhy27rhwyLtrV7U9Hs+lSKQoPLGU1va7404/IN7jKsrnEAPLUxXO8UUql0Jg7B94FAV4=; SPC_R_T_IV=0Vge8ZmqeG8AN41JorMFbA==; _ga=GA1.1.996092178.1657137895; _ga_CB0044GVTM=GS1.1.1657472580.7.1.1657473882.60; SPC_EC=Zk9kNm5wcmVQVmd0TW0wRLX0HrjxzaxFvVi9fU4ZAHueLifZcibMVc8BvydN+NT/30d56tfe38UIa+UDxCi5GLFszvtmYfCqxP6IvfHSOVwrcMwiZOUeunyhZkthbuUcTgr6kIQif/JMUPiheK4yCXlMDcTRwjhBHPbLmZg9cTo='

xcsrftoken = cookie.match(/csrftoken=(.*?);/)

console.log(xcsrftoken)
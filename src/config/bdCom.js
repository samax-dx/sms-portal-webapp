const bdCom = {
    logo: require('../images/bdcom2.png'),
    ficon: require('../images/bdcomFavicon.ico'),
    clientPortal: "10.111.111.226:3001/client",
    adminPortal: "10.111.111.226:3000/admin",
    getToken: "http://10.111.111.226:8080/ofbiz-spring/api/Party/login",
    sendMsg: "http://10.111.111.226:8080/ofbiz-spring/api/SmsTask/sendSMS"
}
export default bdCom;
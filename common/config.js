require('dotenv').config();
const pre_fix = process.env.ROUTE_PRE_FIX;

module.exports = {
    port: process.env.PORT,
    project_name: 'NFTTUNZ.io',
    devMode: true,
    mongoURI: process.env.DB_URI,
    routes: [
        { name: 'welcome', route: pre_fix +"/", needToken: false, askMethods: "Display a Welcome Message + contact email."},
        { name: 'public', route: pre_fix + process.env.PUBLIC_ROUTE, needToken: false, askMethods: "GET route+'requests' noParams."},
        { name: 'auth', route: pre_fix + process.env.AUTH_ROUTE, needToken: true, askMethods: "GET route+'requestsauth' token needed to ask for methods."},
    ],
    apiHive: process.env.API_HIVE, //for now as a single url, later on add an array to have backup urls.
    jwtSecret: process.env.JWT_SECRET,
    tokenExp: 21600,
}
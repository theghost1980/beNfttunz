require('dotenv').config();
const pre_fix = process.env.ROUTE_PRE_FIX;
module.exports = {
    port: process.env.DEFAULT_PORT,
    project_name: 'NFTTUNZ.io',
    devMode: true,
    routes: [
        { name: 'public', route: pre_fix + process.env.PUBLIC_ROUTE, needToken: false, askMethods: "GET route+'requests' noParams."}
    ],
}
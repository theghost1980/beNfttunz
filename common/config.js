require('dotenv').config();
const pre_fix = process.env.ROUTE_PRE_FIX;

module.exports = {
    port: process.env.PORT,
    project_name: 'NFTTUNZ.io',
    devMode: true,
    mongoURI: process.env.DB_URI,
    routes: [
        { name: 'public', route: pre_fix + process.env.PUBLIC_ROUTE, },
        { name: 'auth', route: pre_fix + process.env.AUTH_ROUTE, },
        { name: 'cdn', route: pre_fix + process.env.CDN_ROUTE, },
        { name: 'users', route: pre_fix + process.env.USERS_ROUTE, },
        { name: 'ssc', route: pre_fix + process.env.SSC_ROUTE, },
    ],
    apiHive: process.env.API_HIVE, //for now as a single url, later on add an array to have backup urls.
    jwtSecret: process.env.JWT_SECRET,
    tokenExp: 21600,
    thumb_size: 100, //in pixels. 
    cdnCloudName: process.env.CLOUD_NAME,
    cdnApiKey: process.env.CLOUD_API_KEY,
    cdnApiSecret: process.env.CLOUD_API_SECRET,
    rpcServer: process.env.TEST_SERVER_URL, //will change as soon as we test and move to production ready
    rpcNodeId: process.env.TEST_SERVER_ID, //will change as soon as we test and move to production ready
    privKey: process.env.PRIV_KEY,
    postKey: process.env.POST_KEY,
}
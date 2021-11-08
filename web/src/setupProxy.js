const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(
        createProxyMiddleware('/api', {
            target: "http://localhost:8290/",
            changeOrigin: true,
            ws: true,
            pathRewrite: {
                '^/api': 'api'
            }
        })
    )
}
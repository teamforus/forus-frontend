const compress = require('compression');
const historyApiFallback = require('connect-history-api-fallback')
const { grouped_platforms, browserSync } = require("../Library");

const serverTask = function() {
    Object.values(grouped_platforms).reduce(
        (acc, platforms) => acc.concat(platforms), []
    ).filter(platform => platform.server).forEach(function(platform) {
        var server = {
            server: {
                baseDir: platform.paths.root + platform.server.path,
                middleware: [compress(), (req, res, next) => {
                    const headers = platform.server.headers || {};

                    for (const key in headers) {
                        res.setHeader(key, headers[key]);
                    }

                    next();
                }],
            },
            notify: true,
            open: false,
            port: platform.server.port || 3000,
            rewriteRules: [
                {
                    match: /script /g,
                    fn: function(req, res, match) {
                        return `script nonce='1Py20ko19vEhus6l1yvGJw=='`;
                    }
                },
                {
                    match: /style /g,
                    fn: function(req, res, match) {
                        return `style nonce='1Py20ko19vEhus6l1yvGJw=='`;
                    }
                },
            ],
            ui: {
                port: (platform.server.port || 3000) + 1,
            }
        };

        if (platform.env_data.html5ModeEnabled) {
            server.server.middleware.push(historyApiFallback());
        }

        browserSync[platform.name].init(server);
    });
};

module.exports = serverTask;
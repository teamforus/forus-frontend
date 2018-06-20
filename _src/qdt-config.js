module.exports = {
    platforms: {
        "*": {
            "source": "base",
            "libs": {
                // please disable libraries you don't need
                "jquery": true,
                "bootstrap_3": true,
                "angular": true,
                "angular_2": false,
                "underscore": false,
                "underscore.string": false,
                "mdi": true
            },
            "libs_data": {},
            // overwrite this paths in your platform
            "paths": {
                "root": false,
                "assets_root": false,
                "clean_paths": false
            },
            // add here libraries from node_modules
            "assets": [{
                "from": "resources/assets/**/*",
                "to": "assets"
            }],
            // browsersync configurations (ex: ip, port and path)
            "server": false,
            // tasks configs
            "tasks": {
                // disable tasks
                "disabled": {
                    "pug": false,
                    "js": false,
                    "assets": false
                },
                // tasks details, ex: source, destination, minify and etc. 
                "settings": {
                    "js": [{
                        "src": [
                            "app.js",
                            "angular-1/*.js",
                            
                        ],
                        watch: [
                            "angular-1/**/**.js",                          
                        ],
                        "dest": "/",
                        "name": "app.js",
                        "minify": false,
                        "sourcemap": true,
                        "browserify": true
                    }, {
                        "src": [
                            // "raw/**/*.js"
                        ],
                        "dest": "/raw",
                        "path": "/raw",
                        "minify": true,
                        "sourcemap": false,
                        "browserify": false
                    }],
                    "scss": [{
                        "src": "style.scss",
                        "watch": "includes/**/*.scss",
                        "path": "/",
                        "name": "style.min.css",
                        "minify": true
                    }],
                    "pug": [{
                        "path": "/",
                        "src": ["*.pug"],
                        "watch": ["layout/**/*.pug"],
                        "path": "/"
                    }, {
                        "path": "/raw/tpl",
                        "src": ["raw/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
        "html": {
            "source": "base",
            "paths": {
                "root": "../html",
                "assets_root": "../html/assets",
                "clean_paths": [
                    "../html"
                ]
            },
            "server": {
                "path": "/",
                "port": 3000
            }
        }
    }
};
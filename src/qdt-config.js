module.exports = {
    platforms: {
        "*": {
            "source": "base",
            "libs": {
                // please disable libraries you don't need
                "jquery": true,
                "bootstrap_3": false,
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
            }, {
                "from": "../../node_modules/nanoscroller/bin/css/*",
                "to": "assets/dist/nanoscroller/css/"
            }, {
                "from": "../../node_modules/nanoscroller/bin/javascripts/*",
                "to": "assets/dist/nanoscroller/js/"
            }, {
                "from": "../../node_modules/@uirouter/angularjs/release/angular-ui-router.min.js",
                "to": "assets/dist/uirouter/"
            }, {
                "from": "../../node_modules/@uirouter/angularjs/release/angular-ui-router.min.js.map",
                "to": "assets/dist/uirouter/"
            }, {
                "from": "../../node_modules/qrcodejs/qrcode.js",
                "to": "assets/dist/qrcodejs"
            }, {
                "from": "../../node_modules/angularjs-datepicker/dist/angular-datepicker.min.js",
                "to": "assets/dist/angular-datepicker"
            }, {
                "from": "../../node_modules/angularjs-datepicker/dist/angular-datepicker.min.css",
                "to": "assets/dist/angular-datepicker"
            }, {
                "from": "../../node_modules/papaparse/papaparse.min.js",
                "to": "assets/dist/papaparse/"
            }, {
                "from": "../../node_modules/file-saver/FileSaver.min.js",
                "to": "assets/dist/file-saver"
            }, {
                "from": "../../node_modules/angular-translate/dist/angular-translate.min.js",
                "to": "assets/dist/angular-translate"
            }, {
                "from": "../../node_modules/angular-sanitize/angular-sanitize.min.js",
                "to": "assets/dist/angular-sanitize"
            }, {
                "from": "../../node_modules/angular-cookies/angular-cookies.min.js",
                "to": "assets/dist/angular-cookies"
            }, {
                "from": "../../node_modules/angular-translate-storage-cookie/angular-translate-storage-cookie.min.js",
                "to": "assets/dist/angular-translate-storage-cookie"
            }, {
                "from": "../../node_modules/angular-translate-storage-local/angular-translate-storage-local.min.js",
                "to": "assets/dist/angular-translate-storage-local"
            }, {
                "from": "../../node_modules/moment/min/moment-with-locales.min.js",
                "to": "assets/dist/moment"
            }, {
                "from": "../../node_modules/chart.js/dist/Chart.min.js",
                "to": "assets/dist/chart"
            }, {
                "from": "../../node_modules/progressbar.js/dist/progressbar.min.js",
                "to": "assets/dist/progressbar"
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
                            "app.js"
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
                        "path": "/markup",
                        "src": ["/markup/*.pug"],
                        "watch": ["layout/**/*.pug"],
                    }]
                }
            }
        },
        "forus-platform.markup": {
            "source": "forus-platform",
            "paths": {
                "root": "../dist/forus-platform.markup",
                "assets_root": "../dist/forus-platform.markup/assets",
                "clean_paths": [
                    "../dist/forus-platform.markup"
                ]
            },
            "server": {
                "path": "/",
                "port": 3000
            },
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
                            "app.markup.js",
                        ],
                        "dest": "/",
                        "name": "app.js",
                        "minify": true,
                        "sourcemap": true,
                        "browserify": true
                    }]
                }
            }
        },
        "forus-platform.sponsor": {
            "source": "forus-platform",
            "paths": {
                "root": "../dist/forus-platform.sponsor",
                "assets_root": "../dist/forus-platform.sponsor/assets",
                "clean_paths": [
                    "../dist/forus-platform.sponsor"
                ]
            },
            "server": {
                "path": "/",
                "port": 3500
            },
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
                    "pug": [{
                        "path": "/sponsor-dashboard",
                        "src": ["sponsor-dashboard/index.pug"],
                        "watch": ["layout/**/*.pug"],
                    }, {
                        "path": "/tpl",
                        "src": ["tpl/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
        "forus-platform.provider": {
            "source": "forus-platform",
            "paths": {
                "root": "../dist/forus-platform.provider",
                "assets_root": "../dist/forus-platform.provider/assets",
                "clean_paths": [
                    "../dist/forus-platform.provider"
                ]
            },
            "server": {
                "path": "/",
                "port": 4000
            },
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
                    "pug": [{
                        "path": "/sponsor-dashboard",
                        "src": ["sponsor-dashboard/index.pug"],
                        "watch": ["layout/**/*.pug"],
                    }, {
                        "path": "/tpl",
                        "src": ["tpl/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
        "forus-platform.validator": {
            "source": "forus-platform",
            "paths": {
                "root": "../dist/forus-platform.validator",
                "assets_root": "../dist/forus-platform.validator/assets",
                "clean_paths": [
                    "../dist/forus-platform.validator"
                ]
            },
            "server": {
                "path": "/",
                "port": 4500
            },
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
                    "pug": [{
                        "path": "/sponsor-dashboard",
                        "src": ["sponsor-dashboard/index.pug"],
                        "watch": ["layout/**/*.pug"],
                    }, {
                        "path": "/tpl",
                        "src": ["tpl/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
        "forus-webshop.markup": {
            "source": "forus-webshop",
            "paths": {
                "root": "../dist/forus-webshop.markup",
                "assets_root": "../dist/forus-webshop.markup/assets",
                "clean_paths": [
                    "../dist/forus-webshop.markup"
                ]
            },
            "server": {
                "path": "/",
                "port": 5000
            },
            // tasks configs
            "tasks": {
                // tasks details, ex: source, destination, minify and etc. 
                "settings": {
                    "js": [{
                        "src": [
                            "app.markup.js",
                        ],
                        "dest": "/",
                        "name": "app.js",
                        "minify": true,
                        "sourcemap": true,
                        "browserify": true
                    }]
                }
            }
        },
        "forus-webshop.panel": {
            "source": "forus-webshop",
            "paths": {
                "root": "../dist/forus-webshop.panel",
                "assets_root": "../dist/forus-webshop.panel/assets",
                "clean_paths": [
                    "../dist/forus-webshop.panel"
                ]
            },
            "server": {
                "path": "/",
                "port": 5500
            },
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
                    "pug": [{
                        "path": "/webshop-panel",
                        "src": ["webshop-panel/index.pug"],
                        "watch": ["layout/**/*.pug"],
                    }, {
                        "path": "/tpl",
                        "src": ["tpl/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
        "forus-webshop-zuidhorn.markup": {
            "source": "forus-webshop-zuidhorn",
            "paths": {
                "root": "../dist/forus-webshop-zuidhorn.markup",
                "assets_root": "../dist/forus-webshop-zuidhorn.markup/assets",
                "clean_paths": [
                    "../dist/forus-webshop-zuidhorn.markup"
                ]
            },
            "server": {
                "path": "/",
                "port": 6500
            },
            // tasks configs
            "tasks": {
                // tasks details, ex: source, destination, minify and etc. 
                "settings": {
                    "js": [{
                        "src": [
                            "app.markup.js",
                        ],
                        "dest": "/",
                        "name": "app.js",
                        "minify": true,
                        "sourcemap": true,
                        "browserify": true
                    }]
                }
            }
        },
        "forus-webshop-zuidhorn.panel": {
            "source": "forus-webshop-zuidhorn",
            "paths": {
                "root": "../dist/forus-webshop-zuidhorn.panel",
                "assets_root": "../dist/forus-webshop-zuidhorn.panel/assets",
                "clean_paths": [
                    "../dist/forus-webshop-zuidhorn.panel"
                ]
            },
            "server": {
                "path": "/",
                "port": 7000
            },
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
                    "pug": [{
                        "path": "/webshop-panel",
                        "src": ["webshop-panel/index.pug"],
                        "watch": ["layout/**/*.pug"],
                    }, {
                        "path": "/tpl",
                        "src": ["tpl/**/*.pug"],
                        "dest": "/assets/tpl"
                    }]
                }
            }
        },
    }
};
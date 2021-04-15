const path = require('path');

let Platform = function(source) {
    let cfg = {
        enabled: true,
        name: source,
        source: source,
        paths: {
            destRootPath: './',
            root: '/'
        },
        assets: [],
        tasks: {},
        server: false,
        env_data: {}
    };

    let taskStorage = {};

    this.getName = () => cfg.name;
    this.getTaskStorage = () => JSON.parse(JSON.stringify(taskStorage));

    this.clone = () => {
        return (new Platform()).setCfg(
            JSON.parse(JSON.stringify(cfg))
        ).setTaskStorage(
            JSON.parse(JSON.stringify(taskStorage))
        );
    };

    this.setCfg = (_cfg) => {
        cfg = _cfg;
        
        return this;
    };

    this.setTaskStorage = (_taskStorage) => {
        taskStorage = _taskStorage;

        return this;
    };

    this.setSource = (source) => {
        cfg.source = source;

        return this;
    };

    this.setName = (name) => {
        cfg.name = name;

        return this;
    };

    this.setDestRootPath = (destRootPath) => {
        cfg.paths.destRootPath = destRootPath;
    };

    this.setDest = (destPath) => {
        cfg.paths.root = destPath;
        
        return this;
    };

    this.setEnvData = (envData) => {
        cfg.env_data = envData;

        return this;
    };

    this.serve = (port, path, headers = {}) => {
        cfg.server = {
            port: port,
            path: path || '/',
            headers: headers || {},
        };

        return this;
    };

    this.enable = () => {
        cfg.enabled = true;

        return this;
    };

    this.disable = () => {
        cfg.enabled = false;

        return this;
    };

    this.clearTasks = (type) => {
        cfg.tasks = {};

        return this;
    };


    this.clearTasksOfType = (type) => {
        cfg.tasks[type] = [];

        return this;
    };

    this.isEnabled = () => {
        return cfg.enabled;
    }

    this.addTask = (type, config, name) => {
        if (name) {
            config.type = type;
            taskStorage[name] = config;
            
            return;
        }

        if (!Array.isArray(cfg.tasks[type])) {
            cfg.tasks[type] = [];
        }

        cfg.tasks[type].push(config);

        return this;
    };

    this.editTask = (name, callback) => {
        taskStorage[name] = callback(taskStorage[name]);

        return this;
    };

    this.clearAssets = () => {
        cfg.assets = [];

        return this;
    }

    this.copyAsset = (from, to) => {
        cfg.assets.push({
            from: from,
            to: to
        });

        return this;
    };

    this.resetAsset = (from, to) => {
        cfg.assets = [];

        return this;
    };

    this.setCleanPath = paths => {
        cfg.paths.clean = paths;

        return this;
    };

    this.addCleanPath = paths => {
        if (typeof(paths) == 'string') {
            paths = [paths];
        }

        if (!Array.isArray(cfg.paths.clean)) {
            cfg.paths.clean = [];
        }

        cfg.paths.clean = cfg.paths.clean.concat(paths);

        return this;
    };

    this.setAssetsPath = path => {
        cfg.paths.assets = path;// cfg.paths.root + '/' + path;

        return this;
    };

    this.setLibs = libs => {
        cfg.libs = libs;

        return this;
    };

    this.addLibs = libs => {
        if (!Array.isArray(cfg.libs)) {
            cfg.libs = [];
        }

        if (!Array.isArray(libs)) {
            libs = [libs];
        }

        cfg.libs = cfg.libs.concat(libs);
        
        return this;
    };

    this.removeLibs = libs => {
        if (!Array.isArray(cfg.libs)) {
            cfg.libs = [];
        }

        if (!Array.isArray(libs)) {
            libs = [libs];
        }

        cfg.libs = cfg.libs.concat(libs);
        
        return this;
    };

    this.getConfig = () => {
        let outCfg = JSON.parse(JSON.stringify(cfg));
        let destRootPath = path.resolve(outCfg.paths.destRootPath);

        outCfg.paths.root = path.resolve(destRootPath, outCfg.paths.root);
        outCfg.paths.assets = path.resolve(destRootPath, outCfg.paths.assets);

        if (typeof outCfg.paths.clean == 'string') {
            outCfg.paths.clean = [outCfg.paths.clean];
        }

        if (Array.isArray(outCfg.paths.clean)) {
            outCfg.paths.clean = outCfg.paths.clean.map(cleanPath => {
                return path.resolve(destRootPath, cleanPath);
            });
        }

        Object.values(taskStorage).forEach(task => {
            if (!Array.isArray(outCfg.tasks[task.type])) {
                outCfg.tasks[task.type] = [];
            }

            outCfg.tasks[task.type].push(task);
        });

        return outCfg;
    };
};

module.exports = Platform;
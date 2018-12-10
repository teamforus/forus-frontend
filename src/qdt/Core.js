let Core = function() {
    let platforms = {};

    this.addPlatform = (platform) => {
        platforms[platform.getName()] = platform;
    }

    this.editPlatform = (name, cb) => {
        platforms[name] = cb(platforms[name]);
    }

    this.getConfig = () => {
        // console.log(platforms);
        let configs = {};
        
        for (let prop in platforms) {
            if (platforms[prop].isEnabled()) {
                configs[prop] = platforms[prop].getConfig();
            }
        }
        
        return configs;
    };
};

module.exports = new Core();
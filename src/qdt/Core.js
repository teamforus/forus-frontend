const Core = function() {
    const platforms = {};

    this.addPlatform = (platform) => {
        platforms[platform.getName()] = platform;
    }

    this.editPlatform = (name, cb) => {
        platforms[name] = cb(platforms[name]);
    }

    this.getConfig = () => {
        let configs = {};
        
        for (let prop in platforms) {
            if (platforms[prop].isEnabled()) {
                configs[prop] = platforms[prop].getConfig();
            }
        }
        
        return configs;
    };
    
    this.enableOnly = (only = []) => {
        Object.keys(platforms).forEach(prop => {
            let platform = platforms[prop];
            
            only.indexOf(prop) != -1 ? platform.enable() : platform.disable();
        });
    };
    
    this.disableOnly = (only = []) => {
        this.enableOnly(Object.keys(platforms).filter(prop => {
            return only.indexOf(prop) == -1;
        }));
    };
};

module.exports = new Core();
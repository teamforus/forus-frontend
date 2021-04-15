const platform = require('./_WebshopBasePlatform').clone();
const destPath = '../dist/forus-webshop-general.panel';

// change platform name
platform.setName('webshop_general');

// change building root path
platform.setDestRootPath(destPath);

// assets configs
platform.copyAsset("resources/_webshop-common/**/*", "./");
platform.copyAsset("resources/webshop-general/**/*", "./");

// tweak scss configs
platform.editTask('scss', (task) => {
    task.src = "general/style-webshop-general.scss";
    task.watch = [
        "_common/**/*.scss",
        "general/**/*.scss"
    ];

    return task;
});

// change server port
platform.serve(5500, '/', {
    'Content-Security-Policy': `
        connect-src 'self' https://*.api.forus.io/ https://api.forus.io/ https://api.forus.rminds.dev/; 
        font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; 
        style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com 'nonce-1Py20ko19vEhus6l1yvGJw=='; 
        img-src * data: 'self' https://media.staging.forus.io https://media.forus.io https://fonts.googleapis.com https://maps.gstatic.com https://*.googleapis.com/ *.ggpht; 
        script-src 'self' https://maps.googleapis.com https://maps.gstatic.com https://www.analytics.forus.io 'nonce-1Py20ko19vEhus6l1yvGJw=='; 
        default-src 'self'; 
        form-action 'none'; 
        frame-src 'self' https://www.youtube.com/embed/; 
        frame-ancestors 'none'`.replace(/\n/g, ' '),
});

module.exports = platform;
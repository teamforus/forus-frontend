const core = require('./qdt/Core');

// Register markups
core.addPlatform(require('./platforms/Webshops/WebshopMarkupPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardMarkupPlatform'));

// Register dashbaords
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralProviderPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralValidatorPlatform'));


// Register webshops
core.addPlatform(require('./platforms/Webshops/WebshopGeneralPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopPotjeswijzerPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopNijmegenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopKerstpakketPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopWesterkwartierPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopGroningenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopBerkellandPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopOostGelrePlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopWinterswijkPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopNoordoostpolderPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopGeertruidenbergPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopWaalwijkPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopHeumenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopVergoedingenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopEdePlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopHartvanWestBrabantPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopParticipatiemuntPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopSchagenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopEemsdeltaPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopDoetegoedPlatform'));

// Register meapp landings
core.addPlatform(require('./platforms/Website/Website'));

// Register backend platform
core.addPlatform(require('./platforms/Backend/BackendGeneralPlatform'));

module.exports = core;
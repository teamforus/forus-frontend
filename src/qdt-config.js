const core = require('./qdt/Core');

// Register markups
core.addPlatform(require('./platforms/Webshops/WebshopMarkupPlatform'));

// Register dashbaords
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralProviderPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralValidatorPlatform'));

core.addPlatform(require('./platforms/Dashboards/DashboardZuidhornSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardZuidhornProviderPlatform'));

core.addPlatform(require('./platforms/Dashboards/DashboardNijmegenSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardNijmegenProviderPlatform'));

// Register webshops
core.addPlatform(require('./platforms/Webshops/WebshopGeneralPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopZuidhornPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopNijmegenPlatform'));

// Register meapp landings
core.addPlatform(require('./platforms/Landings/LandingMeAppGeneralPlatform'));
core.addPlatform(require('./platforms/Landings/LandingMeAppZuidhornPlatform'));
core.addPlatform(require('./platforms/Landings/LandingMeAppNijmegenPlatform'));

module.exports = core;
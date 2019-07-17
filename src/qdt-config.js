const core = require('./qdt/Core');

// Register markups
core.addPlatform(require('./platforms/Webshops/WebshopMarkupPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardMarkupPlatform'));

// Register dashbaords
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralProviderPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardGeneralValidatorPlatform'));

core.addPlatform(require('./platforms/Dashboards/DashboardZuidhornSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardZuidhornProviderPlatform'));

core.addPlatform(require('./platforms/Dashboards/DashboardNijmegenSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardNijmegenProviderPlatform'));

core.addPlatform(require('./platforms/Dashboards/DashboardWesterkwartierSponsorPlatform'));
core.addPlatform(require('./platforms/Dashboards/DashboardWesterkwartierProviderPlatform'));

// Register webshops
core.addPlatform(require('./platforms/Webshops/WebshopGeneralPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopZuidhornPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopNijmegenPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopForusPlatform'));
core.addPlatform(require('./platforms/Webshops/WebshopWesterkwartierPlatform'));

// Register meapp landings
core.addPlatform(require('./platforms/Website/Website'));

module.exports = core;
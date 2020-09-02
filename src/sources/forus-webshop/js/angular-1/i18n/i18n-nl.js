module.exports = {
    test: "{{name}} {{foo}}",
    page_title: 'Forus platform',
    page_state_titles: {
        home: '{{implementation}} webshop',
        funds: 'Fondsen',
        platform: 'Forus Platform',
        me: 'Me',
        'me-app': 'Me-app',
        portfolio: 'Portfolio',
        kindpakket: 'Portofolio - Kindpakket',
        products: 'Aanbiedingen',
        providers: 'Aanbieders',
        "products-show": 'Aanbieding',
        "products-apply": "Aanbieding kopen",
        vouchers: 'Mijn vouchers',
        voucher: 'Uw voucher',
        records: 'Eigenschappen', 
        "record-validate": 'Valideer eigenschap',
        "record-validations": 'Validaties',
        "record-create": 'Eigenschap toevoegen',
        "funds-apply": 'Meld u aan voor de fondsen',
        "restore-email": 'Inloggen via e-mail',
        "preferences-notifications": 'Notificatie voorkeuren',
    },
    implementation_name: {
        general: 'General',
        potjeswijzer: 'Potjeswijzer',
        nijmegen: 'Nijmegen',
        westerkwartier: 'Westerkwartier',
        forus: 'Forus platform & ',
        kerstpakket: 'Kerstpakket',
        berkelland: 'Berkelland',
        oostgelre: 'Oostgelre',
        winterswijk: 'Winterswijk',
        noordoostpolder: 'Meedoenpakket',
        groningen: 'Groningen'
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },

    // COMPONENTS
    buttons: require("./nl/components/buttons"),

    // LAYOUT
    topnavbar: require("./nl/layout/navbar"),

    // PAGES
    signup_options: require("./nl/pages/signup-options"),
    fund_apply: require("./nl/pages/fund-apply"),
    fund_request: require("./nl/pages/fund-request"),
    fund_request_clarification: require("./nl/pages/fund-request-clarification"),
    funds: require("./nl/pages/funds"),
    home: require("./nl/pages/home"),
    meapp_index: require("./nl/pages/me-index"),
    product_apply: require("./nl/pages/product-apply"),
    product: require("./nl/pages/product"),
    records_validations: require("./nl/pages/record-validations"),
    records_create: require("./nl/pages/records-create"),
    records_validate: require("./nl/pages/records-validate"),
    records: require("./nl/pages/records"),
    voucher: require("./nl/pages/voucher"),
    vouchers: require("./nl/pages/vouchers"),
    notification_preferences: require("./nl/pages/notification-preferences"),
    email_preferences: require("./nl/pages/email-preferences"),
    voucher_printable: require('./nl/pages/voucher-printable'),
    accessibility: require('./nl/pages/accessibility'),
    error_page: require("./nl/pages/error-page"),

    // MODALS
    popup_auth: require("./nl/modals/modal-auth"),
    popup_offices: require("./nl/modals/modal-offices"),
    open_in_me: require("./nl/modals/modal-open-in-me"),
    physical_card: require("./nl/modals/modal-physical_card"),
    expired_identity: require("./nl/modals/modal-expired-identity-proxy"),
    modal: require("./nl/modals/modal"),

    // DIRECTIVES
    block_products: require("./nl/directives/block-products"),
    //todo move to seperate file
    block_notifications: {
        labels: {
            title: "Notificaties",
            subtitle: "Wanneer iemand een actie doet, die jou betreft op deze website, wordt er een notificatie daarvan hier getoond.",
        },
    },
    block_providers: require("./nl/directives/block-providers"),
    contact: require("./nl/directives/contact"),
    empty_block: require("./nl/directives/empty-block"),
    fund_criterion: require("./nl/directives/fund-criterion"),
    maps: require("./nl/directives/google-map"),
    profile_card: require("./nl/directives/profile-card"),
};

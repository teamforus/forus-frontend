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
    },
    implementation_name: {
        general: 'General',
        zuidhorn: 'Zuidhorn',
        nijmegen: 'Nijmegen',
        westerkwartier: 'Westerkwartier',
        forus: 'Forus platform & ',
        kerstpakket: 'Kerstpakket',
        berkelland: 'Berkelland',
        oostgelre: 'Oostgelre',
        winterswijk: 'Winterswijk',
        noordoostpolder: 'Meedoenpakket webshop'
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },

    // COMPONENTS
    buttons: require("./en/components/buttons"),

    // LAYOUT
    topnavbar: require("./en/layout/navbar"),

    // PAGES
    fund_apply: require("./en/pages/fund-apply"),
    funds: require("./en/pages/funds"),
    home: require("./en/pages/home"),
    meapp_index: require("./en/pages/me-index"),
    product_apply: require("./en/pages/product-apply"),
    product: require("./en/pages/product"),
    records_validations: require("./en/pages/record-validations"),
    records_create: require("./en/pages/records-create"),
    records_validate: require("./en/pages/records-validate"),
    records: require("./en/pages/records"),
    voucher: require("./en/pages/voucher"),
    vouchers: require("./en/pages/vouchers"),
    notification_preferences: require("./en/pages/notification-preferences"),

    // MODALS
    popup_auth: require("./en/modals/modal-auth"),
    popup_offices: require("./en/modals/modal-offices"),
    open_in_me: require("./en/modals/modal-open-in-me"),
    modal: require("./en/modals/modal"),

    // DIRECTIVES
    block_products: require("./en/directives/block-products"),
    block_providers: require("./en/directives/block-providers"),
    contact: require("./en/directives/contact"),
    empty_block: require("./en/directives/empty-block"),
    fund_criterion: require("./en/directives/fund-criterion"),
    maps: require("./en/directives/google-map"),
    profile_card: require("./en/directives/profile-card"),

};
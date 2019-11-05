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
        "funds-apply": 'Meld u aan voor een fonds',
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
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },
    provider_details: {
        address: 'Adres',
        organization_type: 'Organisatie type',
        website: 'Website',
        phone: 'Telefoonnummer',
        email: 'E-mailadres',
        no_data: 'Geen data'
    },

    // COMPONENTS
    buttons: require("./nl/components/buttons"),

    // LAYOUT
    topnavbar: require("./nl/layout/navbar"),

    // PAGES
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

    // MODALS
    popup_auth: require("./nl/modals/modal-auth"),
    popup_offices: require("./nl/modals/modal-offices"),
    open_in_me: require("./nl/modals/modal-open-in-me"),
    sign_up: require("./nl/modals/modal-sign-up"),
    modal: require("./nl/modals/modal"),

    // DIRECTIVES
    block_products: require("./nl/directives/block-products"),
    contact: require("./nl/directives/contact"),
    empty_block: require("./nl/directives/empty-block"),
    fund_criterion: require("./nl/directives/fund-criterion"),
    maps: require("./nl/directives/google-map"),
    profile_card: require("./nl/directives/profile-card"),

};
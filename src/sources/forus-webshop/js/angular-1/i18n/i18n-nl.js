module.exports = {
    test: "{{name}} {{foo}}",
    page_title: 'Forus platform',
    page_state_titles: {
        home: '{{implementation}} webshop',
        funds: 'Aanvragen',
        platform: 'Forus Platform',
        me: 'Me',
        'me-app': 'Me-app',
        portfolio: 'Portfolio',
        kindpakket: 'Portofolio - Kindpakket',
        product: 'Aanbod - {{product_name}} van {{organization_name}}',
        products: 'Aanbod',
        "actions": 'Aanbod',
        providers: 'Aanbieders',
        "products-show": 'Aanbieding',
        "products-apply": "Aanbieding kopen",
        vouchers: 'Mijn tegoed',
        voucher: 'Uw tegoed',
        "reservations": 'Reserveringen',
        provider: 'Aanbieder',
        records: 'Eigenschappen',
        explanation: 'Uitleg',
        start: 'Start aanmelden',
        privacy: 'Privacy statement',
        accessibility: 'Toegankelijkheidsverklaring',
        "record-validate": 'Eigenschap goedkeuren',
        "record-validations": 'Goedkeuringen',
        "record-create": 'Eigenschap toevoegen',
        "funds-apply": 'Aanvragen',
        "fund-apply": 'Aanvragen',
        "fund-activate": 'Activeren',
        "restore-email": 'Inloggen via e-mail',
        "notifications": 'Notificatie',
        "security-sessions": 'Security sessies',
        "preferences-notifications": 'Notificatievoorkeuren',
        "identity-emails": 'E-mail instellingen',
        "fund-request-clarification": 'Aanvulverzoek',
        "terms_and_conditions": 'Algemene voorwaarden',
        "confirmation-email": 'E-mail bevestigen',
        "provider-office": 'Aanbieder vestiging',
        "auth-link": "Inloggen",
        "sign-up": 'Aanmelden',
        "me-app": 'Me-app'
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
        groningen: 'Stadjerspas',
        geertruidenberg: 'Geertruidenberg',
        waalwijk: 'Paswijzer',
        heumen: 'Heumen',
        vergoedingen: "Vergoedingen",
        ede: "Ede",
        schagen: "Schagen",
        hartvanwestbrabant: "HvWB",
        participatiemunt: "Participatiemunt",
        eemsdelta: "Eemsdelta",
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },
    email_service_switch: {
        confirm: 'Breng me naar mijn e-mail'
    },

    // COMPONENTS
    buttons: require("./nl/components/buttons"),

    // LAYOUT
    topnavbar: require("./nl/layout/navbar"),

    // PAGES
    signup_options: require("./nl/pages/signup-options"),
    fund: require("./nl/pages/fund"),
    fund_request: require("./nl/pages/fund-request"),
    fund_request_clarification: require("./nl/pages/fund-request-clarification"),
    funds: require("./nl/pages/funds"),
    home: require("./nl/pages/home"),
    meapp_index: require("./nl/pages/me-index"),
    product: require("./nl/pages/product"),
    records_validations: require("./nl/pages/record-validations"),
    records_create: require("./nl/pages/records-create"),
    records_validate: require("./nl/pages/records-validate"),
    records: require("./nl/pages/records"),
    voucher: require("./nl/pages/voucher"),
    vouchers: require("./nl/pages/vouchers"),
    reservations: require("./nl/pages/reservations"),
    notification_preferences: require("./nl/pages/notification-preferences"),
    email_preferences: require("./nl/pages/email-preferences"),
    voucher_printable: require('./nl/pages/voucher-printable'),
    accessibility: require('./nl/pages/accessibility'),
    error_page: require("./nl/pages/error-page"),
    privacy: require("./nl/pages/privacy"),
    error: require("./nl/pages/error"),

    // MODALS
    popup_auth: require("./nl/modals/modal-auth"),
    logout: require("./nl/modals/modal-logout"),
    popup_offices: require("./nl/modals/modal-offices"),
    open_in_me: require("./nl/modals/modal-open-in-me"),
    physical_card: require("./nl/modals/modal-physical_card"),
    expired_identity: require("./nl/modals/modal-expired-identity-proxy"),
    pdf_preview: require("./nl/modals/modal-pdf-preview"),
    image_preview: require("./nl/modals/modal-image-preview"),
    modal: require("./nl/modals/modal"),
    modal_product_reserve: require("./nl/modals/modal-product-reserve"),
    modal_product_reserve_notes: require("./nl/modals/modal-product-reserve-notes"),
    modal_product_reserve_cancel: require("./nl/modals/modal-product-reserve-cancel"),

    // DIRECTIVES
    app_footer: require("./nl/directives/app-footer"),
    block_products: require("./nl/directives/block-products"),
    block_funds: require("./nl/directives/block-funds"),
    block_notifications:  require("./nl/directives/block-notifications"),
    block_providers: require("./nl/directives/block-providers"),
    empty_block: require("./nl/directives/empty-block"),
    fund_criterion: require("./nl/directives/fund-criterion"),
    maps: require("./nl/directives/google-map"),
    profile_menu: require("./nl/directives/profile-menu"),
    top_navbar_search: require('./nl/directives/top-navbar-search'),
};

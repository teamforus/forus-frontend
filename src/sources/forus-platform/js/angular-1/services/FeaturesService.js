const FeaturesService = function () {
    return new (function () {
        this.list = [{
            key: 'bi_tools',
            name: 'BI-tools',
            description: 'Make a connection with the BI-tool of your choice. IBM Cognos. Microsoft Power BI.',
            label: 'Data',
        }, {
            key: 'email_connection',
            name: 'E-mail Connection',
            description: 'Send e-mails from your own domain name.',
            label: 'Koppeling',
        }, {
            key: 'backoffice_api',
            name: 'Backoffice-API',
            description: 'Morbi egestas nisl ac quisque sapien. Magna nulla vestibulum dignissim quis.',
            label: 'Aanvraag',
        }, {
            key: 'iconnect_api',
            name: 'Haalcentraal API',
            description: 'Enim vel tempus lobortis accumsan morbi arcu pulvinar. Nibh mattis amet vitae iaculis arcu.',
            label: 'Social media',
        }, {
            key: 'digid',
            name: 'DigiD',
            description: 'Allow users to login and apply to funds using DigiD.',
            label: 'Financieel',
        }, {
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties tussen Forus en de rekening van de gemeente bij de Bank Nederlandse Gemeenten (BNG).',
            label: 'Financieel',
        }, {
            key: 'reimbursements',
            name: 'Declarations',
            description: 'Allow users to upload receipts in order to be reimbursed.',
            label: 'Veiligheid',
        }, {
            key: 'auth_2_fa',
            name: 'Two Factor Authentication',
            description: 'Make the use of two factor authentication mandatory.',
            label: 'Data',
        }, {
            key: 'voucher_records',
            name: 'Records on vouchers',
            description: 'Show more details on the vouchers.',
            label: 'Gebruiksvriendelijkheid',
        }, {
            key: 'physical_cards',
            name: 'Physical cards',
            description: 'Give people the option to order a physical card with a QR-code. ',
            label: 'Aanvraag',
        }];

        this.previewList = [{
            key: 'digid',
            name: 'DigiD',
            description: 'Allow users to login and apply to funds using DigiD.',
        }, {
            key: 'bng',
            name: 'BNG',
            description: 'Geautomatiseerde financiële transacties tussen Forus en de rekening van de gemeente bij de Bank Nederlandse Gemeenten (BNG).',
        }, {
            key: 'auth_2_fa',
            name: 'Two Factor Authentication',
            description: 'Make the use of two factor authentication mandatory.',
        }, {
            key: 'reimbursements',
            name: 'Declarations',
            description: 'Allow users to upload receipts in order to be reimbursed.',
        }];
    });
};

module.exports = [
    FeaturesService,
];

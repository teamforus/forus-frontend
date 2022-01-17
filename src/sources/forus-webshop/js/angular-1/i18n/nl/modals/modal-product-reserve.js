module.exports = {
    // PRODUCT RESERVE POPUP = popup-product-reserve.pug
    header: {
        title_formal: 'Weet u zeker dat u een reservering wilt plaatsen?',
        title_informal: 'Weet je zeker dat je een reservering wilt plaatsen?',
    },
    description_formal: [
        'U gebruikt uw <strong>{{fund}}</strong> tegoed voor deze reservering.', 
        'Voor het maken van de reservering wordt uw e-mailadres gedeeld met de aanbieder.',
    ].join('<br/>'),
    description_informal: [
        'Je gebruikt jouw <strong>{{fund}}</strong> tegoed voor deze reservering.',
        'Voor het maken van de reservering wordt je e-mailadres gedeeld met de aanbieder.',
    ].join('<br/>'),

    description_formal_time: "De reservering kunt u na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren. ",
    description_informal_time: "De reservering kun je na bevestiging nog binnen {{ days_to_cancel }} dagen annuleren.",
}

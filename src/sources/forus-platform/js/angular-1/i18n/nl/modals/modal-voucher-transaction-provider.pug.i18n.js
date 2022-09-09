module.exports = {
    title: "Nieuwe transactie",
    prevalidate: {
        title: "Bevestig de transactie",
        description: "Deze transactie wordt gecontroleerd en in het volgende betaalbestand meegenomen. De transactie kan daarna niet meer ongedaan gemaakt worden.",
    },
    success: {
        title: "Transactie is verzonden",
        description: "De transactie is klaargezet en wordt binnen 3 werkdagen uitbetaald!",
    },
    labels: {
        note: 'Notitie',
        amount: 'Bedrag',
        provider: 'Aanbieder',
        organization: 'Betaal vanuit',
        target: 'Pay to',
        target_iban: 'IBAN-nummer',
        target_name: 'IBAN-naam',
    },
    buttons: {
        cancel: "Annuleren",
        submit: "Betaal",
        close: "Bevestig",
    }
};

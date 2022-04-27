module.exports = {
    title: "Nieuwe transactie",
    prevalidate: {
        title: "Bevestig de transactie",
        description: "Deze transactie wordt gecontroleerd en in het volgende betaalbestand meegenomen. De transactie kan daarna niet meer ongedaan gemaakt worden.",
    },
    success: {
        title: "Transactie is verzonden",
        description: "Thank you, your opinion is very important to us!",
    },
    labels: {
        provider: 'Aanbieder',
        amount: 'Bedrag',
        organization: 'Betaal vanuit',
    },
    buttons: {
        cancel: "Annuleren",
        submit: "Betaal",
        close: "Bevestig",
    }
};

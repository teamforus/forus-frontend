export default {
    modal_title: 'Reservering weigeren',
    title: {
        single: 'Weet u zeker dat u deze reservering wilt weigeren?',
        plural: 'Weet u zeker dat u deze reserveringen wilt weigeren?',
    },
    description: {
        single: 'De inwoner ontvangt per e-mail een bericht dat de reservering is geannuleerd. U kunt eventueel een reden toevoegen. U ontvangt deze betaling niet meer.',
        plural: 'De inwoners ontvangen per e-mail een bericht dat de reservering is geannuleerd. U kunt eventueel een reden toevoegen. U ontvangt deze betalingen niet meer.',
    },
    labels: {
        message: 'Notitie',
        notify: 'Verstuur dit bericht naar de inwoner',
    },
    tooltips: {
        message: [
            'Voeg indien gewenst een notitie met extra uitleg toe. Vink ‘Verstuur dit bericht naar de inwoner’ aan om deze notitie met de klant te delen.',
            'De klant ontvangt de annulering per e-mail. De notitie wordt als extra uitleg aan dit bericht toegevoegd.',
        ].join(' '),
        notify: 'U kunt alleen een bericht naar de deelnemer versturen als er een e-mailadres is opgegeven.',
    },
    placeholders: {
        message: 'Voeg een notitie of reden toe',
    },
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
    },
};

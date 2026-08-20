export default {
    modal_title: 'Reservering accepteren',
    form_title: 'Notitie toevoegen',
    title: {
        single: 'Weet u zeker dat u deze reservering wilt accepteren?',
        plural: 'Weet u zeker dat u deze reserveringen wilt accepteren?',
    },
    description: {
        single: [
            'De inwoner ontvangt per e-mail een bevestiging. U kunt eventueel een persoonlijke notitie of een bericht toevoegen. De betaling wordt daarna voor u klaargezet.',
            'U kunt de transactie binnen 14 dagen annuleren. Daarna wordt het bedrag uitbetaald.',
        ].join('\n\n'),
        plural: [
            'De inwoners ontvangen per e-mail een bevestiging. U kunt eventueel een persoonlijke notitie of een bericht toevoegen. De betalingen worden daarna voor u klaargezet.',
            'De transacties kunt u nog binnen 14 dagen annuleren. Daarna wordt het bedrag uitbetaald.',
        ].join('\n\n'),
    },
    labels: {
        message: 'Notitie',
        notify: 'Verstuur dit bericht naar de inwoner',
    },
    tooltips: {
        message: [
            'Voeg indien gewenst een notitie met extra uitleg toe. Vink ‘Verstuur dit bericht naar de inwoner’ aan om deze notitie met de klant te delen.',
            'De klant ontvangt de bevestiging per e-mail. De notitie wordt als extra uitleg aan dit bericht toegevoegd.',
        ].join(' '),
    },
    placeholders: {
        message: 'Voeg een notitie of reden toe',
    },
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
    },
    success: {
        item: 'Reservering voor {{product_name}} voor {{amount}} geaccepteerd.',
        single: 'Opgeslagen!',
        batch: 'Alle reserveringen zijn geaccepteerd.',
    },
};

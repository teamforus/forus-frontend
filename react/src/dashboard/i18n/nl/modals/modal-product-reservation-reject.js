export default {
    form_title: 'Notitie toevoegen',
    modal_title: {
        reject: 'Reservering weigeren',
        cancel: 'Reservering annuleren',
        mixed: 'Reserveringen weigeren of annuleren',
    },
    title: {
        reject: {
            single: 'Weet u zeker dat u deze reservering wilt weigeren?',
            plural: 'Weet u zeker dat u deze reserveringen wilt weigeren?',
        },
        cancel: {
            single: 'Weet u zeker dat u deze reservering wilt annuleren?',
            plural: 'Weet u zeker dat u deze reserveringen wilt annuleren?',
        },
        mixed: {
            single: 'Weet u zeker dat u deze reservering wilt weigeren of annuleren?',
            plural: 'Weet u zeker dat u deze reserveringen wilt weigeren of annuleren?',
        },
    },
    description: {
        reject: {
            single: [
                'De inwoner ontvangt per e-mail een bericht dat de reservering is geweigerd.',
                'U kunt eventueel een reden toevoegen. U ontvangt deze betaling niet meer.',
            ].join(' '),
            plural: [
                'De inwoners ontvangen per e-mail een bericht dat de reservering is geweigerd.',
                'U kunt eventueel een reden toevoegen. U ontvangt deze betalingen niet meer.',
            ].join(' '),
        },
        cancel: {
            single: [
                'De inwoner ontvangt per e-mail een bericht dat de reservering is geannuleerd.',
                'U kunt eventueel een reden toevoegen. U ontvangt deze betaling niet meer.',
            ].join(' '),
            plural: [
                'De inwoners ontvangen per e-mail een bericht dat de reservering is geannuleerd.',
                'U kunt eventueel een reden toevoegen. U ontvangt deze betalingen niet meer.',
            ].join(' '),
        },
        mixed: {
            single: [
                'De inwoner ontvangt per e-mail een bericht dat de reservering is geweigerd of geannuleerd,',
                'afhankelijk van de huidige status. U kunt eventueel een reden toevoegen.',
                'U ontvangt deze betaling niet meer.',
            ].join(' '),
            plural: [
                'De inwoners ontvangen per e-mail een bericht dat hun reservering is geweigerd of geannuleerd,',
                'afhankelijk van de huidige status. U kunt eventueel een reden toevoegen.',
                'U ontvangt deze betalingen niet meer.',
            ].join(' '),
        },
    },
    labels: {
        message: 'Notitie',
        notify: 'Verstuur dit bericht naar de inwoner',
    },
    tooltips: {
        message: {
            reject: [
                'Voeg indien gewenst een notitie met extra uitleg toe.',
                'Vink ‘Verstuur dit bericht naar de inwoner’ aan om deze notitie met de klant te delen.',
                'De klant ontvangt de weigering per e-mail. De notitie wordt als extra uitleg toegevoegd.',
            ].join(' '),
            cancel: [
                'Voeg indien gewenst een notitie met extra uitleg toe.',
                'Vink ‘Verstuur dit bericht naar de inwoner’ aan om deze notitie met de klant te delen.',
                'De klant ontvangt de annulering per e-mail. De notitie wordt als extra uitleg toegevoegd.',
            ].join(' '),
            mixed: [
                'Voeg indien gewenst een notitie met extra uitleg toe.',
                'Vink ‘Verstuur dit bericht naar de inwoner’ aan om deze notitie met de klant te delen.',
                'De klant ontvangt de weigering of annulering per e-mail, afhankelijk van de huidige status.',
                'De notitie wordt als extra uitleg toegevoegd.',
            ].join(' '),
        },
    },
    placeholders: {
        message: 'Voeg een notitie of reden toe',
    },
    buttons: {
        cancel: 'Annuleren',
        submit: 'Bevestigen',
    },
    success: {
        single: 'Opgeslagen!',
        item: {
            reject: 'Reservering voor {{product_name}} voor {{amount}} geweigerd.',
            cancel: 'Reservering voor {{product_name}} voor {{amount}} geannuleerd.',
        },
        batch: {
            reject: 'Alle reserveringen zijn geweigerd.',
            cancel: 'Alle reserveringen zijn geannuleerd.',
            mixed: 'De geselecteerde reserveringen zijn geweigerd of geannuleerd.',
        },
    },
};

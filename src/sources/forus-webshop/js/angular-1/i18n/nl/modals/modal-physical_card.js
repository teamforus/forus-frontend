module.exports = {
    modal_section: {
        type_selection: {
            title: 'Plastic pas',
            subtitle: 'Maak een keuze.',
            card_old: {
                title: 'Oude pas opnieuw activeren',
                description: 'Heeft u al een pas?<br/>Activeer uw pas opnieuw.',
                success: 'Pas gekoppeld!'
            },
            card_new: {
                title: 'Nieuwe pas aanvragen',
                description: 'Heeft u nog geen pas?<br/>Bestel een nieuwe pas.',
            },
        },
        link_card: {
            title: 'Activeer uw oude pas',
            subtitle: 'Voer uw pas persoonlijke code in',
            description: [
                'Op uw pasje staat een QR-code, hieronder staat uw persoonlijke code.',
                'Als u de oude pas opnieuw activeert kunt u deze blijven gebruiken.',
                'Hulp nodig?  Bel 14 050 maandag t/m vrijdag 9.00 tot 12.00.',
            ].join('<br/>'),
        },
        request_new_card: {
            title: 'Plastic pas',
            subtitle: 'Uw digitale pas:',
            preffer_plastic_card: 'Liever een plastic pas?',
            order: 'Bestellen',
            postcode: 'Postcode',
            postcode_placeholder: 'Postcode',
            address: 'Straatnaam',
            address_placeholder: 'Straatnaam',
            city: 'Plaats',
            city_placeholder: 'Plaats',
            house: 'Huisnummer',
            house_placeholder: 'Huisnummer',
            house_addition: 'Huisnummer toevoeging',
            house_addition_placeholder: 'Huisnummer toevoeging',
            email_to_me: 'E-mail naar mij',
            print_pass: 'Uw pas printen',
            open_in_app: 'Open in app',
        },
        link_card_success: {
            title: 'Pas gekoppeld!',
            description: 'Uw pas is gekoppeld aan uw {{fundName}}-tegoed!',
        },
        request_card_success: {
            title: 'Uw pas is besteld!',
            description: 'De pas wordt verstuurd naar het adres dat u heeft ingevuld.',
        }
    },
    buttons: {
        close: 'Sluiten',
        link_card: {
            submit_code: 'Bevestig',
        },
        request_new_card: {
            order_by_email: 'Per post bestellen',
            confirm: 'Bevestig',
        },
    }
}
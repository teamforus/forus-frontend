module.exports = {
    modal_section: {
        type_selection: {
            title: 'Gebruik mijn QR-code',
            subtitle: 'Dit zijn de opties om uw QR-code mee te nemen naar de aanbieder:',
            card_old: {
                title: 'Oude pas opnieuw activeren',
                description: 'Heeft u al een pas?<br/>Activeer uw pas opnieuw.',
                success: 'Pas gekoppeld!'
            },
            card_new: {
                title: 'Bestel een pas',
                description: 'Heeft u nog geen pas?<br/>Bestel een nieuwe pas.',
            },
        },
        link_card: {
            title: 'Activeer uw oude pas',
            subtitle: 'Voer uw persoonlijke klantcode in',
            description: [
                'Op uw pasje staat een QR-code, hieronder staat uw persoonlijke code.',
                'Als u de oude pas opnieuw activeert kunt u deze blijven gebruiken.',
                'Hulp nodig?  Bel 14 050 maandag t/m vrijdag 9.00 tot 12.00.',
            ].join('<br/>'),
        },
        request_new_card: {
            title: 'Bestel een pas',
            subtitle: 'Uw digitale pas:',
            preffer_plastic_card: 'Liever een plastic pas?',
            description: 'Vul uw adresgegevens in. De pas wordt via de post naar u verstuurd.',
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
            print_pass: 'QR-code printen',
            open_in_app: 'Open in app',
        },
        link_card_success: {
            title: 'Pas gekoppeld!',
            description: 'Uw pas is gekoppeld aan uw {{fundName}}-tegoed!',
        },
        link_card_unlink: {
            title: 'Blokkeer uw pas',
            buttons: {
                submit: "Blokkeer",
                cancel: "Annuleer"
            }
        },
        request_card_success: {
            title: 'Uw pas is besteld!',
            description: [
                '<h2>Uw pas is besteld!</h2>',
                'De pas wordt verstuurd naar het adres: <br />',
                '{{address}} {{house}} {{house_addition}}',
                '{{postcode}} {{city}} <br />',
                'U heeft een e-mail ontvangen met de bevestiging van uw bestelling.',
            ].join('<br/>'),
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
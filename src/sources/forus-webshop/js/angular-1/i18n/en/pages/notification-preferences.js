module.exports = {
    title_preferences: 'E-mailvoorkeuren',
    unsubscribe: 'Uitschrijven voor alle notificaties',
    unsubscribe_button: 'Uitschrijven',
    errors: {
        'not_found': 'Deze token is ongeldig',
        'expired': 'Deze token is verlopen',
        'not-pending': 'De notificatieinstellingen zijn al aangepast via deze link'
    },
    types: {
        funds: {
            balance_warning: {
                title: 'Balans op fonds is onder herinneringsgrens',
                description: 'Notificatie wanneer een balans op de fonds onder herinneringsgrens komt.'
            },
            fund_expires: {
                title: 'Herinneringsnotificatie einddatum voucher',
                description: 'Notificatie verstuurd 1 maand voor de einddatum van uw voucher.'
            },
            product_added: {
                title: 'Een nieuw product is toegevoegd',
                description: 'Notificatie wanneer een nieuw product is toegevoegd in de webshop',
            },
            new_fund_created: {
                title: 'Nieuw fonds is aangemaakt',
                description: 'Notificatie wanneer een nieuw fonds is aangemaakt'
            },
            product_reserved: {
                title: 'Product gereserveerd',
                description: 'Notificatie wanneer product gereserveerd',
            },
            product_sold_out: {
                title: 'Product uitverkocht',
                description: 'Notificatie wanneer een product is uitverkocht'
            },
            provider_applied: {
                title: 'Aanbieder biedt zich aan',
                description: 'Notificatie wanneer een nieuwe aanbieder zich aanbiedt bij een fonds'
            },
            provider_approved: {
                title: 'Aanbieder geaccepteerd',
                description: 'Notificatie wanneer een nieuwe aanbieder geaccepteerd is'
            },
            provider_rejected: {
                title: 'Aanbieder afgewezen',
                description: 'Notificatie wanneer een nieuwe aanbieder is afgewezen'
            },
        },
        validations: {
            new_validation_request: {
                title: 'Nieuw validatieverzoek',
                description: 'Notificatie wanneer er een nieuw validatieverzoek is'
            },
            you_added_as_validator: {
                title: 'Je bent toegevoegd als validator',
                description: 'Notificatie wanneer je toegevoegd bent als validator bij een fonds'
            }
        },
        vouchers: {
            payment_success: {
                title: 'Betaling gelukt',
                description: 'Notificatie wanneer een betaling is gelukt'
            },
            share_product: {
                title: 'Reservering delen',
                description: 'Notificatie wanneer er een reservering met u gedeeld is'
            }
        }
    }

}
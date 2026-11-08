export default {
    header: {
        title: 'Bulk #{{id}}',
        orders: 'Bestellingen in deze bulk',
    },
    labels: {
        id: 'ID',
        created_at: 'Aangemaakt op',
        employee: 'Aangemaakt door',
        orders_count: 'Bestellingen',
        orders_pending: 'Wachtend',
        orders_sent: 'Verstuurd',
        orders_error: 'Mislukt',
        state: 'Status',
        processed_at: 'Verwerkt op',
    },
    tooltips: {
        id: 'Het unieke ID-nummer van de bulk.',
        created_at: 'De datum en het tijdstip waarop de bestellingen zijn goedgekeurd en de bulk is aangemaakt.',
        employee: 'De medewerker die de bestellingen heeft goedgekeurd.',
        orders_count: 'Het aantal bestellingen in de bulk.',
        orders_sent: 'Het aantal bestellingen dat door DCP is ontvangen.',
        orders_error: 'Het aantal bestellingen dat niet naar DCP verstuurd kon worden of door DCP is geannuleerd.',
        state: 'De status van de bulk: wordt verstuurd zolang er bestellingen wachten, daarna verstuurd of mislukt.',
    },
    buttons: {
        refresh: 'Vernieuwen',
    },
    empty: {
        title: 'Geen bulks',
        description: 'Er zijn nog geen bestellingen goedgekeurd en naar DCP verstuurd.',
    },
};

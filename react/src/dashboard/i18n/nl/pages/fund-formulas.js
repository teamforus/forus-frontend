export default {
    labels: {
        id: 'ID',
        type: 'Type',
        amount: 'Bedrag',
        conditions: 'Voorwaarden',
        record_type: 'Gegeven',
        created_at: 'Aangemaakt op',
        updated_at: 'Laatste aanpassing',
    },
    tooltips: {
        id: 'Uniek ID van de rekenregel.',
        type: 'Type rekenregel (bijv. vast bedrag of berekening op basis van een gegeven).',
        amount: 'Bedrag van de rekenregel.',
        conditions:
            'Aan alle vermelde voorwaarden moet zijn voldaan om deze rekenregel toe te ' +
            'passen. Zonder voorwaarden wordt de rekenregel altijd toegepast.',
        record_type: 'Gegeven gekoppeld aan de formule (bijv. aantal kinderen).',
        created_at: 'Datum en tijdstip van creatie.',
        updated_at: 'Datum en tijdstip van laatste wijziging.',
    },
};

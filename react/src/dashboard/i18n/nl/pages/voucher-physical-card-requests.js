export default {
    header: {
        title: 'Aangevraagde fysieke passen',
    },
    labels: {
        id: 'ID',
        name: 'Naam',
        address: 'Adres',
        physical_card_type: 'Soort pas',
        created_at: 'Aangevraagd op',
        dcp_order_id: 'Ordernummer DCP',
        card_code: 'Pasnummer',
        dcp_state: 'Status DCP',
        shipped_at: 'Verzonden op',
    },
    tooltips: {
        id: 'Het unieke ID-nummer van de aanvraag voor een fysieke pas.',
        name: 'De voor- en achternaam van de ontvanger zoals ingevuld bij de aanvraag.',
        address: 'Het adres waar de pas naartoe wordt gestuurd.',
        physical_card_type: 'Het soort fysieke pas dat is aangevraagd.',
        created_at: 'De datum en het tijdstip waarop de pas is aangevraagd.',
        dcp_order_id: 'Het ordernummer dat DCP aan de bestelling heeft gegeven.',
        card_code: 'Het pasnummer dat op de pas wordt geprint en na verzending aan DCP aan het tegoed wordt gekoppeld.',
        dcp_state: 'De status van de bestelling bij Dutch Card Printing (DCP), met de status en het bericht van DCP.',
        shipped_at: 'De datum waarop DCP de pas heeft verzonden.',
    },
    empty: {
        title: 'Geen aanvragen',
        description: 'Er zijn nog geen fysieke passen aangevraagd voor dit tegoed.',
    },
};

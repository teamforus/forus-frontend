export default {
    header: {
        title: 'DCP bestellingen',
        title_bulks: 'Bulks',
    },
    view_types: {
        orders: 'Bestellingen',
        bulks: 'Bulks',
    },
    labels: {
        search: 'Zoeken',
        awaiting_approval:
            '<strong>{{count}}</strong> bestelling(en) wachten op goedkeuring. Na goedkeuring worden ze binnen enkele minuten naar DCP verstuurd.',
        id: 'ID',
        recipient: 'Ontvanger',
        address: 'Adres',
        source: 'Bron',
        created_at: 'Aangemaakt op',
        order_id_dcp: 'Ordernummer DCP',
        state: 'Status',
        shipped_at: 'Verzonden op',
        voucher: 'Tegoed #{{number}}',
        bulk: 'Bulk #{{id}}',
    },
    tooltips: {
        id: 'Het unieke ID-nummer van de bestelling.',
        recipient: 'De naam van de ontvanger op het verzendadres.',
        address: 'Het adres waar de bestelling naartoe wordt gestuurd.',
        source: 'Waar de bestelling vandaan komt, bijvoorbeeld een aanvraag voor een fysieke pas.',
        created_at: 'De datum en het tijdstip waarop de bestelling is aangemaakt.',
        order_id_dcp: 'Het ordernummer dat DCP aan de bestelling heeft gegeven.',
        state: 'De status van de bestelling bij Dutch Card Printing (DCP), met de status en het bericht van DCP.',
        shipped_at: 'De datum waarop DCP de bestelling heeft verzonden.',
    },
    states: {
        all: 'Alle',
        none: 'Niet via DCP',
        pending: 'Wacht op goedkeuring',
        approved: 'In bulk, wordt verstuurd',
        sent: 'In behandeling',
        duplicate: 'Dubbel, ordernummer onbekend',
        error: 'Mislukt',
        closed: 'Verzonden',
        canceled: 'Geannuleerd',
    },
    state_groups: {
        all: 'Alle',
        pending: 'Goedkeuren',
        error: 'Mislukt',
        duplicate: 'Dubbel',
        in_progress: 'In behandeling',
        done: 'Afgerond',
    },
    buttons: {
        approve_bulk: 'Goedkeuren en versturen naar DCP',
        retry: 'Opnieuw proberen',
        view: 'Bekijken',
        view_voucher: 'Bekijk tegoed',
        view_bulk: 'Bekijk bulk',
        set_order_id_dcp: 'Ordernummer DCP invullen',
    },
    set_order_id_dcp: {
        title: 'Ordernummer DCP invullen voor bestelling #{{id}}',
        info: 'DCP had deze bestelling al ontvangen, maar heeft het ordernummer niet teruggestuurd. Zonder ordernummer kan de status van de bestelling niet worden gevolgd. Zoek de bestelling op bij DCP en vul het ordernummer hieronder in. Het ordernummer wordt gecontroleerd bij DCP en daarna wordt de status automatisch bijgewerkt.',
        info_reference: 'Referentie van de bestelling bij DCP: {{order_id}}',
        label: 'Ordernummer DCP',
        cancel: 'Annuleren',
        save: 'Opslaan',
    },
    confirm_approve: {
        title: 'Bestellingen goedkeuren',
        description:
            'U staat op het punt om {{count}} bestelling(en) goed te keuren. Ze worden binnen enkele minuten naar Dutch Card Printing (DCP) verstuurd, DCP gaat de passen printen en versturen. Dit kan niet ongedaan worden gemaakt.\nWeet u zeker dat u wilt verdergaan?',
        confirm: 'Goedkeuren',
        cancel: 'Annuleren',
    },
    confirm_retry: {
        title: 'Bestelling opnieuw proberen',
        description:
            'De gegevens van bestelling #{{id}} worden opnieuw opgehaald uit de aanvraag (zoals naam, adres en geboortedatum). {{bulk}}\nWeet u zeker dat u wilt verdergaan?',
        description_edited:
            'De handmatig aangepaste gegevens van bestelling #{{id}} worden opnieuw verstuurd, ze worden niet opnieuw opgehaald uit de aanvraag. {{bulk}}\nWeet u zeker dat u wilt verdergaan?',
        in_bulk:
            'De bestelling zit al in een goedgekeurde bulk en wordt binnen enkele minuten opnieuw naar DCP verstuurd.',
        no_bulk: 'Daarna moet de bestelling nog worden goedgekeurd voordat deze naar DCP wordt verstuurd.',
        confirm: 'Opnieuw proberen',
        cancel: 'Annuleren',
    },
    notifications: {
        approved: 'Bulk met {{count}} bestelling(en) aangemaakt, ze worden binnen enkele minuten naar DCP verstuurd.',
        retried: 'De bestelling wordt opnieuw verwerkt.',
        order_id_dcp_set: 'Het ordernummer DCP is ingevuld, de status van de bestelling wordt nu gevolgd.',
        retry_failed: 'De bestelling kan nog steeds niet worden verstuurd',
    },
    empty: {
        title: 'Geen bestellingen',
        description: 'Er zijn nog geen bestellingen voor DCP aangemaakt.',
    },
};

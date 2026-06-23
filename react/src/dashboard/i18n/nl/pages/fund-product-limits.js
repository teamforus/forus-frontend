export default {
    header: {
        title: 'Gebruikslimieten',
    },
    labels: {
        id: 'Nummer',
        fund: 'Fonds',
        type: 'Selectie type',
        limit: 'Limiet',
        created_at: 'Aangemaakt op',
        search: 'Zoeken',
        state: 'Status',
        from: 'Van',
        to: 'Tot',
    },
    buttons: {
        create: 'Toevoegen',
        create_fund: 'Fonds aanmaken',
        clear_filters: 'Wis filters',
        edit: 'Bewerken',
        activate: 'Activeren',
        deactivate: 'Deactiveren',
        delete: 'Verwijderen',
    },
    notifications: {
        activated: 'Gebruikslimiet geactiveerd.',
        deactivated: 'Gebruikslimiet gedeactiveerd.',
        deleted: 'Gebruikslimiet verwijderd.',
    },
    states: {
        active: 'Actief',
        inactive: 'Inactief',
        all: 'Alle',
    },
    tooltips: {
        id: 'Uniek identificatienummer van de ingestelde limiet.',
        fund: 'Het fonds waarvoor deze limiet geldt.',
        type: 'Geeft aan op welke producten de limiet wordt toegepast. Bijvoorbeeld: alle producten, alleen geselecteerde producten of alle producten behalve geselecteerde producten.',
        limit: 'Het maximale aantal aanbiedingen dat binnen deze regeling gekozen kan worden. Bijvoorbeeld: bij een limiet van 1 kan er maximaal 1 aanbod gekozen worden.',
        created_at: 'De datum waarop de limiet is aangemaakt.',
        state: 'Geeft aan of de limiet actief of inactief is.',
    },
    empty: {
        title: 'Geen gebruikslimieten',
        description: 'Er zijn nog geen gebruikslimieten voor dit fonds.',
        no_funds_title: 'Geen fondsen gevonden',
        no_funds_description: 'Maak eerst een fonds aan om gebruikslimieten toe te voegen.',
    },
};

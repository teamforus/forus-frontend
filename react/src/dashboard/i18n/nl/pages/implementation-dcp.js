export default {
    menu: {
        name: 'DCP-instellingen',
        description:
            'Beheer de koppeling met Dutch Card Printing (DCP) en de gegevens die op de passen worden geprint.',
    },
    header: {
        title: 'DCP-instellingen',
        connection: 'Koppeling',
        order_type: 'Bestelling: {{name}}',
        settings: 'Instellingen',
        tags: 'Gegevens op de pas',
    },
    labels: {
        status: 'Status',
        active: 'Actief',
        inactive: 'Niet actief',
        url: 'Omgeving',
        username: 'Gebruikersnaam',
        password: 'Wachtwoord',
        enabled: 'Ingeschakeld',
        order_type_enabled: 'Bestellen via DCP',
        label: 'Label',
        item: 'Item',
        tag_key: 'Veldnaam bij DCP',
        tag_source: 'Bron',
        tag_value: 'Vaste waarde',
        tag_format: 'Opmaak',
        tag_max: 'Max. lengte',
        tag_required: 'Verplicht',
        fixed_value: 'Vaste waarde',
        no_format: 'Geen',
    },
    placeholders: {
        password_saved: 'Laat leeg om het huidige wachtwoord te behouden',
        label: 'Bijv. Gelrepas',
        item: 'Bijv. card',
        tag_key: 'Bijv. printedFirstName',
    },
    info: {
        connection:
            'De gebruikersnaam en het wachtwoord krijgt u van DCP. Bestellingen worden alleen verstuurd als de koppeling is ingeschakeld.',
        order_type:
            'Het label, het item en de veldnamen staan in de klantspecifieke documentatie van DCP. Wijzigingen gelden voor nieuwe bestellingen en bestellingen die opnieuw worden geprobeerd.',
        no_tags: 'Er zijn nog geen velden toegevoegd.',
    },
    buttons: {
        test: 'Koppeling testen',
        add_tag: 'Veld toevoegen',
        remove_tag: 'Verwijderen',
        cancel: 'Annuleren',
        save: 'Opslaan',
    },
    notifications: {
        saved: 'Opgeslagen!',
    },
};

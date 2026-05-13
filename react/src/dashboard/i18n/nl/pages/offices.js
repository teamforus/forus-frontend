export default {
    buttons: {
        adjust: 'Bewerk',
        add: 'Voeg een nieuwe vestiging toe',
        map: 'Bekijk op de kaart',
        delete: 'Verwijderen',
    },
    labels: {
        mail: 'E-mail',
        categories: 'Categorieën',
        nocategories: 'Geen categorieën',
        none: 'Geen data',
        phone: 'Telefoonnummer',
        offices: 'Vestigingen ',
        business_type: 'Organisatie type',
        branch_id: 'VestigingID',
        branch_name: 'Vestigingsnaam',
        branch_number: 'Vestigingsnummer',
        address: 'Adres',
        weekday: 'Dag van de week',
        start_time: 'Openingstijd',
        end_time: 'Sluitingstijd',
    },
    tooltips: {
        phone: 'Het nummer waarop de vestiging of organisatie telefonisch bereikbaar is.',
        branch_id:
            'Een unieke ID die door de organisatie aan een vestiging wordt toegewezen voor interne administratieve doeleinden.',
        branch_name: 'De naam waaronder een specifieke vestiging bekendstaat.',
        branch_number:
            'Een uniek 12-cijferig nummer dat door de Kamer van Koophandel aan elke vestiging wordt toegekend. Let op: Dit nummer verschilt van het KVK-nummer.',
        address: 'Het fysieke locatieadres van een vestiging of organisatie.',
        weekday: 'De dag waarop de openingstijden gelden, zoals maandag, dinsdag of zondag.',
        start_time: 'Het tijdstip waarop een vestiging opent of bereikbaar is.',
        end_time: 'Het tijdstip waarop een vestiging sluit.',
    },
    confirm_delete: {
        title: 'Weet u zeker dat u deze vestiging wilt verwijderen?',
        description:
            'Wanneer u de vestiging verwijderd kunt u dit niet ongedaan maken. Bedenk daarom goed of u deze actie wilt verrichten.',
    },
    confirm_has_employees: {
        title: 'Verwijder medewerkers uit de vestiging',
        description: 'Voordat de vestiging wordt verwijderd, controleer of er geen toegewezen medewerker(s) zijn.',
        buttons: {
            cancel: 'Sluiten',
            confirm: 'Medewerkers bekijken',
        },
    },
    empty: {
        title: 'Geen vestigingen',
        description: 'Je hebt momenteel geen vestigingen.',
    },
};

export default {
    title: 'Printopdrachten voorbereiden',
    description:
        'Bereid conceptprintopdrachten voor met de persoonsgegevens van de eigenaar voor de ' +
        'pas en de naam en het bezorgadres van de ontvanger. Keur ze daarna goed bij ' +
        'Printopdrachten.',
    scope:
        'Alle passen die zijn gemarkeerd om af te drukken worden meegenomen, ook ' +
        'gedeactiveerde passen. Zoekfilters en paginering beperken deze actie niet. ' +
        'Goedgekeurde printopdrachten blijven ongewijzigd.',
    estimate: 'Verwachte wijzigingen. Persoons- en pasgegevens worden bij bevestiging opnieuw gecontroleerd.',
    calculate: 'Afdrukgegevens bekijken',
    calculating: 'Wijzigingen in printopdrachten berekenen',
    running: 'Printopdrachten voorbereiden',
    loading_ids: 'Passen zoeken die zijn gemarkeerd om af te drukken.',
    confirm: 'Bevestigen en printopdrachten voorbereiden',
    preview_title: 'Verwachte wijzigingen in printopdrachten',
    results_title: 'Resultaten van de voorbereiding van printopdrachten',
    back_to_passes: 'Terug naar passen',
    view_orders: 'Printopdrachten bekijken',
    download: 'Resultaten downloaden (JSON)',
    pass_title: 'Pas #{{id}}',
    pass_ids: "Pas-ID's: {{ids}}",
    empty: 'Geen passen met deze status',
    statuses: {
        would_create: 'Wordt aangemaakt',
        would_update: 'Wordt bijgewerkt',
        created: 'Aangemaakt',
        updated: 'Bijgewerkt',
        unchanged: 'Ongewijzigd',
        skipped: 'Overgeslagen',
        blocked: 'Aandacht nodig',
        failed: 'Mislukt',
    },
    columns: {
        pass: 'Pas',
        order: 'Printopdracht',
        status: 'Status',
        field: 'Veld',
        previous: 'Vorige waarde',
        value: 'Voorbereide waarde',
        action: 'Actie',
    },
    tooltips: {
        pass: 'Het pas-ID en de vaste code die voor het afdrukken wordt gebruikt.',
        order: 'De bestaande of nieuw voorbereide lokale printopdracht.',
        status: 'De voorgestelde of uitgevoerde voorbereidingsactie voor deze pas.',
    },
    actions: { add: 'Toevoegen', update: 'Bijwerken', clear: 'Waarde wissen' },
    result_actions: { add: 'Toegevoegd', update: 'Bijgewerkt', clear: 'Gewist' },
    fields: {
        label: 'DCP-label',
        delivery_first_name: 'Voornaam ontvanger',
        delivery_last_name: 'Achternaam ontvanger',
        delivery_address1: 'Straat en huisnummer bezorgadres',
        delivery_postal_code: 'Postcode bezorgadres',
        delivery_city: 'Plaats bezorgadres',
        delivery_country: 'Land bezorgadres',
        order_rows: {
            0: {
                tagIds: {
                    0: {
                        printedCardType: 'Tekst op de pas',
                        printedFirstName: 'Voorletters op de pas',
                        printedLastName: 'Achternaam op de pas',
                        printedDateOfBirth: 'Geboortedatum op de pas',
                        printedCityCode: 'Gemeentecode op de pas',
                        printedCardNumber: 'Pascode op de pas',
                        printedQrCode: 'QR-inhoud',
                    },
                },
            },
        },
    },
};

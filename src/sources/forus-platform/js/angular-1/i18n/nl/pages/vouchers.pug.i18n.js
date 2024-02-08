module.exports = {
    header: {
        title: "Vouchers",
    },
    labels: {
        id: 'ID',
        state: "Status",
        activation_code: "Code",
        details_activation_code: 'Activatiecode',
        amount: "Bedrag",
        amount_available: "Huidig bedrag",
        amount_available_min: "0",
        amount_available_max: "Alles",
        assigned_to: "Methode",
        assigned: "Status",
        actions: "Acties",
        source: "Aangemaakt door",
        created_at: "Aangemaakt op",
        expire_at: "Geldig tot en met",
        voucher_count_per_identity: "Aantal tegoeden",
        expired: "Verlopen",
        email: "E-mailadres",
        fund: "Fonds",
        granted: "Toegewezen",
        in_use: "In gebruik",
        used_date: 'In gebruik date',
        note: "Notitie",
        search: "Zoeken",
        qr_code: "QR-Code",
        yes: "Ja",
        no: "Nee",
        active: 'Actief',
        deactivated: 'Gedeactiveerd',
        pending: 'Inactief',
        uid: 'Uniek nummer',
        limit_multiplier: 'Aantal personen',
        physical_card: "Pasnummer",
        bsn: "Burgerservicenummer",
        from: "Vanaf",
        to: "Tot en met",
        date_type: 'Pas toe op',
        provider_name: "Aanbieder naam",
        product_name: "Aanbod naam",
        implementation: "Implementatie",
    },
    events: {
        created_budget: 'Aangemaakt',
        created_product: 'Aangemaakt',
        activated: 'Geactiveerd',
        deactivated: 'Gedeactiveerd',
    },
    buttons: {
        add_new: "Aanmaken",
        upload_csv: "Upload bulkbestand",
        export: "Export",
        clear_filter: "Wis filter",
        physical_card_add: "Plastic pas koppelen",
        physical_card_delete: "Pas ontkoppelen",
        activate: "Activeren",
        make_transaction: "Nieuwe transactie",
        make_top_up_transaction: "Opwaarderen",
    },
    csv: {
        default_note: "Aangemaakt op {{ upload_date }} door {{ uploader_email }}, toegekend aan {{ target_email }}",
        default_note_no_email: "Aangemaakt op {{ upload_date }} door {{ uploader_email }}",
    },
    tooltips: {
        id: [
            'ID: Het unieke ID-nummer van het tegoed binnen het Forus Platform. ',
            'Dit nummer wordt automatisch gegenereed bij het aanmaken van het tegoed.',
            '<br/><br/>',
            'NR: Een uniek nummer dat kan worden toegevoegd aan het tegoed tijdens het aanmaken. ',
            'Kan worden gebruikt om een relatie te leggen met andere systemen.'
        ].join(''),
        assigned_to: [
            'Deze informatie wordt gebruikt om het tegoed te associeeren met een specifieke deelnemer. ',
            'Mogelijkheden: BSN (alleen geautoriseerde organisaties), Activatiecode, E-mailadres of Niet toegewezen.',
        ].join(''),
        source: [
            'Geeft aan welke soort gebruiker het tegoed heeft aangemaakt. ',
            'Een tegoed kan worden aangemaakt door een deelnemer zelf of door een medewerker.',
        ].join(''),
        amount: [
            'Het totaal toegekende bedrag op dit tegoed. ',
            'Dit bedrag bestaat uit het bedrag bij de eerste uitgifte plus eventuele extra latere toevoegingen.',
        ].join(''),
        note: 'De notitie die door de medewerker is gemaakt bij het aanmaken van het tegoed.',
        created_at: 'De tijd en datum waarop het tegoed is aangemaakt.',
        expire_at: [
            'De laatste geldige gebruiksdatum. ',
            'Hierna verloopt het tegoed en kan het niet meer worden gebruikt om transacties te verichten.',
        ].join(''),
        in_use: [
            'Geeft aan of het tegoed is gebruikt om een transactie te verichten. ',
            'De mogelijke waarden zijn: "Nee" of "De datum van laatste transactie". ',
            'Let op: De waarde wordt automatisch teruggezet naar \'Nee\' als de transactie is geannuleerd binnen de bedenktijd van 14 dagen.',
        ].join(''),
        state: [
            'Geeft de huidige toestand van het tegoed aan. ',
            'De specifieke betekenissen van elke status: ',
            'Inactief: Het tegoed is aangemaakt maar nog niet toegewezen aan een specifieke deelnemer. ',
            'Het tegoed heeft nog geen QR-code en kan nog geen transacties initiëren.', 
            'Actief: Het tegoed is toegewezen aan een deelnemer en heeft een QR-code. ',
            'Het kan nu worden gebruikt om transacties te initiëren. ',
            'Gedeactiveerd: Het tegoed is wel toegewezen aan een deelnemer maar is niet meer bruikbaar voor transacties. ',
            'Verlopen: Het tegoed is niet meer geldig na het bereiken van de einddatum en kan niet meer worden gebruikt voor transacties.',
        ].join(''),
    },
};

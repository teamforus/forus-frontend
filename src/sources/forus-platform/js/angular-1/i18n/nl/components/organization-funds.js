module.exports = {
    organization_funds: {
        title: "Fondsen",
        buttons: {
            add: 'Fonds toevoegen',
            edit: "Instellingen",
            view: "Bekijken",
            delete: "Verwijderen",
            top_up: "Budget toevoegen",
            archive: "Archiveren",
            restore: "Herstellen",
            criteria: "Voorwaarden",
            statistics: "Statistieken",
            top_up_history: "Bekijk transacties"
        },
        states: {
            active: "Actief",
            paused: "Gepauzeerd",
            closed: "Gestopt",
            archived: "Gearchiveerd",
        },
        labels: {
            remaining: "Resterend:"
        },
        top_up_table: {
            filters: {
                search: "Zoeken",
                code: "Code used",
                iban: "IBAN",
                amount: "Bedrag",
                amount_min: "0",
                amount_max: "Alles",
                from: "Aangemaakt vanaf",
                to: "Aangemaakt tot en met"
            },
            columns: {
                fund: "Fond",
                code: "Code used",
                iban: "IBAN",
                top_up_id: "Fund top up id",
                amount: "Bedrag",
                date: "Datum",
            }
        }
    }
};
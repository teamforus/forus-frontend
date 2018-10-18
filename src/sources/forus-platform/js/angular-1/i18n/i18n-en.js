module.exports = {

// PAGES
    // CSV-VALIDATION = csv-validation.pug

    // FINANCIAL DASHBOARD = financial-dashboard-transaction.pug
    financial_dashboard: {
        header: {
            title: "Je bekijkt nu het financiële dashboard van: ",
        },
        labels: {
            product: "Fietsen, Computers",
            quarter: "Kwartaal",
            month: "Maand",
            week: "Week",
            all: "Alles",
            total: "Totaal resterend bedrag",
            spend: "Totaal uitgegeven bedrag",
            used: "Totaal uitgegeven bedrag in %",
            usage: "uitgegeven",
            payed: "Uitgegeven in",
            shops: "winkels",
            activation: "Aantal geactiveerd",
            citizen: "Nieuwe inwoners",
            provider: "Leveranciers",

        },
        buttons: {
            choose: "Kies een ander fonds",
            previous: "Vorige",
            next: "Volgende",
        }
    },
    // FINANCIAL DASHBOARDS TRANSACTIONS = financial-dashboard-transactions.pug
    financial_dashboard_transaction: {
        labels: {
            payment: "Transactie",
            details: "Transactie details",
            id: "ID",
            statement: "Naam begunstigde",
            bunq: "BUNQ transactiekosten",
            fee: "€ 0.10",
            date: "Datum",
        },
    },

    // EDIT FUNDS = funds-edit.pug
    funds_edit: {
        header: {
            title: "Fonds toevoegen",
        },
        labels: {
            name: "Naam",
            status: "status",
            start: "Startdatum",
            end: "Einddatum",
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestigen",
        }
    },

    // PERSONAL FUNDS = funds-my.pug
    funds_my: {
        title: "Fondsen",
    },

    // SHOW FUNDS = funds-show.pug
    funds_show: {
        criterion: "Criteria's (3)",
    },

    // FUNDS = funds.pug
    funds_pug: {
        title: "Fondsen",
    },

    // HOME = home.pug
    home: {
        buttons: {
            login: "Log in",
            cancel: "Annuleren",
        }
    },

    // EDIT OFFICES = offices-edits.pug
    offices_edit: {
        header: {
            title: "Bewerk vestiging",
        },
        labels: {
            address: "Adres",
            phone: "Telefoonnummer",
            mail: "E-mail",
            hours: "Openingstijden",
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestigen",
        }   
    },

    // OFFICES = offices.pug
    offices: {
        buttons: {
            adjust: "Bewerk",
            add: "Voeg een nieuwe vestiging toe",
            map: "Bekijk op de kaart",
        },
        labels: {
            mail: "E-mail",
            categories: "Categorieën",
            nocategories: "Geen categorieën",
            none: "Geen data",
            phone: "Telefoonnummer",
            hours: "Openingstijden:",
            offices: "Vestigingen",
        }
    },

    // ORGANIZATION PROVIDERS = organization-providers.pug
    organization_providers: {
        header: {
            title: "Leveranciers"
        },
        status: {
            accepted: "Geaccepteerd",
            rejected: "Geweigerd",
            hold: "Gepauzeerd",
        },
        labels: {
            mail: "E-mail",
            categories: "Categorieën",
            nocategories: "Geen categorieën",
            join: "Aanmelding voor fonds",
        },
        buttons: {
            reject: "Weigeren",
            accept: "Accepteren",
        },
    },

    // ORGANIZATION VALIDATORS = organization-validators.pug
    organization_validators: {
        labels: {
            address: "Adres",
            actions: "Acties",
        },
        buttons: {
            adjust: "Aanpassen",
            delete: "Verwijderen",
            add: "Validator toevoegen",
        },
    },

    //EDIT ORGANIZATIONS = organization-edit.pug
    organization_edit: {
        header: {
            title: "Organisatie aanmaken"
        },
        labels: {
            name: "Bedrijfsnaam",
            bank: "IBAN-nummer",
            mail: "E-mailadres",
            phone: "Telefoonnummer",
            kvk: "KvK-nummer",
            tax: "BTW-nummer",
        },
        buttons: {
            cancel: "Annuleren",
            create: "Aanmaken",
        }
    },

    // ORGANIZATIONS = organizations.pug
    organizations: {
        header: {
            title: "Kies een organisatie om in te loggen",
        },
        labels: {
            without: "Zonder organisatie",
        },
        buttons: {
            add: "Organisatie toevoegen",
        }
    },

    // EDIT PRODUCTS = product-edit.pug
    product_edit: {
        header: {
            title: "Product toevoegen",
        },
        labels: {
            name: "Product naam",
            description: "Omschrijving",
            new: "Aanbiedingsprijs",
            old: "Oude prijs",
            total: "Aantal producten",
            category: "Product categorie",
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestig",
        }
    },

    // SHOW PRODUCTS = product-show.pug 
        //TRANSLATION NOT FINISHED -> PAGE NOT DONE
    products_show: {
        header: {
            title: "Transacties",
        },
        labels: {
            price: "BEDRAG",
            description: "BESCHRIJVING",
            customer: "KLANT",
            date: "DATUM",
            action: "ACTIE",
            refund: "Terugbetalen",
            chargeid: "Kopieer het transactienummer",
            connections: "CONNECTIE",
            details: "Bekijk transactiedetails",
            results: "8 resultaten",
        },
        buttons: {
            previous: "Vorige",
            next: "Volgende",
        },
        paginator: {
            one: "1",
            two: "2",
            three: "3",
        }
    },

    // PRODUCTS = product.pug
    products: {
        offers: "Aanbiedingen",
        add: "Voeg een aanbieding toe",
    },

    // FUNDS AVAILABLE FOR PROVIDERS = provider-funds-available.pug
    provider_funds_available: {
        title: "Fondsen",
    },

    // PROVIDER FUNDS = provider-funds.pug
    provider_funds: {
        title: "Fondsen",
    },

    // PROVIDER IDENTITIES = provider-identities.pug
    provider_identities: {
        labels: {
            address: "Adres",
            mail: "E-mail",
            actions: "Acties",
        },
        buttons: {
            adjust: "Aanpassen",
            delete: "Verwijderen",
            add: "Validator toevoegen",
        }
    },

    // EDIT PROVIDER IDENTITIES = provider-identity-edit.pug
    provider_identity_edit: {
        buttons: {
            adjust: "Validator aanpassen",
            add: "Validator toevoegen",
            cancel: "Annuleren",
            confirm: "Bevestigen",
        },
        labels: {
            mail: "E-mail",
        }
    },

    // SIGN UP FORM FOR PROVIDERS = sign-up.pug
    sign_up: {
        header: {
            title: "Identiteit aanmaken",
        },
        labels: {
            mail: "E-mailadres",
            name: "Voornaam",
            lastname: "Achternaam",
        },
        buttons: {
            cancel: "Annuleren",
            next: "Volgende",
        }
    },

    // TRANSACTIONS = transaction.pug
    transactions: {
        header: {
            title: "Transacties (8)",
        },
        labels: {
            price: "BEDRAG",
            description: "BESCHRIJVING",
            customer: "KLANT",
            date: "DATUM",
            action: "ACTIE",
            refund: "Terugbetalen",
            chargeid: "Kopieer het transactienummer",
            connections: "CONNECTIE",
            details: "Bekijk transactiedetails",
            results: "8 resultaten",
            payment: "Betaling -",
        },
        buttons: {
            previous: "Vorige",
            next: "Volgende",
        },
        paginator: {
            one: "1",
            two: "2",
            three: "3",
        }
    },

    // VALIDATION REQUEST - validation-request.pug
    validation_request: {
        buttons: {
            accept: "Accepteren",
            refuse: "Weigeren",
        },
        labels: {
            bsn: "BSN",
        }
    },

    // OVERVIEW VALIDATIONS REQUESTS = validation-requests.pug
    validation_requests: {
        labels: {
            requests: "Openstaande aanvragen",
            bsn: "BSN: ",
            type: "Type",
            value: "Waarde",
            date: "Datum,",
            results: "resultaten",
            status: "Status",
            records: "Eigenschappen",
        },
        status: {
            hold: "Wachten",
        },
        buttons: {
            show: "Bekijk eigenschappen",
            allaccept: "Alles valideren",
            alldeclined: "Alles Weigeren",

        }
    },

    // EDIT VALIDATORS
    validators_edit: {
        labels: {
            mail: "E-mail",
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestigen",
        }
    },

// DIRECTIVES

    // CSV UPLOADER
    csv_upload: {
        buttons: {
            upload: "Upload",
        },
        labels: {
            swipe: "Sleep hier het *.CSV of *.TXT bestand",
            upload: "Upload .csv bestand",
            done: "Klaar",
        }
    },

    // EMPTY BLOCK = empty-block.pug
        // No translations needed

    // FUNDS FOR PROVIDERS = fund-card-available.pug
    fund_card_available_provider: {
        buttons: {
            join: "Aanmelden",
        },
        labels: {
            categories: "Categorieën",
            nocategories: "Geen Categorieën",
        },
    },

    // FINANCIAL FUNDS FOR PROVIDERS = fund-card-provider-finances.pug
    fund_card_provider_finances: {
        status: {
            accepted: "Geaccepteerd",
            rejected: "Geweigerd",
            hold: "Wachten",
        },
        labels: {
            mail: "E-mail",
            categories: "Categorieën",
            nocategories: "Geen categorieën",
            join: "Aanmelding voor fonds",
            quarter: "Kwartaal",
            month: "Maand",
            week: "Week",
            all: "Alles", 
            usage: "omzet",
            average: "Gemiddeld uitgegeven bedrag",
            transaction: "transacties",
            price: "BEDRAG",
            date: "DATUM",
            status: "STATUS",
            share: "Aandeel van fonds (totaal)",
        },
        buttons: {
            view: "Bekijk statistieken",
            transactions: "Transacties",
            previous: "Vorige",
            next: "Volgende",
        }
    },

    // FUND CARD FOR PROVIDERS = fund-card-provider.pug
    fund_card_provider: {
        status: {
            hold: "Wachten",
            accepted: "Geaccepteerd",
            reject: "Geweigerd",
            stopped: "Gestopt",
        },
        labels : {
            categories: "Categorieën",
            nocategories: "Geen Categorieën",
        }
    },

    //FUND CARD FOR SPONSOR = fund-card-sponsor.pug
    fund_card_sponsor: {
        buttons: {
            join: "Aanmelden",
            close: "Sluit",
            restart: "Herstart",
            pause: "Pauze",
            add: "Budget toevoegen",
        },
        status: {
            active: "Actief",
            paused: "Gepauzeerd",
            closed: "Gestopt",
        },
        labels: {
            categories: "Categorieën",
            nocategories: "Geen Categorieën",
            setting: "Instellingen",
            statistics: "Statistieken",
            price: "BEDRAG",
            description: "BESCHRIJVING",
            customer: "KLANT",
            date: "DATUM",
            action: "ACTIE",
            refund: "Terugbetalen",
            chargeid: "Kopieer het transactienummer",
            connections: "CONNECTIE",
            details: "Bekijk transactiedetails",
            results: "8 resultaten",
            payment: "Betaling -",

        },
    },

    // PROVIDER MENU = menu-provider.pug
        // No translations needed
    // PROVIDER MENU = menu-sponsor.pug
        // No translations needed
    // VALIDATOR MENU = menu-validator.pug
        // No translations needed
    // ADDING FUNDS MODAL - modal-funds-add.pug
    modal_funds_add: {
        header: {
            title: "Budget toevoegen aan fonds",
        },
        buttons: {
            close: "Sluiten",
        },
        labels: {
            payment: "Maak het bedrag over naar:",
            account: "NL83 BUNQ 3456 3344 32",
            addcode: "voeg code ",
            description: " toe aan de beschrijving",
        }
    },

    // SELECT MULTIPLE CATEGORIES = multi-select.pug
    multi_select: {
        title: "Product categorieën",
    },

    // SELECT PHOTO = photo-selector.pug
    photo_selector: {
        labels: {
            image: "Afbeelding",
        },
        buttons: {
            change: "Verander afbeelding",
        }
    },

    // PRE VALIDATED TABLE = prevalidated_table.pug
    prevalidated_table: {
        header: {
            title: "Vooringestelde eigenschappen",
        },
        labels: {
            code: "Code",
        },
        status: {
            active: "Geactiveerd",
        },
        buttons: {
            export: "Exporteren",
        }
    },

    // PRODUCT CARD = product-card.pug
    product_card: {
        status: {
            active: "Actief",
            paused: "Gepauzeerd",
            closed: "Gesloten",
        },
        buttons: {
            delete: "Verwijderen",
            edit: "Berwerken",
        }
    },

    // PROGRESS BAR = progress-bar.pug
        // No translations needed
    // SCHEDULE CONTROL = schedule-controle.puh
        // No translations needed

};
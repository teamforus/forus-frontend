module.exports = {
    page_title: 'Forus platform',
    page_state_titles: {
        home: 'Forus platform home',
        organizations: 'Organisaties',
        "organizations-create": 'Organisatie aanmaken',
        "organizations-edit": 'Organisatie bewerken',
        "organization-funds": "Mijn fondsen",
        "organization-providers": 'Aanbieders',
        validators: 'Medewerkers',
        "validators-edit": 'Medewerker bewerken',
        "financial-dashboard": 'Financieel dashboard',
        offices: 'Vestingen',
        "offices-create": 'Vestiging toevoegen',
        "offices-edit": 'Vestiging bewerken',
        funds: 'Fondsen',
        "funds-create": 'Fonds aanmaken',
        "funds-show": 'Beschikbare fondsen',
        "funds-edit": 'Fonds bewerken',
        transactions: 'Overzicht transacties',
        transaction: 'Transactie details',
        products: 'Aanbiedingen',
        "products-create": 'Aanbieding toevoegen',
        "products-edit": 'Aanbieding bewerken',
        "products-show": 'Mijn aanbiedingen',
        "sign-up": 'Aanmelden',
        "provider-funds": 'Deelgenomen fondsen',
        "provider-identities": 'Medewerkers',
        "provider-identity-create": 'Medewerker toevoegen',
        "provider-identity-edit": 'Medewerkers bewerken',
        "csv-validation": 'CSV Uploader',
        "validation-requests": 'Validatie verzoeken',
        "validation-request": 'Validatie verzoek',
        "restore-email": 'Inloggen via e-mail',
    },
// PAGES
    // MEAPP LANDINGSPAGE = index.pug
    meapp_index: {
        navbar: {
            municipality: "GEMEENTE",
            provider: "AANBIEDER",
            me: "ME",
            shop: "WEBSHOP",
        },
        header: {
            title: "Een profiel voor het Forus Platform",
            description: "Een profiel om in te loggen, waarmee je vouchers kan beheren en veilig kan betalen",
        },
        buttons: {
            join: "Aanmelden",
        },
        download: {
            ios: "Download Me voor iOS",
            android: "Download Me voor Android",
        },
        functions: {
            header: {
                title: "Functies",
            },
            profile: "Maan een profiel aan",
            pin: "Je hebt de mogelijkheid om een profiel aan te maken en deze daarna te beveiligen met een pincode.",
            vouchers: "Vouchers",
            criterion: "Als je aan gestelde criteria voldoet van een gemeente. Kan je een voucher aanvragen. Deze voucher kan je beheren in Me. Met Me kan je veilig betalingen verrichten.",
            apply: "Aanmelden",
            webshop: "Meld je aan op de webshop met Me. Dit doe je doordat de webshop een QR-code presenteert waarna deze gescant kan worden met Me.",
            profileb: "Profiel",
            app: "De app bewaart een profiel van de gebruiker, dit profiel maakt het mogelijk dat de gegevens hergebruikt kunnen worden voor het mee doen aan andere regelingen.",
        }
    }, 
    // PROVIDER HOME = home-provider.pug
    home_provider: {
        header: {
            title: "Meld je aan als winkelier of dienstverlener",
            subtitle: "Bereik meer klanten, maak winst en draag bij aan een maatschappelijk doel.",
        },
        labels: {
            partners: "Stichting Forus zoekt partners",
            description: "Een gemeente wil zijn budget op een bepaalde manier in de samenleving laten landen. Je kunt hen helpen bij dit doel.",
            join: "Doe mee aan een regeling",
            subdescription: "Een gemeente zet een bepaalt budget uit. Verdien geld door deel te nemen en inwoners te helpen met jouw aanbiedingen.",
        },
        guide: {
            title: "Word onderdeel van een innovatieve beweging",
            description: "Doe mee aan ons platform door onderstaande stappen te volgen, maak een organisatie aan, verkoop jouw producten of diensten en trek nieuwe klanten aan.",
            button: "Start je reis!",
        }
    },
    // SPONSOR HOME = home-sponsor.pug
    home_sponsor: {
        header: {
            title: "Meld je aan als gemeente en maak een regeling aan.",
            description: "Een platform om gemeentelijke regelingen doelmatig, rechtmatig en efficient uit te geven aan inwoners.",
        },
        subject: {
            title: "Een innovatieve regeling",
            description: "Een programeerbare bankrekening resulteert in dat het budget bij iedere transactie gelijk over wordt gemaakt aan de aanbieder.",
            paragraph: "Bepaal zelf de bestedingsruimte",
            paragraphtwo: "Stel de hoogte van de uitgifte in en bepaal bij welke aanbieders het budget uitgegeven mag worden",
        },
        guide: {
            title: "Word onderdeel van een innovatieve beweging",
            join: "Doe mee aan ons platform door onderstaande stappen te volgen.",
            button: "Start je reis ",
        }
    },
    // VALIDATOR HOME = home-validator.pug
        // DON'T TRANSLATE , THE VALIDATOR WILL NOT HAVE A LANDINGSPAGE

    // CSV-VALIDATION = csv-validation.pug
    csv_validation: {
        header: {
            title: "CSV uploader", 
        },
        buttons: {
            choose: "Kies een ander fonds",
        }
    },
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
            payed: "Uitgegeven bij",
            shops: "Aanbieders",
            activation: "Aantal geactiveerd",
            citizen: "Nieuwe inwoners",
            provider: "Aanbieders",

        },
        buttons: {
            choose: "Kies een andere regeling",
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
            status: "Status",
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
            title: "Aanbieders"
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
            email: "E-mailadres",
            actions: "Acties",
        },
        buttons: {
            adjust: "Aanpassen",
            delete: "Verwijderen",
            add: "Medewerker toevoegen",
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
            title: "Aanbieding toevoegen",
        },
        labels: {
            name: "Aanbieding naam",
            description: "Omschrijving",
            new: "Aanbiedingsprijs",
            old: "Oude prijs",
            total: "Aantal aanbiedingen",
            category: "Categorie",
            expire: "Vervaldatum van aanbod",
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
            results: "x resultaten",
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
            add: "Medewerker toevoegen",
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
            title_step_1: "Installeer Me",
            subtitle_step_1: "Met Me kan je klanten makkelijk en veilig laten betalen daarnaast kun je inloggen op de gebruikersomgeving om je organisatie te beheren. ",
            title_step_2: "Profiel aanmaken",
            subtitle_step_2: "- Maak een profiel aan om gebruik te maken van Me.",
            title_step_3: "Profiel aanmaken",
            subtitle_step_3: "- Wordt onderdeel van het platform door je organisatie aan te maken",
            title_step_4: "Koppel het profiel van je organisatie aan Me",
            subtitle_step_4: "Laat invoerveld zien voor autorisatiecode",
            top_title_step_4: "Gebruik Me",
            top_subtitle_step_4: "- Rond de installatie af door gebruik te maken van Me",
            title_step_5: "Het is gelukt! Het profiel van de organisatie is gekoppeld aan ",
            subtitle_step_5: "",
            top_title_step_5: "Gebruik Me",
            top_subtitle_step_5: "- Rond de installatie af door gebruik te maken van Me",
            title_step_6: "Gebruik Me",
            subtitle_step_6: "- Rond de installatie af door gebruik te maken van Me",
            title_step_7: "Step 7 title",
            subtitle_step_7: "Step 7 subtitle",
        },
        labels: {
            mail: "E-mailadres",
            mail_confirmation: 'E-mailadres',
            name: "Voornaam",
            lastname: "Achternaam",
            bank_confirmation: 'IBAN-nummer'
        },
        buttons: {
            go_step_2: "Ga verder naar stap 2",
            cancel: "Annuleren",
            next: "Volgende",
            reload_qr: 'Reload QR code',
            login: 'Login'
        },
        step: {
            step_1: 'Stap 1',
            step_2: 'Stap 2',
            step_3: 'Stap 3',
            step_4: 'Stap 4',
            step_5: 'Stap 5',
            step_6: 'Stap 6',
            step_7: 'Stap 7'
        },
        download: {
            ios: 'Download Me voor iOS',
            android: 'Download Me voor Android',
            already_have_app: 'Het is gelukt om Me te downloaden.'
        },
        qr_code: {
            description: 'Scan deze QR-Code om te testen.'
        },
        app_instruction: {
            step_1: 'Open Me',
            step_2: 'ik heb al een profiel',
            step_3: 'Inloggen met Autorisatie code',
        },
        app_header: {
            title: 'Vul de code in op het invoerveld',
            subtitle: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt'
        },
        login: {
            title: 'Lorem ipsum dolor sit amet',
            description: 'Eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam, quis nostrud.',
            qr_description: 'Eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam, quis nostrud.'
        },
        open_pc: {
            title: 'Deze pagina is niet mobiel te benaderen.',
            description: 'Aanmelden voor een fonds is alleen mogelijk via onze website op een vaste computer.'
        }
    },

    // TRANSACTIONS = transaction.pug
    transactions: {
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
            results: "x resultaten",
            payment: "Betaling -",
            fund: "FONDS",
            status: "STATUS",
            provider: "AANBIEDER",
        },
        buttons: {
            previous: "Vorige",
            next: "Volgende",
            export: 'Exporteren',
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

    validation: {
        email_confirmation: 'Email verkeerde bevestiging',
        iban_confirmation: 'IBAN verkeerde bevestiging'
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
            average: "Totaal uitgegeven bedrag",
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
            results: "x resultaten",
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
        title: "Aanbieding categorieën",
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
            title: "Gegenereerde activatiecodes",
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
            edit: "Bewerken",
        }
    },

    // PROGRESS BAR = progress-bar.pug
        // No translations needed
    // SCHEDULE CONTROL = schedule-controle.puh
        // No translations needed

    // MENU = langing/navbar.pug
    topnavbar: {
        items: {
            funds:"FONDSEN",
            products:"AANBIEDINGEN",
            identity:"Profiel",
        },
        buttons: {
            activate:"Activatiecode",
            login:"Login",
            voucher:"Mijn vouchers",
            records: "Mijn eigenschappen",
            authorize:"Autoriseer apparaat",
            logout:"Uitloggen",
            products:"Aanbiedingen",
            funds: "Fondsen",
        },
    },
    // AUTHENTICATION POPUP = popup-auth.pug
    popup_auth: {
        header: {
            title: "Inloggen op platform Forus",
            subtitle: "Scan de QR-code met de Me App of log in met je e-mail adres",
        },
        notifications: {
            confirmation: "Het is gelukt!",
            link: "Er is een link naar je e-mail adres gestuurd",
            invalid: "De activatiecode is ongeldig of al gebruikt",
            voucher_email: "Het is gelukt, de e-mail is verstuurd",
        },
        buttons: {
            qrcode: "Log in via QR-Code",
            mail: "Log in via e-mail",
            submit: "VERSTUREN",
            cancel: "ANNULEREN",
            confirm: "VOLGENDE",
        },
        labels: {
            timelimit: "Je kunt tot 14:55 uur (Nederlandse tijd) inloggen. Daarna verloopt je sessie.",
            join: "Aanmelden",
            scancode: "Scan deze QR-Code met een ander apparaat waar je al op aangemeld bent",
            mobilecode: "Vul je toegangscode van de Me App in",
            mail: "Dit scherm is alleen bedoeld voor inwoners die een brief van de gemeente hebben ontvangen met daarin een activatiecode en deze nog niet hebben gebruikt.",
            link: "Vul je e-mail adres in om een link te ontvangen waarmee je kunt inloggen",
            code: "Vul de activatiecode in die je per brief hebt ontvangen",
            voucher_email: "Verstuur de voucher per e-mail",

        },
        input: {
            mail: "Vul je e-mail adres in",
            code: "Activatiecode",
            mailing: "E-mail",
        },
    },
    product_category_type: {
        products: "PRODUCTEN",
        services: "DIENSTEN OF ACTIVITEITEN",
    }
};

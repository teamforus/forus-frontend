module.exports = {
    test: "{{name}} {{foo}}",
    permissions: require("./en/permissions"),
    page_title: 'Forus platform',
    page_state_titles: {
        home: 'Forus platform home',
        organizations: 'Organisaties',
        "organizations-create": 'Organisatie aanmaken',
        "organizations-edit": 'Organisatie bewerken',
        "organization-funds": "Fondsen",
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
            title_general: "Een profiel voor het Forus Platform",
            title_nijmegen: "Een profiel voor de Meedoen-regeling",
            title_zuidhorn: "Een profiel voor het Kindpakket",
            title_westerkwartier: "Een profiel voor het Kindpakket",
            title_forus: "Een profiel voor het Kerstpakket",
            description: "Een profiel om in te loggen, waarmee u vouchers kan beheren en veilig kan betalen",
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
            profile: "Maak een profiel aan",
            pin: "U heeft de mogelijkheid om een profiel aan te maken en deze daarna te beveiligen met een pincode.",
            vouchers: "Vouchers",
            criterion: "Als u aan gestelde criteria voldoet van een gemeente. Kunt u een voucher aanvragen. Deze voucher kunt u beheren in Me. Met Me kunt u veilig betalingen verrichten.",
            apply: "Aanmelden",
            webshop: "Meld u aan op de webshop met Me. Dit doet u door de QR-code te scannen met Me die de webshop presenteert.",
            profileb: "Profiel",
            app: "De app bewaart een profiel van de gebruiker, dit profiel maakt het mogelijk dat de gegevens hergebruikt kunnen worden voor het mee doen aan andere regelingen.",
        }
    },
    // PROVIDER HOME = home-provider.pug
    home_provider: {
        header: {
            title: "Meld u aan als winkelier of dienstverlener",
            title_nijmegen: "Meld u aan als dienstverlener",
            subtitle: "Bereik meer klanten, maak winst en draag bij aan een maatschappelijk doel.",
            subtitle_nijmegen: "De gemeente geeft inwoners met een laag inkomen maximaal € 150,- voor culturele, sportieve en educatieve activiteiten. Dit heet de Meedoen-regeling.",
        },
        labels: {
            partners: "Stichting Forus zoekt partners",
            description: "Een gemeente wil zijn budget op een bepaalde manier in de samenleving laten landen. Je kunt hen helpen bij dit doel.",
            join: "Doe mee aan een regeling",
            subdescription: "Een gemeente zet een bepaalt budget uit. Verdien geld door deel te nemen en inwoners te helpen met jouw aanbiedingen.",
        },
        guide: {
            title: "Word onderdeel van een innovatieve beweging",
            title_nijmegen: "Als uw organisatie een passend aanbod heeft, kunt u zich opgeven.",
            description: "Doe mee aan ons platform door onderstaande stappen te volgen, maak een organisatie aan, verkoop jouw producten of diensten en trek nieuwe klanten aan.",
            description_nijmegen: "Uw organisatie is in het bezit van een smartphone, deze heeft u nodig om een mobiele applicatie te installeren die QR-codes kan scannen. Heeft u deze smartphone bij de hand? Regel het dan direct!",
            button: "Start uw reis!",
            button_nijmegen: "DIRECT REGELEN",
        }
    },
    // SPONSOR HOME = home-sponsor.pug
    home_sponsor: {
        header: {
            title: "Meld u aan als gemeente en maak een regeling aan.",
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
            button: "Start uw reis ",
        }
    },
    // VALIDATOR HOME = home-validator.pug
    // DON'T TRANSLATE , THE VALIDATOR WILL NOT HAVE A LANDINGSPAGE

    // CSV-VALIDATION = csv-validation.pug
    csv_validation: {
        header: {
            title: "Aanvragers toevoegen",
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
            total: "Huidig saldo",
            spend: "Startbudget",
            used: "Totaal uitgegeven bedrag in %",
            usage: "uitgegeven",
            payed: "Uitgegeven in",
            shops: "Aanbieders",
            activation: "Aantal geactiveerd",
            citizen: "Nieuwe inwoners",
            provider: "Aanbieders",
            transactions: "transacties",

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
            bunq_id: "ID bunq",
            statement: "Naam begunstigde",
            bunq: "Transactiekosten",
            fee: "€ 0.10",
            date: "Datum",
        },
    },

    // EDIT FUNDS = funds-edit.pug
    funds_edit: {
        header: {
            title_add: "Fonds toevoegen",
            title_edit: "Fonds aanpassen",
        },
        labels: {
            name: "Naam",
            status: "Status",
            start: "Startdatum",
            end: "Einddatum",
            notification_amount: "Aanvulherinnering grens €"
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestigen",
        }
    },

    // PERSONAL FUNDS = funds-my.pug
    funds_my: {
        title: "Fondsen",
        add: 'Fonds toevoegen'
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
            title_add: "Vestiging toevoegen",
            title_edit: "Vestiging aanpassen"
        },
        labels: {
            address: "Adres",
            phone: "Telefoonnummer",
            mail: "E-mail",
            hours: "Openingstijden",
        },
        buttons: {
            add_office: "Voeg een nieuwe vestiging toe",
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
            delete: "Verwijderen"
        },
        labels: {
            mail: "E-mail",
            categories: "Categorieën",
            nocategories: "Geen categorieën",
            none: "Geen data",
            phone: "Telefoonnummer",
            hours: "Openingstijden:",
            offices: "Vestigingen ",
        },
        confirm_delete: {
            title: "Weet u zeker dat u deze vestiging wilt verwijderen?",
            description: "Wanneer u de vestiging verwijderd kunt u dit niet ongedaan maken. Bedenk daarom goed of u deze actie wilt verrichten."
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
            hold: "Wacht op goedkeuring",
        },
        state: 'Status',
        labels: {
            mail: "E-mail",
            phone: "Telefoonnummer",
            website: "Website",
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
            title_add: "Organisatie aanmaken",
            title_edit: "Organisatie aanpassen",
        },
        labels: {
            name: "Bedrijfsnaam",
            bank: "IBAN-nummer",
            mail: "E-mailadres van organisatie",
            phone: "Telefoonnummer",
            kvk: "KvK-nummer",
            tax: "BTW-nummer (Optioneel)",
            website: "Website",
        },
        buttons: {
            cancel: "Annuleren",
            create: "Bevestig",
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
            title_add: "Aanbieding toevoegen",
            title_edit: "Aanbieding aanpassen",
        },
        labels: {
            name: "Titel van aanbieding",
            description: "Omschrijving",
            new: "Aanbiedingsprijs €",
            old: "Oude prijs €",
            total: "Aantal",
            reserved: "Gereserveerd",
            sold: "Verkocht",
            stock: "Nog te koop / Totaal",
            stock_amount: "Nog te koop",
            category: "Categorie",
            expire: "Vervaldatum van aanbod",
        },
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestig",
            close: "Sluit"
        },
        errors: {
            already_added: 'U heeft al twee aanbiedingen toegevoegd. U kunt niet meer dan twee toevoegen.'
        },
        confirm_create: {
            title: 'Een aanbieding toevoegen.',
            description: 'U staat op het punt een aanbieding op de webshop toe te voegen. Uw aanbieding wordt van de webshop verwijderd als de vervaldatum bereikt is.'
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
        cannot_delete: 'Let op! Wanneer een aanbieding geplaatst is moet u dit aanbod kunnen leveren. Bedenk dus goed hoeveel aanbiedingen en daarmee aanbiedingvouchers u wilt uitgeven. U kunt uw aanbod altijd ophogen maar niet meer verlagen.',
        confirm_delete: {
            title: 'Weet u zeker dat u deze aanbieding wilt verwijderen?',
            description: 'Als u de aanbieding verwijderd, wordt de aanbieding uit de webshop gehaald. Ook verdwijnt het aanbod uit uw dashboard. U kunt de gereserveerde aanbiedingen dan niet meer inzien. Reeds gemaakte reserveringen blijven actief en kunnen nog opgehaald worden.'
        }
    },

    // FUNDS AVAILABLE FOR PROVIDERS = provider-funds-available.pug
    provider_funds_available: {
        title: "Fondsen",
        applied_for_fund: {
            title: "Uw aanvraag is ontvangen.",
            description: "De gemeente zal uw verzoek behandelen, dit kan maximaal twee weken duren. Zodra de gemeente uw aanvraag heeft behandeld wordt er een e-mail toegestuurd. Daarnaast kunt u de status ook volgen op het dashboard."
        },
        error_apply: {
            title: 'U heeft nog geen vestigingen aangemaakt!',
            description: 'U heeft tenminste één vestiging nodig om uw organisatie aan te melden voor {{fund_name}}'
        }
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
            subtitle_step_1: "Om betalingen te ontvangen heeft u een app nodig. Een transactie doet u door een QR-code te scannen en een bedrag in te vullen.",
            title_step_2: "Profiel aanmaken",
            subtitle_step_2: "Een persoonlijk profiel is nodig om betalingen te ontvangen. Later is het mogelijk om meerdere medewerkers toe te voegen.",
            title_step_3: "Organisatie aanmaken",
            subtitle_step_3: "Om deel te nemen aan het platform is het nodig om een organisatie aan te maken.",
            title_step_4: "Voeg nieuwe vestigingen toe",
            subtitle_step_4: "Een organisatie kan uit meerdere vestigingen bestaan. Voeg in dit venster vestigingen toe.",
            title_step_5: "Stel de app <i>Me</i> in op uw telefoon",
            subtitle_step_5: "U heeft zojuist een profiel aangemaakt, daarom kunt u klikken op: ‘Ik heb een profiel’. Het instellen van uw profiel op de mobiele applicatie gebeurt door het invullen van een autorisatie code.",
            top_title_step_5: "Gebruik Me",
            top_subtitle_step_5: "Rond de installatie af door gebruik te maken van <i>Me</i>",
            title_step_6: "Het is gelukt! Het profiel van de organisatie is gekoppeld aan <i>Me</i>.",
            subtitle_step_6: "",
            top_title_step_6: "Gebruik Me",
            top_subtitle_step_6: "Rond de installatie af door gebruik te maken van <i>Me</i>",
            title_step_7: "Meld u aan voor een fonds",
            subtitle_step_7: "Uw aanvraag wordt binnen twee weken behandeld door de gemeente.",
        },
        meapp_header: {
            title_step_1: "Installeer Me",
            subtitle_step_1: "Om betalingen te ontvangen heeft u een app nodig. Een transactie doet u door een QR-code te scannen en een bedrag in te vullen.",
            title_step_2: "Profiel aanmaken",
            subtitle_step_2: "Een persoonlijk profiel is nodig om betalingen te ontvangen. Later is het mogelijk om meerdere medewerkers toe te voegen.",
            title_step_3: "Stel de app <i>Me</i> in op uw telefoon",
            subtitle_step_3: "U heeft zojuist een profiel aangemaakt, daarom kunt u klikken op: ‘Ik heb een profiel’. Het instellen van uw profiel op de mobiele applicatie gebeurt door het invullen van een autorisatie code.",
            top_title_step_3: "Gebruik Me",
            top_subtitle_step_3: "Rond de installatie af door gebruik te maken van <i>Me</i>",
            title_step_4: "Het is gelukt! Het profiel van de organisatie is gekoppeld aan <i>Me</i>.",
            subtitle_step_4: "",
            top_title_step_4: "Gebruik Me",
            top_subtitle_step_4: "Rond de installatie af door gebruik te maken van <i>Me</i>",
            title_step_5: "Het is gelukt om een profiel aan te maken",
            subtitle_step_5: "Als u deel uit maakt van een organisatie, vraag de beheerder van uw organisatie om u toe te voegen als medewerker.",
        },
        labels: {
            mail: "Persoonlijk E-mailadres",
            mail_confirmation: 'Herhaal persoonlijk E-mailadres',
            name: "Voornaam",
            lastname: "Achternaam",
            bank_confirmation: "Herhaal IBAN-nummer",
            bank: "IBAN-nummber",
        },
        buttons: {
            go_step_2: "Ga verder naar stap 2",
            cancel: "Vorige",
            next: "Volgende",
            reload_qr: 'Herlaad de code.',
            login: 'Login',
            skip: "Overslaan"
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
            already_have_app: 'DE APP IS NU AAN HET DOWNLOADEN. / DE APP IS GEINSTALLEERD.',
            url_text: "Download de app <i>Me</i> op uw mobiele telefoon via de link:",
            url_address: "www.forus.io/DL"
        },
        qr_code: {
            description: 'Scan deze QR-Code om te testen.'
        },
        app_instruction: {
            step_1: 'Open <i>Me</i>',
            step_2: 'Ik heb al een profiel',
            step_3: 'Inloggen met Autorisatie code',
        },
        app_header: {
            title: 'Vul de code in op het invoerveld',
            subtitle: 'De code is te vinden in de mobiele applicatie, volg de bovenstaande stappen op om de code te kunnen aflezen.'
        },
        login: {
            title: 'Heeft u al een profiel aan gemaakt in <i>Me</i>?',
            description: 'Waneer u al een profiel heeft aangemaakt, biedt de onderstaande knop de mogelijkheid om direct in te loggen op dit profiel.',
            qr_description: 'Scan deze QR-code met de app <i>Me</i> als u al een profiel heeft aangemaakt.'
        },
        open_pc: {
            title: 'Deze pagina is niet mobiel te benaderen.',
            description: 'Aanmelden voor een fonds is alleen mogelijk via onze website op een vaste computer.'
        },
        sms:{
            body: 'Download Me makkelijk via de link: https://www.forus.io/DL',
            title: 'Download <i>Me</i> op uw mobiele telefoon',
            description: 'Vul uw telefoonnummer in het onderstaande invoerveld om een sms te ontvangen met de download link.',
            subdescription: 'Krijgt u geen sms dan kunt u <i>Me</i> downloaden via de link <b>www.forus.io/DL</b> op uw mobiele telefoon.',
            sent: 'Een sms-bericht is verstuurd.',
            sent_description: 'Heeft u geen bericht ontvangen? Download <i>Me</i> via de link <b>www.forus.io/DL</b> op uw mobiele telefoon.',
            button: {
                send: 'Versturen'
            },
            error: {
                try_later: 'Probeer later nog eens.'
            }
        }
    },

    // Organization-employees.pug
    organization_employees: {
        labels: {
            email: "E-mailadres",
            roles: "Rollen",
            actions: "Actie",
        },
        buttons: {
            adjust: "Aanpassen",
            delete: "Verwijderen",
            add: "Toevoegen",
        },
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
            search: "Zoeken",
            from: "Vanaf",
            to: "Tot",
            state: "Status",
            amount: "Bedrag",
            amount_min: "0",
            amount_max: "Alles"
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
        },
        export: {
            labels: {
                date: 'Datum',
                amount: 'Bedrag',
                fund: 'Fonds',
                provider: 'Aanbieder',
                payment_id: 'Betalingskenmerk',
                state: 'Status'
            }
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
        iban_confirmation: 'IBAN verkeerde bevestiging',
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
        labels: {
            categories: "Categorieën",
            nocategories: "Geen Categorieën",
            date: "Begindatum / Einddatum",
            max_amount: "Maximale bedrag per voucher"
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
            delete: 'Verwijderen'
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
        confirm_delete:{
            title: 'Weet u zeker dat u dit fonds wilt verwijderen?',
            description: 'Het verwijderen van een fonds is definitief. U kunt dit niet ongedaan maken.'
        }
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
            payment: "Maak het bedrag over naar: ",
            account: "NL83 BUNQ 3456 3344 32",
            addcode: "voeg code  ",
            description: "  toe aan de beschrijving",
            copy: "Kopieer naar klembord"
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
            change: "Upload",
        }
    },

    // PRE VALIDATED TABLE = prevalidated_table.pug
    prevalidated_table: {
        header: {
            title: "Gegenereerde activatiecodes",
        },
        labels: {
            code: "Code",
            search: "Zoeken",
            exported: "Geëxporteerd",
            from: "Van",
            to: "Tot",
            filter: "Filter",
        },
        status: {
            active: "Geactiveerd",
        },
        buttons: {
            export_selected: "Exporteer selectie",
            export: "Exporteer alles",
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
    // SCHEDULE CONTROL = schedule-controle.pug
    // No translations needed

    // PAGINATOR LOADER = paginator-loader.pug

    paginator_loader: {
        buttons: {
            load: "Laad meer activatie codes",
        },
        labels: {
            from: "Van",
        }
    },

    paginator: {
        buttons: {
            first: "Eerste",
            last: "Laatste",
        },
        labels: {
            from: "Van",
        }
    },

    // MENU = langing/navbar.pug
    topnavbar: {
        items: {
            funds: "FONDSEN",
            products: "AANBIEDINGEN",
            identity: "Profiel",
        },
        buttons: {
            activate: "Activatiecode",
            login: "Login",
            voucher: "Mijn vouchers",
            records: "Mijn eigenschappen",
            authorize: "Autoriseer apparaat",
            logout: "Uitloggen",
            products: "Aanbiedingen",
            funds: "Fondsen",
        },
    },
    // AUTHENTICATION POPUP = popup-auth.pug
    popup_auth: {
        header: {
            title: "Inloggen op het dashboard",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        notifications: {
            confirmation: "Het is gelukt!",
            link: "Er is een link naar je e-mail adres gestuurd",
            invalid: "De activatiecode is ongeldig of al gebruikt",
            voucher_email: "Het is gelukt, de e-mail is verstuurd",
        },
        buttons: {
            qrcode: "Log in via de Me-app",
            mail: "Log in via e-mail",
            submit: "VERSTUREN",
            cancel: "ANNULEREN",
            confirm: "VOLGENDE",
        },
        labels: {
            timelimit: "U kunt tot 14:55 uur (Nederlandse tijd) inloggen. Daarna verloopt uw sessie.",
            join: "Aanmelden",
            scancode: "Scan deze QR-Code met een ander apparaat waar u al op aangemeld bent",
            mobilecode: "Vul de toegangscode van de Me-app in",
            mail: "Dit scherm is alleen bedoeld voor inwoners die een brief van de gemeente hebben ontvangen met daarin een activatiecode en deze nog niet hebben gebruikt.",
            link: "Vul uw e-mail adres in om een link te ontvangen waarmee u kunt inloggen",
            code: "Vul de activatiecode in die u per brief heeft ontvangen",
            voucher_email: "Verstuur de voucher per e-mail",

        },
        input: {
            mail: "Vul uw e-mail adres in",
            code: "Activatiecode",
            mailing: "E-mail",
        },
        pin_code: {
            confirmation: {
                title: "Is de mobiele app gekoppeld aan uw persoonlijk e-mailadres?",
                description: "Ga naar het tabblad Profiel in de app. Ziet u hier uw e-mailadres staan? Dan is de app succesvol gekoppeld. Als u de keuze voor Profiel niet hebt, probeer het dan nog is.",
                buttons: {
                    try_again: "Opnieuw proberen",
                    confirm: "Volgende"
                }
            }
        }
    },
    product_category_type: {
        products: "PRODUCTEN",
        services: "DIENSTEN OF ACTIVITEITEN",
    },

    lorem_ipsum: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam pulvinar dictum leo, sed congue purus scelerisque ut.',

    modal: {
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestig",
            close: "Sluit"
        }
    },

    roles: {
        tooltip: {
            admin: 'Alle functionaliteiten',
            validation: 'Aanvragers toevoegen (inwoners toevoegen via CSV bestand)',
            'operation officer': 'Verrichten van betalingen via Me app (voor aanbieders)',
            finance: 'Overzicht van statistieken, transacties en het financieel dashboard',
            'policy officer': 'Aanbieders goedkeuren en instellingen van het fonds aanpassen'
        }
    },

    tooltip: {
        product: {
            limit: "U kunt ook de inwoner in uw organisatie te woord staan en hem een persoonlijk aanbod aanbieden. U scant dan de QR-code en vult een bedrag in!",
        }
    },
  
    search: "Zoeken"
}

module.exports = {
    languages: {
        en: 'English',
        nl: 'Dutch',
    },
// PAGES
    // APPLY FOR FUNDS = fund-apply.pug
    fund_apply: {
        header: {
            title: "Aanmelden",
            criteria: "Voowaarden",
        },
        buttons: {
            join: "AANMELDEN",
        }
    },    

    // FUNDS = funds.pug
    funds: {
        header: {
            title: "Beschikbare fondsen",
        },
        labels: {
            categorie: "CATEGORIEËN",
            criteria: "Voorwaarden (4)",
            location: "Locatie",
            office: "Zuidhorn Gemeente",
            children: "Kinderen",
            count: "1",
            agelimit: "Leeftijdsgrens",
            age: "< 18 jaar oud",
            income: "Inkomensgrens",
            amount: "< € 1118.46",
        },
        buttons: {
            join: "Aanmelden",
            more: "BEKIJK MEER",
        },
        status: {
            active: "Actief",
        }
    },

    // HOME = home.pug
    home: {
        header: {
            title:"Zuidhorn. Kindpakket",
            subtitle: "Welkom op de website van het Kindpakket Zuidhorn. Het Kindpakket is een jaarlijks ondersteunende regeling voor kinderen in de gemeente Zuidhorn.",
            button: 'Lees meer over hoe het systeem werkt.',
        },
        blog: {
            title: "Onze blog",
            name: "Blog: Nieuw fonds Kindpakket 2019 Zuidhorn",
            more: "Lees meer",
            button: "BEKIJK MEER",
        },
        product: {
            title: "Aanbiedingen",
            select: "Selecteer categorie...",
            search: "Zoek naar een aanbieding",
        },
        map: {
            title: "Overzicht van alle aanbieders",
            subtitle: "Binnen het platform Forus werkt de gemeente Zuidhorn en verschillende aanbieders samen om het besta aanbod te leveren",
            button: 'BEKIJK DE KAART',
        },
        guide: {
            title: "Hoe het systeem werkt",
            stepone: "Stap #1",
            one: "Je hebt een brief  ontvangen van de gemeente. In de brief staat een activatiecode. Gebruik deze bij stap 2.",
            steptwo: "Stap #2",
            two: "Met de activatiecode kun je je aanmelden en het Kindpakket activeren. Druk op ‘Activatiecode’ bovenaan de pagina en vul de gevraagde gegevens in.",
            stepthree: "Stap #3",
            three: "Na je aanmelding wordt het Kindpakket gelijk geactiveerd. De voucher met bijbehorende QR-Code kan je terugvinden door bovenaan je profiel gegevens op ‘Mijn vouchers’ te klikken.",
            stepfour: "Stap #4",
            four: "De QR-Code kan je uitprinten, naar jezelf toe mailen of altijd op je telefoon hebben door in te loggen op de Me app. De Me app kun je dowloaden via de Google Playstore en de App Store.",
            stepfive: "Stap #5",
            five: "Ga naar de webshop om te zien waar de voucher te besteden is of om een aanbieding te kopen. Laat de bijbehorende QR-Code zien om je aanbieding geleverd te krijgen",
        }
    },

    // APPLY FOR PRODUCT = product-apply.pug
    product_apply: {
        header: {
            title: "Kies voucher",
        },
        labels: {
            transactions: "Transacties",
            last: "Laatste transactie",
            subtract: "(Af)",
            none: "Geen",
            example: "Welke tekst komt hier ?",
        },
        buttons: {
            use: "Gebruik",
        }
    },

    // PRODUCT = product.pug
    product: {
        labels: {
            fund: "Fonds",
            find: "Je kan ons hier vinden",      
        },
        status: {
            active: "Actief",
        },
        buttons: {
            buy: "KOOP",
        }
    },

    // PRODUCTS = Products.pug
    // No translations needed

    // CREATE A RECORD  = record.create.pug
    records_create: {
        header: {
            title: "Eigenschappen aanmaken",
         },        
        buttons: {
            choose: {
                description: "Selecteer de categorie waaraan je de eigenschap wil toevoegen.",
                c_description: "Kies het type eigenschap dat je wil aanmaken.",
                category: "Kies categorie",
                type: "Kies type",
                    },
            cancel: "ANNULEER",
            next: "VOLGENDE",
            type: "EIGENSCHAP TYPE",
            text: "TEKST",
            back: "TERUG",
            confirm: "BEVESTIG",
            }
    },

    // VALIDATE A RECORD = record-validate.pug
    records_validate: {
        header: { 
            title: "Mijn eigenschappen",
        },
        labels: {
            validators: "Validators",
        },
        status: {
            hold: "Wachten",
        },
        buttons: {
            send: "VERZENDEN",
        }
    },

    // VALIDATIONS OF THE RECORDS = record-validations.pug
    records_validations: {
        header: { 
            title: "Mijn eigenschappen",
        },
        labels: {
            count: "validaties",
            validations: "Validaties",
        },
        buttons: {
            send: "Verstuur een validatieverzoek",
        }
    },

    // RECORDS = records.pug
    records: {
        header: { 
            title: "Mijn eigenschappen",
        },
        labels: {
            count: "validaties",
        },
        buttons: {
            validate: "Valideer",
            create: "Eigenschap aanmaken",
        }
    },

    // VOUCHER = voucher.pug
    voucher: {
        header: {
            title: "Voucher details",
        },
        buttons: {
            send:"E-MAIL NAAR MIJ"
        },
        labels: {
            transactions: "Transacties",
            subtract: "Af",
            office: "Locatie van de aanbieder",
            voucher: "Je kunt je voucher besteden in de winkels op deze locaties",
        }
    },

    // VOUCHERs = vouchers.pug
    vouchers: {
        header: {
            title: "Mijn vouchers",
        },
        labels: {
            transactions: "Transacties",
            last: "Laatste transactie",
            subtract: "(Af)",
            none: "Geen",
            used: "GEBRUIKT",
            generated: "AANGEMAAKT",
        }
    },

// DIRECTIVES
    // PRODUCT BLOCKS = block-products.pug
    block_products: {
        header: {
            title: "Aanbieding",
        },
        input : {
            placeholder: "Zoek naar een aanbieding",
        },
        labels: {
            discount: "KORTING",
            old: "VAN",
            new: "VOOR",
            title: "Er zijn geen aanbiedingen",
            subtitle: "Op dit moment zijn er geen aanbiedingen beschikbaar",
        },
        buttons: {
            more: "BEKIJK MEER",
        }
    },
    // CONTACT FORM = contact-form.pug
    contact: {
        header: {
            title: "contact",
            subtitle: "CONTACTGEGEVENS",
        },
        labels: {
            address:"Hooiweg 9, 9801 AJ Zuidhorn",
            phone:"(0594) 508888",
            mail: "kindpakket@zuidhorn.nl",
            follow: "Volg ons",
            name: "Naam",
            usermail: "E-mail",
            userphone: "Telefoon",
            organisation: "Organisatie",
            message: "Bericht",
        },
        buttons: {
            send: "VERZENDEN",
        }
    },
    // PRODUCT BLOCK IF IT'S EMPTY = empty-block.pug
    empty_block: {
        guide: "Ontdek hoe...",
    },
    
    // CRITERIA FOR FUNDS = fund-criterion.pug
    fund_criterion: {
        labels: {
            location: "Zuidhorn",
            value: "Eigenschap waarde",
        },
        buttons: {
            validate: "Valideer",
            add: "Voeg een eigenschap toe",
        },
        status: {
            invalid: "Ongeldig",
            valid: "Geldig",
        }
    },

    // GOOGLE MAPS = google-map.pug
    maps: {
        cancel: "Annuleren",
    },

    // PINCODE CHECK = pincode-control.pug
    // No translations needed

    // AUTHENTICATION POPUP = popup-auth.pug
    popup_auth: {
        header: {
            title: "Inloggen op platform Forus",
            subtitle: "Scan de QR-code met de Me App of log in met je e-mailadres",
        },
        notifications: {
            confirmation: "Het is gelukt!",
            link: "Er is een link naar je e-mailadres gestuurd",
            invalid: "De activatiecode is ongeldig of al gebruikt",
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
            warning: "Sluit dit venster en klik op 'Login' als je de activatiecode al eens hebt gebruikt.",
            join: "Aanmelden",
            scancode: "Scan deze QR-Code met een ander apparaat waar je al op aangemeld bent",
            mobilecode: "Vul je toegangscode van de Me App in",
            mail: "Dit scherm is alleen bedoeld voor inwoners die een brief van de gemeente hebben ontvangen met daarin een activatiecode en deze nog niet hebben gebruikt.",
            link: "Vul je e-mailadres in om een link te ontvangen waarmee je kunt inloggen",
            code: "Vul de activatiecode in die je per brief hebt ontvangen",
        },
        input: {
            mail: "Vul je e-mailadres in",
            code: "Activatiecode",
            mailing: "E-mail",
        }
    },

    // POPUP OFFICES = popup-offices.pug
    popup_offices: {
        header: {
            title: "We hebben vijf aanbieders gevonden",
            subtitle: "Selecteer een om meer informatie te zien",
        },
        labels: {
            mail: "E-MAIL",
            address: "ADRES",
            hours: "OPENINGSTIJDEN",
            none: "Geen data",
        },
    },
    
    // PROFILE CARD = profile-card.pug
    profile_card: {
        header: {
            title: "Jouw persoonlijke QR-code",
            subtitle: "Laat jouw persoonlijke QR-code scannen door een validator.",
        },
        labels: {
            address: "Adres:",
        },
        buttons: {
            share: "Deel",
            copy: "Kopieer",
            vouchers: "VOUCHERS",
            records: "EIGENSCHAPPEN",
        },
    },

    // MENU = top-navbar.pug
    topnavbar: {
        items: {
            funds:"FONDSEN",
            products:"AANBIEDINGEN",
            identity:"Identiteit",
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
};


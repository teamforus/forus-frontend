module.exports = {
    test: "{{name}} {{foo}}",
    page_title: 'Forus platform',
    page_state_titles: {
        home: '{{implementation}} webshop',
        funds: 'Fondsen',
        platform: 'Forus Platform',
        me: 'Me',
        'me-app': 'Me-app',
        portfolio: 'Portfolio',
        kindpakket: 'Portofolio - Kindpakket',
        products: 'Aanbiedingen',
        "products-show": 'Aanbieding',
        "products-apply": "Aanbieding kopen",
        vouchers: 'Mijn vouchers',
        voucher: 'Uw voucher',
        records: 'Eigenschappen', 
        "record-validate": 'Valideer eigenschap',
        "record-validations": 'Validaties',
        "record-create": 'Eigenschap toevoegen',
        "funds-apply": 'Meld u aan voor een fonds',
        "restore-email": 'Inloggen via e-mail',
    },
    implementation_name: {
        general: 'General',
        zuidhorn: 'Zuidhorn',
        nijmegen: 'Nijmegen',
        westerkwartier: 'Westerkwartier',
        forus: 'Forus platform & '
    },
    languages: {
        en: 'English',
        nl: 'Dutch',
    },
    // PAGES
    // APPLY FOR FUNDS = fund-apply.pug
    fund_apply: {
        header: {
            title: "Mee doen",
            criteria: "Voowaarden (4)",
        },
        buttons: {
            join: "DOE MEE",
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
            join: "Doe mee",
            more: "BEKIJK MEER",
        },
        status: {
            active: "Actief",
        }
    },

    // HOME = home.pug
    home: {
        header: {
            general: {
                title: "Forus is een platform voor gemeentelijke regelingen",
                subtitle: "Het platform biedt een webshop waar een inwoner zich kan aanmelden voor een regeling, vervolgens kan hij een voucher aan een aanbieder laten zien. De aanbieder kan dan een product of dienst leveren. <br /> <br /> Wilt u meer weten?",
                button: 'LEES MEER OVER HOE HET SYSTEEM WERKT',
            },
            forus: {
                title: "Forus platform en de Me-app",
                subtitle: "Forus is een jonge Groningse organisatie. Platform Forus en de Me-app zijn applicaties voor de uitgifte en afhandeling van gemeentelijke diensten en regelingen. <br /> <br /> Wilt u meer weten?",
                auth_subtitle: "Forus is een jonge Groningse organisatie. Platform Forus en de Me-app zijn applicaties voor de uitgifte en afhandeling van gemeentelijke diensten en regelingen. <br /> <br /> Wilt u meer weten?",
                button: 'LEES MEER OVER HOE HET SYSTEEM WERKT',
            },
            nijmegen: {
                title: "Meedoen-regeling",
                subtitle: "Welkom op de website van de Meedoen-regeling. Heeft u van de gemeente een toekenning voor de Meedoen-regeling? Dan kunt u hier het aanbod van activiteiten en cursussen zien en het geld dat u kunt besteden. <br /><br />Klik op start en vul uw activatiecode in. Deze code staat in de brief over de Meedoen-regeling die u heeft ontvangen",
                auth_subtitle: "Welkom op de website van de Meedoen-regeling. Heeft u van de gemeente een toekenning voor de Meedoen-regeling? Dan kunt u hier het aanbod van activiteiten en cursussen zien en het geld dat u kunt besteden. <br /><br />Beheer uw vouchers en neem ze overal mee door de Me-app te downloaden.",
                auth_button: "Download Me",
                button: 'START', 
            },
            zuidhorn: {
                title: "Zuidhorn. Kindpakket",
                subtitle: "Welkom op de website van het Kindpakket Zuidhorn. Het Kindpakket is een jaarlijks ondersteunende regeling voor kinderen in de gemeente Zuidhorn.",
                auth_subtitle: "Welkom op de website van het Kindpakket Zuidhorn. Het Kindpakket is een jaarlijks ondersteunende regeling voor kinderen in de gemeente Zuidhorn. <br /><br />Beheer uw vouchers en neem ze overal mee door de Me-app te downloaden.",
                auth_button: "Download Me",
                button: 'START MET ACTIVEREN',
            },
            westerkwartier: {
                title: "Westerkwartier. Kindpakket",
                subtitle: "Welkom op de website van het Kindpakket Westerkwartier. Het Kindpakket is een jaarlijks ondersteunende regeling voor kinderen in de gemeente Westerkwartier.",
                auth_subtitle: "Welkom op de website van het Kindpakket. Heeft u van de gemeente een toekenning voor het Kindpakket? Dan kunt u hier het aanbod van activiteiten en cursussen zien en het geld dat u kunt besteden. <br /><br />Beheer uw vouchers en neem ze overal mee door de Me-app te downloaden.",
                auth_button: "Download Me",
                button: 'START MET ACTIVEREN',
            },
        },
        blog: {
            general: {
                title: "Onze blog",
                name: "Blog: Twee nieuwe implementaties van ons platform",
            },
            nijmegen: {
                title: "Onze blog",
                name: "Blog: Nieuw fonds Meedoen-regeling 2019 Nijmegen",
            },
            zuidhorn: {
                title: "Onze blog",
                name: "Blog: Nieuw fonds Kindpakket 2019 Zuidhorn",
            },
            westerkwartier: {
                title: "Onze blog",
                name: "Blog: Nieuw fonds Kindpakket 2019 Westerkwartier",
            },
            more: "Lees meer",
            button: "BEKIJK MEER",
        },
        product: {
            title: "Aanbiedingen",
            select: "Selecteer categorie...",
            search: "Zoek naar een aanbieding",
        },
        map: { 
            general: {
                title: "Overzicht van alle aanbieders",
                subtitle: "Binnen het Forus platform werken sponsoren en leveranciers samen om de beste diensten en producten te leveren voor het publieke domein.",
            },
            forus: {
                title: "Overzicht van alle aanbieders",
                subtitle: "Binnen het Forus platform werken sponsoren en leveranciers samen om de beste diensten en producten te leveren voor het publieke domein.",
            },
            zuidhorn: {
                title: "Overzicht van alle aanbieders",
                subtitle: "Binnen het platform Forus werkt de gemeente Zuidhorn en verschillende aanbieders samen om het beste aanbod te leveren",
            },
            nijmegen: {
                title: "Overzicht van alle organisaties",
                subtitle: "",
            },
            westerkwartier: {
                title: "Overzicht van alle aanbieders",
                subtitle: "Binnen het platform Forus werkt de gemeente Westerkwartier en verschillende aanbieders samen om het beste aanbod te leveren",
            },
            button: "BEKIJK DE KAART",
        },
        faq: {
            title: "Veelgestelde vragen {{client_key}}",
            faq_one: "Hoe kan ik {{fund}} activeren?",
            one: "Klik rechts bovenaan op 'Activatiecode'. Vul je e-mailadres en de activatiecode in die je per brief hebt ontvangen. Klik vervolgens op 'versturen'. Je profiel is aangemaakt en je Kindpakket voucher is geactiveerd!",
            faq_two: "Hoe kan ik inloggen op de webshop?",
            two: "Dit kan op meerdere manieren, de makkelijkste is per e-mail. Klik rechts bovenaan op 'Inloggen'. Kies voor 'log in via e-mail'. Vul het e-mailadres in die je ook tijdens de activatie hebt gebruikt en klik op 'Versturen'. Open je e-mail en klik op de link die je hebt ontvangen om in te loggen.",
            faq_three: "Bij welke aanbieders kan ik {{fund}} besteden?",
            three: "Je kan een overzicht van alle aanbieders terugvinden op de webshop. Ga naar 'Overzicht van alle aanbieders'",
            faq_four: "Ik ben mijn voucher kwijt. Wat moet ik doen?",
            four: "Je kan je voucher altijd terugvinden door in te loggen op de webshop, de voucher kun je uitprinten, naar je e-mail toesturen of zelfs altijd bij hand hebben door gebruik te maken van de Me app.",
            faq_five: "Hoe kan ik zien hoeveel tegoed ik nog over heb?",
            five: "Na elke betaling wordt er een e-mail toegestuurd met het huidige tegoed, daarnaast kan je het tegoed inzien door in te loggen op de webshop of door gebruik te maken van de Me app.",
            faq_six: "Kan ik iets wat ik heb gekocht ruilen/retour brengen?",
            six: "Retour brengen is helaas niet mogelijk. Ruilen misschien wel, vraag de winkelier naar de mogelijkheden.",
            faq_seven: "Moet het tegoed in een keer besteed worden?",
            seven: "Nee, je hoeft het tegoed niet in een keer te besteden.",
            faq_eight: "Ik heb meerdere kinderen. Moet ik aan ieder kind perse {{ amount }} euro besteden?",
            eight: "Nee, je mag zelf bepalen hoeveel je per kind wilt besteden.",
            faq_nine: "Hoe lang is de voucher geldig?",
            nine: "De voucher is vanaf {{start_date}} een jaar geldig.",
            faq_ten: "Kan ik de voucher omruilen voor contant geld?",
            ten: "Nee, de waarde van de voucher krijg je niet in contact geld uitbetaald.",
            faq_eleven: "Kan ik iets kopen bij een andere aanbieder die niet op de webshop staat?",
            eleven: "Nee, het tegoed kan alleen uitgegeven worden bij organisaties die op de webshop staan.",
            faq_twelve: "Ik heb nog een kind gekregen, kom ik in aanmerking voor een hoger tegoed?",
            twelve: "Ja dat kan. Neem dan even contact op met de gemeente.",
            faq_thirteen: "Hoe kom ik in aanmerking voor {{fund}}?",
            thirteen: "Als je denkt recht te hebben op {{fund}} , neem dan contact op met de gemeente. De gemeente bekijkt dan of je voldoet aan de voorwaarden.",
            faq_fourteen: "Kan ik de voucher aan iemand anders geven?",
            fourteen: "Nee, de voucher is strikt persoonlijk. Je mag de voucher niet aan iemand anders geven. Maakt iemand anders wel gebruik van jouw voucher dan wordt je eigen bedrag lager.",
            faq_fifteen: "Ik zie aanbiedingen op de webshop staan, hoe kan ik een aanbieding kopen?",
            fifteen: "Log in op de webshop en klik op 'Aanbiedingen'. Kies vervolgens de aanbieding die je wilt en klik op 'Koop'. Kies vervolgens {{fund}}-voucher om de aanbieding mee te kopen. Het bedrag van de aanbieding wordt van je {{voucher}} afgehaald en er wordt een nieuwe voucher aangemaakt. De nieuwe voucher kan alleen gebruikt worden voor de aanbieding die je hebt gekocht.",
            faq_sixteen: "Ik wil mijn kind zelf de aanbieding op laten halen, maar wil hem niet {{voucher}} meegeven. Wat kan ik doen?",
            sixteen: "Je kan een aanbieding kopen via de webshop, er wordt dan een nieuwe voucher aangemaakt die alleen gebruikt kan worden voor het specifieke aanbod. Deze kun je meegeven aan je kind.",
        
            zuidhorn: {
                faq_one: "Hoe kan ik het Kindpakket activeren?",
                one: "Klik rechts bovenaan op 'Activatiecode'. Vul je e-mailadres en de activatiecode in die je per brief hebt ontvangen. Klik vervolgens op 'versturen'. Je profiel is aangemaakt en je Kindpakket voucher is geactiveerd!",
                faq_two: "Hoe kan ik inloggen op de webshop?",
                two: "Dit kan op meerdere manieren, de makkelijkste is per e-mail. Klik rechts bovenaan op 'Inloggen'. Kies voor 'log in via e-mail'. Vul het e-mailadres in die je ook tijdens de activatie hebt gebruikt en klik op 'Versturen'. Open je e-mail en klik op de link die je hebt ontvangen om in te loggen.",
                faq_three: "Bij welke aanbieders kan ik het Kindpakket besteden?",
                three: "Je kan een overzicht van alle aanbieders terugvinden op de webshop. Ga naar 'Overzicht van alle aanbieders'",
                faq_four: "Ik ben mijn voucher kwijt. Wat moet ik doen?",
                four: "Je kan je voucher altijd terugvinden door in te loggen op de webshop, de voucher kun je uitprinten, naar je e-mail toesturen of zelfs altijd bij hand hebben door gebruik te maken van de Me app.",
                faq_five: "Hoe kan ik zien hoeveel tegoed ik nog over heb?",
                five: "Na elke betaling wordt er een e-mail toegestuurd met het huidige tegoed, daarnaast kan je het tegoed inzien door in te loggen op de webshop of door gebruik te maken van de Me app.",
                faq_six: "Kan ik iets wat ik heb gekocht ruilen/retour brengen?",
                six: "Retour brengen is helaas niet mogelijk. Ruilen misschien wel, vraag de winkelier naar de mogelijkheden.",
                faq_seven: "Moet het tegoed in een keer besteed worden?",
                seven: "Nee, je hoeft het tegoed niet in een keer te besteden.",
                faq_eight: "Ik heb meerdere kinderen. Moet ik aan ieder kind perse 300 euro besteden?",
                eight: "Nee, je mag zelf bepalen hoeveel je per kind wilt besteden.",
                faq_nine: "Hoe lang is de voucher geldig?",
                nine: "De voucher is vanaf 1 november 2018 een jaar geldig.",
                faq_ten: "Kan ik de voucher omruilen voor contant geld?",
                ten: "Nee, de waarde van de voucher krijg je niet in contact geld uitbetaald.",
                faq_eleven: "Kan ik iets kopen bij een andere aanbieder die niet op de webshop staat?",
                eleven: "Nee, het tegoed kan alleen uitgegeven worden bij aanbieders die op de webshop staan.",
                faq_twelve: "Ik heb nog een kind gekregen, kom ik in aanmerking voor een hoger tegoed?",
                twelve: "Ja dat kan. Neem dan even contact op met de gemeente.",
                faq_thirteen: "Hoe kom ik in aanmerking voor het Kindpakket?",
                thirteen: "Als je denkt recht te hebben op het Kindpakket, neem dan contact op met de gemeente. De gemeente bekijkt dan of je voldoet aan de voorwaarden.",
                faq_fourteen: "Kan ik de voucher aan iemand anders geven?",
                fourteen: "Nee, de voucher is strikt persoonlijk. Je mag de voucher niet aan iemand anders geven. Maakt iemand anders wel gebruik van jouw voucher dan wordt je eigen bedrag lager.",
                faq_fifteen: "Ik zie aanbiedingen op de webshop staan, hoe kan ik een aanbieding kopen?",
                fifteen: "Log in op de webshop en klik op 'Aanbiedingen'. Kies vervolgens de aanbieding die je wilt en klik op 'Koop'. Kies vervolgens het Kindpakket voucher om de aanbieding mee te kopen. Het bedrag van de aanbieding wordt van je Kindpakket voucher afgehaald en er wordt een nieuwe voucher aangemaakt. De nieuwe voucher kan alleen gebruikt worden voor de aanbieding die je hebt gekocht.",
                faq_sixteen: "Ik wil mijn kind zelf de aanbieding op laten halen, maar wil hem niet het Kindpakket voucher meegeven. Wat kan ik doen?",
                sixteen: "Je kan een aanbieding kopen via de webshop, er wordt dan een nieuwe voucher aangemaakt die alleen gebruikt kan worden voor het specifieke aanbod. Deze kun je meegeven aan je kind.",
            },
            nijmegen: {
                title: "Veelgestelde vragen",
                faq_one: "Hoe kan ik de Meedoen-regeling activeren?",
                one: "<ul><b><li>Stap 1: </b>Klik op de start knop om uw activatiecode in te vullen.</li><br /><li><b>Stap 2: </b>Vul uw eigen e-mailadres in om een bevestigingsmail te ontvangen. Bevestig dat u toegang heeft tot dit e-mailadres door op de knop in de mail te klikken.</li><br /><li><b>Stap 3: </b>Vul uw activatiecode in om de Meedoen-regeling te activeren en klik vervolgens op 'Volgende'. Uw profiel is aangemaakt en uw Meedoen-regeling is geactiveerd.</li></ul><br /><u><strong>Let op:</strong>U kunt één activatiecode per e-mailadres gebruiken.</ul>",
                faq_two: "Ik ben mijn activatiecode kwijt. Wat kan ik doen?",
                two: "Neem contact op met de gemeente Nijmegen. Wij kunnen de brief opnieuw versturen met daarin de activatiecode of de code aan de telefoon doorgeven.",
                faq_three: "Hoe kan ik mij aanmelden voor een activiteit of cursus",
                three: "Klik links bovenaan op 'Aanbiedingen' en maak uw keuze. Om een aanbieding te kopen dient u ingelogd te zijn.",
                faq_four: "Hoe kan ik inloggen op de webshop?",
                four: "Klik rechts bovenaan op 'Inloggen'. Kies voor 'log in via e-mail'. Vul het e-mailadres in die u ook tijdens de activatie hebt gebruikt en klik op 'Versturen'. Open uw e-mail en klik op de link die u heeft ontvangen om in te loggen. ",
                faq_five: "Bij welke organisaties kan ik mij aanmelden voor een activiteit of cursus?",
                five: "U kunt een overzicht van alle organisaties terugvinden op de webshop. Ga naar 'Overzicht van alle organisaties.",
                faq_six: "Ik ben mijn voucher kwijt. Wat moet ik doen?",
                six: "U kunt uw voucher altijd terugvinden door in te loggen op de webshop. Ga naar 'Log in' rechts bovenaan en log in met uw e-mailadres. Vervolgens kunt u de voucher uitprinten, naar uw e-mail sturen of altijd bij de hand hebben door gebruikt te maken de app <i>Me</i> op uw telefoon.",
                faq_seven: "Hoe kan ik zien hoeveel tegoed ik nog over heb?",
                seven: "Na elke betaling wordt er een e-mail toegestuurd met het huidige tegoed, U kunt daarnaast uw tegoed inzien door in te loggen op de webshop of door gebruik te maken van de app <i>Me</i> op uw telefoon.",
                faq_eight: "Kan ik een aanmelding voor een cursus of activiteit annuleren?",
                eight: "In de webshop kunt u een activiteit of cursus niet meer anulleren om het bedrag voor iets anders te gebruiken. U kunt wel bij de organisatie vragen of u een activiteit of cursus kunt ruilen voor iets anders.",
                faq_nine: "Moet het tegoed in een keer besteed worden?",
                nine: "Nee, u hoeft het tegoed niet in een keer te besteden.",
                faq_ten: "Hoe lang is de Meedoen-voucher geldig?",
                ten: "De voucher geldig tot en met 31 december 2019. De cursus of activiteit mag doorlopen in 2020.",
                faq_eleven: "Kan ik de Meedoen-voucher omruilen voor contant geld?",
                eleven: "Nee, de waarde van de voucher krijgt u niet in contact geld uitbetaald.",
                faq_twelve: "Kan ik iets doen bij een andere organisatie die niet op de webshop staat?",
                twelve: "Het tegoed kan alleen uitgegeven worden bij de organisaties die zich hebben aangemeld voor de Meedoen-regeling en op de webshop staan. U kunt wel een organisatie vragen deel te nemen. Een organisatie kan zich het hele jaar door aanmelden.",
                faq_thirteen: "Hoe kom ik in aanmerking voor de Meedoen-regeling?",
                thirteen: "U doet een aanvraag bij de gemeente Nijmegen. De voorwaarden om mee te doen en deel te nemen doet u <u><a href='https://www.nijmegen.nl/diensten/uitkering-schulden-en-laag-inkomen/meedoen-regeling/'>hier</a></u>",
                faq_fourteen: "Kan ik de voucher van €150 aan iemand anders geven?",
                fourteen: "Nee, de voucher is strikt persoonlijk. U mag de voucher niet aan iemand anders geven.",
                faq_fifteen: "Kan ik me ook aanmelden voor een activiteit bij de balie van een organisatie of kan het alleen in de webshop?",
                fifteen: "U kunt zich ook aanmelden voor een cursus of activiteit bij de organisatie zelf. U heeft dan wel de QR-code nodig die u in de webshop kunt downloaden en/of uitprinten. U betaalt met de QR-code.",
                faq_sixteen: "Ik krijg een foutmelding als ik de activatiecode invul, wat moet ik doen ?",
                sixteen: "Neem contact op met de gemeente Nijmegen. Wij gaan het voor u nakijken en een passende oplossing bieden.",
            },
            westerkwartier: {
                title: "Veelgestelde vragen",
                faq_one: "Hoe kan ik het Kindpakket activeren?",
                one: "Klik rechts bovenaan op 'Activatiecode'. Vul je e-mailadres en de activatiecode in die je per brief hebt ontvangen. Klik vervolgens op 'versturen'. Je profiel is aangemaakt en je Kindpakket voucher is geactiveerd!",
                faq_two: "Hoe kan ik inloggen op de webshop?",
                two: "Dit kan op meerdere manieren, de makkelijkste is per e-mail. Klik rechts bovenaan op 'Inloggen'. Kies voor 'log in via e-mail'. Vul het e-mailadres in die je ook tijdens de activatie hebt gebruikt en klik op 'Versturen'. Open je e-mail en klik op de link die je hebt ontvangen om in te loggen.",
                faq_three: "Bij welke aanbieders kan ik het Kindpakket besteden?",
                three: "Je kan een overzicht van alle aanbieders terugvinden op de webshop. Ga naar 'Overzicht van alle aanbieders'",
                faq_four: "Ik ben mijn voucher kwijt. Wat moet ik doen?",
                four: "Je kan je voucher altijd terugvinden door in te loggen op de webshop, de voucher kun je uitprinten, naar je e-mail toesturen of zelfs altijd bij hand hebben door gebruik te maken van de Me app.",
                faq_five: "Hoe kan ik zien hoeveel tegoed ik nog over heb?",
                five: "Na elke betaling wordt er een e-mail toegestuurd met het huidige tegoed, daarnaast kan je het tegoed inzien door in te loggen op de webshop of door gebruik te maken van de Me app.",
                faq_six: "Kan ik iets wat ik heb gekocht ruilen/retour brengen?",
                six: "Retour brengen is helaas niet mogelijk. Ruilen misschien wel, vraag de winkelier naar de mogelijkheden.",
                faq_seven: "Moet het tegoed in een keer besteed worden?",
                seven: "Nee, je hoeft het tegoed niet in een keer te besteden.",
                faq_eight: "Ik heb meerdere kinderen. Moet ik aan ieder kind perse 300 euro besteden?",
                eight: "Nee, je mag zelf bepalen hoeveel je per kind wilt besteden.",
                faq_nine: "Hoe lang is de voucher geldig?",
                nine: "De voucher is vanaf 1 november 2018 een jaar geldig.",
                faq_ten: "Kan ik de voucher omruilen voor contant geld?",
                ten: "Nee, de waarde van de voucher krijg je niet in contact geld uitbetaald.",
                faq_eleven: "Kan ik iets kopen bij een andere aanbieder die niet op de webshop staat?",
                eleven: "Nee, het tegoed kan alleen uitgegeven worden bij aanbieders die op de webshop staan.",
                faq_twelve: "Ik heb nog een kind gekregen, kom ik in aanmerking voor een hoger tegoed?",
                twelve: "Ja dat kan. Neem dan even contact op met de gemeente.",
                faq_thirteen: "Hoe kom ik in aanmerking voor het Kindpakket?",
                thirteen: "Als je denkt recht te hebben op het Kindpakket, neem dan contact op met de gemeente. De gemeente bekijkt dan of je voldoet aan de voorwaarden.",
                faq_fourteen: "Kan ik de voucher aan iemand anders geven?",
                fourteen: "Nee, de voucher is strikt persoonlijk. Je mag de voucher niet aan iemand anders geven. Maakt iemand anders wel gebruik van jouw voucher dan wordt je eigen bedrag lager.",
                faq_fifteen: "Ik zie aanbiedingen op de webshop staan, hoe kan ik een aanbieding kopen?",
                fifteen: "Log in op de webshop en klik op 'Aanbiedingen'. Kies vervolgens de aanbieding die je wilt en klik op 'Koop'. Kies vervolgens het Kindpakket voucher om de aanbieding mee te kopen. Het bedrag van de aanbieding wordt van je Kindpakket voucher afgehaald en er wordt een nieuwe voucher aangemaakt. De nieuwe voucher kan alleen gebruikt worden voor de aanbieding die je hebt gekocht.",
                faq_sixteen: "Ik wil mijn kind zelf de aanbieding op laten halen, maar wil hem niet het Kindpakket voucher meegeven. Wat kan ik doen?",
                sixteen: "Je kan een aanbieding kopen via de webshop, er wordt dan een nieuwe voucher aangemaakt die alleen gebruikt kan worden voor het specifieke aanbod. Deze kun je meegeven aan je kind.",
            },
            title: "Veelgestelde vragen"
        },
        guide: {
            general: {
                title: "Hoe het werkt",
                stepone: "Stap #1",
                one: "U heeft een brief  ontvangen van de gemeente. In de brief staat een activatiecode. Gebruik deze bij stap 2.",
                steptwo: "Stap #2",
                two: "Met de activatiecode kunt u zich aanmelden en {{fonds}} activeren. Druk op ‘Activatiecode’ bovenaan de pagina en vul de gevraagde gegevens in",
                stepthree: "Stap #3",
                three: "Na uw aanmelding wordt de Meedoen-regeling gelijk geactiveerd. De voucher met bijbehorende QR-Code kunt u terugvinden door bovenaan op ‘Mijn vouchers’ te klikken.",
                stepfour: "Stap #4",
                four: "De QR-Code kunt u uitprinten, naar uzelf toe mailen of altijd op uw telefoon hebben door in te loggen op de app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a>. De app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a> kunt u downloaden via de Google Playstore en de App Store.",
                stepfive: "Stap #5",
                five: "Ga naar de webshop om te zien waar de voucher te besteden is of om een aanbieding te kopen. Laat de bijbehorende QR-Code zien om uw aanbieding af te nemen.",  
            },
            zuidhorn: {
                title: "Hoe het werkt",
                stepone: "Stap #1",
                one: "Je hebt een brief  ontvangen van de gemeente. In de brief staat een activatiecode. Gebruik deze bij stap 2.",
                steptwo: "Stap #2",
                two: "Start met activeren door op <u>de knop ‘start activeren’</u> te klikken onder de welkomsttekst.",
                stepthree: "Stap #3",
                three: "Na je aanmelding wordt het Kindpakket gelijk geactiveerd. De voucher met bijbehorende QR-Code kan je terugvinden door bovenaan op ‘Mijn vouchers’ te klikken.",
                stepfour: "Stap #4",
                four: "De QR-Code kan je uitprinten, naar jezelf toe mailen of altijd op je telefoon hebben door in te loggen op de app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a>. De app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a> kun je downloaden via de Google Playstore en de App Store.",
                stepfive: "Stap #5",
                five: "Ga naar de webshop om te zien waar de voucher te besteden is of om een aanbieding te kopen. Laat de bijbehorende QR-Code zien om je aanbieding in ontvangst te nemen.",
            },
            nijmegen: {
                title: "Hoe het werkt",
                stepone: "Stap #1",
                one: "U hebt een brief ontvangen van de gemeente. In de brief staat een activatiecode.",
                steptwo: "Stap #2",
                two: "Klik op de <u>start</u> knop om uw activatiecode in te vullen. Gebruik uw eigen e-mailadres. U kunt voor de Meedoen-regeling ieder jaar maximaal één activatiecode per e-mailadres gebruiken.",
                stepthree: "Stap #3",
                three: "Klik daarna op ‘Aanbiedingen’. Daar vindt u alle activiteiten en cursussen. Ook kunt u uw tegoed zien. De voucher met het tegoed vindt u terug door bovenaan op ‘Mijn vouchers’ te klikken.",
                stepfour: "Stap #4",
                four: "Bij ‘Mijn vouchers’ staat ook een persoonlijke QR-code. Daarmee betaalt u de organisatie waar u een activiteit wilt doen. De QR-code kunt u uitprinten, naar uzelf mailen of altijd op uw telefoon hebben door in te loggen op de app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a>. De app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a> kunt u downloaden via de Google Playstore en de App Store.",
                stepfive: "Stap #5",
                five: "Ga naar 'Aanbiedingen' of het overzicht van alle organisaties om te zien waar de voucher te besteden is of om een aanbieding te kopen. Ga naar de organisatie en laat de bijbehorende QR-code zien om uw aanbieding in ontvangst te nemen.",
            },
            westerkwartier: {
                title: "Hoe het werkt",
                stepone: "Stap #1",
                one: "U heeft een brief  ontvangen van de gemeente. In de brief staat een activatiecode. Gebruik deze bij stap 2.",
                steptwo: "Stap #2",
                two: "Met de activatiecode kunt u zich aanmelden en de Meedoen-regeling activeren. Druk op ‘Activatiecode’ bovenaan de pagina en vul de gevraagde gegevens in",
                stepthree: "Stap #3",
                three: "Na uw aanmelding wordt de Meedoen-regeling gelijk geactiveerd. De voucher met bijbehorende QR-Code kunt u terugvinden door bovenaan op ‘Mijn vouchers’ te klikken.",
                stepfour: "Stap #4",
                four: "De QR-Code kunt u uitprinten, naar uzelf toe mailen of altijd op uw telefoon hebben door in te loggen op de app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a>. De app <a href='#!/me' tartget='_blank'><u><i>Me</i></u></a> kunt u downloaden via de Google Playstore en de App Store.",
                stepfive: "Stap #5",
                five: "Ga naar de webshop om te zien waar de voucher te besteden is of om een aanbieding te kopen. Laat de bijbehorende QR-Code zien om uw aanbieding af te nemen.",
            },
        },
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
        },
        popup: {
            title: "Weet u zeker dat u deze aanbieding '<span class='popup-title-styled'>{{product_name}}</span>' met een verloopdatum van <span class='popup-title-styled'>{{expire_at}}</span> wilt kopen voor <span class='popup-title-styled'>€{{product_price}}</span>? Wanneer u klikt op bevestig, dan kunt u de aankoop niet meer ruilen voor iets anders. Een terugbetaling is niet mogelijk!",
            expiration_information: "De verloopdatum van deze aanbieding is: <span class='popup-title-styled'>{{expire_at}}</span>. Zorg ervoor dat u voor deze datum gebruik maakt van de aanbieding.<br /><br />  Nadat u op bevestig klikt, krijgt u een voucher met een QR-code. Neem de voucher mee naar de aanbieder om deze te kunnen gebruiken. "
        },
    },

    // PRODUCT = product.pug
    product: {
        labels: {
            fund: "Fonds",
            find: "U kunt ons hier vinden",      
        },
        status: {
            active: "Actief",
        },
        buttons: {
            buy: "KOOP",
        },
        insufficient: "Uw tegoed is te laag.",
        tooltip: "U kunt de aanbieding alsnog kopen door met uw {{fund}} QR-code naar de aanbieder te gaan. Bij de aanbieder kunt u een bijbetaling doen.",
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
            title: "Uw voucher",
        },
        buttons: {
            send: "E-MAIL NAAR MIJ",
            details: "Bekijk details",
        },
        labels: {
            transactions: "Uitgaven",
            subtract: "Af",
            fund: "Fonds",
            expire: "Gebruik voor:",
            requirements: "Voor voorwaarden van deze aanbieding neem contact op met de aanbieder.",
            vouchers: "Staat uw gewenste aanbod niet in de webshop? Ga dan langs bij de aanbieder.",
            info: "<span style='font-style: italic;'>Zoek je een organisatie die niet op de kaart staat? Je kunt een organisatie vragen om deel te nemen. Een organisatie kan zich het hele jaar door aanmelden.</span>",
            offices: "U kunt uw voucher besteden bij de aanbieders op deze locaties",
            voucher: "Print uw voucher uit of mail hem naar uzelf toe. Ga met de QR-code naar de aanbieder en laat hem scannen.",
            office: "Locaties waar u deze aanbieding voucher kan verzilveren.",
            shopdetail: "INFORMATIE OVER DE AANBIEDER",
            productdetail: "INFORMATIE OVER DE AANBIEDING",
        },
        voucher_card: {
            header: {
                title: "Hoe werkt het?",
            },
            labels: {
                description: "Uw {{fund_name}} voucher kunt u bij de aanbieder laten zien. De aanbieder scant de QR-code om u het aanbod te leveren",
                desc: "Een voucher kunt u bij de aanbieder laten zien. De aanbieder kan de QR-code scannen om u het aanbod te leveren.",
                contact_sponsor: "Heeft u vragen over '{{fund_name}}'? Neem dan contact met ons op.",
                contact_provider: "Heeft u vragen over deze aanbieding? Neem dan contact met ons op.",
            },
            footer: {
                actions: {
                    mail: "EMAIL",
                    print: "PRINT",
                    share: "DEEL",
                    open_in_me: 'Me'
                },
                tooltips: {
                    mail: "E-mail de voucher naar uzelf",
                    print: "Print de voucher uit",
                    share: "Deel de voucher met de aanbieder",
                    open_in_me: 'Me'
                }
            },
            qrcode: {
                description: "Dit is uw {{fund_name}} voucher met een QR-code.",
                productdescription: "Dit is uw aanbieding voucher met een QR-code."
            },
            expire: "Gebruik deze voucher voor:",
            expired: "Verlopen"
        },
        share_voucher: {
            popup_form: {
                title: 'Let op! Neem contact op met aanbieder voordat u de QR-code deelt.',
                description: 'U kunt uw aanbieding voucher met de aanbieder delen om koop op afstand mogelijk te maken. Als de aanbieding een activiteit of dienst betreft: meld in het onderstaande veld eventuele extra informatie die de aanbieder vereist voor deelname. Dit kan een reden zijn maar ook uw naam of telefoonnummer betreffen.'
            },
            reason_placeholder: 'Bericht voor aanbieder',
            buttons: {
                submit: 'VERSTUREN',
                confirm: 'SLUIT'
            },
            popup_sent: {
                title: 'Uw voucher is verstuurd naar de aanbieder.',
                description: 'De aanbieder heeft de aanbieding voucher en uw bericht ontvangen. Neem contact op met aanbieder of ga bij bij de organisatie langs om het aanbod af te nemen.'
            },
            labels: {
                send_copy: "Stuur e-mail als bewijs ook naar uzelf"
            }
        }
    },


    // VOUCHERs = vouchers.pug
    vouchers: {
        header: {
            title: "Mijn vouchers",
        },
        labels: {
            transactions: "Uitgaven",
            last: "Laatste uitgave",
            subtract: "(Af)",
            none: "Geen",
            used: "GEBRUIKT",
            generated: "AANGEMAAKT",
            expire: "VERVALDATUM"
        }
    },

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
// DIRECTIVES
    // PRODUCT BLOCKS = block-products.pug
    block_products: {
        header: {
            title: "Aanbiedingen",
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
            general: {
                address:"Hooiweg 9, 9801 AJ Zuidhorn",
                phone:"(0594) 508888",
                mail: "kindpakket@zuidhorn.nl",
            },
            zuidhorn: {
                address:"Hooiweg 9, 9801 AJ Zuidhorn",
                phone:"(0594) 508888",
                mail: "kindpakket@zuidhorn.nl",
            },
            nijmegen: {
                address:"Hooiweg 9, 9801 AJ Zuidhorn",
                phone:"(0594) 508888",
                mail: "kindpakket@zuidhorn.nl",
            },
            westerkwartier: {
                address:"Grootegast, Hoofdstraat 97, 9861 AC <br/>Leek, Tolberterstraat 66, 9351 BJ <br/>Marum, Molenstraat 45, 9363 BA <br />Zuidhorn, Hooiweg 9, 9801 AJ",
                phone:"14 0594",
                mail: "kindpakket@westerkwartier.nl",
            },
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
        guide: "Gebruik de activatie code",
    },
    
    // CRITERIA FOR FUNDS = fund-criterion.pug
    fund_criterion: {
        labels: { 
            general: {
                location: "Groningen",
            },
            zuidhorn: {
                location: "Zuidhorn",
            },
            nijmegen: {
                location: "Nijmegen",
            },
            westerkwartier: {
                location: "Westerkwartier",
            },
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
            nijmegen: {
                title: "Inloggen bij de Meedoen-regeling",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            },
            zuidhorn: {
                title: "Inloggen op het Kindpakket",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",                
            },
            westerkwartier: {
                title: "Inloggen op het Kindpakket",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",             
            },
            general: {
                title: "Inloggen op Platform Forus",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            },
            forus: {
                title: "Inloggen op Platform Forus",
                subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
            }
        },
        notifications: {
            confirmation: "Het is gelukt!",
            link: "Er is een link naar uw e-mailadres gestuurd. Klik op de link om verder te gaan.",
            invalid: "De activatiecode is ongeldig of al gebruikt.",
            voucher_email: "Uw voucher is verstuurd naar uw mail.",
        },
        buttons: {
            qrcode: "Log in via de Me-app",
            mail: "Log in via e-mail",
            submit: "VOLGENDE",
            cancel: "ANNULEREN",
            confirm: "VOLGENDE",
        },
        labels: {
            nijmegen: {
                mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor de Meedoen-regeling per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            },
            zuidhorn: {
                mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor het Kindpakket per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            },
            timelimit: "U wordt automatisch uitgelogd na 15 minuten inactiviteit.",
            warning: "Sluit dit venster en klik op 'Login' als u de activatiecode al eens heeft gebruikt.",
            join: "Aanmelden",
            activate: "Stap 1 van 3: Webshop account aanmaken.",
            activate_code: "Stap 3 van 3: Activeer uw tegoed.",
            scancode: "Scan deze QR-Code met een ander apparaat waar u al op aangemeld bent.",
            mobilecode: "Vul uw toegangscode van de Me-app in.",
            mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor {{fund}} per jaar maximaal één activatiecode per e-mailadres gebruiken.",
            link: "Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen.",
            code: "Vul de activatiecode in die u per brief hebt ontvangen.<br /><strong>Let op:</strong> U kunt één activatiecode per e-mailadres gebruiken. Sluit dit venster als u al een activatiecode heeft gebruikt.",
            voucher_email: "Het is gelukt!",
            isactivated: "Uw voucher is al geactiveerd.",
            codeactivated: "U heeft al een activatiecode gebruikt. Het is niet mogelijk nog één te gebruiken.",
            dont_have_account: "Heeft u geen account en wilt u één aanmaken door een activatiecode te gebruiken?",
        },
        input: {
            mail: "Vul uw e-mailadres in",
            coding: "Vul de activatiecode in",
            code: "Activatiecode",
            mailing: "E-mail",
            confirmation: "Bevestig uw e-mailadres",
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

    // POPUP OFFICES = popup-offices.pug
    popup_offices: {
        header: {
            title_first_part: "We hebben ",
            title_last_part: " aanbieders gevonden",
            subtitle: "Selecteer een om meer informatie te zien",
        },
        labels: {
            mail: "E-MAIL",
            address: "ADRES",
            hours: "OPENINGSTIJDEN",
            none: "Openingstijden onbekend, raadpleeg de aanbieder.",
        },
    },
    
    // PROFILE CARD = profile-card.pug
    profile_card: {
        header: {
            title: "Uw persoonlijke QR-code",
            subtitle: "Laat uw persoonlijke QR-code scannen door een validator.",
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

    // Modal
    modal: {
        buttons: {
            cancel: "Annuleren",
            confirm: "Bevestig",
            close: "Sluit"
        },
        logout: {
            description: "U bent automatisch uitgelogd door 15 minuten aan inactiviteit."
        }
    },
    open_in_me: {
        sms: {
            body: 'Download Me makkelijk via de link: https://www.forus.io/DL',
            title: 'Download <i>Me</i> op uw mobiele telefoon',
            description: 'Vul uw telefoonnummer in het onderstaande invoerveld om een sms te ontvangen met de download link.',
            subdescription: 'Krijgt u geen sms dan kunt u <i>Me</i> downloaden via de link <b>www.forus.io/DL</b> op uw mobiele telefoon.',
            sent: 'Een sms-bericht is verstuurd.',
            sent_description: 'Heeft u geen bericht ontvangen? Download <i>Me</i> via de link <b>www.forus.io/DL</b> op uw mobiele telefoon.',
            button: {
                send: 'Versturen',
                skip: 'Overslaan'
            },
            error: {
                try_later: 'Probeer later nog eens.'
            }
        },
        app_header: {
            title: 'Vul de code in op het invoerveld',
            subtitle: 'De code is te vinden in de mobiele applicatie, volg de bovenstaande stappen op om de code te kunnen aflezen.'
        },
        app_instruction: {
            step_1: 'Open <i>Me</i>',
            step_2: 'Ik heb al een profiel',
            step_3: 'Inloggen met Autorisatie code',
        },
        authorize: {
            close: 'Annuleren',
            submit: 'Autoriseer apparaat',
        }
    },
    sign_up: {
        sms:{
            body: 'Download Me makkelijk via de link: https://www.forus.io/DL',
        }  
    }
};

module.exports = {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    approved_request_exists: "Er bestaat al een goedgekeurde aanvraag. Neem contact op met de beheerder.",
    fund_not_active: "Het fonds waar u voor zich probeert aan te melden is niet actief.",
    bsn_record_is_mandatory: "Een BSN is verplicht voor het doen van een aanvraag.",
    invalid_endpoint: "Geen toegang tot deze aanvraag",
    not_requester: "U bent niet de eigenaar van deze aanvraag.",
    sign_up: {
        block_title: "{{ fundname }} aanvragen",
        pane: {
            header_title: "Overzicht",
            text: "We hebben nog wat gegevens nodig. Doorloop de volgende stappen:",
            criterion_more: "'{{ name }}' moet meer dan {{ value }} zijn.",
            criterion_less: "'{{ name }}' moet minder dan {{ value }} zijn.",
            criterion_same: "'{{ name }}' moet {{ value }} zijn.",
            fund_already_applied: "U kunt niet nogmaals een aanvraag indienen.",
            footer: {
                prev: "Vorige stap",
                next: "Volgende stap"
            }
        },
        header: {
            main: "{{ fundname }} aanvraag",
            title: "Aanmelden",
            title_log_digid: "Log in met DigiD",
            title_fund_already_applied: "Aanvraag in behandeling"
        },
        subtitles: {
            step_1: "Via dit online formulier kunt u zich aanmelden voor beschikbare fondsen. ",
            step_2: "Er wordt gekeken of u al aan voorwaarden voldoet, en u kan tussentijds afbreken en op een ander moment verder gaan.",
            fund_already_applied: "Er is al een aanvraag in behandeling",
        },
        labels: {
            has_app: "Ik wil inloggen met de Me-app >",
            restore_with_digid: "Vergeten welk e-mailadres u heeft gebruikt? >",
            no_app: "Ik wil inloggen met mijn e-mailadres >",
        },
        app: {
            title: "Heeft u de Me-app al?",
            description_top: [
                'Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.',
            ].join("\n"),
            description_bottom: [
                'De Me-app wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en tegoeden te beheren.',
            ].join("\n")
        },
        digid: {
            title: "Vergeten welk e-mailadres u heeft gebruikt?",
            description: "Herstel uw account door opnieuw in te loggen met DigiD",
            button: "Login"
        },
        record_checkbox: {
            default: 'Ik verklaar aan de bovenstaande voorwaarden te voldoen',
            children_nth: 'Ik verklaar dat ik {{value}} kinderen heb',
            social_assistance_standard: 'Ik ga ermee akkoord dat mijn inkomsten worden gecontroleerd. Dit gebeurt door het vergelijken van mijn gegevens in de gemeentelijke bestanden of door het opvragen van specificaties.',
            kindpakket_eligible: 'Ja, ik verklaar dat ik recht heb op kindpakket.',
            kindpakket_2018_eligible: 'Ja, ik verklaar dat ik recht heb op kindpakket.',
        }
    }
}

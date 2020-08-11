module.exports = {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    sign_up: {
        block_title: "{{ fundname }} aanvragen",
        pane: {
            header_title: "Overzicht",
            text: "U staat op het punt om een {{ fundname }} aan te vragen. Om in aanmmerking te komen, dient u aan de voorwaarden te voldoen:",
            criterion_more: "'{{ name }}' moet meer dan {{ value }} zijn.",
            criterion_less: "'{{ name }}' moet minder dan {{ value }} zijn.",
            criterion_same: "'{{ name }}' moet {{ value }} zijn.",
            footer: {
                prev: "Vorige stap",
                next: "Volgende stap"
            }
        },
        header: {
            main: "Aanvraag",
            title_step_1: "Welkom",
            title_step_2: "Meld u aan",
        },
        subtitles: {
            step_1: "Via dit online formulier kunt u zich aanmelden voor beschikbare fondsen. ",
            step_2: "Er wordt gekeken of u al aan voorwaarden voldoet, en u kan tussentijds afbreken en op een ander moment verder gaan.",
        },
        labels: {
            has_app: "Ik wil inloggen met de me app >",
            no_app: "< Ik wil inloggen met mijn emailadres",
        },
        app: {
            title: "Heeft u de Me App al?",
            description_top: [
                'De me app is een optionele manier om eenvoudig, veilig en snel op deze website in te loggen, en om uw budgetten te beheren.',
            ].join("\n"),
            description_bottom: [
                'Scan de QR code aan de rechterzijde met de QR-scanner in de Me App.',
                'De Me App wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en vouchers te beheren.',
            ].join("\n")
        },
        records: {
            labels: {
                'children_nth': 'Ik verklaar dat ik {{value}} kinderen heb',
                'kindpakket_eligible': 'Ja, ik verklaar dat ik recht heb op kindpakket.',
                'kindpakket_2018_eligible': 'Ja, ik verklaar dat ik recht heb op kindpakket.',
            }
        },
    }
}
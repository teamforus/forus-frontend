module.exports = {
    // VALIDATION REQUEST FOR FUNDS = fund_request.pug
    sign_up: {
        block_title: "{{ fundname }} aanvragen",
        pane: {
            header_title: "Overzicht",
            text: "U staat op het punt om een {{ fundname }} aan te vragen. Om in aanmerking te komen, dient u aan de voorwaarden te voldoen:",
            criterion_more: "'{{ name }}' moet meer dan {{ value }} zijn.",
            criterion_less: "'{{ name }}' moet minder dan {{ value }} zijn.",
            criterion_same: "'{{ name }}' moet {{ value }} zijn.",
            fund_already_applied: "You can not submit a new application until this one is not finished.",
            footer: {
                prev: "Vorige stap",
                next: "Volgende stap"
            }
        },
        header: {
            main: "Aanvraag",
            title_step_1: "Welkom",
            title_step_2: "Meld u aan",
            title_fund_already_applied: "Application in progress"
        },
        subtitles: {
            step_1: "Via dit online formulier kunt u zich aanmelden voor beschikbare fondsen. ",
            step_2: "Er wordt gekeken of u al aan voorwaarden voldoet, en u kan tussentijds afbreken en op een ander moment verder gaan.",
            fund_already_applied: "You already applied and have an active application process. Please find below the status of your request.",
        },
        labels: {
            has_app: "Ik wil inloggen met de me app >",
            no_app: "< Ik wil inloggen met mijn emailadres",
        },
        app: {
            title: "Heeft u de Me-app al?",
            description_top: [
                'De Me-app is een optionele manier om eenvoudig, veilig en snel op deze website in te loggen, en om uw budgetten te beheren.',
            ].join("\n"),
            description_bottom: [
                'Scan de QR-code aan de rechterzijde met de QR-scanner in de Me-app.',
                'De Me App wordt gebruikt om makkelijk en veilig in te loggen, betalingen te doen en vouchers te beheren.',
            ].join("\n")
        }
    }
}
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
            
            // depricated, delete?
            /* operator: {
                same: "'{{ name }}' moet",
                more: " meer dan",
                less: " minder dan"
            },*/
            
            footer: {
                prev: "Vorige stap",
                next: "Volgende stap"
            }
        }
    }
}
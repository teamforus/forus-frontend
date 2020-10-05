module.exports = {
    // FUND REQUEST VALIDATION CLARIFICATION = fund-request-clarification.pug
    blocktitle: "{{ fundname }} aanvulverzoek",
    labels: {
        question: "Vraag",
        message: "Bericht",
        attachment: "Bijlage",
    },
    placeholder: "Uw bericht...",
    buttons: {
        submit: "Bevestig",
        back: "Terug",
    },
    not_pending: {
        title: "Aanvraag voltooid",
        desc: "U heeft al een reactie ingestuurd.",
    },
    done: {
        title: "Aanvulverzoek verzonden.",
        desc: "Uw aanvulverzoek is verzonden, u krijgt een e-mail als uw aanvraag is afgehandeld."
    }
}

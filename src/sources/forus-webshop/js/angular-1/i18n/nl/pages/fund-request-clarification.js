module.exports = {
    // FUND REQUEST VALIDATION CLARIFICATION = fund-request-clarification.pug
    block_title: "{{ fundname }} aanvraag",
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
        title: "Al geantwoord.",
        desc: "Uw aanvraag is voltooid, u krijgt een e-mail wanneer deze is goedgekeurd."
    }
}
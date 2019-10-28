module.exports = {
    // FUND REQUEST VALIDATION CLARIFICATION = fund-request-clarification.pug
    block_title: "{{ fundname }} aanvraag",
    labels: {
        question: "Vraag",
        message: "Bericht",
        attachment: "Bijlage",
    },
    placeholder: "Your message...",
    buttons: {
        submit: "Bevestig",
        back: "Terug naar de webshop",
    },
    not_pending: {
        title: "Aanvraag voltooid",
        desc: "U heeft al een reactie ingestuurd.",
    },
    done: {
        title: "Al geantwoord.",
        desc: "Uw aanvraag is voltooid, u krijgt een email wanneer deze is goedgekeurd."
    }
}
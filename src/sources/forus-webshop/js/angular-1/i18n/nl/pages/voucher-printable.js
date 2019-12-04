module.exports = {
    product_voucher: {
        labels: {
            use_for: 'Gebruik deze voucher voor:',
            description: 'Dit is uw ‘{{printableTitle}}’ voucher met een QR-code',
            show_to: 'Laat deze voucher eenmalig zien bij de destreffende aanbieder:',
            contact_us: 'Neem dan contact op met de aanbieder.'
        }
    },
    budget_voucher: {
        labels: {
            use_for: 'Gebruik deze voucher voor:',
            description: 'Dit is uw {{printableTitle}} voucher met een QR-code',
            show_to: 'Laat deze voucher zien bij een van de destreffende aanbieders, te vinden op:',
            contact_us: 'Neem contact op met:'
        }
    },
    default: {
        labels: {
            contact: {
                have_questions: 'Heeft u vragen over ‘{{printableTitle}}’?',
                phone: 'Telefoonnummer',
                email: 'E-mailadres',
            }
        }
    }
};
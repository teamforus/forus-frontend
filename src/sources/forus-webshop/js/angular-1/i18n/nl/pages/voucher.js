module.exports = {
    // VOUCHER = voucher.pug
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
            offers: "Wilt u graag informatie over het volledige aanbod? Neem dan contact op met de aanbieder.",
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
                    mail: "E-mail naar mij",
                    print: "Print",
                    share: "Deel met aanbieder",
                    open_in_me: 'Open in app'
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
            delete: "Annuleer reservering",
            expired: "Verlopen"
        },
        share_voucher: {
            popup_form: {
                title: 'Let op! Stuur een bericht naar de aanbieder voordat u de QR-code deelt.',
                description: 'U kunt uw aanbieding voucher met de aanbieder delen om koop op afstand mogelijk te maken. Als de aanbieding een activiteit of dienst betreft: typ in het onderstaande veld extra informatie die de aanbieder vereist voor deelname, zoals: uw naam en telefoonnummer.'
            },
            reason_placeholder: 'Bericht voor aanbieder',
            buttons: {
                submit: 'VERSTUREN',
                confirm: 'SLUIT'
            },
            popup_sent: {
                title: 'Uw voucher is verstuurd naar de aanbieder.',
                description: 'De aanbieder heeft de aanbieding voucher en uw bericht ontvangen. Neem contact op met de aanbieder of ga bij de organisatie langs om het aanbod af te nemen.' +
                    '<br/>Bijv. voor schoolkosten, dit aanbod kan de inwoner niet afnemen. Ontvangt de inwoner een mail zodra het bedrag is afgeschreven van de aanbiedingvoucher?'
            },
            labels: {
                send_copy: "Stuur e-mail als bewijs ook naar uzelf"
            }
        },
        delete_voucher: {
            popup_form: {
                title: 'Wilt u uw reservering voor aankoop annuleren?',
                description: 'U kunt uw reservering annuleren om af te zien van de aankoop. Wanneer u deze aankoop niet wenst te annuleren klikt u op "sluit".'
            },
            buttons: {
                submit: 'BEVESTIG',
                close: 'SLUIT'
            },
        }
}
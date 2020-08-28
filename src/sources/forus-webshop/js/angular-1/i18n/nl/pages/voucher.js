module.exports = {
    // VOUCHER = voucher.pug
        header: {
            title: "Uw tegoed",
        },
        buttons: {
            send: "E-mail naar mij",
            details: "Bekijk details",
        },
        labels: {
            transactions: "Uitgaven",
            subtract: "Af",
            fund: "Fonds",
            expire: "Gebruik tot en met:",
            requirements: "Voor voorwaarden van dit aanbod neem contact op met de aanbieder.",
            vouchers: "Staat uw gewenste aanbod niet in de webshop? Ga dan langs bij de aanbieder.",
            info: "<span style='font-style: italic;'>Zoek je een organisatie die niet op de kaart staat? Je kunt een organisatie vragen om deel te nemen. Een organisatie kan zich het hele jaar door aanmelden.</span>",
            offices: "U kunt uw tegoed besteden bij de aanbieders op deze locaties",
            voucher: "Print uw tegoed uit of mail hem naar uzelf toe. Ga met de QR-code naar de aanbieder en laat hem scannen.",
            office: "Locaties waar u deze reservering kan verzilveren.",
            shopdetail: "INFORMATIE OVER DE AANBIEDER",
            productdetail: "INFORMATIE OVER HET AANBOD",
            offers: "Wilt u graag informatie over het volledige aanbod? Neem dan contact op met de aanbieder.",
        },
        voucher_card: {
            header: {
                title: "Hoe werkt het?",
            },
            labels: {
                description: "Uw {{fund_name}} tegoed kunt u bij de aanbieder laten zien. De aanbieder scant de QR-code om u het aanbod te leveren",
                desc: "Een tegoed kunt u bij de aanbieder laten zien. De aanbieder kan de QR-code scannen om u het aanbod te leveren.",
                contact_sponsor: "Heeft u vragen over '{{fund_name}}'? Neem dan contact met ons op.",
                contact_provider: "Heeft u vragen over dit aanbod? Neem dan contact met ons op.",
            },
            footer: {
                actions: {
                    mail: "E-mail naar mij",
                    print: "Print",
                    share: "Deel met aanbieder",
                    open_in_me: 'Open in app'
                },
                tooltips: {
                    mail: "E-mail het tegoed naar uzelf",
                    print: "Print het tegoed uit",
                    share: "Deel het tegoed met de aanbieder",
                    open_in_me: 'Me'
                }
            },
            qrcode: {
                description: "Dit is uw {{fund_name}} tegoed met een QR-code.",
                productdescription: "Dit is uw reservering met een QR-code."
            },
            expire: "Gebruik dit tegoed voor:",
            delete: "Annuleer reservering",
            expired: "Verlopen"
        },
        share_voucher: {
            popup_form: {
                title: 'Let op! Stuur een bericht naar de aanbieder voordat u de QR-code deelt.',
                description: 'U kunt uw reservering met de aanbieder delen om koop op afstand mogelijk te maken. Als het aanbod een activiteit of dienst betreft: typ in het onderstaande veld extra informatie die de aanbieder vereist voor deelname, zoals: uw naam en telefoonnummer.'
            },
            reason_placeholder: 'Bericht voor aanbieder',
            buttons: {
                submit: 'Vesturen',
                confirm: 'Sluit'
            },
            popup_sent: {
                title: 'Uw reservering is verstuurd naar de aanbieder.',
                description: 'De aanbieder heeft de reservering en uw bericht ontvangen. Neem contact op met de aanbieder of ga bij de organisatie langs om het aanbod af te nemen.'
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
                submit: 'Bevestig',
                close: 'Sluit'
            },
        }
}
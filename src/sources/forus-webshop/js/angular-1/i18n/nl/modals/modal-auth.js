module.exports = {
    // AUTHENTICATION POPUP = popup-auth.pug
    header: {
        nijmegen: {
            title: "Inloggen bij de Meedoen-regeling",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        berkelland: {
            title: "Inloggen op de Meedoenapplicatie",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        oostgelre: {
            title: "Inloggen op de Meedoenapplicatie",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        winterswijk: {
            title: "Inloggen op de Meedoenapplicatie",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        kerstpakket: {
            title: "Inloggen op het Kerstpakket",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        zuidhorn: {
            title: "Inloggen op het Kindpakket",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        westerkwartier: {
            title: "Inloggen op het Kindpakket",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        general: {
            title: "Inloggen op Platform Forus",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        },
        forus: {
            title: "Inloggen op Platform Forus",
            subtitle: "<span>Scan de QR-code met de</span> <strong><u>Me-app</u></strong><span> of log in met uw e-mailadres</span>",
        }
    },
    notifications: {
        confirmation: "Het is gelukt!",
        link: "Er is een e-mail verstuurd naar <strong class=\"text-primary\">{{email}}</strong>.<br/>Klik op de link om u aan te melden.",
        invalid: "De activatiecode is ongeldig of al gebruikt.",
        voucher_email: "Uw tegoed is verstuurd naar uw mail.",
    },
    buttons: {
        qrcode: "Log in via de Me-app",
        mail: "Log in via e-mail",
        submit: "Bevestig",
        cancel: "Annuleren",
        confirm: "Volgende",
    },
    labels: {
        nijmegen: {
            mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor de Meedoen-regeling per jaar maximaal één activatiecode per e-mailadres gebruiken.",
        },
        zuidhorn: {
            mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor het Kindpakket per jaar maximaal één activatiecode per e-mailadres gebruiken.",
        },
        berkelland: {
            mail: "Maak een account aan voordat u verder kan met de activatie."
        },
        oostgelre: {
            mail: "Maak een account aan voordat u verder kan met de activatie."
        },
        winterswijk: {
            mail: "Maak een account aan voordat u verder kan met de activatie."
        },
        westerkwartier: {
            mail: "Maak een account aan voordat u verder kan met de activatie."
        },
        noordoostpolder: {
            mail: "Maak een account aan voordat u verder kan met de activatie."
        },
        timelimit: "U wordt automatisch uitgelogd na 15 minuten inactiviteit.",
        warning: "Sluit dit venster en klik op 'Login' als u de activatiecode al eens heeft gebruikt.",
        join: "Aanmelden",
        mail_sent: "Een e-mail is onderweg!",
        activate: "Stap 1 van 3: Webshop account aanmaken.",
        activate_code: "Stap 3 van 3: Activeer uw tegoed.",
        scancode: "Scan deze QR-Code met een ander apparaat waar u al op aangemeld bent.",
        mobilecode: "Vul uw toegangscode van de Me-app in.",
        mail: "<strong>Let op</strong>: gebruik uw eigen e-mailadres.<br /> U kunt voor {{fund}} per jaar maximaal één activatiecode per e-mailadres gebruiken.",
        link: "Vul uw e-mailadres in om een link te ontvangen waarmee u kunt inloggen.",
        code: "Vul de activatiecode in die u per brief hebt ontvangen.<br /><strong>Let op:</strong> U kunt één activatiecode per e-mailadres gebruiken. Sluit dit venster als u al een activatiecode heeft gebruikt.",
        voucher_email: "Het is gelukt!",
        isactivated: "Uw voucher is al geactiveerd.",
        codeactivated: "U heeft al een activatiecode gebruikt. Het is niet mogelijk nog één te gebruiken.",
        dont_have_account: "Heeft u geen account en wilt u één aanmaken door een activatiecode te gebruiken?",
    },
    input: {
        mail: "Vul uw e-mailadres in",
        coding: "Vul de activatiecode in",
        code: "Activatiecode",
        mailing: "E-mail",
        confirmation: "Bevestig uw e-mailadres",
    },
    pin_code: {
        confirmation: {
            title: "De app wordt gekoppeld aan uw profiel",
            description: "Na vijf tot tien seconden wordt de app gekoppeld. Is het gelukt? Klik dan op volgende.",
            notice: "Ziet u na dertig seconden nog steeds de zes cijfers in de app? Probeer het dan opnieuw.",
            buttons: {
                try_again: "Opnieuw proberen",
                confirm: "Volgende"
            }
        }
    },
    validation: {
        email_confirmation: "De e-mailadressen komen niet overeen"
    }
}

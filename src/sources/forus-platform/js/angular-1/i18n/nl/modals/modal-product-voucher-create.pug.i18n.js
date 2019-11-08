module.exports = {
    title: "Aanbiedingsvoucher aanmaken",
    labels: {
        fund: 'Fonds',
        amount: 'Bedrag',
        note: 'Notitie',
        expire_at: 'Geldig tot',
    },
    info: "Voucher eenmaal aangemaakt kan niet verwijderd worden. Met een voucher gemaakt via deze functie kan een gebruiker gebruik maken van een budget zonder account zolang niet toegekend.",
    buttons: {
        cancel: "Annuleren",
        submit: "Aanmaken",
    },
    modal_section: {
        voucher_type_title: "Selecteer op welke manier u een aanbiedingsvoucher wilt aanmaken.",
        voucher_type_subtitle: "Als u een activatie code bij de hand hebt, gebruik dan de tweede optie.",
        voucher_type_item: {
            giftcard: "Als een niet-toegekende voucher",
            activation_code: "via activatie-code"
        }
    }
};
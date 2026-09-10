export default {
    download: {
        with_preview_pages: {
            title: 'PDF-bestand downloaden',
            description:
                "PDF-bestanden kunnen actieve inhoud of andere risico's bevatten.\n" +
                "De download bevat het originele PDF-bestand en afbeeldingen van alle pagina's.\n" +
                'Gebruik bij voorkeur de afbeeldingen voor controle.\n' +
                'Open het originele PDF-bestand alleen als u de bron vertrouwt.',
            confirmation: 'Ik begrijp dat deze download ook het originele PDF-bestand bevat.',
        },
        without_preview_pages: {
            title: 'PDF-bestand downloaden zonder voorbeeldafbeeldingen',
            description:
                'Er zijn geen voorbeeldafbeeldingen beschikbaar voor dit PDF-bestand.\n' +
                'De download bevat daarom alleen het originele PDF-bestand.\n' +
                'Open dit bestand alleen als u de bron vertrouwt.',
            confirmation:
                'Ik begrijp dat deze download alleen het originele PDF-bestand bevat en geen voorbeeldafbeeldingen.',
        },
        buttons: {
            confirm: 'ZIP-bestand downloaden',
            cancel: 'Annuleren',
        },
    },
};

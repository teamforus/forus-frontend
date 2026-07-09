export default interface Media {
    original_name: string;
    type: string;
    ext: string;
    uid: string;
    dominant_color?: string;
    is_dark?: boolean;
    sizes: {
        original?: string;
        large?: string;
        medium?: string;
        small?: string;
        thumbnail?: string;
        [key: string]: string;
    };
}

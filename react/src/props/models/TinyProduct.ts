import type Media from '../../dashboard/props/models/Media';

export default interface TinyProduct {
    id: number;
    name: string;
    photos: Media[];
}

export interface Photo {
  /** Unsplash CDN photo path, without query string. */
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
  /** Unsplash photo page. */
  link: string;
}

export const photos = {
  chauffeur: {
    src: 'photo-1485291571150-772bcfc10da5',
    width: 6232,
    height: 3895,
    alt: 'Black Mercedes saloon in silhouette against a dark background',
    credit: 'Samuele Errico Piccarini',
    link: 'https://unsplash.com/photos/FMbWFDiVRPs',
  },
  'airport-transfers': {
    src: 'photo-1653795163859-9ee39ecc6d62',
    width: 8023,
    height: 5354,
    alt: 'Travellers walking through a dark airport terminal',
    credit: 'Daniel',
    link: 'https://unsplash.com/photos/x6tdU7EwAC4',
  },
  'secure-courier': {
    src: 'photo-1449247666642-264389f5f5b1',
    width: 3500,
    height: 2338,
    alt: 'A person holding a sealed cardboard parcel ready for hand-over',
    credit: 'Bench Accounting',
    link: 'https://unsplash.com/photos/MGaFENpDCsw',
  },
  'long-distance': {
    src: 'photo-1788173755899-422e9ffbff81',
    width: 6000,
    height: 4000,
    alt: 'Light trails from passing cars on a dark road through woodland at dusk',
    credit: 'Oleksii Tsaryuk',
    link: 'https://unsplash.com/photos/uGBcrQ8Qsrs',
  },
  norwich: {
    src: 'photo-1772969737694-871675200a59',
    width: 5760,
    height: 3840,
    alt: 'The Norwich skyline with the cathedral spire, St John the Baptist Cathedral and the castle',
    credit: 'Daniel Sturley',
    link: 'https://unsplash.com/photos/a96YinP0asI',
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

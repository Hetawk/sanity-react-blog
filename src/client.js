import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = sanityClient({

  // projectId: process.env.SANITY_STUDIO_API_PROJECT_ID,
  projectId: '4kc0qfnh',
  dataset: 'production',
  apiVersion: '2021-08-31',
  useCdn: true,
  token: process.env.SANITY_STUDIO_TOKEN,
  ignoreBrowserTokenWarning: true,

});


const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);

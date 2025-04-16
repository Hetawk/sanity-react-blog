import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Create a client with optional token
export const createClient = (token = null) => {
  return sanityClient({
    projectId: '4kc0qfnh',
    dataset: 'production',
    apiVersion: '2021-08-31',
    useCdn: token ? false : true, // Disable CDN for authenticated requests
    token: token,
    ignoreBrowserTokenWarning: true,
  });
};

// Default client for read-only operations
export const client = createClient();

// Create a builder function that can be reused
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);

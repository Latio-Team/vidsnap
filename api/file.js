import { randomUUID } from 'crypto';

const PINATA_JWT = process.env.PINATA_JWT;
const BASE_URLS = {
  UPLOADS: 'https://uploads.pinata.cloud/v3/files/',
  API: 'https://api.pinata.cloud/v3/files/',
};

/**
 * Makes a request to the specified URL
 * @param {string} url - The URL to make the request to
 * @param {string} method - The HTTP method to use
 * @param {Object} headers - The headers to include in the request
 * @param {BodyInit|null} body - The body of the request
 * @returns {Promise<[any, null]|[null, any]>} A promise that resolves to an array with either [data, null] or [null, error]
 */
const makeRequest = async (url, method, headers, body) => {
  try {
    const request = await fetch(url, { method, headers, body });
    const response = await request.json();
    return request.ok ? [response.data, null] : [null, response];
  } catch (error) {
    return [null, error];
  }
};

/**
 * Simplified API for Pinata operations
 */
const pinataAPI = {
  /**
   * Uploads a file to Pinata
   * @param {File} file - The file to upload
   * @returns {Promise<[any, null]|[null, any]>} A promise that resolves to an array with either [data, null] or [null, error]
   */
  upload: async (file, group = null) => {
    const formData = new FormData();
    const id = `${randomUUID()}.${file.name.split('.').pop()}`;
    formData.append('file', file, id);
    formData.append('name', id);
    if (group) formData.append('group_id', group);

    return makeRequest(
      BASE_URLS.UPLOADS,
      'POST',
      { Authorization: `Bearer ${PINATA_JWT}` },
      formData
    );
  },

  /**
   * Retrieves file data from Pinata
   * @param {string} id - The ID of the file to retrieve
   * @returns {Promise<[any, null]|[null, any]>} A promise that resolves to an array with either [data, null] or [null, error]
   */
  getFile: (id) =>
    makeRequest(new URL(id, BASE_URLS.API), 'GET', {
      Authorization: `Bearer ${PINATA_JWT}`,
    }),

  /**
   * Updates file metadata in Pinata
   * @param {string} id - The ID of the file to update
   * @param {Object} metadata - The metadata to update
   * @returns {Promise<[any, null]|[null, any]>} A promise that resolves to an array with either [data, null] or [null, error]
   */
  updateMetadata: (id, metadata) =>
    makeRequest(
      new URL(id, BASE_URLS.API),
      'PUT',
      {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      JSON.stringify({ keyvalues: metadata })
    ),

  /**
   * Deletes a file from Pinata
   * @param {string} id - The ID of the file to delete
   * @returns {Promise<[any, null]|[null, any]>} A promise that resolves to an array with either [data, null] or [null, error]
   */
  deleteFile: (id) =>
    makeRequest(new URL(id, BASE_URLS.API), 'DELETE', {
      Authorization: `Bearer ${PINATA_JWT}`,
    }),
};

/**
 * Handles errors by creating a JSON response
 * @param {any} error - The error to handle
 * @param {number} status - The HTTP status code to use
 * @returns {Response} A JSON response with the error and status code
 */
const handleError = (error, status = 500) => Response.json(error, { status });

/**
 * Handles GET requests to retrieve file data
 * @param {Request} req - The incoming request object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export async function GET(req) {
  const id = new URL(req.url).searchParams.get('id');

  try {
    const [fileData, fileError] = await pinataAPI.getFile(id);
    if (fileError) return handleError(fileError, 500);

    return Response.json(fileData);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Handles POST requests to upload a new file
 * @param {Request} req - The incoming request object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export async function POST(req) {
  const body = await req.formData();
  const file = body.get('file');
  const group = body.get('group');

  if (!file) return Response.json({ message: 'Missing file in request' });

  try {
    const [data, error] = await pinataAPI.upload(file, group);
    return error ? handleError(error) : Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Handles PUT requests to update a file's metadata
 * @param {Request} req - The incoming request object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export async function PUT(req) {
  const { id, title } = await req.json();

  try {
    const [data, error] = await pinataAPI.updateMetadata(id, { title });
    return error ? handleError(error) : Response.json(data);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Handles DELETE requests to remove a file
 * @param {Request} req - The incoming request object
 * @returns {Promise<Response>} A promise that resolves to a Response object
 */
export async function DELETE(req) {
  const { id } = await req.json();

  try {
    const [data, error] = await pinataAPI.deleteFile(id);
    return error ? handleError(error) : Response.json({ ok: !data });
  } catch (error) {
    return handleError(error);
  }
}

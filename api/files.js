const PINATA_JWT = process.env.PINATA_JWT;

/**
 * List all files for a user
 * @param {Request} req - The incoming request
 * @returns {Response}
 */
export async function GET(req) {
  const group = new URL(req.url).searchParams.get('group');
  if(!group) {
    return Response.json({ message: `No files found` })
  }
  try {
    const options = {
      method: 'GET',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
    };
    const request = await fetch(
      `https://api.pinata.cloud/v3/files?group=${group}`,
      options
    );
    const response = await request.json();
    return Response.json(response.data);
  } catch (error) {
    return Response.json(error);
  }
}

const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Creates a new group for organizing user's content post-signup
 * @param {Request} req - The request
 * @returns {Response}
 */
export async function GET(req) {
  if (!req.headers.get('cookie').includes('__session=')) {
    return Response.json({ message: `Unauthorized` }, { status: 403 });
  }
  try {
    const id = crypto.randomUUID();
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: id, is_public: false }),
    };
    const request = await fetch(
      `https://api.pinata.cloud/v3/files/groups`,
      options
    );
    const response = await request.json();
    return Response.json(response.data);
  } catch (error) {
    console.log(error);
    return Response.json(error);
  }
}

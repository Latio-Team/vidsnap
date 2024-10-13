const PINATA_JWT = process.env.PINATA_JWT;

/**
 * Redirect to a signed URL
 * @param {Request} req - The incoming request
 */
export async function GET(req) {
  const cid = new URL(req.url).searchParams.get('cid');

  try {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://green-improved-anteater-31.mypinata.cloud/files/${cid}`,
        expires: 500000,
        date: Date.now(),
        method: 'GET',
      }),
    };

    const request = await fetch(
      'https://api.pinata.cloud/v3/files/sign',
      options
    );
    const response = await request.json();
    return Response.redirect(response.data);
  } catch (error) {
    return Response.json(error);
  }
}

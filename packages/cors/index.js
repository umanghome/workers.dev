const METHODS = 'GET, HEAD, POST, OPTIONS, PUT, DELETE, PATCH';

// We support the GET, POST, HEAD, and OPTIONS methods from any origin,
// and accept the Content-Type header on requests. These headers must be
// present on all responses to all CORS requests. In practice, this means
// all responses to OPTIONS requests.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': METHODS,
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function handleCORS(request) {
  const url = new URL(request.url);
  const apiurl = url.searchParams.get('url'); // This does decodeURIComponent internally

  if (!apiurl) {
    return new Response(JSON.stringify({ error: 'url is expected' }), {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
      statusCode: 400,
    })
  }

  // Rewrite request to point to API url. This also makes the request mutable
  // so we can add the correct Origin header to make the API server think
  // that this request isn't cross-site.
  request = new Request(apiurl, request);

  request.headers.set('Origin', new URL(apiurl).origin);

  let response = await fetch(request);

  // Recreate the response so we can modify the headers
  response = new Response(response.body, response);

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', url.origin);

  // Append to/Add Vary header so browser will cache response correctly
  response.headers.append('Vary', 'Origin');

  return response;
}

function handleOptions(request) {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      Allow: METHODS
    }
  });
}

addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method === 'OPTIONS') {
    // Handle CORS preflight requests
    event.respondWith(handleOptions(request));
  } else {
    // Handle requests to the API server
    event.respondWith(handleCORS(request));
  }
});

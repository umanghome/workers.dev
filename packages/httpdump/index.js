addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function getSearch (_url) {
  const url = new URL(_url);
  let search = {};

  for (const [key, value] of url.searchParams) {
    search[key] = value;
  }

  return search;
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  let response = {
    method: request.method,
    search: getSearch(request.url),
  };

  if (response.method === 'POST') {
    response.body = await readRequestBody(request);
  }

  return new Response(
    JSON.stringify(response),
    {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    },
  )
}

/**
 * readRequestBody reads in the incoming request body
 * Use await readRequestBody(..) in an async function to get the string
 * 
 * THIS FUNCTION IS COPIED FROM CLOUDFLARE TEMPLATES
 * 
 * @param {Request} request the incoming request to read from
 */
async function readRequestBody(request) {
  const { headers } = request;

  const contentType = headers.get('content-type');

  if (contentType.includes('application/json')) {
    const body = await request.json();

    return body;
  } else if (contentType.includes('application/text')) {
    const body = await request.text();

    return body;
  } else if (contentType.includes('text/html')) {
    const body = await request.text();

    return body;
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    let body = {};

    for (let entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }

    return body;
  } else {
    let myBlob = await request.blob();
    let objectURL = URL.createObjectURL(myBlob);

    return objectURL;
  }
}

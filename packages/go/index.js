/**
 * Environment variables:
 * - FETCH_PATH - GitHub API URL to fetch the gist's info from
 * - FILE_NAME - name of the file in the gist
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const apiResponse = await fetch(
    FETCH_PATH,
    {
      headers: {
        'User-Agent':
          'umanghome',
      },
    },
  );

  const json = await apiResponse.json();

  const content = json.files[FILE_NAME].content;
  const paths = content.split('\n').map(row => {
    const split = row.split(' ').filter(Boolean);
    return {
      from: split[0],
      to: split[1]
    };
  });

  const url = new URL(request.url);
  const slug = url.pathname.slice(1);
  const to = (paths.find(path => path.from === slug) || {}).to;

  if (!to) {
    return new Response('404: Redirect not found', {
      statusCode: 404
    });
  }

  return Response.redirect(to, 302);
}

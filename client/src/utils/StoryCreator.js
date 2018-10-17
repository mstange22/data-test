import base64 from 'base-64';

const FAST_STORY_TEMPLATE_ID = 4;
const apiBasePath = 'http://192.168.1.16:8090/api';
const albumId = '8033'

const authInfo = { username: 'dave+local@dthera.com', password: 'dave'};

const authHeader = (auth) => {
  const { username, password } = auth;
  const encodedLogin = base64.encode(`${username}:${password}`);
  return `Basic ${encodedLogin}`;
};

const headers = (contentType) => { // eslint-disable-line arrow-body-style
  return {
    Authorization: authHeader(authInfo),
    'Content-Type': contentType,
  };
};

const createNewStoryApi = (storyTemplateId, name) => {
  const apiCall = `${apiBasePath}/v2/album.json/${albumId}/story`;
  console.log('apiCall:', apiCall);
  return fetch(apiCall, {
    method: 'PUT',
    headers: headers('application/json'),
    body: JSON.stringify({
      storyTemplateId,
      name,
    }),
  })
  .then(res => res.json())
  .catch (err => {
    console.log('in catch:' + err.message)
  });
};

const mediaLink = async (url, storyInstanceId, order) => {
  console.log('starting media link...');
  console.log(url, storyInstanceId);
  const apiCall = `${apiBasePath}/album.json/${albumId}/medialink`;

  try {
    const results = await fetch(apiCall, {
      method: 'PUT',
      headers: headers('application/json'),
      body: JSON.stringify({
        url,
        storyInstanceId,
      }),
    })

    const json = await results.json();
    json.order = order;
    return json;

  } catch(err) {
    console.log('in catch:' + err);
  }
};

const setStoryMediaOrder = async (storyInstanceId, mediaSortOrder) => {
  const body = {mediaSortOrder}
  try {
    const result = await fetch(`${apiBasePath}/v2/story.json/${storyInstanceId}`, {
      method: 'POST',
      headers: headers('application/json'),
      body: JSON.stringify(body),
    });
    const json = await result.json()
    return json;
  } catch(err) {
    console.log(err);
  }

}
/**
 * Takes an image list that is assumed to be:
 *  1. complete
 *   and
 *  2. in order
 * Will create a script with each image appearing for DURATION miliseconds
 */
const createStory = async (imageList, name) =>  {
  const storyTemplateId = FAST_STORY_TEMPLATE_ID;

  console.log('in createStory', imageList, name);

  // create story instance
  const response = await createNewStoryApi(storyTemplateId, name);
  console.log('in createStory, response:', response)
  const storyInstanceId = response.storyInstanceId;

  let order = 0;
  // 'link' all images into story instance
  const mediaLinkPromises = imageList.map(async image => {
    order ++;
    console.log(order);
    return await mediaLink(image.contentUrl, storyInstanceId, order);
  });

  Promise.all(mediaLinkPromises).then ( async mediaLinkResponses => {
    console.log("all images linked");
    console.log("response", mediaLinkResponses);
    const mediaIds = mediaLinkResponses
      .sort ((m1,m2) => m1 - m2)
      .map(m => m.mediaId);
    const result = await setStoryMediaOrder(storyInstanceId, mediaIds);
    console.log('result of reorder', result )

    mediaLinkResponses.forEach (mediaLinkResponse => {
      console.log(mediaLinkResponse);
    });
  });

  // set the image order on the story ? - may not be necessary
}

export default createStory;
import AtprotoAPI, { BskyAgent, RichText } from 'npm:@atproto/api';

export default async ({
  agent,
  rt,
  title,
  link,
  description,
  mimeType,
  image,
}: {
  agent: BskyAgent;
  rt: RichText;
  title: string;
  link: string;
  description: string;
  mimeType?: string;
  image?: Uint8Array;
}) => {
  const thumb = await (async () => {
    if (image instanceof Uint8Array && typeof mimeType === 'string') {
      // 画像をアップロード
      const uploadedImage = await agent.uploadBlob(image, {
        encoding: mimeType,
      });

      // 投稿オブジェクトに画像を追加
      return {
        $type: 'blob',
        ref: {
          $link: uploadedImage.data.blob.ref.toString(),
        },
        mimeType: uploadedImage.data.blob.mimeType,
        size: uploadedImage.data.blob.size,
      };
    }
  })();

  const postObj:
    & Partial<AtprotoAPI.AppBskyFeedPost.Record>
    & Omit<AtprotoAPI.AppBskyFeedPost.Record, 'createdAt'> = {
      $type: 'app.bsky.feed.post',
      text: rt.text,
      facets: rt.facets,
      embed: {
        $type: 'app.bsky.embed.external',
        external: {
          uri: link,
          title,
          description,
          thumb,
        },
      },
      langs: ['ja'],
    };

  if (!link) {
    delete postObj.embed;
  }

  console.log(JSON.stringify(postObj, null, 2));
  await agent.post(postObj);
  console.log('post to Bluesky');
};

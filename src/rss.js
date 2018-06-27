import Parser from "rss-parser";

// Initialize the RSS parser object
const parser = new Parser();

const load = callback => {
  (async () => {
    let feed = await parser.parseURL("https://www.reddit.com/r/EarthPorn/.rss");

    // Remove all entries that are not image posts
    callback(
      feed.items.filter(item => getImageURL(item.content)).map(item => {
        const image = getImageURL(item.content);
        return {
          ...item,
          image
        };
      })
    );
  })();
};

// Extracts the image URL from the feed entry's content string
const getImageURL = content => {
  const re = /https:\/\/[A-Za-z0-9.-\/]*.(jpg|jpeg|png)/gm;
  const matches = content.match(re);
  if (!matches) return false;
  return matches[matches.length - 1];
};

const parseEntry = post => {
  const isOC = post.title.match(/(\(|\[)([oO][cC])(\)|\])/) !== null;
  const url = getImageURL(post.content);

  // Remove both the [OC] and size tag [1920x1200]
  const title = post.title
    .replace(/(\(|\[)([oO][cC])(\)|\])/, "")
    .replace(/(\(|\[)([0-9pPxX]*( |)[xX×]( |)[0-9pPxX]*)(\)|\])/, "")
    .trim();

  return { isOC, url, title };
};

export default {
  load,
  parseEntry
};

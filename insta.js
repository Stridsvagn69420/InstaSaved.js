//imports
const path = require("path");
const os = require("os");
const fs = require("fs");
const { username, password, twoFA_key, downloadDir, delay } = require(path.join(os.homedir(), ".config/instasave/config.json"));
const { IgApiClient } = require("instagram-private-api");
const totp = require("totp-generator");
const fetch = import("node-fetch");
const delayMS = ms => new Promise((resolve, reject) => setTimeout(() => resolve(), ms));

//main function
function main(auth) {
    console.log(`[${new Date().toLocaleTimeString()}] Successfully logged in as ${auth.full_name} (@${auth.username})!`);
    fetchPosts(ig.feed.saved(auth.pk))
    .then(async posts => {
        var allposts = getURLs(posts);
        var eta = Math.floor(delay * allposts.length / 60000);
        console.log(`[${new Date().toLocaleTimeString()}] Starting download of ${allposts.length} images in ${posts.length} posts... (ETA: ${eta}m)`);
        for (i = 0; i < allposts.length; i++) {
            var imageURL = allposts[i].url;
            var filename = allposts[i].post;
            var filepath = path.join(downloadDir, filename);
            if (fs.existsSync(filepath)) {
                console.log(`[${i+1}] ${filename} already exists!`);
            } else {
                try {
                    var result = await fetch(imageURL);
                    var data = await result.buffer();
                    fs.writeFileSync(filepath, data);
                    console.log(`[${i+1}] Downloaded ${filename}!`);
                    await delayMS(delay);
                } catch (e) {
                    console.error(`[${new Date().toLocaleTimeString()}] An error occured on image No.${i+1}!`);
                    console.error(e);
                    setTimeout(() => {
                        fetch(imageURL).then(async x => {
                            var data = await x.buffer();
                            fs.writeFileSync(filepath, data);
                            console.log(`[${i+1}] Downloaded ${filename}!`);
                            await delayMS(delay);
                        }).catch(() => console.log(`[${i+1}] Could not download ${filename}...`));
                    }, delay * 2);
                }
            }
        }
        console.log(`[${new Date().toLocaleTimeString()}] Finished downloading all images! Exiting...`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
}

//create Instagram client and log in
const ig = new IgApiClient();
ig.state.generateDevice(username);
ig.account.login(username, password)
.then(main)
.catch(err => {
    const { username, two_factor_identifier } = err.response.body.two_factor_info;
    ig.account.twoFactorLogin({
        username,
        verificationCode: `${totp(twoFA_key)}`,
        twoFactorIdentifier: two_factor_identifier,
        verificationMethod: '0',
        trustThisDevice: '1'
    })
    .then(main)
    .catch(console.error);
});

//extra stuff nedded for the main function
/**
 * @param {Array<SavedPost>} rawPosts The result from fetchPosts() 
 * @returns {Array<formattedURLs>} All urls
*/
function getURLs(rawPosts) {
    console.log(`[${new Date().toLocaleTimeString()}] Reading URLS...`);
    var output = [];
    for (i = 0; i < rawPosts.length; i++) {
        for (int = 0; int < rawPosts[i].imagesLink.length; int++) {
            output.push({
                url: rawPosts[i].imagesLink[int],
                post: `${int}_${rawPosts[i].code}.jpg`
            });
        }
    }
    return output;
}
class formattedURLs {
    url;
    post;
}
/*
Disclaimer: Following code is entirely copied from https://github.com/pietrocaselani/Instagram-Saved-Posts and only one modification was made:
BEGIN
*/
class SavedPost {
    constructor(webLink, code, caption, imagesLink) {
      this.webLink = webLink;
      this.code = code;
      this.caption = caption;
      this.imagesLink = imagesLink;
    }
  }
const urlsFromCandidates = (candidates) => {
    let maxWidth = 0;
    let maxHeight = 0;
    let correctURL = '';
  
    candidates.forEach((candidate) => {
      if (candidate.width > maxWidth && candidate.height > maxHeight) {
        const { width, height, url } = candidate;
        maxWidth = width;
        maxHeight = height;
        correctURL = url;
      }
    });
  
    return [correctURL];
  };
  
  const urlsFromCarousel = (carousel_media) => {
    const urls = carousel_media.map((element) => {
      return urlsFromCandidates(element.image_versions2.candidates);
    });
  
    return [].concat(...urls);
  };
  
  const urlFromMedia = (media) => {
    const images = media.image_versions2;
  
    if (!images) {
      return urlsFromCarousel(media.carousel_media);
    }
  
    return urlsFromCandidates(images.candidates);
  };
  
  const postFromMedia = (media) => {
    const { code } = media;
    const webLink = `https://www.instagram.com/p/${code}`;
    const caption = media.caption ? media.caption.text : '';
    const imagesLink = urlFromMedia(media);
  
    return new SavedPost(webLink, code, caption, imagesLink);
  };
  
  
  const postsFromItems = (items) => {
    return items.map((item) => {
      return postFromMedia(item);
    });
  };
  
  const fetchPostsRecursive = async (savedFeed, posts) => {
    const items = await savedFeed.items();
    const allPosts = posts.concat(postsFromItems(items));
    return savedFeed.isMoreAvailable() ? fetchPostsRecursive(savedFeed, allPosts) : allPosts;
  };
  
  const fetchPosts = async (savedFeed) => {
    const allPosts = [];
    console.log(`[${new Date().toLocaleTimeString()}] Fetching posts... (This might take a while)`); //this is the only modification
    return fetchPostsRecursive(savedFeed, allPosts);
  };
/*
END
*/

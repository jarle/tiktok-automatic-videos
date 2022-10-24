# Automatically generate narrated videos from reddit posts 📽️


This was an experiment in generating fully automated TikTok videos based on stories posted to reddit.

_Over 100 videos_ were generated and posted to the account [ultimate_reddit_stories](https://www.tiktok.com/@ultimate_reddit_stories), usually generating lots of engagement.
Unfortunately TikTok is geo-bound, meaning that the videos I uploaded were not shown to a global audience (mainly Norway in my case).


## Automated steps

1. Fetch the 10 most popular stories from the subreddit [r/AITA](https://old.reddit.com/r/AmItheAsshole/)
1. Decide gender of poster for matching voice generation
1. Tokenize and split text into smaller phrases that can be displayed one at a time
1. Find a suitable emoji (if any) for the given phrase for illustration
1. Generate realistic voiceover using Google Cloud Wavenet Deep Learning voice models
1. Generate animated video using Remotion.js

Uploading the generated videos to TikTok is manual to avoid spamming.

## Example video

https://www.tiktok.com/@ultimate_reddit_stories/video/7107956244404587781

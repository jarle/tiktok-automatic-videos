#!/usr/bin/env bash

set -e
set -o nounset
set -o pipefail

script_dir="$(dirname $0)"
cd $script_dir

input_queue="$PWD/input.txt"
workspace_root="$PWD/generate-assets/workspace"
done_dir="$PWD/generate-assets/done"
bucket_root="gs://tiktok-video-assets"
bucket="$bucket_root/video-assets"
session="session-$(date +%Y-%m-%d_%H-%M-%S)"

mkdir -p $workspace_root

curl -A 'random' -v 'https://old.reddit.com/r/AmItheAsshole/top.json?t=week' | jq -r '.data.children[] | .data | .url' | grep -v update | grep -Pv "^$" | head -n100 | shuf -n2 > $input_queue
cat $input_queue
video_urls=$(cat $input_queue)

for video_url in $video_urls
do
(
    cd generate-assets/
    python3 run.py $video_url
)
done

for name in $(ls $workspace_root); do
    workdir="$workspace_root/$name"
    gsutil -m cp -r $workdir $bucket
    filename="$(cat $workdir/script.json | jq -r '.title | .filename')"
    video=$workdir/$filename
    export REMOTION_PROJECT_ID=$name
    (
        cd video-generator/
        npx remotion render src/index.tsx Main $video
        echo $video
        gsutil cp $video $bucket_root/videos/$session/
    )
    mv -f $workdir $done_dir
done

echo "Session done: $session"

echo > $input_queue

curl metadata.google.internal -i && poweroff
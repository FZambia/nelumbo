```
npm install
gulp
```

Preview:
```
ffmpeg -nostats -i "input.mp4" -vcodec copy -f rawvideo -y /dev/null 2>&1 | grep frame | awk '{split($0,a,"fps")}END{print a[1]}' | sed 's/.*= *//'
echo "4061 / 100" | bc
ffmpeg -loglevel panic -y -i "input.mp4" -frames 1 -q:v 1 -vf "select=not(mod(n\,40)),scale=-1:200,tile=100x1" video_preview.jpg
```

Lower bitrate:
```
ffmpeg -i input.mp4 -b:v 2048k -bufsize 64k output.mp4
```

Cut video:
```
ffmpeg -i input.mp4 -ss 00:00:30.0 -c copy -t 00:00:10.0 output.mp4
ffmpeg -i input.mp4 -ss 30 -c copy -t 10 output.mp4
```

Remove audio:
```
ffmpeg -i input.mp4 -vcodec copy -an output.mp4
```


Try cutting using keyframes
============================
http://stackoverflow.com/questions/21420296/how-to-extract-time-accurate-video-segments-with-ffmpeg
```
ffmpeg -i input.mp4 -force_key_frames 00:00:09,00:00:12 output.mp4
ffmpeg -ss 00:00:09 -i output.mp4 -t 00:00:23 -vcodec copy -acodec copy -y final.mp4
```

```
npm install
gulp
```

TODO: try cutting using keyframes
=================================
http://stackoverflow.com/questions/21420296/how-to-extract-time-accurate-video-segments-with-ffmpeg
```
ffmpeg -i input.mp4 -force_key_frames 00:00:09,00:00:12 output.mp4
ffmpeg -ss 00:00:09 -i output.mp4 -t 00:00:23 -vcodec copy -acodec copy -y final.mp4
```

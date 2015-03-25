Nelumbo
=======

Small weekend project to send beautiful messages with video background to your friends.

Built on top of Go language on server side and ReactJS on web browser side.

See Nelumbo [demo](https://nelumbo.herokuapp.com) on Heroku.

You can deploy your own installation on Heroku in one click:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/FZambia/nelumbo)

To run locally:

```
git clone https://github.com/FZambia/nelumbo.git nelumbo
cd nelumbo
go build
./nelumbo -w web/app/
```

Then visit [http://localhost:8000](http://localhost:8000)

Note, that this application not optimized for mobile browsers!

By default in-memory sqlite3 database will be used, but it's possible
to configure database driver and set DSN as this project uses [sqlx](https://github.com/jmoiron/sqlx)
library.

See available options using `-h` command-line option:

```
./nelumbo -h
```

It's possible to add other videos to your Nelumbo installation with some `ffmpeg` commands.

The sequencing is:

Step 1
------
First you need a video. Download it from somewhere or make your own...

If you need to cut a fragment from video here is a simple `ffmpeg` command:
```
ffmpeg -i input.mp4 -ss 00:00:30.0 -t 00:00:10.0 -vf "setpts=PTS-STARTPTS" output.mp4
```
or just:
```
ffmpeg -i input.mp4 -ss 10 -t 10 -vf "setpts=PTS-STARTPTS" output.mp4
```

If you need to change bitrate (2048 in example above):
```
ffmpeg -i input.mp4 -b:v 2048k -bufsize 64k output.mp4
```

To change video resolution:
```
ffmpeg -i input.mp4 -vf scale=1400:-1 output.mp4
```

If you need to remove audio stream:
```
ffmpeg -i input.mp4 -vcodec copy -an output.mp4
```

Step 2
------

Here we will generate a picture for video preview.

See how many frames in video:
```
ffmpeg -nostats -i "input.mp4" -vcodec copy -f rawvideo -y /dev/null 2>&1 | grep frame | awk '{split($0,a,"fps")}END{print a[1]}' | sed 's/.*= *//'
```

Let's suppose it returned 4061. Now calculate how many frames you need to skip to create 100 frame preview:

```
echo "4061 / 100" | bc
```

40 in this case. And now run command to create image:
```
ffmpeg -loglevel panic -y -i "input.mp4" -frames 1 -q:v 1 -vf "select=not(mod(n\,40)),scale=-1:200,tile=100x1" preview.jpg
```

Step 3
------

Copy video to `videos` public folder, copy preview to `previews` public folder of web application. And then
add new video to `videos` array in javascript file.

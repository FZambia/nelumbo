#!/bin/bash

if [ -z "$1" ]; then
    echo "usage: ./movie_preview.sh VIDEO [HEIGHT=120] [COLS=100] [ROWS=1] [OUTPUT]"
    exit
fi

MOVIE=$1
HEIGHT=$2
COLS=$3
ROWS=$4
OUT_FILENAME=$5

# get video name without the path and extension
MOVIE_NAME=`basename $MOVIE`
OUT_DIR=`pwd`

if [ -z "$HEIGHT" ]; then
    HEIGHT=120
fi
if [ -z "$COLS" ]; then
    COLS=100
fi
if [ -z "$ROWS" ]; then
    ROWS=1
fi
if [ -z "$OUT_FILENAME" ]; then
    OUT_FILENAME=`echo ${MOVIE_NAME%.*}_preview.jpg`
fi

OUT_FILEPATH=`echo $OUT_DIR/$OUT_FILENAME`

TOTAL_IMAGES=`echo "$COLS*$ROWS" | bc`

# get total number of frames in the video
# ffprobe is fast but not 100% reliable. It might not detect number of frames correctly!
NB_FRAMES=`ffprobe -show_streams "$MOVIE" 2> /dev/null | grep nb_frames | head -n1 | sed 's/.*=//'`

if [ "$NB_FRAMES" = "N/A" ]; then
    # as a fallback we'll use ffmpeg. This command basically copies this
    # video to /dev/null and it counts frames in the process.
    # It's slower (few seconds usually) than ffprobe but works everytime.
    NB_FRAMES=`ffmpeg -nostats -i "$MOVIE" -vcodec copy -f rawvideo -y /dev/null 2>&1 | grep frame | awk '{split($0,a,"fps")}END{print a[1]}' | sed 's/.*= *//'`
fi

# calculate offset between two screenshots, drop the floating point part
NTH_FRAME=`echo "$NB_FRAMES/$TOTAL_IMAGES" | bc`
echo "capture every ${NTH_FRAME}th frame out of $NB_FRAMES frames"

# make sure output dir exists
mkdir -p $OUT_DIR

FFMPEG_CMD="ffmpeg -loglevel panic -i \"$MOVIE\" -y -frames 1 -q:v 1 -vf \"select=not(mod(n\,$NTH_FRAME)),scale=-1:${HEIGHT},tile=${COLS}x${ROWS}\" \"$OUT_FILEPATH\""

eval $FFMPEG_CMD
echo $OUT_FILEPATH
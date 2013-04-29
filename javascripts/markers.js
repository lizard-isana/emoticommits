//
// Copyright (c) 2013 zunda <zunda at freeshell.org>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//

function markersBasename(time) {
  var basename = time.getUTCFullYear();
  var m = time.getUTCMonth() + 1;
  if (m < 10) {
    basename += "0";
  }
  basename += m;
  basename += time.getUTCDate();
  var h = time.getUTCHours();
  if (h < 10) {
    basename += "0";
  }
  basename += h;
  return basename
}

function loadMarkers(basename, markers) {
  var http = new XMLHttpRequest();
  http.open('GET', "markers/" + basename + ".json");
  http.send(null);
  loaded_markers_basename = basename;
  http.onreadystatechange = function() {
    if ((http.readyState == 4) && (http.status == 200)) {
      JSON.parse(http.responseText).forEach(function(marker) {
        if (page_time < new Date(marker.time)) {
          markers.queue.push(marker);
        }
      });
    };
  };
};

function addMarkers(page_time, wall_time, markers, conf, mapwindow) {
  while(
    markers.queue.length > 0 &&
    new Date(markers.queue[0].time) < page_time
  ) {
    var marker = markers.queue.shift();
    var icon = marker.icon;
    var size;
    var until;
    if (marker.emotion) {
      size = conf.emoticon.size;
      until = new Date(wall_time.getTime() + conf.emoticon.duration);
    } else {
      size = conf.avatar.size;
      icon += "?s=" + conf.avatar.size;
      until = new Date(wall_time.getTime() + conf.avatar.duration);
    };
    var pin = mapwindow.dropPin(marker.lat, marker.lng, icon, size, marker.url);
    if (marker.emotion) {
      markers.emoticons.push({until: until, marker: pin});
    } else {
      markers.avatars.push({until: until, marker: pin});
    }
  };
};
function removeMarkers(wall_time, markers, mapwindow) {
  while(markers.avatars.length > 0 && markers.avatars[0].until < wall_time) {
    mapwindow.removePin(markers.avatars.shift().marker);
  }
  while(markers.emoticons.length > 0 && markers.emoticons[0].until < wall_time) {
    mapwindow.removePin(markers.emoticons.shift().marker);
  }
}

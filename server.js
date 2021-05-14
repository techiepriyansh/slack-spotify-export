const express = require('express');
const cors = require('cors');
const request = require('request');
const querystring = require('querystring');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({
  extended: true
}));

const listener = app.listen(process.env.PORT, () => {
  console.log("We are listening on " + listener.address().port);
});

app.get('/', (req, res) => {
  res.status(200).send({hello: "hello"});
});


const spotifyRegex = /(https?:\/\/open\.spotify\.com\/track\/[^ ]*)/;
app.post('/api', (req, res) => {
  let {text} = req.body;
  let matches = text.match(spotifyRegex);
  if(matches) {
    let songLink = matches[1].split("|")[0];
    let songID = songLink.replace("https://open.spotify.com/track/", "").split("?")[0];
    console.log(songID);
    addToPlaylist(songID);
  }
});


// SPOTIFY STUFF //

let client_id = process.env.CID;
let client_secret = process.env.CS;

let refresh_token = process.env.REFRESH_TOKEN;
let access_token;

function addToPlaylist(songID) {
  // -- refresh token -- //
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    },
    json: true
  };
  
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      addToPlaylistHelper(songID);
    }
    else {
      console.log("Something went wrong!");
    }
  });
}

const playlist_id = "0qClQD4H9kw0KSC5NzAo0s";

function addToPlaylistHelper(songID) {
  let songUrl = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks?` + querystring.stringify({uris: `spotify:track:${songID}` });
  let options = {
    url: songUrl,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };
  request.post(options, function(error, response, body) {
    console.log(body);
  })
}

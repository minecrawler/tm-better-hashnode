import { default as API } from '../HashnodeAPI.js';

const username = API.getCurrentUser().username;

API
    .getUserInfo(username)
    .catch(err => {})
    .then(data => {
        document.querySelector(`div.score-wrap > a[href="/@${username}"] > p.big`).innerText = data.totalUpvotesReceived;
        document.querySelector(`div.score-wrap > a[href="/@${username}/followers"] > p.big`).innerText = data.numFollowers;
        document.querySelector(`div.score-wrap > a[href="/@${username}/following"] > p.big`).innerText = data.numFollowing;
    })
;

import { default as Util } from './Util.js';

export default {
    /**
     * Retrieve username and display name of current user
     *
     * @return {{username: string, displayName: string}}
     */
    getCurrentUser() {
        const nameEle = document.querySelector('.profile-name');

        return {
            displayName: nameEle.innerText,
            username: nameEle.href.toString().match(/\/@(.+)$/i)[1],
        };
    },

    /**
     * Retrieve user info by username
     *
     * @param {string} $username
     * @return {Promise.<Object, Object>}
     */
    getUserInfo($username) {
        return new Promise((res, rej) => {
            Util
                .callRESTEndpoint('profile/' + $username)
                .catch(rej)
                .then(data => res(JSON.parse(data).profile))
            ;
        });
    },
};
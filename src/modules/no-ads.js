// remove ads after 5s
setTimeout(function() {
    'use strict';

    document
        .querySelectorAll('.community-power.widget')
        .forEach(ele => ele.parentNode.removeChild(ele))
    ;
}, 5000);

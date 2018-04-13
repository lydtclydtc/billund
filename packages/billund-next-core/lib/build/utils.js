'use strict';

function waitFor(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms || 0);
    });
}

module.exports = {
    waitFor
};
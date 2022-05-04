let _ = require('lodash');

module.exports = function (stringUrl, matchingRecords) {
    let foundAnUnusedSlot = false,
        newIndex = -1,
        newStringUrl;

    if (matchingRecords.length === 0) {
        return stringUrl;
    }

    while (!foundAnUnusedSlot) {
        let didMatch = false;

        if (newIndex === -1) {
            newStringUrl = stringUrl;
        } else {
            newStringUrl = stringUrl + '-' + newIndex;
        }

        _.each(matchingRecords, function (matchingStringUrl) {
            if (matchingStringUrl.stringUrl.toLowerCase() === newStringUrl.toLowerCase()) {
                didMatch = true;
                return false;
            }
        });

        if (!didMatch) {
            foundAnUnusedSlot = true;
        }

        newIndex++;
    }

    stringUrl = newStringUrl;

    return stringUrl;
};
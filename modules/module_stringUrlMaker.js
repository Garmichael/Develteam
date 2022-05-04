module.exports = function (stringToUrl) {

    //swedish characters
    stringToUrl = stringToUrl.split('ä').join('a');
    stringToUrl = stringToUrl.split('Ä').join('A');
    stringToUrl = stringToUrl.split('ö').join('o');
    stringToUrl = stringToUrl.split('Ö').join('O');

    //special characters
    stringToUrl = stringToUrl.replace(/[^a-z0-9\s\-]/ig, '');

    //replace double space with single space
    stringToUrl = stringToUrl.replace(/\s\s/ig, '');

    //trim
    stringToUrl = stringToUrl.trim();

    //replace spaces with dashes
    stringToUrl = stringToUrl.split(' ').join('-');

    //replace multiple dashes with one dash
    stringToUrl = stringToUrl.replace(/\--+/ig, '-');

    //replace leading and trailing dashes
    stringToUrl = stringToUrl.replace(/^\-+|\-+$/ig, '');

    //cut down to 70 max characters
    stringToUrl = stringToUrl.substring(0, 70);

    //replace leading and trailing dashes again
    stringToUrl = stringToUrl.replace(/^\-|\-$/, '');

    if(stringToUrl === ''){
        stringToUrl = 'n';
    }

    return stringToUrl;
};
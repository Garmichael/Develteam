import Vue from 'vue';


Vue.filter('formatDate', function (datetime) {
    let monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "June", "July",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ],
        outputDate = new Date(datetime),
        hours = outputDate.getHours(),
        ampm = 'am',
        minutes;

    if (hours > 12) {
        ampm = 'pm';
        hours -= 12;
    }

    if (hours == 0) {
        hours = 12;
    }

    minutes = (outputDate.getMinutes() < 10 ? '0' : '') + outputDate.getMinutes();

    return monthNames[outputDate.getMonth()] +
        " " + outputDate.getDate() + ", " + outputDate.getFullYear() +
        ' at ' + hours + ':' + minutes + ampm;
});

Vue.filter('formatDateWithoutTime', function (datetime) {
    let monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "June", "July",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ],
        outputDate = new Date(datetime);

    return monthNames[outputDate.getMonth()] +
        " " + outputDate.getDate() + ", " + outputDate.getFullYear();
});

Vue.filter('formatDateWithoutTimeRelative', function (datetime) {
    let getDayOfYear = function (date) {
        let start = new Date(date.getFullYear(), 0, 0),
            diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000),
            oneDay = 1000 * 60 * 60 * 24;

        return Math.floor(diff / oneDay);
    };

    let monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "June", "July",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ],
        outputDate = new Date(datetime),
        rightNow = new Date();

    let daysAgo = getDayOfYear(rightNow) - getDayOfYear(outputDate);

    if (rightNow.getFullYear() === outputDate.getFullYear() && daysAgo === 0) {
        return "Today";
    } else if (rightNow.getFullYear() === outputDate.getFullYear() && daysAgo === 1) {
        return "Yesterday";
    } else if (rightNow.getFullYear() === outputDate.getFullYear() && daysAgo <= 3) {
        return daysAgo + " Days ago";
    } else {
        return monthNames[outputDate.getMonth()] + " " + outputDate.getDate() + ", " + outputDate.getFullYear();
    }
});

Vue.filter('formatDateWithJustTime', function (datetime) {
    let outputDate = new Date(datetime),
        hours = outputDate.getHours(),
        ampm = 'am',
        minutes;

    if (hours >= 12) {
        ampm = 'pm';
        hours -= 12;
    }

    if (hours == 0) {
        hours = 12;
    }

    minutes = (outputDate.getMinutes() < 10 ? '0' : '') + outputDate.getMinutes();

    return hours + ':' + minutes + ampm;
});

Vue.filter('formatDateCondensed', function (datetime) {
    let outputDate = new Date(datetime),
        hours = outputDate.getHours(),
        ampm = 'am',
        minutes;


    if (hours >= 12) {
        ampm = 'pm';
        hours -= 12;
    }

    if (hours === 0) {
        hours = 12;
    }

    minutes = (outputDate.getMinutes() < 10 ? '0' : '') + outputDate.getMinutes();

    return (outputDate.getMonth() + 1) + '.' + outputDate.getDate() + "." + outputDate.getFullYear() +
        ' | ' + hours + ':' + minutes + ampm;
});

Vue.filter('joinArray', function (input, subArr) {
    let output;
    let subArrCombined = [];

    if (subArr) {
        input.forEach(function (item) {
            subArrCombined.push(item[subArr])
        });
        output = subArrCombined.join(', ')
    } else {
        output = input.join(', ');
    }

    return output;
});

Vue.filter('markdown', function (content, mode) {
    let markdownHighlight = require('highlight.js');
    let markdownFontAwesome = require('ForkedModules/markdown-it-fontawesome');
    let markdownEmoji = require('markdown-it-emoji');
    let markdownTargetBlank = require('ForkedModules/markdown-it-target-blank');
    let disabled;

    if (mode && mode === 'limited') {
        disabled = ['heading']
    }

    let md = require('markdown-it')({
        html: false,
        linkify: true,
        breaks: true,
        typographer: true,
        highlight: function (str, lang) {
            if (lang && markdownHighlight.getLanguage(lang)) {
                try {
                    return markdownHighlight.highlight(lang, str).value;
                } catch (__) {
                }
            }

            return '';
        }
    })
        .use(markdownFontAwesome)
        .use(markdownEmoji)
        .use(markdownTargetBlank);

    if (disabled) {
        md.disable(disabled)
    }

    content = md.render(content);

    return (content);
});

Vue.filter('capitalizeFirstLetter', function (content) {
    if (!content) {
        return '';
    }

    return content.charAt(0).toUpperCase() + content.slice(1);
});
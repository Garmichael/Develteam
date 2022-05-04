'use strict';

let Plugin = require('markdown-it-regexp');

module.exports = function fontawesome_plugin(md) {
	md.use(Plugin(
		/\[icon:([\w\-]+)]/,
		function (match, utils) {
			return '<i class="fas fa-' + utils.escape(match[1]) + '"></i>';
		}
	));
};
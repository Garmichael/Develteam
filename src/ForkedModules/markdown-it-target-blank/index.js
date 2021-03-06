module.exports = function dtSmiley(md) {

    let defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
        let aIndex = tokens[idx].attrIndex('target');

        if (aIndex < 0) {
            tokens[idx].attrPush(['target', '_blank']); // add new attribute
        } else {
            tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
        }

        return defaultRender(tokens, idx, options, env, self);
    };
}
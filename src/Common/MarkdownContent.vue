<script>
    import Vue from 'vue';

    export default {
        name: 'MarkdownContent',
        props: ['content', 'classes'],

        render (createElement) {
            const children = [];
            let index = 0;

            this.content.replace(/\[youtube:(.*)\]/g, (segment, url, offset) => {
                if (offset > 0) {
                    children.push(createElement('div', {
                        domProps: {
                            innerHTML: this.$options.filters.markdown(this.content.slice(index, offset))
                        }
                    }))
                }

                children.push(createElement('fake-youtube', {
                    props: {
                        src: url,
                    },
                }));

                index = offset + segment.length;
                return segment
            });

            if (index < this.content.length) {
                children.push(createElement('div', {
                    domProps: {
                        innerHTML: this.$options.filters.markdown(this.content.slice(index))
                    }
                }));
            }

            return createElement('section', {
                'class': this.classes,
            }, children)
        }
    }
</script>
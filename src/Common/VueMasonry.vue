<script>
    export default {
        name: 'Masonry',
        props: ['minWidth', 'horizontalGutter', 'verticalGutter'],

        data(){
            return {
                parentWidth: 0
            }
        },

        mounted(){
            this.$nextTick(function () {
                this.setParentWidth()
            });

            window.addEventListener('resize', this.setParentWidth);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.setParentWidth)
        },

        methods: {
            setParentWidth(){
                this.$nextTick(function () {
                    this.parentWidth = this.$parent.$el ? this.$parent.$el.offsetWidth : 0;
                });
            }
        },

        render(createElement) {
            let masonryColumns = [],
                    columnCalculatedHeights = [],
                    reRender = false,
                    columnCount,
                    gutterCount,
                    columnWidth,
                    lastColumnWidth;

            if (!this.parentWidth || this.parentWidth === 0 || !this.$slots.default) {
                return;
            }

            gutterCount = Math.floor((this.parentWidth - this.minWidth) / (this.horizontalGutter + this.minWidth));
            columnCount = gutterCount + 1;

            if (columnCount <= 0) {
                columnCount = 1;
            }

            columnWidth = ((this.parentWidth - (gutterCount * this.horizontalGutter)) / columnCount) + this.horizontalGutter;
            columnWidth = Math.floor(columnWidth);

            if (columnCount === 1) {
                columnWidth = 0;
            } else {
                lastColumnWidth = 0;
            }

            for (let i = 0; i < columnCount; i++) {
                masonryColumns.push(
                        createElement('div', {
                            'class': 'vue-masonry-column',
                            style: {
                                'width': i < columnCount - 1 ? columnWidth + 'px' : lastColumnWidth + 'px',
                                'padding-right': i < columnCount - 1 ? this.horizontalGutter + 'px' : '0'
                            }
                        }));

                columnCalculatedHeights.push(0);
            }

            let i = 0;

            this.$slots.default.forEach(function (element) {
                if (!element.tag) {
                    return;
                }

                if (element.elm && element.elm.offsetHeight) {
                    let lowestColumn;
                    let lowestColumnHeight = Infinity;

                    for (let j = 0; j < masonryColumns.length; j++) {
                        if (columnCalculatedHeights[j] < lowestColumnHeight) {
                            lowestColumn = j;
                            lowestColumnHeight = columnCalculatedHeights[j];
                        }
                    }

                    if (masonryColumns[lowestColumn].children) {
                        masonryColumns[lowestColumn].children.push(element);
                    } else {
                        masonryColumns[lowestColumn].children = [element];
                    }

                    columnCalculatedHeights[lowestColumn] += element.elm.offsetHeight + this.verticalGutter;

                } else {
                    if (masonryColumns[i].children) {
                        masonryColumns[i].children.push(element);
                    } else {
                        masonryColumns[i].children = [element];
                    }

                    i++;
                    if (i >= masonryColumns.length) {
                        i = 0;
                    }
                    reRender = true;
                }
            }.bind(this));

            if (reRender) {
                this.$nextTick(function () {
                    this.$forceUpdate();
                });
            }


            return createElement(
                    'div',
                    {
                        'class': 'vue-masonry',
                    },
                    masonryColumns
            )
        }
    }
</script>

<style>
    .vue-masonry {
        padding: 0;
        vertical-align: top;
        display: flex;
        flex-wrap: wrap;
    }

    .vue-masonry-column {
        padding: 0;
        display: inline-block;
        vertical-align: top;
        margin: 0;
        flex-grow: 0;
        flex-shrink: 0;
    }

    .vue-masonry-column:last-child {
        flex-grow: 1;
        flex-shrink: 1;
    }
</style>
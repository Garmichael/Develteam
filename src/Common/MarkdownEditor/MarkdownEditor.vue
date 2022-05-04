<template>
    <div :class="['markdown-editor', classes]">
        <div class="options">
            <i @click="togglePreview()" :class="['fa fa-eye', {selected: previewVisible}]"></i>
            <i @click="toggleHelp()" :class="['fa fa-question-circle', {selected: formattingHelpVisible}]"></i>
        </div>

        <textarea title="content" :value="value" :placeholder="placeholder" @input="updateContent" :disabled="disabled"></textarea>

        <div v-if="formattingHelpVisible" class="formatting-help">
            <h1>Formatting Help</h1>
            <span class="rule">
                <span class="description">Description</span>
                <span class="syntax">Syntax</span>
            </span>
            <span class="rule">
                <span class="description">Headlines</span>
                <span class="syntax"># Largest Headline<br/>## Next Largest Headline<br/>###### Smallest Headline</span>
            </span>
            <span class="rule">
                <span class="description">Italics</span>
                <span class="syntax">*text*, _text_</span>
            </span>
            <span class="rule">
                <span class="description">Bold</span>
                <span class="syntax">**text**, __text__</span>
            </span>
            <span class="rule">
                <span class="description">Link</span>
                <span class="syntax">[Link Text](http://google.com)</span>
            </span>
            <span class="rule">
                <span class="description">Image</span>
                <span class="syntax">![Alt Text](http://image.jpg)</span>
            </span>
            <span class="rule">
                <span class="description">Linked Image</span>
                <span class="syntax">[Above Syntax for Image](http://google.com)</span>
            </span>
            <span class="rule">
                <span class="description">Youtube Clip</span>
                <span class="syntax">[youtube:VIDEO_ID]</span>
            </span>
            <span class="rule">
                <span class="description">Font Awesome Icon</span>
                <span class="syntax">[icon:icon-name]</span>
            </span>
            <span class="rule">
                <span class="description">Bullet List</span>
                <span class="syntax">* Item 1<br/>* Item 2</span>
            </span>
            <span class="rule">
                <span class="description">Numbered List</span>
                <span class="syntax">1. Item 1<br/>2. Item 2</span>
            </span>
            <span class="rule">
                <span class="description">Quote</span>
                <span class="syntax">&gt; Some text</span>
            </span>
            <span class="rule">
                <span class="description">Code Line</span>
                <span class="syntax">`let x = 7;`</span>
            </span>
            <span class="rule">
                <span class="description">Code Block</span>
                <span class="syntax">``` js|csharp|html<br/>let x = function({<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return 10;<br/>});<br/>```</span>
            </span>
            <span class="rule">
                <span class="description">Horizontal Line</span>
                <span class="syntax">---, ___, or *** on its own line</span>
            </span>
            <span class="rule">
                <span class="description">View more at: </span>
                <span class="syntax"><a href="http://assemble.io/docs/Cheatsheet-Markdown.html" target="_blank">http://assemble.io/docs/Cheatsheet-Markdown.html</a></span>
            </span>
        </div>

        <div v-if="previewVisible" class="preview">
            <h1>Preview</h1>
            <markdown-content classes="preview-content" :content="value"></markdown-content>
        </div>

    </div>
</template>


<script>
    import _ from 'lodash';

    export default {
        name: 'MarkdownEditor',
        props: ['value', 'placeholder', 'disabled', 'classes'],
        data(){
            return {
                previewVisible: false,
                formattingHelpVisible: false
            }
        },

        created() {
            let self = this;
        },

        methods: {
            togglePreview(){
                this.previewVisible = !this.previewVisible;
            },

            toggleHelp(){
                this.formattingHelpVisible = !this.formattingHelpVisible;
            },

            updateContent(e){
                this.content = e.target.value;
                this.$emit('input', e.target.value);
            }
        }
    }
</script>
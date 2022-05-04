<template>
    <ul v-if="maxPage">
        <li @click="switchToPage(1)"><span class="fas fa-angle-double-left"></span></li>
        <li @click="switchToPage(currentPage - 1)"><span class="fas fa-angle-left"></span></li>

        <li v-if="showLeftEllipses">...</li>
        <li v-for="pageNumber in maxPage" v-if="pageNumber >= minPageToShow && pageNumber <= maxPageToShow" :class="{selected: pageNumber === currentPage}" @click="switchToPage(pageNumber)">{{pageNumber}}</li>
        <li v-if="showRightEllipses">...</li>

        <li @click="switchToPage(currentPage + 1)"><span class="fas fa-angle-right"></span></li>
        <li @click="switchToPage(maxPage)"><span class="fas fa-angle-double-right"></span></li>
    </ul>
</template>


<script>
    export default {
        name: 'Pagination',
        props: ['currentPage', 'maxPage', 'spread'],
        data(){
            return {}
        },

        components: {},

        mounted() {

        },

        computed: {
            minPageToShow(){
                if (this.currentPage - this.spread <= 1) {
                    return 1;
                }

                return this.currentPage - this.spread;
            },
            maxPageToShow(){
                if (this.maxPage - this.spread < this.currentPage) {
                    return this.maxPage;
                }

                return this.currentPage + this.spread;
            },
            showLeftEllipses(){
                return this.minPageToShow > 1;
            },
            showRightEllipses(){
                return this.maxPageToShow < this.maxPage;
            }
        },

        methods: {
            switchToPage: function (newPage) {
                if (newPage <= 1) {
                    newPage = 1;
                }

                if (newPage >= this.maxPage) {
                    newPage = this.maxPage;
                }

                if (newPage !== this.currentPage) {
                    this.$emit('switchToPage', newPage)
                }
            }
        }
    }
</script>
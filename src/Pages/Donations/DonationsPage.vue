<template>
    <article id="donations-page">

        <div class="donation-pitch">

            <h1>Thank you for considering a donation to Devleteam!</h1>

            <p>Develteam is a labor of love, with no on-site ads or subscription fees. Your donation helps keep
                pay for operation costs, and encourages the continued development of features and fixes.</p>

            <p>Users who donate will also receive a special badge next to their name in chat and on their profile.</p>

            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
                <input type="hidden" name="cmd" value="_s-xclick"/>
                <input type="hidden" name="hosted_button_id" value="HHA7JMWKQ834E"/>

                <button class="button"
                        type="submit"
                        value="Donate on Paypal"
                        title="PayPal - The safer, easier way to pay online!"
                ><i class="fab fa-paypal"></i> Donate on Paypal
                </button>
            </form>

            <p class="disclaimer">Donations are manually entered into the database, so if you don't see your name right
                away, please be patient. If you wish to remain anonymous, leave a note on the Paypal form.</p>
        </div>

        <div class="donations-list">
            <div class="classifieds-type-selector">
                <label class="switch">
                    <button :class="[{active: sortType === 'amount'}]" @click="setSortType('amount')">Amount</button>
                    <button :class="[{active: sortType === 'date'}]" @click="setSortType('date')">Date</button>
                </label>
            </div>

            <div class="donor" v-for="donor in donors" :key="donor.id">
                <div class="avatar-container">
                    <avatar :profile-data="donor" profile-type="developer" size="large" :show-xp-info="false"></avatar>
                </div>

                <div class="donation-details">
                <span class="poster-alias">
                    <router-link :to="`/Developer/${donor.stringUrl}`">{{donor.alias}}</router-link>
                </span>

                    <span class="donation-amount">${{donor.amount}}</span>
                    <span class="donation-date">{{donor.date | formatDateWithoutTime}}</span>
                </div>
            </div>
        </div>

    </article>
</template>

<script>
    import _ from 'underscore';

    export default {
        name: "DonationsPage",

        data() {
            return {
                sortType: 'amount'
            }
        },

        computed: {
            donors() {
                let donors = this.$store.state.donationsModel.donors;

                return this.sortType === 'amount'
                    ? _.sortBy(donors, function (user) {
                        return user.amount;
                    }).reverse()
                    : _.sortBy(donors, function (user) {
                        return new Date(user.date);
                    }).reverse();
            }
        },

        methods: {
            setSortType(sortType) {
                this.sortType = sortType;
            }
        },
        mounted() {
            if (this.donors && this.donors.length === 0) {
                this.$store.dispatch('donationsPage/populateDonors');
            }
        }
    }
</script>
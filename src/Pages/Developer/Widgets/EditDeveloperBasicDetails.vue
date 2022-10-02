<template>
    <section id="edit-developer-basic-info">
        <div class="basic-info edit-container">
            <h1>Bio Details</h1>

            <label>Name</label>
            <div class="container">
                <div><input type="text" placeholder="First Name" v-model="formData.firstName"/></div>
                <div><input type="text" placeholder="Last Name" v-model="formData.lastName"/></div>
            </div>

            <label>Gender</label>
            <select v-model="formData.gender">
                <option value="nospec">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Nonbinary</option>
            </select>

            <label>Location</label>
            <input type="text" v-model="formData.location" v-gmaps-searchbox="userLocation">

            <label>Birthday</label>
            <label><input type="checkbox" v-model="formData.useBirth"/>Share Age</label>

            <div class="container">
                <select v-model="formData.birthMonth" :disabled="!formData.useBirth">
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>
                <select v-model="formData.birthDay" :disabled="!formData.useBirth">
                    <option v-for="n in 31" :value="n">{{n}}</option>
                </select>
                <select v-model="formData.birthYear" :disabled="!formData.useBirth">
                    <option v-for="year in birthYears" :value="year">{{year}}</option>
                </select>
            </div>

            <div class="buttons">
                <button class="button minor" @click.prevent="cancelChanges">Cancel</button>
                <button class="button" @click.prevent="submitChanges">Save</button>
            </div>
        </div>

    </section>
</template>


<script>
    export default {
        name: 'EditDeveloperBasicDetails',

        data() {
            return {
                formData: _.clone(this.$store.state.developerPageModel.developerInformation),
                userLocation: {
                    searchPlace: '',
                    location: {}
                }
            }
        },

        computed: {
            birthYears() {
                let years = [];
                for (let i = new Date().getFullYear(); i >= 1900; i--) {
                    years.push(i);
                }

                return years;
            }
        },

        methods: {
            cancelChanges() {
                this.$emit('doneEditing');
            },

            submitChanges() {
                this.$store.dispatch('developerPage/updateBasicInfo', {
                    developerId: this.formData.id,
                    firstName: this.formData.firstName,
                    lastName: this.formData.lastName,
                    gender: this.formData.gender,
                    location: this.formData.location,
                    locationLat: this.formData.locationLat,
                    locationLon: this.formData.locationLon,
                    useBirth: this.formData.useBirth,
                    birthMonth: this.formData.birthMonth,
                    birthDay: this.formData.birthDay,
                    birthYear: this.formData.birthYear
                });
            }
        },

        watch: {
            '$store.state.developerPageModel.developerInformation'() {
                this.formData = _.clone(this.$store.state.developerPageModel.developerInformation);
            },

            'userLocation.place.geometry.location.lat'() {
                this.formData.locationLat = this.userLocation.place.geometry.location.lat();
            },

            'userLocation.place.geometry.location.lng'() {
                this.formData.locationLon = this.userLocation.place.geometry.location.lng();
            },

            'userLocation': {
                handler: function (val, oldVal) {
                    if (this.formData.location) {
                        this.formData.location = this.userLocation.place.formatted_address
                    }
                },
                deep: true
            }
        },

        sockets: {
            'developerInformationUpdated'(data) {
                if (data.id === this.formData.id) {
                    this.$emit('doneEditing');
                }
            }
        }
    }
</script>
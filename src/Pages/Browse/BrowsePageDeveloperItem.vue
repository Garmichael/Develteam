<template>
    <article class="browse-item">
        <section class="avatar-container">
            <avatar :profile-data="details" profile-type="developer" size="large" :show-xp-info="true"></avatar>
        </section>

        <section class="overview">
            <span class="name"><router-link :to="'/Developer/' + details.stringUrl"><i
                    :class="[{'fas fa-user': true, 'online': developerIsOnline}]"></i> {{details.alias}}</router-link></span>
            <span class="last-online">Last Online: {{details.lastOnline | formatDate}}</span>
            <span class="last-online">Registered: {{details.registrationDate | formatDate}}</span>
            <span class="location">{{details.location}}</span>
            <span class="proximity" v-if="isLoggedIn">{{details.proximity}} miles away</span>
            <span v-if="details.lookingForGame" class="wants-to-collab">Wants to Join a Game Project</span>
        </section>

        <section class="about">
            <span class="text-roles">{{details.role}}</span>
            <ul class="official-roles">
                <li v-if="details.isDesigner">Designer</li>
                <li v-if="details.isArtist">Artist</li>
                <li v-if="details.isProgrammer">Programmer</li>
                <li v-if="details.isWriter">Writer</li>
                <li v-if="details.isMusician">Musician</li>
                <li v-if="details.isSfxArtist">SFX Artist</li>
                <li v-if="details.isTester">Tester</li>
                <li v-if="details.isProducer">Producer</li>
            </ul>

            <ul class="skills">
                <router-link
                        v-for="skill in details.skills"
                        v-if="skillList[skill]"
                        :to="'/Browse/Developers?seekingSkill=' + skillList[skill].id"
                        class="role-or-skill-item"
                >
                    {{skillList[skill].skill}}
                </router-link>
            </ul>
        </section>

        <!--<section class="media-samples">-->
        <!--<div v-if="details.hasMedia">-->
        <!--<div v-if="details.mediaType === 'Image'" class="media-sample">-->
        <!--<img :src="'https://www.develteam.com/userdata/media/' + details.mediaUrl"/>-->
        <!--</div>-->
        <!--</div>-->
        <!--</section>-->

    </article>
</template>

<script>
    export default {
        name: 'BrowsePageDeveloperItem',
        props: ['details'],
        computed: {
            skillList() {
                return this.$store.state.develteamDataModel.skills;
            },

            isLoggedIn() {
                return this.$store.state.loggedUserModel.isLoggedIn;
            },

            developerIsOnline() {
                let onlineUsers = this.$store.state.onlineUsersModel.onlineUsers;
                let developerIsOnline = false;
                let developerId = this.details.id;

                onlineUsers.forEach(function (onlineUser) {
                    if (onlineUser.id === developerId) {
                        developerIsOnline = true;
                    }
                });

                return developerIsOnline;
            }
        }
    }
</script>
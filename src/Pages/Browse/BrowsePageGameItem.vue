<template>
    <article class="browse-item">
        <section class="avatar-container">
            <avatar :profile-data="details" profile-type="game" size="large" :show-xp-info="true"></avatar>
        </section>

        <section class="overview">
            <span class="name"><router-link :to="'/Game/' + details.stringUrl"><i class="fas fa-gamepad"></i> {{details.alias}}</router-link></span>
            <span class="platform">Platform: {{details.platforms}}</span>
            <span class="genre">Genre: {{details.genres}}</span>
            <span class="rated">Rated {{details.rating}}</span>
            <span class="created">Created: {{details.created | formatDate}}</span>
            <span v-if="details.lookingForMembers" class="wants-to-collab">Currently Recruiting Developers</span>

            <ul v-if="details.lookingForMembers" class="seeking-roles">
                <li v-if="details.seekingDesigners">Designers</li>
                <li v-if="details.seekingArtists">Artists</li>
                <li v-if="details.seekingProgrammers">Programmers</li>
                <li v-if="details.seekingWriters">Writers</li>
                <li v-if="details.seekingMusicians">Musicians</li>
                <li v-if="details.seekingSfxArtists">SFX Artists</li>
                <li v-if="details.seekingTesters">Testers</li>
                <li v-if="details.seekingProducers">Producers</li>
            </ul>

            <ul v-if="details.skills.length > 0" class="seeking-roles">
                <li v-for="skill in details.skills">{{skillList[skill].skill}}</li>
            </ul>
        </section>


        <section class="about">
            <span>Members</span>
            <ul class="members">
                <li v-for="member in details.memberList">
                    <avatar :profile-data="member" profile-type="developer" size="small" :show-xp-info="true"></avatar>
                </li>
            </ul>
        </section>

        <!--<section class="media-samples">-->
            <!--<div style="width: 200px; height: 200px; background-color: lightblue"></div>-->
        <!--</section>-->
    </article>
</template>

<script>
    export default {
        name: 'BrowsePageGameItem',
        props: ['details'],

        computed: {
            skillList() {
                return this.$store.state.develteamDataModel.skills;
            }
        }
    }
</script>
<template>

    <section id="develteam-announcements">
        <h1>Develteam Announcements</h1>
        <div v-for="announcement in announcements">
            <h2>{{announcement.title}}</h2>
            <p>{{announcement.text}}</p>
            <p v-if="announcement.link">
                Go to the <router-link :to="announcement.link">{{announcement.linkText}}</router-link>
            </p>
        </div>
    </section>
</template>


<script>
    export default {
        name: 'DevelteamAnnouncements',
        data(){
            return {
                announcements: [
                    {
                        title: 'The Forums are Back!',
                        text: 'Come fill them up!',
                        link: '/Forums',
                        linkText: 'Develteam Game Dev Forums'
                    },
                    {
                        title: 'Develteam is in Beta',
                        text: 'Please Report your Bugs and Suggestions!',
                        link: '/BugsAndSuggestions',
                        linkText: 'Bugs and Suggestions Board'

                    }
                ]
            }
        }
    }
</script>
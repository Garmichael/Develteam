<template>
    <div class="pitch-mission-statement">

        <h1>Develteam Features</h1>

        <div class="features">
            <div v-for="feature in features" v-if="(depth === 'short' && feature.short) || (depth === 'long' && feature.long) || depth === 'both'" class="feature">
                <h1>{{feature.title}}</h1>
                <p v-html="feature.content"></p>
            </div>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'HomepagePitch',
        props: ['depth'],

        data(){
            return {
                features: [
                    {
                        title: 'About Develteam',
                        content: `Develteam is a community for Indie Game Developers, an <a href="/browse">indie game developer network</a>! Share your <a href="/browse">game developer portfolio</a>, post your game projects, find help making games, <a href="/browse">find game developers</a>, <a href="/browse">find a game development team</a>, chat about game design and development, post on forums, and browse a large collection of game tools and resources.`,
                        short: true,
                        long: false
                    },
                    {
                        title: `Game Dev Team Up!`,
                        content: `It can be hard to <a href="/browse">find game developers</a> to work with. You want to find the best of the best when you're <a href="/browse">looking for a game development team</a>, and that's where Develteam shines - You can browse <a href="/browse">game developer portfolio</a>s to gauge someone's work before even having to contact them! No where else on the internet makes it so easy when looking for game developers. You can also <a href="/browse">find a game development team</a> by browsing projects. You can join an indie game team that already exists, too. Form the perfect <a href="/browse">Indie team up and join an indie game team</a>!`,
                        short: true,
                        long: false
                    },
                    {
                        title: `Game Dev Tools and Assets`,
                        content: `Develteam hosts a user-generated and ranked list of tools and assets to help with your game development needs. There are tools to assist in <a href="/browse">game collaboration</a>, Programming, Audio Composition, and making any kind of Art, from pixel art to 3d modeling to animation. There is also a nice collection of assets for graphics, music, sound effects, and fonts.`,
                        short: true,
                        long: false
                    },
                    {
                        title: `Post Portfolios and get feedback`,
                        content: `Showing off your work is an important part of the gamedev process. Sometimes it's hard to tell if what you're doing is working or not, and sharing your Gamedev Portfolio with a community of like-minded hobbyists and professionals is a great way to get feedback on your progress. It also helps you <a href="/browse">find a game development team</a>. Don't be afraid to share your <a href="/browse">game developer portfolio</a>! It's hard to form an <a href="/browse">indie team up</a> without one.`,
                        short: true,
                        long: false
                    },
                    {
                        title: `Get Help`,
                        content: `Designing games and Programming games are both very challenging fields of study. When you run into problems, you can ask the members of this <a href="/browse">indie game developer network</a>. We have experts here in every field, whether you're looking for help with general game programming or a more specific engine like Unity Development, You'll be able to find someone who can help you figure out how best to design games. When indies team up for <a href="/browse">game collaboration</a>, everyone wins.`,
                        short: false,
                        long: true
                    },
                    {
                        title: `Game Project Management`,
                        content: `You can host your Game Projects on Develteam. By creating a Game Project, you can invite members to join. Each game developer on your team can have their role defined and can post to your feed, and share media. Each Game Project gets its own Chat Room and Forums. Forums can be private (only members can see and post) or public (anyone can join!).  Maybe you're what someone is looking for when <a href="/browse">looking for a game development team</a>!`,
                        short: false,
                        long: true
                    },
                    {
                        title: `Help Make Develteam Better`,
                        content: `Develteam is an active <a href="/browse">indie game developer network</a>, and the developers of this site go straight to you for suggestions and bugs. There's a forum set up to report bugs and request suggestions, with transparent and open progress and discussion. We like to cater to and <a href="/browse">find game developers</a> who really know what they want when looking for game developers.`,
                        short: false,
                        long: true
                    },
                    {
                        title: `The future!`,
                        content: `Develteam is always growing, with new features and interactions in the backlog for development. We can't wait to share the future with you! Enjoy our site and this community. We hope you'll take this journey with us. :) `,
                        short: false,
                        long: true
                    }
                ]
            }
        },

        mounted() {

        },

        computed: {
            prop(){
                return {};
            }
        },

        methods: {}
    }
</script>
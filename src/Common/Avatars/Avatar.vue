<template>

    <router-link :to="linkUrl" tag="a" :class="'avatar ' + size" :title="profileData.alias">

        <svg v-if="showXpInfo" viewPort="0 0 200 300" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <circle class="xp-ring"
                    :stroke-dasharray="xpRingProperties.strokeDasharray"
                    :cx="xpRingProperties.cx"
                    :cy="xpRingProperties.cy"
                    :r="xpRingProperties.r">
            </circle>
        </svg>

        <img class="inner" :src="imgSrc" :alt="altText" :title="altText"/>
        <div v-if="showXpInfo" class="level">{{profileData.xpLevelData.xpLevel}}</div>
    </router-link>

</template>


<script>
    export default {
        name: 'Avatar',
        props: ['profileData', 'xp', 'size', 'profileType', 'showXpInfo'],

        computed: {
            imgSrc() {
                return this.profileData.hasAvatar ?
                    `https://www.develteam.com/userdata/avatars/${this.profileType}_${this.profileData.id}.jpg` :
                    `https://www.develteam.com/userdata/avatar_blank_100.jpg`;
            },

            xpRingProperties() {
                const radiusChart = {
                    'very-small': 12,
                    'small': 17,
                    'large': 27,
                    'super-large': 72
                };
                const totalCircumference = radiusChart[this.size] * 2 * Math.PI;

                return this.profileData.xpLevelData ? {
                    strokeDasharray: (totalCircumference * this.profileData.xpLevelData.xpPercentGainedForThisLevel / 100) + ',10000',
                    cx: (radiusChart[this.size] + 10),
                    cy: (radiusChart[this.size] + 10),
                    r: radiusChart[this.size]
                } : {};
            },

            linkUrl() {
                return '/' + this.profileType.charAt(0).toUpperCase() + this.profileType.substring(1) + '/' + this.profileData.stringUrl
            },

            altText() {
                if (this.profileType === 'developer') {
                    return this.profileData.alias + ' Game Developer Portfolio';
                } else {
                    return this.profileData.alias + ' Game Project';
                }
            }
        },

        sockets: {
            'avatarUpdated'(data) {
                if (!this.profileData.hasAvatar && this.profileType === data.type && this.profileData.id === data.id) {
                    this.profileData.hasAvatar = true;
                }
            },

            'xpUpdated'(data) {
                if (this.profileType === data.profileType && this.profileData.id === data.profileId) {
                    this.profileData.xpLevelData = data.xpLevelData
                }
            }
        }
    }
</script>
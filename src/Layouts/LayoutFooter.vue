<template>
    <footer id="site-footer">
        <div class="site-links">
            <span><a href="https://www.stormgardenstudio.com" target="_blank">Copyright © 2020 Storm Garden Studio</a></span>
            <span><a href="https://www.facebook.com/Develteam/"><i class="fab fa-facebook"></i></a></span>
            <span><a href="https://twitter.com/Develteam"><i class="fab fa-twitter"></i></a></span>
            <span><router-link to="/TermsAndConditions">Terms</router-link></span>
            <span><router-link to="/PrivacyPolicy">Privacy</router-link></span>
        </div>
    </footer>
</template>

<script>
    export default {
        name: "LayoutFooter"
    }
</script>
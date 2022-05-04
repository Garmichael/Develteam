import LayoutFullWithChat from '../Layouts/LayoutFullWithChat.vue';
import FourOhFour from '../Common/FourOhFour.vue';
import MediaFeed from '../Pages/MediaFeed/MediaFeed.vue';
import BlogFeed from '../Pages/BlogFeed/BlogFeed.vue';
import ClassifiedsFeed from '../Pages/ClassifiedsFeed/Classifieds.vue';
import ClassifiedsNew from '../Pages/ClassifiedsFeed/ClassifiedsNew.vue';
import ClassifiedsEdit from '../Pages/ClassifiedsFeed/ClassifiedsEdit.vue';
import ResourcesPage from '../Pages/Resources/ResourcesPage.vue'
import InboxHome from '../Pages/Inbox/InboxHome.vue'
import BrowsePage from '../Pages/Browse/BrowsePage.vue'
import LoginPage from '../Pages/Login/LoginPage.vue'
import ForgotPasswordPage from '../Pages/Login/ForgotPassword.vue'
import UpdatePassword from '../Pages/Login/UpdatePassword.vue'
import RegisterPage from '../Pages/Register/Register.vue'

import DeveloperPage from '../Pages/Developer/DeveloperPage.vue'
import DeveloperFeed from '../Pages/Developer/SubPages/DeveloperFeed.vue'
import DeveloperSinglePost from '../Pages/Developer/SubPages/DeveloperSinglePost.vue'
import DeveloperPortfolio from '../Pages/Developer/SubPages/DeveloperPortfolio.vue'
import DeveloperConnections from '../Pages/Developer/SubPages/DeveloperConnections.vue'

import CreateGamePage from '../Pages/CreateGame/CreateGamePage.vue'
import GamePage from '../Pages/Game/GamePage.vue'
import GameFeed from '../Pages/Game/SubPages/GameFeed.vue'
import GameSinglePost from '../Pages/Game/SubPages/GameSinglePost.vue'
import GamePageFollowers from '../Pages/Game/SubPages/GameFollowers.vue'
import GameForums from '../Pages/Game/SubPages/GameForums.vue'
import GameMembers from '../Pages/Game/SubPages/GameMembers.vue'
import GameMedia from '../Pages/Game/SubPages/GameMedia.vue'

import InvitesPage from '../Pages/InvitationRequests/InvitesPage.vue'
import InviteToGame from '../Pages/InvitationRequests/InviteToGameForm.vue'
import RequestToJoin from '../Pages/InvitationRequests/RequestToJoinForm.vue'
import NotificationsPage from '../Pages/Notifications/Notifications.vue';
import BugsAndSuggestionsPage from '../Pages/BugsAndSuggestions/BugsAndSuggestions.vue';

import ForumsPage from '../Pages/Forums/ForumsPage.vue'
import TheBoard from '../Pages/TheBoard/TheBoardPage.vue'
import HomeDashboard from '../Pages/HomeDashboard/HomeDashboard.vue'

import DonationsPage from '../Pages/Donations/DonationsPage.vue'

import TermsPage from '../Pages/LegalPages/Terms.vue'
import PrivacyPage from '../Pages/LegalPages/PrivacyPolicy.vue'

export default function (options) {
    let VueRouter = options.VueRouter;

    const routes = [
        {
            path: '',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'homeDashboard'},
            children: [
                {
                    path: '',
                    component: HomeDashboard,
                    meta: {subNavRoute: 'homeDashboard'}
                }
            ]
        },
        {
            path: '/TermsAndConditions',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'terms'},
            children: [
                {
                    path: '',
                    component: TermsPage,
                    meta: {subNavRoute: 'terms'}
                }
            ]
        },
        {
            path: '/PrivacyPolicy',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'privacy'},
            children: [
                {
                    path: '',
                    component: PrivacyPage,
                    meta: {subNavRoute: 'privacy'}
                }
            ]
        },
        {
            path: '/Media',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'media'},
            children: [
                {
                    path: '',
                    component: MediaFeed,
                    meta: {subNavRoute: 'media'}
                }
            ]
        },
        {
            path: '/Classifieds',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'classifieds'},
            children: [
                {
                    path: '',
                    component: ClassifiedsFeed,
                    meta: {subNavRoute: 'classifieds'}
                },
                {
                    path: 'New',
                    component: ClassifiedsNew,
                    meta: {subNavRoute: 'classifieds'}
                },
                {
                    path: 'Edit/:id',
                    component: ClassifiedsEdit,
                    meta: {subNavRoute: 'classifieds'}
                }
            ]
        },
        {
            path: '/Donations',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'donations'},
            children: [
                {
                    path: '',
                    component: DonationsPage,
                    meta: {subNavRoute: 'donations'}
                }
            ]
        },
        {
            path: '/DevLogs',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'devlogs'},
            children: [
                {
                    path: '',
                    component: BlogFeed,
                    meta: {subNavRoute: 'devlogs'}
                }
            ]
        },
        {
            path: '/BugsAndSuggestions',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: BugsAndSuggestionsPage
                }
            ]
        },
        {
            path: '/inbox',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: InboxHome
                },
                {
                    path: ':id',
                    component: InboxHome
                }
            ]
        },
        {
            path: '/InviteToGame',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: InviteToGame
                },
                {
                    path: ':inviteMemberStringUrl',
                    component: InviteToGame
                },
                {
                    path: '*',
                    component: InviteToGame
                }
            ]
        },
        {
            path: '/RequestToJoin',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: RequestToJoin
                },
                {
                    path: ':requestGameStringUrl',
                    component: RequestToJoin
                },
                {
                    path: '*',
                    component: RequestToJoin
                }
            ]
        },
        {
            path: '/Invites',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: InvitesPage
                },
                {
                    path: '*',
                    component: InvitesPage
                }
            ]
        },
        {
            path: '/Notifications',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: NotificationsPage
                },
                {
                    path: '*',
                    component: NotificationsPage
                }
            ]
        },
        {
            path: '/Browse',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'browseDevs'},
            children: [
                {
                    path: '',
                    component: BrowsePage,
                    meta: {subNavRoute: 'browseDevs'}
                },
                {
                    path: 'Games',
                    component: BrowsePage,
                    meta: {subNavRoute: 'browseGames'}
                },
                {
                    path: '*',
                    component: BrowsePage,
                    meta: {subNavRoute: 'browseDevs'}
                }
            ]
        },
        {
            path: '/Forums/',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'forums'},
            children: [
                {
                    path: '',
                    component: ForumsPage,
                    meta: {subNavRoute: 'forums'}
                },
                {
                    path: ':category',
                    component: ForumsPage,
                    meta: {subNavRoute: 'forums'}
                },
                {
                    path: ':category/:forum',
                    component: ForumsPage,
                    meta: {subNavRoute: 'forums'}
                },
                {
                    path: ':category/:forum/:thread',
                    component: ForumsPage,
                    meta: {subNavRoute: 'forums'}
                },
                {
                    path: '*',
                    component: FourOhFour,
                    meta: {subNavRoute: 'forums'}
                }
            ]
        },
        {
            path: '/TheBoard/',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'theBoard'},
            children: [
                {
                    path: '',
                    component: TheBoard,
                    meta: {subNavRoute: 'theBoard'}
                },
                {
                    path: ':post',
                    component: TheBoard,
                    meta: {subNavRoute: 'theBoard'}
                },
                {
                    path: '*',
                    component: TheBoard,
                    meta: {subNavRoute: 'theBoard'}
                }
            ]

        },
        {
            path: '/Resources',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'resources'},
            children: [
                {
                    path: '',
                    component: ResourcesPage,
                    meta: {subNavRoute: 'resourcesDevTools'}
                },
                {
                    path: 'DevTools',
                    component: ResourcesPage,
                    meta: {subNavRoute: 'resourcesDevTools'},
                    children: [
                        {
                            path: '*',
                            component: ResourcesPage,
                            meta: {subNavRoute: 'resourcesDevTools'}
                        }
                    ]
                },
                {
                    path: 'Assets',
                    component: ResourcesPage,
                    meta: {subNavRoute: 'resourcesAssets'},
                    children: [
                        {
                            path: '*',
                            component: ResourcesPage,
                            meta: {subNavRoute: 'resourcesAssets'}
                        }
                    ]
                },
                {
                    path: '*',
                    component: ResourcesPage,
                    meta: {subNavRoute: 'resources'}
                }
            ]
        },
        // {
        //     path: '/Library',
        //     component: LayoutFullWithChat
        // },
        {
            path: '/Login',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: LoginPage
                },
                {
                    path: 'Forgot',
                    component: ForgotPasswordPage
                },
                {
                    path: 'Update/:keycode',
                    component: UpdatePassword
                }
            ]
        },
        {
            path: '/Register',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: RegisterPage
                }
            ]
        },
        {
            path: '/CreateNewGameProject',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: CreateGamePage
                }
            ]
        },
        {
            path: '/Game',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'},
            children: [
                {
                    path: '',
                    component: FourOhFour,
                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                },

                {
                    path: ':game/',
                    component: GamePage,
                    children: [
                        {
                            path: 'Post/:id',
                            component: GameSinglePost,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Media',
                            component: GameMedia,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Media/:album',
                            component: GameMedia,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Media/:album/:piece',
                            component: GameMedia,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Media/:album/:piece/:edit',
                            component: GameMedia,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Members',
                            component: GameMembers,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: 'Forums',
                            component: GameForums,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'},
                            children: [
                                {
                                    path: '',
                                    component: GameForums,
                                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                                },
                                {
                                    path: ':category',
                                    component: GameForums,
                                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                                },
                                {
                                    path: ':category/:forum',
                                    component: GameForums,
                                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                                },
                                {
                                    path: ':category/:forum/:thread',
                                    component: GameForums,
                                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                                },
                                {
                                    path: '*',
                                    component: FourOhFour,
                                    meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                                }
                            ]
                        },
                        {
                            path: 'Followers',
                            component: GamePageFollowers,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: '',
                            component: GameFeed,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        },
                        {
                            path: '*',
                            component: GameFeed,
                            meta: {subNavRoute: 'browseGames', noScrollTag: 'gamePage'}
                        }

                    ]
                }
            ]
        },
        {
            path: '/Developer',
            component: LayoutFullWithChat,
            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'},
            children: [
                {
                    path: '',
                    component: FourOhFour,
                    meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                },

                {
                    path: ':developer/',
                    component: DeveloperPage,
                    meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'},
                    children: [
                        {
                            path: 'Feed',
                            component: DeveloperFeed,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Post/:id',
                            component: DeveloperSinglePost,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Portfolio',
                            component: DeveloperPortfolio,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Portfolio/:album',
                            component: DeveloperPortfolio,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Portfolio/:album/:piece',
                            component: DeveloperPortfolio,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Portfolio/:album/:piece/:edit',
                            component: DeveloperPortfolio,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: 'Connections',
                            component: DeveloperConnections,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: '',
                            component: DeveloperFeed,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        },
                        {
                            path: '*',
                            component: DeveloperFeed,
                            meta: {subNavRoute: 'browseDevs', noScrollTag: 'devPage'}
                        }

                    ]
                }
            ]
        },
        {
            path: '*',
            component: LayoutFullWithChat,
            children: [
                {
                    path: '',
                    component: FourOhFour
                }
            ]
        }
    ];

    return new VueRouter({
        mode: 'history',
        routes: routes,
        scrollBehavior(to, from, savedPosition) {
            let shouldScrollToTop = !(to.meta.noScrollTag && from.meta.noScrollTag === to.meta.noScrollTag);

            if (!shouldScrollToTop) {
                return;
            }

            if (savedPosition) {
                return savedPosition
            } else {
                return {x: 0, y: 0}
            }
        }
    });
}
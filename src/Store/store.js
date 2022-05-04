import DevelteamDataModel from '../Common/develteamDataModel.js'
import OnlineUsersModel from '../Pages/OnlineUsers/onlineUserModel.js'
import LoggedUserModel from '../Common/LoggedUserModel.js'
import VotingWidgetModel from '../Common/VotingWidget/VotingWidgetModel.js'
import ResourcePageModel from '../Pages/Resources/ResourcesPageModel.js'
import BrowsePageModel from '../Pages/Browse/BrowsePageModel.js'
import LoginPageModel from '../Pages/Login/LoginPageModel.js'
import DeveloperPageModel from '../Pages/Developer/DeveloperPageModel.js'
import GamePageModel from '../Pages/Game/GamePageModel.js'
import MediasModel from '../Common/Media/MediasModel.js'
import FeedPostsModel from '../Common/FeedPosts/FeedPostsModel.js'
import ChatRoomModel from '../Pages/ChatRoom/ChatRoomModel.js'
import PrivateChatModel from '../Pages/PrivateChat/PrivateChatModel.js'
import InboxPageModel from '../Pages/Inbox/InboxPageModel.js'
import ForumsModel from '../Common/Forums/ForumsModel.js'
import InvitesModel from '../Pages/InvitationRequests/InvitesModel.js'
import NotificationsModel from '../Layouts/NotificationsModel.js'
import DonationsModel from '../Pages/Donations/DonationsPageModel.js'
import ClassifiedsModel from '../Pages/ClassifiedsFeed/ClassifiedsPageModel.js'

export default function (options) {
    let Vuex = options.Vuex;

    return new Vuex.Store({
        state: {},
        mutations: {},
        actions: {},
        getters: {},
        modules: {
            develteamDataModel: DevelteamDataModel,
            onlineUsersModel: OnlineUsersModel,
            loggedUserModel: LoggedUserModel,
            votingWidgetModel: VotingWidgetModel,
            resourcesPageModel: ResourcePageModel,
            browsePageModel: BrowsePageModel,
            loginPageModel: LoginPageModel,
            developerPageModel: DeveloperPageModel,
            feedPostsModel: FeedPostsModel,
            gamePageModel: GamePageModel,
            mediasModel: MediasModel,
            chatRoomModel: ChatRoomModel,
            privateChatModel: PrivateChatModel,
            inboxPageModel: InboxPageModel,
            forumsModel: ForumsModel,
            invitesModel: InvitesModel,
            notificationsModel: NotificationsModel,
            donationsModel: DonationsModel,
            classifiedsModel: ClassifiedsModel
        }
    });

}
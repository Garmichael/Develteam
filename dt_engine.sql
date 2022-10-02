-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 04, 2022 at 08:34 PM
-- Server version: 5.7.26
-- PHP Version: 7.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dt_engine`
--
CREATE DATABASE IF NOT EXISTS `dt_engine` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `dt_engine`;

-- --------------------------------------------------------

--
-- Table structure for table `badges_assigned`
--

DROP TABLE IF EXISTS `badges_assigned`;
CREATE TABLE IF NOT EXISTS `badges_assigned` (
  `receiver_id` int(12) NOT NULL,
  `receiver_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `badge_id` int(12) NOT NULL,
  KEY `receiver_id` (`receiver_id`),
  KEY `receivers` (`receiver_id`,`receiver_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `badges_definitions`
--

DROP TABLE IF EXISTS `badges_definitions`;
CREATE TABLE IF NOT EXISTS `badges_definitions` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `image` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bugs_and_suggestions`
--

DROP TABLE IF EXISTS `bugs_and_suggestions`;
CREATE TABLE IF NOT EXISTS `bugs_and_suggestions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(128) NOT NULL,
  `description` text NOT NULL,
  `type` varchar(32) NOT NULL,
  `status` varchar(32) NOT NULL,
  `poster_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `chatroom_messages`
--

DROP TABLE IF EXISTS `chatroom_messages`;
CREATE TABLE IF NOT EXISTS `chatroom_messages` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `chatRoomId` varchar(800) NOT NULL,
  `posterId` int(11) NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_system_message` int(1) DEFAULT '0',
  `system_message_type` varchar(32) NOT NULL DEFAULT '',
  `system_message_target_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `chatRoomId` (`chatRoomId`),
  KEY `timestamp` (`timestamp`),
  KEY `timestamp_2` (`timestamp`,`chatRoomId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `classifieds`
--

DROP TABLE IF EXISTS `classifieds`;
CREATE TABLE IF NOT EXISTS `classifieds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_type` varchar(12) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` text NOT NULL,
  `post_text` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `community_points`
--

DROP TABLE IF EXISTS `community_points`;
CREATE TABLE IF NOT EXISTS `community_points` (
  `receiver_id` int(11) NOT NULL,
  `receiver_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `target_id` int(11) NOT NULL,
  `target_type` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `trigger_user` int(11) NOT NULL,
  `point_type` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `inductee_id` int(11) NOT NULL,
  `spent_id` int(11) NOT NULL DEFAULT '0',
  `points` int(10) NOT NULL,
  KEY `user_id` (`receiver_id`),
  KEY `receiverCombo` (`receiver_id`,`receiver_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devteams`
--

DROP TABLE IF EXISTS `devteams`;
CREATE TABLE IF NOT EXISTS `devteams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `has_avatar` int(1) NOT NULL DEFAULT '0',
  `press_page` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `tags` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `looking_for_members` int(1) NOT NULL,
  `looking_desc` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `looking_roles` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `sample_id` int(11) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `devteams_members`
--

DROP TABLE IF EXISTS `devteams_members`;
CREATE TABLE IF NOT EXISTS `devteams_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `devteam_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `mod_level` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `positions` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `started` datetime NOT NULL,
  `ended` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
CREATE TABLE IF NOT EXISTS `donations` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `email_address` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `amount` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `errors`
--

DROP TABLE IF EXISTS `errors`;
CREATE TABLE IF NOT EXISTS `errors` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `error` text NOT NULL,
  `dbError` text NOT NULL,
  `query` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `loggedUserId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
CREATE TABLE IF NOT EXISTS `follows` (
  `leader_id` int(11) NOT NULL,
  `leader_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `follower_id` int(11) NOT NULL,
  PRIMARY KEY (`leader_id`,`follower_id`,`leader_type`),
  KEY `leader_id` (`leader_id`),
  KEY `follower_id` (`follower_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forgotten_passwords`
--

DROP TABLE IF EXISTS `forgotten_passwords`;
CREATE TABLE IF NOT EXISTS `forgotten_passwords` (
  `email` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `keycode` varchar(65) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forums_categories`
--

DROP TABLE IF EXISTS `forums_categories`;
CREATE TABLE IF NOT EXISTS `forums_categories` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `parent_id` int(11) NOT NULL,
  `title` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `private` int(1) NOT NULL DEFAULT '0',
  `rank` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forums_forums`
--

DROP TABLE IF EXISTS `forums_forums`;
CREATE TABLE IF NOT EXISTS `forums_forums` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` mediumtext COLLATE utf8_unicode_ci,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `locked` int(1) NOT NULL DEFAULT '0',
  `views` int(10) NOT NULL DEFAULT '0',
  `rank` int(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forums_moderators`
--

DROP TABLE IF EXISTS `forums_moderators`;
CREATE TABLE IF NOT EXISTS `forums_moderators` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mod_id` int(11) NOT NULL,
  `forum_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forums_posts`
--

DROP TABLE IF EXISTS `forums_posts`;
CREATE TABLE IF NOT EXISTS `forums_posts` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `poster_id` int(10) UNSIGNED DEFAULT NULL,
  `thread_starter` int(1) NOT NULL DEFAULT '0',
  `content` mediumtext COLLATE utf8_unicode_ci,
  `views` int(10) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  KEY `poster_id` (`poster_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `forums_threads`
--

DROP TABLE IF EXISTS `forums_threads`;
CREATE TABLE IF NOT EXISTS `forums_threads` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `poster_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` mediumtext COLLATE utf8_unicode_ci,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `pinned` int(1) NOT NULL DEFAULT '0',
  `locked` int(1) NOT NULL DEFAULT '0',
  `views` int(10) NOT NULL DEFAULT '0',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
CREATE TABLE IF NOT EXISTS `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `has_avatar` int(1) NOT NULL DEFAULT '0',
  `release_date` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `rating` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `seeking_roles` varchar(250) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `seeking_is` int(1) NOT NULL DEFAULT '0',
  `seeking_designers` int(1) NOT NULL DEFAULT '0',
  `seeking_programmers` int(1) NOT NULL DEFAULT '0',
  `seeking_artists` int(1) NOT NULL DEFAULT '0',
  `seeking_writers` int(1) NOT NULL DEFAULT '0',
  `seeking_musicians` int(1) NOT NULL DEFAULT '0',
  `seeking_sfx_artists` int(1) NOT NULL DEFAULT '0',
  `seeking_testers` int(1) NOT NULL DEFAULT '0',
  `seeking_producers` int(1) NOT NULL DEFAULT '0',
  `seeking_desc` varchar(250) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `sample_id` int(11) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `hasBanner` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `games_genres`
--

DROP TABLE IF EXISTS `games_genres`;
CREATE TABLE IF NOT EXISTS `games_genres` (
  `game_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL,
  PRIMARY KEY (`game_id`,`genre_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `games_members`
--

DROP TABLE IF EXISTS `games_members`;
CREATE TABLE IF NOT EXISTS `games_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `mod_level` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `positions` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `contract` int(1) NOT NULL DEFAULT '0',
  `started` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ended` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `game_id` (`game_id`),
  KEY `member_id` (`member_id`),
  KEY `ActiveOnId` (`game_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `games_platforms`
--

DROP TABLE IF EXISTS `games_platforms`;
CREATE TABLE IF NOT EXISTS `games_platforms` (
  `game_id` int(11) NOT NULL,
  `platform_id` int(11) NOT NULL,
  PRIMARY KEY (`game_id`,`platform_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `game_genres_list`
--

DROP TABLE IF EXISTS `game_genres_list`;
CREATE TABLE IF NOT EXISTS `game_genres_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `genre` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `game_platforms_list`
--

DROP TABLE IF EXISTS `game_platforms_list`;
CREATE TABLE IF NOT EXISTS `game_platforms_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(64) NOT NULL,
  `initiallyHidden` int(1) NOT NULL DEFAULT '0',
  `platform` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `game_skills`
--

DROP TABLE IF EXISTS `game_skills`;
CREATE TABLE IF NOT EXISTS `game_skills` (
  `game_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  KEY `index` (`game_id`,`skill_id`),
  KEY `mainindex` (`game_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `inbox`
--

DROP TABLE IF EXISTS `inbox`;
CREATE TABLE IF NOT EXISTS `inbox` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `reciever_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `subject` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `content` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `has_read` int(1) NOT NULL,
  `sender_delete` int(1) NOT NULL,
  `reciever_delete` int(1) NOT NULL,
  `created` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inbox_conv`
--

DROP TABLE IF EXISTS `inbox_conv`;
CREATE TABLE IF NOT EXISTS `inbox_conv` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mod_id` int(11) NOT NULL,
  `subject` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inbox_conv_messages`
--

DROP TABLE IF EXISTS `inbox_conv_messages`;
CREATE TABLE IF NOT EXISTS `inbox_conv_messages` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `conv_id` int(11) NOT NULL,
  `from_id` int(11) NOT NULL,
  `message` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `created` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `conv_id` (`conv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inbox_conv_users`
--

DROP TABLE IF EXISTS `inbox_conv_users`;
CREATE TABLE IF NOT EXISTS `inbox_conv_users` (
  `conv_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `has_read` int(1) NOT NULL DEFAULT '0',
  KEY `conv_id` (`conv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incubator_seeds`
--

DROP TABLE IF EXISTS `incubator_seeds`;
CREATE TABLE IF NOT EXISTS `incubator_seeds` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `title` text NOT NULL,
  `description` text NOT NULL,
  `string_url` varchar(32) NOT NULL,
  `starter_id` int(12) NOT NULL,
  `pinned` int(1) NOT NULL DEFAULT '0',
  `notaseed` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `lastupdate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `incubator_seed_comments`
--

DROP TABLE IF EXISTS `incubator_seed_comments`;
CREATE TABLE IF NOT EXISTS `incubator_seed_comments` (
  `id` int(12) NOT NULL AUTO_INCREMENT,
  `poster_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created` datetime NOT NULL,
  `seed_id` int(12) NOT NULL,
  `comment_parent_id` int(12) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `incubator_seed_interested`
--

DROP TABLE IF EXISTS `incubator_seed_interested`;
CREATE TABLE IF NOT EXISTS `incubator_seed_interested` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `seed_id` int(11) NOT NULL,
  `dev_id` int(11) NOT NULL,
  `dev_role` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `invitations_from_members`
--

DROP TABLE IF EXISTS `invitations_from_members`;
CREATE TABLE IF NOT EXISTS `invitations_from_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `position_titles` varchar(256) NOT NULL,
  `positions` varchar(256) NOT NULL,
  `response` varchar(32) NOT NULL DEFAULT 'noResponse',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `invitations_to_games`
--

DROP TABLE IF EXISTS `invitations_to_games`;
CREATE TABLE IF NOT EXISTS `invitations_to_games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `game_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `position_titles` varchar(256) NOT NULL,
  `positions` varchar(256) NOT NULL,
  `response` varchar(32) NOT NULL DEFAULT 'noResponse',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `ip2loc`
--

DROP TABLE IF EXISTS `ip2loc`;
CREATE TABLE IF NOT EXISTS `ip2loc` (
  `ip_from` int(10) UNSIGNED DEFAULT NULL,
  `ip_to` int(10) UNSIGNED DEFAULT NULL,
  `country_code` char(2) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country_name` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
  `region_name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city_name` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `zip_code` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  KEY `idx_ip_from` (`ip_from`),
  KEY `idx_ip_to` (`ip_to`),
  KEY `idx_ip_from_to` (`ip_from`,`ip_to`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
CREATE TABLE IF NOT EXISTS `media` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `rank` varchar(32) NOT NULL DEFAULT '0',
  `media_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `poster_id` int(10) NOT NULL,
  `poster_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `parent_id` int(10) NOT NULL,
  `parent_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `media_category` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `title` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `has_avatar` int(1) NOT NULL DEFAULT '0',
  `string_url` varchar(90) COLLATE utf8_unicode_ci NOT NULL,
  `media_url` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `media_id` int(11) NOT NULL,
  `preview_url` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `preview_id` int(11) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `poster_id` (`poster_id`,`poster_type`),
  KEY `parent_id` (`parent_id`,`parent_type`),
  KEY `media_category` (`media_category`),
  KEY `created` (`created`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_comments`
--

DROP TABLE IF EXISTS `notifications_comments`;
CREATE TABLE IF NOT EXISTS `notifications_comments` (
  `receiver_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_forum_posts`
--

DROP TABLE IF EXISTS `notifications_forum_posts`;
CREATE TABLE IF NOT EXISTS `notifications_forum_posts` (
  `receiver_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `forum_post_id` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_forum_threads`
--

DROP TABLE IF EXISTS `notifications_forum_threads`;
CREATE TABLE IF NOT EXISTS `notifications_forum_threads` (
  `receiver_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `forum_thread_id` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_media`
--

DROP TABLE IF EXISTS `notifications_media`;
CREATE TABLE IF NOT EXISTS `notifications_media` (
  `receiver_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `media_id` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_posts`
--

DROP TABLE IF EXISTS `notifications_posts`;
CREATE TABLE IF NOT EXISTS `notifications_posts` (
  `receiver_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `action` varchar(32) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `parent_type` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `poster_id` int(10) UNSIGNED DEFAULT NULL,
  `subposter_id` int(10) NOT NULL,
  `subposter_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `tags` mediumtext COLLATE utf8_unicode_ci,
  `title` varchar(128) COLLATE utf8_unicode_ci DEFAULT NULL,
  `content` mediumtext COLLATE utf8_unicode_ci,
  `pinned` int(1) NOT NULL DEFAULT '0',
  `published` int(1) NOT NULL DEFAULT '1',
  `created` datetime DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id_2` (`parent_id`,`parent_type`),
  KEY `subposter_id` (`subposter_id`,`subposter_type`),
  KEY `poster_id` (`poster_id`),
  KEY `type` (`type`),
  KEY `pinned` (`pinned`),
  KEY `published` (`published`),
  KEY `created` (`created`),
  KEY `modified` (`modified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `private_chat_active_convos`
--

DROP TABLE IF EXISTS `private_chat_active_convos`;
CREATE TABLE IF NOT EXISTS `private_chat_active_convos` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `openerId` int(11) NOT NULL,
  `partnerId` int(11) NOT NULL,
  `isOpen` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `private_chat_conversations`
--

DROP TABLE IF EXISTS `private_chat_conversations`;
CREATE TABLE IF NOT EXISTS `private_chat_conversations` (
  `chatId` varchar(24) NOT NULL,
  `userAId` int(11) NOT NULL,
  `userARead` int(1) NOT NULL DEFAULT '1',
  `userAClosed` int(1) NOT NULL DEFAULT '0',
  `userBId` int(11) NOT NULL,
  `userBRead` int(1) NOT NULL DEFAULT '0',
  `userBClosed` int(1) NOT NULL DEFAULT '0',
  UNIQUE KEY `chatId` (`chatId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `private_chat_messages`
--

DROP TABLE IF EXISTS `private_chat_messages`;
CREATE TABLE IF NOT EXISTS `private_chat_messages` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `partnerAId` int(11) NOT NULL,
  `partnerBId` int(11) NOT NULL,
  `hasBeenRead` int(1) NOT NULL DEFAULT '0',
  `message` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `partnerAId` (`partnerAId`),
  KEY `partnerBId` (`partnerBId`),
  KEY `partnerAId_2` (`partnerAId`,`partnerBId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `private_chat_messagess`
--

DROP TABLE IF EXISTS `private_chat_messagess`;
CREATE TABLE IF NOT EXISTS `private_chat_messagess` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` varchar(22) NOT NULL,
  `senderId` int(11) NOT NULL,
  `message` text NOT NULL,
  `timestamp` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `resource_links`
--

DROP TABLE IF EXISTS `resource_links`;
CREATE TABLE IF NOT EXISTS `resource_links` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resource_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `url` varchar(256) COLLATE utf8_unicode_ci NOT NULL,
  `category` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `resource_type` (`resource_type`,`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
CREATE TABLE IF NOT EXISTS `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` varchar(64) NOT NULL,
  `skill` varchar(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `passkey` varchar(128) COLLATE utf8_unicode_ci NOT NULL,
  `firstname` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `lastname` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `alias` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `string_url` varchar(80) COLLATE utf8_unicode_ci NOT NULL,
  `timezone` varchar(64) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `receive_emails` int(1) NOT NULL DEFAULT '1',
  `useBirth` int(1) NOT NULL DEFAULT '0',
  `birthmonth` int(2) NOT NULL DEFAULT '0',
  `birthday` int(2) NOT NULL DEFAULT '0',
  `birthyear` int(4) NOT NULL DEFAULT '0',
  `gender` varchar(16) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'nospec',
  `location` varchar(256) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `looking_for_devteam` int(1) NOT NULL DEFAULT '0',
  `looking_for_game` int(1) NOT NULL DEFAULT '0',
  `looking_desc` varchar(500) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `role` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `registrationdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `has_avatar` int(1) NOT NULL DEFAULT '0',
  `websites` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `work_history` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `education` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `resume_aboutme` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `resume_skills` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `resume_interests` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `resume_inspirations` mediumtext COLLATE utf8_unicode_ci NOT NULL,
  `is_designer` int(1) NOT NULL DEFAULT '0',
  `is_artist` int(1) NOT NULL DEFAULT '0',
  `is_writer` int(1) NOT NULL DEFAULT '0',
  `is_musician` int(1) NOT NULL DEFAULT '0',
  `is_programmer` int(1) NOT NULL DEFAULT '0',
  `is_sfx_artist` int(1) NOT NULL DEFAULT '0',
  `is_tester` int(1) NOT NULL DEFAULT '0',
  `is_producer` int(1) NOT NULL DEFAULT '0',
  `last_active` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `loc_lat` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `loc_lon` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0',
  `use_km` int(1) NOT NULL DEFAULT '0',
  `use_loc` int(1) NOT NULL DEFAULT '1',
  `sample_id` int(11) NOT NULL DEFAULT '0',
  `todo_edit_resume` int(1) NOT NULL DEFAULT '0',
  `banned` int(1) NOT NULL DEFAULT '0',
  `hasBanner` int(1) NOT NULL DEFAULT '0',
  `feed_layout_style` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'masonry',
  `chatroom_notification_sound` varchar(3) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'on',
  `sitemod_can_ban` int(1) NOT NULL DEFAULT '0',
  `caughtUpOnMedia` int(1) NOT NULL DEFAULT '0',
  `caughtUpOnDevlogs` int(1) NOT NULL DEFAULT '0',
  `caughtUpOnClassifieds` int(1) NOT NULL DEFAULT '0',
  `caughtUpOnForums` int(1) NOT NULL DEFAULT '0',
  `hasSkillFactored` int(1) NOT NULL DEFAULT '0',
  `receive_user_email` int(1) NOT NULL DEFAULT '1',
  `receive_promo_email` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `string_url` (`string_url`),
  KEY `alias` (`alias`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

DROP TABLE IF EXISTS `user_skills`;
CREATE TABLE IF NOT EXISTS `user_skills` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  KEY `index` (`user_id`,`skill_id`),
  KEY `mainindex` (`user_id`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `votes_binary`
--

DROP TABLE IF EXISTS `votes_binary`;
CREATE TABLE IF NOT EXISTS `votes_binary` (
  `parent_id` int(11) NOT NULL,
  `parent_type` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `voter_id` int(11) NOT NULL,
  `vote` int(11) NOT NULL,
  KEY `parent_id` (`parent_id`,`parent_type`),
  KEY `voter_id` (`voter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

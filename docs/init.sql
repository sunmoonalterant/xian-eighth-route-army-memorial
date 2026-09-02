-- 八路军西安办事处纪念馆数字宣传、预约与运营管理系统
-- MySQL 8.x 初始化脚本；本文件只创建结构和少量分类数据，不连接数据库。

CREATE DATABASE IF NOT EXISTS `xian_memorial`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `xian_memorial`;

CREATE TABLE IF NOT EXISTS `museum` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` VARCHAR(200) NOT NULL COMMENT '纪念馆标题',
  `summary` TEXT NULL COMMENT '简介摘要',
  `content` LONGTEXT NULL COMMENT '详细介绍',
  `cover_image` VARCHAR(500) NULL COMMENT '封面图片 URL',
  `source_url` VARCHAR(500) NULL COMMENT '官网资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_museum_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='纪念馆基本介绍';

CREATE TABLE IF NOT EXISTS `relic_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '升序展示序号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_relic_category_name` (`name`),
  KEY `idx_relic_category_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文物分类';

CREATE TABLE IF NOT EXISTS `relic` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(200) NOT NULL COMMENT '文物名称',
  `category_id` BIGINT UNSIGNED NULL COMMENT '文物分类 ID',
  `era` VARCHAR(100) NULL COMMENT '年代或时期',
  `summary` TEXT NULL COMMENT '列表摘要',
  `content` LONGTEXT NULL COMMENT '文物详情',
  `cover_image` VARCHAR(500) NULL COMMENT '封面图片 URL',
  `views` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `source_url` VARCHAR(500) NULL COMMENT '官网资料来源 URL',
  `source_api_id` VARCHAR(64) NULL COMMENT '官网或采集原始标识',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_relic_name` (`name`),
  KEY `idx_relic_category_status` (`category_id`, `status`),
  KEY `idx_relic_views` (`views`),
  CONSTRAINT `fk_relic_category` FOREIGN KEY (`category_id`) REFERENCES `relic_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='馆藏文物';

CREATE TABLE IF NOT EXISTS `exhibition` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` VARCHAR(200) NOT NULL COMMENT '展览标题',
  `category` VARCHAR(100) NULL COMMENT '展览类别',
  `summary` TEXT NULL COMMENT '列表摘要',
  `content` LONGTEXT NULL COMMENT '展览详情',
  `cover_image` VARCHAR(500) NULL COMMENT '封面图片 URL',
  `start_date` DATE NULL COMMENT '开展日期',
  `end_date` DATE NULL COMMENT '结束日期',
  `views` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `source_url` VARCHAR(500) NULL COMMENT '官网资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_exhibition_status_date` (`status`, `start_date`, `end_date`),
  KEY `idx_exhibition_views` (`views`),
  CONSTRAINT `chk_exhibition_dates` CHECK (`end_date` IS NULL OR `start_date` IS NULL OR `end_date` >= `start_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='陈列展览';

CREATE TABLE IF NOT EXISTS `article_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `sort` INT NOT NULL DEFAULT 0 COMMENT '升序展示序号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_article_category_name` (`name`),
  KEY `idx_article_category_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻分类';

CREATE TABLE IF NOT EXISTS `article` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` VARCHAR(255) NOT NULL COMMENT '新闻标题',
  `category_id` BIGINT UNSIGNED NULL COMMENT '新闻分类 ID',
  `summary` TEXT NULL COMMENT '列表摘要',
  `content` LONGTEXT NULL COMMENT '新闻正文',
  `cover_image` VARCHAR(500) NULL COMMENT '封面图片 URL',
  `views` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览次数',
  `published_at` DATETIME NULL COMMENT '发布时间',
  `source_url` VARCHAR(500) NULL COMMENT '官网资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_article_title` (`title`),
  KEY `idx_article_published_at` (`published_at`),
  KEY `idx_article_category_status` (`category_id`, `status`),
  CONSTRAINT `fk_article_category` FOREIGN KEY (`category_id`) REFERENCES `article_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='新闻资讯';

CREATE TABLE IF NOT EXISTS `person` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '人物名称',
  `birth_year` SMALLINT UNSIGNED NULL COMMENT '出生年份',
  `death_year` SMALLINT UNSIGNED NULL COMMENT '逝世年份',
  `summary` TEXT NULL COMMENT '人物摘要',
  `content` LONGTEXT NULL COMMENT '人物详情',
  `image` VARCHAR(500) NULL COMMENT '人物图片 URL',
  `source_url` VARCHAR(500) NULL COMMENT '资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_person_name` (`name`),
  KEY `idx_person_status` (`status`),
  CONSTRAINT `chk_person_years` CHECK (`death_year` IS NULL OR `birth_year` IS NULL OR `death_year` >= `birth_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史人物';

CREATE TABLE IF NOT EXISTS `history_event` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `year` SMALLINT UNSIGNED NULL COMMENT '时间轴年份',
  `event_date` DATE NULL COMMENT '事件日期',
  `title` VARCHAR(200) NOT NULL COMMENT '事件标题',
  `description` TEXT NULL COMMENT '时间轴短描述',
  `content` LONGTEXT NULL COMMENT '事件详情',
  `image` VARCHAR(500) NULL COMMENT '事件图片 URL',
  `source_url` VARCHAR(500) NULL COMMENT '资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_history_event_year` (`year`, `event_date`),
  KEY `idx_history_event_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='历史事件时间轴';

CREATE TABLE IF NOT EXISTS `courtyard` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '院落名称',
  `description` TEXT NULL COMMENT '导览短描述',
  `content` LONGTEXT NULL COMMENT '院落详情',
  `image` VARCHAR(500) NULL COMMENT '院落图片 URL',
  `position_x` DECIMAL(6,2) NULL COMMENT '地图横坐标百分比',
  `position_y` DECIMAL(6,2) NULL COMMENT '地图纵坐标百分比',
  `source_url` VARCHAR(500) NULL COMMENT '官网资料来源 URL',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '1正常，0隐藏/待审核',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_courtyard_name` (`name`),
  KEY `idx_courtyard_status` (`status`),
  CONSTRAINT `chk_courtyard_position` CHECK ((`position_x` IS NULL OR `position_x` BETWEEN 0 AND 100) AND (`position_y` IS NULL OR `position_y` BETWEEN 0 AND 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数字纪念馆院落热点';

CREATE TABLE IF NOT EXISTS `visit_schedule` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `visit_date` DATE NOT NULL COMMENT '参观日期',
  `period` ENUM('morning', 'afternoon') NOT NULL COMMENT '预约时段',
  `capacity` INT UNSIGNED NOT NULL COMMENT '时段总容量',
  `reserved_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '已占用名额',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1可预约，0停止预约',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_schedule_date_period` (`visit_date`, `period`),
  KEY `idx_schedule_date_status` (`visit_date`, `status`),
  CONSTRAINT `chk_schedule_capacity` CHECK (`capacity` >= 0 AND `reserved_count` >= 0 AND `reserved_count` <= `capacity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约时间段';

CREATE TABLE IF NOT EXISTS `reservation` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `reservation_no` VARCHAR(32) NOT NULL COMMENT '预约编号',
  `name` VARCHAR(50) NOT NULL COMMENT '预约人姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `id_card` CHAR(18) NOT NULL COMMENT '身份证号，生产环境应加密',
  `visit_date` DATE NOT NULL COMMENT '预约参观日期',
  `schedule_id` BIGINT UNSIGNED NOT NULL COMMENT '预约时间段 ID',
  `people_count` INT UNSIGNED NOT NULL COMMENT '预约人数',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0待确认，1成功，2取消，3核销，4过期',
  `active_phone` VARCHAR(20) GENERATED ALWAYS AS (CASE WHEN `status` IN (0, 1) THEN `phone` ELSE NULL END) STORED COMMENT '仅有效预约参与手机号+日期唯一约束',
  `remark` VARCHAR(500) NULL COMMENT '管理员备注',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reservation_no` (`reservation_no`),
  UNIQUE KEY `uk_reservation_active_phone_visit_date` (`active_phone`, `visit_date`),
  KEY `idx_reservation_schedule_status` (`schedule_id`, `status`),
  KEY `idx_reservation_visit_date` (`visit_date`),
  CONSTRAINT `chk_reservation_people_count` CHECK (`people_count` > 0),
  CONSTRAINT `fk_reservation_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `visit_schedule` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='参观预约记录';

CREATE TABLE IF NOT EXISTS `feedback` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(50) NULL COMMENT '留言人姓名或称呼',
  `phone` VARCHAR(20) NULL COMMENT '联系号码',
  `content` TEXT NOT NULL COMMENT '留言内容',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT '0未处理，1已处理',
  `reply` TEXT NULL COMMENT '管理员回复',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_feedback_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='游客留言';

CREATE TABLE IF NOT EXISTS `visit_log` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `visitor_id` VARCHAR(64) NOT NULL COMMENT '匿名访客标识',
  `page_path` VARCHAR(255) NOT NULL COMMENT '页面路径',
  `page_title` VARCHAR(255) NULL COMMENT '页面标题',
  `device_type` VARCHAR(30) NULL COMMENT '设备类型',
  `browser` VARCHAR(100) NULL COMMENT '浏览器类型',
  `referrer` VARCHAR(500) NULL COMMENT '来源页面',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  PRIMARY KEY (`id`),
  KEY `idx_visit_log_created_at` (`created_at`),
  KEY `idx_visit_log_visitor_created` (`visitor_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='匿名网站访问日志，不保存真实 IP 或个人证件信息';

CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` VARCHAR(100) NOT NULL COMMENT '管理员登录名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希，禁止明文',
  `role` ENUM('admin', 'editor') NOT NULL DEFAULT 'editor' COMMENT '管理员角色',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '1启用，0停用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_admin_username` (`username`),
  KEY `idx_admin_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='后台管理员';

-- 仅插入基础分类，不插入真实预约、个人信息或管理员明文密码。
INSERT INTO `relic_category` (`name`, `sort`) VALUES
  ('文件文献', 10),
  ('历史照片', 20),
  ('生活用品', 30),
  ('其他', 99)
ON DUPLICATE KEY UPDATE `sort` = VALUES(`sort`);

INSERT INTO `article_category` (`name`, `sort`) VALUES
  ('馆内动态', 10),
  ('公告通知', 20),
  ('教育活动', 30),
  ('专题活动', 40)
ON DUPLICATE KEY UPDATE `sort` = VALUES(`sort`);

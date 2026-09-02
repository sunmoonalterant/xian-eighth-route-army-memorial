-- D7 最小数据库迁移：仅允许同一手机号同一天存在一条有效预约。
-- 有效状态：0 待确认、1 预约成功；已取消/已核销/已过期不阻止再次预约。

ALTER TABLE `reservation`
  ADD COLUMN `active_phone` VARCHAR(20)
  GENERATED ALWAYS AS (CASE WHEN `status` IN (0, 1) THEN `phone` ELSE NULL END) STORED
  AFTER `phone`;

ALTER TABLE `reservation`
  DROP INDEX `uk_reservation_phone_visit_date`,
  ADD UNIQUE KEY `uk_reservation_active_phone_visit_date` (`active_phone`, `visit_date`);

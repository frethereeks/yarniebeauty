-- CreateTable
CREATE TABLE `YnBeautyUser` (
    `id` VARCHAR(191) NOT NULL,
    `firstname` VARCHAR(50) NOT NULL,
    `lastname` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `password` VARCHAR(100) NULL,
    `provider` ENUM('local', 'google') NOT NULL DEFAULT 'local',
    `image` VARCHAR(500) NULL,
    `imagePublicId` VARCHAR(255) NULL,
    `status` ENUM('Pending', 'Active', 'Suspended') NOT NULL DEFAULT 'Pending',
    `emailVerifyToken` VARCHAR(255) NULL,
    `emailVerifyExpires` DATETIME(3) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `resetToken` VARCHAR(255) NULL,
    `resetExpires` DATETIME(3) NULL,
    `defaultAddress` TINYTEXT NULL,
    `defaultCity` VARCHAR(100) NULL,
    `defaultState` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `YnBeautyUser_email_key`(`email`),
    INDEX `YnBeautyUser_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyUserRole` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('SuperAdmin', 'Admin', 'Customer', 'Student') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyUserRole_userId_idx`(`userId`(36)),
    UNIQUE INDEX `YnBeautyUserRole_userId_role_key`(`userId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyAdminPermission` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('MANAGE_PRODUCTS', 'MANAGE_ORDERS', 'MANAGE_COHORTS', 'MANAGE_ENROLMENTS', 'MANAGE_CONTACT_MESSAGES', 'SEND_BROADCASTS', 'VIEW_LOGGER') NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `grantedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyAdminPermission_userId_idx`(`userId`(36)),
    UNIQUE INDEX `YnBeautyAdminPermission_userId_type_key`(`userId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyNotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailOrderUpdates` BOOLEAN NOT NULL DEFAULT true,
    `emailCohortReminders` BOOLEAN NOT NULL DEFAULT true,
    `emailBroadcasts` BOOLEAN NOT NULL DEFAULT true,
    `inAppNotifications` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `YnBeautyNotificationPreference_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `status` ENUM('Available', 'Unavailable') NOT NULL DEFAULT 'Available',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `YnBeautyCategory_slug_key`(`slug`(100)),
    INDEX `YnBeautyCategory_slug_idx`(`slug`(120)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyProduct` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `qtyAvailable` INTEGER NOT NULL DEFAULT 0,
    `popular` BOOLEAN NOT NULL DEFAULT false,
    `description` MEDIUMTEXT NULL,
    `status` ENUM('Available', 'Unavailable') NOT NULL DEFAULT 'Unavailable',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `YnBeautyProduct_slug_key`(`slug`(100)),
    INDEX `YnBeautyProduct_categoryId_idx`(`categoryId`(36)),
    INDEX `YnBeautyProduct_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `secureUrl` VARCHAR(500) NOT NULL,
    `publicId` VARCHAR(255) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productId` VARCHAR(191) NOT NULL,

    INDEX `YnBeautyProductImage_productId_idx`(`productId`(36)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyCart` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `YnBeautyCart_userId_key`(`userId`(36)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyCartItem` (
    `id` VARCHAR(191) NOT NULL,
    `cartId` VARCHAR(36) NOT NULL,
    `productId` VARCHAR(36) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `YnBeautyCartItem_cartId_idx`(`cartId`(36)),
    UNIQUE INDEX `YnBeautyCartItem_cartId_productId_key`(`cartId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyOrder` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(30) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` TINYTEXT NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) NOT NULL,
    `notes` TINYTEXT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Processing', 'OutForDelivery', 'Delivered', 'Returned', 'Cancelled') NOT NULL DEFAULT 'Pending',
    `totalPrice` DECIMAL(12, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedById` VARCHAR(191) NULL,

    UNIQUE INDEX `YnBeautyOrder_orderNumber_key`(`orderNumber`(30)),
    INDEX `YnBeautyOrder_userId_idx`(`userId`(36)),
    INDEX `YnBeautyOrder_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyOrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(150) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyOrderItem_orderId_idx`(`orderId`(36)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyOrderStatusHistory` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('Pending', 'Confirmed', 'Processing', 'OutForDelivery', 'Delivered', 'Returned', 'Cancelled') NOT NULL,
    `note` TINYTEXT NULL,
    `changedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyOrderStatusHistory_orderId_idx`(`orderId`(36)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyCohort` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` MEDIUMTEXT NOT NULL,
    `image` VARCHAR(500) NULL,
    `imagePublicId` VARCHAR(255) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `duration` VARCHAR(50) NOT NULL,
    `modePolicy` ENUM('PhysicalOnly', 'OnlineOnly', 'StudentChoice') NOT NULL DEFAULT 'StudentChoice',
    `status` ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    `capacity` INTEGER NULL,
    `startReminderSentAt` DATETIME(3) NULL,
    `endReminderSentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `creatorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `YnBeautyCohort_slug_key`(`slug`),
    INDEX `YnBeautyCohort_status_idx`(`status`),
    INDEX `YnBeautyCohort_startDate_idx`(`startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyCohortEnrolment` (
    `id` VARCHAR(191) NOT NULL,
    `cohortId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `mode` ENUM('Physical', 'Online') NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('AwaitingPayment', 'Active', 'Completed', 'Withdrawn') NOT NULL DEFAULT 'AwaitingPayment',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `YnBeautyCohortEnrolment_userId_idx`(`userId`(36)),
    INDEX `YnBeautyCohortEnrolment_cohortId_idx`(`cohortId`(36)),
    UNIQUE INDEX `YnBeautyCohortEnrolment_cohortId_userId_key`(`cohortId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyPayment` (
    `id` VARCHAR(191) NOT NULL,
    `purpose` ENUM('ORDER', 'ENROLMENT') NOT NULL,
    `orderId` VARCHAR(36) NULL,
    `enrolmentId` VARCHAR(36) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `method` ENUM('PAYSTACK') NOT NULL DEFAULT 'PAYSTACK',
    `reference` VARCHAR(100) NOT NULL,
    `paystackRef` VARCHAR(100) NULL,
    `authorizationUrl` VARCHAR(500) NULL,
    `channel` VARCHAR(50) NULL,
    `notes` TINYTEXT NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `YnBeautyPayment_orderId_key`(`orderId`(36)),
    UNIQUE INDEX `YnBeautyPayment_enrolmentId_key`(`enrolmentId`(36)),
    UNIQUE INDEX `YnBeautyPayment_reference_key`(`reference`),
    INDEX `YnBeautyPayment_status_idx`(`status`),
    INDEX `YnBeautyPayment_reference_idx`(`reference`(100)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyMessage` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(36) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyMessageRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `messageId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyMessageRecipient_userId_idx`(`userId`(36)),
    UNIQUE INDEX `YnBeautyMessageRecipient_messageId_userId_key`(`messageId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyBroadcast` (
    `id` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(36) NOT NULL,
    `audience` ENUM('ALL', 'CUSTOMERS', 'STUDENTS') NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `body` TEXT NOT NULL,
    `recipientCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyContact` (
    `id` VARCHAR(191) NOT NULL,
    `fullname` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `status` ENUM('Unread', 'Read', 'Deleted') NOT NULL DEFAULT 'Unread',
    `userId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `YnBeautyContact_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `YnBeautyLogger` (
    `id` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'LOGIN', 'ROLE_CHANGE', 'BROADCAST') NOT NULL,
    `table` VARCHAR(50) NOT NULL,
    `message` LONGTEXT NOT NULL,
    `actorId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `YnBeautyLogger_actorId_idx`(`actorId`(36)),
    INDEX `YnBeautyLogger_table_idx`(`table`(50)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `YnBeautyUserRole` ADD CONSTRAINT `YnBeautyUserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyAdminPermission` ADD CONSTRAINT `YnBeautyAdminPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyAdminPermission` ADD CONSTRAINT `YnBeautyAdminPermission_grantedById_fkey` FOREIGN KEY (`grantedById`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyNotificationPreference` ADD CONSTRAINT `YnBeautyNotificationPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyProduct` ADD CONSTRAINT `YnBeautyProduct_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `YnBeautyCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyProduct` ADD CONSTRAINT `YnBeautyProduct_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyProductImage` ADD CONSTRAINT `YnBeautyProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `YnBeautyProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCart` ADD CONSTRAINT `YnBeautyCart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCartItem` ADD CONSTRAINT `YnBeautyCartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `YnBeautyCart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCartItem` ADD CONSTRAINT `YnBeautyCartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `YnBeautyProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyOrder` ADD CONSTRAINT `YnBeautyOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyOrder` ADD CONSTRAINT `YnBeautyOrder_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `YnBeautyUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyOrderItem` ADD CONSTRAINT `YnBeautyOrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `YnBeautyOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyOrderItem` ADD CONSTRAINT `YnBeautyOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `YnBeautyProduct`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyOrderStatusHistory` ADD CONSTRAINT `YnBeautyOrderStatusHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `YnBeautyOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCohort` ADD CONSTRAINT `YnBeautyCohort_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCohortEnrolment` ADD CONSTRAINT `YnBeautyCohortEnrolment_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `YnBeautyCohort`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyCohortEnrolment` ADD CONSTRAINT `YnBeautyCohortEnrolment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyPayment` ADD CONSTRAINT `YnBeautyPayment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `YnBeautyOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyPayment` ADD CONSTRAINT `YnBeautyPayment_enrolmentId_fkey` FOREIGN KEY (`enrolmentId`) REFERENCES `YnBeautyCohortEnrolment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyMessage` ADD CONSTRAINT `YnBeautyMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyMessageRecipient` ADD CONSTRAINT `YnBeautyMessageRecipient_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `YnBeautyMessage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyMessageRecipient` ADD CONSTRAINT `YnBeautyMessageRecipient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyBroadcast` ADD CONSTRAINT `YnBeautyBroadcast_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyContact` ADD CONSTRAINT `YnBeautyContact_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `YnBeautyLogger` ADD CONSTRAINT `YnBeautyLogger_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `YnBeautyUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

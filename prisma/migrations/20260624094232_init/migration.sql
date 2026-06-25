-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `max_teachers` INTEGER NULL,
    `max_students` INTEGER NULL,
    `max_exams_per_month` INTEGER NULL,
    `price_min` DECIMAL(12, 2) NULL,
    `price_max` DECIMAL(12, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    `features` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subscription_plans_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `establishments` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `acronym` VARCHAR(191) NOT NULL,
    `type` ENUM('university_public', 'university_private', 'engineering_school', 'bts', 'technical_highschool', 'other') NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `official_email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `establishment_subscriptions` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `plan_id` CHAR(36) NOT NULL,
    `status` ENUM('trial', 'active', 'expired', 'cancelled') NOT NULL DEFAULT 'trial',
    `is_simulated` BOOLEAN NOT NULL DEFAULT true,
    `trial_ends_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `current_period_end` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `establishment_subscriptions_establishment_id_idx`(`establishment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_years` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `academic_years_establishment_id_idx`(`establishment_id`),
    UNIQUE INDEX `academic_years_establishment_id_label_key`(`establishment_id`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classes` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `track` VARCHAR(191) NULL,
    `level` VARCHAR(191) NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `classes_establishment_id_idx`(`establishment_id`),
    UNIQUE INDEX `classes_establishment_id_name_key`(`establishment_id`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'teacher', 'student') NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_identifier_key`(`identifier`),
    INDEX `users_establishment_id_idx`(`establishment_id`),
    INDEX `users_role_idx`(`role`),
    UNIQUE INDEX `users_establishment_id_email_key`(`establishment_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_profiles` (
    `user_id` CHAR(36) NOT NULL,
    `function` VARCHAR(191) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_profiles` (
    `user_id` CHAR(36) NOT NULL,
    `subjects` VARCHAR(191) NULL,
    `function` VARCHAR(191) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_profiles` (
    `user_id` CHAR(36) NOT NULL,
    `matricule` VARCHAR(191) NOT NULL,
    `class_id` CHAR(36) NULL,
    `academic_year_id` CHAR(36) NULL,

    INDEX `student_profiles_class_id_idx`(`class_id`),
    INDEX `student_profiles_academic_year_id_idx`(`academic_year_id`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `teacher_id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'published', 'in_progress', 'finished', 'archived') NOT NULL DEFAULT 'draft',
    `start_at` DATETIME(3) NULL,
    `duration_minutes` INTEGER NULL,
    `access_delay_minutes` INTEGER NOT NULL DEFAULT 0,
    `correction_mode` ENUM('auto', 'manual') NOT NULL DEFAULT 'auto',
    `access_code` VARCHAR(191) NULL,
    `max_incidents_before_close` INTEGER NOT NULL DEFAULT 2,
    `timezone` VARCHAR(191) NULL,
    `published_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `ended_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `exams_access_code_key`(`access_code`),
    INDEX `exams_establishment_id_idx`(`establishment_id`),
    INDEX `exams_teacher_id_idx`(`teacher_id`),
    INDEX `exams_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_classes` (
    `exam_id` CHAR(36) NOT NULL,
    `class_id` CHAR(36) NOT NULL,

    PRIMARY KEY (`exam_id`, `class_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` CHAR(36) NOT NULL,
    `exam_id` CHAR(36) NOT NULL,
    `type` ENUM('code', 'qcm') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `statement` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `judge0_language_id` INTEGER NULL,
    `points` DECIMAL(6, 2) NOT NULL DEFAULT 0,
    `correction_mode` ENUM('auto', 'manual') NOT NULL DEFAULT 'auto',
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exercises_exam_id_idx`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unit_tests` (
    `id` CHAR(36) NOT NULL,
    `exercise_id` CHAR(36) NOT NULL,
    `input` VARCHAR(191) NULL,
    `expected_output` VARCHAR(191) NOT NULL,
    `weight` DECIMAL(6, 2) NOT NULL DEFAULT 1,
    `is_hidden` BOOLEAN NOT NULL DEFAULT false,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `unit_tests_exercise_id_idx`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qcm_questions` (
    `id` CHAR(36) NOT NULL,
    `exercise_id` CHAR(36) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `answer_type` ENUM('single', 'multiple') NOT NULL DEFAULT 'single',
    `points` DECIMAL(6, 2) NOT NULL DEFAULT 0,
    `explanation` VARCHAR(191) NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `qcm_questions_exercise_id_idx`(`exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qcm_choices` (
    `id` CHAR(36) NOT NULL,
    `question_id` CHAR(36) NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `is_correct` BOOLEAN NOT NULL DEFAULT false,
    `order_index` INTEGER NOT NULL DEFAULT 0,

    INDEX `qcm_choices_question_id_idx`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_participations` (
    `id` CHAR(36) NOT NULL,
    `exam_id` CHAR(36) NOT NULL,
    `student_id` CHAR(36) NOT NULL,
    `status` ENUM('connected', 'waiting', 'in_progress', 'submitted', 'excluded', 'absent') NOT NULL DEFAULT 'connected',
    `is_completed` BOOLEAN NOT NULL DEFAULT false,
    `connected_at` DATETIME(3) NULL,
    `ip_address` VARCHAR(191) NULL,
    `waiting_room_entered_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NULL,
    `submitted_at` DATETIME(3) NULL,
    `submission_reason` ENUM('manual', 'timer', 'excluded') NULL,
    `auto_score` DECIMAL(6, 2) NULL,
    `manual_score` DECIMAL(6, 2) NULL,
    `final_score` DECIMAL(6, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exam_participations_exam_id_idx`(`exam_id`),
    INDEX `exam_participations_student_id_idx`(`student_id`),
    INDEX `exam_participations_status_idx`(`status`),
    UNIQUE INDEX `exam_participations_exam_id_student_id_key`(`exam_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` CHAR(36) NOT NULL,
    `participation_id` CHAR(36) NOT NULL,
    `exercise_id` CHAR(36) NOT NULL,
    `source_code` VARCHAR(191) NULL,
    `language` VARCHAR(191) NULL,
    `auto_score` DECIMAL(6, 2) NULL,
    `manual_score` DECIMAL(6, 2) NULL,
    `final_score` DECIMAL(6, 2) NULL,
    `comment` VARCHAR(191) NULL,
    `submitted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `submissions_participation_id_idx`(`participation_id`),
    INDEX `submissions_exercise_id_idx`(`exercise_id`),
    UNIQUE INDEX `submissions_participation_id_exercise_id_key`(`participation_id`, `exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission_test_results` (
    `id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NOT NULL,
    `unit_test_id` CHAR(36) NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `actual_output` VARCHAR(191) NULL,
    `stderr` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `time_ms` INTEGER NULL,
    `memory_kb` INTEGER NULL,
    `executed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `submission_test_results_submission_id_idx`(`submission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qcm_answers` (
    `id` CHAR(36) NOT NULL,
    `submission_id` CHAR(36) NOT NULL,
    `question_id` CHAR(36) NOT NULL,
    `choice_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `qcm_answers_submission_id_idx`(`submission_id`),
    UNIQUE INDEX `qcm_answers_submission_id_question_id_choice_id_key`(`submission_id`, `question_id`, `choice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `code_autosaves` (
    `id` CHAR(36) NOT NULL,
    `participation_id` CHAR(36) NOT NULL,
    `exercise_id` CHAR(36) NOT NULL,
    `content` VARCHAR(191) NULL,
    `saved_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `code_autosaves_participation_id_exercise_id_key`(`participation_id`, `exercise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `incidents` (
    `id` CHAR(36) NOT NULL,
    `participation_id` CHAR(36) NOT NULL,
    `type` ENUM('fullscreen_exit', 'tab_switch', 'session_close', 'network_issue', 'clipboard_paste') NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration_seconds` INTEGER NULL,
    `payload` VARCHAR(191) NULL,
    `metadata` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `incidents_participation_id_occurred_at_idx`(`participation_id`, `occurred_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `login_attempts` (
    `id` CHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `establishment_id` CHAR(36) NULL,
    `ip_address` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL,
    `attempted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_attempts_identifier_attempted_at_idx`(`identifier`, `attempted_at`),
    INDEX `login_attempts_ip_address_attempted_at_idx`(`ip_address`, `attempted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_code_attempts` (
    `id` CHAR(36) NOT NULL,
    `exam_id` CHAR(36) NULL,
    `identifier` VARCHAR(191) NULL,
    `ip_address` VARCHAR(191) NULL,
    `success` BOOLEAN NOT NULL,
    `attempted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `exam_code_attempts_exam_id_identifier_attempted_at_idx`(`exam_id`, `identifier`, `attempted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_activity_logs` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `actor_user_id` CHAR(36) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NULL,
    `entity_id` CHAR(36) NULL,
    `old_value` JSON NULL,
    `new_value` JSON NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_activity_logs_establishment_id_created_at_idx`(`establishment_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `csv_imports` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NOT NULL,
    `actor_user_id` CHAR(36) NULL,
    `filename` VARCHAR(191) NULL,
    `total_rows` INTEGER NOT NULL DEFAULT 0,
    `imported_count` INTEGER NOT NULL DEFAULT 0,
    `rejected_count` INTEGER NOT NULL DEFAULT 0,
    `error_report` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` CHAR(36) NOT NULL,
    `establishment_id` CHAR(36) NULL,
    `recipient_user_id` CHAR(36) NULL,
    `recipient_email` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `channel` VARCHAR(191) NOT NULL DEFAULT 'email',
    `subject` VARCHAR(191) NULL,
    `body` VARCHAR(191) NULL,
    `status` ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_recipient_user_id_created_at_idx`(`recipient_user_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_admins` (
    `id` CHAR(36) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_admins_identifier_key`(`identifier`),
    UNIQUE INDEX `platform_admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `establishment_subscriptions` ADD CONSTRAINT `establishment_subscriptions_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `establishment_subscriptions` ADD CONSTRAINT `establishment_subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_years` ADD CONSTRAINT `academic_years_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `classes` ADD CONSTRAINT `classes_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_profiles` ADD CONSTRAINT `admin_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_classes` ADD CONSTRAINT `exam_classes_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_classes` ADD CONSTRAINT `exam_classes_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exercises` ADD CONSTRAINT `exercises_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `unit_tests` ADD CONSTRAINT `unit_tests_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qcm_questions` ADD CONSTRAINT `qcm_questions_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qcm_choices` ADD CONSTRAINT `qcm_choices_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `qcm_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_participations` ADD CONSTRAINT `exam_participations_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_participations` ADD CONSTRAINT `exam_participations_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_participation_id_fkey` FOREIGN KEY (`participation_id`) REFERENCES `exam_participations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_test_results` ADD CONSTRAINT `submission_test_results_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submission_test_results` ADD CONSTRAINT `submission_test_results_unit_test_id_fkey` FOREIGN KEY (`unit_test_id`) REFERENCES `unit_tests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qcm_answers` ADD CONSTRAINT `qcm_answers_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qcm_answers` ADD CONSTRAINT `qcm_answers_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `qcm_questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qcm_answers` ADD CONSTRAINT `qcm_answers_choice_id_fkey` FOREIGN KEY (`choice_id`) REFERENCES `qcm_choices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `code_autosaves` ADD CONSTRAINT `code_autosaves_participation_id_fkey` FOREIGN KEY (`participation_id`) REFERENCES `exam_participations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `code_autosaves` ADD CONSTRAINT `code_autosaves_exercise_id_fkey` FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_participation_id_fkey` FOREIGN KEY (`participation_id`) REFERENCES `exam_participations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `login_attempts` ADD CONSTRAINT `login_attempts_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_code_attempts` ADD CONSTRAINT `exam_code_attempts_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_activity_logs` ADD CONSTRAINT `admin_activity_logs_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_activity_logs` ADD CONSTRAINT `admin_activity_logs_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `csv_imports` ADD CONSTRAINT `csv_imports_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `csv_imports` ADD CONSTRAINT `csv_imports_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_establishment_id_fkey` FOREIGN KEY (`establishment_id`) REFERENCES `establishments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_recipient_user_id_fkey` FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

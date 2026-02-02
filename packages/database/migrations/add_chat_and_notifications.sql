-- Sprint 4: Chat & Notifications System Migration
-- Run this manually in your PostgreSQL database

-- Create enums
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
CREATE TYPE "NotificationType" AS ENUM (
  'NEW_JOB',
  'NEW_QUOTE',
  'QUOTE_ACCEPTED',
  'QUOTE_REJECTED',
  'JOB_STARTED',
  'JOB_COMPLETED',
  'PAYMENT_RECEIVED',
  'NEW_MESSAGE',
  'NEW_REVIEW',
  'SYSTEM'
);

-- Create conversations table
CREATE TABLE "conversations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "job_id" TEXT NOT NULL UNIQUE,
  "client_id" TEXT NOT NULL,
  "professional_id" TEXT,
  "last_message_at" TIMESTAMP(3),
  "last_message_preview" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id")
    REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "conversations_professional_id_fkey" FOREIGN KEY ("professional_id")
    REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create messages table
CREATE TABLE "messages" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversation_id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "content" TEXT NOT NULL,
  "file_url" TEXT,
  "file_name" TEXT,
  "file_size" INTEGER,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id")
    REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id")
    REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create notifications table
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "job_id" TEXT,
  "quote_id" TEXT,
  "data" JSONB,
  "read_at" TIMESTAMP(3),
  "clicked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for conversations
CREATE INDEX "conversations_client_id_idx" ON "conversations"("client_id");
CREATE INDEX "conversations_professional_id_idx" ON "conversations"("professional_id");

-- Create indexes for messages
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- Create indexes for notifications
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

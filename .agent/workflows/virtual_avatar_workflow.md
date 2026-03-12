---
description: Technical Workflow for the Virtual Avatar Creation and Management System
---

# Technical Workflow: Virtual Avatar System

This workflow details the technical steps for creating and managing a Virtual Avatar, from user input to content generation.

## 1. Onboarding & Asset Ingestion
**User Action:** User navigates to `/onboarding`.
1.  **Channel Connect:** App fetches YouTube data to `youtube_channels` table.
2.  **Video Upload:**
    *   User uploads `calibration_video.mp4` (Max 500MB).
    *   **System:** Uploads to Supabase Storage bucket `avatar-assets`.
    *   **DB:** Creates entry in `avatars` table with `status: 'uploading'`.
3.  **Audio Upload:**
    *   User uploads `voice_sample.wav` or selects "Extract from Video".
    *   **System:** Uploads to Supabase Storage bucket `avatar-assets`.

## 2. Processing (Async Job)
**Trigger:** `api/avatar/train` is called after successful uploads.
1.  **Validation:** Check video length (2-5 mins) and audio clarity.
2.  **External API Call (Mocked/Future):**
    *   Send video URL to HeyGen API for Visual Clone.
    *   Send audio URL to ElevenLabs/FishAudio for Voice Clone.
3.  **State Update:** Update `avatars.status` to `'processing'`.
4.  **Completion:** Webhook receives "Ready" signal -> Update `avatars.status` to `'ready'`.

## 3. The Studio Dashboard
**User Action:** User lands on `dashboard/studio`.
1.  **Load Avatar:** Fetch active avatar from `avatars` table.
2.  **Idle State:** Play a looped "Idle" video of the avatar to make it feel alive.
3.  **Task Input:** User types: "Create a welcome video for new subs".

## 4. Content Generation Loop
**User Action:** Submits a prompt.
1.  **Script Generation:** LLM (Gemini) generates a script based on the prompt + Channel Persona.
2.  **Video Synthesis:**
    *   Send Script + Avatar ID to HeyGen API.
    *   Create entry in `generated_content` with `status: 'generating'`.
3.  **Delivery:**
    *   Poll for completion.
    *   Update UI with the new video URL.

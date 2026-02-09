# Learning Platform — Tech Stack (Detailed)

**Date:** 2025-12-17  
**Source of Truth:** `/docs/stack-profile.json` + `/docs/specs/pricing-config.json`  
**Platform:** Mobile (Expo + React Native)

---

## Overview

This document expands the stack profile into implementation-level clarity: what we use, why we use it, and what “done” looks like for a production-grade mobile app prototype that can evolve into v1.

---

## Frontend (Mobile)

| Layer | Choice | Why |
|---|---|---|
| App framework | Expo (managed) | Fast iteration, predictable builds via EAS |
| Routing | Expo Router | File-based routing + React Navigation underneath |
| Styling | NativeWind | Tailwind-like velocity + consistent tokens |
| Motion | Reanimated + Moti + screen transitions | 60fps, premium feel, anti-slop rules |
| Forms | React Hook Form + Zod | Fast validation + typed schemas |
| Icons | Lucide React Native | Clean, consistent iconography (no emoji icons) |

---

## Backend (Supabase)

| Capability | Choice | Notes |
|---|---|---|
| Database | Postgres (Supabase) | RLS for authorization; migrations later |
| Auth | Supabase Auth | Email + social auth; session persistence |
| Storage | Supabase Storage | Avatars, worksheets, audio |
| Realtime | Supabase Realtime | Feed updates, session presence (future) |

---

## AI Layer

| Capability | Provider | Notes |
|---|---|---|
| LLM | OpenAI (GPT‑4o) | AI tutor chat, grammar help, drills |
| STT | OpenAI Whisper | Speaking exercises + pronunciation feedback |
| TTS | ElevenLabs | “Talk to AI Tutor” voice experience |

---

## Video Sessions

| Capability | Provider | Notes |
|---|---|---|
| Live video | LiveKit | 1:1 sessions + group calls (Pro/VIP) |

---

## Payments / Monetization

| Surface | Provider | Notes |
|---|---|---|
| Mobile subscriptions | RevenueCat | Apple IAP + Google Play abstraction |
| Web billing (future) | Stripe | Only if/when web flows ship |

Tiers: Free → Essential → Pro → VIP (see `/docs/specs/OFFER_ARCHITECTURE.md`).



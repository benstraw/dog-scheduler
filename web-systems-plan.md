# Dog Adventure Scheduler — Web System Plan

## Keystone Metric
**Completed Hikes**

A booking only counts when the **hike actually happens**.

All pages, flows, and navigation should push users toward this outcome.

---

# Core System Flow

Visitor  
→ Membership Request  
→ Approved Member  
→ Book Hike  
→ Hike Happens (keystone event)

---

# Public Website

The public site exists to **qualify the right clients**, not attract mass traffic.

## Navigation

Home  
About  
Request Membership  
Member Login

---

# Homepage Structure

## Hero

**The adventure your dog desires.**

Adventure hikes and outdoor outings for approved members.

Serving dogs in **West LA, Venice, Playa Vista, Marina del Rey, and El Segundo — west of the 405.**

Primary Action:

Request Membership

---

## Trust Section

Adventure Photos (4–6 images)

These photos demonstrate:

• real hikes  
• happy dogs  
• outdoor environments  
• proof of experience

Button:

View Full Gallery

---

## Testimonials

3 short testimonials.

Example format:

> “My dog comes back calm, tired, and incredibly happy every time.”  
> — Sarah, Venice

> “This is the highlight of my dog’s week.”  
> — Mark, Playa Vista

> “The pickup and adventure hikes have been a game changer.”  
> — Jenna, West LA

---

## About Preview

Short story explaining:

• who you are  
• your philosophy about dogs  
• why adventure hikes are better than neighborhood walks

Link to the full About page.

---

# About Page

Content should communicate:

• your background with dogs  
• safety philosophy  
• how adventures work  
• pickup and logistics model

Core idea: this is a **trusted local service**, not a gig-economy dog walker.

---

# Gallery Page

Simple photo grid.

Images should show:

• dogs exploring trails  
• dogs relaxing after hikes  
• scenic environments  
• occasional group shots

Goal: emotional trust signal.

Primary action still visible: **Request Membership**.

---

# Membership System

Signup handled by **Descope**.

### Membership Request Fields

Name  
Email  
Phone

Account status becomes **Pending Approval**.

User sees:

> Your membership request is under review.  
> We'll contact you soon.

---

# Member Approval Flow

When approved:

1. Welcome email sent  
2. First login redirects to onboarding

Welcome email includes:

• welcome message  
• onboarding instructions  
• link to book first hike

---

# Member Onboarding

Completed after approval.

### Owner Info

Address  
Pickup instructions  
Emergency contact  
Veterinarian

### Dog Info

Dog name  
Breed  
Age  
Size  
Temperament  
Leash behavior  
Medical notes

Once onboarding is completed, the user sees the **Member Home**.

---

# Member Home

Primary focus:

**Book Your Next Adventure**

Options:

2-Hour Hike  
4-Hour Hike  
Custom Adventure Request

Secondary links:

Upcoming bookings  
Dog profile  
Update contact info

---

# Booking System

Scheduling uses **Google Appointment Calendar**.

Separate booking systems exist for:

2-Hour Hikes  
4-Hour Hikes

These appear as **tabs** inside the booking page.

Availability is controlled by the owner's **personal Google Calendar**, allowing personal events to block time slots automatically.

---

# Custom Adventure Requests

Used for:

• unusual dates or times  
• extended hikes  
• multiple dogs from same household  
• special logistics

Submitting this form **does not create a booking**.

Instead:

Member submits request  
→ owner calls client  
→ booking scheduled manually

---

# Capacity Model

Each booking slot represents **one household**.

Multiple dogs may attend only if they belong to the same household or a known friend.

Random group packs are not part of the service model.

---

# Pickup Model

Primary model:

Owner **picks up and returns dogs from their home**.

Occasional alternative:

Owner may meet client at a trailhead.

---

# Payment Model

Payment is flexible.

Options:

Stripe Invoice (card)  
Venmo  
Zelle  
Cash

Stripe exists as the structured option but is not required.

Reducing payment friction increases completed hikes.

---

# Page Type Map (Web Systems)

## Attractor

Homepage

## Informer

About  
Gallery

## Converter

Request Membership  
Member Booking Page

## Support

Custom Adventure Request  
Member Dashboard

---

# Design Principles

• extremely simple navigation  
• membership gate controls access  
• booking path is always obvious  
• minimal marketing language  
• strong visual proof through photos  
• calm, trust-driven tone

---

# System Summary

This is not a marketplace.

It is a **private membership adventure service for dogs**.

The site’s job is simple:

1. Qualify good clients  
2. Approve them  
3. Get them booking hikes  
4. Deliver great adventures

The metric that matters:

**Completed hikes.**
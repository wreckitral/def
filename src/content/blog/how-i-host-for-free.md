---
title: "How I Host My Personal Web for $0 Using a Raspberry Pi"
description: "Ditching Vercel and GitHub Pages to become my own Sysadmin with Docker, Cloudflare Tunnels, and a student email."
date: 2026-2-15
tags: ["how-i-do", "infrastructure", "personal"]
draft: false
---

I used to host my portfolio on GitHub Pages. It was easy, free, and... boring.

As a Computer Science student, I didn't just want a website; I wanted a **server**.
I wanted to understand how the internet actually works under the hood. So, I
decided to move my Astro portfolio to a Raspberry Pi sitting on my desk, expose
it to the world securely, and pay exactly **$0** for it.

## The Prerequisites

To do this for free, you need to have a student email.

1. **A Computer**: A Raspberry Pi 4 (what I used), an old laptop, or even a potato running Linux.
2. **Student Status**: Apply for the [GitHub Student Pack](https://education.github.com/pack). This gives you a **Free Domain Name** (usually `.me`) for 1 year from Namecheap.
3. **Cloudflare Account**: Free tier.

## Step 1: The Domain & DNS (The "Phonebook")

First, I grabbed `defha.me` from Namecheap using my student credit. But instead of using Namecheap's default DNS, I moved everything to **Cloudflare**.

**Why?** Because Cloudflare gives us the "Secret Tunnel" (more on that later) and free SSL (the green lock) automatically.

1. Add site to Cloudflare.
2. Select the **Free Plan**.
3. Change the Nameservers in Namecheap to the ones Cloudflare gave me (e.g., `audrey.ns.cloudflare.com`).

_Tip: It takes about 15 minutes for the internet to realize you moved house. Go code something._

## Step 2: The Secret Tunnel (No Port Forwarding!)

This is the coolest part. In the old days, you had to open "Port 80" on your router, which is like leaving your front door open. Hackers love scanning for open ports.

Instead, I used **Cloudflare Tunnel**.

It works like a reverse pipe: My Pi creates an _outbound_ connection to Cloudflare. Secure traffic slides down this tunnel into my Pi, but no one can break in from the outside.

1. Go to **Cloudflare Zero Trust Dashboard** -> **Networks** -> **Tunnels**.
2. Create a tunnel named `homelab-pi`.
3. Run the installation command on the Pi:

   ```bash
   curl -L --output cloudflared.deb [https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb)
   sudo dpkg -i cloudflared.deb
   sudo cloudflared service install <YOUR_TOKEN>
   ```

Once the tunnel says **HEALTHY**, my Pi was officially connected to the Cloudflare edge network.

## Step 3: Dockerizing Astro

My portfolio is built with [Astro](https://astro.build). To run it on the Pi, I didn't want to just use `npm run start` (it's heavy on RAM). I wanted to serve static HTML files using **Nginx**.

I created a `Dockerfile` that uses a **Multi-Stage Build**:

1. **Stage 1 (The Chef):** Node.js installs dependencies and builds the site.
2. **Stage 2 (The Waiter):** Nginx takes the finished HTML files and serves them.

```dockerfile
# Stage 1: Build
FROM node:lts AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

```

### The "Ghost of GitHub Pages"

I ran into a huge issue where my CSS was broken. It turned out my `astro.config.mjs` was still configured for GitHub Pages (looking for a `/repo-name` subfolder).

**The Fix:**
I had to update the config to point to the root domain:

```javascript
export default defineConfig({
  site: "[https://defha.me](https://defha.me)",
  base: "/", // This is crucial! No more subfolders.
});
```

Then, I built and ran the container:

```bash
docker build -t my-portfolio .
docker run -d -p 3000:80 --name portfolio my-portfolio

```

## Step 4: Connecting the Dots

Finally, I had to tell Cloudflare: _"When someone visits defha.me, send them down the tunnel to my Docker container."_

In the Zero Trust Dashboard:

1. **Public Hostname:** `defha.me`
2. **Service:** `HTTP`
3. **URL:** `192.168.100.27:3000`

**Crucial Lesson:** I initially tried using `localhost:3000`, and it failed. Why? Because the Tunnel itself runs in a container! "Localhost" to the tunnel means _itself_, not the Pi. I had to use the Pi's actual LAN IP.

## Step 5: Secure Management with Tailscale

While Cloudflare handles the public web traffic, I needed a way to securely SSH into my Pi to do maintenance, check Docker logs, or update the site.

Opening Port 22 on my router was out of the question (it's a security nightmare). Instead, I used **Tailscale**.

Tailscale creates a private, encrypted mesh network. It gives my Raspberry Pi a "Magic IP" (like `100.x.y.z`) that is only accessible from my laptop and phone, no matter where I am in the world.

1. **Install Tailscale on the Pi:**

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

2. **The Result:**
   I can now open my terminal anywhere, a coffee shop, university, or in bed, and type:
   `ssh user-name@100.x.y.z`

Its basically everything that i do to host my own simple personal website, we can improve this by setting up a monitoring system or maybe even make our own VPSs.

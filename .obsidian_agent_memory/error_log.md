# Error Log

## 1. Vercel API Routing Issue (404 on API Calls)
- **Error**: Vercel frontend returned 404s when attempting to reach the Render backend.
- **Root Cause**: The `vercel.json` rewrites block was configured as `"destination": "https://[backend].onrender.com"`, which swallowed the `/api/:path*` path completely, forwarding all requests to the root `/` of the backend.
- **Solution**: Updated the destination string to include the exact path mapping: `"destination": "https://[backend].onrender.com/api/:path*"`.

## 2. Flex-Column Overlap Bug (CSS Position Absolute Issue)
- **Error**: Search bar was visually overlapping the "Like a Professional." hero text instead of flowing below it, despite being placed sequentially in a flex column container.
- **Root Cause**: The `.ws-hero-title-wrapper` had a hidden `position: absolute` property. This caused it to be pulled out of normal document flow, meaning the subsequent `.ws-search-container` centered itself dynamically and overlapped the title.
- **Solution**: Removed `position: absolute` from the `.ws-hero-title-wrapper` so both elements could cleanly stack in the vertical flex layout, using standard `margin-top` for spacing.

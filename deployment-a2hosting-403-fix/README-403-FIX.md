# Fix for 403 Forbidden Error on A2Hosting

## The Problem
403 Forbidden error means A2Hosting is blocking access due to file permissions or directory settings.

## Step-by-Step Fix

### 1. Check Current Files
Login to cPanel → File Manager → public_html
Verify these files exist:
- index.html
- .htaccess
- assets/ folder with CSS and JS files

### 2. Fix File Permissions (CRITICAL)
In cPanel File Manager, right-click each file/folder and set permissions:

**Files (index.html, .htaccess):**
- Owner: Read, Write (6)
- Group: Read (4)  
- World: Read (4)
- **Result: 644**

**Folders (assets/, public_html/):**
- Owner: Read, Write, Execute (7)
- Group: Read, Execute (5)
- World: Read, Execute (5)
- **Result: 755**

### 3. Upload This Fixed Package
1. Delete ALL existing files in public_html
2. Upload this entire package
3. Set permissions as above

### 4. Alternative: Use cPanel File Manager Upload
1. Extract files on your computer first
2. Use cPanel File Manager → Upload
3. Select ALL files and upload together
4. Set permissions after upload

### 5. If Still Getting 403
Contact A2Hosting support and ask them to:
- Enable directory indexing for your domain
- Check if mod_rewrite is enabled
- Verify .htaccess files are allowed

## Test After Upload
Visit: hr.themeetingmatters.com
Should show the HR management dashboard, not 403 error.

## Quick Permission Check
Run this in cPanel Terminal (if available):
```
chmod 644 public_html/index.html
chmod 644 public_html/.htaccess  
chmod 755 public_html/assets
chmod 644 public_html/assets/*
```
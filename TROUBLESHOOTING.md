# Troubleshooting Guide

## Port Conflicts

### Backend Port 5000 Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:

1. **Kill the process using port 5000** (Windows PowerShell):
   ```powershell
   # Find process using port 5000
   netstat -ano | findstr :5000
   
   # Kill the process (replace PID with the number from above)
   taskkill /PID <PID> /F
   ```

2. **Use a different port**:
   - Set environment variable: `$env:PORT=5001`
   - Or update `backend/.env`: `PORT=5001`
   - Update `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5001/api`

3. **The server now auto-handles port conflicts** - it will try port 5001 if 5000 is busy

### Frontend Port 3000 Already in Use

Next.js automatically switches to port 3001 if 3000 is in use. Update your browser to:
- `http://localhost:3001` instead of `http://localhost:3000`

## Security Vulnerabilities

### Next.js Security Warning

If you see: `npm warn deprecated next@14.0.4: This version has a security vulnerability`

**Solution**: The package.json has been updated to `^14.2.35`. Run:
```bash
cd frontend
npm install
```

### Critical Vulnerability Warning

If you see: `1 critical severity vulnerability`

**Check what it is**:
```bash
cd frontend
npm audit
```

**Fix automatically** (if safe):
```bash
npm audit fix
```

**Or fix manually** based on the audit output.

## MongoDB Connection Issues

### MongoDB URI Not Provided

**Message**: `⚠️  MongoDB URI not provided, using JSON fallback`

**This is OK!** The platform works without MongoDB using JSON fallback storage.

**To use MongoDB**:
1. Get MongoDB Atlas connection string (free tier available)
2. Add to `backend/.env`: `MONGODB_URI=your-connection-string`

## Frontend Can't Connect to Backend

**Symptoms**: API calls fail, CORS errors

**Solutions**:

1. **Check backend is running**: Look for `🚀 Server running on port XXXX`

2. **Check API URL**: Ensure `frontend/.env.local` has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   (Or whatever port backend is using)

3. **Restart frontend** after changing environment variables:
   ```bash
   # Stop frontend (Ctrl+C)
   # Then restart
   npm run dev:frontend
   ```

## Common Issues

### Module Not Found Errors

**Solution**: Reinstall dependencies
```bash
npm run install:all
```

### Build Errors

**Clear cache and rebuild**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Games Not Loading

1. Check `game-templates/` folder exists with JSON files
2. Check backend logs for errors
3. Verify backend is running

### Authentication Not Working

1. Check JWT_SECRET is set in `backend/.env`
2. Clear browser cookies
3. Try registering a new account

## Performance Issues

### Slow Compilation

- First build is always slow (Next.js compilation)
- Subsequent builds are faster
- Consider using `npm run build` for production

### High Memory Usage

- Normal for development mode
- Production builds are optimized
- Consider closing other applications

## Getting Help

1. Check error messages in terminal
2. Check browser console (F12)
3. Review logs in backend terminal
4. Check documentation in `/docs` folder

## Quick Fixes Checklist

- [ ] Kill processes on ports 5000/3000
- [ ] Run `npm run install:all`
- [ ] Check `.env` files exist
- [ ] Restart both frontend and backend
- [ ] Clear browser cache
- [ ] Check firewall/antivirus isn't blocking ports

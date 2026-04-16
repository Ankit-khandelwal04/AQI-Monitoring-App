# GitHub Push Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click the "+" icon in the top right
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `aqi-monitoring-fullstack` (or your preferred name)
   - **Description**: "Full-stack AQI Monitoring Application with React Native and FastAPI"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Verify the remote was added
git remote -v

# Push to GitHub
git push -u origin master
```

### Example (replace with your details):
```powershell
git remote add origin https://github.com/ankitsharma/aqi-monitoring-fullstack.git
git push -u origin master
```

## Step 3: Verify

1. Refresh your GitHub repository page
2. You should see all your files uploaded
3. The README.md will be displayed on the main page

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```powershell
# Login to GitHub
gh auth login

# Create repository and push
gh repo create aqi-monitoring-fullstack --public --source=. --remote=origin --push
```

## Troubleshooting

### Error: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Error: "failed to push some refs"
```powershell
# Force push (use with caution)
git push -u origin master --force
```

### Error: Authentication failed
```powershell
# Use personal access token instead of password
# Generate token at: https://github.com/settings/tokens
# Use token as password when prompted
```

## Future Updates

After the initial push, to update the repository:

```powershell
# Check status
git status

# Add changed files
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push
```

## Quick Commands Reference

```powershell
# Check current status
git status

# View commit history
git log --oneline

# View remote URL
git remote -v

# Pull latest changes
git pull origin master

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout master

# Merge branch
git merge feature-name
```

## Repository Structure

Your repository will contain:

```
aqi-monitoring-fullstack/
├── FullStackBackend/          # FastAPI backend
│   ├── app/                   # Application code
│   ├── alembic/              # Database migrations
│   ├── scripts/              # Utility scripts
│   └── requirements.txt      # Python dependencies
├── FullStackMobile/          # React Native frontend
│   ├── src/                  # Source code
│   ├── assets/               # Images and assets
│   └── package.json          # Node dependencies
├── README.md                 # Main documentation
├── .gitignore               # Git ignore rules
└── Documentation files      # Various guides
```

## Important Notes

1. **Environment Variables**: The `.env` files are gitignored for security
2. **Dependencies**: `node_modules/` and `venv/` are not pushed
3. **Cache**: `.expo/` and `__pycache__/` are excluded
4. **Sensitive Data**: Never commit API keys or passwords

## Recommended: Add Branch Protection

After pushing, set up branch protection:

1. Go to repository Settings
2. Click "Branches"
3. Add rule for `master` branch
4. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

## Next Steps

After pushing to GitHub:

1. ✅ Add repository description and topics
2. ✅ Add a license (MIT recommended)
3. ✅ Enable GitHub Actions for CI/CD
4. ✅ Add issue templates
5. ✅ Create a CONTRIBUTING.md file
6. ✅ Add badges to README (build status, license, etc.)

---

**Created**: April 7, 2026  
**Status**: Ready to Push ✅

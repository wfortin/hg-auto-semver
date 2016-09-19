# hg-auto-semver
Automatically bump versions according to parent branch name.

# How it works
hg-auto-semver checks for the parent branch name after a merge. If the branch contains `fix-`, it'll bump a PATCH version. If the branch contains `feature-`, it'll bump the MINOR version

# Usage

```
npm install hg-auto-semver --save
```

To your package.json add
```
"scripts": {
  "hg-auto-semver": "hg-auto-semver"
}
```

In your CI, run
```
npm run hg-auto-semver
```

Enjoy auto version bumping!

PR_TITLE="chore: cms to repo sync"
BRANCH_NAME="sync_cms_to_plugins_$(date +%s)"

git branch $BRANCH_NAME
git switch $BRANCH_NAME

echo "Syncing CMS to plugins"
npx tsx bin/sync_cms_to_plugins_repo.js

echo "Creating PR \"$PR_TITLE\" for branch $BRANCH_NAME"

// This is the only file we want to commit
git add site/plugins.json

// See if we have any changes. We should.
if [[ -n "$(git status --porcelain)" ]]; then
  git commit -m $PR_TITLE
  git push origin $BRANCH_NAME
  # TODO: Uncomment the line below and delete the one below it once we're happy that this is working well in the test environment
  # gh pr create --title $PR_TITLE --body "This is an automated PR to sync the CMS to the repo" --label "cms_sync" --label "automerge"
  gh pr create --title $PR_TITLE --body "DO NOT MERGE, TESTING SYNC: This is an automated PR to sync the CMS to the repo" --label "cms_sync"
fi

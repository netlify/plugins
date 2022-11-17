PLUGIN=$1
PR_TITLE="chore: publish workflow-ui for $PLUGIN"
BRANCH_NAME="publish_workflow_ui_$(date +%s)"

git switch -c $BRANCH_NAME

# install jq
sudo apt-get install jq

PACKAGES=cat site/plugins.json | jq ".[].package"

# Loop through each package, install from npm and copy the workflow-ui.json from root of the package if it exists
for PACKAGE in $PACKAGES
do
  echo "Installing $PACKAGE"
  npm install $PACKAGE
  if [ -f "node_modules/$PACKAGE/workflow-ui.json" ]; then
    echo "Copying workflow-ui.json from $PACKAGE"
    cp node_modules/$PACKAGE/workflow-ui.json site/workflow-ui/$PACKAGE.json
  fi
done

# Add all files to git in the site directory
git add site

# See if we have any changes. We should.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Creating PR \"$PR_TITLE\" for branch $BRANCH_NAME"
  git commit -m "$PR_TITLE"
  git push origin $BRANCH_NAME
  gh pr create --title "$PR_TITLE" --body "This is an automated PR to publish workflow-ui for $PLUGIN" --label "workflow_ui" --label "automerge"
else
  # Shouldn't end up here, but log that there was nothing to sync
  echo "Looks like there was nothing to sync."
fi

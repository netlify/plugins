PLUGIN=$1
PR_TITLE="chore: publish workflow-ui for $PLUGIN"
BRANCH_NAME="publish_workflow_ui_$(date +%s)"

git switch -c $BRANCH_NAME

# Get the latest version of the plugin
npm install $PLUGIN

# Copy the workflow-ui.json from the root of the installed plugin directory
cp node_modules/$PLUGIN/workflow-ui.json site/$PLUGIN/workflow-ui.json

# This is the only file we want to commit
git add site/$PLUGIN/workflow-ui.json

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

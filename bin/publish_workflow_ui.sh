PR_TITLE="chore: publish workflow-ui files"
BRANCH_NAME="publish_workflow_ui_$(date +%s)"

git switch -c $BRANCH_NAME

# install jq
sudo apt-get install jq

# Loop through each package, install from npm and copy the workflow-ui.json from root of the package if it exists
cat site/plugins.json | jq ".[] | select(.workflow == true) | .package" | while read PACKAGE
do
  PACKAGE=$(echo $PACKAGE | tr -d '"')
  echo "Downloading workflow-ui for $PACKAGE"
  npm pack $PACKAGE
  tar -xzf *.tgz

  if [ -f package/workflow-ui.json ]; then
    echo "Copying workflow-ui.json for $PACKAGE"

    mkdir -p site/$PACKAGE
    cp package/workflow-ui.json site/$PACKAGE/workflow-ui.json

    cat site/$PACKAGE/workflow-ui.json | jq ".surfaces | .[] | .surfaceScripts | .[]?" | while read SCRIPT
    do
      # strip quotes and leading ./ from script path
      SCRIPT=$(echo $SCRIPT | tr -d '"' | sed 's/^\.\///')
      echo "Copying $SCRIPT for $PACKAGE"
      cp package/$SCRIPT site/$PACKAGE/$SCRIPT
    done
  fi


  rm -rf ./package
done

npx tsx bin/combined_workflow_files.ts

# Add all files to git in the site directory
git add site

# See if we have any changes. We should.
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Creating PR \"$PR_TITLE\" for branch $BRANCH_NAME"
  # git commit -m "$PR_TITLE"
  # git push origin $BRANCH_NAME
  # gh pr create --title "$PR_TITLE" --body "This is an automated PR to publish workflow-ui" --label "workflow_ui" --label "automerge"
else
  # Shouldn't end up here, but log that there was nothing to sync
  echo "Looks like there was nothing to sync."
fi

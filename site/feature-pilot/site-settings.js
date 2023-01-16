console.log('surface script is running')

/* eslint-disable no-console, no-undef */
netlifyContext.on('WFUI_SAVE', async (uiState) => {
  console.log('save called')
});

netlifyContext.on('WFUI_LOAD', async (uiState) => {
  console.log('load called')
});

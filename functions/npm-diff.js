const pacote = require('pacote');
const fetch = require('node-fetch');
const Diff = require('diff');
const { validate } = require('./utils/validate');

const fetchJson = async (url, options, errorPrefix) => {
  const response = await fetch(url, options);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${json.message}`);
  }
  return json;
};

const fetchText = async (url, options, errorPrefix) => {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${text}`);
  }
  return text;
};

const getBaseFile = async ({ baseRepoUrl, baseSha }) => {
  const baseFile = await fetchText(
    `${baseRepoUrl}/contents/site/plugins.json?ref=${baseSha}`,
    {
      headers: { Accept: 'application/vnd.github.VERSION.raw' },
    },
    'getBaseFile',
  );
  return baseFile;
};

const getDiffText = async ({ diffUrl }) => {
  const diffText = await fetchText(diffUrl, {}, 'getDiffText');
  return diffText;
};

const getDiffedFile = ({ baseFile, diffText }) => {
  const diffed = Diff.applyPatch(baseFile, diffText);
  // applyPatch() sometimes returns `false` instead of errors
  // https://github.com/kpdecker/jsdiff/issues/247
  if (diffed === false) {
    throw new Error('Failed applying diff');
  }
  return diffed;
};

const toDictionary = (plugins) => {
  return plugins.reduce((dic, plugin) => {
    return { ...dic, [`${plugin.author}-${plugin.package}`]: plugin };
  }, {});
};

const getDiffs = (basePluginsDictionary, headPluginsDictionary) => {
  const diffs = Object.entries(headPluginsDictionary).reduce((acc, [key, headPlugin]) => {
    const basePlugin = basePluginsDictionary[key];
    if (basePlugin && basePlugin.version !== headPlugin.version) {
      // existing plugin
      return [
        ...acc,
        {
          package: headPlugin.package,
          version: headPlugin.version,
          url: `https://diff.intrinsic.com/${headPlugin.package}/${basePlugin.version}/${headPlugin.version}`,
          status: 'updated',
        },
      ];
    } else if (!basePlugin) {
      // new plugin
      return [...acc, { package: headPlugin.package, version: headPlugin.version, status: 'added' }];
    } else {
      // unchanged version
      return acc;
    }
  }, []);

  return diffs;
};

const getNewPluginsUrls = async (diffs) => {
  const diffUrls = await Promise.all(
    diffs.map(async (diff) => {
      if (diff.status === 'added') {
        const manifest = await pacote.manifest(`${diff.package}@${diff.version}`);
        return { ...diff, url: manifest.dist.tarball };
      } else {
        return diff;
      }
    }),
  );

  return diffUrls;
};

const ADDED_HEADER = '#### Added Packages';
const UPDATED_HEADER = '#### Updated Packages';

const addOrUpdatePrComment = async ({ comment, commentsUrl, token }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    const comments = await fetchJson(commentsUrl, { headers }, 'failed getting comments');
    const existingComment = comments.find((c) => c.body.includes(ADDED_HEADER) || c.body.includes(UPDATED_HEADER));
    if (existingComment) {
      console.log(`Updating comment to:\n${comment}`);
      await fetchJson(
        existingComment.url,
        {
          headers: {
            ...headers,
            Authorization: `token ${token}`,
          },
          method: 'PATCH',
          body: JSON.stringify({ body: comment }),
        },
        'failed updating comment',
      );
    } else {
      console.log(`Creating comment:\n${comment}`);
      await fetchJson(
        commentsUrl,
        {
          headers: {
            ...headers,
            Authorization: `token ${token}`,
          },
          method: 'POST',
          body: JSON.stringify({ body: comment }),
        },
        'failed creating comment',
      );
    }
  } catch (e) {
    console.log(`addOrUpdatePrComment`, e.message);
  }
};

const diff = async ({ baseSha, baseRepoUrl, diffUrl, commentsUrl, token }) => {
  const [baseFile, diffText] = await Promise.all([getBaseFile({ baseSha, baseRepoUrl }), getDiffText({ diffUrl })]);

  const basePlugins = JSON.parse(baseFile);
  const headPlugins = JSON.parse(getDiffedFile({ baseFile, diffText }));

  const basePluginsDictionary = toDictionary(basePlugins);
  const headPluginsDictionary = toDictionary(headPlugins);

  const diffs = getDiffs(basePluginsDictionary, headPluginsDictionary);
  if (diffs.length <= 0) {
    console.log('No changed plugins');
    return;
  }
  const diffUrls = await getNewPluginsUrls(diffs);

  const sorted = [...diffUrls];
  sorted.sort((a, b) => {
    return a.package.localeCompare(b.package);
  });

  const added = sorted.filter((d) => d.status === 'added');
  const updated = sorted.filter((d) => d.status === 'updated');

  let comment = '';
  if (added.length > 0) {
    comment = comment + `${ADDED_HEADER}\n\n${added.map((d) => `- ${d.url}`).join('\n')}`;
  }
  if (updated.length > 0) {
    if (comment) {
      comment = comment + '\n\n';
    }
    comment = comment + `${UPDATED_HEADER}\n\n${updated.map((d) => `- ${d.url}`).join('\n')}`;
  }

  if (comment) {
    await addOrUpdatePrComment({ comment, commentsUrl, token });
  }
};

module.exports.handler = async function (e) {
  try {
    const { error } = validate(e);
    if (error) {
      console.warn('Validation error:', error.message);
      return {
        statusCode: 404,
        body: 'Not Found',
      };
    }
    const event = JSON.parse(e.body);
    console.log(JSON.stringify(event, null, 2));
    if (['opened', 'synchronize', 'reopened'].includes(event.action)) {
      const baseSha = event.pull_request.base.sha;
      const baseRepoUrl = event.pull_request.base.repo.url;
      const diffUrl = event.pull_request.diff_url;
      const commentsUrl = event.pull_request.comments_url;
      const token = process.env.GITHUB_TOKEN;
      await diff({ baseSha, baseRepoUrl, diffUrl, commentsUrl, token });
    } else {
      console.log(`Ignoring action ${event.action}`);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'success' }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unknown error' }),
    };
  }
};

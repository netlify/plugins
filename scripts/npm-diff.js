const execa = require('execa');
const fetch = require('node-fetch');

const gitShowPlugins = async (sha) => {
  const toShow = `${sha}:plugins.json`;
  try {
    const { stdout } = await execa('git', ['show', toShow]);
    return JSON.parse(stdout);
  } catch (e) {
    console.error(`Failed getting '${toShow}'`, e.message);
    return undefined;
  }
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
        const { stdout: url } = await execa('npm', ['view', `${diff.package}@${diff.version}`, 'dist.tarball']).catch(
          (e) => {
            console.error(`Failed getting '${diff.package}@${diff.version}' url`, e.message);
            return {
              stdout: `https://registry.npmjs.org/${diff.package}/-/${diff.package}-${diff.version}.tgz`,
            };
          },
        );
        return { ...diff, url };
      } else {
        return diff;
      }
    }),
  );

  return diffUrls;
};

const ADDED_HEADER = '#### Added Packages';
const UPDATED_HEADER = '#### Updated Packages';

const addOrUpdatePrComment = async (comment) => {
  const { GITHUB_TOKEN: token, GITHUB_COMMENTS_URL: commentsUrl } = process.env;
  const headers = {
    Authorization: `token ${token}`,
    'Content-Type': 'application/json',
  };
  try {
    const comments = await fetch(commentsUrl, { headers }).then((r) => r.json());
    const existingComment = comments.find((c) => c.body.includes(ADDED_HEADER) || c.body.includes(UPDATED_HEADER));
    if (existingComment) {
      console.log(`Updating comment '${comment}'`);
      await fetch(existingComment.url, {
        headers,
        method: 'PATCH',
        body: JSON.stringify({ body: comment }),
      });
    } else {
      console.log(`Creating comment '${comment}'`);
      await fetch(commentsUrl, { headers, method: 'POST', body: JSON.stringify({ body: comment }) });
    }
  } catch (e) {
    console.log(`Failed adding comment to PR`, e.message);
  }
};

const diff = async () => {
  const { GITHUB_BASE_SHA: baseSha, GITHUB_HEAD_SHA: headSha } = process.env;

  const [basePlugins, headPlugins] = await Promise.all([gitShowPlugins(baseSha), gitShowPlugins(headSha)]);
  if (basePlugins && headPlugins) {
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
      await addOrUpdatePrComment(comment);
    }
  }
};

diff();

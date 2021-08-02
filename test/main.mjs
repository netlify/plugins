import { URL } from 'url';

import test from 'ava';
import got from 'got';
import pacote from 'pacote';
import { upperCaseFirst } from 'upper-case-first';
import isPlainObj from 'is-plain-obj';
import semver from 'semver';
import normalizeNodeVersion from 'normalize-node-version';
import { pluginsList, pluginsUrl } from '../index.js';

const { manifest } = pacote;
const { valid: validVersion, validRange, lt: ltVersion, major, minor, patch, minVersion } = semver;

const STRING_ATTRIBUTES = ['author', 'description', 'name', 'package', 'repo', 'status', 'version'];
const OPTIONAL_ATTRIBUTES = ['status', 'compatibility'];
const ATTRIBUTES = [...STRING_ATTRIBUTES, 'compatibility'];
const ENUMS = {
  status: ['DEACTIVATED', undefined],
};

const COMPATIBILITY_ATTRIBUTES = ['version', 'migrationGuide', 'featureFlag', 'nodeVersion', 'siteDependencies'];

// Compare two versions by their major versions.
// Takes into account the special rules for `0.*.*` and `0.0.*` versions.
// According to semver, the second number is the major release number for
// `0.*.*` versions and the third for `0.0.*`. This is how `^` behaves with the
// `semver` module which is used by `npm`.
const isPreviousMajor = function (versionA, versionB) {
  return ltVersion(getMajor(versionA), getMajor(versionB));
};

const getMajor = function (version) {
  return minVersion(getMajorVersion(version)).version;
};

const getMajorVersion = function (version) {
  const majorVersion = major(version);
  if (majorVersion !== 0) {
    return `${majorVersion}`;
  }

  const minorVersion = minor(version);
  if (minorVersion !== 0) {
    return `${majorVersion}.${minorVersion}`;
  }

  const patchVersion = patch(version);
  return `${majorVersion}.${minorVersion}.${patchVersion}`;
};

pluginsList.forEach((plugin) => {
  const { package: packageName, repo, version, name, compatibility } = plugin;

  Object.entries(plugin).forEach(([attribute, value]) => {
    test(`Plugin attribute "${attribute}" should have a proper shape: ${packageName}`, (t) => {
      t.true(ATTRIBUTES.includes(attribute));

      const possibleValues = ENUMS[attribute];
      t.true(possibleValues === undefined || possibleValues.includes(value));

      if (value === undefined && OPTIONAL_ATTRIBUTES.includes(attribute)) {
        return;
      }

      if (STRING_ATTRIBUTES.includes(attribute)) {
        t.is(typeof value, 'string');
        t.not(value.trim(), '');
      }
    });
  });

  test(`Plugin package should be published: ${packageName}`, async (t) => {
    t.is(typeof version, 'string');
    t.not(validVersion(version), null);
    await t.notThrowsAsync(manifest(`${packageName}@${version}`));
  });

  test(`Plugin repository URL should be valid: ${packageName}`, async (t) => {
    await t.notThrowsAsync(got(repo));
  });

  test(`Plugin name should not include 'plugin': ${packageName}`, (t) => {
    t.false(typeof name === 'string' && name.toLowerCase().includes('plugin'));
  });

  test(`Plugin name should start with an uppercase letter: ${packageName}`, (t) => {
    t.true(typeof name === 'string' && name === upperCaseFirst(name));
  });

  if (compatibility === undefined) {
    return;
  }

  test(`Plugin compatibility should be an array of plain objects: ${packageName}`, (t) => {
    t.true(Array.isArray(compatibility));
    t.true(compatibility.every(isPlainObj));
  });

  if (!Array.isArray(compatibility) || !compatibility.every(isPlainObj)) {
    return;
  }

  test(`Plugin compatibility are sorted from highest to lowest version and with different major versions in each entry: ${packageName}`, (t) => {
    t.true(
      compatibility
        .filter((compatField) => validVersion(compatField.version) !== null)
        .every(
          (compatField, index) =>
            index === compatibility.length - 1 ||
            isPreviousMajor(compatibility[index + 1].version, compatField.version),
        ),
    );
  });

  test(`Plugin version is the same as the first non-feature-flagged compatibility version: ${packageName}`, (t) => {
    const [{ version: compatVersion }] = compatibility.filter(({ featureFlag }) => featureFlag === undefined);
    t.is(compatVersion, version);
  });

  compatibility.forEach((compatField, index) => {
    const { version: compatVersion, migrationGuide, featureFlag, nodeVersion, siteDependencies } = compatField;

    Object.keys(compatField).forEach((compatFieldKey) => {
      test(`Plugin compatibility[${index}].${compatFieldKey} is a known attribute: ${packageName}`, (t) => {
        t.true(COMPATIBILITY_ATTRIBUTES.includes(compatFieldKey));
      });
    });

    test(`Plugin compatibility[${index}].version is valid: ${packageName}`, async (t) => {
      t.is(typeof compatVersion, 'string');
      t.not(validVersion(compatVersion), null);
      await t.notThrowsAsync(manifest(`${packageName}@${compatVersion}`));
    });

    test(`Plugin compatibility[${index}].migrationGuide is valid: ${packageName}`, async (t) => {
      if (migrationGuide === undefined) {
        t.pass();
        return;
      }

      t.is(typeof migrationGuide, 'string');
      t.notThrows(() => new URL(migrationGuide));
      await t.notThrowsAsync(got(migrationGuide));
    });

    test(`Plugin compatibility[${index}].featureFlag is valid: ${packageName}`, async (t) => {
      if (featureFlag === undefined) {
        t.pass();
        return;
      }

      t.is(typeof featureFlag, 'string');
      t.not(featureFlag, '');
    });

    test(`Plugin compatibility[${index}].nodeVersion is valid: ${packageName}`, async (t) => {
      if (nodeVersion === undefined) {
        t.pass();
        return;
      }

      t.is(typeof nodeVersion, 'string');
      t.not(validRange(nodeVersion), null);
      await t.notThrowsAsync(normalizeNodeVersion(nodeVersion));
    });

    test(`Plugin compatibility[${index}].siteDependencies is valid: ${packageName}`, (t) => {
      if (siteDependencies === undefined) {
        t.pass();
        return;
      }

      t.true(isPlainObj(siteDependencies));
      t.not(Object.keys(siteDependencies).length, 0);
      t.true(
        Object.values(siteDependencies).every(
          (dependencyVersion) => typeof dependencyVersion === 'string' && validRange(dependencyVersion) !== null,
        ),
      );
    });
  });
});

test('Plugins URL exists', (t) => {
  t.true(pluginsUrl.startsWith('https://'));
});

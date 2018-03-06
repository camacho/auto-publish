#! /usr/bin/env node

const findup = require('find-up');
const execa = require('execa');
const semver = require('semver');
const yon = require('yarn-or-npm');

async function execute(client, bump, tag, options = {}) {
  const packagePath = await findup('package.json');
  if (!packagePath) throw new Error('package.json could not be found');

  const pkg = require(packagePath);
  const stdout = await execa.stdout(client, ['info', pkg.name, '--json']);

  const info = client === 'yarn' ? JSON.parse(stdout).data : JSON.parse(stdout);

  const major = semver.major(info.version);
  const minor = semver.minor(info.version);
  const patch = semver.patch(info.version);

  const sortedVersions = info.versions.sort(semver.rcompare);

  let latestRelevantVersion;
  switch (bump) {
    case 'patch':
      latestRelevantVersion = sortedVersions.filter(
        version =>
          semver.major(version) === major && semver.minor(version) === minor
      )[0];
      break;
    case 'minor':
      latestRelevantVersion = sortedVersions.filter(
        version => semver.major(version) === major
      )[0];
      break;
    case 'major':
      latestRelevantVersion = sortedVersions[0];
      break;
    default:
      throw new Error('Illegal bump type provided');
  }

  const nextVersion = semver.inc(
    latestRelevantVersion ? latestRelevantVersion : version,
    bump
  );

  const args = ['publish', '--new-version', nextVersion, '--tag', tag];

  if (options.dry) {
    console.log(`Next Version: ${nextVersion}`);
    console.log(`Publish Command: ${[client].concat(args).join(' ')}`);
  } else {
    await execa(client, args, { stdio: 'inherit' });
  }
}

if (require.main === module) {
  const yargs = require('yargs');
  const argv = yargs
    .command(
      ['* [bump]'],
      'Increment module version and publish',
      localYargs => {
        localYargs.positional('bump', {
          default: 'patch',
          choices: ['patch', 'minor', 'major'],
        });
      }
    )
    .options({
      client: {
        type: 'string',
        choices: ['yarn', 'npm'],
        default: yon(),
      },
      tag: {
        type: 'string',
        description: 'Tag to use when publishing',
        default: 'latest',
      },
      dry: {
        type: 'boolean',
        description: 'Dry run (do not publish)',
        default: false,
      },
    })
    .version(false)
    .strict()
    .alias('h', 'help')
    .help('help').argv;

  try {
    const { client, bump, tag, ...options } = argv;
    execute(client, bump, tag, options);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

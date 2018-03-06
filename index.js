const findup = require('find-up');
const execa = require('execa');
const semver = require('semver');

async function execute(client = 'yarn', bump = 'patch', tag = 'latest') {
  const packagePath = await findup('package.json');
  if (!packagePath) throw new Error('package.json could not be found');

  const pkg = require(packagePath);
  const stdout = await execa.stdout(client, ['info', pkg.name, '--json']);

  const info = client === 'yarn' ? JSON.parse(stdout).data : JSON.parse(stdout);

  const major = semver.major(info.version);
  const minor = semver.minor(info.version);

  const lastVersion = info.versions.sort(semver.rcompare).filter(version => {
    return semver.major(version) === major && semver.minor(version) === minor;
  })[0];

  const nextVersion = lastVersion
    ? semver.inc(lastVersion, bump)
    : info.version;

  await execa(client, ['version', '--new-version', nextVersion], {
    stdio: 'inherit',
  });

  await execa(client, ['publish', '--tag', tag]);
}

execute(undefined, undefined, 'alpha');

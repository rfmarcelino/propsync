const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 PropSync Deployment Script\n');

try {
  console.log('1. Building JavaScript files...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n2. Checking git status...');
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });

  if (gitStatus.trim()) {
    console.log('\n📋 Files to commit:');
    console.log(gitStatus);

    console.log('\n3. Next steps:');
    console.log('   git add .');
    console.log('   git commit -m "Update compressed JavaScript files"');
    console.log('   git push origin master');

    console.log('\n🌐 After pushing, your files will be available at:');
    console.log('   https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-page-template.js');
    console.log('   https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-list-page-a-b.js');
    console.log('   https://git.omibee.com/products/propsync/-/raw/master/dist/propsync-list-page-c.js');
  } else {
    console.log('\n✅ No changes to commit. All files are up to date!');
  }

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

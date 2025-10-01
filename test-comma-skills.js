// Test script to verify comma-separated skill matching
console.log('🧪 TESTING COMMA-SEPARATED SKILL MATCHING');

// Simulate the skill processing logic
const processSkills = (skillSources) => {
  let allSkills = [];
  
  skillSources.forEach(source => {
    if (Array.isArray(source)) {
      source.forEach(skill => {
        if (typeof skill === 'string' && skill.includes(',')) {
          // Handle comma-separated skills like "JavaScript, React, Node.js"
          const splitSkills = skill.split(',').map(s => s.trim()).filter(s => s.length > 0);
          allSkills.push(...splitSkills);
        } else if (skill && typeof skill === 'string' && skill.trim().length > 0) {
          allSkills.push(skill.trim());
        }
      });
    }
  });
  
  // Remove duplicates, convert to lowercase, and filter empty values
  return [...new Set(allSkills)]
    .filter(skill => skill && skill.length > 0)
    .map(skill => skill.toLowerCase().trim());
};

// Test cases
const testCases = [
  {
    name: 'Comma-separated in array',
    input: [['JavaScript, React, Node.js']],
    expected: ['javascript', 'react', 'node.js']
  },
  {
    name: 'Mixed individual and comma-separated',
    input: [['Python'], ['JavaScript, React'], ['CSS']],
    expected: ['python', 'javascript', 'react', 'css']
  },
  {
    name: 'Individual skills only',
    input: [['JavaScript'], ['React'], ['Node.js']],
    expected: ['javascript', 'react', 'node.js']
  },
  {
    name: 'Complex comma-separated with spaces',
    input: [['JavaScript , React.js , Node.js, Express.js']],
    expected: ['javascript', 'react.js', 'node.js', 'express.js']
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test ${index + 1}: ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.input)}`);
  
  const result = processSkills(testCase.input);
  console.log(`   Result: [${result.join(', ')}]`);
  console.log(`   Expected: [${testCase.expected.join(', ')}]`);
  
  const matches = JSON.stringify(result.sort()) === JSON.stringify(testCase.expected.sort());
  console.log(`   Status: ${matches ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n🎯 SKILL MATCHING TEST:');
const applicantSkills = ['javascript', 'react', 'css'];
const jobSkills = ['javascript', 'html', 'bootstrap'];

const matchedSkills = jobSkills.filter(jobSkill => 
  applicantSkills.some(appSkill => 
    appSkill === jobSkill ||
    appSkill.includes(jobSkill) ||
    jobSkill.includes(appSkill)
  )
);

console.log(`Applicant Skills: [${applicantSkills.join(', ')}]`);
console.log(`Job Required Skills: [${jobSkills.join(', ')}]`);
console.log(`Matched Skills: [${matchedSkills.join(', ')}]`);
console.log(`Should show job: ${matchedSkills.length > 0 ? '✅ YES' : '❌ NO'}`);

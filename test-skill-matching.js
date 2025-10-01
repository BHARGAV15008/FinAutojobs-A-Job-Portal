// Quick test script to verify skill matching logic
const testSkillMatching = () => {
  console.log('🧪 TESTING SKILL MATCHING LOGIC');
  
  // Test cases
  const testCases = [
    {
      applicantSkills: ['JavaScript', 'React', 'Node.js'],
      jobSkills: ['JavaScript', 'HTML', 'CSS'],
      expectedMatch: true,
      description: 'Should match JavaScript'
    },
    {
      applicantSkills: ['Python', 'Django'],
      jobSkills: ['Python', 'Flask', 'PostgreSQL'],
      expectedMatch: true,
      description: 'Should match Python'
    },
    {
      applicantSkills: ['React', 'Vue'],
      jobSkills: ['Angular', 'TypeScript'],
      expectedMatch: false,
      description: 'Should not match different frameworks'
    },
    {
      applicantSkills: ['JS', 'HTML'],
      jobSkills: ['JavaScript', 'CSS'],
      expectedMatch: true,
      description: 'Should match JS with JavaScript (alias)'
    },
    {
      applicantSkills: ['Web Development'],
      jobSkills: ['Frontend', 'Backend'],
      expectedMatch: true,
      description: 'Should match web development with frontend/backend'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`\n📝 Test ${index + 1}: ${testCase.description}`);
    console.log(`   Applicant Skills: [${testCase.applicantSkills.join(', ')}]`);
    console.log(`   Job Skills: [${testCase.jobSkills.join(', ')}]`);
    
    // Simple matching logic
    const hasMatch = testCase.applicantSkills.some(appSkill => 
      testCase.jobSkills.some(jobSkill => 
        appSkill.toLowerCase() === jobSkill.toLowerCase() ||
        appSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(appSkill.toLowerCase())
      )
    );
    
    const result = hasMatch ? '✅ MATCH' : '❌ NO MATCH';
    const expected = testCase.expectedMatch ? '✅ EXPECTED' : '❌ EXPECTED';
    const status = hasMatch === testCase.expectedMatch ? '🎯 CORRECT' : '⚠️ INCORRECT';
    
    console.log(`   Result: ${result} | Expected: ${expected} | Status: ${status}`);
  });
  
  console.log('\n🔍 RECOMMENDATION: If any test shows INCORRECT, the skill matching needs adjustment.');
  console.log('💡 The system should be VERY inclusive - even partial matches should count!');
};

// Run the test
testSkillMatching();

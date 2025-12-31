const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: 'test1766670399@example.com',
        password: 'password123',
        role: 'applicant'
      })
    });
    const data = await response.json();
    console.log('Login Response Status:', response.status);
    console.log('Login Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error connecting to server:', error.message);
  }
};

testLogin();
